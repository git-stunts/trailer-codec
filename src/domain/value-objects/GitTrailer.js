import { GitTrailerSchema } from '../schemas/GitTrailerSchema.js';
import ValidationError from '../errors/ValidationError.js';
import { ZodError } from 'zod';

/**
 * Value object representing a Git trailer (key-value pair).
 */
export default class GitTrailer {
  constructor(key, value, schema = GitTrailerSchema) {
    try {
      const data = { key, value };
      schema.parse(data);
      this.key = key.toLowerCase();
      this.value = value.trim();
    } catch (error) {
      if (error instanceof ZodError) {
        const valueIssue = error.issues.some((issue) => issue.path.includes('value'));
        const code = valueIssue
          ? ValidationError.CODE_TRAILER_VALUE_INVALID
          : ValidationError.CODE_TRAILER_INVALID;
        const normalizedKey = key?.toLowerCase?.() ?? '';
        const rawValue = value ?? '';
        throw new ValidationError(
          `Invalid trailer '${normalizedKey}' (value='${rawValue}'): ${error.issues.map((i) => i.message).join(', ')}. See docs/ADVANCED.md#custom-validation-rules.`,
          code,
          {
            issues: error.issues,
            key: normalizedKey,
            value: rawValue,
            docs: 'docs/ADVANCED.md#custom-validation-rules',
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
