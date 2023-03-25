import { ExtensionConfig } from 'src/types';
import { ConfigurationTarget, window, workspace } from 'vscode';
import { $config } from './extension';

/**
 * Update global settings.json file with the new settign value.
 */
export function updateGlobalSetting(settingId: string, newValue: unknown): void {
	const config = workspace.getConfiguration();
	config.update(settingId, newValue, ConfigurationTarget.Global);
}
/**
 * Update global setting `errorLens.enabledDiagnosticLevels`.
 * Either add a diagnostic severity or remove it.
 */
export function toggleEnabledLevels(
	severity: ExtensionConfig['enabledDiagnosticLevels'][number],
	arrayValue: ExtensionConfig['enabledDiagnosticLevels'],
): void {
	const oldValueIndex = arrayValue.indexOf(severity);
	if (oldValueIndex !== -1) {
		arrayValue.splice(oldValueIndex, 1);
	} else {
		arrayValue.push(severity);
	}
	updateGlobalSetting('errorLens.enabledDiagnosticLevels', arrayValue);
}

export function toggleWorkspace(): void {
	const activeEditor = window.activeTextEditor;
	const config = $config;

	if (!activeEditor) {
		return;
	}

	const currentWorkspacePath = workspace.getWorkspaceFolder(activeEditor.document.uri)?.uri.path;

	if (!currentWorkspacePath) {
		return;
	}

	let newExcludeWorkspaceList: string[];

	if (config.excludeWorkspaces?.includes(currentWorkspacePath)) {
		newExcludeWorkspaceList = config.excludeWorkspaces.filter(workspacePath => workspacePath !== currentWorkspacePath);
	} else {
		newExcludeWorkspaceList = [...(config.excludeWorkspaces || []), currentWorkspacePath];
	}

	updateGlobalSetting('errorLens.excludeWorkspaces', newExcludeWorkspaceList);
}
