/**
 * @fileoverview Trailer Codec - a robust encoder/decoder for structured metadata within Git commit messages.
 *
 * @module @git-stunts/trailer-codec
 * @description Primary entry point re-exporting entities, services, adapters, and helpers so consumers can
 * import exactly the layer they need without reaching into internal paths.
 */

/**
 * Domain entity representing a structured Git commit message.
 * @see {@link ./src/domain/entities/GitCommitMessage.js}
 */
export { default as GitCommitMessage } from './src/domain/entities/GitCommitMessage.js';

/**
 * Value object representing a Git trailer key-value pair.
 * Keys are normalized to lowercase and values are trimmed.
 * @see {@link ./src/domain/value-objects/GitTrailer.js}
 */
export { default as GitTrailer } from './src/domain/value-objects/GitTrailer.js';

/**
 * Core service for encoding and decoding commit messages.
 * Provides customizable validation, parsing, and formatting.
 * @see {@link ./src/domain/services/TrailerCodecService.js}
 */
export { default as TrailerCodecService } from './src/domain/services/TrailerCodecService.js';

/**
 * Base error class for all trailer codec errors.
 * Includes subclasses for specific error types.
 * @see {@link ./src/domain/errors/TrailerCodecError.js}
 */
export { default as TrailerCodecError } from './src/domain/errors/TrailerCodecError.js';

/**
 * Schema factory and constants for trailer validation.
 * - `createGitTrailerSchemaBundle` - Factory for custom validation schemas
 * - `TRAILER_KEY_RAW_PATTERN_STRING` - Default key pattern string
 * - `TRAILER_KEY_REGEX` - Compiled key validation regex
 * @see {@link ./src/domain/schemas/GitTrailerSchema.js}
 */
export { createGitTrailerSchemaBundle, TRAILER_KEY_RAW_PATTERN_STRING, TRAILER_KEY_REGEX } from './src/domain/schemas/GitTrailerSchema.js';

/**
 * Parser service for extracting trailers from commit messages.
 * Uses backward-walk algorithm for efficiency.
 * @see {@link ./src/domain/services/TrailerParser.js}
 */
export { default as TrailerParser } from './src/domain/services/TrailerParser.js';

/**
 * Facade class providing convenient encode/decode methods.
 * Supports both `.decode()`/`.encode()` and `.decodeMessage()`/`.encodeMessage()`.
 * @see {@link ./src/adapters/FacadeAdapter.js}
 */
export { default as TrailerCodec } from './src/adapters/FacadeAdapter.js';

/**
 * Factory for creating message helpers bound to a service.
 * Returns `{ decodeMessage, encodeMessage }` functions.
 * @see {@link ./src/adapters/FacadeAdapter.js}
 */
export { createMessageHelpers } from './src/adapters/FacadeAdapter.js';

/**
 * Convenience function for decoding messages (deprecated).
 * Prefer using `TrailerCodec` instances for most use cases.
 * @deprecated Use TrailerCodec class instead
 * @see {@link ./src/adapters/FacadeAdapter.js}
 */
export { decodeMessage } from './src/adapters/FacadeAdapter.js';
export { encodeMessage } from './src/adapters/FacadeAdapter.js';
export { decodeMessageAsync } from './src/adapters/FacadeAdapter.js';
export { encodeMessageAsync } from './src/adapters/FacadeAdapter.js';

/**
 * Helper for formatting body segments with optional trailing newline.
 * @see {@link ./src/adapters/FacadeAdapter.js}
 */
export { formatBodySegment } from './src/adapters/FacadeAdapter.js';

/**
 * Advanced factory for creating fully configured codecs.
 * Allows customizing key patterns, parsers, formatters, and options.
 * @see {@link ./src/adapters/CodecBuilder.js}
 */
export { createConfiguredCodec } from './src/adapters/CodecBuilder.js';
