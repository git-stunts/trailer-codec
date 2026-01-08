# Contributing to @git-stunts/trailer-codec

## Development Philosophy

This project follows **Hexagonal Architecture** and **Domain-Driven Design**.

- **Domain Layer**: Pure business logic. No dependencies on outer layers.
- **Ports**: Interfaces (if needed) for external interaction.
- **Infrastructure**: Concrete implementations (currently minimal).

## Testing

We use **Vitest**.
- Run all tests: `npm test`
- Run specific test: `npx vitest run test/unit/domain/entities/GitCommitMessage.test.js`

## Style Guide

- Use `ESLint` and `Prettier`.
- Commit messages should follow conventional commits.
- **Red -> Green -> Refactor**: Write tests before implementing features.

## Project Structure

```
src/
  domain/
    entities/       # Identity, lifecycle
    value-objects/  # Immutable, attributes
    services/       # Stateless logic
    errors/         # Domain errors
    schemas/        # Validation schemas
```
