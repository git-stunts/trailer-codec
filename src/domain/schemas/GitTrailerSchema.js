import { z } from 'zod';

/**
 * Regex fragments that describe what characters are allowed in trailer keys.
 * Exported as both an anchored regex (`TRAILER_KEY_REGEX`) and a loose pattern
 * (`TRAILER_KEY_PATTERN`) so parsers, validators, and documentation can share
 * the same definition without accidentally duplicating anchors.
 */
export const TRAILER_KEY_PATTERN = '[A-Za-z0-9_-]+';
export const TRAILER_KEY_REGEX = new RegExp(`^${TRAILER_KEY_PATTERN}$`);

export const GitTrailerSchema = z.object({
  key: z
    .string()
    .min(1)
    .max(100, 'Trailer key must not exceed 100 characters')
    .regex(TRAILER_KEY_REGEX, 'Trailer key must be alphanumeric or contain hyphens/underscores'),
  value: z.string().min(1),
});
