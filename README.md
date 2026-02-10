# SyncScroll

Sync scrolling and line jumping between side-by-side panes. Triple-click any line to jump the other pane to the same line with horizontal alignment - perfect for comparing documents or reading translations.

## Features

- **Sync Scrolling**: When you scroll one pane, the other follows with percentage-based synchronization
- **Triple-Click Line Jump**: Triple-click any line to instantly jump the other pane to the same line with horizontal alignment
- **Relative Sync**: After line jumping, the offset is maintained during scrolling - no sudden jumps back
- **Bidirectional**: Works both left→right and right→left

## Installation

### From Obsidian Community Plugins (Recommended)

1. Open Obsidian Settings → Community Plugins
2. Turn off Safe Mode
3. Click "Browse" and search for "SyncScroll"
4. Click Install, then Enable

### Manual Installation

1. Download the latest release from [GitHub Releases](https://github.com/omnbird/syncscroll/releases)
2. Extract `main.js` and `manifest.json` to your vault's `.obsidian/plugins/syncscroll/` folder
3. Enable in Obsidian Settings → Community Plugins

## Usage

1. **Open two files side by side**
   - Drag one tab to the right side of the screen

2. **Enable SyncScroll**
   - Open Command Palette (Ctrl/Cmd + P)
   - Type "SyncScroll: Enable" and press Enter

3. **Triple-click to align**
   - Triple-click any line in the left or right pane
   - The other pane will jump to the same line and align horizontally

4. **Continue scrolling**
   - Scroll either pane - they stay in sync with the maintained offset

5. **Disable when done**
   - Use Command Palette → "SyncScroll: Disable"

## Demo

![Demo GIF Placeholder]
*Triple-click to sync lines, then scroll with maintained offset*

## Support

If you find this plugin helpful, consider buying me a coffee:

☕ [Buy Me a Coffee](https://buymeacoffee.com/amitluu8)

## License

MIT

## Changelog

### 1.0.0
- Initial release
- Sync scrolling with percentage mode
- Triple-click line jumping with horizontal alignment
- Bidirectional support
- Relative offset maintenance
