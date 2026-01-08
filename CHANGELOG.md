# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
- Exported `TRAILER_KEY_REGEX` constant for reuse

### Fixed
- Regex inconsistency between schema validation and service parsing
- Missing null checks in facade layer
- Unbounded input vulnerability in decode method

### Security
- Added input size validation to prevent memory exhaustion attacks
- Limited trailer key length to prevent ReDoS attacks
- Enforced strict regex patterns across validation boundaries
