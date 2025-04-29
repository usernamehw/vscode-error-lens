import { $config } from 'src/extension';
import { Constants, type ExtensionConfig } from 'src/types';
import { extUtils } from 'src/utils/extUtils';
import { vscodeUtils } from 'src/utils/vscodeUtils';
import { window, type Diagnostic } from 'vscode';

export async function excludeProblemCommand(diagnostic: Diagnostic): Promise<void> {
	if (!diagnostic) {
		const editor = window.activeTextEditor;
		if (!editor) {
			window.showInformationMessage('No active Text Editor.');
			return;
		}
		const diagnosticAtActiveLineNumber = extUtils.getDiagnosticAtLine(editor.document.uri, editor.selection.active.line);
		if (!diagnosticAtActiveLineNumber) {
			window.showInformationMessage('There\'s no problem at the active line.');
			return;
		}
		diagnostic = diagnosticAtActiveLineNumber;
	}

	const code = extUtils.getDiagnosticCode(diagnostic);
	const source = diagnostic.source;
	if (!source) {
		showExcludeByMessageNotification(`Diagnostic has no "source".`, diagnostic);
		return;
	}
	if (!code) {
		showExcludeByMessageNotification(`Diagnostic has no "code".`, diagnostic);
		return;
	}

	const sourceCodeString = extUtils.diagnosticToSourceCodeString(source, code);

	if ($config.excludeBySource.includes(sourceCodeString)) {
		return;
	}

	await vscodeUtils.updateGlobalSetting(`${Constants.SettingsPrefix}.${'excludeBySource' satisfies keyof ExtensionConfig}`, [
		...$config.excludeBySource,
		sourceCodeString,
	]);

	showCompletionNotification(sourceCodeString);
}

async function showExcludeByMessageNotification(message: string, diagnostic: Diagnostic): Promise<void> {
	const messageToExclude = await window.showInputBox({
		title: `${message}: Exclude by message:`,
		value: diagnostic.message,
	});
	if (!messageToExclude) {
		return;
	}

	if ($config.excludeByMessage.includes(messageToExclude)) {
		return;
	}
	await vscodeUtils.updateGlobalSetting(`${Constants.SettingsPrefix}.${'excludeByMessage' satisfies keyof ExtensionConfig}`, [
		...$config.excludeByMessage,
		messageToExclude,
	]);

	showCompletionByMessageNotification(messageToExclude);
}

async function showCompletionByMessageNotification(messageToExclude: string): Promise<void> {
	const openSettingsButton = 'Open Setting';
	const pressedButton = await window.showInformationMessage(`Excluded problem by message: "${messageToExclude}"`, openSettingsButton);

	if (pressedButton === openSettingsButton) {
		vscodeUtils.openSettingGuiAt(`@ext:${Constants.ExtensionId} ${Constants.SettingsPrefix}.${'excludeByMessage' satisfies keyof ExtensionConfig}`);
	}
}

async function showCompletionNotification(sourceCodeString: string): Promise<void> {
	const openSettingsButton = 'Open Setting';
	const pressedButton = await window.showInformationMessage(`Excluded problem by source+code: "${sourceCodeString}"`, openSettingsButton);

	if (pressedButton === openSettingsButton) {
		vscodeUtils.openSettingGuiAt(`@ext:${Constants.ExtensionId} ${'excludeBySource' satisfies keyof ExtensionConfig}`);
	}
}
