// Stub for flowlint-config to avoid Node/Octokit dependencies in browser

export const defaultConfig = {
  files: {
    include: ['**/*.n8n.json', '**/workflows/*.json', '**/workflows/**/*.json', '**/*.n8n.yaml', '**/*.json'],
    ignore: [
      'samples/**',
      '**/*.spec.json',
      'node_modules/**',
      'package*.json',
      'tsconfig*.json',
      '.flowlint.yml',
      '.github/**',
      '.husky/**',
      '.vscode/**',
      'infra/**',
      '*.config.js',
      '*.config.ts',
      '**/*.lock',
    ],
  },
  report: { annotations: true, summary_limit: 25 },
  rules: {
    rate_limit_retry: {
      enabled: true,
      max_concurrency: 5,
      default_retry: { count: 3, strategy: 'exponential', base_ms: 500 },
    },
    error_handling: { enabled: true, forbid_continue_on_fail: true },
    idempotency: { enabled: true, key_field_candidates: ['eventId', 'messageId'] },
    secrets: { enabled: true, denylist_regex: ['(?i)api[_-]?key', 'Bearer '] },
    dead_ends: { enabled: true },
    long_running: { enabled: true, max_iterations: 1000, timeout_ms: 300000 },
    unused_data: { enabled: true },
    unhandled_error_path: { enabled: true },
    alert_log_enforcement: { enabled: true },
    deprecated_nodes: { enabled: true },
    naming_convention: {
      enabled: true,
      generic_names: ['http request', 'set', 'if', 'merge', 'switch', 'no-op', 'start'],
    },
    config_literals: {
      enabled: true,
      denylist_regex: [
        '(?i)\\b(dev|development)\\b',
        '(?i)\\b(stag|staging)\\b',
        '(?i)\\b(prod|production)\\b',
        '(?i)\\b(test|testing)\\b',
      ],
    },
    webhook_acknowledgment: {
      enabled: true,
      heavy_node_types: [
        'n8n-nodes-base.httpRequest',
        'n8n-nodes-base.postgres',
        'n8n-nodes-base.mysql',
        'n8n-nodes-base.mongodb',
        'n8n-nodes-base.openAi',
        'n8n-nodes-base.anthropic',
        'n8n-nodes-base.huggingFace',
      ],
    },
    retry_after_compliance: {
      enabled: true,
      suggest_exponential_backoff: true,
      suggest_jitter: true,
    },
  },
};

export type FlowLintConfig = typeof defaultConfig;

// Mock function if needed, but we won't use it
export async function loadConfig(): Promise<FlowLintConfig> {
  return defaultConfig;
}
