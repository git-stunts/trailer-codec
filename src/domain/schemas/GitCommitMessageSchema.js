import { z } from 'zod';

/**
 * Zod schema for a structured Git commit message.
 */
export const GitCommitMessageSchema = z.object({
  title: z.string().min(1),
  body: z.string().default(''),
  trailers: z.array(z.any()), // Array of GitTrailer instances
});
