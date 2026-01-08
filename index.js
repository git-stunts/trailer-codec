/**
 * @fileoverview Trailer Codec - A robust encoder/decoder for structured metadata in Git commit messages.
 */

export { default as GitCommitMessage } from './src/domain/entities/GitCommitMessage.js';
export { default as GitTrailer } from './src/domain/value-objects/GitTrailer.js';
export { default as TrailerCodecService } from './src/domain/services/TrailerCodecService.js';
export { default as TrailerCodecError } from './src/domain/errors/TrailerCodecError.js';
export { default as ValidationError } from './src/domain/errors/ValidationError.js';
export { createGitTrailerSchemaBundle, TRAILER_KEY_RAW_PATTERN_STRING, TRAILER_KEY_REGEX } from './src/domain/schemas/GitTrailerSchema.js';
export { default as TrailerParser } from './src/domain/services/TrailerParser.js';

export {
  default as TrailerCodec,
  createMessageHelpers,
  decodeMessage,
  encodeMessage,
  formatBodySegment,
} from './src/adapters/FacadeAdapter.js';

export { createConfiguredCodec } from './src/adapters/CodecBuilder.js';
