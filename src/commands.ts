import { $config, Global } from 'src/extension';
import { toggleEnabledLevels, toggleWorkspace, updateGlobalSetting } from 'src/settings';
import { AggregatedByLineDiagnostics, CommandId, Constants } from 'src/types';
import { commands, env, ExtensionContext, languages, Range, Selection, TextEditorRevealType, window, workspace } from 'vscode';

/**
 * Register all commands contributed by this extension.
 */
export function registerAllCommands(extensionContext: ExtensionContext) {
	const disposableToggleErrorLens = commands.registerCommand(CommandId.toggle, () => {
		updateGlobalSetting('errorLens.enabled', !$config.enabled);
	});
	const disposableToggleError = commands.registerCommand(CommandId.toggleError, () => {
		toggleEnabledLevels('error', $config.enabledDiagnosticLevels);
	});
	const disposableToggleWarning = commands.registerCommand(CommandId.toggleWarning, () => {
		toggleEnabledLevels('warning', $config.enabledDiagnosticLevels);
	});
	const disposableToggleInfo = commands.registerCommand(CommandId.toggleInfo, () => {
		toggleEnabledLevels('info', $config.enabledDiagnosticLevels);
	});
	const disposableToggleHint = commands.registerCommand(CommandId.toggleHint, () => {
		toggleEnabledLevels('hint', $config.enabledDiagnosticLevels);
	});
	const disposableToggleWorkspace = commands.registerCommand(CommandId.toggleWorkspace, () => {
		toggleWorkspace();
	});

	const disposableCopyProblemMessage = commands.registerTextEditorCommand(CommandId.copyProblemMessage, editor => {
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

	const disposableStatusBarCommand = commands.registerTextEditorCommand(CommandId.statusBarCommand, async editor => {
		if ($config.statusBarCommand === 'goToLine' || $config.statusBarCommand === 'goToProblem') {
			const range = new Range(Global.statusBarMessage.activeMessagePosition, Global.statusBarMessage.activeMessagePosition);
			editor.selection = new Selection(range.start, range.end);
			editor.revealRange(range, TextEditorRevealType.Default);
			await commands.executeCommand(Constants.FocusActiveEditorCommandId);

			if ($config.statusBarCommand === 'goToProblem') {
				commands.executeCommand(Constants.NextProblemCommandId);
			}
		} else if ($config.statusBarCommand === 'copyMessage') {
			const source = Global.statusBarMessage.activeMessageSource ? `[${Global.statusBarMessage.activeMessageSource}] ` : '';
			env.clipboard.writeText(source + Global.statusBarMessage.activeMessageText);
		}
	});

	const disposableRevealLine = commands.registerCommand(CommandId.revealLine, async (fsPath: string, [line, char]) => {
		const range = new Range(line, char, line, char);
		const document = await workspace.openTextDocument(fsPath);
		const editor = await window.showTextDocument(document);
		editor.revealRange(range);
		editor.selection = new Selection(range.start.line, range.start.character, range.start.line, range.start.character);
	});

	extensionContext.subscriptions.push(disposableToggleErrorLens, disposableToggleError, disposableToggleWarning, disposableToggleInfo, disposableToggleHint, disposableCopyProblemMessage, disposableStatusBarCommand, disposableRevealLine);
}

