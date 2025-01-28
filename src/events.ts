import debounce from 'lodash/debounce';
import { updateDecorationsForAllVisibleEditors, updateDecorationsForUri } from 'src/decorations';
import { CustomDelay } from 'src/delay/CustomDelay';
import { NewDelay } from 'src/delay/NewDelay';
import { $config, $state } from 'src/extension';
import { updateWorkaroundGutterIcon } from 'src/gutter';
import { extUtils } from 'src/utils/extUtils';
import { TextDocumentSaveReason, debug, languages, window, workspace, type DiagnosticChangeEvent, type Disposable, type Selection } from 'vscode';

let onDidChangeDiagnosticsDisposable: Disposable | undefined;
let onDidChangeActiveTextEditor: Disposable | undefined;
let onDidChangeVisibleTextEditors: Disposable | undefined;
let onDidCursorChangeDisposable: Disposable | undefined;
let onDidChangeBreakpoints: Disposable | undefined;
let onDidChangeTextEditorVisibleRangesDisposable: Disposable | undefined;

let onDidChangeTextDocumentForOnSaveDisposable: Disposable | undefined;
let onDidSaveTextDocumentDisposable: Disposable | undefined;

let newDelay: NewDelay | undefined;

/**
 * Update listener for when active editor changes.
 */
export function updateChangedActiveTextEditorListener(): void {
	onDidChangeActiveTextEditor?.dispose();

	onDidChangeActiveTextEditor = window.onDidChangeActiveTextEditor(editor => {
		$state.log('onDidChangeActiveTextEditor()', editor?.document.uri.toString(true));

		if ($config.onSave && !$config.onSaveUpdateOnActiveEditorChange) {
			return;
		}

		if (editor) {
			updateDecorationsForUri({
				uri: editor.document.uri,
				editor,
			});
		} else {
			$state.statusBarMessage.clear();
		}
	});
}
/**
 * Update listener for when visible editors change.
 */
export function updateChangeVisibleTextEditorsListener(): void {
	onDidChangeVisibleTextEditors?.dispose();

	onDidChangeVisibleTextEditors = window.onDidChangeVisibleTextEditors(updateDecorationsForAllVisibleEditors);
}
function updateChangedUris(diagnosticChangeEvent: DiagnosticChangeEvent): void {
	for (const uri of diagnosticChangeEvent.uris) {
		for (const editor of window.visibleTextEditors) {
			if (uri.toString(true) === editor.document.uri.toString(true)) {
				$state.log('onChangedDiagnostics()');
				updateDecorationsForUri({
					uri,
					editor,
				});
			}
		}
	}
}
/**
 * Update listener for when language server (or extension) sends diagnostic change events.
 */
export function updateChangeDiagnosticListener(): void {
	onDidChangeDiagnosticsDisposable?.dispose();

	function onChangedDiagnostics(diagnosticChangeEvent: DiagnosticChangeEvent): void {
		if ($config.experimental.fixNotebookStaleProblems1) {
			const notebookCellVisible = window.visibleTextEditors.filter(editor => editor.document.uri.scheme === 'vscode-notebook-cell').length !== 0;
			if (notebookCellVisible) {
				updateDecorationsForAllVisibleEditors();
			} else {
				updateChangedUris(diagnosticChangeEvent);
			}
			$state.statusBarIcons.updateText();
			return;
		}
		// ────────────────────────────────────────────────────────────
		updateChangedUris(diagnosticChangeEvent);
		$state.statusBarIcons.updateText();
	}
	if ($config.onSave) {
		// onDidChangeDiagnosticsDisposable = languages.onDidChangeDiagnostics(e => {
		// 	// if (Date.now() - $state.lastSavedTimestamp < $config.onSaveTimeout) {
		// 	// 	onChangedDiagnostics(e);
		// 	// }
		// });
		return;
	}
	if (typeof $config.delay === 'number' && $config.delay > 0) {
		// Delay
		const delayMs = Math.max($config.delay, 500) || 500;
		if ($config.delayMode === 'old') {
			const customDelay = new CustomDelay(delayMs);
			onDidChangeDiagnosticsDisposable = languages.onDidChangeDiagnostics(customDelay.onDiagnosticChange);
		} else if ($config.delayMode === 'debounce') {
			onDidChangeDiagnosticsDisposable = languages.onDidChangeDiagnostics(debounce((e: DiagnosticChangeEvent) => {
				onChangedDiagnostics(e);
			}, delayMs));
		} else if ($config.delayMode === 'new') {
			newDelay?.dispose();
			newDelay = new NewDelay(delayMs);
			onDidChangeDiagnosticsDisposable = languages.onDidChangeDiagnostics(newDelay.onDiagnosticChange);
		}
	} else {
		// No delay
		onDidChangeDiagnosticsDisposable = languages.onDidChangeDiagnostics(onChangedDiagnostics);
	}
}
/**
 * Update listener for when active selection (cursor) moves.
 * (only assign event listener when needed: either render decorations depending on caret OR status bar message depending on caret)
 */
