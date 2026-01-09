import { GitCommitMessageSchema } from '../schemas/GitCommitMessageSchema.js';
import GitTrailer from '../value-objects/GitTrailer.js';
import CommitMessageInvalidError from '../errors/CommitMessageInvalidError.js';
import { ZodError } from 'zod';
import { GitTrailerSchema } from '../schemas/GitTrailerSchema.js';

const defaultFormatter = (value) => (value ?? '').toString().trim();

const ensureFormatterIsFunction = (name, formatter) => {
  if (formatter !== undefined && typeof formatter !== 'function') {
    throw new CommitMessageInvalidError(`Formatter "${name}" must be a function`, {
      formatterName: name,
      formatterValue: formatter,
    });
  }
};

/**
 * Domain entity representing a structured Git commit message (title/body/trailers).
 */
export default class GitCommitMessage {
  /**
   * @param {{ title: string; body?: string; trailers?: Array<{ key: string; value: string } | GitTrailer> }} payload
   * @param {{
   *   trailerSchema?: import('../schemas/GitTrailerSchema.js').GitTrailerSchema,
   *   formatters?: { titleFormatter?: (value: string) => string; bodyFormatter?: (value: string) => string }
   * } } [options]
   */
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
      throw new CommitMessageInvalidError(
        `Invalid commit message: ${error.issues.map((i) => i.message).join(', ')}`,
        { issues: error.issues }
      );
      }
      throw error;
    }
  }

  /**
   * Returns the encoded commit message string (title, blank line, body, trailers).
   * @returns {string}
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

  /**
   * @returns {{ title: string; body: string; trailers: Array<{ key: string; value: string }> }}
   */
  toJSON() {
    return {
      title: this.title,
      body: this.body,
      trailers: this.trailers.map((t) => t.toJSON()),
    };
  }
}
