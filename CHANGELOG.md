# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0] - 2026-05-06

### Added
- **Async-First Core**: Refactored `TrailerCodecService`, `TrailerCodec`, and top-level helpers to be `async`, ensuring future-proof non-blocking operation.
- **Modernized Documentation**: Rewrote `README.md` and added `GUIDE.md` to emphasize modern async patterns and better pedagogical flow.

### Changed
- **Breaking: Async API**: `decodeMessage`, `encodeMessage`, `codec.decode()`, and `codec.encode()` now return `Promise` instances and must be `await`ed.
- **Breaking: Helper Factory**: `createMessageHelpers` now returns a pair of asynchronous functions.

## [2.1.0] - 2026-01-11

### Added
- **Convenience method aliases**: `TrailerCodec` now exposes `decode()`/`encode()` as shorter aliases for `decodeMessage()`/`encodeMessage()`
- **Migration guide**: Created comprehensive `docs/MIGRATION.md` covering v1.x → v2.0 and v2.0 → v2.1 upgrades
- **Enhanced security documentation**: Expanded `SECURITY.md` with detailed DoS protection limits and customization examples
- **Test coverage**: Added 4 new tests for convenience aliases in `test/unit/adapters/FacadeAdapter.test.js`
- **Comprehensive JSDoc**: Added detailed JSDoc comments to all 13 public exports in `index.js`

### Changed
- **Improved error handling**: All errors in `GitCommitMessage` constructor now properly wrapped in `CommitMessageInvalidError`
- **Enhanced validation**: Added string type validation for trailer values in `normalizeTrailers()`
- **Better error types**: Duplicate trailer keys and invalid values now throw `TrailerInvalidError` with rich metadata
- **Domain-specific errors**: RegExp construction errors in `GitTrailerSchema` now throw `TrailerInvalidError` instead of generic `TypeError`
- **Reduced constructor complexity**: Refactored `GitCommitMessage`, `TrailerCodecService`, and `GitTrailer` constructors by extracting validation and error handling into private methods - all ESLint complexity warnings now resolved

### Fixed
- API inconsistency where documentation referenced `codec.decode()` but only `codec.decodeMessage()` existed
- Missing validation for trailer value types could cause runtime crashes
- Generic Error types in facade layer breaking documented error hierarchy
- README API patterns section now mentions both method name forms
- API_REFERENCE.md typo on line 37 (extra `-` character)
- TESTING.md incorrect Vitest flags (`--runInBand` → `--reporter=verbose`)
- Package.json `files` field now includes `docs/` directory and all documentation files

### Removed
- **Unnecessary Docker configuration**: Removed `Dockerfile`, `docker-compose.yml`, and `.dockerignore` - not needed for pure domain logic library with no I/O or subprocess execution
- **Simplified CI workflow**: Tests now run directly via `npm test` without Docker overhead

### Documentation
- Created `FIXES_APPLIED.md` documenting all changes in detail
- Updated `API_REFERENCE.md` to document new aliases
- Updated `README.md` to clarify both method names are supported
- Corrected `TESTING.md` with accurate Vitest command-line flags

## [unreleased]

### Planned
- Integration test suite for real Git commit scenarios
- Performance benchmarks for large messages
- Additional edge case tests (unicode, empty input, concurrent usage)


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
