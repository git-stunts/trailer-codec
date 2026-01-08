# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-01-07

### Refactor

- **Hexagonal Architecture**: Complete restructuring of the library into domain entities, value objects, and services.
- **Zod Validation**: Centralized all validation using Zod schemas for Git trailers and commit messages.
- **Improved Parser**: Refined the logic for trailer detection to better follow Git's RFC 822-style conventions.

### Added

- **TrailerCodecService**: New domain service for core encoding/decoding logic.
- **GitCommitMessage**: New domain entity representing structured commit data.
- **GitTrailer**: New value object for normalized trailer handling.

## [1.0.0] - 2025-10-15

### Added

- Initial release with basic trailer support.
