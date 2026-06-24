// @ts-check

/**
 * @param {string} name
 * @returns {string}
 */
export function createGreeting(name) {
	if (name == null) {
		return 'Hello anonymous';
	}

	return `Hello ${name.toUpperCase()}`;
}

const preview = createGreeting(42);
console.log(preview);

var brokenCount = 1;
const total = brokenCount + missingValue;

if (brokenCount) {
	console.log(userName);
}
