import assert from 'node:assert/strict';
import * as vscode from 'vscode';

const extensionId = 'CyberT33N.errorlens';
const requiredCommands = [
	'errorLens.copyProblemMessage',
	'errorLens.searchForProblem',
	'errorLens.toggle',
];

export async function runSmokeTest() {
	const extension = vscode.extensions.getExtension(extensionId);
	assert.ok(extension, `Expected extension ${extensionId} to be available.`);

	await extension.activate();

	assert.equal(extension.isActive, true, 'Expected the extension to activate successfully.');

	const availableCommands = await vscode.commands.getCommands(true);
	for (const commandId of requiredCommands) {
		assert.ok(
			availableCommands.includes(commandId),
			`Expected command ${commandId} to be registered.`,
		);
	}
}
