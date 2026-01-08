import { describe, expect, it, vi } from 'vitest';
import { createMessageHelpers, formatBodySegment } from '../../index.js';

describe('createMessageHelpers', () => {
  it('throws a TypeError for primitive inputs', () => {
    const service = { decode: vi.fn(() => ({})), encode: vi.fn(() => '') };
    const helpers = createMessageHelpers({ service });

    expect(() => helpers.decodeMessage(123)).toThrow(TypeError);
    expect(service.decode).not.toHaveBeenCalled();
  });

  it('throws a TypeError for object inputs', () => {
    const service = { decode: vi.fn(() => ({})), encode: vi.fn(() => '') };
    const helpers = createMessageHelpers({ service });

    expect(() => helpers.decodeMessage({ foo: 'bar' })).toThrow(TypeError);
    expect(service.decode).not.toHaveBeenCalled();
    expect(service.encode).not.toHaveBeenCalled();
  });

  it('throws a TypeError for objects with message property', () => {
    const service = { decode: vi.fn(() => ({ title: 'ok', body: '', trailers: [] })), encode: vi.fn(() => 'ok') };
    const helpers = createMessageHelpers({ service });

    expect(() => helpers.decodeMessage({ message: 'Title\n\n' })).toThrow(TypeError);
    expect(service.decode).not.toHaveBeenCalled();
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

  it('throws if the service returns a null trailers array', () => {
    const service = { decode: vi.fn(() => ({ title: 'ok', body: '', trailers: null })), encode: vi.fn(() => '') };
    const helpers = createMessageHelpers({ service });
    expect(() => helpers.decodeMessage('ignored')).toThrow(TypeError);
  });

  it('throws when duplicate trailer keys are returned', () => {
    const service = {
      decode: vi.fn(() => ({
        title: 'ok',
        body: '',
        trailers: [
          { key: 'foo', value: '1' },
          { key: 'foo', value: '2' },
        ],
      })),
      encode: vi.fn(() => ''),
    };
    const helpers = createMessageHelpers({ service });
    expect(() => helpers.decodeMessage('ignored')).toThrow(/Duplicate trailer key/);
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
