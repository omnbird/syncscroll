import { Plugin } from 'obsidian';
import { SyncScrollManager } from './sync-scroll';
import { LineSyncManager } from './line-sync';
import { SyncScrollSettings, DEFAULT_SETTINGS } from './types';

export default class SyncScrollPlugin extends Plugin {
	settings: SyncScrollSettings;
	private syncScrollManager: SyncScrollManager;
	private lineSyncManager: LineSyncManager;

	async onload() {
		await this.loadSettings();

		this.syncScrollManager = new SyncScrollManager();
		this.lineSyncManager = new LineSyncManager();

		// 开启同步滚动
		this.addCommand({
			id: 'enable-sync-scroll',
			name: '开启同步滚动',
			callback: () => {
				this.syncScrollManager.start();
				// 传入暂停/恢复同步的回调
				this.lineSyncManager.start(
					() => this.syncScrollManager.pauseSync(),
					() => this.syncScrollManager.resumeSync()
				);
			},
		});

		// 关闭同步滚动
		this.addCommand({
			id: 'disable-sync-scroll',
			name: '关闭同步滚动',
			callback: () => {
				this.syncScrollManager.stop();
				this.lineSyncManager.stop();
			},
		});
	}

	onunload() {
		this.syncScrollManager?.stop();
		this.lineSyncManager?.stop();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
