import { decorationRenderOptions } from 'src/decorations';
import { $config } from 'src/extension';
import { ExtensionConfig } from 'src/types';
import { extUtils, GroupedByLineDiagnostics } from 'src/utils/extUtils';
import { DecorationOptions, Diagnostic, TextEditor, TextEditorDecorationType, window } from 'vscode';

export let transmutedDecorationTypes: TransmutedDecorationType = {};

interface TransmutedDecorationType {
	[transmuteId: string]: {
		error: TextEditorDecorationType;
		warning: TextEditorDecorationType;
		info: TextEditorDecorationType;
		hint: TextEditorDecorationType;
	};
}

/**
 * Transmute severity must be called before sorting of problems,
 * since it may change which severity decoration is applied to the line.
 *
 * [error, error, warning]  <- problems on one editor line (only 1st is rendered)
 *  ^ if the first problem changes severity -> the list needs to be sorted after
 */
export function transmuteSeverity(groupedDiagnostics: GroupedByLineDiagnostics): GroupedByLineDiagnostics {
	const groupedDiagnosticsProcessed: GroupedByLineDiagnostics = groupedDiagnostics;

	for (const transmuteId in $config.transmute) {
		const transmuteItem = $config.transmute[transmuteId];
		if (!transmuteItem.severity) {
			continue;
		}

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
	const target = transmuteItem.target;

	if (!target.message && !target.messageRegex && !target.source && !target.code) {
		// Nothing to match
		return false;
	}

	if (target.source && problem.source) {
		if (target.source !== problem.source) {
			return false;
		}
	}

	if (target.code && problem.code) {
		if (target.code !== extUtils.getDiagnosticCode(problem)) {
			return false;
		}
	}

	const problemMessage = problem.message;

	if (target.message && problemMessage) {
		if (problemMessage.toLocaleLowerCase().includes(target.message.toLocaleLowerCase())) {
			return true;
		} else {
			return false;
		}
	}

	if (target.messageRegex && problemMessage) {
		if (!target.messageRegex.regex) {
			window.showErrorMessage(`Missing "regex" property`);
			return false;
		}
		const regex = new RegExp(target.messageRegex.regex, target.messageRegex.flags ?? 'ui');

		if (regex.test(problemMessage)) {
			return true;
		} else {
			return false;
		}
	}

	return true;
}

/**
 * It's not possible to modify existing decoration (returned from calling `createTextEditorDecorationType()`)
 * so this function needs options `decorationRenderOptions`.
 */
export function setTransmutedDecorationStyle(renderOptions: typeof decorationRenderOptions): void {
	disposeTransmutedDecorations();

	const newTransmutedDecorationTypes: TransmutedDecorationType = {};

	for (const transmuteId in $config.transmute) {
		const transmuteItem = $config.transmute[transmuteId];
		// @ts-ignore
		newTransmutedDecorationTypes[transmuteId] = {};

		for (const severityString in renderOptions) {
			const severityRenderOptions = renderOptions[severityString as keyof typeof renderOptions];

			// @ts-ignore
			newTransmutedDecorationTypes[transmuteId][severityString] = window.createTextEditorDecorationType({
				...severityRenderOptions,
				...transmuteItem.decoration,
			});
		}
	}

	transmutedDecorationTypes = newTransmutedDecorationTypes;
}

/**
 * Decoration options paired with the problem they were created from.
 *
 * The diagnostic is only used inside the extension host (to match against
 * `"errorLens.transmute"` targets) and must stay out of the render options
 * that reach the renderer.
 */
export interface DecorationWithDiagnostic {
	options: DecorationOptions;
	diagnostic: Diagnostic;
}

interface TransmuteArgs {
	decorationsError: DecorationWithDiagnostic[];
	decorationsWarning: DecorationWithDiagnostic[];
	decorationsInfo: DecorationWithDiagnostic[];
	decorationsHint: DecorationWithDiagnostic[];
	decorationRenderBase: typeof decorationRenderOptions;
}

interface TransmuteReturn {
	transmuted: {
		[transmuteId: string]: {
			error: DecorationOptions[];
			warning: DecorationOptions[];
			info: DecorationOptions[];
			hint: DecorationOptions[];
		};
	};
	nonTransmuted: {
		error: DecorationOptions[];
		warning: DecorationOptions[];
		info: DecorationOptions[];
		hint: DecorationOptions[];
	};
}

/**
 * Change decorations according to `"errorLens.transmute"` setting.
 *
 * Return decoration options with matched decorations removed and separately an array of transmuted decorations.
 */
export function transmute({
	decorationsError,
	decorationsWarning,
	decorationsInfo,
	decorationsHint,
	decorationRenderBase,
}: TransmuteArgs): TransmuteReturn {
	const result: TransmuteReturn = {
		nonTransmuted: {
			error: [],
			warning: [],
			info: [],
			hint: [],
		},
		transmuted: initTransmuteObject($config.transmute),
	};

	for (const [severity, decorations] of [
		['error', decorationsError],
		['warning', decorationsWarning],
		['info', decorationsInfo],
		['hint', decorationsHint],
	] as const) {
		for (const decoration of decorations) {
			let matchedTransmuteId: string | undefined;

			for (const transmuteId in $config.transmute) {
				if (targetMatchesProblem($config.transmute[transmuteId], decoration.diagnostic)) {
					matchedTransmuteId = transmuteId;
					break;
				}
			}

			if (matchedTransmuteId === undefined) {
				result.nonTransmuted[severity].push(decoration.options);
			} else {
				const transmuteItem = $config.transmute[matchedTransmuteId];

				result.transmuted[matchedTransmuteId][severity].push({
					range: decoration.options.range,
					renderOptions: {
						...decorationRenderBase[severity],
						...transmuteItem.decoration,
						...decoration.options.renderOptions,
						after: {
							contentText: decoration.options.renderOptions?.after?.contentText,
						},
					},
				});
			}
		}
	}

	return result;
}

function initTransmuteObject(transmuteConfig: ExtensionConfig['transmute']): { [k: string]: { error: never[]; warning: never[]; info: never[]; hint: never[] } } {
	return Object.fromEntries(Object.keys(transmuteConfig).map(key => [key, {
		error: [],
		warning: [],
		info: [],
		hint: [],
	}]));
}

export function doUpdateTransmutedDecorations(transmutedDecorations: TransmuteReturn['transmuted'], editor: TextEditor): void {
	for (const transmuteId in transmutedDecorations) {
		const { error, warning, info, hint } = transmutedDecorations[transmuteId];
		editor.setDecorations(transmutedDecorationTypes[transmuteId].error, error);
		editor.setDecorations(transmutedDecorationTypes[transmuteId].warning, warning);
		editor.setDecorations(transmutedDecorationTypes[transmuteId].info, info);
		editor.setDecorations(transmutedDecorationTypes[transmuteId].hint, hint);
	}
}

export function disposeTransmutedDecorations(): void {
	for (const transmuteItemId in transmutedDecorationTypes) {
		const decorationTypes = transmutedDecorationTypes[transmuteItemId];
		for (const severityString in decorationTypes) {
			// @ts-ignore
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
			decorationTypes[severityString]?.dispose();
		}
	}
}
