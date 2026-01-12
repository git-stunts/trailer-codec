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
      GitCommitMessageSchema.parse({ title, body, trailers });

      const { titleFormatter, bodyFormatter } = this._validateFormatters(formatters);

      this.title = titleFormatter(title);
      this.body = bodyFormatter(body);
      this.trailers = this._normalizeTrailers(trailers, trailerSchema);
    } catch (error) {
      throw this._handleConstructorError(error);
    }
  }

  /**
   * Validates and returns formatters with defaults applied.
   * @private
   */
  _validateFormatters(formatters) {
    const { titleFormatter = defaultFormatter, bodyFormatter = defaultFormatter } = formatters;
    ensureFormatterIsFunction('titleFormatter', titleFormatter);
    ensureFormatterIsFunction('bodyFormatter', bodyFormatter);
    return { titleFormatter, bodyFormatter };
  }

  /**
   * Converts trailer-like objects to GitTrailer instances.
   * @private
   */
  _normalizeTrailers(trailers, trailerSchema) {
    return trailers.map((t) =>
      t instanceof GitTrailer ? t : new GitTrailer(t.key, t.value, trailerSchema)
    );
  }

  /**
   * Wraps constructor errors in CommitMessageInvalidError.
   * @private
   */
  _handleConstructorError(error) {
    if (error instanceof ZodError) {
      return new CommitMessageInvalidError(
        `Invalid commit message: ${error.issues.map((i) => i.message).join(', ')}`,
        { issues: error.issues }
      );
    }
    if (error instanceof CommitMessageInvalidError) {
      return error;
    }
    return new CommitMessageInvalidError(
      `Unexpected error during commit message construction: ${error.message}`,
      { originalError: error, errorType: error.constructor.name }
    );
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
