import { $config, Global } from 'src/extension';
import { doUpdateGutterDecorations, getGutterStyles } from 'src/gutter';
import { AggregatedByLineDiagnostics, Constants } from 'src/types';
import { replaceLinebreaks, truncateString } from 'src/utils';
import { DecorationInstanceRenderOptions, DecorationOptions, DecorationRenderOptions, Diagnostic, ExtensionContext, languages, Range, TextEditor, ThemableDecorationAttachmentRenderOptions, ThemeColor, Uri, window, workspace } from 'vscode';

/**
 * Update all decoration styles: editor, gutter, status bar
 */
export function setDecorationStyle(context: ExtensionContext) {
	Global.decorationTypeError?.dispose();
	Global.decorationTypeWarning?.dispose();
	Global.decorationTypeInfo?.dispose();
	Global.decorationTypeHint?.dispose();
	Global.decorationTypeGutterError?.dispose();
	Global.decorationTypeGutterWarning?.dispose();
	Global.decorationTypeGutterInfo?.dispose();

	let gutter;
	if ($config.gutterIconsEnabled) {
		gutter = getGutterStyles(context);

		if (Global.renderGutterIconsAsSeparateDecoration) {
			Global.decorationTypeGutterError = window.createTextEditorDecorationType({
				gutterIconPath: gutter.errorIconPath,
				gutterIconSize: $config.gutterIconSize,
				light: {
					gutterIconPath: gutter.errorIconPathLight,
					gutterIconSize: $config.gutterIconSize,
				},
			});
			Global.decorationTypeGutterWarning = window.createTextEditorDecorationType({
				gutterIconPath: gutter.warningIconPath,
				gutterIconSize: $config.gutterIconSize,
				light: {
					gutterIconPath: gutter.warningIconPathLight,
					gutterIconSize: $config.gutterIconSize,
				},
			});
			Global.decorationTypeGutterInfo = window.createTextEditorDecorationType({
				gutterIconPath: gutter.infoIconPath,
				gutterIconSize: $config.gutterIconSize,
				light: {
					gutterIconPath: gutter.infoIconPathLight,
					gutterIconSize: $config.gutterIconSize,
				},
			});
			// gutter will be rendered as a separate decoration, delete gutter from ordinary decorations
			gutter = undefined;
		}
	}

	let errorBackground: ThemeColor | undefined = new ThemeColor('errorLens.errorBackground');
	let errorBackgroundLight: ThemeColor | undefined = new ThemeColor('errorLens.errorBackgroundLight');
	const errorForeground = new ThemeColor('errorLens.errorForeground');
	const errorForegroundLight = new ThemeColor('errorLens.errorForegroundLight');
	let errorMessageBackground: ThemeColor | undefined = new ThemeColor('errorLens.errorMessageBackground');

	let warningBackground: ThemeColor | undefined = new ThemeColor('errorLens.warningBackground');
	let warningBackgroundLight: ThemeColor | undefined = new ThemeColor('errorLens.warningBackgroundLight');
	const warningForeground = new ThemeColor('errorLens.warningForeground');
	const warningForegroundLight = new ThemeColor('errorLens.warningForegroundLight');
	let warningMessageBackground: ThemeColor | undefined = new ThemeColor('errorLens.warningMessageBackground');

	let infoBackground: ThemeColor | undefined = new ThemeColor('errorLens.infoBackground');
	let infoBackgroundLight: ThemeColor | undefined = new ThemeColor('errorLens.infoBackgroundLight');
	const infoForeground = new ThemeColor('errorLens.infoForeground');
	const infoForegroundLight = new ThemeColor('errorLens.infoForegroundLight');
	let infoMessageBackground: ThemeColor | undefined = new ThemeColor('errorLens.infoMessageBackground');

	let hintBackground: ThemeColor | undefined = new ThemeColor('errorLens.hintBackground');
	let hintBackgroundLight: ThemeColor | undefined = new ThemeColor('errorLens.hintBackgroundLight');
	const hintForeground = new ThemeColor('errorLens.hintForeground');
	const hintForegroundLight = new ThemeColor('errorLens.hintForegroundLight');
	let hintMessageBackground: ThemeColor | undefined = new ThemeColor('errorLens.hintMessageBackground');

	const statusBarErrorForeground = new ThemeColor('errorLens.statusBarErrorForeground');
	const statusBarWarningForeground = new ThemeColor('errorLens.statusBarWarningForeground');
	const statusBarInfoForeground = new ThemeColor('errorLens.statusBarInfoForeground');
	const statusBarHintForeground = new ThemeColor('errorLens.statusBarHintForeground');

	if ($config.messageBackgroundMode === 'line') {
		errorMessageBackground = undefined;
		warningMessageBackground = undefined;
		infoMessageBackground = undefined;
		hintMessageBackground = undefined;
	} else if ($config.messageBackgroundMode === 'message') {
		errorBackground = undefined;
		errorBackgroundLight = undefined;
		warningBackground = undefined;
		warningBackgroundLight = undefined;
		infoBackground = undefined;
		infoBackgroundLight = undefined;
		hintBackground = undefined;
		hintBackgroundLight = undefined;
	} else if ($config.messageBackgroundMode === 'none') {
		errorBackground = undefined;
		errorBackgroundLight = undefined;
		warningBackground = undefined;
		warningBackgroundLight = undefined;
		infoBackground = undefined;
		infoBackgroundLight = undefined;
		hintBackground = undefined;
		hintBackgroundLight = undefined;

		errorMessageBackground = undefined;
		warningMessageBackground = undefined;
		infoMessageBackground = undefined;
		hintMessageBackground = undefined;
	}

	const onlyDigitsRegExp = /^\d+$/;
	const fontFamily = $config.fontFamily ? `font-family:${$config.fontFamily}` : '';
	const fontSize = $config.fontSize ? `font-size:${onlyDigitsRegExp.test($config.fontSize) ? `${$config.fontSize}px` : $config.fontSize}` : '';
	const marginLeft = onlyDigitsRegExp.test($config.margin) ? `${$config.margin}px` : $config.margin;
	const padding = $config.padding ? `padding:${onlyDigitsRegExp.test($config.padding) ? `${$config.padding}px` : $config.padding}` : '';
	const borderRadius = `border-radius: ${$config.borderRadius || '0'}`;
	const scrollbarHack = $config.scrollbarHackEnabled ? 'position:absolute;pointer-events:none;top:50%;transform:translateY(-50%);' : '';

	const afterProps: ThemableDecorationAttachmentRenderOptions = {
		fontStyle: $config.fontStyleItalic ? 'italic' : 'normal',
		fontWeight: $config.fontWeight,
		margin: `0 0 0 ${marginLeft}`,
		textDecoration: `none;${fontFamily};${fontSize};${padding};${borderRadius};${scrollbarHack}`,
	};

	const decorationRenderOptionsError: DecorationRenderOptions = {
		backgroundColor: errorBackground,
		gutterIconSize: $config.gutterIconSize,
		gutterIconPath: gutter?.errorIconPath,
		after: {
			...afterProps,
			color: errorForeground,
			backgroundColor: errorMessageBackground,
		},
		light: {
			backgroundColor: errorBackgroundLight,
			gutterIconSize: $config.gutterIconSize,
			gutterIconPath: gutter?.errorIconPathLight,
			after: {
				color: errorForegroundLight,
			},
		},
		isWholeLine: true,
	};
	const decorationRenderOptionsWarning: DecorationRenderOptions = {
		backgroundColor: warningBackground,
		gutterIconSize: $config.gutterIconSize,
		gutterIconPath: gutter?.warningIconPath,
		after: {
			...afterProps,
			color: warningForeground,
			backgroundColor: warningMessageBackground,
		},
		light: {
			backgroundColor: warningBackgroundLight,
			gutterIconSize: $config.gutterIconSize,
			gutterIconPath: gutter?.warningIconPathLight,
			after: {
				color: warningForegroundLight,
			},
		},
		isWholeLine: true,
	};
	const decorationRenderOptionsInfo: DecorationRenderOptions = {
		backgroundColor: infoBackground,
		gutterIconSize: $config.gutterIconSize,
		gutterIconPath: gutter?.infoIconPath,
		after: {
			...afterProps,
			color: infoForeground,
			backgroundColor: infoMessageBackground,
		},
		light: {
			backgroundColor: infoBackgroundLight,
			gutterIconSize: $config.gutterIconSize,
			gutterIconPath: gutter?.infoIconPathLight,
			after: {
				color: infoForegroundLight,
			},
		},
		isWholeLine: true,
	};
	const decorationRenderOptionsHint: DecorationRenderOptions = {
		backgroundColor: hintBackground,
		after: {
			...afterProps,
			color: hintForeground,
			backgroundColor: hintMessageBackground,
		},
		light: {
			backgroundColor: hintBackgroundLight,
			after: {
				color: hintForegroundLight,
			},
		},
		isWholeLine: true,
	};

	if (!$config.messageEnabled) {
		decorationRenderOptionsError.backgroundColor = undefined;
		decorationRenderOptionsError.after = undefined;
		decorationRenderOptionsError.light!.backgroundColor = undefined;
		decorationRenderOptionsError.light!.after = undefined;

		decorationRenderOptionsWarning.backgroundColor = undefined;
		decorationRenderOptionsWarning.after = undefined;
		decorationRenderOptionsWarning.light!.backgroundColor = undefined;
		decorationRenderOptionsWarning.light!.after = undefined;

		decorationRenderOptionsInfo.backgroundColor = undefined;
		decorationRenderOptionsInfo.after = undefined;
		decorationRenderOptionsInfo.light!.backgroundColor = undefined;
		decorationRenderOptionsInfo.light!.after = undefined;

		decorationRenderOptionsHint.backgroundColor = undefined;
		decorationRenderOptionsHint.after = undefined;
		decorationRenderOptionsHint.light!.backgroundColor = undefined;
		decorationRenderOptionsHint.light!.after = undefined;
	}

	Global.decorationTypeError = window.createTextEditorDecorationType(decorationRenderOptionsError);
	Global.decorationTypeWarning = window.createTextEditorDecorationType(decorationRenderOptionsWarning);
	Global.decorationTypeInfo = window.createTextEditorDecorationType(decorationRenderOptionsInfo);
	Global.decorationTypeHint = window.createTextEditorDecorationType(decorationRenderOptionsHint);

	Global.statusBarMessage.statusBarColors = [statusBarErrorForeground, statusBarWarningForeground, statusBarInfoForeground, statusBarHintForeground];
}
/**
 * Actually apply decorations for editor.
 * @param range Only allow decorating lines in this range.
 */
