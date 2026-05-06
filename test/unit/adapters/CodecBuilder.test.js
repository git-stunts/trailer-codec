import { describe, expect, it } from 'vitest';
import { createConfiguredCodec } from '../../../src/adapters/CodecBuilder.js';

describe('createConfiguredCodec', () => {
  it('returns helpers bound to a configured service', async () => {
    const { decodeMessage } = createConfiguredCodec({
      keyPattern: '[A-Z]+',
      keyMaxLength: 10,
    });
    const encoded = 'Title\n\nVALUE: foo';
    const decoded = await decodeMessage(encoded);

    expect(decoded.trailers).toHaveProperty('value', 'foo');
  });

  it('allows parser options overrides', async () => {
    const { encodeMessage } = createConfiguredCodec({
      parserOptions: { keyPattern: '[A-Za-z]+\\b' },
    });

    const output = await encodeMessage({
      title: 'Title',
      trailers: { 'CustomKey': 'ok' },
    });

    expect(output).toContain('customkey: ok');
  });
});