export function updateCursorChangeListener(): void {
	onDidCursorChangeDisposable?.dispose();

	const shouldUpdateEditorDecorations = $config.followCursor === 'activeLine' ||
		$config.followCursor === 'closestProblem' ||
		$config.followCursor === 'allLinesExceptActive' ||
		$config.followCursor === 'closestProblemMultiline';

	if (
		shouldUpdateEditorDecorations ||
		extUtils.shouldShowStatusBarMessage()
	) {
		let lastPositionLine = -1;

		onDidCursorChangeDisposable = window.onDidChangeTextEditorSelection(e => {
			const selection = e.selections[0];

			// Only update on active line change
			if (caretMovedToAnotherLine(e.selections, lastPositionLine)) {
				$state.log('caret moved to another line');
				if (shouldUpdateEditorDecorations) {
					updateDecorationsForUri({
						uri: e.textEditor.document.uri,
						editor: e.textEditor,
						range: selection,
					});
				}
				if (extUtils.shouldShowStatusBarMessage()) {
					$state.statusBarMessage.updateText(
						e.textEditor,
						extUtils.groupDiagnosticsByLine(languages.getDiagnostics(e.textEditor.document.uri)),
					);
				}
				lastPositionLine = e.selections[0].active.line;
			}
			// Update on any cursor movements
			if ($config.statusBarMessageType === 'activeCursor') {
				$state.statusBarMessage.updateText(
					e.textEditor,
					extUtils.groupDiagnosticsByLine(languages.getDiagnostics(e.textEditor.document.uri)),
				);
			}
		});
	}
}
function caretMovedToAnotherLine(selections: readonly Selection[], lastPositionLine: number): boolean {
	return selections.length === 1 &&
		selections[0].isEmpty &&
		lastPositionLine !== selections[0].active.line;
}

export function updateOnVisibleRangesListener(): void {
	onDidChangeTextEditorVisibleRangesDisposable?.dispose();

	if (!$state.shouldUpdateOnEditorScrollEvent) {
		return;
	}

	onDidChangeTextEditorVisibleRangesDisposable = window.onDidChangeTextEditorVisibleRanges(e => {
		$state.log('scrolling');

		updateDecorationsForUri({
			uri: e.textEditor.document.uri,
			editor: e.textEditor,
		});
		// throttle(() => {

		// }, 300, {
		// 	leading: false,
		// });
	});
}
/**
 * Update listener for when user performs manual save.
 *
 * Editor `files.autoSave` is ignored.
 */
export function updateOnSaveListener(): void {
	onDidSaveTextDocumentDisposable?.dispose();
	onDidChangeTextDocumentForOnSaveDisposable?.dispose();

	if (!$config.onSave) {
		return;
	}

	onDidSaveTextDocumentDisposable = workspace.onWillSaveTextDocument(e => {
		$state.log('onWillSaveTextDocument()');

		if (e.reason === TextDocumentSaveReason.Manual) {
			setTimeout(() => {
				updateDecorationsForUri({
					uri: e.document.uri,
				});
			}, 250);
			setTimeout(() => {
				updateDecorationsForUri({
					uri: e.document.uri,
				});
			}, $config.onSaveTimeout);
		}
	});

	onDidChangeTextDocumentForOnSaveDisposable = workspace.onDidChangeTextDocument(e => {
		updateDecorationsForUri({
			uri: e.document.uri,
			groupedDiagnostics: {},
		});
	});
}

export function updateChangeBreakpointsListener(): void {
	onDidChangeBreakpoints?.dispose();

	if (extUtils.shouldShowGutterIcons()) {
		onDidChangeBreakpoints = debug.onDidChangeBreakpoints(() => {
			for (const editor of window.visibleTextEditors) {
				updateWorkaroundGutterIcon(editor);
			}
		});
	}
}

export function disposeAllEventListeners(): void {
	onDidChangeVisibleTextEditors?.dispose();
	onDidChangeDiagnosticsDisposable?.dispose();
	onDidChangeActiveTextEditor?.dispose();
	onDidCursorChangeDisposable?.dispose();
	onDidChangeBreakpoints?.dispose();
	onDidChangeTextEditorVisibleRangesDisposable?.dispose();
	onDidSaveTextDocumentDisposable?.dispose();
	onDidChangeTextDocumentForOnSaveDisposable?.dispose();
	newDelay?.dispose();
}
