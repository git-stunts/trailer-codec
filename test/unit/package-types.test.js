import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const currentDir = dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(readFileSync(join(currentDir, '../../package.json'), 'utf8'));
const declarations = readFileSync(join(currentDir, '../../index.d.ts'), 'utf8');

describe('package TypeScript declarations', () => {
  it('publishes root declarations through the package surface', () => {
    expect(packageJson.types).toBe('./index.d.ts');
    expect(packageJson.files).toContain('index.d.ts');
    expect(packageJson.exports['.']).toEqual({
      types: './index.d.ts',
      default: './index.js',
    });
  });

  it('declares the async facade API', () => {
    expect(declarations).toContain('export class TrailerCodec');
    expect(declarations).toContain(
      'decodeMessage(input: string): Promise<TrailerCodecDecodedMessage>'
    );
    expect(declarations).toContain('encodeMessage(payload: TrailerCodecPayload): Promise<string>');
  });
});
