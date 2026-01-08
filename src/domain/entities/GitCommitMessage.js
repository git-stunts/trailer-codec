import { GitCommitMessageSchema } from '../schemas/GitCommitMessageSchema.js';
import GitTrailer from '../value-objects/GitTrailer.js';
import ValidationError from '../errors/ValidationError.js';
import { ZodError } from 'zod';
import { GitTrailerSchema } from '../schemas/GitTrailerSchema.js';

const defaultFormatter = (value) => (value ?? '').toString().trim();

const ensureFormatterIsFunction = (name, formatter) => {
  if (formatter !== undefined && typeof formatter !== 'function') {
    throw new ValidationError(
      `Formatter "${name}" must be a function`,
      ValidationError.CODE_COMMIT_MESSAGE_INVALID,
      { formatterName: name, formatterValue: formatter }
    );
  }
};

/**
 * Domain entity representing a structured Git commit message.
 */
export default class GitCommitMessage {
  constructor(
    { title, body = '', trailers = [] },
    { trailerSchema = GitTrailerSchema, formatters = {} } = {}
  ) {
    try {
      const data = { title, body, trailers };
      GitCommitMessageSchema.parse(data);

      const { titleFormatter = defaultFormatter, bodyFormatter = defaultFormatter } = formatters;
      ensureFormatterIsFunction('titleFormatter', titleFormatter);
      ensureFormatterIsFunction('bodyFormatter', bodyFormatter);

      this.title = titleFormatter(title);
      this.body = bodyFormatter(body);
      this.trailers = trailers.map((t) =>
        t instanceof GitTrailer ? t : new GitTrailer(t.key, t.value, trailerSchema)
      );
    } catch (error) {
      if (error instanceof ZodError) {
      throw new ValidationError(
        `Invalid commit message: ${error.issues.map((i) => i.message).join(', ')}`,
        ValidationError.CODE_COMMIT_MESSAGE_INVALID,
        { issues: error.issues }
      );
      }
      throw error;
    }
  }

  /**
   * Returns the encoded commit message string.
   */
  toString() {
    let message = `${this.title}\n\n`;
    if (this.body) {
      message += `${this.body}\n\n`;
    }

    if (this.trailers.length > 0) {
      message += `${this.trailers.map((t) => t.toString()).join('\n')  }\n`;
    }

    return `${message.trimEnd()  }\n`;
  }

  toJSON() {
    return {
      title: this.title,
      body: this.body,
      trailers: this.trailers.map((t) => t.toJSON()),
    };
  }
}
