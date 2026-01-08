import { z } from 'zod';

const DEFAULT_KEY_PATTERN = '[A-Za-z0-9_-]+';

export function createGitTrailerSchemaBundle({ keyPattern = DEFAULT_KEY_PATTERN, keyMaxLength = 100 } = {}) {
  const anchoring = new RegExp(`^${keyPattern}$`);
  return {
    schema: z.object({
      key: z
        .string()
        .min(1)
        .max(keyMaxLength, 'Trailer key must not exceed character limit')
        .regex(anchoring, 'Trailer key must be alphanumeric or contain hyphens/underscores'),
      value: z
        .string()
        .min(1)
        .regex(/^[^\r\n]+$/, 'Trailer values cannot contain line breaks'),
    }),
    keyPattern,
    keyRegex: anchoring,
  };
}

const DEFAULT_SCHEMA_BUNDLE = createGitTrailerSchemaBundle();

export const GitTrailerSchema = DEFAULT_SCHEMA_BUNDLE.schema;
export const TRAILER_KEY_RAW_PATTERN_STRING = DEFAULT_SCHEMA_BUNDLE.keyPattern;
export const TRAILER_KEY_REGEX = DEFAULT_SCHEMA_BUNDLE.keyRegex;
export const getDefaultTrailerSchemaBundle = () => DEFAULT_SCHEMA_BUNDLE;
