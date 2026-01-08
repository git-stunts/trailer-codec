/**
 * @fileoverview Trailer Codec - A robust encoder/decoder for structured metadata in Git commit messages.
 */

import TrailerCodecService from './src/domain/services/TrailerCodecService.js';
import TrailerCodecError from './src/domain/errors/TrailerCodecError.js';
import ValidationError from './src/domain/errors/ValidationError.js';

export { default as GitCommitMessage } from './src/domain/entities/GitCommitMessage.js';
export { default as GitTrailer } from './src/domain/value-objects/GitTrailer.js';
export { default as TrailerCodecService } from './src/domain/services/TrailerCodecService.js';
export { default as TrailerCodecError } from './src/domain/errors/TrailerCodecError.js';
export { default as ValidationError } from './src/domain/errors/ValidationError.js';
export { createGitTrailerSchemaBundle, TRAILER_KEY_PATTERN, TRAILER_KEY_REGEX } from './src/domain/schemas/GitTrailerSchema.js';

/**
 * Facade class for the Trailer Codec library.
 * Preserved for backward compatibility.
 */
const defaultService = new TrailerCodecService();

function normalizeTrailers(entity) {
  return entity.trailers.reduce((acc, trailer) => {
    acc[trailer.key] = trailer.value;
    return acc;
  }, {});
}

function normalizeBody(body) {
  return body ? `${body}\n` : '';
}

export function decodeMessage(input) {
  const message = typeof input === 'string' ? input : input?.message ?? '';
  const entity = defaultService.decode(message);
  return {
    title: entity.title,
    body: normalizeBody(entity.body),
    trailers: normalizeTrailers(entity),
  };
}

export function encodeMessage({ title, body, trailers = {} }) {
  const trailerArray = Object.entries(trailers).map(([key, value]) => ({ key, value }));
  return defaultService.encode({ title, body, trailers: trailerArray });
}

export default class TrailerCodec {
  constructor() {
    this.service = new TrailerCodecService();
  }

  decode(input) {
    const message = typeof input === 'string' ? input : input?.message ?? '';
    const entity = this.service.decode(message);
    return {
      title: entity.title,
      body: normalizeBody(entity.body),
      trailers: normalizeTrailers(entity),
    };
  }

  encode({ title, body, trailers = {} }) {
    return encodeMessage({ title, body, trailers });
  }
}
