import { describe, expect, it } from 'vitest';
import TrailerCodec from '../../../src/adapters/FacadeAdapter.js';
import TrailerCodecService from '../../../src/domain/services/TrailerCodecService.js';

describe('TrailerCodec', () => {
  it('has both decodeMessage and decode aliases', () => {
    const service = new TrailerCodecService();
    const codec = new TrailerCodec({ service });

    expect(typeof codec.decodeMessage).toBe('function');
    expect(typeof codec.decode).toBe('function');
  });

  it('has both encodeMessage and encode aliases', () => {
    const service = new TrailerCodecService();
    const codec = new TrailerCodec({ service });

    expect(typeof codec.encodeMessage).toBe('function');
    expect(typeof codec.encode).toBe('function');
  });

  it('decode() alias works identically to decodeMessage()', () => {
    const service = new TrailerCodecService();
    const codec = new TrailerCodec({ service });
    const raw = 'Title\n\nBody\n\nKey: Value';

    const result1 = codec.decodeMessage(raw);
    const result2 = codec.decode(raw);

    expect(result1).toEqual(result2);
    expect(result1.title).toBe('Title');
    expect(result1.body).toBe('Body');
    expect(result1.trailers).toEqual({ key: 'Value' });
  });

  it('encode() alias works identically to encodeMessage()', () => {
    const service = new TrailerCodecService();
    const codec = new TrailerCodec({ service });
    const payload = { title: 'Test', body: 'Content', trailers: { foo: 'bar' } };

    const result1 = codec.encodeMessage(payload);
    const result2 = codec.encode(payload);

    expect(result1).toBe(result2);
    expect(result1).toContain('Test');
    expect(result1).toContain('Content');
    expect(result1).toContain('foo: bar');
  });

  it('supports async variants works identically', async () => {
    const service = new TrailerCodecService();
    const codec = new TrailerCodec({ service });
    const raw = 'Title\n\nBody\n\nKey: Value';

    const result1 = await codec.decodeMessageAsync(raw);
    const result2 = await codec.decodeAsync(raw);

    expect(result1).toEqual(result2);
    expect(result1.title).toBe('Title');

    const payload = { title: 'Test', body: 'Content', trailers: { foo: 'bar' } };
    const encoded1 = await codec.encodeMessageAsync(payload);
    const encoded2 = await codec.encodeAsync(payload);

    expect(encoded1).toBe(encoded2);
  });
});
