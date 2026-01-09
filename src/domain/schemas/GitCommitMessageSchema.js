import { z } from 'zod';
import { GitTrailerSchema } from './GitTrailerSchema.js';

/**
 * Zod schema validating a structured Git commit message.
 *
 * Fields:
 * - `title`: non-empty string representing the first commit line.
 * - `body`: string defaulting to `''`.
 * - `trailers`: array of `GitTrailer` objects, each validated by `GitTrailerSchema`.
 */
export const GitCommitMessageSchema = z.object({
  title: z.string().min(1),
  body: z.string().default(''),
  trailers: z.array(GitTrailerSchema),
});