export function doUpdateDecorations(editor: TextEditor, aggregatedDiagnostics: AggregatedByLineDiagnostics, range?: Range) {
	const decorationOptionsError: DecorationOptions[] = [];
	const decorationOptionsWarning: DecorationOptions[] = [];
	const decorationOptionsInfo: DecorationOptions[] = [];
	const decorationOptionsHint: DecorationOptions[] = [];

	let allowedLineNumbersToRenderDiagnostics: number[] | undefined;
	if ($config.followCursor === 'closestProblem') {
		if (range === undefined) {
			range = editor.selection;
		}
		const line = range.start.line;

		const aggregatedDiagnosticsAsArray = Object.entries(aggregatedDiagnostics).sort((a, b) => Math.abs(line - Number(a[0])) - Math.abs(line - Number(b[0])));
		aggregatedDiagnosticsAsArray.length = $config.followCursorMore + 1;// Reduce array length to the number of allowed rendered lines (decorations)
		allowedLineNumbersToRenderDiagnostics = aggregatedDiagnosticsAsArray.map(d => d[1][0].range.start.line);
	}

	for (const key in aggregatedDiagnostics) {
		const aggregatedDiagnostic = aggregatedDiagnostics[key].sort((a, b) => a.severity - b.severity);
		const diagnostic = aggregatedDiagnostic[0];
		const severity = diagnostic.severity;

		if (isSeverityEnabled(severity)) {
			let message: string | undefined = diagnosticToInlineMessage($config.messageTemplate, diagnostic, aggregatedDiagnostic.length);

			if (!$config.messageEnabled || $config.messageMaxChars === 0) {
				message = undefined;
			} else {
				// If the message has thousands of characters - VSCode will render all of them offscreen and the editor will freeze.
				// If the message has linebreaks - it will cut off the message in that place.
				message = truncateString($config.removeLinebreaks ? replaceLinebreaks(message, $config.replaceLinebreaksSymbol) : message, $config.messageMaxChars);
			}

			const decInstanceRenderOptions: DecorationInstanceRenderOptions = {
				after: {
					contentText: message,
				},
			};

			let messageRange: Range | undefined;
			if ($config.followCursor === 'allLines') {
				// Default value (most used)
				messageRange = diagnostic.range;
			} else {
				// Others require cursor tracking
				if (range === undefined) {
					range = editor.selection;
				}
				const diagnosticRange = diagnostic.range;

				if ($config.followCursor === 'activeLine') {
					const lineStart = range.start.line - $config.followCursorMore;
					const lineEnd = range.end.line + $config.followCursorMore;

					if (diagnosticRange.start.line >= lineStart && diagnosticRange.start.line <= lineEnd ||
						diagnosticRange.end.line >= lineStart && diagnosticRange.end.line <= lineEnd) {
						messageRange = diagnosticRange;
					}
				} else if ($config.followCursor === 'allLinesExceptActive') {
					const lineStart = range.start.line;
					const lineEnd = range.end.line;

					if (diagnosticRange.start.line >= lineStart && diagnosticRange.start.line <= lineEnd ||
						diagnosticRange.end.line >= lineStart && diagnosticRange.end.line <= lineEnd) {
						messageRange = undefined;
					} else {
						messageRange = diagnosticRange;
					}
				} else if ($config.followCursor === 'closestProblem') {
					if (allowedLineNumbersToRenderDiagnostics!.includes(diagnosticRange.start.line) || allowedLineNumbersToRenderDiagnostics!.includes(diagnosticRange.end.line)) {
						messageRange = diagnosticRange;
					}
				}

				if (!messageRange) {
					continue;
				}
			}

			const diagnosticDecorationOptions: DecorationOptions = {
				range: new Range(messageRange.start.line, messageRange.start.character, messageRange.start.line, messageRange.start.character),
				renderOptions: decInstanceRenderOptions,
			};

			switch (severity) {
				case 0: decorationOptionsError.push(diagnosticDecorationOptions); break;
				case 1: decorationOptionsWarning.push(diagnosticDecorationOptions); break;
				case 2: decorationOptionsInfo.push(diagnosticDecorationOptions); break;
				case 3: decorationOptionsHint.push(diagnosticDecorationOptions); break;
			}
		}
	}

	editor.setDecorations(Global.decorationTypeError, decorationOptionsError);
	editor.setDecorations(Global.decorationTypeWarning, decorationOptionsWarning);
	editor.setDecorations(Global.decorationTypeInfo, decorationOptionsInfo);
	editor.setDecorations(Global.decorationTypeHint, decorationOptionsHint);

	if (Global.renderGutterIconsAsSeparateDecoration) {
		doUpdateGutterDecorations(editor, aggregatedDiagnostics);
	}
	Global.statusBarMessage.updateText(editor, aggregatedDiagnostics);
}

