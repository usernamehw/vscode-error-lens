import { DebouncedFunc, groupBy, throttle } from 'lodash';
import { doUpdateDecorations, shouldExcludeDiagnostic } from 'src/decorations';
import { $config, Global } from 'src/extension';
import { AggregatedByLineDiagnostics } from 'src/types';
import { Diagnostic, DiagnosticChangeEvent, languages, Uri, TextEditor, window } from 'vscode';

/**
 * Try to add delay to new decorations.
 * But old fixed errors should be removed immediately.
 */
export class CacheAndCustomDelay {
	/**
	 * Delay of adding a new decoration
	 */
	private delay!: number;
	/**
	 * Saved diagnostics for each Uri.
	 */
	private cachedDiagnostics: Record<string, AggregatedByLineDiagnostics> = {};
	private updateDecorationsThrottled!: DebouncedFunc<()=> void>;
	private readonly uriStringsToBeUpdated = new Set<string>();

	constructor() {
		this.setDelay(0);
	}

	setDelay(delay: number) {
		this.delay = Math.max(delay, 500);

		this.updateDecorationsThrottled = throttle(this.updateDecorationsQueued, this.delay, {
			leading: delay <= 0,
			trailing: true,
		});
	}

	onDiagnosticChange = (event: DiagnosticChangeEvent) => {
		for (const uri of event.uris) {
			const stringUri = uri.toString();

			this.uriStringsToBeUpdated.add(stringUri);
			this.cachedDiagnostics[stringUri] = this.filterAndGroupByLine(languages.getDiagnostics(uri));
		}
		this.updateDecorationsThrottled();
	};

	enqueueUpdateDecorations = (editor: TextEditor) => {
		this.uriStringsToBeUpdated.add(editor.document.uri.toString());
		this.updateDecorationsThrottled();
	};

	updateDecorationsQueued = () => {
		for (const editor of window.visibleTextEditors) {
			const stringUri = editor.document.uri.toString();
			if (this.uriStringsToBeUpdated.has(stringUri)) {
				this.updateDecorations(editor);
			}
		}
		this.uriStringsToBeUpdated.clear();
	};

	updateDecorationsAllVisibleEditors() {
		for (const editor of window.visibleTextEditors) {
			this.updateDecorations(editor);
		}
		this.uriStringsToBeUpdated.clear();
	}

	updateDecorations(editor: TextEditor) {
		const stringUri = editor.document.uri.toString();

		let diags = this.cachedDiagnostics[stringUri];

		if (!$config.enableOnDiffView && editor.viewColumn === undefined) {
			diags = {};
		}

		for (const pattern of Global.excludePatterns ?? []) {
			if (languages.match(pattern, editor.document) !== 0) {
				diags = {};
			}
		}

		doUpdateDecorations(editor, diags);
		this.uriStringsToBeUpdated.delete(stringUri);
	}


	filterAndGroupByLine(diagnostics: Diagnostic[]): AggregatedByLineDiagnostics {
		return groupBy(diagnostics.filter(diag => !shouldExcludeDiagnostic(diag)), diag => diag.range.start.line);
	}
}
