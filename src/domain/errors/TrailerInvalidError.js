import TrailerCodecError from './TrailerCodecError.js';

/** Error raised when a trailer key/value pair violates schema validation. */
export default class TrailerInvalidError extends TrailerCodecError {
  /**
   * @param {string} message
   * @param {Record<string, unknown>} [meta]
   */
  constructor(message, meta = {}) {
    super(message, meta);
  }
}
