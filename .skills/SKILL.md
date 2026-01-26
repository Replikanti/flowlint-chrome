# FlowLint Chrome Extension Development Skill

## Metadata
- **Name:** flowlint-chrome-dev
- **License:** MIT
- **Compatibility:** Claude Code, Node.js 24+, Chrome

## Description

Chrome extension for real-time n8n workflow linting in the n8n editor. Injects side panel UI and provides instant feedback.

## Capabilities

- **manifest:** Modify extension manifest
- **content-script:** Content script injection
- **ui:** Side panel UI components
- **n8n-integration:** Integration with n8n editor
- **fix-bug:** Fix extension bugs

## Project Structure

```
flowlint-chrome/
├── src/
│   ├── background/      # Service worker
│   ├── content/         # Content scripts
│   ├── sidepanel/       # Side panel UI
│   └── lib/             # Shared code
├── public/              # Static assets
└── manifest.config.ts   # Extension manifest
```

## Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install dependencies |
| `npm run dev` | Build in watch mode |
| `npm run build` | Production build |
| `npm test` | Run tests |

## Tech Stack

- @crxjs/vite-plugin
- Chrome Extension Manifest V3
- React
- flowlint-core

## Testing

1. Load unpacked extension in chrome://extensions
2. Navigate to n8n.io editor
3. Verify side panel appears
4. Test linting functionality

## Related Files

- `CLAUDE.md` - Main project instructions
- `README.md` - Documentation
- `manifest.config.ts` - Extension manifest
