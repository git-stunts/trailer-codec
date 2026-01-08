/**
 * Base error class for all Trailer Codec related errors.
 */
export default class TrailerCodecError extends Error {
  /**
   * @param {string} message - Human readable error message.
   * @param {string} code - Machine readable error code.
   * @param {Object} [meta] - Additional metadata context.
   */
  constructor(message, code, meta = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.meta = meta;
    Error.captureStackTrace(this, this.constructor);
  }
}
