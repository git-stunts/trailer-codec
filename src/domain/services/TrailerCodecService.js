import GitCommitMessage from '../entities/GitCommitMessage.js';
import GitTrailer from '../value-objects/GitTrailer.js';
import { getDefaultTrailerSchemaBundle } from '../schemas/GitTrailerSchema.js';
import TrailerParser from './TrailerParser.js';
import MessageNormalizer from './helpers/MessageNormalizer.js';
import { extractTitle } from './helpers/TitleExtractor.js';
import { composeBody } from './helpers/BodyComposer.js';

const defaultTrailerFactory = (key, value, schema) => new GitTrailer(key, value, schema);

/**
 * Core service that decodes and encodes commit messages using the injected helpers.
 * Allows customizing schema/validation, parser behavior, normalizers, and formatter hooks.
 */
export default class TrailerCodecService {
  /**
   * @param {Object} [options]
   * @param {import('../schemas/GitTrailerSchema.js').TrailerSchemaBundle} [options.schemaBundle] - schema, keyPattern, keyRegex.
   * @param {(key:string,value:string,schema:import('zod').ZodSchema) => GitTrailer} [options.trailerFactory]
   * @param {TrailerParser} [options.parser]
   * @param {MessageNormalizer} [options.messageNormalizer]
   * @param {(lines: string[]) => { title: string; nextIndex: number }} [options.titleExtractor]
   * @param {(lines: string[]) => string} [options.bodyComposer]
   * @param {{ titleFormatter?: (value:string)=>string; bodyFormatter?: (value:string)=>string }} [options.formatters]
   */
  constructor({
    schemaBundle = getDefaultTrailerSchemaBundle(),
    trailerFactory = defaultTrailerFactory,
    parser = null,
    messageNormalizer = new MessageNormalizer(),
    titleExtractor = extractTitle,
    bodyComposer = composeBody,
    formatters = {},
  } = {}) {
    this.schemaBundle = this._validateSchemaBundle(schemaBundle);
    this.trailerFactory = trailerFactory;
    this.parser = this._initializeParser(parser, this.schemaBundle.keyPattern);
    this.messageNormalizer = messageNormalizer;
    this.titleExtractor = titleExtractor;
    this.bodyComposer = bodyComposer;
    this.formatters = formatters;
  }

  /**
   * Validates that schemaBundle has required structure.
   * @private
   */
  _validateSchemaBundle(schemaBundle) {
    if (!schemaBundle || typeof schemaBundle !== 'object') {
      throw new TypeError('schemaBundle is required');
    }
    if (!schemaBundle.keyPattern || !schemaBundle.schema) {
      throw new TypeError('schemaBundle must include schema and keyPattern');
    }
    return schemaBundle;
  }

  /**
   * Initializes parser with keyPattern if not provided.
   * @private
   */
  _initializeParser(parser, keyPattern) {
    return parser ?? new TrailerParser({ keyPattern });
  }

  /**
   * Normalizes the raw string, validates trailers, and returns the domain entity.
   * @param {string} message
   * @returns {GitCommitMessage}
   */
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

  /**
   * Serializes a GitCommitMessage entity or raw payload, applying schema validation/formatters.
   * @param {GitCommitMessage|import('../entities/GitCommitMessage.js').GitCommitMessageInput} messageEntity
   * @returns {string}
   */
  encode(messageEntity) {
    if (!messageEntity) {
      throw new TypeError('messageEntity is required');
    }
    const commitMessage =
      messageEntity instanceof GitCommitMessage
        ? messageEntity
        : new GitCommitMessage(messageEntity, {
            trailerSchema: this.schemaBundle.schema,
            formatters: this.formatters,
          });
    return commitMessage.toString();
  }

  /**
   * @private
   * @param {string} message
   * @returns {string[]}
   */
  _prepareLines(message) {
    return this.messageNormalizer.normalizeLines(message);
  }

  /**
   * @private
   * @param {string[]} lines
   */
  _consumeTitle(lines) {
    return this.titleExtractor(lines);
  }

  /**
   * @private
   * @param {string[]} lines
   */
  _composeBody(lines) {
    return this.bodyComposer(lines);
  }

  /**
   * @private
   * @param {string[]} lines
   * @returns {GitTrailer[]}
   */
  _buildTrailers(lines) {
    return lines.reduce((acc, line) => {
      const match = this.parser.lineRegex.exec(line);
      if (match) {
        acc.push(this.trailerFactory(match[1], match[2], this.schemaBundle.schema));
      }
      return acc;
    }, []);
  }

  /**
   * @private
   * @param {string} message
   */
  _guardMessageSize(message) {
    this.messageNormalizer.guardMessageSize(message);
  }
}
