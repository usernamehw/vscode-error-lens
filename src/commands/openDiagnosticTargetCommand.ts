import { vscodeUtils } from 'src/utils/vscodeUtils';
import { env, Uri, window } from 'vscode';

export async function openDiagnosticTargetCommand(target: string | Uri | undefined): Promise<void> {
	if (!target) {
		return;
	}

	const targetUri = typeof target === 'string' ? Uri.parse(target) : target;
	if (!vscodeUtils.isAllowedExternalUri(targetUri)) {
		await window.showWarningMessage('Diagnostic docs can only be opened via https URLs.');
		return;
	}

	await env.openExternal(targetUri);
}
