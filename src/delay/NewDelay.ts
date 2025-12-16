import debounce from 'lodash/debounce';
import { clearDecorations, updateDecorationsForAllVisibleEditors } from 'src/decorations';
import { $state } from 'src/extension';
import { DiagnosticChangeEvent, Disposable, window, workspace } from 'vscode';

export class NewDelay {
	private readonly updateDecorationsDebounced: ()=> void;
	private readonly documentChangeDisposable: Disposable;

	constructor(delayMs: number) {
		this.updateDecorationsDebounced = debounce(() => {
			updateDecorationsForAllVisibleEditors();
			$state.statusBarIcons.updateText();
			$state.codeLens?.show();
		}, delayMs, {
			leading: false,
			trailing: true,
		});

		this.documentChangeDisposable = workspace.onDidChangeTextDocument(changeEvent => {
			if (changeEvent.document.languageId === 'scminput') {
				return;
			}

			this.clearDecorationsForAllVisibleEditors();
			this.updateDecorationsDebounced();
			$state.codeLens?.hide();
		});
	}

	dispose(): void {
		this.documentChangeDisposable?.dispose();
	}

	onDiagnosticChange = (_: DiagnosticChangeEvent): void => {
		this.updateDecorationsDebounced();
	};

	private clearDecorationsForAllVisibleEditors(): void {
		for (const editor of window.visibleTextEditors) {
			clearDecorations({
				editor,
			});
		}
	}
}
