# Obsidian SyncScroll Plugin

## Project Overview
- Target: Obsidian Community Plugin (TypeScript → bundled JavaScript)
- Entry: `src/main.ts` → `main.js` (loaded by Obsidian)
- Release artifacts: `main.js`, `manifest.json`, optional `styles.css`

## Build Commands

```bash
npm install              # Install dependencies
npm run dev              # Development build with watch mode
npm run build            # Production build (tsc -noEmit first)
npm run lint             # Run ESLint on all source files
npm run lint -- <file>   # Lint specific file
npm run version          # Bump version and stage manifest changes
```

## TypeScript Config
Strict mode enabled. Key options in `tsconfig.json`:
- `noImplicitAny: true`
- `strictNullChecks: true`
- `noUncheckedIndexedAccess: true`
- `useUnknownInCatchVariables: true`

## Code Style Guidelines

### Imports & Formatting
- Use tabs for indentation (2 spaces)
- Single quotes for strings
- Use named imports from `obsidian`: `import { Plugin, Notice } from "obsidian";`
- Group imports: external → obsidian → local

### Naming Conventions
- Classes: PascalCase (`SampleSettingTab`)
- Interfaces: PascalCase with `I` prefix optional (`MyPluginSettings`)
- Constants: SCREAMING_SNAKE_CASE for config, camelCase for values
- Functions/variables: camelCase
- Command IDs: kebab-case (`open-modal-simple`)

### Types & Null Safety
- Explicit return types for public functions
- Use optional properties (`?`) only when intentional
- Handle null/undefined explicitly; avoid `!` operator
- Use `unknown` in catch variables, narrow before use

### Error Handling
- Wrap async operations in try/catch
- Use `Notice` for user-facing errors
- Log errors to console for debugging
- Never swallow errors silently

### Plugin Patterns
```typescript
export default class MyPlugin extends Plugin {
  settings: MyPluginSettings;

  async onload() {
    await this.loadSettings();
    this.addCommand({...});
    this.addSettingTab(new MySettingTab(this.app, this));
    this.registerDomEvent(...);
    this.registerInterval(...);
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
```

### Module Organization
- Keep `main.ts` minimal (lifecycle only)
- Split into: `settings.ts`, `ui/`, `commands/`, `utils/`
- Each file: single responsibility, ~200 lines max
- Use barrel exports in directories

### Resource Management
- Register all DOM events with `this.registerDomEvent()`
- Register intervals with `this.registerInterval()`
- Register vault events with `this.registerEvent()`
- Cleanup in `onunload()` or via `register()` return values

## Testing
Manual testing only:
1. Run `npm run build`
2. Copy `main.js`, `manifest.json` to vault's `.obsidian/plugins/syncscroll/`
3. Reload Obsidian, enable plugin in Settings → Community plugins

## Release Process
1. Update `version` in `manifest.json` (SemVer)
2. Run `npm run version`
3. Create GitHub release with tag matching version (no `v` prefix)
4. Attach `manifest.json`, `main.js`, `styles.css` (if exists)

## References
- API: https://docs.obsidian.md
- Sample plugin: https://github.com/obsidianmd/obsidian-sample-plugin
- Developer policies: https://docs.obsidian.md/Developer+policies
