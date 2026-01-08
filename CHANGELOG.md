# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [unreleased]

### Added
- Exposed `decodeMessage`/`encodeMessage` helpers for faster integration without instantiating the facade.
- Documented advanced/custom validation workflows (`docs/ADVANCED.md`), parser behavior (`docs/PARSER.md`), migration guidance, performance notes, and release steps (`docs/MIGRATION.md`, `docs/PERFORMANCE.md`, `docs/RELEASE.md`).
- Added schema factory (`createGitTrailerSchemaBundle`) so downstream code can override trailer validation rules.
- Introduced `TrailerParser` with its own tests so parsing can be swapped or reused without subclassing the service.
- Expanded the README with developer/testing guidance, public helper details, and links to `TESTING.md`, `API_REFERENCE.md`, and `docs/SERVICE.md`, which now document the helper contract, API surface, and service wiring.
- Added README/MIGRATION documentation for the `decodeMessage()` newline trimming change (v0.2.0+) and mapped the migration path plus helper usage for `TrailerCodec` bodyFormatOptions and `formatBodySegment`.

### Changed
- Trimmed commit bodies without double allocation and enforced a blank line before trailers.
- Tightened trailer validation (newline-free values) and exposed the schema bundle to service/fixtures, pairing with the new helper wrappers.
- Removed the docker guard dependency so tests run locally without the external guard enforcement.
- Upgraded `zod` dependency to the latest 3.25.x release.
 - Added ValidationError codes (TRAILER_TOO_LARGE, TRAILER_NO_SEPARATOR, TRAILER_VALUE_INVALID, TRAILER_INVALID, COMMIT_MESSAGE_INVALID) for granular error diagnostics.
 - Updated `decode()` to accept raw strings with a deprecation warning when the legacy object form is used.


## [2.0.0] - 2026-01-08

### Added
- Hexagonal architecture refactor with pure domain layer
- Zod-based schema validation for type safety
- Facade pattern for simplified usage
- DoS protection: 5MB message size limit in `decode()`
- ReDoS protection: 100-character max length on trailer keys
- Comprehensive JSDoc documentation
- Security hardening: consistent regex validation between schema and service
- Validation rules table in README
- GitHub Actions CI workflow
- Standard open-source files: LICENSE, NOTICE, SECURITY.md, CODE_OF_CONDUCT.md

### Changed
- Trailer keys normalized to lowercase for consistency
- `GitCommitMessage` constructor accepts array of trailers
- `TrailerCodecService.decode` now validates input size before parsing
- Strict schema typing: replaced `z.array(z.any())` with `z.array(GitTrailerSchema)`
- Exported `TRAILER_KEY_RAW_PATTERN_STRING` and `TRAILER_KEY_REGEX` constants for reuse (regex is compiled from the raw string pattern)

### Fixed
- Regex inconsistency between schema validation and service parsing
- Missing null checks in facade layer
- Unbounded input vulnerability in decode method

### Security
- Added input size validation to prevent memory exhaustion attacks
- Limited trailer key length to prevent ReDoS attacks
- Enforced strict regex patterns across validation boundaries
