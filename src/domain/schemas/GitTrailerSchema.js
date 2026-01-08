import { z } from 'zod';

/**
 * Zod schema for a single Git trailer.
 */
export const GitTrailerSchema = z.object({
  key: z
    .string()
    .min(1)
    .regex(/^[A-Za-z0-9_-]+$/, 'Trailer key must be alphanumeric or contain hyphens/underscores'),
  value: z.string().min(1),
});
