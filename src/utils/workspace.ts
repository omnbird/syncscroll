import { MarkdownView, Workspace, WorkspaceLeaf } from 'obsidian';
import { SyncPair } from '../types';

export function findSplitViewPair(workspace: Workspace): SyncPair | null {
	// Get the currently active markdown view
	const activeView = workspace.getActiveViewOfType(MarkdownView);
	if (!activeView) return null;

	// Find the split root container that contains the active leaf
	const activeLeafRect = activeView.containerEl.getBoundingClientRect();
	
	// Get all visible markdown leaves
	const allLeaves = workspace.getLeavesOfType('markdown');
	const visibleLeaves: WorkspaceLeaf[] = [];
	
	for (const leaf of allLeaves) {
		const view = leaf.view;
		if (view instanceof MarkdownView && isLeafVisible(leaf)) {
			visibleLeaves.push(leaf);
		}
	}

	if (visibleLeaves.length < 2) return null;

	// Find another visible leaf that is side by side with the active one
	for (const leaf of visibleLeaves) {
		const view = leaf.view as MarkdownView;
		
		// Skip if it's the same as the active view
		if (view === activeView) continue;
		const rect = view.containerEl.getBoundingClientRect();
		
		// Check if they are side by side (horizontal split)
		const horizontalOverlap = !(activeLeafRect.right < rect.left || rect.right < activeLeafRect.left);
		const verticalAligned = Math.abs(activeLeafRect.top - rect.top) < 100;
		
		if (horizontalOverlap && verticalAligned) {
			// Determine left/right
			if (activeLeafRect.left < rect.left) {
				return {
					leftView: activeView,
					rightView: view,
					leftEditor: activeView.editor,
					rightEditor: view.editor,
				};
			} else {
				return {
					leftView: view,
					rightView: activeView,
					leftEditor: view.editor,
					rightEditor: activeView.editor,
				};
			}
		}
	}

	return null;
}

function isLeafVisible(leaf: WorkspaceLeaf): boolean {
	// Check if the leaf is actually visible (not hidden behind other tabs)
	const container = leaf.view.containerEl;
	const rect = container.getBoundingClientRect();
	
	// Check if element has size and is not display:none
	return rect.width > 0 && rect.height > 0 && container.offsetParent !== null;
}
