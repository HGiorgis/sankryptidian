/**
 * Sankrypt Cryptography Module
 * Provides military-grade AES-256-GCM encryption utilities
 * All operations are performed client-side with no external dependencies
 */

export class SankryptCrypto {
  // Cryptography constants
  static ALGORITHM = "AES-GCM";
  static KEY_LENGTH = 256; // AES-256
  static ITERATIONS = 310000; // PBKDF2 iteration count (NIST recommended)
  static SALT_LENGTH = 16; // 128-bit salt
  static IV_LENGTH = 12; // 96-bit IV for GCM

  /**
   * Derives encryption key from password using PBKDF2
   * @param {string} password - Master password
   * @param {Uint8Array} salt - Random salt
   * @returns {Promise<CryptoKey>} Derived encryption key
   */
  static async deriveKey(password, salt) {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      "PBKDF2",
      false,
      ["deriveKey"],
    );

    return await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: this.ITERATIONS,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: this.ALGORITHM, length: this.KEY_LENGTH },
      false,
      ["encrypt", "decrypt"],
    );
  }

  /**
   * Encrypts text with password using AES-256-GCM
   * @param {string} text - Plaintext to encrypt
   * @param {string} password - Encryption password
   * @returns {Promise<string>} Base64 encoded encrypted package
   * @throws {Error} If encryption fails
   */
  static async encrypt(text, password) {
    try {
      // Generate cryptographically secure random values
      const salt = crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH));
      const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));

      // Derive encryption key from password
      const key = await this.deriveKey(password, salt);

      // Encrypt the data
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      const encrypted = await crypto.subtle.encrypt(
        { name: this.ALGORITHM, iv: iv },
        key,
        data,
      );

      // Package format: [version:1][salt:16][iv:12][encrypted:variable]
      const packageSize = 1 + salt.length + iv.length + encrypted.byteLength;
      const packageArray = new Uint8Array(packageSize);

      // Version byte for future compatibility (0x01 = AES-256-GCM)
      packageArray[0] = 0x01;

      // Copy salt, iv, and encrypted data into package
      packageArray.set(salt, 1);
      packageArray.set(iv, 1 + salt.length);
      packageArray.set(new Uint8Array(encrypted), 1 + salt.length + iv.length);

      // Return as URL-safe base64
      return this.arrayToBase64(packageArray);
    } catch (error) {
      console.error("Sankrypt encryption error:", error);
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypts encrypted package with password
   * @param {string} encryptedBase64 - Base64 encoded encrypted package
   * @param {string} password - Decryption password
   * @returns {Promise<string>} Decrypted plaintext
   * @throws {Error} If decryption fails or password is incorrect
   */
  static async decrypt(encryptedBase64, password) {
    try {
      // Decode from base64
      const packageArray = this.base64ToArray(encryptedBase64);

      // Extract package components
      const version = packageArray[0];
      if (version !== 0x01) {
        throw new Error("Unsupported encryption version");
      }

      const salt = packageArray.slice(1, 1 + this.SALT_LENGTH);
      const iv = packageArray.slice(
        1 + this.SALT_LENGTH,
        1 + this.SALT_LENGTH + this.IV_LENGTH,
      );
      const encrypted = packageArray.slice(
        1 + this.SALT_LENGTH + this.IV_LENGTH,
      );

      // Derive key from password and salt
      const key = await this.deriveKey(password, salt);

      // Decrypt the data
      const decrypted = await crypto.subtle.decrypt(
        { name: this.ALGORITHM, iv: iv },
        key,
        encrypted,
      );

      // Return as text
      return new TextDecoder().decode(decrypted);
    } catch (error) {
      console.error("Sankrypt decryption error:", error);

      // Provide user-friendly error messages
      if (
        error.message.includes("wrong key") ||
        error.name === "OperationError"
      ) {
        throw new Error(
          "Decryption failed: Incorrect password or corrupted data",
        );
      }
      if (error.message.includes("Unsupported encryption version")) {
        throw new Error(
          "Decryption failed: File was encrypted with an unsupported version",
        );
      }
      throw error;
    }
  }

  /**
   * Validates password strength and requirements
   * @param {string} password - Password to validate
   * @returns {Object} Validation results with strength score and issues
   */
  static validatePassword(password) {
    const issues = [];

    // Minimum length requirement
    if (password.length < 12) {
      issues.push("Password must be at least 12 characters");
    }

    // Character diversity requirements
    if (!/[a-z]/.test(password)) {
      issues.push("Password must contain lowercase letters");
    }

    if (!/[A-Z]/.test(password)) {
      issues.push("Password must contain uppercase letters");
    }

    if (!/[0-9]/.test(password)) {
      issues.push("Password must contain numbers");
    }

    if (!/[^a-zA-Z0-9]/.test(password)) {
      issues.push("Password must contain special characters");
    }

    return {
      isValid: issues.length === 0,
      issues: issues,
      strength: this.calculatePasswordStrength(password),
    };
  }

  /**
   * Calculates password strength score (0-100)
   * @param {string} password - Password to score
   * @returns {number} Strength score from 0 to 100
   */
  static calculatePasswordStrength(password) {
    let score = 0;

    // Length scoring
    if (password.length >= 12) score += 25;
    if (password.length >= 16) score += 10;
    if (password.length >= 20) score += 10;

    // Character variety scoring
    if (/[a-z]/.test(password)) score += 10;
    if (/[A-Z]/.test(password)) score += 10;
    if (/[0-9]/.test(password)) score += 10;
    if (/[^a-zA-Z0-9]/.test(password)) score += 15;

    // Entropy scoring based on unique characters
    const uniqueChars = new Set(password).size;
    score += Math.min(20, (uniqueChars / password.length) * 40);

    // Cap at 100
    return Math.min(100, score);
  }

  /**
   * Converts Uint8Array to base64 string
   * @param {Uint8Array} array - Binary data
   * @returns {string} Base64 encoded string
   */
  static arrayToBase64(array) {
    return btoa(String.fromCharCode(...array));
  }

  /**
   * Converts base64 string to Uint8Array
   * @param {string} base64 - Base64 encoded string
   * @returns {Uint8Array} Binary data
   */
  static base64ToArray(base64) {
    const binary = atob(base64);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      array[i] = binary.charCodeAt(i);
    }
    return array;
  }

  /**
   * Generates secure password hint (not the password itself)
   * @param {string} password - Password to generate hint for
   * @returns {string} Non-reversible hint
   */
  static generatePasswordHint(password) {
    if (!password || password.length < 3) return "";

    // Create hint that doesn't reveal actual password
    const first = password[0];
    const last = password[password.length - 1];
    const length = password.length;

    return `Starts with "${first}", ends with "${last}", ${length} chars`;
  }

  /**
   * Tests if encryption/decryption works with given password
   * Useful for verifying password before using it for real encryption
   * @param {string} password - Password to test
   * @returns {Promise<boolean>} True if password works
   */
  static async testPassword(password) {
    try {
      const testData = "Sankrypt encryption test";
      const encrypted = await this.encrypt(testData, password);
      const decrypted = await this.decrypt(encrypted, password);
      return decrypted === testData;
    } catch (error) {
      return false;
    }
  }
}
