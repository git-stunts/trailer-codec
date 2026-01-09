import TrailerCodecError from './TrailerCodecError.js';

/** Error raised when a message exceeds the configured byte limit. */
export default class TrailerTooLargeError extends TrailerCodecError {
  /**
   * @param {string} message
   * @param {Record<string, unknown>} [meta]
   */
  constructor(message, meta = {}) {
    super(message, meta);
  }
}
