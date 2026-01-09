/**
 * Base error class for all Trailer Codec related errors.
 */
export default class TrailerCodecError extends Error {
  /**
   * @param {string} message - Human readable error message.
   * @param {Object} [meta] - Additional metadata context.
   */
  constructor(message, meta = {}) {
    super(message);
    this.name = this.constructor.name;
    this.meta = meta;
    Error.captureStackTrace(this, this.constructor);
  }
}
