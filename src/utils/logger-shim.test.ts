import { describe, it, expect, vi, afterEach } from 'vitest';
import { logger, createChildLogger, createCorrelatedLogger } from './logger-shim';

describe('logger-shim', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls console.debug', () => {
    const spy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    logger.debug('test debug');
    expect(spy).toHaveBeenCalledWith('[FlowLint]', 'test debug');
  });

  it('calls console.info', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    logger.info('test info');
    expect(spy).toHaveBeenCalledWith('[FlowLint]', 'test info');
  });

  it('calls console.warn', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    logger.warn('test warn');
    expect(spy).toHaveBeenCalledWith('[FlowLint]', 'test warn');
  });

  it('calls console.error', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    logger.error('test error');
    expect(spy).toHaveBeenCalledWith('[FlowLint]', 'test error');
  });

  it('supports child loggers (recursive)', () => {
    const child = logger.child();
    expect(child).toBe(logger);
  });

  it('createChildLogger returns the same logger', () => {
    expect(createChildLogger()).toBe(logger);
  });

  it('createCorrelatedLogger returns the same logger', () => {
    expect(createCorrelatedLogger()).toBe(logger);
  });
});
