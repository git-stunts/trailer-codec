# COOL IDEA™: Encrypted Trailers (Vault Integration)

## Context
Commit trailers are public and stored in plain text in the Git history.

## Description
Add a specialized `EncryptedTrailerService` that integrates with `@git-stunts/vault`. It would automatically encrypt sensitive trailer values (e.g., `x-api-key: <encrypted>`) during encoding and decrypt them during decoding if the required key is available in the OS vault.

## Value
- Secure metadata storage within public Git histories.
- Seamless integration between codec and vault.
