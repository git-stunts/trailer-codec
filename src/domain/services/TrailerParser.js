import { TRAILER_KEY_PATTERN } from '../schemas/GitTrailerSchema.js';
import ValidationError from '../errors/ValidationError.js';

export default class TrailerParser {
  constructor({ keyPattern = TRAILER_KEY_PATTERN } = {}) {
    this._keyPattern = keyPattern;
    this.lineRegex = new RegExp(`^(${keyPattern}):\\s*(.*)$`);
  }

  split(lines) {
    const trailerStart = this._findTrailerStart(lines);
    this._validateTrailerSeparation(lines, trailerStart);
    return {
      trailerStart,
      bodyLines: lines.slice(0, trailerStart),
      trailerLines: lines.slice(trailerStart),
    };
  }

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

  _validateTrailerSeparation(lines, trailerStart) {
    if (trailerStart === lines.length) {
      return;
    }
    const borderLine = trailerStart > 0 ? lines[trailerStart - 1] : '';
    if (borderLine.trim() !== '') {
      throw new ValidationError(
        'Trailers must be separated from the body by a blank line',
        ValidationError.CODE_TRAILER_NO_SEPARATOR,
        { trailerStart, borderLine }
      );
    }
  }
}
