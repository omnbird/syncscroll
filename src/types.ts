import { Editor, MarkdownView } from 'obsidian';



export interface SyncPair {
	leftView: MarkdownView;
	rightView: MarkdownView;
	leftEditor: Editor;
	rightEditor: Editor;
}

export interface ScrollState {
	percentage: number;
}

export interface SyncScrollSettings {
	enabled: boolean;
}

export const DEFAULT_SETTINGS: SyncScrollSettings = {
	enabled: false,
};
