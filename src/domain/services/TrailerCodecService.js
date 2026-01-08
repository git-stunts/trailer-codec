import GitCommitMessage from '../entities/GitCommitMessage.js';
import GitTrailer from '../value-objects/GitTrailer.js';

/**
 * Domain service for encoding and decoding structured metadata in Git commit messages.
 */
export default class TrailerCodecService {
  /**
   * Decodes a raw message into a GitCommitMessage entity.
   */
  decode(message) {
    if (!message) {return new GitCommitMessage({ title: '', body: '', trailers: [] });}

    const lines = message.replace(/\r\n/g, '\n').split('\n');
    const title = lines.shift() || '';

    // Skip potential empty line after title
    if (lines.length > 0 && lines[0].trim() === '') {
      lines.shift();
    }

    let trailerStart = lines.length;
    // Walk backward to find the trailer block
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim();
      if (line === '') {
        if (trailerStart === lines.length) {continue;}
        break; // Empty line found after a trailer block
      }

      if (/^[A-Za-z0-9_-]+: /.test(line)) {
        trailerStart = i;
      } else {
        break; // Not a trailer
      }
    }

    const bodyLines = lines.slice(0, trailerStart);
    const trailerLines = lines.slice(trailerStart);

    const body = bodyLines.join('\n').trim();
    const trailers = [];

    trailerLines.forEach((line) => {
      const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
      if (match) {
        trailers.push(new GitTrailer(match[1], match[2]));
      }
    });

    return new GitCommitMessage({ title, body, trailers });
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
