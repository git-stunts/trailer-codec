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
  constructor(key, value, schema = GitTrailerSchema) {
    /**
     * @param {string} key - Raw trailer key (e.g., Accepted).
     * @param {string} value - Raw trailer value.
     * @param {import('zod').ZodSchema} [schema=GitTrailerSchema] - Schema validating the pair.
     * @throws {TrailerInvalidError|TrailerValueInvalidError} when the schema rejects the pair.
     */
    const actualSchema = schema ?? GitTrailerSchema;
    if (!actualSchema || typeof actualSchema.parse !== 'function') {
      throw new TypeError('Invalid schema: missing parse method');
    }

    const normalizedKey = String(key ?? '');
    const normalizedValue = String(value ?? '');

    try {
      const data = { key: normalizedKey, value: normalizedValue };
      actualSchema.parse(data);
      this.key = normalizedKey.toLowerCase();
      this.value = normalizedValue.trim();
    } catch (error) {
      if (error instanceof ZodError) {
        const valueIssue = error.issues.some((issue) => issue.path.includes('value'));
        const ErrorClass = valueIssue ? TrailerValueInvalidError : TrailerInvalidError;
        const rawValue = String(value ?? '');
        const truncatedValue =
          rawValue.length > 120 ? `${rawValue.slice(0, 120)}…[truncated]` : rawValue;
        throw new ErrorClass(
          `Invalid trailer '${normalizedKey.toLowerCase()}' (value='${truncatedValue}'): ${error.issues
            .map((issue) => issue.message)
            .join(', ')}. See ${DOCS_CUSTOM_VALIDATION}.`,
          {
            issues: error.issues,
            key: normalizedKey.toLowerCase(),
            truncatedValue,
            docs: DOCS_CUSTOM_VALIDATION,
          }
        );
      }
      throw error;
    }
  }

  toString() {
    return `${this.key}: ${this.value}`;
  }

  toJSON() {
    return { key: this.key, value: this.value };
  }
}
