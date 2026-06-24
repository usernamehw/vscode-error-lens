module.exports.run = async function run() {
	const { runSmokeTest } = await import('./smoke.mjs');
	await runSmokeTest();
};
