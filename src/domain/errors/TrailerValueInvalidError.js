import TrailerCodecError from './TrailerCodecError.js';

/** Error raised when a trailer value does not satisfy GitTrailerSchema rules. */
export default class TrailerValueInvalidError extends TrailerCodecError {
  /**
   * @param {string} message
   * @param {Record<string, unknown>} [meta]
   */
  constructor(message, meta = {}) {
    super(message, meta);
  }
}
