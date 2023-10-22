/* eslint-disable no-param-reassign */
import { getStyleForAlignment } from 'src/decorations/align';
import { $config, $state } from 'src/extension';
import { doUpdateGutterDecorations, getGutterStyles, type Gutter } from 'src/gutter';
import { createHoverForDiagnostic } from 'src/hover/hover';
import { Constants } from 'src/types';
import { extUtils, type GroupedByLineDiagnostics } from 'src/utils/extUtils';
import { createMultilineDecorations, showMultilineDecoration } from 'src/utils/showMultilineDecoration';
import { DecorationRangeBehavior, Range, ThemeColor, debug, languages, window, workspace, type DecorationInstanceRenderOptions, type DecorationOptions, type DecorationRenderOptions, type ExtensionContext, type Location, type TextEditor, type TextEditorDecorationType, type ThemableDecorationAttachmentRenderOptions, type Uri } from 'vscode';

/* eslint-disable @typescript-eslint/sort-type-constituents */
type DecorationKeys =
	'error' |
	'warning' |
	'info' |
	'hint' |

	'gutterError' |
	'gutterWarning' |
	'gutterInfo' |
	'gutterHint' |

	'errorRange' |
	'warningRange' |
	'infoRange' |
	'hintRange' |

	'multilineError' |
	'multilineWarning' |
	'multilineInfo' |
	'multilineHint' |

	'multilineErrorLineBackground' |
	'multilineHintLineBackground' |
	'multilineInfoLineBackground' |
	'multilineWarningLineBackground' |

	'transparent1x1Icon';
export const decorationTypes = {} as unknown as Record<DecorationKeys, TextEditorDecorationType>;
/* eslint-enable @typescript-eslint/sort-type-constituents */

let textDecorationStyleString = '';

/**
 * Update all decoration styles: editor, gutter, status bar
 */
