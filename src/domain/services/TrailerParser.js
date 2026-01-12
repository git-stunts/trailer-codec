import { TRAILER_KEY_RAW_PATTERN_STRING } from '../schemas/GitTrailerSchema.js';
import TrailerNoSeparatorError from '../errors/TrailerNoSeparatorError.js';

/**
 * Parses trailer blocks from a normalized commit-body array.
 * @property {RegExp} lineRegex – compiled regex used to capture `<key>: <value>` per-line.
 */
export default class TrailerParser {
  /**
   * @param {Object} [options]
   * @param {string} [options.keyPattern] – character class used to validate trailer keys (default `TRAILER_KEY_RAW_PATTERN_STRING`).
   */
  constructor({ keyPattern = TRAILER_KEY_RAW_PATTERN_STRING } = {}) {
    /**
     * @private
     * @type {string}
     */
    this._keyPattern = keyPattern;
    /**
     * @type {RegExp}
     */
    this.lineRegex = new RegExp(`^(${keyPattern}):\\s*(.*)$`);
  }

  /**
   * Splits the normalized lines into body lines and trailer lines.
   * @param {string[]} lines – normalized line array (LF-only).
   * @returns {{ trailerStart: number, bodyLines: string[], trailerLines: string[] }}
   * @throws {TrailerNoSeparatorError} when trailers start immediately after a non-blank line.
   */
  split(lines) {
    const trailerStart = this._findTrailerStart(lines);
    this._validateTrailerSeparation(lines, trailerStart);
    return {
      trailerStart,
      bodyLines: lines.slice(0, trailerStart),
      trailerLines: lines.slice(trailerStart),
    };
  }

  /**
   * Walks backward from the end of the message until the trailer block is found.
   * @private
   * @param {string[]} lines
   * @returns {number}
   */
  _findTrailerStart(lines) {
    let trailerStart = lines.length;
    const trailerLineTest = new RegExp(`^${this._keyPattern}: `);

    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim();
      if (line === '') {
        if (trailerStart === lines.length) {
          continue;
        }
        break;
      }
      if (trailerLineTest.test(line)) {
        trailerStart = i;
      } else {
        break;
      }
    }

    return trailerStart;
  }

  /**
   * Ensures there is a blank line separating the body from trailers.
   * @private
   * @param {string[]} lines
   * @param {number} trailerStart
   * @throws {TrailerNoSeparatorError}
   */
  _validateTrailerSeparation(lines, trailerStart) {
    if (trailerStart === lines.length) {
      return;
    }
    const borderLine = trailerStart > 0 ? lines[trailerStart - 1] : '';
    if (borderLine.trim() !== '') {
      throw new TrailerNoSeparatorError('Trailers must be separated from the body by a blank line', {
        trailerStart,
        borderLine,
      });
    }
  }
}
