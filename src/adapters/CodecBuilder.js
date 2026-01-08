import TrailerCodecService from '../domain/services/TrailerCodecService.js';
import TrailerParser from '../domain/services/TrailerParser.js';
import { createGitTrailerSchemaBundle } from '../domain/schemas/GitTrailerSchema.js';
import { createMessageHelpers } from './FacadeAdapter.js';

export function createConfiguredCodec({
  keyPattern,
  keyMaxLength,
  parserOptions,
  formatters,
  bodyFormatOptions,
} = {}) {
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
