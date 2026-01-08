/**
 * @fileoverview Trailer Codec - A robust encoder/decoder for structured metadata in Git commit messages.
 */

import TrailerCodecService from './src/domain/services/TrailerCodecService.js';
import GitCommitMessage from './src/domain/entities/GitCommitMessage.js';
import GitTrailer from './src/domain/value-objects/GitTrailer.js';
import TrailerCodecError from './src/domain/errors/TrailerCodecError.js';
import ValidationError from './src/domain/errors/ValidationError.js';

export {
  GitCommitMessage,
  GitTrailer,
  TrailerCodecService,
  TrailerCodecError,
  ValidationError
};

/**
 * Facade class for the Trailer Codec library.
 * Preserved for backward compatibility.
 */
export default class TrailerCodec {
  constructor() {
    this.service = new TrailerCodecService();
  }

  /**
   * Decodes a raw commit message string into a plain object structure.
   * @param {Object} input
   * @param {string} input.message - The raw commit message.
   * @returns {{ title: string, body: string, trailers: Record<string, string> }}
   */
  decode({ message }) {
    const entity = this.service.decode(message);
    return {
      title: entity.title,
      body: entity.body ? `${entity.body}\n` : '',
      trailers: entity.trailers.reduce((acc, t) => {
        acc[t.key] = t.value;
        return acc;
      }, {}),
    };
  }

  /**
   * Encodes commit message parts into a string.
   * @param {Object} input
   * @param {string} input.title
   * @param {string} [input.body]
   * @param {Record<string, string>} [input.trailers]
   * @returns {string}
   */
  encode({ title, body, trailers = {} }) {
    const trailerArray = Object.entries(trailers).map(([key, value]) => ({ key, value }));
    return this.service.encode({ title, body, trailers: trailerArray });
  }
}