export function updateDecorationsForAllVisibleEditors() {
	for (const editor of window.visibleTextEditors) {
		const excludeWorkspaces = $config.excludeWorkspaces;
		const currentWorkspacePath = workspace.getWorkspaceFolder(editor.document.uri)?.uri.path;
		if (currentWorkspacePath && excludeWorkspaces.includes(currentWorkspacePath)) {
			continue;
		}

		updateDecorationsForUri(editor.document.uri, editor);
	}
}
/**
 * Update decorations for one editor.
 */
export function updateDecorationsForUri(uriToDecorate: Uri, editor?: TextEditor, groupedDiagnostics?: AggregatedByLineDiagnostics, range?: Range) {
	if (editor === undefined) {
		editor = window.activeTextEditor;
	}
	if (!editor) {
		return;
	}

	if (!editor.document.uri.fsPath) {
		return;
	}

	if (
		(!$config.enableOnDiffView && editor.viewColumn === undefined) &&
		editor.document.uri.scheme !== 'vscode-notebook-cell'
	) {
		doUpdateDecorations(editor, {});
		return;
	}

	if (!$config.enabledInMergeConflict) {
		const editorText = editor.document.getText();
		if (
			editorText.includes(Constants.MergeConflictSymbol1) ||
			editorText.includes(Constants.MergeConflictSymbol2) ||
			editorText.includes(Constants.MergeConflictSymbol3)
		) {
			doUpdateDecorations(editor, {});
			return;
		}
	}

	if (Global.excludePatterns) {
		for (const pattern of Global.excludePatterns) {
			if (languages.match(pattern, editor.document) !== 0) {
				return;
			}
		}
	}

	doUpdateDecorations(editor, groupedDiagnostics || groupDiagnosticsByLine(languages.getDiagnostics(uriToDecorate)), range);
}

