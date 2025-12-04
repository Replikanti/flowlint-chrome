import { defineManifest } from '@crxjs/vite-plugin';
import packageJson from './package.json';

const { version } = packageJson;

// Convert semver to chrome extension version (remove prerelease tags if any)
const [major, minor, patch] = version.replace(/[^\d.]/g, '').split('.');

export default defineManifest(async (env) => ({
  manifest_version: 3,
  name: env.mode === 'staging' ? '[DEV] FlowLint' : 'FlowLint - n8n Workflow Auditor',
  description: 'Static analysis and security check for n8n workflows.',
  version: `${major}.${minor}.${patch}`,
  version_name: version,
  action: {
    default_icon: {
      '16': 'icon-16.png',
      '32': 'icon-32.png',
      '48': 'icon-48.png',
      '128': 'icon-128.png'
    }
  },
  permissions: [
    "storage", 
    "activeTab", 
    "scripting",
    "clipboardRead"
  ],
  icons: {
    '16': 'icon-16.png',
    '32': 'icon-32.png',
    '48': 'icon-48.png',
    '128': 'icon-128.png'
  },
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
  content_scripts: [
    {
      matches: ["<all_urls>"],
      js: ["src/content/overlay.tsx"],
      run_at: "document_idle"
    }
  ],
  web_accessible_resources: [
    {
      resources: ["icon-32.png"],
      matches: ["<all_urls>"]
    }
  ],
  content_security_policy: {
    extension_pages: "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'"
  }
}));
