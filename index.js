/**
 * @fileoverview Trailer Codec - a robust encoder/decoder for structured metadata within Git commit messages.
 *
 * @module @git-stunts/trailer-codec
 * @description Primary entry point re-exporting entities, services, adapters, and helpers so consumers can
 * import exactly the layer they need without reaching into internal paths.
 */

export { default as GitCommitMessage } from './src/domain/entities/GitCommitMessage.js';
export { default as GitTrailer } from './src/domain/value-objects/GitTrailer.js';
export { default as TrailerCodecService } from './src/domain/services/TrailerCodecService.js';
export { default as TrailerCodecError } from './src/domain/errors/TrailerCodecError.js';
export { createGitTrailerSchemaBundle, TRAILER_KEY_RAW_PATTERN_STRING, TRAILER_KEY_REGEX } from './src/domain/schemas/GitTrailerSchema.js';
export { default as TrailerParser } from './src/domain/services/TrailerParser.js';

/**
 * Core facade exports.
 * - `TrailerCodec` provides an instance-based encode/decode facade.
 * - `createMessageHelpers` exposes the underlying helpers for advanced wiring.
 * - `decodeMessage`/`encodeMessage` remain convention-friendly wrappers.
 * - `formatBodySegment` gives direct access to the body formatter.
 */
export {
  default as TrailerCodec,
  createMessageHelpers,
  decodeMessage,
  encodeMessage,
  formatBodySegment,
} from './src/adapters/FacadeAdapter.js';

export { createConfiguredCodec } from './src/adapters/CodecBuilder.js';
