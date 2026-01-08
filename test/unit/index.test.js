import { describe, expect, it, vi } from 'vitest';
import { createMessageHelpers, formatBodySegment } from '../../index.js';

describe('createMessageHelpers', () => {
  it('throws a TypeError for primitive inputs', () => {
    const helpers = createMessageHelpers({
      service: { decode: vi.fn(() => ({})), encode: vi.fn(() => '') },
    });

    expect(() => helpers.decodeMessage(123)).toThrow(TypeError);
  });

  it('throws a TypeError for object inputs', () => {
    const helpers = createMessageHelpers({
      service: { decode: vi.fn(() => ({})), encode: vi.fn(() => '') },
    });

    expect(() => helpers.decodeMessage({ foo: 'bar' })).toThrow(TypeError);
  });

  it('throws a TypeError for objects with message property', () => {
    const service = { decode: vi.fn(() => ({ title: 'ok', body: '', trailers: [] })), encode: vi.fn(() => 'ok') };
    const helpers = createMessageHelpers({ service });

    expect(() => helpers.decodeMessage({ message: 'Title\n\n' })).toThrow(TypeError);
  });

  it('honors body format options for trailing newline', () => {
    const service = { decode: vi.fn(() => ({ title: 'with body', body: 'content', trailers: [] })), encode: vi.fn(() => 'ok') };
    const helpers = createMessageHelpers({ service, bodyFormatOptions: { keepTrailingNewline: true } });
    const output = helpers.decodeMessage('ignored');

    expect(output.body).toBe('content\n');
  });

  it('defaults to trimmed body without newline', () => {
    const helpers = createMessageHelpers({
      service: { decode: vi.fn(() => ({ title: 'ok', body: '   trimmed   ', trailers: [] })), encode: vi.fn(() => '') },
    });
    const output = helpers.decodeMessage('ignored');

    expect(output.body).toBe('trimmed');
  });
});

describe('formatBodySegment', () => {
  it('returns trimmed segments by default', () => {
    expect(formatBodySegment('  hello  ')).toBe('hello');
    expect(formatBodySegment('')).toBe('');
  });

  it('appends newline when requested', () => {
    expect(formatBodySegment('data', { keepTrailingNewline: true })).toBe('data\n');
  });
});
