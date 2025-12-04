// Shim for the backend logger to run in the browser
// Consumed by shared packages via Vite alias

const consoleLogger = {
  debug: (...args: any[]) => console.debug('[FlowLint]', ...args),
  info: (...args: any[]) => console.info('[FlowLint]', ...args),
  warn: (...args: any[]) => console.warn('[FlowLint]', ...args),
  error: (...args: any[]) => console.error('[FlowLint]', ...args),
  child: () => consoleLogger, // recursive for child loggers
};

export const logger = consoleLogger;

export function createChildLogger() {
  return consoleLogger;
}

export function createCorrelatedLogger() {
  return consoleLogger;
}