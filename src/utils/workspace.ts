import { MarkdownView, Workspace } from 'obsidian';
import { SyncPair } from '../types';

export function findSplitViewPair(workspace: Workspace): SyncPair | null {
	const leaves = workspace.getLeavesOfType('markdown');

	if (leaves.length < 2) return null;

	const views: MarkdownView[] = [];
	for (const leaf of leaves) {
		const view = leaf.view;
		if (view instanceof MarkdownView) {
			views.push(view);
		}
	}

	for (let i = 0; i < views.length; i++) {
		for (let j = i + 1; j < views.length; j++) {
			const view1 = views[i];
			const view2 = views[j];

			if (view1 && view2 && areViewsSideBySide(view1, view2)) {
				const rect1 = view1.containerEl.getBoundingClientRect();
				const rect2 = view2.containerEl.getBoundingClientRect();

				if (rect1.left < rect2.left) {
					return {
						leftView: view1,
						rightView: view2,
						leftEditor: view1.editor,
						rightEditor: view2.editor,
					};
				} else {
					return {
						leftView: view2,
						rightView: view1,
						leftEditor: view2.editor,
						rightEditor: view1.editor,
					};
				}
			}
		}
	}

	return null;
}

function areViewsSideBySide(view1: MarkdownView, view2: MarkdownView): boolean {
	const rect1 = view1.containerEl.getBoundingClientRect();
	const rect2 = view2.containerEl.getBoundingClientRect();

	const horizontalOverlap = !(rect1.right < rect2.left || rect2.right < rect1.left);

	return horizontalOverlap && Math.abs(rect1.top - rect2.top) < 100;
}
