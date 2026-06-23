import { decorationTypes } from 'src/decorations';
import { $config } from 'src/extension';
import { type ExtensionConfig } from 'src/types';
import { type GroupedByLineDiagnostics } from 'src/utils/extUtils';
import { vscodeUtils } from 'src/utils/vscodeUtils';
import { debug, DiagnosticSeverity, Location, Range, SourceBreakpoint, Uri, workspace, type DecorationOptions, type ExtensionContext, type TextEditor } from 'vscode';

export interface Gutter {
	iconSet: ExtensionConfig['gutterIconSet'];

	errorIconPath: Uri | string;
	errorIconPathLight: Uri | string;

	warningIconPath: Uri | string;
	warningIconPathLight: Uri | string;

	infoIconPath: Uri | string;
	infoIconPathLight: Uri | string;

	hintIconPath: Uri | string | undefined;
	hintIconPathLight: Uri | string | undefined;

	transparent1x1Icon: Uri | string;
}

/**
 * Set some defaults for gutter styles and return it.
 */
export function getGutterStyles(extensionContext: ExtensionContext): Gutter {
	const gutter: Partial<Gutter> = {};

	gutter.iconSet = $config.gutterIconSet;

	if ($config.gutterIconSet === 'circle') {
		gutter.errorIconPath = vscodeUtils.svgToUri(createCircleIcon($config.errorGutterIconColor));
		gutter.errorIconPathLight = vscodeUtils.svgToUri(createCircleIcon($config.light.errorGutterIconColor || $config.errorGutterIconColor));
		gutter.warningIconPath = vscodeUtils.svgToUri(createCircleIcon($config.warningGutterIconColor));
		gutter.warningIconPathLight = vscodeUtils.svgToUri(createCircleIcon($config.light.warningGutterIconColor || $config.warningGutterIconColor));
		gutter.infoIconPath = vscodeUtils.svgToUri(createCircleIcon($config.infoGutterIconColor));
		gutter.infoIconPathLight = vscodeUtils.svgToUri(createCircleIcon($config.light.infoGutterIconColor || $config.infoGutterIconColor));
		gutter.hintIconPath = vscodeUtils.svgToUri(createCircleIcon($config.hintGutterIconColor));
		gutter.hintIconPathLight = vscodeUtils.svgToUri(createCircleIcon($config.light.hintGutterIconPath || $config.hintGutterIconColor));
	} else if ($config.gutterIconSet === 'square') {
		gutter.errorIconPath = vscodeUtils.svgToUri(createSquareIcon($config.errorGutterIconColor));
		gutter.errorIconPathLight = vscodeUtils.svgToUri(createSquareIcon($config.light.errorGutterIconColor || $config.errorGutterIconColor));
		gutter.warningIconPath = vscodeUtils.svgToUri(createSquareIcon($config.warningGutterIconColor));
		gutter.warningIconPathLight = vscodeUtils.svgToUri(createSquareIcon($config.light.warningGutterIconColor || $config.warningGutterIconColor));
		gutter.infoIconPath = vscodeUtils.svgToUri(createSquareIcon($config.infoGutterIconColor));
		gutter.infoIconPathLight = vscodeUtils.svgToUri(createSquareIcon($config.light.infoGutterIconColor || $config.infoGutterIconColor));
		gutter.hintIconPath = vscodeUtils.svgToUri(createSquareIcon($config.hintGutterIconColor));
		gutter.hintIconPathLight = vscodeUtils.svgToUri(createSquareIcon($config.light.hintGutterIconPath || $config.hintGutterIconColor));
	} else if ($config.gutterIconSet === 'squareRounded') {
		gutter.errorIconPath = vscodeUtils.svgToUri(createSquareRoundedIcon($config.errorGutterIconColor));
		gutter.errorIconPathLight = vscodeUtils.svgToUri(createSquareRoundedIcon($config.light.errorGutterIconColor || $config.errorGutterIconColor));
		gutter.warningIconPath = vscodeUtils.svgToUri(createSquareRoundedIcon($config.warningGutterIconColor));
		gutter.warningIconPathLight = vscodeUtils.svgToUri(createSquareRoundedIcon($config.light.warningGutterIconColor || $config.warningGutterIconColor));
		gutter.infoIconPath = vscodeUtils.svgToUri(createSquareRoundedIcon($config.infoGutterIconColor));
		gutter.infoIconPathLight = vscodeUtils.svgToUri(createSquareRoundedIcon($config.light.infoGutterIconColor || $config.infoGutterIconColor));
		gutter.hintIconPath = vscodeUtils.svgToUri(createSquareRoundedIcon($config.hintGutterIconColor));
		gutter.hintIconPathLight = vscodeUtils.svgToUri(createSquareRoundedIcon($config.light.hintGutterIconPath || $config.hintGutterIconColor));
	} else if ($config.gutterIconSet === 'letter') {
		gutter.errorIconPath = vscodeUtils.svgToUri(createLetterIcon($config.errorGutterIconColor, 'E'));
		gutter.errorIconPathLight = vscodeUtils.svgToUri(createLetterIcon($config.light.errorGutterIconColor || $config.errorGutterIconColor, 'E'));
		gutter.warningIconPath = vscodeUtils.svgToUri(createLetterIcon($config.warningGutterIconColor, 'W'));
		gutter.warningIconPathLight = vscodeUtils.svgToUri(createLetterIcon($config.light.warningGutterIconColor || $config.warningGutterIconColor, 'W'));
		gutter.infoIconPath = vscodeUtils.svgToUri(createLetterIcon($config.infoGutterIconColor, 'I'));
		gutter.infoIconPathLight = vscodeUtils.svgToUri(createLetterIcon($config.light.infoGutterIconColor || $config.infoGutterIconColor, 'I'));
		gutter.hintIconPath = vscodeUtils.svgToUri(createLetterIcon($config.hintGutterIconColor, 'H'));
		gutter.hintIconPathLight = vscodeUtils.svgToUri(createLetterIcon($config.light.hintGutterIconPath || $config.hintGutterIconColor, 'H'));
	} else if ($config.gutterIconSet === 'emoji') {
		gutter.errorIconPath = vscodeUtils.svgToUri(createEmojiIcon($config.errorGutterIconColor, $config.gutterEmoji.error));
		gutter.errorIconPathLight = vscodeUtils.svgToUri(createEmojiIcon($config.light.errorGutterIconColor || $config.errorGutterIconColor, $config.gutterEmoji.error));
		gutter.warningIconPath = vscodeUtils.svgToUri(createEmojiIcon($config.warningGutterIconColor, $config.gutterEmoji.warning));
		gutter.warningIconPathLight = vscodeUtils.svgToUri(createEmojiIcon($config.light.warningGutterIconColor || $config.warningGutterIconColor, $config.gutterEmoji.warning));
		gutter.infoIconPath = vscodeUtils.svgToUri(createEmojiIcon($config.infoGutterIconColor, $config.gutterEmoji.info));
		gutter.infoIconPathLight = vscodeUtils.svgToUri(createEmojiIcon($config.light.infoGutterIconColor || $config.infoGutterIconColor, $config.gutterEmoji.info));
		gutter.hintIconPath = vscodeUtils.svgToUri(createEmojiIcon($config.hintGutterIconColor, $config.gutterEmoji.hint));
		gutter.hintIconPathLight = vscodeUtils.svgToUri(createEmojiIcon($config.light.hintGutterIconPath || $config.hintGutterIconColor, $config.gutterEmoji.hint));
	} else {
		gutter.errorIconPath = extensionContext.asAbsolutePath(`./img/${gutter.iconSet}/error-dark.svg`);
		gutter.errorIconPathLight = extensionContext.asAbsolutePath(`./img/${gutter.iconSet}/error-light.svg`);
		gutter.warningIconPath = extensionContext.asAbsolutePath(`./img/${gutter.iconSet}/warning-dark.svg`);
		gutter.warningIconPathLight = extensionContext.asAbsolutePath(`./img/${gutter.iconSet}/warning-light.svg`);
		gutter.infoIconPath = extensionContext.asAbsolutePath(`./img/${gutter.iconSet}/info-dark.svg`);
		gutter.infoIconPathLight = extensionContext.asAbsolutePath(`./img/${gutter.iconSet}/info-light.svg`);
		gutter.hintIconPath = extensionContext.asAbsolutePath(`./img/${gutter.iconSet}/hint-dark.svg`);
		gutter.hintIconPathLight = extensionContext.asAbsolutePath(`./img/${gutter.iconSet}/hint-light.svg`);
	}
	// ──── User specified custom gutter path ─────────────────────
	if ($config.errorGutterIconPath) {
		gutter.errorIconPath = $config.errorGutterIconPath;
	}
	if ($config.light.errorGutterIconPath || $config.errorGutterIconPath) {
		gutter.errorIconPathLight = $config.light.errorGutterIconPath || $config.errorGutterIconPath;
	}
	if ($config.warningGutterIconPath) {
		gutter.warningIconPath = $config.warningGutterIconPath;
	}
	if ($config.light.warningGutterIconPath || $config.warningGutterIconPath) {
		gutter.warningIconPathLight = $config.light.warningGutterIconColor || $config.warningGutterIconPath;
	}
	if ($config.infoGutterIconPath) {
		gutter.infoIconPath = $config.infoGutterIconPath;
	}
	if ($config.light.infoGutterIconPath || $config.infoGutterIconPath) {
		gutter.infoIconPathLight = $config.light.infoGutterIconColor || $config.infoGutterIconPath;
	}
	if ($config.hintGutterIconPath) {
		gutter.hintIconPath = $config.hintGutterIconPath;
	}
	if ($config.light.hintGutterIconPath || $config.hintGutterIconPath) {
		gutter.hintIconPathLight = $config.light.hintGutterIconColor || $config.hintGutterIconPath;
	}

	return {
		errorIconPath: gutter.errorIconPath,
		errorIconPathLight: gutter.errorIconPathLight,
		warningIconPath: gutter.warningIconPath,
		warningIconPathLight: gutter.warningIconPathLight,
		infoIconPath: gutter.infoIconPath,
		infoIconPathLight: gutter.infoIconPathLight,
		hintIconPath: gutter.hintIconPath,
		hintIconPathLight: gutter.hintIconPathLight,
		iconSet: gutter.iconSet,

		transparent1x1Icon: Uri.parse('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='),
	};
}

