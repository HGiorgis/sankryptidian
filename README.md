# Sankryptidian - Professional Encryption for Obsidian

Professional file-level encryption plugin for Obsidian with military-grade AES-256-GCM security.

![Obsidian](https://img.shields.io/badge/Obsidian-Plugin-green)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Security](https://img.shields.io/badge/security-AES--256--GCM-red)
![License](https://img.shields.io/badge/license-MIT-yellow)

## Features

- **AES-256-GCM Encryption**: Military-grade encryption for individual files
- **Single Master Key**: One password for all encrypted files
- **Auto-Lock**: Automatically clears passwords after inactivity
- **File Conflict Resolution**: Smart filename handling prevents data loss
- **Visual Identification**: Encrypted files show lock icons in explorer
- **Zero Dependencies**: Uses built-in Web Crypto API only

## Installation

1. Open Obsidian Settings → Community Plugins
2. Disable Safe Mode
3. Click "Browse" and search for "Sankryptidian"
4. Install and enable the plugin

## Quick Start

### Set Master Password

1. Click the shield icon in the ribbon
2. Set a strong password (12+ characters recommended)
3. Optional: Add a password hint

### Encrypt a File

1. Open any file in Obsidian
2. Click the lock icon or use `Ctrl+Shift+E`
3. Original file is encrypted to `.skenc` format

### Decrypt a File

1. Click any `.skenc` file
2. Enter your master password
3. File is decrypted back to original format

## Commands

- **Encrypt Current File**: `Ctrl+Shift+E`
- **Decrypt Current File**: `Ctrl+Shift+D`
- **Browse Encrypted Files**: `Ctrl+Shift+Alt+F`
- **Change Master Password**: Settings or command palette
- **Lock Vault**: Clear passwords from memory

## Settings

### General

- **Auto-lock timeout**: Minutes before clearing passwords (0 = never)
- **Default action**: What happens to original file after encryption (remove/ask/keep)

### Security

- **Password hint**: Optional hint to remember master password
- **Highlight encrypted files**: Show lock icons for `.skenc` files

### Advanced

- **Lock vault now**: Immediately clear all passwords
- **Reset plugin**: Clear all settings (does not affect encrypted files)

## Security Details

### Encryption

- Algorithm: AES-256-GCM (authenticated encryption)
- Key derivation: PBKDF2 with 310,000 iterations
- Salt: 16-byte random
- IV: 12-byte random

### Password Requirements

- Minimum 12 characters
- Mixed case letters
- Numbers and special characters
- No maximum length (supports passphrases)

### Data Protection

- Passwords never stored on disk
- Memory cleared after inactivity
- Local-only operation (no internet access)
- No telemetry or data collection

## Privacy

This plugin:

- Never sends data over the internet
- Never collects usage statistics
- Never accesses files without user action
- Operates entirely locally on your device

## Support

### Common Issues

- **Wrong password**: Ensure caps lock is off, type carefully
- **File not opening**: Check if plugin is enabled
- **Auto-lock not working**: Verify timeout setting

### Getting Help

- GitHub Issues: https://github.com/hgiorgis/sankryptidian/issues

## Development

### Building from Source

```bash
git clone https://github.com/hgiorgis/sankryptidian.git
cd sankryptidian
npm install
npm run build
```

## License

MIT License - See LICENSE file for details.
Important Notes
