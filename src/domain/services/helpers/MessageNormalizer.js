import ValidationError from '../../errors/ValidationError.js';

const DEFAULT_MAX_MESSAGE_SIZE = 5 * 1024 * 1024;

export default class MessageNormalizer {
  constructor({ maxMessageSize = DEFAULT_MAX_MESSAGE_SIZE } = {}) {
    this.maxMessageSize = maxMessageSize;
  }

  guardMessageSize(message) {
    if (message.length > this.maxMessageSize) {
      throw new ValidationError(
        `Message exceeds ${this.maxMessageSize} bytes`,
        ValidationError.CODE_MESSAGE_TOO_LARGE,
        { messageLength: message.length, maxSize: this.maxMessageSize }
      );
    }
  }

  normalizeLines(message) {
    return message.replace(/\r\n/g, '\n').split('\n');
  }
}
