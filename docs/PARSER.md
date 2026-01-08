# Parser Deep Dive

The parser in `TrailerCodecService.decode()` walks **backwards** from the bottom of the commit message to efficiently locate the trailer block. This is faster than scanning each line from the top because trailers are guaranteed to live at the end of the message.

## Steps

1. **Normalize line endings** to `\n` and split the message.
2. **Consume the title** (the first line) and drop the optional blank line that separates it from the body.
3. **Walk backward** with `_findTrailerStartIndex` until either a non-matching line or an empty line appears; contiguous `Key: Value` patterns form the trailer block.
4. **Validate the separator**: `_validateTrailerSeparation` ensures there is a blank line before the trailers. Messages that omit the blank line now throw `ValidationError`.
5. **Trim the body** without double allocations: `_trimBody` trims leading/trailing blank lines via index arithmetic and one `join`.
6. **Parse trailers** using the schema bundle’s `keyPattern`, instantiating trailers via the injected `trailerFactory`.

The backward walk plus the blank-line guard ensure attackers cannot append arbitrary trailers to the body without the required separator.
