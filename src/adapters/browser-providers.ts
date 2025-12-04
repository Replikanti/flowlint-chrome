import type { 
  FileSource, 
  ConfigProvider, 
  Reporter, 
  LintableFile, 
  AnalysisResult
} from '@flowlint/review/providers';
import { defaultConfig, type FlowLintConfig } from '../stubs/flowlint-config';

/**
 * BrowserStringSource
 * Adapts a simple string (e.g. from textarea) to act as a FileSource for the engine.
 */
export class BrowserStringSource implements FileSource {
  constructor(private content: string, private fileName: string = 'workflow.json') {}

  async getFiles(): Promise<LintableFile[]> {
    return [{
      path: this.fileName,
      content: this.content
    }];
  }
}

/**
 * BrowserStaticConfig
 * Provides the default configuration without file system access.
 */
export class BrowserStaticConfig implements ConfigProvider {
  async load(): Promise<FlowLintConfig> {
    return defaultConfig;
  }
}

/**
 * InMemoryReporter
 * Collects results into an array so the UI can display them.
 */
export class InMemoryReporter implements Reporter {
  public results: AnalysisResult[] = [];

  async report(results: AnalysisResult[]): Promise<void> {
    this.results = results;
  }
}
