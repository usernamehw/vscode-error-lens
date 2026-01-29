/* eslint-disable no-param-reassign */
import { getStyleForAlignment } from 'src/decorations/align';
import { $config, $state } from 'src/extension';
import { doUpdateGutterDecorations, getGutterStyles, updateWorkaroundGutterIcon, type Gutter } from 'src/gutter';
import { createHoverForDiagnostic } from 'src/hover/hover';
import { disposeTransmutedDecorations, doUpdateTransmutedDecorations, setTransmutedDecorationStyle, transmute } from 'src/transmute';
import { extUtils, type GroupedByLineDiagnostics } from 'src/utils/extUtils';
import { utils } from 'src/utils/utils';
import { vscodeUtils } from 'src/utils/vscodeUtils';
import { DecorationRangeBehavior, DiagnosticSeverity, Range, ThemeColor, languages, window, workspace, type DecorationInstanceRenderOptions, type DecorationOptions, type DecorationRenderOptions, type ExtensionContext, type TextEditor, type TextEditorDecorationType, type ThemableDecorationAttachmentRenderOptions, type Uri } from 'vscode';

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
/** Decoration base that is shared among all severity problems. */
export const decorationRenderOptions = {} as unknown as Record<'error' | 'warning' | 'info' | 'hint', DecorationRenderOptions>;

/**
 * VSCode doesn't support some options like changing font-size or font-family
 * for decorations. Use `textDecoration` property to inject them.
 */
let textDecorationStyleString = '';

/**
 * Update all decoration styles: editor, gutter, status bar
 */
