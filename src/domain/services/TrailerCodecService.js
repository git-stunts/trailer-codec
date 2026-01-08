import GitCommitMessage from '../entities/GitCommitMessage.js';
import GitTrailer from '../value-objects/GitTrailer.js';
import ValidationError from '../errors/ValidationError.js';
import { getDefaultTrailerSchemaBundle, TRAILER_KEY_PATTERN } from '../schemas/GitTrailerSchema.js';

const MAX_MESSAGE_SIZE = 5 * 1024 * 1024;

export default class TrailerCodecService {
  constructor({
    schemaBundle = getDefaultTrailerSchemaBundle(),
    trailerFactory = (key, value, schema) => new GitTrailer(key, value, schema),
  } = {}) {
    this.schemaBundle = schemaBundle;
    this.trailerFactory = trailerFactory;
  }

  decode(message) {
    if (!message) {
      return new GitCommitMessage({ title: '', body: '', trailers: [] });
    }

    this._guardMessageSize(message);

    const lines = message.replace(/\r\n/g, '\n').split('\n');
    const title = lines.shift() || '';

    if (lines.length > 0 && lines[0].trim() === '') {
      lines.shift();
    }

    const trailerStart = this._findTrailerStartIndex(lines);
    this._validateTrailerSeparation(lines, trailerStart);

    const bodyLines = lines.slice(0, trailerStart);
    const trailerLines = lines.slice(trailerStart);

    const body = this._trimBody(bodyLines);
    const trailers = this._parseTrailerLines(trailerLines);

    return new GitCommitMessage({ title, body, trailers });
  }

  encode(messageEntity) {
    if (!(messageEntity instanceof GitCommitMessage)) {
      messageEntity = new GitCommitMessage(messageEntity, { trailerSchema: this.schemaBundle.schema });
    }
    return messageEntity.toString();
  }

  _guardMessageSize(message) {
    if (message.length > MAX_MESSAGE_SIZE) {
      throw new ValidationError(
        `Message exceeds ${MAX_MESSAGE_SIZE} bytes`,
        { messageLength: message.length, maxSize: MAX_MESSAGE_SIZE }
      );
    }
  }

  _findTrailerStartIndex(lines) {
    let trailerStart = lines.length;
    const trailerLineTest = new RegExp(`^${TRAILER_KEY_PATTERN}: `);

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
        { trailerStart, borderLine }
      );
    }
  }

  _trimBody(lines) {
    let start = 0;
    let end = lines.length;
    while (start < end && lines[start].trim() === '') {
      start++;
    }
    while (end > start && lines[end - 1].trim() === '') {
      end--;
    }
    if (start >= end) {
      return '';
    }
    return lines.slice(start, end).join('\n');
  }

  _parseTrailerLines(lines) {
    const trailerLineRegex = new RegExp(`^(${TRAILER_KEY_PATTERN}):\\s*(.*)$`);
    const trailers = [];
    lines.forEach((line) => {
      const match = line.match(trailerLineRegex);
      if (match) {
        trailers.push(this.trailerFactory(match[1], match[2], this.schemaBundle.schema));
      }
    });
    return trailers;
  }
}