export function setDecorationStyle(context: ExtensionContext): void {
	disposeAllDecorations();

	let gutter: Gutter | undefined;
	if ($config.gutterIconsEnabled) {
		gutter = getGutterStyles(context);

		if ($state.renderGutterIconsAsSeparateDecoration) {
			decorationTypes.gutterError = window.createTextEditorDecorationType({
				gutterIconPath: gutter.errorIconPath,
				gutterIconSize: $config.gutterIconSize,
				light: {
					gutterIconPath: gutter.errorIconPathLight,
					gutterIconSize: $config.gutterIconSize,
				},
			});
			decorationTypes.gutterWarning = window.createTextEditorDecorationType({
				gutterIconPath: gutter.warningIconPath,
				gutterIconSize: $config.gutterIconSize,
				light: {
					gutterIconPath: gutter.warningIconPathLight,
					gutterIconSize: $config.gutterIconSize,
				},
			});
			decorationTypes.gutterInfo = window.createTextEditorDecorationType({
				gutterIconPath: gutter.infoIconPath,
				gutterIconSize: $config.gutterIconSize,
				light: {
					gutterIconPath: gutter.infoIconPathLight,
					gutterIconSize: $config.gutterIconSize,
				},
			});
			decorationTypes.gutterHint = window.createTextEditorDecorationType({
				gutterIconPath: gutter.hintIconPath,
				gutterIconSize: $config.gutterIconSize,
				light: {
					gutterIconPath: gutter.hintIconPathLight,
					gutterIconSize: $config.gutterIconSize,
				},
			});
			// gutter will be rendered as a separate decoration, delete gutter from ordinary decorations
			gutter = undefined;
		}
	}

	if ($config.followCursor === 'closestProblemMultiline' ||
		$config.followCursor === 'closestProblemMultilineInViewport' ||
		$config.followCursor === 'closestProblemMultilineBySeverity') {
		createMultilineDecorations();
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

	const onlyDigitsRegExp = /^\d+$/u;
	const fontFamily = $config.fontFamily ? `font-family:${$config.fontFamily}` : '';
	const fontSize = $config.fontSize ? `font-size:${onlyDigitsRegExp.test($config.fontSize) ? `${$config.fontSize}px` : $config.fontSize}` : '';
	const marginLeft = onlyDigitsRegExp.test($config.margin) ? `${$config.margin}px` : $config.margin;
	const padding = $config.padding ? `padding:${onlyDigitsRegExp.test($config.padding) ? `${$config.padding}px` : $config.padding}` : '';
	const borderRadius = `border-radius: ${$config.borderRadius || '0'}`;
	const scrollbarHack = $config.scrollbarHackEnabled ? 'position:absolute;pointer-events:none;top:50%;transform:translateY(-50%);' : '';

	textDecorationStyleString = `none;${fontFamily};${fontSize};${borderRadius}`;

	const afterProps: ThemableDecorationAttachmentRenderOptions = {
		fontStyle: $config.fontStyleItalic ? 'italic' : 'normal',
		fontWeight: $config.fontWeight,
		margin: `0 0 0 ${marginLeft}`,
		textDecoration: `${textDecorationStyleString};${padding};${scrollbarHack}`,
	};

	const decorationRenderOptionsError: DecorationRenderOptions = {
		backgroundColor: errorBackground,
		gutterIconSize: $config.gutterIconSize,
		gutterIconPath: gutter?.errorIconPath,
		after: {
			...afterProps,
			color: errorForeground,
			backgroundColor: errorMessageBackground,
			...$config.decorations?.errorMessage,
		},
		light: {
			backgroundColor: errorBackgroundLight,
			gutterIconSize: $config.gutterIconSize,
			gutterIconPath: gutter?.errorIconPathLight,
			after: {
				color: errorForegroundLight,
				...$config.decorations?.errorMessage,
				...$config.decorations?.errorMessage?.light,
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
			...$config.decorations?.warningMessage,
		},
		light: {
			backgroundColor: warningBackgroundLight,
			gutterIconSize: $config.gutterIconSize,
			gutterIconPath: gutter?.warningIconPathLight,
			after: {
				color: warningForegroundLight,
				...$config.decorations?.warningMessage,
				...$config.decorations?.warningMessage?.light,
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
			...$config.decorations?.infoMessage,
		},
		light: {
			backgroundColor: infoBackgroundLight,
			gutterIconSize: $config.gutterIconSize,
			gutterIconPath: gutter?.infoIconPathLight,
			after: {
				color: infoForegroundLight,
				...$config.decorations?.infoMessage,
				...$config.decorations?.infoMessage?.light,
			},
		},
		isWholeLine: true,
	};
	const decorationRenderOptionsHint: DecorationRenderOptions = {
		backgroundColor: hintBackground,
		gutterIconSize: $config.gutterIconSize,
		gutterIconPath: gutter?.hintIconPath,
		after: {
			...afterProps,
			color: hintForeground,
			backgroundColor: hintMessageBackground,
			...$config.decorations?.hintMessage,
		},
		light: {
			backgroundColor: hintBackgroundLight,
			gutterIconSize: $config.gutterIconSize,
			gutterIconPath: gutter?.hintIconPathLight,
			after: {
				color: hintForegroundLight,
				...$config.decorations?.hintMessage,
				...$config.decorations?.hintMessage?.light,
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

	decorationTypes.error = window.createTextEditorDecorationType(decorationRenderOptionsError);
	decorationTypes.warning = window.createTextEditorDecorationType(decorationRenderOptionsWarning);
	decorationTypes.info = window.createTextEditorDecorationType(decorationRenderOptionsInfo);
	decorationTypes.hint = window.createTextEditorDecorationType(decorationRenderOptionsHint);

	// ──── Range ─────────────────────────────────────────────────
	decorationTypes.errorRange = window.createTextEditorDecorationType({
		backgroundColor: new ThemeColor('errorLens.errorRangeBackground'),
		rangeBehavior: DecorationRangeBehavior.ClosedClosed,
		...$config.decorations.errorRange,
	});
	decorationTypes.warningRange = window.createTextEditorDecorationType({
		backgroundColor: new ThemeColor('errorLens.warningRangeBackground'),
		rangeBehavior: DecorationRangeBehavior.ClosedClosed,
		...$config.decorations.warningRange,
	});
	decorationTypes.infoRange = window.createTextEditorDecorationType({
		backgroundColor: new ThemeColor('errorLens.infoRangeBackground'),
		rangeBehavior: DecorationRangeBehavior.ClosedClosed,
		...$config.decorations.infoRange,
	});
	decorationTypes.hintRange = window.createTextEditorDecorationType({
		backgroundColor: new ThemeColor('errorLens.hintRangeBackground'),
		rangeBehavior: DecorationRangeBehavior.ClosedClosed,
		...$config.decorations.hintRange,
	});

	const transparentGutterIcon: DecorationRenderOptions = {
		gutterIconPath: gutter?.transparent1x1Icon,
		light: {
			gutterIconPath: gutter?.transparent1x1Icon,
		},
	};
	decorationTypes.transparent1x1Icon = window.createTextEditorDecorationType(transparentGutterIcon);

	$state.statusBarMessage.statusBarColors = [statusBarErrorForeground, statusBarWarningForeground, statusBarInfoForeground, statusBarHintForeground];
}
/**
 * Actually apply decorations for editor.
 * @param range Only allow decorating lines in this range.
 */
export function doUpdateDecorations(editor: TextEditor, groupedDiagnostics: GroupedByLineDiagnostics, range?: Range): void {
	const decorationOptionsError: DecorationOptions[] = [];
	const decorationOptionsWarning: DecorationOptions[] = [];
	const decorationOptionsInfo: DecorationOptions[] = [];
	const decorationOptionsHint: DecorationOptions[] = [];

	const decorationOptionsErrorRange: DecorationOptions[] = [];
	const decorationOptionsWarningRange: DecorationOptions[] = [];
	const decorationOptionsInfoRange: DecorationOptions[] = [];
	const decorationOptionsHintRange: DecorationOptions[] = [];

	let allowedLineNumbersToRenderDiagnostics: number[] | undefined;
	if ($config.followCursor === 'closestProblem' || $config.followCursor === 'closestProblemMultiline') {
		if (range === undefined) {
			range = editor.selection;
		}
		const line = range.start.line;

		const groupedDiagnosticsAsArray = Object.entries(groupedDiagnostics).sort((a, b) => Math.abs(line - Number(a[0])) - Math.abs(line - Number(b[0])));
		groupedDiagnosticsAsArray.length = $config.followCursorMore + 1;// Reduce array length to the number of allowed rendered lines (decorations)
		allowedLineNumbersToRenderDiagnostics = groupedDiagnosticsAsArray.map(d => d[1][0].range.start.line);
	}

	if ($config.followCursor === 'closestProblemMultiline' ||
		$config.followCursor === 'closestProblemMultilineInViewport' ||
		$config.followCursor === 'closestProblemMultilineBySeverity') {
		showMultilineDecoration(editor);
	}

	for (const key in groupedDiagnostics) {
		const groupedDiagnostic = groupedDiagnostics[key].sort((a, b) => a.severity - b.severity);
		const diagnostic = groupedDiagnostic[0];
		const severity = diagnostic.severity;

		if (!extUtils.isSeverityEnabled(severity)) {
			continue;
		}

		let message: string | undefined;

		if ($config.messageEnabled) {
			message = extUtils.prepareMessage({
				diagnostic,
				template: $config.messageTemplate,
				lineProblemCount: groupedDiagnostic.length,
				removeLinebreaks: $config.removeLinebreaks,
				replaceLinebreaksSymbol: $config.replaceLinebreaksSymbol,
			});
		} else {
			message = undefined;
		}

		let alignMarginStyle = '';
		let alignRange: Range | undefined;
		if (extUtils.shouldAlign()) {
			const styleForAlignment = getStyleForAlignment({
				isMultilineDecoration: false,
				alignmentKind: $config.alignMessage.useFixedPosition ? 'fixed' : 'normal',
				textLine: editor.document.lineAt(Number(key)),
				indentSize: editor.options.tabSize as number,
				indentStyle: editor.options.insertSpaces as boolean ? 'spaces' : 'tab',
				minimumMargin: $config.alignMessage.minimumMargin,
				minVisualLineLength: $config.alignMessage.start,
				start: $config.alignMessage.start,
				end: $config.alignMessage.end,
				problemMessage: message ?? '',
			});
			alignMarginStyle = styleForAlignment.styleStr;
			alignRange = styleForAlignment.range;
		}

		const decInstanceRenderOptions: DecorationInstanceRenderOptions = {
			after: {
				contentText: message,
				// height: extUtils.shouldAlign() && $config.alignMessage.useFixedPosition ? '100%' : undefined,
				textDecoration: extUtils.shouldAlign() ? `${textDecorationStyleString};${alignMarginStyle}` : undefined,
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

				if (
					((diagnosticRange.start.line >= lineStart) && (diagnosticRange.start.line <= lineEnd)) ||
						((diagnosticRange.end.line >= lineStart) && (diagnosticRange.end.line <= lineEnd))
				) {
					messageRange = diagnosticRange;
				}
			} else if ($config.followCursor === 'allLinesExceptActive') {
				const lineStart = range.start.line;
				const lineEnd = range.end.line;

				if (
					((diagnosticRange.start.line >= lineStart) && (diagnosticRange.start.line <= lineEnd)) ||
						((diagnosticRange.end.line >= lineStart) && (diagnosticRange.end.line <= lineEnd))
				) {
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
			range: alignRange ?? new Range(messageRange.start.line, messageRange.start.character, messageRange.start.line, messageRange.start.character),
			hoverMessage: createHoverForDiagnostic({
				diagnostic,
				buttonsEnabled: $config.editorHoverPartsEnabled.buttonsEnabled,
				messageEnabled: $config.editorHoverPartsEnabled.messageEnabled,
				sourceCodeEnabled: $config.editorHoverPartsEnabled.sourceCodeEnabled,
				lintFilePaths: $config.lintFilePaths,
			}),
			renderOptions: decInstanceRenderOptions,
		};

		switch (severity) {
			case 0: {
				decorationOptionsError.push(diagnosticDecorationOptions);
				if ($config.problemRangeDecorationEnabled) {
					decorationOptionsErrorRange.push({
						range: messageRange,
					});
				}
				break;
			}
			case 1: {
				decorationOptionsWarning.push(diagnosticDecorationOptions);
				if ($config.problemRangeDecorationEnabled) {
					decorationOptionsWarningRange.push({
						range: messageRange,
					});
				}
				break;
			}
			case 2: {
				decorationOptionsInfo.push(diagnosticDecorationOptions);
				if ($config.problemRangeDecorationEnabled) {
					decorationOptionsInfoRange.push({
						range: messageRange,
					});
				}
				break;
			}
			case 3: {
				decorationOptionsHint.push(diagnosticDecorationOptions);
				if ($config.problemRangeDecorationEnabled) {
					decorationOptionsHintRange.push({
						range: messageRange,
					});
				}
				break;
			}
			default: {}
		}
	}

	if ($config.gutterIconsEnabled) {
		updateWorkaroundGutterIcon(editor);
	}

	editor.setDecorations(decorationTypes.error, decorationOptionsError);
	editor.setDecorations(decorationTypes.warning, decorationOptionsWarning);
	editor.setDecorations(decorationTypes.info, decorationOptionsInfo);
	editor.setDecorations(decorationTypes.hint, decorationOptionsHint);

	if ($config.problemRangeDecorationEnabled) {
		editor.setDecorations(decorationTypes.errorRange, decorationOptionsErrorRange);
		editor.setDecorations(decorationTypes.warningRange, decorationOptionsWarningRange);
		editor.setDecorations(decorationTypes.infoRange, decorationOptionsInfoRange);
		editor.setDecorations(decorationTypes.hintRange, decorationOptionsHintRange);
	}

	if ($state.renderGutterIconsAsSeparateDecoration) {
		doUpdateGutterDecorations(editor, groupedDiagnostics);
	}

	$state.statusBarMessage.updateText(editor, groupedDiagnostics);
}

export function updateDecorationsForAllVisibleEditors(): void {
	for (const editor of window.visibleTextEditors) {
		updateDecorationsForUri({
			uri: editor.document.uri,
			editor,
		});
	}
}
/**
 * Update decorations for one editor.
 */
export function updateDecorationsForUri({
	uri,
	editor,
	groupedDiagnostics,
	range,
}: {
	uri: Uri;
	editor?: TextEditor;
	groupedDiagnostics?: GroupedByLineDiagnostics;
	range?: Range;
}): void {
	if (editor === undefined) {
		editor = window.activeTextEditor;
	}
	if (!editor) {
		return;
	}

	if (!editor.document.uri.fsPath) {
		return;
	}

	if ($config.ignoreUntitled && editor.document.uri.scheme === 'untitled') {
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

	if ($state.excludePatterns) {
		for (const pattern of $state.excludePatterns) {
			if (languages.match(pattern, editor.document) !== 0) {
				return;
			}
		}
	}

	const currentWorkspacePath = workspace.getWorkspaceFolder(editor.document.uri)?.uri.fsPath;
	if (
		currentWorkspacePath &&
		$config.excludeWorkspaces.includes(currentWorkspacePath)
	) {
		return;
	}

	doUpdateDecorations(editor, groupedDiagnostics ?? extUtils.groupDiagnosticsByLine(languages.getDiagnostics(uri)), range);
}
/**
 * Issue https://github.com/usernamehw/vscode-error-lens/issues/177
 */
export function updateWorkaroundGutterIcon(editor: TextEditor): void {
	const ranges: Range[] = [];
	for (const breakpoint of debug.breakpoints) {
		// @ts-expect-error location is probably optional, but can be there
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const location: Location = breakpoint?.location;
		if (location && location.uri.toString(true) === editor?.document.uri.toString(true)) {
			ranges.push(location.range);
		}
	}
	editor.setDecorations(decorationTypes.transparent1x1Icon, ranges);
}

export function disposeAllDecorations(): void {
	for (const decorationType of Object.values(decorationTypes)) {
		decorationType?.dispose();
	}
}

