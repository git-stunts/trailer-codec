import { z } from 'zod';

/**
 * Zod schema for a single Git trailer.
 */
/**
 * Regex pattern for valid trailer keys.
 * Used in both schema validation and service parsing to ensure consistency.
 */
export const TRAILER_KEY_REGEX = /^[A-Za-z0-9_-]+$/;

export const GitTrailerSchema = z.object({
  key: z
    .string()
    .min(1)
    .max(100, 'Trailer key must not exceed 100 characters')
    .regex(TRAILER_KEY_REGEX, 'Trailer key must be alphanumeric or contain hyphens/underscores'),
  value: z.string().min(1),
});
