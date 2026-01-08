# Architecture: @git-stunts/trailer-codec

This project adheres to **Hexagonal Architecture** (Ports and Adapters) and **Domain-Driven Design (DDD)** principles to ensure robustness, testability, and separation of concerns.

## 🧱 Core Concepts

### Domain Layer (`src/domain/`)
The core business logic, isolated from external frameworks or I/O.

- **Entities**: Mutable objects with identity and lifecycle (e.g., `GitCommitMessage`).
- **Value Objects**: Immutable objects defined by their attributes (e.g., `GitTrailer`).
- **Services**: Domain logic that doesn't fit naturally into an entity (e.g., `TrailerCodecService` for parsing/serializing).
- **Errors**: Domain-specific error hierarchy (e.g., `TrailerCodecError`, `ValidationError`).
- **Schemas**: Zod schemas for validation of domain objects.

### Ports Layer (`src/ports/`)
*Currently implicit.* The public API (exported via `index.js`) serves as the primary input port/facade for consumers. Since this library is primarily a data transformation tool (codec), it does not currently have complex output ports for I/O.

## 📂 Directory Structure

```
src/
├── domain/
│   ├── entities/       # GitCommitMessage
│   ├── errors/         # TrailerCodecError, ValidationError
│   ├── schemas/        # Zod schemas
│   ├── services/       # TrailerCodecService
│   └── value-objects/  # GitTrailer
```

## 🧪 Testing Strategy

- **Unit Tests** (`test/unit/`): Comprehensive tests for entities, value objects, and services.
- **Test Doubles**: The architecture supports easy mocking of dependencies if the system grows.

## 🛠️ Design Decisions

1.  **Zod for Validation**: We use Zod for runtime schema validation but wrap it in domain-specific `ValidationError`s to avoid leaking implementation details.
2.  **Case Normalization**: Git trailer keys are case-insensitive. We normalize them to lowercase in the `GitTrailer` Value Object to ensure consistency.
3.  **Facade Pattern**: `index.js` acts as a facade, providing a simple, backward-compatible API while exposing the rich domain model for advanced users.
