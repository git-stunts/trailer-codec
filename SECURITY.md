# Security Model

@git-stunts/trailer-codec is a pure domain-layer library for encoding and decoding Git commit message trailers. It performs no I/O and spawns no subprocesses.

## 🛡️ Design Philosophy

This library treats commit messages as **untrusted input** and validates them strictly before parsing.

## ✅ Validation Strategy

- **Zod Schemas**: All inputs are validated through Zod schemas before entity instantiation
- **No Code Injection**: The library performs pure string manipulation with no `eval()` or dynamic code execution
- **Immutable Entities**: All domain entities are immutable; operations return new instances

## 🚫 What This Library Does NOT Do

- **No Git Execution**: This library does not spawn Git processes
- **No File System Access**: Pure in-memory operations only
- **No Network Access**: No runtime network access and zero external dependencies beyond the Zod validation library

## 🐞 Reporting a Vulnerability

If you discover a security vulnerability, please send an e-mail to james@flyingrobots.dev.
