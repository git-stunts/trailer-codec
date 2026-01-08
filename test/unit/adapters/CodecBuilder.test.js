import { describe, expect, it } from 'vitest';
import { createConfiguredCodec } from '../../../src/adapters/CodecBuilder.js';

describe('createConfiguredCodec', () => {
  it('returns helpers bound to a configured service', () => {
    const { decodeMessage } = createConfiguredCodec({
      keyPattern: '[A-Z]+',
      keyMaxLength: 10,
    });
    const encoded = 'Title\n\nVALUE: foo';
    const decoded = decodeMessage(encoded);

    expect(decoded.trailers).toHaveProperty('value', 'foo');
  });

  it('allows parser options overrides', () => {
    const { encodeMessage } = createConfiguredCodec({
      parserOptions: { keyPattern: '[A-Za-z]+\\b' },
    });

    const output = encodeMessage({
      title: 'Title',
      trailers: { 'CustomKey': 'ok' },
    });

    expect(output).toContain('customkey: ok');
  });
});
