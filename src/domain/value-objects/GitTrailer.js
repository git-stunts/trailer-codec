import { GitTrailerSchema } from '../schemas/GitTrailerSchema.js';
import ValidationError from '../errors/ValidationError.js';
import { ZodError } from 'zod';

/**
 * Value object representing a Git trailer (key-value pair).
 */
export default class GitTrailer {
  constructor(key, value) {
    try {
      const data = { key, value };
      GitTrailerSchema.parse(data);
      this.key = key.toLowerCase();
      this.value = value.trim();
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationError(`Invalid trailer: ${error.issues.map((i) => i.message).join(', ')}`, { issues: error.issues });
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
