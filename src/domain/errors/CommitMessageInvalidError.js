import TrailerCodecError from './TrailerCodecError.js';

/** Error thrown when a commit message payload fails GitCommitMessageSchema validation. */
export default class CommitMessageInvalidError extends TrailerCodecError {
  /**
   * @param {string} message
   * @param {Record<string, unknown>} [meta]
   */
  constructor(message, meta = {}) {
    super(message, meta);
  }
}
