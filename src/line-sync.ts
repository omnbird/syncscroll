import { Editor, MarkdownView, Workspace } from 'obsidian';
import { findSplitViewPair } from './utils/workspace';
import type { EditorWithCM } from './types';

export class LineSyncManager {
	private isActive = false;
	private lastSelectionTime = 0;
	private checkInterval: number | null = null;
	private lastLeftSelection: string = '';
	private lastRightSelection: string = '';
	private pauseSyncCallback: (() => void) | null = null;
	private resumeSyncCallback: (() => void) | null = null;
	private workspace: Workspace | null = null;

	start(workspace: Workspace, pauseSync?: () => void, resumeSync?: () => void): void {
		if (this.isActive) return;
		this.isActive = true;
		this.workspace = workspace;
		this.lastLeftSelection = '';
		this.lastRightSelection = '';
		this.pauseSyncCallback = pauseSync || null;
		this.resumeSyncCallback = resumeSync || null;
		this.registerSelectionListener();
	}

	stop(): void {
		this.isActive = false;
		if (this.checkInterval !== null) {
			window.clearInterval(this.checkInterval);
			this.checkInterval = null;
		}
		this.lastLeftSelection = '';
		this.lastRightSelection = '';
		this.pauseSyncCallback = null;
		this.resumeSyncCallback = null;
		this.workspace = null;
	}

	private registerSelectionListener(): void {
		const checkSelection = () => {
			if (!this.isActive || !this.workspace) return;

			const pair = findSplitViewPair(this.workspace);
			if (!pair) return;

			const { leftEditor, rightEditor, leftView, rightView } = pair;

			// 检查左边编辑器的选中
			const leftSelection = leftEditor.getSelection();
			if (leftSelection && leftSelection.trim() !== '') {
				if (leftSelection !== this.lastLeftSelection) {
					this.lastLeftSelection = leftSelection;
					const cursor = leftEditor.getCursor('from');
					const lineContent = leftEditor.getLine(cursor.line);
					const trimmedSelection = leftSelection.trim();
					const trimmedLine = lineContent.trim();

					if (trimmedSelection === trimmedLine && trimmedSelection.length > 0) {
						this.syncLineToRight(leftView, rightEditor, rightView, cursor.line);
					}
				}
			} else {
				this.lastLeftSelection = '';
			}

			// 检查右边编辑器的选中
			const rightSelection = rightEditor.getSelection();
			if (rightSelection && rightSelection.trim() !== '') {
				if (rightSelection !== this.lastRightSelection) {
					this.lastRightSelection = rightSelection;
					const cursor = rightEditor.getCursor('from');
					const lineContent = rightEditor.getLine(cursor.line);
					const trimmedSelection = rightSelection.trim();
					const trimmedLine = lineContent.trim();

					if (trimmedSelection === trimmedLine && trimmedSelection.length > 0) {
						this.syncLineToLeft(leftView, leftEditor, rightView, cursor.line);
					}
				}
			} else {
				this.lastRightSelection = '';
			}
		};

		this.checkInterval = window.setInterval(checkSelection, 150);
	}

	private syncLineToRight(
		leftView: MarkdownView,
		rightEditor: Editor,
		rightView: MarkdownView,
		lineNumber: number
	): void {
		const now = Date.now();
		if (now - this.lastSelectionTime < 300) return;
		this.lastSelectionTime = now;

		const lineCount = rightEditor.lineCount();
		if (lineNumber >= lineCount) {
			lineNumber = lineCount - 1;
		}

		const leftLineScreenY = this.getLineScreenY(leftView, lineNumber);
		if (leftLineScreenY === null) return;

		const rightLineLength = rightEditor.getLine(lineNumber).length;
		const rightCM = (rightEditor as EditorWithCM).cm;
		if (rightCM) {
			rightCM.dispatch({
				selection: { 
					anchor: rightCM.state.doc.line(lineNumber + 1).from, 
					head: rightCM.state.doc.line(lineNumber + 1).to 
				},
				scrollIntoView: false
			});
		} else {
			rightEditor.setSelection(
				{ line: lineNumber, ch: 0 },
				{ line: lineNumber, ch: rightLineLength }
			);
		}

		const rightLineScreenY = this.getLineScreenY(rightView, lineNumber);
		if (rightLineScreenY === null) return;

		const rightScroller = rightView.contentEl.querySelector('.cm-scroller') as HTMLElement;
		if (!rightScroller) return;

		const scrollOffset = rightLineScreenY - leftLineScreenY;

		if (this.pauseSyncCallback) {
			this.pauseSyncCallback();
		}

		rightScroller.scrollTop = rightScroller.scrollTop + scrollOffset;

		if (this.resumeSyncCallback) {
			setTimeout(() => {
				if (this.resumeSyncCallback) {
					this.resumeSyncCallback();
				}
			}, 50);
		}
	}

	private syncLineToLeft(
		leftView: MarkdownView,
		leftEditor: Editor,
		rightView: MarkdownView,
		lineNumber: number
	): void {
		const now = Date.now();
		if (now - this.lastSelectionTime < 300) return;
		this.lastSelectionTime = now;

		const lineCount = leftEditor.lineCount();
		if (lineNumber >= lineCount) {
			lineNumber = lineCount - 1;
		}

		const rightLineScreenY = this.getLineScreenY(rightView, lineNumber);
		if (rightLineScreenY === null) return;

		const leftLineLength = leftEditor.getLine(lineNumber).length;
		const leftCM = (leftEditor as EditorWithCM).cm;
		if (leftCM) {
			leftCM.dispatch({
				selection: { 
					anchor: leftCM.state.doc.line(lineNumber + 1).from, 
					head: leftCM.state.doc.line(lineNumber + 1).to 
				},
				scrollIntoView: false
			});
		} else {
			leftEditor.setSelection(
				{ line: lineNumber, ch: 0 },
				{ line: lineNumber, ch: leftLineLength }
			);
		}

		const leftLineScreenY = this.getLineScreenY(leftView, lineNumber);
		if (leftLineScreenY === null) return;

		const leftScroller = leftView.contentEl.querySelector('.cm-scroller') as HTMLElement;
		if (!leftScroller) return;

		const scrollOffset = leftLineScreenY - rightLineScreenY;

		if (this.pauseSyncCallback) {
			this.pauseSyncCallback();
		}

		leftScroller.scrollTop = leftScroller.scrollTop + scrollOffset;

		if (this.resumeSyncCallback) {
			setTimeout(() => {
				if (this.resumeSyncCallback) {
					this.resumeSyncCallback();
				}
			}, 50);
		}
	}

	private getLineScreenY(view: MarkdownView, lineNumber: number): number | null {
		const scroller = view.contentEl.querySelector('.cm-scroller') as HTMLElement;
		if (!scroller) return null;

		const lineEl = scroller.querySelector(`[data-line="${lineNumber}"]`) as HTMLElement;
		if (lineEl) {
			const rect = lineEl.getBoundingClientRect();
			return rect.top;
		}

		const editor = view.editor as EditorWithCM;
		try {
			const cm = editor.cm;
			if (cm) {
				const line = cm.state.doc.line(lineNumber + 1);
				if (line) {
					const coords = cm.coordsAtPos(line.from);
					if (coords) {
						return coords.top;
					}
				}
			}
		} catch {
			// Ignore errors
		}

		const lines = scroller.querySelectorAll('.cm-line');
		if (lines.length > lineNumber) {
			const line = lines[lineNumber] as HTMLElement;
			const rect = line.getBoundingClientRect();
			return rect.top;
		}

		return null;
	}
}
