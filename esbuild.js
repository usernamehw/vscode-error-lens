import * as esbuild from 'esbuild';

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

const buildOptions = {
	bundle: true,
	entryPoints: ['src/extension.ts'],
	external: ['vscode'],
	format: 'esm',
	legalComments: 'none',
	logLevel: 'info',
	minify: production,
	outfile: 'dist/extension.js',
	platform: 'node',
	sourcemap: production ? false : 'linked',
	target: 'esnext',
	tsconfig: 'tsconfig.json',
};

async function main() {
	if (watch) {
		const context = await esbuild.context(buildOptions);
		await context.watch();
		console.log('esbuild watching');
		return;
	}

	await esbuild.build(buildOptions);
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
