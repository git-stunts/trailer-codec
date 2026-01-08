import GitCommitMessage from '../entities/GitCommitMessage.js';
import GitTrailer from '../value-objects/GitTrailer.js';
import ValidationError from '../errors/ValidationError.js';
import { getDefaultTrailerSchemaBundle } from '../schemas/GitTrailerSchema.js';
import TrailerParser from './TrailerParser.js';

const MAX_MESSAGE_SIZE = 5 * 1024 * 1024;

const defaultTrailerFactory = (key, value, schema) => new GitTrailer(key, value, schema);

export default class TrailerCodecService {
  constructor({
    schemaBundle = getDefaultTrailerSchemaBundle(),
    trailerFactory = defaultTrailerFactory,
    parser = null,
  } = {}) {
    this.schemaBundle = schemaBundle;
    this.trailerFactory = trailerFactory;
    this.parser = parser ?? new TrailerParser({ keyPattern: schemaBundle.keyPattern });
  }

  decode(message) {
    if (!message) {
      return new GitCommitMessage(
        { title: '', body: '', trailers: [] },
        { trailerSchema: this.schemaBundle.schema }
      );
    }

    this._guardMessageSize(message);
    const lines = this._prepareLines(message);
    const title = this._consumeTitle(lines);
    const { bodyLines, trailerLines } = this.parser.split(lines);
    const body = this._composeBody(bodyLines);
    const trailers = this._buildTrailers(trailerLines);

    return new GitCommitMessage(
      { title, body, trailers },
      { trailerSchema: this.schemaBundle.schema }
    );
  }

  encode(messageEntity) {
    if (!(messageEntity instanceof GitCommitMessage)) {
      messageEntity = new GitCommitMessage(messageEntity, { trailerSchema: this.schemaBundle.schema });
    }
    return messageEntity.toString();
  }

  _prepareLines(message) {
    return message.replace(/\r\n/g, '\n').split('\n');
  }

  _consumeTitle(lines) {
    const title = lines.shift() || '';
    if (lines.length > 0 && lines[0].trim() === '') {
      lines.shift();
    }
    return title;
  }

  _composeBody(lines) {
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

  _buildTrailers(lines) {
    return lines.reduce((acc, line) => {
      const match = this.parser.lineRegex.exec(line);
      if (match) {
        acc.push(this.trailerFactory(match[1], match[2], this.schemaBundle.schema));
      }
      return acc;
    }, []);
  }

  _guardMessageSize(message) {
    if (message.length > MAX_MESSAGE_SIZE) {
      throw new ValidationError(
        `Message exceeds ${MAX_MESSAGE_SIZE} bytes`,
        ValidationError.CODE_MESSAGE_TOO_LARGE,
        { messageLength: message.length, maxSize: MAX_MESSAGE_SIZE }
      );
    }
  }
}
