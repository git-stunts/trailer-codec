import { describe, it, expect } from 'vitest';
import TrailerParser from '../../../../src/domain/services/TrailerParser.js';
import TrailerNoSeparatorError from '../../../../src/domain/errors/TrailerNoSeparatorError.js';

describe('TrailerParser', () => {
  const parser = new TrailerParser();

  it('splits body and trailer lines when a blank separator is present', () => {
    const lines = ['Body line', '', 'Signed-off-by: Me', 'Change-Id: 123'];
    const { bodyLines, trailerLines } = parser.split(lines.slice());
    expect(bodyLines).toEqual(['Body line', '']);
    expect(trailerLines).toEqual(['Signed-off-by: Me', 'Change-Id: 123']);
  });

  it('throws when trailers are not separated by a blank line', () => {
    const lines = ['Body line', 'Signed-off-by: Me'];
    expect(() => parser.split(lines)).toThrow(TrailerNoSeparatorError);
  });

  it('returns the full message as body when there are no trailers', () => {
    const lines = ['Body line', 'Another line'];
    const { bodyLines, trailerLines } = parser.split(lines);
    expect(bodyLines).toEqual(lines);
    expect(trailerLines).toHaveLength(0);
  });
});
