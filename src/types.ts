import { Editor, MarkdownView } from 'obsidian';

// Type definitions for CodeMirror 6 internal API
export interface CMEditor {
	dispatch: (spec: { selection: { anchor: number; head: number }; scrollIntoView: boolean }) => void;
	state: {
		doc: {
			line: (n: number) => { from: number; to: number };
		};
	};
	coordsAtPos: (pos: number) => { top: number; bottom: number } | null;
}

export interface EditorWithCM extends Editor {
	cm?: CMEditor;
}

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