/**
 * The aggregatedDiagnostics object will contain one or more objects, each object being keyed by `N`, where `N` is the line number where one or more diagnostics are being reported.
 *
 * Each object which is keyed by `N` will contain one or more `arrayDiagnostics[]` array of objects.
 * This facilitates gathering info about lines which contain more than one diagnostic.
 *
 * ```json
 * {
 *   67: [
 *     <Diagnostic #1>,
 *     <Diagnostic #2>
 *   ],
 *   93: [
 *     <Diagnostic #1>
 *   ]
 * }
 * ```
 */
export function groupDiagnosticsByLine(diagnostics: Diagnostic[]): AggregatedByLineDiagnostics {
	const aggregatedDiagnostics: AggregatedByLineDiagnostics = Object.create(null);
	for (const diagnostic of diagnostics) {
		if (shouldExcludeDiagnostic(diagnostic)) {
			continue;
		}

		const key = diagnostic.range.start.line;

		if (aggregatedDiagnostics[key]) {
			aggregatedDiagnostics[key].push(diagnostic);
		} else {
			aggregatedDiagnostics[key] = [diagnostic];
		}
	}
	return aggregatedDiagnostics;
}
/**
 * Check multiple exclude sources if the diagnostic should not be shown.
 */
export function shouldExcludeDiagnostic(diagnostic: Diagnostic): boolean {
	if (diagnostic.source) {
		for (const excludeSourceCode of Global.excludeSources) {
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

	for (const regex of Global.excludeRegexp) {
		if (regex.test(diagnostic.message)) {
			return true;
		}
	}

	return false;
}
/**
 * `true` when diagnostic enabled in config & in temp variable
 */
export function isSeverityEnabled(severity: number): boolean {
	if (
		severity === 0 && Global.configErrorEnabled ||
		severity === 1 && Global.configWarningEnabled ||
		severity === 2 && Global.configInfoEnabled ||
		severity === 3 && Global.configHintEnabled
	) {
		return true;
	}
	return false;
}
/**
 * Generate inline message from template.
 */
export function diagnosticToInlineMessage(template: string, diagnostic: Diagnostic, count: number): string {
	if (template === TemplateVars.message) {
		// When default template - no need to use RegExps or other stuff.
		return diagnostic.message;
	} else {
		// Message & severity is always present.
		let result = template
			.replace(TemplateVars.message, diagnostic.message)
			.replace(TemplateVars.severity, $config.severityText[diagnostic.severity] || '');
		/**
		 * Count, source & code can be absent.
		 * If present - replace them as simple string.
		 * If absent - replace by RegExp removing all adjacent non-whitespace symbols with them.
		 */
		if (template.includes(TemplateVars.count)) {
			if (count > 1) {
				result = result.replace(TemplateVars.count, String(count));
			} else {
				// no `$count` in the template - remove it
				result = result.replace(/(\s*?)?(\S*?)?(\$count)(\S*?)?(\s*?)?/, (match, g1: string | undefined, g2, g3, g4, g5: string | undefined) => (g1 || '') + (g5 || ''));
			}
		}
		if (template.includes(TemplateVars.source)) {
			if (diagnostic.source) {
				result = result.replace(TemplateVars.source, String(diagnostic.source));
			} else {
				result = result.replace(/(\s*?)?(\S*?)?(\$source)(\S*?)?(\s*?)?/, (match, g1: string | undefined, g2, g3, g4, g5: string | undefined) => (g1 || '') + (g5 || ''));
			}
		}

		if (template.includes(TemplateVars.code)) {
			const code = typeof diagnostic.code === 'object' ? String(diagnostic.code.value) : String(diagnostic.code);
			if (diagnostic.code) {
				result = result.replace(TemplateVars.code, code);
			} else {
				result = result.replace(/(\s*?)?(\S*?)?(\$code)(\S*?)?(\s*?)?/, (match, g1: string | undefined, g2, g3, g4, g5: string | undefined) => (g1 || '') + (g5 || ''));
			}
		}

		return result;
	}
}

/**
 * Variables to replace inside the `messageTemplate` & `statusBarMessageTemplate` settings.
 */
const enum TemplateVars {
	message = '$message',
	source = '$source',
	code = '$code',
	count = '$count',
	severity = '$severity',
}
