# Changelog

All notable changes to Sankryptidian will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-20

### Added

- Initial release of Sankryptidian
- AES-256-GCM file encryption and decryption
- Single master key system for all encrypted files
- Password validation and strength checking
- Auto-lock timeout feature
- File conflict resolution with random suffixes
- Visual highlighting of encrypted files in explorer
- Status bar with quick actions
- Password hint system
- Brute-force protection (temporary blocking after failed attempts)
- Bulk file browser for encrypted files
- Settings tab with comprehensive configuration options

### Security

- Military-grade AES-256-GCM encryption
- PBKDF2 key derivation with 310,000 iterations
- Random salt (16 bytes) and IV (12 bytes) generation
- Memory clearing after inactivity
- No password storage on disk
- Tamper-proof encrypted file format
- Local-only operation (no internet access required)

### Technical

- Built with Obsidian Plugin API
- Zero external dependencies (uses Web Crypto API)
- Cross-platform compatibility (Windows, macOS, Linux)
- Mobile support (iOS, Android)
- Clean, documented codebase
- Follows Obsidian plugin guidelines

### Fixed

- N/A (initial release)

### Changed

- N/A (initial release)

### Deprecated

- N/A (initial release)

### Removed

- N/A (initial release)

### Security

- No known security vulnerabilities
- Code reviewed for security best practices

---

## How to Use This Changelog

### Added

New features, commands, or functionality.

### Changed

Changes to existing functionality.

### Deprecated

Features that will be removed in future releases.

### Removed

Features that were removed in this release.

### Fixed

Bug fixes.

### Security

Security-related changes or vulnerabilities that were addressed.
