import { $config } from 'src/extension';
import { ExtensionConfig } from 'src/types';
import { extUtils, GroupedByLineDiagnostics } from 'src/utils/extUtils';
import { Diagnostic, window } from 'vscode';

// export const transmutedDecorationTypes = {} as unknown as Record<string, TextEditorDecorationType>;

/**
 * Transmute severity must be called before grouping and sorting of problems,
 * since it may change which severity decoration is applied to the line.
 *
 * [error, error, warning]  <- problems on one editor line (only 1st is rendered)
 *  ^ if the first problem changes severity -> the list needs to be sorted after
 */
export function transmuteSeverity(groupedDiagnostics: GroupedByLineDiagnostics): GroupedByLineDiagnostics {
	const groupedDiagnosticsProcessed: GroupedByLineDiagnostics = groupedDiagnostics;

	for (const transmuteId in $config.transmute) {
		const transmuteItem = $config.transmute[transmuteId];

		for (const lineNumber in groupedDiagnosticsProcessed) {
			const diagnosticsOnLine = groupedDiagnosticsProcessed[lineNumber];

			for (let i = 0; i < diagnosticsOnLine.length; i++) {
				if (targetMatchesProblem(transmuteItem, diagnosticsOnLine[i])) {
					groupedDiagnosticsProcessed[lineNumber][i].severity = extUtils.severityStringToNumber(transmuteItem.severity);
				}
			}
		}
	}

	return groupedDiagnosticsProcessed;
}

/**
 * Return `true` when all of the present properties on target (source,code,(message OR messageRegex)) match the Diagnostic.
 */
function targetMatchesProblem(transmuteItem: ExtensionConfig['transmute'][''], problem: Diagnostic): boolean {
	if (transmuteItem.target.source && problem.source) {
		if (transmuteItem.target.source !== problem.source) {
			return false;
		}
	}

	if (transmuteItem.target.code && problem.code) {
		if (transmuteItem.target.code !== problem.code) {
			return false;
		}
	}

	const target = transmuteItem.target;

	if (target.message && problem.message) {
		if (problem.message.toLocaleLowerCase().includes(target.message.toLocaleLowerCase())) {
			return true;
		} else {
			return false;
		}
	}

	if (target.messageRegex && problem.message) {
		if (!target.messageRegex.regex) {
			window.showErrorMessage(`Missing "regex" property`);
			return false;
		}
		const regex = new RegExp(target.messageRegex.regex, target.messageRegex.flags ?? 'ui');

		if (regex.test(problem.message)) {
			return true;
		} else {
			return false;
		}
	}

	return true;
}

