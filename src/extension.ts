import { registerAllCommands } from 'src/commands';
import { disposeAllDecorations, setDecorationStyle, updateDecorationsForAllVisibleEditors } from 'src/decorations';
import { disposeAllEventListeners, updateChangeBreakpointsListener, updateChangeDiagnosticListener, updateChangeVisibleTextEditorsListener, updateChangedActiveTextEditorListener, updateCursorChangeListener, updateOnSaveListener, updateOnVisibleRangesListener } from 'src/events';
import { StatusBarIcons } from 'src/statusBar/statusBarIcons';
import { StatusBarMessage } from 'src/statusBar/statusBarMessage';
import { Constants, type ExtensionConfig } from 'src/types';
import { extUtils } from 'src/utils/extUtils';
import { Logger } from 'src/utils/logger';
import { ExtensionMode, workspace, type ExtensionContext } from 'vscode';
import { ErrorLensCodeLens } from './codeLens';

/**
 * All user settings.
 */
export let $config: ExtensionConfig;

/**
 * Global state.
 */
export abstract class $state {
	static configErrorEnabled = true;
	static configWarningEnabled = true;
	static configInfoEnabled = true;
	static configHintEnabled = true;
	/**
	 * VSCode `problems.visibility` setting value.
	 */
	static vscodeGlobalProblemsEnabled = true;
	/**
	 * Status bar object. Handles all status bar stuff (for text message)
	 */
	static statusBarMessage: StatusBarMessage;
	/**
	 * Status bar object. Handles all status bar stuff (for icons)
	 */
	static statusBarIcons: StatusBarIcons;
	/**
	 * Code Lens Provider. Handles all Code Lens stuff https://github.com/microsoft/vscode-extension-samples/tree/main/codelens-sample
	 */
	static codeLens: ErrorLensCodeLens;
	/**
	 * Array of RegExp matchers and their updated messages.
	 * message may include groups references like $0 (entire expression), $1 (first group), etc.
	 */
	static replaceRegexp?: {
		matcher: RegExp;
		message: string;
	}[] = undefined;

	/**
	 * Array of RegExp (that would match against diagnostic message)
	 */
	static excludeRegexp: RegExp[] = [];
	/**
	 * Array of source/code to ignore (that would match against diagnostic object)
	 */
	static excludeSources: {
		source: string;
		code?: string;
	}[] = [];

	/**
	 * Array of document selectors (that would match against document)
	 */
	static excludePatterns?: {
		pattern: string;
	}[] = undefined;

	/**
	 * Timestamp when last time user manually saved the document.
	 * Used to determine if the save was recently (1s?) to show decorations.
	 */
	static lastSavedTimestamp = Date.now() + 2000;
	/**
	 * Editor icons can be rendered only for active line (to reduce the visual noise).
	 * But it might be useful to show gutter icons for all lines. With `gutterIconsFollowCursorOverride`
	 * setting then gutter icons will be rendered as a separate set of decorations.
	 */
	static renderGutterIconsAsSeparateDecoration: boolean;
	/**
	 * Set event listener for when editor visibleRanges change (vertical scroll), only when necessary.
	 */
	static shouldUpdateOnEditorScrollEvent: boolean;
	/**
	 * Use console.log() when developing extension.
	 */
	static logger: Logger;
	static log = (message: string, ...args: unknown[]): void => {
		$state.logger.log(message, ...args);
	};
}

export function activate(context: ExtensionContext): void {
	$state.logger = new Logger({
		// isDev: context.extensionMode === ExtensionMode.Development,
		isDev: false,
	});
	updateConfigAndEverything();
	registerAllCommands(context);

	/**
	 * - Update config
	 * - Dispose everything
	 * - Update everything
	 */
	function updateConfigAndEverything(): void {
		$config = workspace.getConfiguration().get(Constants.SettingsPrefix)!;
		$state.vscodeGlobalProblemsEnabled = workspace.getConfiguration('problems').get<boolean>('visibility') ?? true;
		disposeEverything();
		if ($config.enabled) {
			updateEverything(context);
		}
	}

	context.subscriptions.push(workspace.onDidChangeConfiguration(e => {
		if (
			!e.affectsConfiguration(Constants.SettingsPrefix) &&
			!e.affectsConfiguration('problems.visibility')
		) {
			return;
		}
		updateConfigAndEverything();
	}));
}
/**
 * Runs only on extension configuration change event.
 *
 * - Update all global state
 * - Update all decoration styles
 * - Update decorations for all visible editors
 * - Update all event listeners
 */
