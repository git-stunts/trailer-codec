# COOL IDEA™: Streaming Trailer Parser

## Context
`trailer-codec` currently requires the full commit message string to be loaded into memory before parsing.

## Description
Implement a `StreamingParser` that can identify and extract trailers from a `GitStream` (or any `AsyncIterable<Uint8Array>`) by reading from the end of the stream backwards.

## Value
- Allows parsing metadata from massive commit messages without full buffering.
- Consistent with the "Streaming First" mandate of the empire.
