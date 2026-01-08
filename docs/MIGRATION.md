# Migration Notes

## v2.0.0 → Future Releases

1. **Exported Helpers:** We now export `encodeMessage`/`decodeMessage` so you can integrate without instantiating `TrailerCodec`. Update your imports if you were previously doing `new TrailerCodec()` everywhere.
2. **Blank-Line Requirement:** Messages must include a blank line between the body and trailers. Any message that omits the separator now throws `ValidationError`.
3. **Validation Code:** Trailer values may not contain newline characters; this may require updates to template data or test fixtures.
4. **Schema Factory:** Use `createGitTrailerSchemaBundle()` if you previously had custom trailer patterns, and pass the bundle to `TrailerCodecService` via the `schemaBundle` option.
5. **Release Process:** Always bump the changelog entry under `[unreleased]`, run `npm test`, and confirm there are no Docker guards remaining before publishing.

## v0.2.0

1. `decodeMessage()` now trims trailing newlines by default. If your integration expects raw bodies to retain the terminal `\n`, instantiate `TrailerCodec` with `bodyFormatOptions: { keepTrailingNewline: true }`, or call `formatBodySegment(body, { keepTrailingNewline: true })` manually after decoding.
2. `createConfiguredCodec()` also accepts `bodyFormatOptions` so you can propagate the same behavior through the configured helper pair.
3. Refer to this section (`docs/MIGRATION.md#v020`) when upgrading from versions before v0.2.0 to understand the runtime shift and avoid double-trimming your bodies.