/**
 * Actually apply gutter decorations.
 */
export function doUpdateGutterDecorations(editor: TextEditor, groupedDiagnostics: GroupedByLineDiagnostics): void {
	const decorationOptionsGutterError: DecorationOptions[] = [];
	const decorationOptionsGutterWarning: DecorationOptions[] = [];
	const decorationOptionsGutterInfo: DecorationOptions[] = [];
	const decorationOptionsGutterHint: DecorationOptions[] = [];

	for (const key in groupedDiagnostics) {
		const groupedDiagnostic = groupedDiagnostics[key];
		const diagnostic = groupedDiagnostic[0];
		const severity = diagnostic.severity;

		const diagnosticDecorationOptions: DecorationOptions = {
			range: diagnostic.range,
		};

		switch (severity) {
			case DiagnosticSeverity.Error: {
				decorationOptionsGutterError.push(diagnosticDecorationOptions);
				break;
			}
			case DiagnosticSeverity.Warning: {
				decorationOptionsGutterWarning.push(diagnosticDecorationOptions);
				break;
			}
			case DiagnosticSeverity.Information: {
				decorationOptionsGutterInfo.push(diagnosticDecorationOptions);
				break;
			}
			case DiagnosticSeverity.Hint: {
				if ($config.gutterIconSet === 'circle' ||
					$config.gutterIconSet === 'square' ||
					$config.gutterIconSet === 'squareRounded' ||
					$config.gutterIconSet === 'letter' ||
					$config.gutterIconSet === 'emoji') {
					decorationOptionsGutterHint.push(diagnosticDecorationOptions);
				}
				break;
			}
			default: {}
		}
	}

	editor.setDecorations(decorationTypes.gutterError, decorationOptionsGutterError);
	editor.setDecorations(decorationTypes.gutterWarning, decorationOptionsGutterWarning);
	editor.setDecorations(decorationTypes.gutterInfo, decorationOptionsGutterInfo);
	editor.setDecorations(decorationTypes.gutterHint, decorationOptionsGutterHint);
}
/**
 * Create circle gutter icons with different colors.
 */
