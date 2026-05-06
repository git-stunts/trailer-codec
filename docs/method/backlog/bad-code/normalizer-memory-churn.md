# BAD CODE: MessageNormalizer String Duplication

## Context
`MessageNormalizer` performs several pass-through regex replacements and splits on the full message string.

## Symptoms
For large commit messages, this creates multiple copies of the string in memory, doubling or tripling the heap usage during a single decode call.

## Proposed Fix
Refactor `MessageNormalizer` to use a single-pass scanner or work on `Uint8Array` views to minimize memory allocations.
