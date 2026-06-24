// @ts-check

/**
 * @param {string | undefined | null} name
 * @returns {string}
 */
export function createGreeting(name) {
	if (name === undefined || name === null) {
		return 'Hello anonymous';
	}

	return `Hello ${name.toUpperCase()}`;
}

const users = ['denni', 'cursor'];
const greetings = users.map((userName) => createGreeting(userName));

for (const greeting of greetings) {
	console.log(greeting);
}
