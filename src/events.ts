import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
import { clearDecorations, isInlineMessagesLimitedToViewport, updateDecorationsForAllVisibleEditors, updateDecorationsForUri } from 'src/decorations';
import { CustomDelay } from 'src/delay/CustomDelay';
import { NewDelay } from 'src/delay/NewDelay';
import { $config, $state } from 'src/extension';
import { updateWorkaroundGutterIcon } from 'src/gutter';
import { extUtils } from 'src/utils/extUtils';
import { vscodeUtils } from 'src/utils/vscodeUtils';
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

function onChangedDiagnostics(diagnosticChangeEvent: DiagnosticChangeEvent): void {
	const notebookCellVisible = window.visibleTextEditors.filter(editor => editor.document.uri.scheme === 'vscode-notebook-cell').length !== 0;
	if (notebookCellVisible) {
		updateDecorationsForAllVisibleEditors();
		return;
	} else {
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

	$state.statusBarIcons.updateText();
}

/**
 * Update listener for when language server (or extension) sends diagnostic change events.
 */
export function updateChangeDiagnosticListener(): void {
	onDidChangeDiagnosticsDisposable?.dispose();

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
		$config.followCursor === 'allLinesExceptActive';

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

/**
 * Refresh every editor that renders inline messages only for its viewport. Scroll events fire
 * for every scrolled line, so this is throttled; refreshing all of them at once instead of only
 * the scrolled one keeps a busy editor from starving the others.
 */
const updateViewportLimitedEditorsThrottled = throttle(() => {
	for (const editor of window.visibleTextEditors) {
		if (!isInlineMessagesLimitedToViewport(editor.document.uri)) {
			continue;
		}
		updateDecorationsForUri({
			uri: editor.document.uri,
			editor,
			isViewportRefresh: true,
		});
	}
}, 100, {
	leading: true,
	trailing: true,
});
/**
 * Update listener for when editor visible ranges change (scrolling, folding, resizing).
 */
export function updateOnVisibleRangesListener(): void {
	onDidChangeTextEditorVisibleRangesDisposable?.dispose();

	onDidChangeTextEditorVisibleRangesDisposable = window.onDidChangeTextEditorVisibleRanges(e => {
		if (!isInlineMessagesLimitedToViewport(e.textEditor.document.uri)) {
			return;
		}
		updateViewportLimitedEditorsThrottled();
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
				$state.codeLens?.show();
			}, $config.onSaveTimeout);
		}
	});

	onDidChangeTextDocumentForOnSaveDisposable = workspace.onDidChangeTextDocument(e => {
		clearDecorations({ editor: vscodeUtils.getEditorByUri(e.document.uri) });
		$state.codeLens?.hide();
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
	updateViewportLimitedEditorsThrottled.cancel();
	onDidSaveTextDocumentDisposable?.dispose();
	onDidChangeTextDocumentForOnSaveDisposable?.dispose();
	newDelay?.dispose();
}
