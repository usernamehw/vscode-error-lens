import { Constants, type ErrorLensSettings } from 'src/types';
import { utils } from 'src/utils/utils';
import { ConfigurationTarget, Range, Selection, StatusBarAlignment, StatusBarItem, TextEditorRevealType, Uri, commands, window, workspace, type TextDocument, type TextEditor } from 'vscode';

/** VSCode span accepts only #fff #fff0 #fffff #ffffff00 var(--vscode...) color formats. */
type ColorFormat = `#${string}` | `var(--vscode-${string}`;
let tempStatusBarItem: StatusBarItem | undefined;

export const vscodeUtils = {
	escapeHtmlAttribute(value: string): string {
		return value
			.replace(/&/gu, '&amp;')
			.replace(/"/gu, '&quot;')
			.replace(/</gu, '&lt;')
			.replace(/>/gu, '&gt;');
	},
	/**
	 * Update global settings.json file with the new setting value.
	 */
	async updateGlobalSetting(settingId: ErrorLensSettings, newValue: unknown): Promise<void> {
		const vscodeConfig = workspace.getConfiguration();
		await vscodeConfig.update(settingId, newValue, ConfigurationTarget.Global);
	},
	/**
	 * Update global settings.json file with the toggled boolean setting.
	 */
	async toggleGlobalBooleanSetting(settingId: ErrorLensSettings): Promise<void> {
		const vscodeConfig = workspace.getConfiguration();
		const settingValue = vscodeConfig.get(settingId);
		if (settingValue === undefined) {
			return;
		}
		await vscodeUtils.updateGlobalSetting(settingId, !settingValue);
	},
	/**
	 * Transform string svg to {@link Uri}
	 */
	svgToUri(svg: string): Uri {
		return Uri.parse(`data:image/svg+xml;utf8,${svg}`);
	},
	/**
	 * Create [Command URI](https://code.visualstudio.com/api/extension-guides/command#command-uris).
	 */
	createCommandUri(commandId: string, args?: unknown): Uri {
		const commandArg = args ? `?${encodeURIComponent(JSON.stringify(args))}` : '';
		return Uri.parse(`command:${commandId}${commandArg}`);
	},
	/**
	 * Open vscode Settings GUI with input value set to the specified value.
	 */
	async  openSettingGuiAt(settingName: string): Promise<void> {
		await commands.executeCommand('workbench.action.openSettings', settingName);
	},
	/**
	 * Create a styled span to use in MarkdownString.
	 *
	 * `editorError.foreground` => `--vscode-editorError-foreground`
	 */
	createStyledMarkdown({
		strMd = '',
		backgroundColor = 'var(--vscode-editorHoverWidget-background)',
		color = 'var(--vscode-editorHoverWidget-foreground)',
	}: {
		strMd?: string;
		backgroundColor?: ColorFormat;
		color?: string;
	}): string {
		const colorStyle = color ? `color:${color};` : '';
		const backgroundStyle = backgroundColor ? `background-color:${backgroundColor};` : '';
		return `<span style="${colorStyle}${backgroundStyle}">${strMd}</span>`;
	},
	createButtonLinkMarkdown({
		text,
		href,
		title = '',
	}: {
		text: string;
		href: string;
		title?: string;
	}): string {
		const buttonText = vscodeUtils.createStyledMarkdown({
			strMd: utils.surround(text, Constants.NonBreakingSpaceSymbolHtml),
			backgroundColor: 'var(--vscode-button-background)',
			color: 'var(--vscode-button-foreground)',
		});

		return `<a title="${vscodeUtils.escapeHtmlAttribute(title)}" href="${vscodeUtils.escapeHtmlAttribute(href)}">${buttonText}</a>`;
	},
	createProblemIconMarkdown(kind: 'error' | 'info' | 'warning'): string {
		const colorClass: ColorFormat = kind === 'error' ?
			'var(--vscode-editorError-foreground)' :
			kind === 'warning' ? 'var(--vscode-editorWarning-foreground)' : 'var(--vscode-editorInfo-foreground)';
		return vscodeUtils.createStyledMarkdown({
			strMd: `$(${kind})`,
			color: colorClass,
		});
	},
	/**
	 * Use `workspace.fs` to read file so it works on the web.
	 */
	async readFileVscode(pathOrUri: Uri | string): Promise<string> {
		try {
			const uri = typeof pathOrUri === 'string' ? Uri.file(pathOrUri) : pathOrUri;
			const file = await workspace.fs.readFile(uri);
			return new TextDecoder().decode(file);
		} catch (e) {
			window.showErrorMessage((e as Error).message);
			return '';
		}
	},
	async openFileInVscode(pathOrUri: Uri | string): Promise<TextEditor> {
		let document: TextDocument;
		if (typeof pathOrUri === 'string') {
			document = await workspace.openTextDocument(pathOrUri);
		} else {
			document = await workspace.openTextDocument(pathOrUri);
		}
		return window.showTextDocument(document);
	},
	revealLine(editor: TextEditor, lineNumber: number): void {
		const range = new Range(lineNumber, 0, lineNumber, 0);
		editor.selection = new Selection(range.start, range.end);
		editor.revealRange(range, TextEditorRevealType.AtTop);
		// Highlight for a short time revealed range
		const lineHighlightDecorationType = window.createTextEditorDecorationType({
			backgroundColor: '#ffa30468',
			isWholeLine: true,
		});
		editor.setDecorations(lineHighlightDecorationType, [range]);
		setTimeout(() => {
			editor.setDecorations(lineHighlightDecorationType, []);
			lineHighlightDecorationType?.dispose();
		}, 700);
	},
	getIndentationAtLine(document: TextDocument, lineNumber: number): string {
		const textLine = document.lineAt(lineNumber);
		return textLine.text.slice(0, textLine.firstNonWhitespaceCharacterIndex);
	},
	setCaretInEditor({ editor, range }: { editor?: TextEditor; range: Range }): void {
		if (!editor) {
			editor = window.activeTextEditor;
		}
		if (editor) {
			editor.selection = new Selection(range.start, range.end);
			editor.revealRange(range);
		}
	},
	/**
	 * Return TextEditor for the provided Uri.
	 */
	getEditorByUri(uri: Uri): TextEditor | undefined {
		for (const editor of window.visibleTextEditors) {
			if (editor.document.uri.toString(true) === uri.toString(true)) {
				return editor;
			}
		}
	},
	isAllowedExternalUri(uri: Uri): boolean {
		return uri.scheme === 'https';
	},
	showTempStatusBarNotification({ message, timeout }: { message: string; timeout: number }): void {
		tempStatusBarItem?.dispose();
		tempStatusBarItem = window.createStatusBarItem(StatusBarAlignment.Left, -100000);
		tempStatusBarItem.text = message;
		tempStatusBarItem.show();

		setTimeout(() => {
			tempStatusBarItem?.hide();
			tempStatusBarItem?.dispose();
		}, timeout);
	},
};
