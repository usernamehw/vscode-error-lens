import { extUtils } from 'src/utils/extUtils';
import { Range, type TextLine } from 'vscode';

interface GetMarginForAlignmentArgs {
	start: number;
	end: number;
	message: string;
	minimumMargin: number;
	padding: [number, number];
	visualLineLength: number;
}

function getMarginForAlignment({ start, end, message, minimumMargin, padding, visualLineLength }: GetMarginForAlignmentArgs): number {
	let margin = 0;

	if (start) {
		margin = start <= visualLineLength ? 0 : start - visualLineLength;
	} else if (end) {
		const charDiff = end - message.length - visualLineLength - (padding[1] * 2);
		margin = Math.max(0, charDiff);
	}

	return Math.max(minimumMargin, margin);
}

interface AlignmentArgs {
	isMultilineDecoration: boolean;
	alignmentKind: 'fixed' | 'normal';
	textLine: TextLine;
	problemMessage: string;
	indentSize: number;
	indentStyle: 'spaces' | 'tab';
	minVisualLineLength: number;
	minimumMargin: number;
	padding: [number, number];
	start: number;
	end: number;
}

interface AlignmentReturnArg {
	styleStr: string;
	range: Range;
}

export function getStyleForAlignment({
	isMultilineDecoration,
	alignmentKind,
	textLine,
	indentSize,
	indentStyle,
	minVisualLineLength,
	minimumMargin,
	padding,
	problemMessage,
	start,
	end,
}: AlignmentArgs): AlignmentReturnArg {
	let range: Range;
	let styleStr = '';

	const visualLineLength = extUtils.getVisualLineLength(textLine, indentSize, indentStyle);
	let marginChar = minimumMargin + minVisualLineLength - visualLineLength;

	if (isMultilineDecoration) {
		// TODO: implement alignment for multiline decoration
	} else {
		const marginCharAligned = getMarginForAlignment({
			start,
			end,
			visualLineLength,
			message: problemMessage,
			minimumMargin,
			padding,
		});
		marginChar = marginCharAligned;
	}

	if (alignmentKind === 'fixed') {
		range = new Range(
			textLine.range.start,
			textLine.range.start,
		);
		styleStr = `position:fixed;left:${marginChar + visualLineLength}ch;padding:${padding[0]}ch ${padding[1]}ch;margin:0`;
	} else {
		range = new Range(
			textLine.range.start.line,
			textLine.range.end.character,
			textLine.range.start.line,
			textLine.range.end.character,
		);
		styleStr = `margin:0 0 0 ${Math.max(0, marginChar)}ch;padding:${padding[0]}ch ${padding[1]}ch`;
	}

	return {
		range,
		styleStr,
	};
}

