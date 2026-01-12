import TrailerCodecError from './TrailerCodecError.js';

/** Error raised when trailers are not separated by the required blank line. */
export default class TrailerNoSeparatorError extends TrailerCodecError {
  /**
   * @param {string} message
   * @param {Record<string, unknown>} [meta]
   */
  constructor(message, meta = {}) {
    super(message, meta);
  }
}
