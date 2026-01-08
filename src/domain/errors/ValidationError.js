import TrailerCodecError from './TrailerCodecError.js';

/**
 * Thrown when domain validation fails (e.g. invalid trailer key).
 */
export default class ValidationError extends TrailerCodecError {
  /**
   * @param {string} message - Validation error message.
   * @param {Object} [meta] - Context about the validation failure (e.g., zod issues).
   */
  constructor(message, meta = {}) {
    super(message, 'VALIDATION_ERROR', meta);
  }
}
