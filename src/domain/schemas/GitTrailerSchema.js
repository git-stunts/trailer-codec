import { z } from 'zod';

const DEFAULT_KEY_PATTERN = '[A-Za-z0-9_\\-]+';
const MAX_PATTERN_LENGTH = 256;
const MAX_QUANTIFIERS = 16;

const buildKeyRegex = (keyPattern) => {
  if (keyPattern.length > MAX_PATTERN_LENGTH) {
    throw new RangeError(`keyPattern exceeds max length of ${MAX_PATTERN_LENGTH}`);
  }
  const quantifierCount = (keyPattern.match(/(\*|\+|\{)/g) ?? []).length;
  if (quantifierCount > MAX_QUANTIFIERS) {
    throw new Error('keyPattern uses too many quantifiers and may be vulnerable to ReDoS');
  }

  try {
    return new RegExp(`^${keyPattern}$`);
  } catch (error) {
    throw new TypeError(`Invalid regex pattern: ${error.message}`);
  }
};

/**
 * Creates a Git trailer schema bundle with customizable validation rules.
 * @param {Object} options - Configuration options
 * @param {string} options.keyPattern - Regex pattern string for key validation (will be anchored)
 * @param {number} options.keyMaxLength - Maximum length for trailer keys
 * @returns {{ schema: z.ZodObject, keyPattern: string, keyRegex: RegExp }}
 */
export function createGitTrailerSchemaBundle({ keyPattern = DEFAULT_KEY_PATTERN, keyMaxLength = 100 } = {}) {
  if (typeof keyPattern !== 'string' || keyPattern.length === 0) {
    throw new TypeError('keyPattern must be a non-empty string');
  }
  if (!Number.isInteger(keyMaxLength) || keyMaxLength <= 0) {
    throw new TypeError('keyMaxLength must be a positive integer');
  }
  const keyRegex = buildKeyRegex(keyPattern);
  return {
    schema: z.object({
      key: z
        .string()
        .min(1)
        .max(keyMaxLength, 'Trailer key must not exceed character limit')
      .regex(keyRegex, 'Trailer key must be alphanumeric or contain hyphens/underscores'),
      value: z
        .string()
        .min(1)
        .regex(/^[^\r\n]+$/, 'Trailer values cannot contain line breaks'),
    }),
    keyPattern,
    keyRegex,
  };
}

const DEFAULT_SCHEMA_BUNDLE = createGitTrailerSchemaBundle();

export const GitTrailerSchema = DEFAULT_SCHEMA_BUNDLE.schema;
export const TRAILER_KEY_RAW_PATTERN_STRING = DEFAULT_SCHEMA_BUNDLE.keyPattern;
export const TRAILER_KEY_REGEX = DEFAULT_SCHEMA_BUNDLE.keyRegex;
export const getDefaultTrailerSchemaBundle = () => DEFAULT_SCHEMA_BUNDLE;
