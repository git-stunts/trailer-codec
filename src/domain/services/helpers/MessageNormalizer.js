import TrailerTooLargeError from '../../errors/TrailerTooLargeError.js';

const DEFAULT_MAX_MESSAGE_SIZE = 5 * 1024 * 1024;

const toUtf8Bytes = (input) => {
  if (typeof input === 'string') {
    return Buffer.byteLength(input, 'utf8');
  }
  return Buffer.byteLength(String(input ?? ''), 'utf8');
};

/** Normalizes commit text by guarding size and unifying CRLF to LF. */
export default class MessageNormalizer {
  /**
   * @param {Object} [options]
   * @param {number} [options.maxMessageSize=DEFAULT_MAX_MESSAGE_SIZE] - Max allowed message size in bytes.
   */
  constructor({ maxMessageSize = DEFAULT_MAX_MESSAGE_SIZE } = {}) {
    if (!Number.isFinite(maxMessageSize) || maxMessageSize <= 0) {
      throw new TypeError('maxMessageSize must be a positive number');
    }
    this.maxMessageSize = maxMessageSize;
  }

  /**
   * Throws when the raw message exceeds the configured byte limit.
   * @param {string|unknown} message
   */
  guardMessageSize(message) {
    const messageBytes = toUtf8Bytes(message);
    if (messageBytes > this.maxMessageSize) {
      throw new TrailerTooLargeError(`Message exceeds ${this.maxMessageSize} bytes`, {
        messageByteLength: messageBytes,
        maxSize: this.maxMessageSize,
      });
    }
  }

  /**
   * Normalizes CRLF (`\r\n`) to LF (`\n`) and splits into lines.
   * @param {string|unknown} message
   * @returns {string[]}
   */
  normalizeLines(message) {
    const payload = typeof message === 'string' ? message : String(message ?? '');
    return payload.replace(/\r\n/g, '\n').split('\n');
  }
}
