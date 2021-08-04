import { extensionConfig, Global } from 'src/extension';
import { toggleEnabledLevels, updateGlobalSetting } from 'src/settings';
import { AggregatedByLineDiagnostics, CommandIds } from 'src/types';
import { commands, env, ExtensionContext, languages, Range, Selection, TextEditorRevealType, window } from 'vscode';
/**
 * Register all commands contributed by this extension.
 */
export function registerAllCommands(extensionContext: ExtensionContext) {
	const disposableToggleErrorLens = commands.registerCommand(CommandIds.toggle, () => {
		updateGlobalSetting('errorLens.enabled', !extensionConfig.enabled);
	});
	const disposableToggleError = commands.registerCommand(CommandIds.toggleError, () => {
		toggleEnabledLevels('error', extensionConfig.enabledDiagnosticLevels);
	});
	const disposableToggleWarning = commands.registerCommand(CommandIds.toggleWarning, () => {
		toggleEnabledLevels('warning', extensionConfig.enabledDiagnosticLevels);
	});
	const disposableToggleInfo = commands.registerCommand(CommandIds.toggleInfo, () => {
		toggleEnabledLevels('info', extensionConfig.enabledDiagnosticLevels);
	});
	const disposableToggleHint = commands.registerCommand(CommandIds.toggleHint, () => {
		toggleEnabledLevels('hint', extensionConfig.enabledDiagnosticLevels);
	});

	const disposableCopyProblemMessage = commands.registerTextEditorCommand(CommandIds.copyProblemMessage, editor => {
		const aggregatedDiagnostics: AggregatedByLineDiagnostics = {};
		for (const diagnostic of languages.getDiagnostics(editor.document.uri)) {
			const key = diagnostic.range.start.line;

			if (aggregatedDiagnostics[key]) {
				aggregatedDiagnostics[key].push(diagnostic);
			} else {
				aggregatedDiagnostics[key] = [diagnostic];
			}
		}
		const activeLineNumber = editor.selection.active.line;
		const diagnosticAtActiveLineNumber = aggregatedDiagnostics[activeLineNumber];
		if (!diagnosticAtActiveLineNumber) {
			window.showInformationMessage('There\'s no problem at the active line.');
			return;
		}
		const renderedDiagnostic = diagnosticAtActiveLineNumber.sort((a, b) => a.severity - b.severity)[0];
		const source = renderedDiagnostic.source ? `[${renderedDiagnostic.source}] ` : '';
		env.clipboard.writeText(source + renderedDiagnostic.message);
	});

	const disposableStatusBarCommand = commands.registerTextEditorCommand(CommandIds.statusBarCommand, async editor => {
		if (extensionConfig.statusBarCommand === 'goToLine' || extensionConfig.statusBarCommand === 'goToProblem') {
			const range = new Range(Global.statusBar.activeMessagePosition, Global.statusBar.activeMessagePosition);
			editor.selection = new Selection(range.start, range.end);
			editor.revealRange(range, TextEditorRevealType.Default);
			await commands.executeCommand('workbench.action.focusActiveEditorGroup');

			if (extensionConfig.statusBarCommand === 'goToProblem') {
				commands.executeCommand('editor.action.marker.next');
			}
		} else if (extensionConfig.statusBarCommand === 'copyMessage') {
			const source = Global.statusBar.activeMessageSource ? `[${Global.statusBar.activeMessageSource}] ` : '';
			env.clipboard.writeText(source + Global.statusBar.activeMessageText);
		}
	});

	extensionContext.subscriptions.push(disposableToggleErrorLens, disposableToggleError, disposableToggleWarning, disposableToggleInfo, disposableToggleHint, disposableCopyProblemMessage, disposableStatusBarCommand);
}

