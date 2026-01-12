import { z } from 'zod';
import TrailerInvalidError from '../errors/TrailerInvalidError.js';

const DEFAULT_KEY_PATTERN = '[A-Za-z0-9_\\-]+';
const MAX_PATTERN_LENGTH = 256;
const MAX_QUANTIFIERS = 16;
const bundleCache = new Map();

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
    throw new TrailerInvalidError(
      `Invalid regex pattern for trailer key: ${error.message}`,
      { keyPattern, originalError: error.message }
    );
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

  const cacheKey = `${keyPattern}::${keyMaxLength}`;
  if (bundleCache.has(cacheKey)) {
    return bundleCache.get(cacheKey);
  }

  const keyRegex = buildKeyRegex(keyPattern);
  const bundle = {
    schema: z.object({
      key: z
        .string()
        .min(1)
        .max(keyMaxLength, 'Trailer key must not exceed character limit')
        .regex(keyRegex, `Trailer key must match the required pattern ${keyPattern}`),
      value: z
        .string()
        .min(1)
        .regex(/^[^\r\n]+$/, 'Trailer values cannot contain line breaks'),
    }),
    keyPattern,
    keyRegex,
  };

  bundleCache.set(cacheKey, bundle);
  return bundle;
}

const DEFAULT_SCHEMA_BUNDLE = createGitTrailerSchemaBundle();

export const GitTrailerSchema = DEFAULT_SCHEMA_BUNDLE.schema;
export const TRAILER_KEY_RAW_PATTERN_STRING = DEFAULT_SCHEMA_BUNDLE.keyPattern;
export const TRAILER_KEY_REGEX = DEFAULT_SCHEMA_BUNDLE.keyRegex;
export const getDefaultTrailerSchemaBundle = () => DEFAULT_SCHEMA_BUNDLE;
