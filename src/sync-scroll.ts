import { Notice } from 'obsidian';
import { SyncPair, ScrollState } from './types';
import { findSplitViewPair } from './utils/workspace';

export class SyncScrollManager {
	private isActive = false;
	private syncPair: SyncPair | null = null;
	private abortController: AbortController | null = null;
	private leftScroller: HTMLElement | null = null;
	private rightScroller: HTMLElement | null = null;
	private isSyncing = false;
	// 记录两边的百分比偏移量（用于相对同步）
	private percentageOffset: number = 0;

	start(): void {
		if (this.isActive) {
			this.stop();
		}

		this.syncPair = findSplitViewPair();

		if (!this.syncPair) {
			new Notice('未检测到左右分屏，请先将两个文件左右分屏显示');
			return;
		}

		this.isActive = true;
		this.percentageOffset = 0; // 重置偏移量
		this.setupScrollSync();
		new Notice('同步滚动已开启');
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
		new Notice('同步滚动已关闭');
	}

	isRunning(): boolean {
		return this.isActive;
	}

	// 临时暂停同步（用于行同步时）
	pauseSync(): void {
		this.isSyncing = true;
	}

	// 恢复同步，并重新计算偏移量
	resumeSync(): void {
		// 重新计算当前两边的百分比偏移量
		if (this.leftScroller && this.rightScroller) {
			const leftState = this.getScrollState(this.leftScroller);
			const rightState = this.getScrollState(this.rightScroller);
			// 偏移量 = 右边百分比 - 左边百分比
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
		// 应用偏移量：右边的目标百分比 = 左边百分比 + 偏移量
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
		// 应用偏移量：左边的目标百分比 = 右边百分比 - 偏移量
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
		// 限制百分比在 0-1 范围内
		const clampedPercentage = Math.max(0, Math.min(1, state.percentage));
		scroller.scrollTop = clampedPercentage * scrollHeight;
	}
}
