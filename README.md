# FlowLint Chrome Extension

![Coverage](https://img.shields.io/badge/coverage-91.97%25-brightgreen)

A browser extension for the [n8n](https://n8n.io) workflow editor that provides real-time linting using the FlowLint engine.

## Features

- **Real-time Analysis**: Scans workflows directly in the browser editor.
- **Visual Feedback**: Highlights nodes with issues and provides detailed error messages.
- **Export Options**: Export findings to JSON, CSV, SARIF, or copy to clipboard.
- **Configurable**: Respects `.flowlint.yml` configuration.

## Development

### Prerequisites

- Node.js >= 24.12.0
- npm

### Installation

1. Navigate to the directory:
   ```bash
   cd flowlint-chrome
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Scripts

- `npm run dev`: Start the development server (HMR enabled).
- `npm run build`: Build the extension for production.
- `npm run test`: Run unit tests.
- `npm run test:coverage`: Run tests with coverage report.

## Loading in Chrome

1. Run `npm run build`.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select the `dist` directory.

## Testing

The extension includes unit tests for utility functions and core components.

```bash
npm run test:coverage
```
