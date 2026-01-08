import GitCommitMessage from '../entities/GitCommitMessage.js';
import GitTrailer from '../value-objects/GitTrailer.js';
import { getDefaultTrailerSchemaBundle } from '../schemas/GitTrailerSchema.js';
import TrailerParser from './TrailerParser.js';
import MessageNormalizer from './helpers/MessageNormalizer.js';
import TitleExtractor from './helpers/TitleExtractor.js';
import BodyComposer from './helpers/BodyComposer.js';

const defaultTrailerFactory = (key, value, schema) => new GitTrailer(key, value, schema);

export default class TrailerCodecService {
  constructor({
    schemaBundle = getDefaultTrailerSchemaBundle(),
    trailerFactory = defaultTrailerFactory,
    parser = null,
    messageNormalizer = new MessageNormalizer(),
    titleExtractor = new TitleExtractor(),
    bodyComposer = new BodyComposer(),
    formatters = {},
  } = {}) {
    this.schemaBundle = schemaBundle;
    this.trailerFactory = trailerFactory;
    this.parser = parser ?? new TrailerParser({ keyPattern: schemaBundle.keyPattern });
    this.messageNormalizer = messageNormalizer;
    this.titleExtractor = titleExtractor;
    this.bodyComposer = bodyComposer;
    this.formatters = formatters;
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
    const { title, nextIndex } = this._consumeTitle(lines);
    const remainder = lines.slice(nextIndex);
    const { bodyLines, trailerLines } = this.parser.split(remainder);
    const body = this._composeBody(bodyLines);
    const trailers = this._buildTrailers(trailerLines);

    return new GitCommitMessage(
      { title, body, trailers },
      { trailerSchema: this.schemaBundle.schema, formatters: this.formatters }
    );
  }

  encode(messageEntity) {
    if (!(messageEntity instanceof GitCommitMessage)) {
      messageEntity = new GitCommitMessage(messageEntity, {
        trailerSchema: this.schemaBundle.schema,
        formatters: this.formatters,
      });
    }
    return messageEntity.toString();
  }

  _prepareLines(message) {
    return this.messageNormalizer.normalizeLines(message);
  }

  _consumeTitle(lines) {
    return this.titleExtractor.extract(lines);
  }

  _composeBody(lines) {
    return this.bodyComposer.compose(lines);
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
    this.messageNormalizer.guardMessageSize(message);
  }
}
