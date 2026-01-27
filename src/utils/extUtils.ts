import { $config, $state } from 'src/extension';
import { transmuteSeverity } from 'src/transmute';
import { Constants, type DiagnosticTarget } from 'src/types';
import { utils } from 'src/utils/utils';
import { languages, window, workspace, type Diagnostic, type TextEditor, type TextLine, type Uri } from 'vscode';

export type GroupedByLineDiagnostics = Record<string, Diagnostic[]>;

interface PrepareMessageArg {
	template: string;
	diagnostic: Diagnostic;
	lineProblemCount: number;
	removeLinebreaks: boolean;
	replaceLinebreaksSymbol: string;
}

export const extUtils = {
	/**
	 * Apply extension settings (`errorLens.messageTemplate`, `errorLens.messageMaxChars`, `errorLens.removeLinebreaks`) to diagnostic message.
	 *
	 * If the message has thousands of characters - VSCode will render all of them offscreen and the editor will freeze.
	 * If the message has linebreaks - it will cut off the message in that place.
	 */
	prepareMessage({ template, diagnostic, lineProblemCount, removeLinebreaks, replaceLinebreaksSymbol }: PrepareMessageArg): string {
		if (!template) {
			template = '$message';
		}
		const templated = extUtils.diagnosticToInlineMessage(template, diagnostic, lineProblemCount);
		return utils.truncateString(removeLinebreaks ? utils.replaceLinebreaks(templated, replaceLinebreaksSymbol) : templated, $config.messageMaxChars);
	},
	/**
	 * Convert VSCode returned [Uri, Diagnostic[]][] into more readable object { uri: Uri; diagnostics: Diagnostic[] }[]
	 * to not use it in code like diagnostic[0] diagnostic[1] everywhere...
	 */
	_VscodeDiagnosticsArrayToObject(vscodeDiagnostics: [Uri, Diagnostic[]][]): { uri: Uri; diagnostics: Diagnostic[] }[] {
		return vscodeDiagnostics.map(uriDiagnostics => ({
			uri: uriDiagnostics[0],
			diagnostics: uriDiagnostics[1],
		}));
	},
	/**
	 * Get all diagnostics from (all/visibleEditors/activeEditor).
	 */
	getDiagnostics(arg?: { target: DiagnosticTarget }): { uri: Uri; diagnostics: Diagnostic[] }[] {
		const allDiagnostics = languages.getDiagnostics();
		let targetDiagnostics: { uri: Uri; diagnostics: Diagnostic[] }[] = [];

		if (arg === undefined || arg.target === 'all') {
			targetDiagnostics = this._VscodeDiagnosticsArrayToObject(allDiagnostics);
		} else if (arg.target === 'activeEditor') {
			targetDiagnostics = this._VscodeDiagnosticsArrayToObject(allDiagnostics).filter(diag => diag.uri.toString(true) === window.activeTextEditor?.document.uri.toString(true));
		} else if (arg.target === 'visibleEditors') {
			const visibleUriWithDiagnostics = [];
			for (const diag of this._VscodeDiagnosticsArrayToObject(allDiagnostics)) {
				for (const visibleEditor of window.visibleTextEditors) {
					if (visibleEditor.document.uri.toString(true) === diag.uri.toString(true)) {
						visibleUriWithDiagnostics.push(diag);
					}
				}
			}
			targetDiagnostics = visibleUriWithDiagnostics;
		}

		return targetDiagnostics;
	},
	/**
	 * Usually documentation website Uri.
	 */
	getDiagnosticTarget(diagnostic: Diagnostic): Uri | false | undefined {
		return typeof diagnostic.code !== 'number' && typeof diagnostic.code !== 'string' && diagnostic.code?.target;
	},
	getDiagnosticCode(diagnostic: Diagnostic): string | undefined {
		const code = typeof diagnostic.code === 'string' || typeof diagnostic.code === 'number' ? diagnostic.code :	diagnostic.code?.value;
		if (code === undefined) {
			return undefined;
		}
		return String(code);
	},
	/**
	 * Take strings like:
	 * - `eslint`
	 * - `eslint(padded-blocks)`
	 * and return { source: 'eslint', code: 'padded-blocks' }
	 */
	parseSourceCodeFromString(str: string): { source?: string; code?: string } {
		const sourceCodeMatch = /(?<source>[^()]+)(?:\((?<code>.+)\))?/u.exec(str);
		const source = sourceCodeMatch?.groups?.source;
		const code = sourceCodeMatch?.groups?.code;
		return {
			source,
			code,
		};
	},
	diagnosticToSourceCodeString(source: string, code?: string): string {
		return `${source}${code ? `(${code})` : ''}`;
	},
	/**
	 * Return diagnostics grouped by line: `Record<string, Diagnostic[]>`
	 *
	 * Also, excludes diagnostics according to `errorLens.excludeSources` & `errorLens.exclude` settings.
	 *
	 * Also, apply `errorLens.transmute` setting.
	 *
	 * Also, sorts the problems in every line by severity err>warn>info>hint.
	 */
	groupDiagnosticsByLine(diagnostics: Diagnostic[]): GroupedByLineDiagnostics {
		let groupedDiagnostics: GroupedByLineDiagnostics = {};

		for (const diagnostic of diagnostics) {
			if (extUtils.shouldExcludeDiagnostic(diagnostic)) {
				continue;
			}

			const key = diagnostic.range.start.line;

			if (groupedDiagnostics[key]) {
				groupedDiagnostics[key].push(diagnostic);
			} else {
				groupedDiagnostics[key] = [diagnostic];
			}
		}

		// Apply setting `transmute` (needs to be done before sorting)
		groupedDiagnostics = transmuteSeverity(groupedDiagnostics);

		// Apply sorting err>warn>info>hint
		for (const key in groupedDiagnostics) {
			groupedDiagnostics[key] = groupedDiagnostics[key].sort((diag1, diag2) => diag1.severity - diag2.severity);
		}

		return groupedDiagnostics;
	},
	/**
	 * Check multiple exclude sources if the diagnostic should not be shown.
	 */
	shouldExcludeDiagnostic(diagnostic: Diagnostic): boolean {
		if (!extUtils.isSeverityEnabled(diagnostic.severity)) {
			return true;
		}

		if (diagnostic.source) {
			for (const excludeSourceCode of $state.excludeSources) {
				if (excludeSourceCode.source === diagnostic.source) {
					let diagnosticCode = '';
					if (typeof diagnostic.code === 'number') {
						diagnosticCode = String(diagnostic.code);
					} else if (typeof diagnostic.code === 'string') {
						diagnosticCode = diagnostic.code;
					} else if (diagnostic.code?.value) {
						diagnosticCode = String(diagnostic.code.value);
					}
					if (!excludeSourceCode.code) {
						// only source exclusion
						return true;
					}
					if (excludeSourceCode.code && diagnosticCode && excludeSourceCode.code === diagnosticCode) {
						// source and code matches
						return true;
					}
				}
			}
		}

		// ──── New exclude by message ────────────────────────────────
		const diagnosticMessageLowercased = diagnostic.message.toLocaleLowerCase();
		for (const string of $state.excludeByMessage.strings) {
			if (diagnosticMessageLowercased.includes(string)) {
				return true;
			}
		}
		for (const regexp of $state.excludeByMessage.regexps) {
			if (regexp.test(diagnostic.message)) {
				return true;
			}
		}
		// ────────────────────────────────────────────────────────────

		return false;
	},
	shouldExcludeEditor(editor: TextEditor): 'exclude' | 'excludeAndClearDecorations' | 'doNotExclude' {
		if ($config.ignoreUntitled && editor.document.uri.scheme === 'untitled') {
			return 'excludeAndClearDecorations';
		}

		if ($config.ignoreDirty && !$state.vscodeAutosaveEnabled && editor.document.isDirty) {
			return 'excludeAndClearDecorations';
		}

		if (
			(!$config.enableOnDiffView && editor.viewColumn === undefined) &&
			editor.document.uri.scheme !== 'vscode-notebook-cell'
		) {
			return 'excludeAndClearDecorations';
		}

		if (!$config.enabledInMergeConflict) {
			const editorText = editor.document.getText();
			if (
				editorText.includes(Constants.MergeConflictSymbol1) ||
			editorText.includes(Constants.MergeConflictSymbol2) ||
			editorText.includes(Constants.MergeConflictSymbol3)
			) {
				return 'excludeAndClearDecorations';
			}
		}

		if ($state.excludePatterns) {
			for (const pattern of $state.excludePatterns) {
				if (languages.match(pattern, editor.document) !== 0) {
					return 'exclude';
				}
			}
		}

		const currentWorkspacePath = workspace.getWorkspaceFolder(editor.document.uri)?.uri.fsPath;
		if (
			currentWorkspacePath &&
			$config.excludeWorkspaces.includes(currentWorkspacePath)
		) {
			return 'exclude';
		}

		return 'doNotExclude';
	},
	/**
	 * `true` when diagnostic enabled in config & in temp variable
	 */
	isSeverityEnabled(severity: number): boolean {
		return (
			(severity === 0 && $state.configErrorEnabled) ||
			(severity === 1 && $state.configWarningEnabled) ||
			(severity === 2 && $state.configInfoEnabled) ||
			(severity === 3 && $state.configHintEnabled)
		);
	},
	/**
	 * Change string severity to VSCode's severity.
	 */
	severityStringToNumber(severity: 'error' | 'info' | 'warning' | 'hint'): 0 | 1 | 2 | 3 {
		if (severity === 'error') {
			return 0;
		} else if (severity === 'warning') {
			return 1;
		} else if (severity === 'info') {
			return 2;
		} else {
			return 3;
		}
	},
	/**
	 * Generate inline message from template.
	 */
	diagnosticToInlineMessage(template: string, diagnostic: Diagnostic, count: number): string {
		/** Variables to replace inside the `messageTemplate` & `statusBarMessageTemplate` settings. */
		const enum TemplateVars {
			Message = '$message',
			Source = '$source',
			Code = '$code',
			Count = '$count',
			Severity = '$severity',
			LineStart = '$lineStart',
			LineEnd = '$lineEnd',
		}

		let message = diagnostic?.message;
		if (!message) {
			return '';
		}

		if ($state.replaceRegexp) {
			// Apply transformations sequentially, checking at each stage if the updated
			// message matches the next checker. Usuaully there would only be one match,
			// but this ensures individual matchers can transform parts in sequence.
			for (const transformation of $state.replaceRegexp) {
				const matchResult = transformation.matcher.exec(message);
				if (matchResult) {
					message = transformation.message;
					// Replace groups like $0 and $1 with groups from the match
					for (let groupIndex = 0; groupIndex < matchResult.length; groupIndex++) {
						message = message.replace(new RegExp(`\\$${groupIndex}`, 'gu'), matchResult[Number(groupIndex)]);
					}
					break;
				}
			}
		}

		if (template === TemplateVars.Message) {
			// When default template - no need to use RegExps or other stuff.
			return message;
		} else {
			// Message & severity is always present.
			let result = template
				.replace(TemplateVars.Message, message)
				.replace(TemplateVars.Severity, $config.severityText[diagnostic.severity] || '')
				.replace(TemplateVars.LineStart, String(diagnostic.range.start.line + 1))
				.replace(TemplateVars.LineEnd, String(diagnostic.range.end.line + 1));
			/**
			 * Count, source & code can be absent.
			 * If present - replace them as simple string.
			 * If absent - replace by RegExp removing all adjacent non-whitespace symbols with them.
			 */

			/* eslint-disable prefer-named-capture-group, max-params */
			if (template.includes(TemplateVars.Count)) {
				if (count > 1) {
					result = result.replace(TemplateVars.Count, String(count));
				} else {
					// no `$count` in the template - remove it
					result = result.replace(/(\s*?)?(\S*?)?(\$count)(\S*?)?(\s*?)?/u, (match, g1: string | undefined, g2, g3, g4, g5: string | undefined) => (g1 ?? '') + (g5 ?? ''));
				}
			}
			if (template.includes(TemplateVars.Source)) {
				if (diagnostic.source) {
					result = result.replace(TemplateVars.Source, String(diagnostic.source));
				} else {
					result = result.replace(/(\s*?)?(\S*?)?(\$source)(\S*?)?(\s*?)?/u, (match, g1: string | undefined, g2, g3, g4, g5: string | undefined) => (g1 ?? '') + (g5 ?? ''));
				}
			}

			if (template.includes(TemplateVars.Code)) {
				const code = typeof diagnostic.code === 'object' ? String(diagnostic.code.value) : String(diagnostic.code);
				if (diagnostic.code) {
					result = result.replace(TemplateVars.Code, code);
				} else {
					result = result.replace(/(\s*?)?(\S*?)?(\$code)(\S*?)?(\s*?)?/u, (match, g1: string | undefined, g2, g3, g4, g5: string | undefined) => (g1 ?? '') + (g5 ?? ''));
				}
			}
			/* eslint-enable prefer-named-capture-group, max-params */

			return result;
		}
	},
	getDiagnosticAtLine(uri: Uri, lineNumber: number): Diagnostic | undefined {
		const diagnostics = languages.getDiagnostics(uri);
		const groupedDiagnostics = extUtils.groupDiagnosticsByLine(diagnostics);
		const diagnosticsAtLineNumber = groupedDiagnostics[lineNumber];
		if (!diagnosticsAtLineNumber) {
			return;
		}
		return diagnosticsAtLineNumber[0];
	},
	/**
	 * Get closest to the active cursor diagnostic.
	 *
	 * TODO: duplicates code in `statusBarMessage.ts`
	 */
	getClosestDiagnostic(editor: TextEditor): Diagnostic | undefined {
		const groupedDiagnostics = extUtils.groupDiagnosticsByLine(languages.getDiagnostics(editor.document.uri));
		const lineNumberKeys = Object.keys(groupedDiagnostics);
		const activeLineNumber = editor.selection.active.line;

		// Sort by how close it is to the cursor
		const sortedLineNumbers = lineNumberKeys.map(Number).sort((ln1, ln2) => Math.abs(activeLineNumber - ln1) - Math.abs(activeLineNumber - ln2));

		for (const lineNumber of sortedLineNumbers) {
			const diagnosticsAtLine = groupedDiagnostics[lineNumber];
			for (const diagnostic of diagnosticsAtLine) {
				if (extUtils.isSeverityEnabled(diagnostic.severity)) {
					return diagnostic;
				}
			}
		}
	},
	/**
	 * Get closest by severity diagnostic (error=>warning=>info=>hint)
	 *
	 * TODO: duplicates code in `statusBarMessage.ts`
	 */
	getClosestBySeverityDiagnostic(editor: TextEditor): Diagnostic | undefined {
		const groupedDiagnostics = extUtils.groupDiagnosticsByLine(languages.getDiagnostics(editor.document.uri));
		const lineNumberKeys = Object.keys(groupedDiagnostics);
		const activeLineNumber = editor.selection.active.line;

		const allDiagnosticsSorted = lineNumberKeys.map(key => groupedDiagnostics[key]).flat().sort((d1, d2) => {
			const severityScore = (d1.severity * 1e4) - (d2.severity * 1e4);
			return severityScore + (Math.abs(activeLineNumber - d1.range.start.line) - Math.abs(activeLineNumber - d2.range.start.line));
		});

		for (const diagnostic of allDiagnosticsSorted) {
			if (extUtils.isSeverityEnabled(diagnostic.severity)) {
				return diagnostic;
			}
		}
	},
	getClosestDiagnosticInViewport(editor: TextEditor): Diagnostic | undefined {
		const groupedDiagnostics = extUtils.groupDiagnosticsByLine(languages.getDiagnostics(editor.document.uri));
		const activeLineNumber = editor.selection.active.line;

		for (const key in groupedDiagnostics) {
			const diagnostic = groupedDiagnostics[key][0];
			if (!extUtils.isDiagnosticInViewport(editor, diagnostic)) {
				delete groupedDiagnostics[key];
			}
		}

		const diagnosticsInViewport = groupedDiagnostics;

		const sortedLineNumbers = Object.keys(diagnosticsInViewport).sort((ln1, ln2) => Math.abs(activeLineNumber - Number(ln1)) - Math.abs(activeLineNumber - Number(ln2)));

		for (const lineNumber of sortedLineNumbers) {
			const diagnosticsAtLine = groupedDiagnostics[lineNumber];
			for (const diagnostic of diagnosticsAtLine) {
				if (extUtils.isSeverityEnabled(diagnostic.severity)) {
					return diagnostic;
				}
			}
		}
	},
	/**
	 * Is error visible to the user or scrolled out of the editor view?
	 */
	isDiagnosticInViewport(editor: TextEditor, diagnostic: Diagnostic): boolean {
		for (const visibleRange of editor.visibleRanges) {
			if (visibleRange.intersection(diagnostic.range)) {
				return true;
			}
		}
		return false;
	},
	/**
	 * Tabs take 1 character in line but visually will be multiple characters (according to `editor.tabSize`).
	 *
	 * @returns How many characters the line visually looks (different from range.end when using tabs to indent).
	 */
	getVisualLineLength(textLine: TextLine, indentSize: number, indentStyle: 'spaces' | 'tab'): number {
		if (indentStyle === 'spaces') {
			return textLine.range.end.character;
		} else {
			/** `firstNonWhitespaceCharacterIndex` can include whitespaces, only tabs are needed to correctly get visual indent here */
			const onlyTabsIndent = textLine.text.slice(0, textLine.firstNonWhitespaceCharacterIndex).replace(/[^\t]/gu, '');
			const thisLineIndentSize = onlyTabsIndent.length;
			const textWithoutIndent = textLine.text.slice(thisLineIndentSize);
			return (onlyTabsIndent.length * indentSize) + textWithoutIndent.length;
		}
	},
	/**
	 * Whether or not to align editor message text based on values of `errorLens.alignMessage` setting.
	 */
	shouldAlign(): boolean {
		return Boolean($config.alignMessage.start || $config.alignMessage.end);
	},
	shouldShowInlineMessage(): boolean {
		const extensionEnabled = $config.messageEnabled;
		const respectUpstreamEnabled = $config.respectUpstreamEnabled;

		if (!respectUpstreamEnabled.enabled || !respectUpstreamEnabled.inlineMessage) {
			return extensionEnabled;
		}

		return extensionEnabled && $state.vscodeGlobalProblemsEnabled;
	},
	shouldShowGutterIcons(): boolean {
		const extensionEnabled = $config.gutterIconsEnabled;
		const respectUpstreamEnabled = $config.respectUpstreamEnabled;

		if (!respectUpstreamEnabled.enabled || !respectUpstreamEnabled.gutter) {
			return extensionEnabled;
		}

		return extensionEnabled && $state.vscodeGlobalProblemsEnabled;
	},
	shouldShowStatusBarIcons(): boolean {
		const extensionEnabled = $config.statusBarIconsEnabled;
		const respectUpstreamEnabled = $config.respectUpstreamEnabled;

		if (!respectUpstreamEnabled.enabled || !respectUpstreamEnabled.statusBar) {
			return extensionEnabled;
		}

		return extensionEnabled && $state.vscodeGlobalProblemsEnabled;
	},
	shouldShowStatusBarMessage(): boolean {
		const extensionEnabled = $config.statusBarMessageEnabled;
		const respectUpstreamEnabled = $config.respectUpstreamEnabled;

		if (!respectUpstreamEnabled.enabled || !respectUpstreamEnabled.statusBar) {
			return extensionEnabled;
		}

		return extensionEnabled && $state.vscodeGlobalProblemsEnabled;
	},
	/**
	 * If units are not specified and the entire string is composed of digits - assume it's `px`.
	 */
	addPxUnitsIfNeeded(css: string): string {
		const onlyDigitsRegExp = /^\d+$/u;
		return onlyDigitsRegExp.test(css) ? `${css}px` : css;
	},
};
