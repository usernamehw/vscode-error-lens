import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runTests } from '@vscode/test-electron';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
	try {
		const extensionDevelopmentPath = path.resolve(__dirname, '..', '..');
		const extensionTestsPath = path.resolve(__dirname, 'index.cjs');
		const exitCode = await runTests({
			version: 'stable',
			extensionDevelopmentPath,
			extensionTestsPath,
			launchArgs: ['--disable-workspace-trust'],
		});

		if (exitCode !== 0) {
			throw new Error(`VS Code smoke test failed with exit code ${exitCode}.`);
		}
	} catch (error) {
		console.error(error);
		console.error('Failed to run VS Code smoke test.');
		process.exitCode = 1;
	}
}

await main();
