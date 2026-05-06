import { describe, expect, it, vi } from 'vitest';
import { createMessageHelpers, formatBodySegment } from '../../index.js';

describe('createMessageHelpers', () => {
  it('throws a TypeError for primitive inputs', async () => {
    const service = { decode: vi.fn(() => Promise.resolve({})), encode: vi.fn(() => Promise.resolve('')) };
    const helpers = createMessageHelpers({ service });

    await expect(helpers.decodeMessage(123)).rejects.toThrow(TypeError);
    expect(service.decode).not.toHaveBeenCalled();
  });

  it('throws a TypeError for object inputs', async () => {
    const service = { decode: vi.fn(() => Promise.resolve({})), encode: vi.fn(() => Promise.resolve('')) };
    const helpers = createMessageHelpers({ service });

    await expect(helpers.decodeMessage({ foo: 'bar' })).rejects.toThrow(TypeError);
    expect(service.decode).not.toHaveBeenCalled();
    expect(service.encode).not.toHaveBeenCalled();
  });

  it('throws a TypeError for objects with message property', async () => {
    const service = { decode: vi.fn(() => Promise.resolve({ title: 'ok', body: '', trailers: [] })), encode: vi.fn(() => Promise.resolve('ok')) };
    const helpers = createMessageHelpers({ service });

    await expect(helpers.decodeMessage({ message: 'Title\n\n' })).rejects.toThrow(TypeError);
    expect(service.decode).not.toHaveBeenCalled();
  });

  it('honors body format options for trailing newline', async () => {
    const service = { decode: vi.fn(() => Promise.resolve({ title: 'with body', body: 'content', trailers: [] })), encode: vi.fn() };
    const helpers = createMessageHelpers({ service, bodyFormatOptions: { keepTrailingNewline: true } });
    const input = 'ignored';
    const output = await helpers.decodeMessage(input);

    expect(output.body).toBe('content\n');
    expect(service.decode).toHaveBeenCalledWith(input);
    expect(service.encode).not.toHaveBeenCalled();
  });

  it('defaults to trimmed body without newline', async () => {
    const helpers = createMessageHelpers({
      service: { decode: vi.fn(() => Promise.resolve({ title: 'ok', body: '   trimmed   ', trailers: [] })), encode: vi.fn(() => Promise.resolve('')) },
    });
    const output = await helpers.decodeMessage('ignored');

    expect(output.body).toBe('trimmed');
  });

  it('throws if the service returns a null trailers array', async () => {
    const service = { decode: vi.fn(() => Promise.resolve({ title: 'ok', body: '', trailers: null })), encode: vi.fn(() => Promise.resolve('')) };
    const helpers = createMessageHelpers({ service });
    await expect(helpers.decodeMessage('ignored')).rejects.toThrow(TypeError);
  });

  it('throws when duplicate trailer keys are returned', async () => {
    const service = {
      decode: vi.fn(() => Promise.resolve({
        title: 'ok',
        body: '',
        trailers: [
          { key: 'foo', value: '1' },
          { key: 'foo', value: '2' },
        ],
      })),
      encode: vi.fn(() => Promise.resolve('')),
    };
    const helpers = createMessageHelpers({ service });
    await expect(helpers.decodeMessage('ignored')).rejects.toThrow(/Duplicate trailer key/);
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
