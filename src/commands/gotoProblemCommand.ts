import { DiagnosticSeverity, Selection, languages, window, type Diagnostic, type Position, type TextEditor, type TextEditorEdit, type Uri } from 'vscode';

/**
 * Arguments for {@link nextProblemCommand} and {@link prevProblemCommand}
 * (passed via keybinding `args`, no settings).
 *
 * ```json
 * {
 * 	"key": "ctrl+shift+9",
 * 	"command": "errorLens.nextProblem",
 * 	"args": {
 * 		"scope": "file",// "file" | "allFiles"
 * 		"sortOrder": "problemBySeverity",// "problem" | "problemBySeverity"
 * 		"diagnosticSeverity": ["error", "warning"]
 * 	}
 * }
 * ```
 */
export interface GotoProblemArgs {
	/** Search problems in the current file (default) or in all files. */
	scope?: 'file' | 'allFiles';
	/**
	 * Navigation order: document order (default) or errors first, then warnings, info, hints
	 * (each group in document order).
	 */
	sortOrder?: 'problem' | 'problemBySeverity';
	/** Severities to include (default: all). */
	diagnosticSeverity?: ('error' | 'warning' | 'info' | 'hint')[];
}

type SeverityName = 'error' | 'warning' | 'info' | 'hint';

const severityNames: SeverityName[] = ['error', 'warning', 'info', 'hint'];

const severityToName: Record<DiagnosticSeverity, SeverityName> = {
	[DiagnosticSeverity.Error]: 'error',
	[DiagnosticSeverity.Warning]: 'warning',
	[DiagnosticSeverity.Information]: 'info',
	[DiagnosticSeverity.Hint]: 'hint',
};

const severityRank: Record<SeverityName, number> = {
	error: 0,
	warning: 1,
	info: 2,
	hint: 3,
};

interface ProblemEntry {
	uri: Uri;
	diagnostic: Diagnostic;
}

function compareUris(a: Uri, b: Uri): number {
	const aString = a.toString();
	const bString = b.toString();
	return aString < bString ? -1 : aString > bString ? 1 : 0;
}

function comparePositions(a: Position, b: Position): number {
	return a.compareTo(b);
}

/**
 * Compare two problem entries by document position (uris first, then position).
 */
function compareByDocumentOrder(a: ProblemEntry, b: ProblemEntry): number {
	return compareUris(a.uri, b.uri) || comparePositions(a.diagnostic.range.start, b.diagnostic.range.start);
}

/**
 * Compare two problem entries by severity first, then by document position.
 */
function compareBySeverityThenDocumentOrder(a: ProblemEntry, b: ProblemEntry): number {
	return severityRank[severityToName[a.diagnostic.severity]] - severityRank[severityToName[b.diagnostic.severity]] ||
		compareByDocumentOrder(a, b);
}

/**
 * Compare a problem entry with the cursor by document position (uris first, then position).
 */
function compareEntryPositionWithCursor(entry: ProblemEntry, cursor: Position, activeUri: Uri): number {
	const uriComparison = compareUris(entry.uri, activeUri);
	if (uriComparison !== 0) {
		return uriComparison;
	}
	return comparePositions(entry.diagnostic.range.start, cursor);
}

async function revealProblem(entry: ProblemEntry, editor: TextEditor): Promise<void> {
	if (compareUris(entry.uri, editor.document.uri) === 0) {
		editor.selection = new Selection(entry.diagnostic.range.start, entry.diagnostic.range.end);
		editor.revealRange(entry.diagnostic.range);
	} else {
		const openedEditor = await window.showTextDocument(entry.uri);
		openedEditor.selection = new Selection(entry.diagnostic.range.start, entry.diagnostic.range.end);
		openedEditor.revealRange(entry.diagnostic.range);
	}
}

async function gotoProblem(editor: TextEditor, args: GotoProblemArgs | undefined, direction: 1 | -1): Promise<void> {
	const scope = args?.scope === 'allFiles' ? 'allFiles' : 'file';
	const sortOrder = args?.sortOrder === 'problemBySeverity' ? 'problemBySeverity' : 'problem';
	const filteredSeverities = args?.diagnosticSeverity?.filter((s): s is SeverityName => severityNames.includes(s)) ?? [];
	const severities: Set<SeverityName> = filteredSeverities.length === 0 ? new Set(severityNames) : new Set(filteredSeverities);

	let entries: ProblemEntry[] = [];
	if (scope === 'allFiles') {
		for (const [uri, diagnostics] of languages.getDiagnostics()) {
			for (const diagnostic of diagnostics) {
				entries.push({ uri, diagnostic });
			}
		}
	} else {
		entries = languages.getDiagnostics(editor.document.uri).map(diagnostic => ({ uri: editor.document.uri, diagnostic }));
	}

	entries = entries.filter(entry => severities.has(severityToName[entry.diagnostic.severity]));

	if (entries.length === 0) {
		return;
	}

	// The sorted entries form the navigation cycle.
	if (sortOrder === 'problemBySeverity') {
		entries.sort(compareBySeverityThenDocumentOrder);
	} else {
		entries.sort(compareByDocumentOrder);
	}

	const cursor = editor.selection.active;
	const activeUri = editor.document.uri;

	let targetIndex = entries.findIndex(entry => entry.diagnostic.range.contains(cursor));
	if (targetIndex !== -1) {
		// Cursor is on a problem: advance within the cycle (wraps around).
		targetIndex = (targetIndex + direction + entries.length) % entries.length;
	} else if (direction === 1) {
		// Jump to the nearest problem after the cursor, wrapping around.
		targetIndex = entries.findIndex(entry => compareEntryPositionWithCursor(entry, cursor, activeUri) > 0);
		if (targetIndex === -1) {
			targetIndex = 0;
		}
	} else {
		// Jump to the nearest problem before the cursor, wrapping around.
		targetIndex = entries.length - 1;
		for (let i = entries.length - 1; i >= 0; i--) {
			if (compareEntryPositionWithCursor(entries[i], cursor, activeUri) < 0) {
				targetIndex = i;
				break;
			}
		}
	}

	await revealProblem(entries[targetIndex], editor);
}

/**
 * Move cursor to the next problem (wraps around). See {@link GotoProblemArgs} for supported args.
 */
export async function nextProblemCommand(editor: TextEditor, _edit: TextEditorEdit, args?: GotoProblemArgs): Promise<void> {
	await gotoProblem(editor, args, 1);
}

/**
 * Move cursor to the previous problem (wraps around). See {@link GotoProblemArgs} for supported args.
 */
export async function prevProblemCommand(editor: TextEditor, _edit: TextEditorEdit, args?: GotoProblemArgs): Promise<void> {
	await gotoProblem(editor, args, -1);
}
