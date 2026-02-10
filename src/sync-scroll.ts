import { Notice, Workspace } from 'obsidian';
import { SyncPair, ScrollState } from './types';
import { findSplitViewPair } from './utils/workspace';

export class SyncScrollManager {
	private isActive = false;
	private syncPair: SyncPair | null = null;
	private abortController: AbortController | null = null;
	private leftScroller: HTMLElement | null = null;
	private rightScroller: HTMLElement | null = null;
	private isSyncing = false;
	private percentageOffset: number = 0;
	private workspace: Workspace | null = null;

	start(workspace: Workspace): void {
		if (this.isActive) {
			this.stop();
		}

		this.workspace = workspace;
		this.syncPair = findSplitViewPair(workspace);

		if (!this.syncPair) {
			new Notice('No split view detected. Please open two files side by side first.');
			return;
		}

		this.isActive = true;
		this.percentageOffset = 0;
		this.setupScrollSync();
		new Notice('SyncScroll enabled');
	}

	stop(): void {
		if (!this.isActive) return;

		this.isActive = false;

		if (this.abortController) {
			this.abortController.abort();
			this.abortController = null;
		}

		this.leftScroller = null;
		this.rightScroller = null;
		this.syncPair = null;
		this.percentageOffset = 0;
		this.workspace = null;
		new Notice('SyncScroll disabled');
	}

	isRunning(): boolean {
		return this.isActive;
	}

	pauseSync(): void {
		this.isSyncing = true;
	}

	resumeSync(): void {
		if (this.leftScroller && this.rightScroller) {
			const leftState = this.getScrollState(this.leftScroller);
			const rightState = this.getScrollState(this.rightScroller);
			this.percentageOffset = rightState.percentage - leftState.percentage;
		}
		this.isSyncing = false;
	}

	private setupScrollSync(): void {
		if (!this.syncPair) return;

		const { leftView, rightView } = this.syncPair;

		this.abortController = new AbortController();
		const signal = this.abortController.signal;

		this.leftScroller = leftView.contentEl.querySelector('.cm-scroller') as HTMLElement;
		this.rightScroller = rightView.contentEl.querySelector('.cm-scroller') as HTMLElement;

		if (this.leftScroller) {
			this.leftScroller.addEventListener('scroll', () => {
				if (!this.isActive || this.isSyncing || !this.syncPair) return;
				this.syncFromLeft();
			}, { signal });
		}

		if (this.rightScroller) {
			this.rightScroller.addEventListener('scroll', () => {
				if (!this.isActive || this.isSyncing || !this.syncPair) return;
				this.syncFromRight();
			}, { signal });
		}
	}

	private syncFromLeft(): void {
		if (!this.syncPair || !this.leftScroller || !this.rightScroller) return;

		this.isSyncing = true;
		const state = this.getScrollState(this.leftScroller);
		const targetState: ScrollState = {
			percentage: state.percentage + this.percentageOffset
		};
		this.applyScrollState(this.rightScroller, targetState);

		requestAnimationFrame(() => {
			this.isSyncing = false;
		});
	}

	private syncFromRight(): void {
		if (!this.syncPair || !this.leftScroller || !this.rightScroller) return;

		this.isSyncing = true;
		const state = this.getScrollState(this.rightScroller);
		const targetState: ScrollState = {
			percentage: state.percentage - this.percentageOffset
		};
		this.applyScrollState(this.leftScroller, targetState);

		requestAnimationFrame(() => {
			this.isSyncing = false;
		});
	}

	private getScrollState(scroller: HTMLElement): ScrollState {
		const scrollTop = scroller.scrollTop;
		const scrollHeight = scroller.scrollHeight - scroller.clientHeight;
		const percentage = scrollHeight > 0 ? scrollTop / scrollHeight : 0;

		return { percentage };
	}

	private applyScrollState(scroller: HTMLElement, state: ScrollState): void {
		const scrollHeight = scroller.scrollHeight - scroller.clientHeight;
		const clampedPercentage = Math.max(0, Math.min(1, state.percentage));
		scroller.scrollTop = clampedPercentage * scrollHeight;
	}
}