export function updateEverything(context: ExtensionContext): void {
	updateTransformState();
	updateExcludeState();

	$state.renderGutterIconsAsSeparateDecoration = $config.gutterIconsEnabled &&
		$config.gutterIconsFollowCursorOverride &&
		$config.followCursor !== 'allLines';

	$state.shouldUpdateOnEditorScrollEvent = $config.followCursor === 'closestProblemMultiline' ||
		$config.followCursor === 'closestProblemMultilineInViewport' ||
		$config.followCursor === 'closestProblemMultilineBySeverity';

	$state.statusBarMessage?.dispose();
	$state.statusBarIcons?.dispose();
	$state.statusBarMessage = new StatusBarMessage({
		isEnabled: extUtils.shouldShowStatusBarMessage(),
		colorsEnabled: $config.statusBarColorsEnabled,
		messageType: $config.statusBarMessageType,
		priority: $config.statusBarMessagePriority,
		alignment: $config.statusBarMessageAlignment,
	});
	$state.statusBarIcons = new StatusBarIcons({
		isEnabled: extUtils.shouldShowStatusBarIcons(),
		atZero: $config.statusBarIconsAtZero,
		useBackground: $config.statusBarIconsUseBackground,
		priority: $config.statusBarIconsPriority,
		alignment: $config.statusBarIconsAlignment,
		targetProblems: $config.statusBarIconsTargetProblems,
	});
	$state.codeLens?.dispose();
	$state.codeLens = new ErrorLensCodeLens(context);
	$state.configErrorEnabled = $config.enabledDiagnosticLevels.includes('error');
	$state.configWarningEnabled = $config.enabledDiagnosticLevels.includes('warning');
	$state.configInfoEnabled = $config.enabledDiagnosticLevels.includes('info');
	$state.configHintEnabled = $config.enabledDiagnosticLevels.includes('hint');

	setDecorationStyle(context);

	updateDecorationsForAllVisibleEditors();

	$state.statusBarIcons.updateText();

	updateChangeDiagnosticListener();
	updateChangeVisibleTextEditorsListener();
	updateOnSaveListener();
	updateCursorChangeListener();
	updateChangedActiveTextEditorListener();
	updateChangeBreakpointsListener();
	updateOnVisibleRangesListener();
}
/**
 * - Create `RegExp` from string for messages.
 */
function updateTransformState(): void {
	$state.replaceRegexp = $config.replace.map(config => ({ matcher: createMessageRegex(config.matcher), message: config.message }));
}
/**
 * - Create `RegExp` from string for messages.
 * - Create `DocumentFilter[]` for document match.
 * - Create `source/code` exclusion object.
 */
function updateExcludeState(): void {
	$state.excludeRegexp = [];
	$state.excludeSources = [];
	$state.excludePatterns = undefined;

	// ──── Exclude by source ─────────────────────────────────────
	for (const excludeSourceCode of $config.excludeBySource) {
		const sourceCode = extUtils.parseSourceCodeFromString(excludeSourceCode);
		if (!sourceCode.source) {
			continue;
		}
		$state.excludeSources.push({
			source: sourceCode.source,
			code: sourceCode.code,
		});
	}

	// ──── Exclude by message ────────────────────────────────────
	for (const excludeMessage of $config.exclude) {
		if (typeof excludeMessage === 'string') {
			$state.excludeRegexp.push(createMessageRegex(excludeMessage));
		}
	}

	// ──── Exlude by glob ────────────────────────────────────────
	if (Array.isArray($config.excludePatterns) && $config.excludePatterns.length !== 0) {
		$state.excludePatterns = $config.excludePatterns.map(item => ({
			pattern: item,
		}));
	}
}

/**
 * Create a RegExp for matching diagnostic messages from its string source
 */
function createMessageRegex(source: string): RegExp {
	return new RegExp(source, 'iu');
}

/**
 * Dispose all disposables (except `onDidChangeConfiguration`).
 */
export function disposeEverything(): void {
	disposeAllEventListeners();
	$state.statusBarMessage?.dispose();
	$state.statusBarIcons?.dispose();
	$state.codeLens?.dispose();
	disposeAllDecorations();
}

export function deactivate(): void { }
