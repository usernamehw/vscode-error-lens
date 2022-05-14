import { $config, Global } from 'src/extension';
import { doUpdateGutterDecorations, getGutterStyles } from 'src/gutter';
import { AggregatedByLineDiagnostics } from 'src/types';
import { replaceLinebreaks, truncateString } from 'src/utils';
import { DecorationInstanceRenderOptions, DecorationOptions, DecorationRenderOptions, Diagnostic, languages, Range, TextEditor, ThemableDecorationAttachmentRenderOptions, ThemeColor, Uri, window } from 'vscode';

/**
 * Update all decoration styles: editor, gutter, status bar
 */
export function setDecorationStyle() {
	let gutter;
	if ($config.gutterIconsEnabled) {
		gutter = getGutterStyles(Global.extensionContext);

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

	Global.decorationRenderOptionsError = {
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
	Global.decorationRenderOptionsWarning = {
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
	Global.decorationRenderOptionsInfo = {
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
	Global.decorationRenderOptionsHint = {
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
		Global.decorationRenderOptionsError.backgroundColor = undefined;
		Global.decorationRenderOptionsError.after = undefined;
		Global.decorationRenderOptionsError.light!.backgroundColor = undefined;
		Global.decorationRenderOptionsError.light!.after = undefined;

		Global.decorationRenderOptionsWarning.backgroundColor = undefined;
		Global.decorationRenderOptionsWarning.after = undefined;
		Global.decorationRenderOptionsWarning.light!.backgroundColor = undefined;
		Global.decorationRenderOptionsWarning.light!.after = undefined;

		Global.decorationRenderOptionsInfo.backgroundColor = undefined;
		Global.decorationRenderOptionsInfo.after = undefined;
		Global.decorationRenderOptionsInfo.light!.backgroundColor = undefined;
		Global.decorationRenderOptionsInfo.light!.after = undefined;

		Global.decorationRenderOptionsHint.backgroundColor = undefined;
		Global.decorationRenderOptionsHint.after = undefined;
		Global.decorationRenderOptionsHint.light!.backgroundColor = undefined;
		Global.decorationRenderOptionsHint.light!.after = undefined;
	}

	Global.decorationTypeError = window.createTextEditorDecorationType(Global.decorationRenderOptionsError);
	Global.decorationTypeWarning = window.createTextEditorDecorationType(Global.decorationRenderOptionsWarning);
	Global.decorationTypeInfo = window.createTextEditorDecorationType(Global.decorationRenderOptionsInfo);
	Global.decorationTypeHint = window.createTextEditorDecorationType(Global.decorationRenderOptionsHint);

	Global.statusBarMessage.statusBarColors = [statusBarErrorForeground, statusBarWarningForeground, statusBarInfoForeground, statusBarHintForeground];
}
/**
 * Actually apply decorations for editor.
 * @param range Only allow decorating lines in this range.
 */
export function doUpdateDecorations(editor: TextEditor, aggregatedDiagnostics: AggregatedByLineDiagnostics) {
	const decorationOptionsError: DecorationOptions[] = [];
	const decorationOptionsWarning: DecorationOptions[] = [];
	const decorationOptionsInfo: DecorationOptions[] = [];
	const decorationOptionsHint: DecorationOptions[] = [];

	const range = editor.selection;

	let allowedLineNumbersToRenderDiagnostics: number[] | undefined;
	if ($config.followCursor === 'closestProblem') {
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
			/**
			 * Usually, it's enough to use `decoration type`,
			 * but decorations from different extensions can conflict.
			 * This code puts global `decoration type` options into `decoration instance` options,
			 * which is not great for perf, but probably the only workaround.
			 *
			 * https://github.com/usernamehw/vscode-error-lens/issues/25
			 */
			let decorationRenderOptions: DecorationRenderOptions = {};
			switch (severity) {
				case 0: decorationRenderOptions = Global.decorationRenderOptionsError; break;
				case 1: decorationRenderOptions = Global.decorationRenderOptionsWarning; break;
				case 2: decorationRenderOptions = Global.decorationRenderOptionsInfo; break;
				case 3: decorationRenderOptions = Global.decorationRenderOptionsHint; break;
			}

			let messageRange: Range | undefined;
			if ($config.followCursor === 'allLines') {
				// Default value (most used)
				messageRange = diagnostic.range;
			} else {
				// Others require cursor tracking
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

			const message = diagnosticToInlineMessage($config.messageTemplate, diagnostic, aggregatedDiagnostic.length);

			const decInstanceRenderOptions: DecorationInstanceRenderOptions = {
				...decorationRenderOptions,
				after: {
					...decorationRenderOptions.after || {},
					// If the message has thousands of characters - VSCode will render all of them offscreen and the editor will freeze.
					contentText: $config.messageEnabled ?
						truncateString($config.removeLinebreaks ? replaceLinebreaks(message) : message) : '',
				},
			};

			const diagnosticDecorationOptions: DecorationOptions = {
				range: messageRange,
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
	Global.cacheAndCustomDelay.updateDecorationsAllVisibleEditors();
}
/**
 * Update decorations for one editor.
 */
export function updateDecorationsForUri(editor?: TextEditor) {
	if (editor === undefined) {
		editor = window.activeTextEditor;
	}
	if (!editor) {
		return;
	}

	Global.cacheAndCustomDelay.updateDecorations(editor);
}

/**
 * Check multiple exclude sources if the diagnostic should not be shown.
 */
export function shouldExcludeDiagnostic(diagnostic: Diagnostic) {
	for (const regex of Global.excludeRegexp) {
		if (regex.test(diagnostic.message)) {
			return true;
		}
	}
	if (diagnostic.source) {
		for (const source of Global.excludeSources) {
			if (source === diagnostic.source) {
				return true;
			}
		}
	}
	return false;
}
/**
 * `true` when diagnostic enabled in config & in temp variable
 */
export function isSeverityEnabled(severity: number) {
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
export function diagnosticToInlineMessage(template: string, diagnostic: Diagnostic, count: number) {
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

const enum TemplateVars {
	message = '$message',
	source = '$source',
	code = '$code',
	count = '$count',
	severity = '$severity',
}
