const fs = require('node:fs/promises');
const { existsSync } = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { parseDocument } = require('yaml');

const repoRoot = path.resolve(__dirname, '..');
const artifactsDir = path.join(repoRoot, 'artifacts', 'vsix');
const distDir = path.join(repoRoot, 'dist');
const manifestFile = path.join(repoRoot, 'package.json');
const workspaceFile = path.join(repoRoot, 'pnpm-workspace.yaml');

async function readJson(filePath) {
	return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

async function readCatalog() {
	const workspaceText = await fs.readFile(workspaceFile, 'utf8');
	const workspace = parseDocument(workspaceText).toJS() ?? {};
	return workspace.catalog ?? {};
}

function materializeCatalogSpecifiers(manifest, catalog) {
	for (const sectionName of ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies']) {
		const section = manifest[sectionName];
		if (!section) {
			continue;
		}

		for (const [dependencyName, specifier] of Object.entries(section)) {
			if (specifier !== 'catalog:') {
				continue;
			}

			const catalogVersion = catalog[dependencyName];
			if (!catalogVersion) {
				throw new Error(`Missing catalog version for ${dependencyName}.`);
			}

			section[dependencyName] = String(catalogVersion);
		}
	}

	return manifest;
}

function removePackagingUnsafeScripts(manifest) {
	if (!manifest.scripts) {
		return manifest;
	}

	delete manifest.scripts['vscode:prepublish'];

	if (Object.keys(manifest.scripts).length === 0) {
		delete manifest.scripts;
	}

	return manifest;
}

async function assertPathExists(filePath, description) {
	if (!existsSync(filePath)) {
		throw new Error(`Missing ${description}: ${path.relative(repoRoot, filePath)}`);
	}
}

async function copyRelativeFile(stageDir, relativePath, required = false) {
	const sourcePath = path.join(repoRoot, relativePath);
	if (!existsSync(sourcePath)) {
		if (required) {
			throw new Error(`Missing required file: ${relativePath}`);
		}

		return;
	}

	const targetPath = path.join(stageDir, relativePath);
	await fs.mkdir(path.dirname(targetPath), { recursive: true });
	await fs.copyFile(sourcePath, targetPath);
}

async function copyLicenseFiles(stageDir) {
	const rootEntries = await fs.readdir(repoRoot, { withFileTypes: true });
	const licenseFiles = rootEntries
		.filter(entry => entry.isFile() && /^LICENSE/i.test(entry.name))
		.map(entry => entry.name);

	if (licenseFiles.length === 0) {
		throw new Error('Missing required LICENSE file.');
	}

	for (const licenseFile of licenseFiles) {
		await copyRelativeFile(stageDir, licenseFile, true);
	}
}

async function main() {
	await assertPathExists(distDir, 'runtime bundle directory');
	await assertPathExists(path.join(distDir, 'extension.js'), 'bundled extension entry');
	await assertPathExists(manifestFile, 'extension manifest');
	await assertPathExists(workspaceFile, 'pnpm workspace policy');

	const manifest = await readJson(manifestFile);
	const catalog = await readCatalog();
	const stagedManifest = removePackagingUnsafeScripts(
		materializeCatalogSpecifiers(structuredClone(manifest), catalog),
	);

	const stageDir = await fs.mkdtemp(path.join(os.tmpdir(), 'errorlens-vsix-'));

	try {
		await fs.mkdir(artifactsDir, { recursive: true });
		await fs.cp(distDir, path.join(stageDir, 'dist'), { recursive: true, force: true });
		await copyRelativeFile(stageDir, 'README.md', true);
		await copyRelativeFile(stageDir, '.vscodeignore', true);
		await copyRelativeFile(stageDir, 'CHANGELOG.md');
		await copyLicenseFiles(stageDir);

		if (manifest.icon) {
			await copyRelativeFile(stageDir, manifest.icon, true);
		}

		await fs.writeFile(
			path.join(stageDir, 'package.json'),
			`${JSON.stringify(stagedManifest, null, 2)}\n`,
			'utf8',
		);

		const vscePackageRoot = path.dirname(require.resolve('@vscode/vsce/package.json'));
		const vsceDependencyRoot = path.resolve(vscePackageRoot, '..', '..');
		const vsceCliPath = require.resolve('@vscode/vsce/vsce');
		const stageNodeModules = path.join(stageDir, 'node_modules');

		await fs.symlink(
			vsceDependencyRoot,
			stageNodeModules,
			process.platform === 'win32' ? 'junction' : 'dir',
		);

		const outputFile = path.join(artifactsDir, `${manifest.name}-${manifest.version}.vsix`);
		const packageResult = spawnSync(
			process.execPath,
			[vsceCliPath, 'package', '--no-dependencies', '--out', outputFile],
			{
				cwd: stageDir,
				env: {
					...process.env,
					NODE_PATH: vsceDependencyRoot,
				},
				stdio: 'inherit',
			},
		);

		if (packageResult.status !== 0) {
			throw new Error(`vsce package failed with exit code ${packageResult.status ?? 'unknown'}.`);
		}
	} finally {
		await fs.rm(stageDir, { recursive: true, force: true });
	}
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