export function setDecorationStyle(context: ExtensionContext): void {
	disposeAllDecorations();

	let gutter: Gutter | undefined;
	if (extUtils.shouldShowGutterIcons()) {
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

	// Both "line" & "message" have colors with transparency by default.
	// This section honours `messageBackgroundMode` setting and removes colors
	// so that message & line backgrounds woudn't mix(overlap).
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

	const fontFamily = $config.fontFamily ? `font-family: ${$config.fontFamily}` : '';
	const padding = $config.padding ? `padding: ${extUtils.addPxUnitsIfNeeded($config.padding)}` : '';
	const borderRadius = `border-radius: ${$config.borderRadius || '0'}`;
	const scrollbarHack = $config.scrollbarHackEnabled ? 'position:absolute;pointer-events:none;top:50%;transform:translateY(-50%);' : '';
	let fontSize = $config.fontSize ? `font-size: ${extUtils.addPxUnitsIfNeeded($config.fontSize)}` : '';

	const isRelativeFontSize = $config.fontSize.startsWith('-');
	if (isRelativeFontSize) {
		const editorFontSize = workspace.getConfiguration('editor').get<number>('fontSize')! || 14;
		fontSize = `font-size: ${editorFontSize + (parseFloat($config.fontSize) || 0)}px`;
	}

	textDecorationStyleString = `none;${fontFamily};${fontSize};${borderRadius}`;

	const afterProps: ThemableDecorationAttachmentRenderOptions = {
		fontStyle: $config.fontStyleItalic ? 'italic' : 'normal',
		fontWeight: $config.fontWeight,
		margin: $config.margin ? `0 0 0 ${extUtils.addPxUnitsIfNeeded($config.margin)}` : '',
		textDecoration: `${textDecorationStyleString};${padding};${scrollbarHack}`,
	};

	const decorationRenderOptionsError: DecorationRenderOptions = {
		backgroundColor: errorBackground,
		gutterIconSize: $config.gutterIconSize,
		gutterIconPath: gutter?.errorIconPath,
		after: {
			...afterProps,
			border: $config.border?.[DiagnosticSeverity.Error] ? $config.border[DiagnosticSeverity.Error] : undefined,
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
			border: $config.border?.[DiagnosticSeverity.Warning] ? $config.border[DiagnosticSeverity.Warning] : undefined,
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
			border: $config.border?.[DiagnosticSeverity.Information] ? $config.border[DiagnosticSeverity.Information] : undefined,
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
			border: $config.border?.[DiagnosticSeverity.Hint] ? $config.border[DiagnosticSeverity.Hint] : undefined,
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

	if (!extUtils.shouldShowInlineMessage()) {
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

	decorationRenderOptions.error = decorationRenderOptionsError;
	decorationRenderOptions.warning = decorationRenderOptionsWarning;
	decorationRenderOptions.info = decorationRenderOptionsInfo;
	decorationRenderOptions.hint = decorationRenderOptionsHint;

	if ($state.transmuteExists) {
		setTransmutedDecorationStyle(decorationRenderOptions);
	}

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
 * Remove all decorations from an editor (gutter/highlighting/inlineMessage).
 */
export function clearDecorations({ editor }: { editor: TextEditor | undefined }): void {
	if (!editor) {
		return;
	}
	doUpdateDecorations({
		editor,
		groupedDiagnostics: {},
	});
}
/**
 * Actually apply decorations for editor.
 * @param range Only allow decorating lines in this range.
 */
function doUpdateDecorations({
	editor,
	groupedDiagnostics,
	range,
}: {
	editor: TextEditor;
	groupedDiagnostics: GroupedByLineDiagnostics;
	range?: Range;
}): void {
	$state.log('doUpdateDecorations()', editor.document.uri.toString(true));

	let decorationOptionsError: DecorationOptions[] = [];
	let decorationOptionsWarning: DecorationOptions[] = [];
	let decorationOptionsInfo: DecorationOptions[] = [];
	let decorationOptionsHint: DecorationOptions[] = [];

	const decorationOptionsErrorRange: DecorationOptions[] = [];
	const decorationOptionsWarningRange: DecorationOptions[] = [];
	const decorationOptionsInfoRange: DecorationOptions[] = [];
	const decorationOptionsHintRange: DecorationOptions[] = [];

	let allowedLineNumbersToRenderDiagnostics: number[] | undefined;
	if ($config.followCursor === 'closestProblem') {
		if (range === undefined) {
			range = editor.selection;
		}
		const line = range.start.line;

		const groupedDiagnosticsAsArray = Object.entries(groupedDiagnostics).sort((a, b) => Math.abs(line - Number(a[0])) - Math.abs(line - Number(b[0])));
		groupedDiagnosticsAsArray.length = $config.followCursorMore + 1;// Reduce array length to the number of allowed rendered lines (decorations)
		allowedLineNumbersToRenderDiagnostics = groupedDiagnosticsAsArray.map(d => d[1][0].range.start.line);
	}

	for (const lineNumber in groupedDiagnostics) {
		const allDiagnosticsInLine = groupedDiagnostics[lineNumber];
		const diagnostic = allDiagnosticsInLine[0];

		if (!diagnostic) {
			continue;
		}

		const severity = diagnostic.severity;

		let message: string | undefined;

		const preparedMessage = extUtils.prepareMessage({
			diagnostic,
			template: $config.messageTemplate,
			lineProblemCount: allDiagnosticsInLine.length,
			removeLinebreaks: $config.removeLinebreaks,
			replaceLinebreaksSymbol: $config.replaceLinebreaksSymbol,
		});

		if (extUtils.shouldShowInlineMessage()) {
			message = preparedMessage;
		} else {
			message = undefined;
		}

		let alignMarginStyle = '';
		let alignRange: Range | undefined;
		if (extUtils.shouldAlign()) {
			const styleForAlignment = getStyleForAlignment({
				isMultilineDecoration: false,
				alignmentKind: $config.alignMessage.useFixedPosition ? 'fixed' : 'normal',
				textLine: editor.document.lineAt(Number(lineNumber)),
				indentSize: editor.options.tabSize as number,
				indentStyle: editor.options.insertSpaces as boolean ? 'spaces' : 'tab',
				minimumMargin: $config.alignMessage.minimumMargin,
				padding: $config.alignMessage.padding,
				minVisualLineLength: $config.alignMessage.start,
				start: $config.alignMessage.start,
				end: $config.alignMessage.end,
				problemMessage: message ?? '',
			});
			alignMarginStyle = styleForAlignment.styleStr;
			alignRange = styleForAlignment.range;

			if ($config.alignMessage.start && $config.alignMessage.end) {
				// truncate message if both start & end defined by user
				message = utils.truncateString(message ?? '', $config.alignMessage.end - $config.alignMessage.start - 1);
			}
		}

		const decInstanceRenderOptions: DecorationInstanceRenderOptions = {
			after: {
				contentText: message,
				// @ts-expect-error need for `transmute` feature
				problem: diagnostic,
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
				const firstLineAllowed = range.start.line - $config.followCursorMore;
				const lastLineAllowed = range.end.line + $config.followCursorMore;

				if ((diagnosticRange.start.line >= firstLineAllowed) && (diagnosticRange.start.line <= lastLineAllowed)) {
					messageRange = diagnosticRange;
				}
			} else if ($config.followCursor === 'allLinesExceptActive') {
				if (diagnosticRange.start.line === range.start.line) {
					messageRange = undefined;
				} else {
					messageRange = diagnosticRange;
				}
			} else if ($config.followCursor === 'closestProblem') {
				if (allowedLineNumbersToRenderDiagnostics!.includes(diagnosticRange.start.line)) {
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
			case DiagnosticSeverity.Error: {
				decorationOptionsError.push(diagnosticDecorationOptions);
				if ($config.problemRangeDecorationEnabled) {
					decorationOptionsErrorRange.push({
						range: messageRange,
					});
				}
				break;
			}
			case DiagnosticSeverity.Warning: {
				decorationOptionsWarning.push(diagnosticDecorationOptions);
				if ($config.problemRangeDecorationEnabled) {
					decorationOptionsWarningRange.push({
						range: messageRange,
					});
				}
				break;
			}
			case DiagnosticSeverity.Information: {
				decorationOptionsInfo.push(diagnosticDecorationOptions);
				if ($config.problemRangeDecorationEnabled) {
					decorationOptionsInfoRange.push({
						range: messageRange,
					});
				}
				break;
			}
			case DiagnosticSeverity.Hint: {
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

	if (extUtils.shouldShowGutterIcons()) {
		updateWorkaroundGutterIcon(editor);
	}

	if ($state.transmuteExists) {
		const transmutedDecorations = transmute({
			decorationOptionsError,
			decorationOptionsWarning,
			decorationOptionsInfo,
			decorationOptionsHint,
			decorationRenderBase: decorationRenderOptions,
		});

		decorationOptionsError = transmutedDecorations.nonTransmuted.error;
		decorationOptionsWarning = transmutedDecorations.nonTransmuted.warning;
		decorationOptionsInfo = transmutedDecorations.nonTransmuted.info;
		decorationOptionsHint = transmutedDecorations.nonTransmuted.hint;

		doUpdateTransmutedDecorations(transmutedDecorations.transmuted, editor);
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

	$state.codeLens?.update();
}

export function updateDecorationsForAllVisibleEditors(): void {
	// TODO: maybe this condition should not be here
	if (
		$config.onSave &&
		!$config.onSaveUpdateOnActiveEditorChange
	) {
		return;
	}

	for (const editor of window.visibleTextEditors) {
		$state.log('updateDecorationsForAllVisibleEditors()');
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
		editor = vscodeUtils.getEditorByUri(uri);
	}

	if (!editor) {
		return;
	}

	if (!editor.document.uri.fsPath) {
		return;
	}

	const excludeEditor = extUtils.shouldExcludeEditor(editor);
	if (excludeEditor === 'exclude') {
		return;
	} else if (excludeEditor === 'excludeAndClearDecorations') {
		clearDecorations({ editor });
		return;
	}

	doUpdateDecorations({
		editor,
		groupedDiagnostics: groupedDiagnostics ?? extUtils.groupDiagnosticsByLine(languages.getDiagnostics(uri)),
		range,
	});
}

export function disposeAllDecorations(): void {
	for (const decorationType of Object.values(decorationTypes)) {
		decorationType?.dispose();
	}
	disposeTransmutedDecorations();
}

