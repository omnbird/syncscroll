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

		// Enable SyncScroll
		this.addCommand({
			id: 'enable-sync-scroll',
			name: 'Enable',
			callback: () => {
				this.syncScrollManager.start(this.app.workspace);
				// Pass pause/resume sync callbacks
				this.lineSyncManager.start(
					this.app.workspace,
					() => this.syncScrollManager.pauseSync(),
					() => this.syncScrollManager.resumeSync()
				);
			},
		});

		// Disable SyncScroll
		this.addCommand({
			id: 'disable-sync-scroll',
			name: 'Disable',
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
		const loadedData = await this.loadData() as Partial<SyncScrollSettings> | null;
		this.settings = Object.assign({}, DEFAULT_SETTINGS, loadedData ?? {});
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
