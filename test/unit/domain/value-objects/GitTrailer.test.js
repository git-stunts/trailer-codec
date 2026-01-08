import { describe, it, expect } from 'vitest';
import GitTrailer from '../../../../src/domain/value-objects/GitTrailer.js';
import ValidationError from '../../../../src/domain/errors/ValidationError.js';

describe('GitTrailer', () => {
  it('creates a valid trailer', () => {
    const trailer = new GitTrailer('Signed-off-by', 'James Ross');
    expect(trailer.key).toBe('signed-off-by'); // Normalized
    expect(trailer.value).toBe('James Ross');
  });

  it('normalizes key case', () => {
    const trailer = new GitTrailer('CO-AUTHORED-BY', 'Someone');
    expect(trailer.key).toBe('co-authored-by');
  });

  it('trims value whitespace', () => {
    const trailer = new GitTrailer('key', '  value  ');
    expect(trailer.value).toBe('value');
  });

  it('throws error for invalid key characters', () => {
    expect(() => new GitTrailer('Invalid Key!', 'value')).toThrow(ValidationError);
  });

  it('throws error for empty key', () => {
    expect(() => new GitTrailer('', 'value')).toThrow(ValidationError);
  });

  it('throws error for empty value', () => {
    expect(() => new GitTrailer('key', '')).toThrow(ValidationError); // Assuming schema requires min(1)
  });

  it('exposes CODE_TRAILER_VALUE_INVALID when value includes newline', () => {
    const attempt = () => {
      try {
        new GitTrailer('Key', 'Line\nBreak');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.code).toBe(ValidationError.CODE_TRAILER_VALUE_INVALID);
        throw error;
      }
    };

    expect(attempt).toThrow(ValidationError);
  });

  it('includes documentation link in ValidationError metadata', () => {
    const attempt = () => {
      try {
        new GitTrailer('Key', '');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.meta.docs).toBe('docs/ADVANCED.md#custom-validation-rules');
        expect(/invalid trailer/i.test(error.message)).toBe(true);
        throw error;
      }
    };

    expect(attempt).toThrow(ValidationError);
  });

  it('converts to string correctly', () => {
    const trailer = new GitTrailer('Key', 'Value');
    expect(trailer.toString()).toBe('key: Value');
  });

  it('converts to JSON correctly', () => {
    const trailer = new GitTrailer('Key', 'Value');
    expect(trailer.toJSON()).toEqual({ key: 'key', value: 'Value' });
  });
});
