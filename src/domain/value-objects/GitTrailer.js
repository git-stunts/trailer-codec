import { GitTrailerSchema } from '../schemas/GitTrailerSchema.js';
import ValidationError from '../errors/ValidationError.js';
import { ZodError } from 'zod';
const DOCS_CUSTOM_VALIDATION = 'docs/ADVANCED.md#custom-validation-rules';

/**
 * Value object representing a Git trailer (key-value pair).
 */
export default class GitTrailer {
  constructor(key, value, schema = GitTrailerSchema) {
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
        const code = valueIssue
          ? ValidationError.CODE_TRAILER_VALUE_INVALID
          : ValidationError.CODE_TRAILER_INVALID;
        const rawValue = String(value ?? '');
        const truncatedValue =
          rawValue.length > 120 ? `${rawValue.slice(0, 120)}…[truncated]` : rawValue;
        throw new ValidationError(
          `Invalid trailer '${normalizedKey.toLowerCase()}' (value='${truncatedValue}'): ${error.issues
            .map((i) => i.message)
            .join(', ')}. See ${DOCS_CUSTOM_VALIDATION}.`,
          code,
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
