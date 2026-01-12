import TrailerCodecService from '../domain/services/TrailerCodecService.js';
import TrailerParser from '../domain/services/TrailerParser.js';
import { createGitTrailerSchemaBundle } from '../domain/schemas/GitTrailerSchema.js';
import { createMessageHelpers } from './FacadeAdapter.js';
import { validateType } from '../utils/zodValidator.js';

const assertObject = (value, name) => {
  if (value !== undefined && (value === null || typeof value !== 'object')) {
    throw new TypeError(`${name} must be an object when provided`);
  }
};

/**
 * Compose a configured codec that wires schema, parser, service, and helpers.
 *
 * @param {Object} [options]
 * @param {string|RegExp} [options.keyPattern] Pattern or regex for trailer keys.
 * @param {number} [options.keyMaxLength=100] Maximum length for trailer keys.
 * @param {Object} [options.parserOptions] Passed through to `TrailerParser`.
 * @param {Object} [options.formatters] Formatter hooks `{ titleFormatter, bodyFormatter }`.
 * @param {Object} [options.bodyFormatOptions] Forwarded to `formatBodySegment`.
 * @returns {{
 *   service: TrailerCodecService,
 *   helpers: ReturnType<typeof createMessageHelpers>,
 *   decodeMessage: Function,
 *   encodeMessage: Function
 * }}
 *
 * @throws {Error} on schema validation failure (ZodError).
 */
export function createConfiguredCodec(options = {}) {
  const validated = validateType('createConfiguredCodecOptions', options);
  const { keyPattern, keyMaxLength } = validated;
  const { parserOptions, formatters, bodyFormatOptions } = options;
  assertObject(parserOptions, 'parserOptions');
  assertObject(formatters, 'formatters');
  assertObject(bodyFormatOptions, 'bodyFormatOptions');

  const schemaBundle = createGitTrailerSchemaBundle({ keyPattern, keyMaxLength });
  const parser = new TrailerParser({ keyPattern: schemaBundle.keyPattern, ...parserOptions });
  const service = new TrailerCodecService({
    schemaBundle,
    parser,
    formatters,
  });
  const helpers = createMessageHelpers({ service, bodyFormatOptions });
  return {
    service,
    helpers,
    decodeMessage: helpers.decodeMessage,
    encodeMessage: helpers.encodeMessage,
  };
}
