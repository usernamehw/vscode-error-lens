import { $config } from 'src/extension';
import { extUtils } from 'src/utils/extUtils';
import { vscodeUtils } from 'src/utils/vscodeUtils';
import { Uri, env, window, type Diagnostic } from 'vscode';

/**
 * When arg = undefined => it was called from Command Palette.
 */
export function searchForProblemCommand(diagnostic: Diagnostic | undefined): void {
	if (!diagnostic) {
		const editor = window.activeTextEditor;
		if (!editor) {
			return;
		}

		const diagnosticAtActiveLine = extUtils.getDiagnosticAtLine(editor.document.uri, editor.selection.active.line);
		if (!diagnosticAtActiveLine) {
			return;
		}
		// eslint-disable-next-line no-param-reassign
		diagnostic = diagnosticAtActiveLine;
	}

	const query = getSearchForProblemUri(diagnostic);
	if (!query) {
		void window.showWarningMessage('Search target must resolve to an https URL.');
		return;
	}
	env.openExternal(query);
}

export function getSearchForProblemUri(diagnostic: Diagnostic): Uri | undefined {
	const queryTemplate = $config.searchForProblemQuery;
	const safeQuery = replaceUrlTemplateVariables(queryTemplate, diagnostic);

	let queryUrl: URL;
	try {
		queryUrl = new URL(safeQuery);
	} catch {
		return undefined;
	}

	const queryUri = Uri.parse(queryUrl.toString());
	return vscodeUtils.isAllowedExternalUri(queryUri) ? queryUri : undefined;
}

function replaceUrlTemplateVariables(template: string, diagnostic: Diagnostic): string {
	const templateValues = new Map<string, string>([
		['$message', extUtils.diagnosticToInlineMessage('$message', diagnostic, 0)],
		['$source', diagnostic.source ?? ''],
		['$code', extUtils.getDiagnosticCode(diagnostic) ?? ''],
		['$count', ''],
		['$severity', $config.severityText[diagnostic.severity] ?? ''],
		['$lineStart', String(diagnostic.range.start.line + 1)],
		['$lineEnd', String(diagnostic.range.end.line + 1)],
	]);

	let resolvedTemplate = template;
	for (const [token, value] of templateValues) {
		resolvedTemplate = resolvedTemplate.replaceAll(token, encodeURIComponent(value));
	}

	return resolvedTemplate;
}
