import { describe, it, expect } from 'vitest';
import GitCommitMessage from '../../../../src/domain/entities/GitCommitMessage.js';
import GitTrailer from '../../../../src/domain/value-objects/GitTrailer.js';
import CommitMessageInvalidError from '../../../../src/domain/errors/CommitMessageInvalidError.js';

describe('GitCommitMessage', () => {
  it('creates a valid commit message', () => {
    const msg = new GitCommitMessage({
      title: 'feat: add feature',
      body: 'This is a description.',
      trailers: [{ key: 'Signed-off-by', value: 'James' }],
    });

    expect(msg.title).toBe('feat: add feature');
    expect(msg.body).toBe('This is a description.');
    expect(msg.trailers).toHaveLength(1);
    expect(msg.trailers[0]).toBeInstanceOf(GitTrailer);
  });

  it('accepts existing GitTrailer instances', () => {
    const trailer = new GitTrailer('key', 'value');
    const msg = new GitCommitMessage({ title: 'Title', trailers: [trailer] });
    expect(msg.trailers[0]).toBe(trailer);
  });

  it('throws on missing title', () => {
    // @ts-ignore
    expect(() => new GitCommitMessage({ body: 'body' })).toThrow(CommitMessageInvalidError);
  });

  it('throws on empty title', () => {
    expect(() => new GitCommitMessage({ title: '' })).toThrow(CommitMessageInvalidError);
  });

  it('formats toString correctly with body and trailers', () => {
    const msg = new GitCommitMessage({
      title: 'Title',
      body: 'Body',
      trailers: [{ key: 'Key', value: 'Value' }],
    });
    
    // Expect:
    // Title
    //
    // Body
    //
    // key: Value
    //
    const expected = 'Title\n\nBody\n\nkey: Value\n';
    expect(msg.toString()).toBe(expected);
  });

  it('formats toString correctly without body', () => {
    const msg = new GitCommitMessage({
      title: 'Title',
      trailers: [{ key: 'Key', value: 'Value' }],
    });
    const expected = 'Title\n\nkey: Value\n';
    expect(msg.toString()).toBe(expected);
  });

  it('formats toString correctly without trailers', () => {
    const msg = new GitCommitMessage({ title: 'Title', body: 'Body' });
    const expected = 'Title\n\nBody\n';
    expect(msg.toString()).toBe(expected);
  });

  it('normalizes trailers key case when adding via constructor', () => {
    const msg = new GitCommitMessage({
      title: 'Title',
      trailers: [{ key: 'UPPER-CASE', value: 'value' }]
    });
    expect(msg.trailers[0].key).toBe('upper-case');
  });

  it('preserves trailer insertion order', () => {
    const msg = new GitCommitMessage({
      title: 'Title',
      trailers: [
        { key: 'First', value: '1' },
        { key: 'Second', value: '2' }
      ]
    });
    expect(msg.trailers[0].key).toBe('first');
    expect(msg.trailers[1].key).toBe('second');
  });
});
