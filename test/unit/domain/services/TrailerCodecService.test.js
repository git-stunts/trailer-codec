import { describe, it, expect } from 'vitest';
import TrailerCodecService from '../../../../src/domain/services/TrailerCodecService.js';
import GitCommitMessage from '../../../../src/domain/entities/GitCommitMessage.js';
import ValidationError from '../../../../src/domain/errors/ValidationError.js';

describe('TrailerCodecService', () => {
  const service = new TrailerCodecService();

  it('decodes a simple message without trailers', () => {
    const raw = 'Simple title\n\nSome body content.';
    const msg = service.decode(raw);
    expect(msg.title).toBe('Simple title');
    expect(msg.body).toBe('Some body content.');
    expect(msg.trailers).toHaveLength(0);
  });

  it('decodes a message with trailers', () => {
    const raw = 'Title\n\nBody.\n\nSigned-off-by: Me\nChange-Id: 123';
    const msg = service.decode(raw);
    expect(msg.title).toBe('Title');
    expect(msg.body).toBe('Body.');
    expect(msg.trailers).toHaveLength(2);
    expect(msg.trailers[0].key).toBe('signed-off-by');
    expect(msg.trailers[0].value).toBe('Me');
    expect(msg.trailers[1].key).toBe('change-id');
    expect(msg.trailers[1].value).toBe('123');
  });

  it('handles messages with only title and trailers', () => {
    const raw = 'Title\n\nKey: Value';
    const msg = service.decode(raw);
    expect(msg.title).toBe('Title');
    expect(msg.body).toBe('');
    expect(msg.trailers).toHaveLength(1);
  });

  it('encodes a GitCommitMessage entity', () => {
    const msg = new GitCommitMessage({
      title: 'Title',
      trailers: [{ key: 'My-Key', value: 'MyValue' }]
    });
    const encoded = service.encode(msg);
    expect(encoded).toContain('Title');
    expect(encoded).toContain('my-key: MyValue');
  });

  it('encodes a plain object by converting it to entity', () => {
    const encoded = service.encode({
      title: 'Direct Object',
      trailers: [{ key: 'Foo', value: 'Bar' }]
    });
    expect(encoded).toContain('Direct Object');
    expect(encoded).toContain('foo: Bar');
  });

  it('handles Windows line endings in decoding', () => {
    const raw = 'Title\r\n\r\nBody\r\n\r\nKey: Value';
    const msg = service.decode(raw);
    expect(msg.title).toBe('Title');
    expect(msg.trailers).toHaveLength(1);
    expect(msg.trailers[0].value).toBe('Value');
  });

  it('rejects trailers without a blank line separator', () => {
    const raw = 'Title\nBody\nSigned-off-by: Me';
    try {
      service.decode(raw);
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.code).toBe(ValidationError.CODE_TRAILER_NO_SEPARATOR);
    }
  });

  it('rejects trailer values containing line breaks', () => {
    try {
      service._buildTrailers(['Key: Value\nInjected']);
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.code).toBe(ValidationError.CODE_TRAILER_VALUE_INVALID);
    }
  });

  it('guards message size in helper', () => {
    const oversize = 'a'.repeat(5 * 1024 * 1024 + 1);
    expect(() => service._guardMessageSize(oversize)).toThrow(ValidationError);
  });

  it('consumes title and blank separator without shifting lines', () => {
    const lines = ['Title', '', 'Body'];
    const { title, nextIndex } = service._consumeTitle(lines);
    expect(title).toBe('Title');
    expect(nextIndex).toBe(2);
    expect(lines).toEqual(['Title', '', 'Body']);
  });

  it('respects formatter hooks when provided', () => {
    const serviceWithFormatters = new TrailerCodecService({
      formatters: {
        titleFormatter: (value) => `(${value})`,
        bodyFormatter: (value) => `[[${value}]]`,
      },
    });
    const raw = 'Title \n\n Body ';
    const msg = serviceWithFormatters.decode(raw);
    expect(msg.title).toBe('(Title )');
    expect(msg.body).toBe('[[ Body ]]');
  });
});
