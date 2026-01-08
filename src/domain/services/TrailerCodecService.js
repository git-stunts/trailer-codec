import GitCommitMessage from '../entities/GitCommitMessage.js';
import GitTrailer from '../value-objects/GitTrailer.js';
import ValidationError from '../errors/ValidationError.js';
import { TRAILER_KEY_REGEX } from '../schemas/GitTrailerSchema.js';

/**
 * Maximum message size (5MB) to prevent DoS attacks via unbounded input.
 */
const MAX_MESSAGE_SIZE = 5 * 1024 * 1024;

/**
 * Domain service for encoding and decoding structured metadata in Git commit messages.
 */
export default class TrailerCodecService {
  /**
   * Decodes a raw Git commit message into a structured GitCommitMessage entity.
   *
   * @param {string} message - The raw commit message to decode
   * @returns {GitCommitMessage} Parsed message with title, body, and trailers
   * @throws {ValidationError} If message exceeds maximum size limit
   *
   * @description
   * Parsing algorithm:
   * 1. Guard against DoS: reject messages > 5MB
   * 2. Extract title (first line)
   * 3. Identify trailer block by walking backward from end
   * 4. Trailer block must be contiguous and contain valid 'Key: Value' patterns
   * 5. Block ends at first empty line or beginning of message
   */
  decode(message) {
    if (!message) {
      return new GitCommitMessage({ title: '', body: '', trailers: [] });
    }

    // Guard against DoS via unbounded input
    if (message.length > MAX_MESSAGE_SIZE) {
      throw new ValidationError(
        `Message size (${message.length} bytes) exceeds maximum allowed size (${MAX_MESSAGE_SIZE} bytes)`,
        { messageLength: message.length, maxSize: MAX_MESSAGE_SIZE }
      );
    }

    const lines = message.replace(/\r\n/g, '\n').split('\n');
    const title = lines.shift() || '';

    // Skip potential empty line after title
    if (lines.length > 0 && lines[0].trim() === '') {
      lines.shift();
    }

    const trailerStart = this._findTrailerStartIndex(lines);
    const bodyLines = lines.slice(0, trailerStart);
    const trailerLines = lines.slice(trailerStart);

    const body = bodyLines.join('\n').trim();
    const trailers = [];

    // Parse trailer lines using consistent regex from schema
    const trailerLineRegex = new RegExp(`^(${TRAILER_KEY_REGEX.source}):\\s*(.*)$`);
    trailerLines.forEach((line) => {
      const match = line.match(trailerLineRegex);
      if (match) {
        trailers.push(new GitTrailer(match[1], match[2]));
      }
    });

    return new GitCommitMessage({ title, body, trailers });
  }

  /**
   * Finds the starting index of the trailer block by walking backward from the end.
   *
   * @private
   * @param {string[]} lines - Array of message lines (excluding title)
   * @returns {number} Index where trailers begin (or lines.length if no trailers found)
   *
   * @description
   * Algorithm:
   * - Iterates backward from the last line
   * - Trailer block must be contiguous (no empty lines within it)
   * - Stops at the first non-trailer line or empty line before trailers
   * - Returns lines.length if no valid trailer block exists
   */
  _findTrailerStartIndex(lines) {
    let trailerStart = lines.length;
    const trailerLineTest = new RegExp(`^${TRAILER_KEY_REGEX.source}: `);

    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim();

      // Skip trailing empty lines
      if (line === '') {
        if (trailerStart === lines.length) {
          continue;
        }
        // Empty line found after trailer block started - end of trailers
        break;
      }

      if (trailerLineTest.test(line)) {
        trailerStart = i;
      } else {
        // Non-trailer line found - stop
        break;
      }
    }

    return trailerStart;
  }

  /**
   * Encodes a GitCommitMessage entity or data into a raw message string.
   */
  encode(messageEntity) {
    if (!(messageEntity instanceof GitCommitMessage)) {
      messageEntity = new GitCommitMessage(messageEntity);
    }
    return messageEntity.toString();
  }
}
