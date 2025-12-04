import { logger } from '../utils/logger-shim';

// Content script is currently inactive as we switched to a Clipboard-based approach
// due to strict CSP and Authentication limitations in n8n.
logger.info('[FlowLint] Content Script Loaded (Standby)');
