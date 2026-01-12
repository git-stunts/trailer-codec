import { GitTrailerSchema } from '../schemas/GitTrailerSchema.js';
import TrailerInvalidError from '../errors/TrailerInvalidError.js';
import TrailerValueInvalidError from '../errors/TrailerValueInvalidError.js';
import { ZodError } from 'zod';
const DOCS_CUSTOM_VALIDATION = 'docs/ADVANCED.md#custom-validation-rules';

/**
 * Value object representing a Git trailer (key-value pair).
 * Keys are normalized to lowercase and values trimmed before serialization.
 */
export default class GitTrailer {
  /**
   * @param {string} key - Raw trailer key (e.g., Accepted).
   * @param {string} value - Raw trailer value.
   * @param {import('zod').ZodSchema} [schema=GitTrailerSchema] - Schema validating the pair.
   * @throws {TrailerInvalidError|TrailerValueInvalidError} when the schema rejects the pair.
   */
  constructor(key, value, schema = GitTrailerSchema) {
    const actualSchema = this._validateSchema(schema);
    const rawKey = String(key ?? '');
    const normalizedKey = rawKey.toLowerCase();
    const rawValue = String(value ?? '');
    const normalizedValue = rawValue.trim();

    try {
      actualSchema.parse({ key: rawKey, value: normalizedValue });
      this.key = normalizedKey;
      this.value = normalizedValue;
    } catch (error) {
      throw this._handleValidationError(error, normalizedKey, value);
    }
  }

  /**
   * Validates that schema has required parse method.
   * @private
   */
  _validateSchema(schema) {
    const actualSchema = schema ?? GitTrailerSchema;
    if (!actualSchema || typeof actualSchema.parse !== 'function') {
      throw new TypeError('Invalid schema: missing parse method');
    }
    return actualSchema;
  }

  /**
   * Handles validation errors from Zod parsing.
   * @private
   */
  _handleValidationError(error, normalizedKey, rawValue) {
    if (!(error instanceof ZodError)) {
      return error;
    }

    const valueIssue = error.issues.some((issue) => issue.path.includes('value'));
    const ErrorClass = valueIssue ? TrailerValueInvalidError : TrailerInvalidError;
    const truncatedValue = this._truncateValue(String(rawValue ?? ''));
    const issueMessages = error.issues.map((issue) => issue.message).join(', ');

    return new ErrorClass(
      `Invalid trailer '${normalizedKey.toLowerCase()}' (value='${truncatedValue}'): ${issueMessages}. See ${DOCS_CUSTOM_VALIDATION}.`,
      {
        issues: error.issues,
        key: normalizedKey.toLowerCase(),
        truncatedValue,
        docs: DOCS_CUSTOM_VALIDATION,
      }
    );
  }

  /**
   * Truncates long values for error messages.
   * @private
   */
  _truncateValue(value) {
    return value.length > 120 ? `${value.slice(0, 120)}…[truncated]` : value;
  }

  toString() {
    return `${this.key}: ${this.value}`;
  }

  toJSON() {
    return { key: this.key, value: this.value };
  }
}