function createCircleIcon(color: string): string {
	return `<svg xmlns="http://www.w3.org/2000/svg" height="30" width="30"><circle cx="15" cy="15" r="7" fill="${escapeColor(color)}"/></svg>`;
}
/**
 * Create square gutter icons with different colors.
 */
function createSquareIcon(color: string, rx = 0): string {
	return `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" height="40" width="40"><g transform="translate(12, 12)"><rect width="16" height="16" rx="${rx}" fill="${escapeColor(color)}"/></g></svg>`;
}
/**
 * Create square gutter icons with rounded corners.
 */
function createSquareRoundedIcon(color: string): string {
	return createSquareIcon(color, 3);
}

let fontFamily = '';
/**
 * Crate centered single letter icon.
 */
function createLetterIcon(color: string, letter: 'E' | 'H' | 'I' | 'W'): string {
	fontFamily = fontFamily ? fontFamily : workspace.getConfiguration('editor').get('fontFamily') ?? '';
	return `<svg viewBox="-10 -6 20 10" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="${escapeColor(color)}"><text font-family="${fontFamily}" text-anchor="middle" dominant-baseline="middle">${letter}</text></svg>`;
}
function createEmojiIcon(color: string, emojiSymbol: string): string {
	fontFamily = fontFamily ? fontFamily : workspace.getConfiguration('editor').get('fontFamily') ?? '';
	return `<svg viewBox="-10 -6 20 10" xmlns="http://www.w3.org/2000/svg" width="16" height="16"><text fill="${escapeColor(color)}" font-family="${fontFamily}" text-anchor="middle" dominant-baseline="middle">${emojiSymbol}</text></svg>`;
}
/**
 * `%23` is encoded `#` sign (need it to work).
 */
function escapeColor(color: string): string {
	return `%23${color.slice(1)}`;
}

/**
 * Issue https://github.com/CyberT33N/vscode-error-lens/issues/177
 */
export function updateWorkaroundGutterIcon(editor: TextEditor): void {
	const ranges: Range[] = [];
	for (const breakpoint of debug.breakpoints as readonly SourceBreakpoint[]) {
		const location: Location = breakpoint?.location;
		if (location && location.uri.toString(true) === editor?.document.uri.toString(true)) {
			ranges.push(location.range);
		}
	}
	editor.setDecorations(decorationTypes.transparent1x1Icon, ranges);
}
