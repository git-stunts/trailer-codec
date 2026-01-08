import TrailerCodecError from './TrailerCodecError.js';

/**
 * Thrown when domain validation fails (e.g. invalid trailer key).
 */
export default class ValidationError extends TrailerCodecError {
  static CODE_DEFAULT = 'VALIDATION_ERROR';
  static CODE_MESSAGE_TOO_LARGE = 'TRAILER_TOO_LARGE';
  static CODE_TRAILER_NO_SEPARATOR = 'TRAILER_NO_SEPARATOR';
  static CODE_TRAILER_INVALID = 'TRAILER_INVALID';
  static CODE_COMMIT_MESSAGE_INVALID = 'COMMIT_MESSAGE_INVALID';
  static CODE_TRAILER_VALUE_INVALID = 'TRAILER_VALUE_INVALID';

  /**
   * @param {string} message - Validation error message.
   * @param {string} [code] - Machine-readable error code.
   * @param {Object} [meta] - Context about the validation failure (e.g., zod issues).
   */
  constructor(message, code = ValidationError.CODE_DEFAULT, meta = {}) {
    super(message, code, meta);
  }
}
