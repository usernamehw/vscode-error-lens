import { registerAllCommands } from 'src/commands';
import { CustomDelay } from 'src/CustomDelay';
import { setDecorationStyle, updateDecorationsForAllVisibleEditors } from 'src/decorations';
import { updateChangedActiveTextEditorListener, updateChangeDiagnosticListener, updateChangeVisibleTextEditorsListener, updateCursorChangeListener, updateOnSaveListener } from 'src/eventListeners';
import { StatusBar } from 'src/statusBar';
import { Constants, ExtensionConfig } from 'src/types';
import { DecorationRenderOptions, Disposable, ExtensionContext, TextEditorDecorationType, workspace } from 'vscode';
/**
 * All user settings.
 */
export let extensionConfig: ExtensionConfig;

/**
 * Global variables
 */
export class Global {
	static errorLensEnabled = true;
	static errorEnabled = true;
	static warningEabled = true;
	static infoEnabled = true;
	static hintEnabled = true;

	static configErrorEnabled = true;
	static configWarningEnabled = true;
	static configInfoEnabled = true;
	static configHintEnabled = true;

	static decorationRenderOptionsError: DecorationRenderOptions;
	static decorationRenderOptionsWarning: DecorationRenderOptions;
	static decorationRenderOptionsInfo: DecorationRenderOptions;
	static decorationRenderOptionsHint: DecorationRenderOptions;

	static decorationTypeError: TextEditorDecorationType;
	static decorationTypeWarning: TextEditorDecorationType;
	static decorationTypeInfo: TextEditorDecorationType;
	static decorationTypeHint: TextEditorDecorationType;
	static decorationTypeGutterError: TextEditorDecorationType;
	static decorationTypeGutterWarning: TextEditorDecorationType;
	static decorationTypeGutterInfo: TextEditorDecorationType;

	static onDidChangeDiagnosticsDisposable: Disposable | undefined;
	static onDidChangeActiveTextEditor: Disposable | undefined;
	static onDidChangeVisibleTextEditors: Disposable | undefined;
	static onDidSaveTextDocumentDisposable: Disposable | undefined;
	static onDidCursorChangeDisposable: Disposable | undefined;
	/**
	 * Status bar object. Handles all status bar stuff.
	 */
	static statusBar: StatusBar;
	/**
	 * Editor icons can be rendered only for active line (to reduce the visual noise).
	 * But it might be useful to show gutter icons for all lines. With `gutterIconsFollowCursorOverride`
	 * setting then gutter icons will be rendered as a separate set of decorations.
	 */
	static renderGutterIconsAsSeparateDecoration: boolean;
	/**
	 * Array of RegExp (that would match against diagnostic message)
	 */
	static excludeRegexp: RegExp[] = [];
	/**
	 * Array of sources to ignore (that would match against diagnostic source)
	 */
	static excludeSources: string[] = [];
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
	 * CustomDelay object. Handles updating decorations with a delay.
	 */
	static customDelay: CustomDelay | undefined;
	/**
	 * Saved reference for vscode `ExtensionContext` for this extension.
	 */
	static extensionContext: ExtensionContext;
}

export function activate(extensionContext: ExtensionContext) {
	Global.extensionContext = extensionContext;
	updateConfigAndEverything();
	registerAllCommands(extensionContext);

	/**
	 * - Update config
	 * - Dispose everything
	 * - Update everything
	 */
	function updateConfigAndEverything() {
		extensionConfig = workspace.getConfiguration(Constants.EXTENSION_NAME) as unknown as ExtensionConfig;
		disposeEverything();
		updateEverything();
	}

	extensionContext.subscriptions.push(workspace.onDidChangeConfiguration(e => {
		if (!e.affectsConfiguration(Constants.EXTENSION_NAME)) {
			return;
		}
		updateConfigAndEverything();
	}));
}
/**
 * - Update all global variables
 * - Update all decoration styles
 * - Update decorations for all visible editors
 * - Update all event listeners
 */
export function updateEverything() {
	updateExclude();
	Global.renderGutterIconsAsSeparateDecoration = extensionConfig.gutterIconsEnabled && extensionConfig.gutterIconsFollowCursorOverride && extensionConfig.followCursor !== 'allLines';
	Global.statusBar?.dispose();
	Global.statusBar = new StatusBar(
		extensionConfig.statusBarMessageEnabled,
		extensionConfig.statusBarColorsEnabled,
		extensionConfig.addAnnotationTextPrefixes || extensionConfig.statusBarPrefixEnabled,
		extensionConfig.statusBarMessageType);
	setDecorationStyle();
	updateConfigEnabledLevels();

	updateDecorationsForAllVisibleEditors();

	updateChangeDiagnosticListener();
	updateChangeVisibleTextEditorsListener();
	updateOnSaveListener();
	updateCursorChangeListener();
	updateChangedActiveTextEditorListener();
}
/**
 * - Construct `RegExp` from string for messages.
 * - Construct `DocumentFilter[]` for document match.
 */
function updateExclude() {
	Global.excludeRegexp = [];
	Global.excludeSources = extensionConfig.excludeBySource;

	for (const item of extensionConfig.exclude) {
		if (typeof item === 'string') {
			Global.excludeRegexp.push(new RegExp(item, 'i'));
		}
	}
	if (Array.isArray(extensionConfig.excludePatterns) && extensionConfig.excludePatterns.length !== 0) {
		Global.excludePatterns = extensionConfig.excludePatterns.map(item => ({
			pattern: item,
		}));
	} else {
		Global.excludePatterns = undefined;
	}
}
/**
 * Update global varialbes for enabled severity levels of diagnostics based on user setting `enabledDiagnosticLevels`.
 */
function updateConfigEnabledLevels() {
	Global.configErrorEnabled = extensionConfig.enabledDiagnosticLevels.includes('error');
	Global.configWarningEnabled = extensionConfig.enabledDiagnosticLevels.includes('warning');
	Global.configInfoEnabled = extensionConfig.enabledDiagnosticLevels.includes('info');
	Global.configHintEnabled = extensionConfig.enabledDiagnosticLevels.includes('hint');
}
/**
 * Dispose all known disposables (except `onDidChangeConfiguration`).
 */
export function disposeEverything() {
	Global.decorationTypeError?.dispose();
	Global.decorationTypeWarning?.dispose();
	Global.decorationTypeInfo?.dispose();
	Global.decorationTypeHint?.dispose();
	Global.decorationTypeGutterError?.dispose();
	Global.decorationTypeGutterWarning?.dispose();
	Global.decorationTypeGutterInfo?.dispose();
	Global.onDidChangeVisibleTextEditors?.dispose();
	Global.onDidChangeDiagnosticsDisposable?.dispose();
	Global.onDidChangeActiveTextEditor?.dispose();
	Global.onDidSaveTextDocumentDisposable?.dispose();
	Global.onDidCursorChangeDisposable?.dispose();
	Global.statusBar?.dispose();
}

export function deactivate() { }
