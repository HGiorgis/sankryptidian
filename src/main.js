const obsidian = require("obsidian");
import { SankryptCrypto } from "./crypto.js";
import {
  PasswordModal,
  FileBrowserModal,
  EncryptionViewer,
  createIcon,
} from "./ui.js";

// ========== DEFAULT SETTINGS ==========
const DEFAULT_SETTINGS = {
  autoLockMinutes: 30,
  rememberPassword: false,
  passwordHint: "",
  showEncryptedInExplorer: true,
  defaultAction: "remove",
  encryptionLevel: "aes-256-gcm",
};

/**
 * Settings tab for Sankrypt plugin configuration
 * Provides UI for managing encryption settings and security options
 */
class SankryptSettingsTab extends obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();

    // Create header with icon using secure methods
    const header = containerEl.createDiv({
      attr: {
        style:
          "display: flex; align-items: center; gap: 12px; margin-bottom: 30px;",
      },
    });

    const iconDiv = header.createDiv();
    const shieldSvg = iconDiv.createEl("svg", {
      attr: {
        xmlns: "http://www.w3.org/2000/svg",
        width: "32",
        height: "32",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": "2",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      },
    });
    shieldSvg.createEl("path", {
      attr: {
        d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
      },
    });
    shieldSvg.style.color = "var(--text-accent)";

    const titleDiv = header.createDiv();
    titleDiv.createEl("h1", {
      text: "Sankrypt",
      attr: { style: "margin: 0 0 5px 0;" },
    });
    titleDiv.createEl("div", {
      text: "Professional Encryption",
      attr: { style: "color: var(--text-muted); font-size: 14px;" },
    });

    // General Settings Section
    containerEl.createEl("h2", {
      text: "General Settings",
      attr: { style: "padding-bottom: 10px; margin-top: 30px;" },
    });

    // Auto-lock setting with focus fix
    new obsidian.Setting(containerEl)
      .setName("Auto-lock timeout")
      .setDesc(
        "Automatically lock vault after X minutes of inactivity (0 = never)",
      )
      .addText((text) => {
        text
          .setPlaceholder("30")
          .setValue(this.plugin.settings.autoLockMinutes.toString())
          .onChange(async (value) => {
            const minutes = parseInt(value) || 0;
            this.plugin.settings.autoLockMinutes = Math.max(0, minutes);
            await this.plugin.saveSettings();
            this.plugin.resetAutoLockTimer();
          });
        text.inputEl.addEventListener("focus", (e) => e.stopPropagation());
      });

    // Show encrypted files in explorer
    new obsidian.Setting(containerEl)
      .setName("Show encrypted files in explorer")
      .setDesc("Display .skenc files in the file explorer")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.showEncryptedInExplorer)
          .onChange(async (value) => {
            this.plugin.settings.showEncryptedInExplorer = value;
            await this.plugin.saveSettings();
            this.plugin.applyExplorerStyles();
          }),
      );

    // Default encryption action
    new obsidian.Setting(containerEl)
      .setName("Default encryption action")
      .setDesc("What happens when you encrypt a file")
      .addDropdown((dropdown) =>
        dropdown
          .addOption("remove", "Remove unencrypted file")
          .addOption("ask", "Ask each time")
          .addOption("keep", "Keep both files")
          .setValue(this.plugin.settings.defaultAction)
          .onChange(async (value) => {
            this.plugin.settings.defaultAction = value;
            await this.plugin.saveSettings();
          }),
      );

    // Security warning box
    const warningBox = containerEl.createDiv({
      attr: {
        style: `
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: 8px;
          padding: 15px;
          margin: 15px 0;
        `,
      },
    });

    warningBox.createEl("div", {
      text: "⚠️ Single Master Key Policy",
      attr: { style: "font-weight: bold; color: #f59e0b; margin-bottom: 5px;" },
    });

    warningBox.createEl("div", {
      text: "All encrypted files must use the same master password. When changing passwords, all existing files will be re-encrypted.",
      attr: { style: "font-size: 13px; color: var(--text-normal);" },
    });

    // Security Section
    containerEl.createEl("h2", {
      text: "Security",
      attr: { style: "padding-bottom: 10px; margin-top: 40px;" },
    });

    // Password hint setting
    const passwordHintSetting = new obsidian.Setting(containerEl)
      .setName("Password hint")
      .setDesc("A hint to help you remember your master password.")
      .addTextArea((text) => {
        const textarea = text
          .setPlaceholder('e.g., "My cat\'s name + year I graduated"')
          .setValue(this.plugin.settings.passwordHint)
          .onChange(async (value) => {
            // Enforce 100 character limit
            if (value.length > 100) {
              value = value.substring(0, 100);
              text.setValue(value);
            }
            this.plugin.settings.passwordHint = value;
            await this.plugin.saveSettings();
          });

        const textareaEl = text.inputEl;
        const textareaWrapper = document.createElement("div");
        textareaWrapper.style.cssText = "width: 100%; margin-bottom: 5px;";
        textareaEl.parentNode.insertBefore(textareaWrapper, textareaEl);
        textareaWrapper.appendChild(textareaEl);

        // Style textarea
        textareaEl.style.cssText = `
          width: 100%;
          height: 100px;
          padding: 12px;
          margin: 0;
          border-radius: 8px;
          border: 1px solid var(--background-modifier-border);
          background: var(--background-primary);
          color: var(--text-normal);
          font-size: 14px;
          font-family: var(--font-text);
          line-height: 1.5;
          resize: vertical;
          transition: all 0.2s ease;
          box-sizing: border-box;
          display: block;
        `;

        // Create character counter
        const counter = document.createElement("div");
        counter.style.cssText = `
          display: block;
          font-size: 12px;
          margin-top: 0;
          padding: 0 2px;
          font-family: var(--font-text);
          text-align: right;
        `;

        const counterContent = document.createElement("div");
        counterContent.style.cssText = `
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        `;

        const warningMessage = document.createElement("span");
        warningMessage.style.cssText = `
          font-weight: 600;
          opacity: 0;
          transition: opacity 0.3s ease;
          text-align: left;
          flex: 1;
        `;

        const charCount = document.createElement("span");
        charCount.style.cssText = `
          text-align: right;
          margin-left: 10px;
          white-space: nowrap;
        `;

        // Update counter function
        const updateCounter = () => {
          const length = textareaEl.value.length;
          charCount.textContent = `${length}/100`;

          if (length > 100) {
            counter.style.color = "#ef4444";
            charCount.style.color = "#ef4444";
            charCount.style.fontWeight = "bold";
            warningMessage.textContent =
              "Too long - truncated to 100 characters";
            warningMessage.style.color = "#ef4444";
            warningMessage.style.opacity = "1";
            textareaEl.style.borderColor = "#ef4444";
            textareaEl.style.boxShadow = "0 0 0 2px rgba(239, 68, 68, 0.1)";
          } else if (length > 80) {
            counter.style.color = "#f59e0b";
            charCount.style.color = "#f59e0b";
            charCount.style.fontWeight = "bold";
            warningMessage.textContent = "Approaching limit";
            warningMessage.style.color = "#f59e0b";
            warningMessage.style.opacity = "1";
            textareaEl.style.borderColor = "#f59e0b";
            textareaEl.style.boxShadow = "0 0 0 2px rgba(245, 158, 11, 0.1)";
          } else {
            counter.style.color = "var(--text-muted)";
            charCount.style.color =
              length > 50 ? "var(--text-accent)" : "var(--text-muted)";
            charCount.style.fontWeight = "normal";
            warningMessage.style.opacity = "0";
            textareaEl.style.borderColor = "var(--background-modifier-border)";
            textareaEl.style.boxShadow = "none";
          }
        };

        counterContent.appendChild(warningMessage);
        counterContent.appendChild(charCount);
        counter.appendChild(counterContent);
        textareaWrapper.appendChild(counter);

        // Initial counter update
        updateCounter();

        // Event listeners
        textareaEl.addEventListener("input", () => {
          updateCounter();
          // Auto-truncate if over 100 characters
          if (textareaEl.value.length > 100) {
            textareaEl.value = textareaEl.value.substring(0, 100);
            const event = new Event("input", { bubbles: true });
            textareaEl.dispatchEvent(event);
            warningMessage.textContent = "Auto-truncated to 100 characters";
            warningMessage.style.color = "#ef4444";
            warningMessage.style.opacity = "1";
            textareaEl.style.borderColor = "#ef4444";
            setTimeout(() => {
              if (textareaEl.value.length <= 100) {
                textareaEl.style.borderColor =
                  "var(--background-modifier-border)";
              }
            }, 1000);
          }
        });

        // Focus and hover effects
        textareaEl.addEventListener("focus", (e) => {
          e.stopPropagation();
          textareaEl.style.outline = "2px solid var(--interactive-accent)";
          textareaEl.style.outlineOffset = "2px";
          if (textareaEl.value.length <= 100) {
            textareaEl.style.borderColor = "var(--interactive-accent)";
            textareaEl.style.boxShadow =
              "0 0 0 3px rgba(var(--interactive-accent-rgb), 0.15)";
          }
        });

        textareaEl.addEventListener("blur", () => {
          textareaEl.style.outline = "none";
          if (textareaEl.value.length <= 100) {
            textareaEl.style.borderColor = "var(--background-modifier-border)";
            textareaEl.style.boxShadow = "none";
          }
        });
      });

    // Advanced Settings Section
    containerEl.createEl("h2", {
      text: "Advanced",
      attr: {
        style:
          "border-bottom: 1px solid var(--background-modifier-border); padding-bottom: 10px; margin-top: 40px; color: var(--text-error);",
      },
    });

    const dangerContainer = containerEl.createDiv({
      attr: {
        style:
          "background: var(--background-secondary); border-radius: 8px; padding: 20px; margin: 15px 0;",
      },
    });

    // Lock vault button
    new obsidian.Setting(dangerContainer)
      .setName("Clear all passwords")
      .setDesc("Immediately lock vault and clear all passwords from memory")
      .addButton((button) =>
        button
          .setButtonText("Lock Vault Now")
          .setCta()
          .onClick(() => {
            this.plugin.lockVault();
            new obsidian.Notice("Vault locked. Passwords cleared from memory.");
          }),
      );

    // Reset plugin button
    new obsidian.Setting(dangerContainer)
      .setName("Reset plugin")
      .setDesc(
        "Clear all plugin data and settings (does not affect encrypted files)",
      )
      .addButton((button) =>
        button
          .setButtonText("Reset Plugin")
          .setWarning()
          .onClick(async () => {
            if (
              confirm(
                "Are you sure? This will clear all plugin settings but NOT decrypt any files.",
              )
            ) {
              this.plugin.settings = { ...DEFAULT_SETTINGS };
              await this.plugin.saveSettings();
              this.plugin.lockVault();
              this.display();
              new obsidian.Notice("Plugin reset complete");
            }
          }),
      );

    // Footer
    const footer = containerEl.createDiv({
      attr: {
        style: `
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid var(--background-modifier-border);
          text-align: center;
          font-size: 12px;
          color: var(--text-muted);
        `,
      },
    });

    footer.createEl("div", { text: "Sankrypt v1.0 - Professional Encryption" });
    footer.createEl("div", {
      text: "Always remember your master password! It cannot be recovered if lost.",
      attr: { style: "color: var(--text-error); margin-top: 5px;" },
    });
  }
}

/**
 * Custom view for displaying encrypted files with decryption interface
 * Handles secure viewing of .skenc files without revealing content
 */
class SankryptEncryptionView extends obsidian.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
    this.file = null;
    this.viewer = null;
  }

  getViewType() {
    return "sankrypt-encryption-view";
  }

  getDisplayText() {
    return this.file ? `🔐 ${this.file.name}` : "Encrypted File";
  }

  getIcon() {
    return "lock";
  }

  async onOpen() {
    // View container initialized by Obsidian, wait for setState
  }

  async setState(state, result) {
    // Handle state restoration for encrypted file views
    if (state && state.file) {
      const file = this.app.vault.getAbstractFileByPath(state.file);
      if (file && file.path.endsWith(".skenc")) {
        await this.setFile(file);
      }
    }
    return super.setState(state, result);
  }

  /**
   * Sets and displays an encrypted file in the viewer
   * @param {TFile} file - The encrypted .skenc file to display
   */
  async setFile(file) {
    this.file = file;
    this.containerEl.empty();
    this.containerEl.addClass("sankrypt-encryption-view-container");

    // Create and display the encryption viewer
    this.viewer = new EncryptionViewer(this.app, this.plugin, file);
    const view = await this.viewer.createView();
    this.containerEl.appendChild(view);

    // Update tab header
    this.leaf.tabHeaderInnerTitleEl.setText(`🔐 ${file.name}`);
    this.leaf.tabHeaderInnerTitleEl.title = `Encrypted: ${file.path}`;
    this.leaf.view.navigation = true;
  }

  getState() {
    // Save current state for navigation history
    return {
      file: this.file ? this.file.path : null,
      ...super.getState(),
    };
  }

  async onClose() {
    // Cleanup resources
    this.viewer = null;
    this.file = null;
  }
}

// ========== MAIN PLUGIN CLASS ==========
module.exports = class Sankrypt extends obsidian.Plugin {
  constructor() {
    super(...arguments);
    this.masterPassword = null;
    this.encryptedFiles = new Set();
    this.autoLockTimer = null;
    this.lastActivity = Date.now();
    this.settings = DEFAULT_SETTINGS;
    this.encryptionViewType = null;
    this.lastBlockedFile = null;
    this.blockedStatusInterval = null;
    this.statusBar = null;
  }

  /**
   * Plugin initialization - sets up event handlers, commands, and UI
   */
  async onload() {
    console.log("Sankrypt v1.0 loading...");
    await this.loadSettings();

    // Track user activity for auto-lock timeout
    this.registerEvent(
      this.app.workspace.on("file-open", () => this.recordActivity()),
    );
    this.registerEvent(
      this.app.workspace.on("click", () => this.recordActivity()),
    );
    this.registerEvent(
      this.app.workspace.on("keydown", () => this.recordActivity()),
    );

    // Register custom view for encrypted files
    this.encryptionViewType = this.registerView(
      "sankrypt-encryption-view",
      (leaf) => new SankryptEncryptionView(leaf, this),
      true,
    );

    // Register file extension handler
    this.registerExtensions(["skenc"], "sankrypt-encryption-view");

    // Override file open behavior for .skenc files
    this.registerEvent(
      this.app.workspace.on("file-open", async (file) => {
        if (file && file.path.endsWith(".skenc")) {
          await this.openEncryptedFile(file);
        }
      }),
    );

    // Add ribbon icon
    this.addRibbonIcon("shield", "Sankrypt", () => this.showControlPanel());

    // Register plugin commands
    this.registerCommands();

    // Initialize status bar
    this.statusBar = this.addStatusBarItem();
    this.updateStatusBar();

    // Apply settings
    this.addSettingTab(new SankryptSettingsTab(this.app, this));
    this.applyExplorerStyles();
    this.resetAutoLockTimer();

    console.log("Sankrypt v1.0 loaded successfully!");
    new obsidian.Notice("Sankrypt v1.0 loaded");
  }

  /**
   * Registers all plugin commands with hotkeys
   */
  registerCommands() {
    // Encrypt current file command
    this.addCommand({
      id: "sankrypt-encrypt-current",
      name: "Encrypt current file",
      icon: "lock",
      hotkeys: [{ modifiers: ["Ctrl", "Shift"], key: "E" }],
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        if (file && !file.path.endsWith(".skenc")) {
          if (!checking) this.encryptFile(file);
          return true;
        }
        return false;
      },
    });

    // Decrypt current file command with block check
    this.addCommand({
      id: "sankrypt-decrypt-current",
      name: "Decrypt current file",
      icon: "unlock",
      hotkeys: [{ modifiers: ["Ctrl", "Shift"], key: "D" }],
      checkCallback: (checking) => {
        const activeFile = this.app.workspace.getActiveFile();
        let isEncrypted = false;
        let targetFile = null;

        if (activeFile && activeFile.path.endsWith(".skenc")) {
          isEncrypted = true;
          targetFile = activeFile;
        } else {
          const activeLeaf = this.app.workspace.activeLeaf;
          if (activeLeaf && activeLeaf.view instanceof SankryptEncryptionView) {
            const encryptionView = activeLeaf.view;
            if (
              encryptionView.file &&
              encryptionView.file.path.endsWith(".skenc")
            ) {
              isEncrypted = true;
              targetFile = encryptionView.file;
            }
          }
        }

        // Check if file is blocked from decryption attempts
        if (targetFile && this.isFileBlocked(targetFile)) {
          if (!checking) {
            const remainingSeconds = Math.ceil(
              (this.lastBlockedFile.blockedUntil - Date.now()) / 1000,
            );
            new obsidian.Notice(
              `Decryption blocked for ${remainingSeconds} more seconds`,
            );
          }
          return false;
        }

        if (isEncrypted) {
          if (!checking) this.decryptFile(targetFile);
          return true;
        }
        return false;
      },
    });

    // Browse encrypted files command
    this.addCommand({
      id: "sankrypt-show-files",
      name: "Show encrypted files",
      icon: "folder-search",
      hotkeys: [{ modifiers: ["Ctrl", "Shift", "Alt"], key: "F" }],
      callback: () => this.showEncryptedFilesBrowser(),
    });

    // Lock vault command
    this.addCommand({
      id: "sankrypt-lock-vault",
      name: "Lock vault",
      icon: "lock-open",
      callback: () => this.lockVault(),
    });

    // Change password command
    this.addCommand({
      id: "sankrypt-change-password",
      name: "Change master password",
      icon: "key",
      callback: () => this.changeMasterPassword(),
    });
  }

  /**
   * Plugin cleanup - clears passwords and timers
   */
  async onunload() {
    console.log("Sankrypt unloading...");
    this.lockVault();
    if (this.autoLockTimer) clearInterval(this.autoLockTimer);
    if (this.blockedStatusInterval) {
      clearInterval(this.blockedStatusInterval);
      this.blockedStatusInterval = null;
    }
  }

  /**
   * Checks if a file is temporarily blocked from decryption attempts
   * @param {TFile} file - The file to check
   * @returns {boolean} True if file is blocked
   */
  isFileBlocked(file) {
    if (!this.lastBlockedFile) return false;
    const now = Date.now();

    // Clear expired blocks
    if (now >= this.lastBlockedFile.blockedUntil) {
      this.lastBlockedFile = null;
      return false;
    }

    return file.path === this.lastBlockedFile.filePath;
  }

  // ========== SETTINGS MANAGEMENT ==========

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  // ========== PASSWORD MANAGEMENT ==========

  /**
   * Ensures master password is available, prompts if not set
   * @param {boolean} forceNew - Force new password entry
   * @param {boolean} skipConfirmation - Skip password confirmation
   * @returns {Promise<boolean>} True if password is available
   */
  async ensureMasterPassword(forceNew = false, skipConfirmation = false) {
    // Return if password already in memory and not forcing new
    if (this.masterPassword && !forceNew) return true;

    const encryptedFiles = this.getAllEncryptedFiles();
    const hasExistingFiles = encryptedFiles.length > 0;

    // Verify against existing files if any exist
    if (hasExistingFiles && (forceNew || !this.masterPassword)) {
      return await this.verifyAgainstExistingFile();
    }

    // Show password hint if available
    if (this.settings.passwordHint && !forceNew && !hasExistingFiles) {
      const useHint = await this.confirmAction(
        "Password Hint Available",
        `Your saved hint: "${this.settings.passwordHint}"\n\nDo you want to use this hint or enter a new password?`,
        ["Use Hint", "Enter New Password"],
      );
      if (useHint === "Enter New Password") forceNew = true;
    }

    let password = "";
    let maxAttempts = 3;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const modal = new PasswordModal(this.app, "Set Master Password", {
        showStrength: true,
      });
      password = await modal.open();
      if (!password) return false;

      // Validate password strength
      const validation = SankryptCrypto.validatePassword(password);
      if (!validation.isValid) {
        const issues = validation.issues.join("\n• ");
        await this.showErrorModal(
          "Password Requirements",
          `Password does not meet requirements:\n\n• ${issues}\n\nStrength: ${validation.strength}/100`,
        );
        attempts++;
        if (attempts >= maxAttempts) {
          new obsidian.Notice(
            "Too many failed attempts. Please try again later.",
          );
          return false;
        }
        continue;
      }

      // Confirm password for first-time setup
      if (!skipConfirmation) {
        const confirmModal = new PasswordModal(
          this.app,
          "Confirm Master Password",
          {
            showStrength: false,
          },
        );
        const confirmPassword = await confirmModal.open();
        if (!confirmPassword) return false;

        if (password !== confirmPassword) {
          attempts++;
          const remaining = maxAttempts - attempts;
          new obsidian.Notice("Passwords do not match");
          await sleep(1000);

          if (remaining > 0) {
            const retry = await this.confirmAction(
              "Passwords Don't Match",
              `Passwords do not match. Would you like to try again?`,
              ["Try Again", "Cancel"],
            );
            if (retry !== "Try Again") return false;
            continue;
          } else {
            await this.showErrorModal(
              "Too Many Failed Attempts",
              "Passwords did not match after multiple attempts. Please start over.",
            );
            return false;
          }
        }
      }

      try {
        // Test encryption/decryption with the new password
        const test = "Sankrypt encryption test";
        const encrypted = await SankryptCrypto.encrypt(test, password);
        await SankryptCrypto.decrypt(encrypted, password);

        this.masterPassword = password;
        this.updateStatusBar();
        new obsidian.Notice("Master password set successfully");

        // Prompt for hint on first setup
        if (
          (!this.settings.passwordHint || forceNew) &&
          !skipConfirmation &&
          !hasExistingFiles
        ) {
          const hint = await this.promptForHint();
          if (hint) {
            this.settings.passwordHint = hint;
            await this.saveSettings();
          }
        }

        return true;
      } catch (error) {
        console.error("Password setup error:", error);
        new obsidian.Notice("Failed to set master password");
        return false;
      }
    }

    return false;
  }

  /**
   * Verifies password against existing encrypted files
   * @returns {Promise<boolean>} True if password is valid
   */
  async verifyAgainstExistingFile() {
    const encryptedFiles = this.getAllEncryptedFiles();
    if (encryptedFiles.length === 0) return true;

    const file = encryptedFiles[0];
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      const modal = new PasswordModal(this.app, "Verify Master Password", {
        showStrength: false,
        isConfirm: true,
      });
      const password = await modal.open();
      if (!password) return false;

      try {
        const encrypted = await this.app.vault.read(file);
        await SankryptCrypto.decrypt(encrypted, password);

        this.masterPassword = password;
        this.updateStatusBar();
        this.resetAutoLockTimer();

        await this.showSuccessModal(
          "Password Verified",
          `Successfully verified password against existing encrypted files.\n\nYou have ${encryptedFiles.length} encrypted file(s) that will use this master password.`,
        );

        return true;
      } catch (error) {
        attempts++;
        const remaining = maxAttempts - attempts;

        if (remaining > 0) {
          const retry = await this.confirmAction(
            "Wrong Password",
            `The password doesn't match existing encrypted files.\n${remaining} attempt(s) remaining.\n\nTry again?`,
            ["Try Again", "Cancel"],
          );
          if (retry !== "Try Again") return false;
        } else {
          await this.showErrorModal(
            "Access Denied",
            "Too many failed attempts.\n\nYou must provide the correct password for existing encrypted files.",
          );
          return false;
        }
      }
    }

    return false;
  }

  /**
   * Displays success modal with check icon
   */
  async showSuccessModal(title, message) {
    return new Promise((resolve) => {
      const modal = new (class extends obsidian.Modal {
        constructor(app, title, message) {
          super(app);
          this.title = title;
          this.message = message;
        }

        onOpen() {
          const { contentEl } = this;
          contentEl.empty();
          contentEl.addClass("sankrypt-modal");

          // Header with success icon using createEl
          const header = contentEl.createDiv({
            attr: {
              style:
                "display: flex; align-items: center; gap: 10px; margin-bottom: 20px;",
            },
          });

          const iconDiv = header.createDiv();
          const checkSvg = iconDiv.createEl("svg", {
            attr: {
              xmlns: "http://www.w3.org/2000/svg",
              width: "24",
              height: "24",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              "stroke-width": "2",
              "stroke-linecap": "round",
              "stroke-linejoin": "round",
            },
          });
          checkSvg.createEl("path", {
            attr: { d: "M22 11.08V12a10 10 0 1 1-5.93-9.14" },
          });
          checkSvg.createEl("path", { attr: { d: "m9 11 3 3L22 4" } });
          checkSvg.style.color = "#10b981";

          header.createEl("h3", {
            text: title,
            attr: { style: "margin: 0; color: #10b981;" },
          });

          contentEl.createEl("div", {
            text: message,
            attr: {
              style:
                "white-space: pre-line; margin: 15px 0; padding: 15px; background: rgba(16, 185, 129, 0.1); border-radius: 6px; border-left: 4px solid #10b981;",
            },
          });

          const button = contentEl.createEl("button", {
            text: "OK",
            cls: "mod-cta",
            attr: {
              style: "float: right; padding: 8px 16px; background: #10b981;",
            },
          });
          button.addEventListener("click", () => {
            this.close();
            resolve();
          });
        }

        onClose() {
          const { contentEl } = this;
          contentEl.empty();
          resolve();
        }
      })(this.app, title, message);

      modal.open();
    });
  }

  /**
   * Prompts user for password hint
   * @returns {Promise<string>} The hint text or empty string
   */
  async promptForHint() {
    return new Promise((resolve) => {
      const modal = new (class extends obsidian.Modal {
        constructor(app) {
          super(app);
          this.hint = "";
        }

        onOpen() {
          const { contentEl } = this;
          contentEl.empty();
          contentEl.addClass("sankrypt-modal");

          // Header with hint icon using createEl
          const header = contentEl.createDiv({
            attr: {
              style:
                "display: flex; align-items: center; gap: 10px; margin-bottom: 20px;",
            },
          });

          const iconDiv = header.createDiv();
          const hintSvg = iconDiv.createEl("svg", {
            attr: {
              xmlns: "http://www.w3.org/2000/svg",
              width: "24",
              height: "24",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              "stroke-width": "2",
              "stroke-linecap": "round",
              "stroke-linejoin": "round",
            },
          });
          hintSvg.createEl("circle", { attr: { cx: "12", cy: "12", r: "10" } });
          hintSvg.createEl("path", {
            attr: { d: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" },
          });
          hintSvg.createEl("path", { attr: { d: "M12 17h.01" } });
          hintSvg.style.color = "var(--text-accent)";

          header.createEl("h3", {
            text: "Password Hint",
            attr: { style: "margin: 0;" },
          });

          contentEl.createEl("p", {
            text: "Create a hint to help you remember your password. This hint is stored locally and is NOT encrypted with your password.",
          });

          const textarea = contentEl.createEl("textarea", {
            attr: {
              placeholder:
                'e.g., "My first pet\'s name + year I graduated college"',
              style:
                "width: 100%; height: 80px; padding: 12px; margin: 15px 0; border-radius: 6px; border: 1px solid var(--background-modifier-border); resize: vertical;",
            },
          });

          setTimeout(() => textarea.focus(), 10);

          const buttonContainer = contentEl.createDiv({
            attr: {
              style: "display: flex; justify-content: flex-end; gap: 10px;",
            },
          });

          const skipBtn = buttonContainer.createEl("button", {
            text: "Skip",
            attr: { style: "padding: 8px 16px;" },
          });
          skipBtn.addEventListener("click", () => {
            this.hint = "";
            this.close();
            resolve("");
          });

          const saveBtn = buttonContainer.createEl("button", {
            text: "Save Hint",
            cls: "mod-cta",
            attr: { style: "padding: 8px 16px;" },
          });
          saveBtn.addEventListener("click", () => {
            this.hint = textarea.value.trim();
            this.close();
            resolve(this.hint);
          });
        }

        onClose() {
          const { contentEl } = this;
          contentEl.empty();
          resolve(this.hint);
        }
      })(this.app);
      modal.open();
    });
  }

  /**
   * Changes the master password and re-encrypts all files
   */
  async changeMasterPassword() {
    if (!this.masterPassword) {
      new obsidian.Notice("No master password set");
      return;
    }

    // Verify current password
    const modal = new PasswordModal(this.app, "Enter Current Password");
    const current = await modal.open();

    if (current !== this.masterPassword) {
      // Try to verify against actual encrypted files
      const encryptedFiles = this.getAllEncryptedFiles();
      if (encryptedFiles.length > 0) {
        try {
          const encrypted = await this.app.vault.read(encryptedFiles[0]);
          await SankryptCrypto.decrypt(encrypted.substring(0, 200), current);
          this.masterPassword = current;
        } catch (error) {
          new obsidian.Notice("Incorrect current password");
          return;
        }
      } else {
        new obsidian.Notice("Incorrect current password");
        return;
      }
    }

    // Get new password
    const newPassword = await this.promptForNewPassword();
    if (!newPassword) return;

    if (newPassword === current) {
      new obsidian.Notice(
        "New password cannot be the same as current password",
      );
      return;
    }

    // Re-encrypt all files with new password
    const encryptedFiles = this.getAllEncryptedFiles();
    if (encryptedFiles.length > 0) {
      const confirmed = await this.confirmAction(
        "Re-encrypt All Files",
        `This will re-encrypt ${encryptedFiles.length} file(s) with the new password.\n\nIMPORTANT: All files must use the same master password.`,
        ["Re-encrypt All", "Cancel"],
      );

      if (confirmed === "Re-encrypt All") {
        let successCount = 0;
        let failCount = 0;

        for (const file of encryptedFiles) {
          try {
            const content = await this.app.vault.read(file);
            const decrypted = await SankryptCrypto.decrypt(content, current);
            const reencrypted = await SankryptCrypto.encrypt(
              decrypted,
              newPassword,
            );
            await this.app.vault.modify(file, reencrypted);
            successCount++;
          } catch (error) {
            console.error(`Failed to re-encrypt ${file.name}:`, error);
            failCount++;
          }
        }

        if (failCount > 0) {
          await this.showErrorModal(
            "Partial Success",
            `Re-encrypted ${successCount} files, but ${failCount} failed.\n\nThis may indicate that some files use different passwords.`,
          );
        }

        this.masterPassword = newPassword;
        this.updateStatusBar();
        new obsidian.Notice(`Password changed. ${successCount} files updated.`);
      }
    } else {
      this.masterPassword = newPassword;
      this.updateStatusBar();
      new obsidian.Notice("Master password changed successfully");
    }
  }

  /**
   * Prompts for new password with validation
   * @returns {Promise<string|null>} New password or null if cancelled
   */
  async promptForNewPassword() {
    const modal = new PasswordModal(this.app, "Set New Master Password", {
      showStrength: true,
    });
    const password = await modal.open();
    if (!password) return null;

    const validation = SankryptCrypto.validatePassword(password);
    if (!validation.isValid) {
      const issues = validation.issues.join("\n• ");
      await this.showErrorModal(
        "Password Requirements",
        `Password does not meet requirements:\n\n• ${issues}\n\nStrength: ${validation.strength}/100`,
      );
      return null;
    }

    const confirmModal = new PasswordModal(
      this.app,
      "Confirm New Master Password",
      {
        showStrength: false,
      },
    );
    const confirmPassword = await confirmModal.open();
    if (confirmPassword !== password) {
      new obsidian.Notice("Passwords do not match");
      return null;
    }

    return password;
  }

  /**
   * Locks the vault by clearing password from memory
   */
  lockVault() {
    this.masterPassword = null;
    this.updateStatusBar();
    this.resetAutoLockTimer();
    new obsidian.Notice("Vault locked - Passwords cleared from memory");
  }

  // ========== FILE OPERATIONS ==========

  /**
   * Gets all encrypted files in the vault
   * @returns {TFile[]} Array of encrypted .skenc files
   */
  getAllEncryptedFiles() {
    return this.app.vault
      .getFiles()
      .filter((file) => file.path.endsWith(".skenc"));
  }

  /**
   * Opens an encrypted file in the dedicated viewer
   * @param {TFile} file - The encrypted file to open
   */
  async openEncryptedFile(file) {
    // Check if already open
    const leaves = this.app.workspace.getLeavesOfType(
      "sankrypt-encryption-view",
    );
    for (const leaf of leaves) {
      const view = leaf.view;
      if (
        view instanceof SankryptEncryptionView &&
        view.file &&
        view.file.path === file.path
      ) {
        this.app.workspace.revealLeaf(leaf);
        return;
      }
    }

    // Open in new view
    const leaf = this.app.workspace.getLeaf(true);
    await leaf.setViewState({
      type: "sankrypt-encryption-view",
      active: true,
      state: { file: file.path },
    });
  }

  /**
   * Encrypts a file with the master password
   * @param {TFile} file - The file to encrypt
   */
  async encryptFile(file) {
    try {
      if (!(await this.ensureMasterPassword())) return;

      const encryptedPath = file.path + ".skenc";
      const existingEncrypted =
        this.app.vault.getAbstractFileByPath(encryptedPath);
      let finalEncryptedPath = encryptedPath;
      let useGeneratedName = false;

      // Handle filename conflicts
      if (existingEncrypted) {
        const randomSuffix = this.generateRandomSuffix(4);
        finalEncryptedPath = await this.generateUniqueFilename(
          file.path,
          randomSuffix,
          true,
        );

        const useUnique = await this.confirmAction(
          "File Conflict",
          `An encrypted file already exists at:\n${encryptedPath}\n\nCreate new encrypted file at:\n${finalEncryptedPath}\n\nProceed?`,
          ["Create New", "Cancel"],
        );

        if (useUnique !== "Create New") return;
        useGeneratedName = true;
      }

      // Confirm encryption
      const confirmed = await this.confirmAction(
        "Encrypt File",
        `Encrypt "${file.name}"?\n\nOriginal: ${file.path}\nEncrypted: ${finalEncryptedPath}`,
        ["Encrypt", "Cancel"],
      );

      if (confirmed !== "Encrypt") return;

      // Perform encryption
      const content = await this.app.vault.read(file);
      const encrypted = await SankryptCrypto.encrypt(
        content,
        this.masterPassword,
      );
      await this.app.vault.create(finalEncryptedPath, encrypted);
      this.encryptedFiles.add(finalEncryptedPath);

      // Handle original file based on settings
      const action = this.settings.defaultAction;
      if (action === "ask") {
        const choice = await this.confirmAction(
          "Original File",
          "What would you like to do with the original file?",
          ["Delete It", "Keep Both", "Cancel"],
        );

        if (choice === "Delete It") {
          await this.app.vault.delete(file);
        } else if (choice === "Cancel") {
          await this.app.vault.delete(
            this.app.vault.getAbstractFileByPath(finalEncryptedPath),
          );
          return;
        }
      } else if (action === "remove") {
        // Close file tab before deleting
        const leaves = this.app.workspace.getLeavesOfType("markdown");
        for (const leaf of leaves) {
          if (leaf.view?.file?.path === file.path) {
            await leaf.detach();
            break;
          }
        }
        await this.app.vault.delete(file);
      }

      // Open encrypted file if enabled
      if (this.settings.showEncryptedInExplorer) {
        const encryptedFile =
          this.app.vault.getAbstractFileByPath(finalEncryptedPath);
        if (encryptedFile) {
          await this.openEncryptedFile(encryptedFile);
        }
      }

      this.updateStatusBar();
      const encryptedFilename = finalEncryptedPath.split("/").pop();
      if (useGeneratedName) {
        new obsidian.Notice(`"${file.name}" encrypted → ${encryptedFilename}`);
      } else {
        new obsidian.Notice(`"${file.name}" encrypted`);
      }
    } catch (error) {
      console.error("Sankrypt encryption error:", error);
      new obsidian.Notice(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypts an encrypted file with password verification
   * @param {TFile} file - The encrypted file to decrypt
   * @param {string} password - Optional password (prompts if not provided)
   * @param {number} retryCount - Internal retry counter
   * @param {number} blockedUntil - Timestamp when block expires
   */
  async decryptFile(
    file,
    password = null,
    retryCount = 0,
    blockedUntil = null,
  ) {
    const MAX_RETRIES = 3;
    const BLOCK_TIME = 60000;

    // Check if blocked due to too many attempts
    if (blockedUntil && Date.now() < blockedUntil) {
      const remainingSeconds = Math.ceil((blockedUntil - Date.now()) / 1000);
      await this.showErrorModal(
        "Too Many Failed Attempts",
        `Please wait ${remainingSeconds} seconds before trying again.`,
      );
      return;
    }

    try {
      if (!password) {
        password = this.masterPassword;
        if (!password) {
          const modal = new PasswordModal(this.app, "Enter Master Password");
          password = await modal.open();
          if (!password) return;
        }
      }

      // Read and decrypt file
      const encrypted = await this.app.vault.read(file);
      const decrypted = await SankryptCrypto.decrypt(encrypted, password);

      // Store password in memory if not already stored
      if (!this.masterPassword) {
        this.masterPassword = password;
        this.updateStatusBar();
        this.resetAutoLockTimer();

        // Verify password works with other files (non-critical)
        try {
          await this.verifyPasswordWithOtherFiles(password);
        } catch (error) {
          console.warn(
            "Sankrypt: Non-critical password verification issue:",
            error.message,
          );
        }
      }

      // Generate decrypted file path
      const decryptedPath = file.path.replace(".skenc", "");
      const existingDecrypted =
        this.app.vault.getAbstractFileByPath(decryptedPath);
      let finalDecryptedPath = decryptedPath;
      let useGeneratedName = false;

      // Handle filename conflicts
      if (existingDecrypted) {
        const randomSuffix = this.generateRandomSuffix(4);
        finalDecryptedPath = await this.generateUniqueFilename(
          file.path,
          randomSuffix,
          false,
        );

        const useUnique = await this.confirmAction(
          "File Conflict",
          `A file already exists at:\n${decryptedPath}\n\nCreate decrypted file at:\n${finalDecryptedPath}\n\nProceed?`,
          ["Create New", "Cancel"],
        );

        if (useUnique !== "Create New") {
          new obsidian.Notice("Decryption cancelled");
          return;
        }
        useGeneratedName = true;
      }

      // Save decrypted file
      await this.app.vault.create(finalDecryptedPath, decrypted);
      this.encryptedFiles.delete(file.path);

      // Clean up encrypted file and views
      await this.app.vault.delete(file);
      const leaves = this.app.workspace.getLeavesOfType(
        "sankrypt-encryption-view",
      );
      for (const leaf of leaves) {
        if (leaf.view.file && leaf.view.file.path === file.path) {
          await leaf.detach();
          break;
        }
      }

      // Open decrypted file
      const decryptedFile =
        this.app.vault.getAbstractFileByPath(finalDecryptedPath);
      if (decryptedFile) {
        await this.app.workspace.getLeaf().openFile(decryptedFile);
      }

      this.updateStatusBar();
      const decryptedFilename = finalDecryptedPath.split("/").pop();
      const originalName = file.name.replace(".skenc", "");

      if (useGeneratedName) {
        new obsidian.Notice(
          `"${originalName}" decrypted → ${decryptedFilename}`,
        );
      } else {
        new obsidian.Notice(`"${originalName}" decrypted`);
      }
    } catch (error) {
      console.error("Sankrypt decryption error:", error);

      // Handle wrong password with retry logic
      if (retryCount < MAX_RETRIES) {
        const isWrongPassword =
          error.message.includes("wrong key") ||
          error.message.includes("Incorrect password") ||
          error.message.includes("OperationError") ||
          error.message.includes("decryption failed");

        if (isWrongPassword) {
          const attemptsLeft = MAX_RETRIES - retryCount - 1;
          const modal = new PasswordModal(
            this.app,
            `Wrong Password (${attemptsLeft} attempt${attemptsLeft !== 1 ? "s" : ""} left)`,
            { showStrength: false },
          );

          const newPassword = await modal.open();
          if (newPassword) {
            return this.decryptFile(
              file,
              newPassword,
              retryCount + 1,
              blockedUntil,
            );
          } else {
            new obsidian.Notice("Decryption cancelled");
            return;
          }
        }
      }

      // Block further attempts after max retries
      if (retryCount >= MAX_RETRIES) {
        const blockUntil = Date.now() + BLOCK_TIME;
        await this.showErrorModal(
          "Too Many Failed Attempts",
          `Decryption is temporarily blocked for 1 minute.\n\nSecurity measures:\n• 3 failed password attempts detected\n• 60-second timeout activated\n• This prevents brute-force attacks\n\nPlease try again after the timeout expires.`,
        );

        this.lastBlockedFile = {
          filePath: file.path,
          blockedUntil: blockUntil,
        };

        this.showBlockedStatus(file, blockUntil);
        return;
      }

      new obsidian.Notice(
        "Decryption failed. File may be corrupted or wrong password.",
      );
    }
  }

  /**
   * Verifies password consistency across multiple files
   * @param {string} password - Password to verify
   */
  async verifyPasswordWithOtherFiles(password) {
    const encryptedFiles = this.getAllEncryptedFiles();
    if (encryptedFiles.length <= 1) return;

    let verifiedFiles = 0;
    let failedFiles = 0;
    const maxFilesToCheck = Math.min(2, encryptedFiles.length - 1);

    for (let i = 0; i < maxFilesToCheck; i++) {
      try {
        const file = encryptedFiles[i];
        const encrypted = await this.app.vault.read(file);
        await SankryptCrypto.decrypt(encrypted, password);
        verifiedFiles++;
      } catch (error) {
        failedFiles++;
        console.debug(
          `Sankrypt: Password verification failed for file ${i}:`,
          error.message,
        );
      }
    }

    // Show warning if password doesn't work for all files
    if (maxFilesToCheck > 0 && failedFiles > 0 && verifiedFiles > 0) {
      setTimeout(() => {
        new obsidian.Notice(
          `⚠️ Password works for ${verifiedFiles + 1} file(s) but failed for ${failedFiles}.`,
          5000,
        );
      }, 1000);
    }
  }

  /**
   * Checks password consistency across files
   * @param {string} password - Password to check
   * @returns {Object} Consistency check results
   */
  async checkPasswordConsistency(password) {
    const encryptedFiles = this.getAllEncryptedFiles();
    let workingCount = 0;
    let failedCount = 0;

    const testFiles = encryptedFiles.slice(
      0,
      Math.min(3, encryptedFiles.length),
    );
    for (const file of testFiles) {
      try {
        const encrypted = await this.app.vault.read(file);
        await SankryptCrypto.decrypt(encrypted.substring(0, 200), password);
        workingCount++;
      } catch (error) {
        failedCount++;
      }
    }

    return {
      consistent: failedCount === 0,
      workingCount,
      failedCount,
      totalFiles: encryptedFiles.length,
    };
  }

  /**
   * Shows blocked status in status bar
   * @param {TFile} file - The blocked file
   * @param {number} blockedUntil - Timestamp when block expires
   */
  showBlockedStatus(file, blockedUntil) {
    if (this.blockedStatusInterval) {
      clearInterval(this.blockedStatusInterval);
    }

    const updateStatus = () => {
      const now = Date.now();
      if (now >= blockedUntil) {
        if (this.blockedStatusInterval) {
          clearInterval(this.blockedStatusInterval);
          this.blockedStatusInterval = null;
        }
        this.updateStatusBar();
        return;
      }

      const remainingSeconds = Math.ceil((blockedUntil - now) / 1000);

      if (this.statusBar) {
        this.statusBar.empty();
        const container = document.createElement("div");
        container.style.cssText = `
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          padding: 2px 6px;
          border-radius: 4px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
        `;

        const icon = container.createDiv();
        const alertSvg = icon.createEl("svg", {
          attr: {
            xmlns: "http://www.w3.org/2000/svg",
            width: "14",
            height: "14",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            "stroke-width": "2",
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
          },
        });
        alertSvg.createEl("circle", { attr: { cx: "12", cy: "12", r: "10" } });
        alertSvg.createEl("line", {
          attr: { x1: "12", x2: "12", y1: "8", y2: "12" },
        });
        alertSvg.createEl("line", {
          attr: { x1: "12", x2: "12.01", y1: "16", y2: "16" },
        });
        alertSvg.style.color = "#ef4444";

        const text = container.createEl("span", {
          text: `Blocked (${remainingSeconds}s)`,
          attr: { style: "font-size: 12px; font-weight: 500; color: #ef4444;" },
        });

        container.appendChild(icon);
        container.appendChild(text);
        this.statusBar.appendChild(container);

        container.onclick = () => {
          this.showErrorModal(
            "Decryption Blocked",
            `Decryption attempts are temporarily blocked.\n\n• File: ${file.name}\n• Time remaining: ${remainingSeconds} seconds\n• Reason: Too many failed password attempts`,
          );
        };
      }
    };

    updateStatus();
    this.blockedStatusInterval = setInterval(updateStatus, 1000);
  }

  // ========== UI COMPONENTS ==========

  /**
   * Updates the status bar with encryption status
   */
  updateStatusBar() {
    const encryptedFiles = this.getAllEncryptedFiles();
    this.statusBar.empty();

    const container = document.createElement("div");
    container.style.cssText =
      "display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 2px 6px; border-radius: 4px;";

    container.addEventListener("mouseenter", () => {
      container.style.background = "var(--background-modifier-hover)";
    });

    container.addEventListener("mouseleave", () => {
      container.style.background = "transparent";
    });

    // Create icon using createEl
    const icon = document.createElement("div");
    if (this.masterPassword) {
      const lockSvg = icon.createEl("svg", {
        attr: {
          xmlns: "http://www.w3.org/2000/svg",
          width: "14",
          height: "14",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          "stroke-width": "2",
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
        },
      });
      lockSvg.createEl("rect", {
        attr: { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2" },
      });
      lockSvg.createEl("path", { attr: { d: "M7 11V7a5 5 0 0 1 10 0v4" } });
      lockSvg.style.color = "var(--text-accent)";
    } else {
      const unlockSvg = icon.createEl("svg", {
        attr: {
          xmlns: "http://www.w3.org/2000/svg",
          width: "14",
          height: "14",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          "stroke-width": "2",
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
        },
      });
      unlockSvg.createEl("rect", {
        attr: { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2" },
      });
      unlockSvg.createEl("path", { attr: { d: "M7 11V7a5 5 0 0 1 9.9-1" } });
      unlockSvg.style.color = "var(--text-muted)";
    }

    const text = document.createElement("span");
    text.style.fontSize = "12px";
    text.style.fontWeight = "500";

    if (this.masterPassword) {
      text.textContent = `${encryptedFiles.length} enc`;
      text.style.color = "var(--text-accent)";
      container.title = `Sankrypt: Master password set\n${encryptedFiles.length} encrypted files\nClick for menu`;
    } else {
      text.textContent = "Sankrypt";
      text.style.color = "var(--text-muted)";
      container.title =
        "Sankrypt: No master password set\nClick to set password";
    }

    container.appendChild(icon);
    container.appendChild(text);
    this.statusBar.appendChild(container);
    container.onclick = () => this.showControlPanel();
  }

  /**
   * Shows encrypted files browser modal
   */
  async showEncryptedFilesBrowser() {
    const encryptedFiles = this.getAllEncryptedFiles();
    if (encryptedFiles.length === 0) {
      new obsidian.Notice("No encrypted files found");
      return;
    }

    const browser = new FileBrowserModal(this.app, encryptedFiles, this);
    browser.open("decrypt");
  }

  /**
   * Shows main control panel modal
   */
  showControlPanel() {
    const modal = new (class extends obsidian.Modal {
      constructor(app, plugin) {
        super(app);
        this.plugin = plugin;
      }

      onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass("sankrypt-control-panel");

        // Header with branding using createEl
        const header = contentEl.createDiv({
          attr: { style: "text-align: center; margin-bottom: 30px;" },
        });

        const iconDiv = header.createDiv();
        const shieldSvg = iconDiv.createEl("svg", {
          attr: {
            xmlns: "http://www.w3.org/2000/svg",
            width: "48",
            height: "48",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            "stroke-width": "2",
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
          },
        });
        shieldSvg.createEl("path", {
          attr: {
            d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
          },
        });
        shieldSvg.style.color = "var(--text-accent)";
        iconDiv.style.marginBottom = "15px";

        header.createEl("h1", {
          text: "Sankrypt",
          attr: { style: "margin: 0 0 8px 0; color: var(--text-accent);" },
        });

        header.createEl("div", {
          text: "Professional Encryption",
          attr: {
            style:
              "color: var(--text-muted); font-size: 14px; margin-bottom: 20px;",
          },
        });

        // Status card
        const encryptedFiles = this.plugin.getAllEncryptedFiles();
        const statusCard = contentEl.createDiv({
          attr: {
            style: `
              background: var(--background-secondary);
              border-radius: 10px;
              padding: 20px;
              margin: 0 0 30px 0;
              border-left: 4px solid ${this.plugin.masterPassword ? "#10b981" : "#ef4444"};
              display: flex;
              align-items: center;
              gap: 15px;
            `,
          },
        });

        const statusIcon = statusCard.createDiv();
        if (this.plugin.masterPassword) {
          const checkSvg = statusIcon.createEl("svg", {
            attr: {
              xmlns: "http://www.w3.org/2000/svg",
              width: "32",
              height: "32",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              "stroke-width": "2",
              "stroke-linecap": "round",
              "stroke-linejoin": "round",
            },
          });
          checkSvg.createEl("path", {
            attr: {
              d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
            },
          });
          checkSvg.createEl("path", { attr: { d: "m9 12 2 2 4-4" } });
          checkSvg.style.color = "#10b981";
        } else {
          const alertSvg = statusIcon.createEl("svg", {
            attr: {
              xmlns: "http://www.w3.org/2000/svg",
              width: "32",
              height: "32",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              "stroke-width": "2",
              "stroke-linecap": "round",
              "stroke-linejoin": "round",
            },
          });
          alertSvg.createEl("circle", {
            attr: { cx: "12", cy: "12", r: "10" },
          });
          alertSvg.createEl("line", {
            attr: { x1: "12", x2: "12", y1: "8", y2: "12" },
          });
          alertSvg.createEl("line", {
            attr: { x1: "12", x2: "12.01", y1: "16", y2: "16" },
          });
          alertSvg.style.color = "#ef4444";
        }

        const statusInfo = statusCard.createDiv();
        statusInfo.style.flex = "1";

        if (this.plugin.masterPassword) {
          statusInfo.createEl("div", {
            text: "Master password set",
            attr: {
              style:
                "font-weight: bold; font-size: 16px; color: #10b981; margin-bottom: 5px;",
            },
          });

          statusInfo.createEl("div", {
            text: `${encryptedFiles.length} encrypted files`,
            attr: {
              style:
                "font-size: 14px; color: var(--text-normal); margin-bottom: 5px;",
            },
          });

          if (this.plugin.settings.passwordHint) {
            statusInfo.createEl("div", {
              text: `Hint: ${this.plugin.settings.passwordHint}`,
              attr: {
                style:
                  "font-size: 12px; color: var(--text-muted); font-style: italic;",
              },
            });
          }
        } else {
          statusInfo.createEl("div", {
            text: "No master password set",
            attr: {
              style:
                "font-weight: bold; font-size: 16px; color: #ef4444; margin-bottom: 5px;",
            },
          });

          statusInfo.createEl("div", {
            text: "Set a master password to start encrypting files",
            attr: { style: "font-size: 14px; color: var(--text-normal);" },
          });
        }

        // Quick Actions Grid
        contentEl.createEl("h3", {
          text: "Quick Actions",
          attr: {
            style:
              "margin: 0 0 15px 0; font-size: 16px; color: var(--text-normal);",
          },
        });

        const actionsGrid = contentEl.createDiv({
          attr: {
            style:
              "display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin: 0 0 30px 0;",
          },
        });

        // Define action buttons using custom icons
        const actions = [
          {
            icon: this.plugin.masterPassword ? "LOCK" : "KEY",
            title: this.plugin.masterPassword
              ? "Encrypt Current"
              : "Set Password",
            desc: this.plugin.masterPassword
              ? "Encrypt the currently open file"
              : "Set a master password to begin",
            action: () => {
              this.close();
              if (this.plugin.masterPassword) {
                const file = this.plugin.app.workspace.getActiveFile();
                if (file) this.plugin.encryptFile(file);
              } else {
                this.plugin.ensureMasterPassword();
              }
            },
            color: this.plugin.masterPassword
              ? "var(--text-normal)"
              : "var(--interactive-accent)",
          },
          {
            icon: "UNLOCK",
            title: "Decrypt Current",
            desc: "Decrypt the currently open file",
            action: () => {
              this.close();
              const activeFile = this.plugin.app.workspace.getActiveFile();
              let targetFile = activeFile;

              if (!targetFile || !targetFile.path.endsWith(".skenc")) {
                const activeLeaf = this.plugin.app.workspace.activeLeaf;
                if (
                  activeLeaf &&
                  activeLeaf.view instanceof SankryptEncryptionView
                ) {
                  const encryptionView = activeLeaf.view;
                  if (
                    encryptionView.file &&
                    encryptionView.file.path.endsWith(".skenc")
                  ) {
                    targetFile = encryptionView.file;
                  }
                }
              }

              if (targetFile && targetFile.path.endsWith(".skenc")) {
                if (this.plugin.isFileBlocked(targetFile)) {
                  const remainingSeconds = Math.ceil(
                    (this.plugin.lastBlockedFile.blockedUntil - Date.now()) /
                      1000,
                  );
                  new obsidian.Notice(
                    `Decryption blocked for ${remainingSeconds} more seconds`,
                  );
                  this.plugin.showErrorModal(
                    "Decryption Blocked",
                    `This file is temporarily blocked from decryption attempts.\n\n• File: ${targetFile.name}\n• Blocked for: ${remainingSeconds} seconds\n• Reason: Too many failed password attempts\n\nPlease wait and try again.`,
                  );
                } else {
                  this.plugin.decryptFile(targetFile);
                }
              } else {
                new obsidian.Notice("No encrypted file is currently open");
              }
            },
            color: "var(--text-normal)",
            disabled: !this.plugin.masterPassword,
          },
          {
            icon: "FOLDER_SEARCH",
            title: "Browse Files",
            desc: "View and manage all encrypted files",
            action: () => {
              this.close();
              this.plugin.showEncryptedFilesBrowser();
            },
            color: "var(--text-normal)",
          },
          {
            icon: "SETTINGS",
            title: "Settings",
            desc: "Configure plugin settings",
            action: () => {
              this.close();
              this.plugin.app.setting.open();
              this.plugin.app.setting.openTabById("sankrypt");
            },
            color: "var(--text-normal)",
          },
          {
            icon: "REFRESH",
            title: "Change Password",
            desc: "Change your master password",
            action: () => {
              this.close();
              this.plugin.changeMasterPassword();
            },
            color: "var(--text-normal)",
            disabled: !this.plugin.masterPassword,
          },
          {
            icon: "LOCK_OPEN",
            title: "Lock Vault",
            desc: "Clear passwords from memory",
            action: () => {
              this.close();
              this.plugin.lockVault();
            },
            color: "var(--text-error)",
            disabled: !this.plugin.masterPassword,
          },
        ];

        // Create action buttons with custom icons
        actions.forEach((action) => {
          const actionBtn = actionsGrid.createDiv();

          // Check if decrypt action is blocked
          let isBlocked = false;
          let blockedTime = 0;

          if (action.title === "Decrypt Current") {
            const activeFile = this.plugin.app.workspace.getActiveFile();
            let targetFile = activeFile;

            if (!targetFile || !targetFile.path.endsWith(".skenc")) {
              const activeLeaf = this.plugin.app.workspace.activeLeaf;
              if (
                activeLeaf &&
                activeLeaf.view instanceof SankryptEncryptionView
              ) {
                const encryptionView = activeLeaf.view;
                if (
                  encryptionView.file &&
                  encryptionView.file.path.endsWith(".skenc")
                ) {
                  targetFile = encryptionView.file;
                }
              }
            }

            if (
              targetFile &&
              targetFile.path.endsWith(".skenc") &&
              this.plugin.isFileBlocked(targetFile)
            ) {
              isBlocked = true;
              blockedTime = Math.ceil(
                (this.plugin.lastBlockedFile.blockedUntil - Date.now()) / 1000,
              );
            }
          }

          actionBtn.style.cssText = `
          padding: 16px;
          background: var(--background-primary);
          border: 1px solid var(--background-modifier-border);
          border-radius: 8px;
          cursor: ${action.disabled || isBlocked ? "not-allowed" : "pointer"};
          opacity: ${action.disabled || isBlocked ? 0.5 : 1};
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          position: relative;
          ${isBlocked ? "border-color: #ef4444; background: rgba(239, 68, 68, 0.05);" : ""}
        `;

          // Create icon using our custom createIcon function
          const iconContainer = actionBtn.createDiv();
          const iconSvg = createIcon(
            action.icon,
            28,
            action.disabled || isBlocked ? "var(--text-muted)" : action.color,
          );
          iconContainer.appendChild(iconSvg);

          // Title
          const title = actionBtn.createEl("div", {
            text: action.title,
            attr: {
              style: `
              font-weight: 600;
              font-size: 13px;
              margin-bottom: 4px;
              ${isBlocked ? "color: #ef4444;" : ""}
            `,
            },
          });

          // Description
          const desc = actionBtn.createEl("div", {
            text: isBlocked
              ? `Blocked for ${blockedTime}s - Too many attempts`
              : action.desc,
            attr: {
              style: `
              font-size: 11px;
              color: ${isBlocked ? "#ef4444" : "var(--text-muted)"};
              line-height: 1.3;
              margin-bottom: 4px;
              ${isBlocked ? "font-weight: 600;" : ""}
            `,
            },
          });

          if (!action.disabled && !isBlocked) {
            actionBtn.addEventListener("mouseenter", () => {
              actionBtn.style.background = "var(--background-modifier-hover)";
              actionBtn.style.borderColor = "var(--interactive-accent)";
              iconSvg.style.color = "var(--interactive-accent)";
            });

            actionBtn.addEventListener("mouseleave", () => {
              actionBtn.style.background = "var(--background-primary)";
              actionBtn.style.borderColor = "var(--background-modifier-border)";
              iconSvg.style.color = action.color;
            });

            actionBtn.addEventListener("click", action.action);
          } else if (isBlocked) {
            actionBtn.title = `Decryption blocked for ${blockedTime} seconds\nToo many failed password attempts`;
            actionBtn.addEventListener("mouseenter", () => {
              actionBtn.style.background = "rgba(239, 68, 68, 0.1)";
              actionBtn.style.borderColor = "#ef4444";
            });
            actionBtn.addEventListener("mouseleave", () => {
              actionBtn.style.background = "rgba(239, 68, 68, 0.05)";
              actionBtn.style.borderColor = "#ef4444";
            });
          }
        });

        // Footer
        const footer = contentEl.createDiv({
          attr: {
            style: `
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid var(--background-modifier-border);
              text-align: center;
              font-size: 11px;
              color: var(--text-muted);
            `,
          },
        });

        footer.createEl("div", {
          text: "Hotkeys: Ctrl+Shift+E (Encrypt) | Ctrl+Shift+D (Decrypt) | Ctrl+Shift+Alt+F (Browse)",
        });
        footer.createEl("div", {
          text: "Always remember your master password! It cannot be recovered if lost.",
          attr: {
            style:
              "color: var(--text-error); margin-top: 5px; font-weight: bold;",
          },
        });

        // Close button
        const closeBtn = contentEl.createEl("button", {
          text: "Close",
          attr: {
            style:
              "width: 100%; margin-top: 15px; padding: 10px; background: var(--background-secondary); border: 1px solid var(--background-modifier-border); border-radius: 6px;",
          },
        });
        closeBtn.addEventListener("click", () => this.close());
      }

      onClose() {
        const { contentEl } = this;
        contentEl.empty();
      }
    })(this.app, this);

    modal.open();
  }

  // ========== UTILITY METHODS ==========

  /**
   * Generates a random suffix for filename conflict resolution
   * @param {number} length - Length of suffix
   * @returns {string} Random alphanumeric suffix
   */
  generateRandomSuffix(length = 4) {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Generates unique filename to avoid conflicts
   * @param {string} basePath - Original file path
   * @param {string} suffix - Optional suffix
   * @param {boolean} isEncrypting - True if encrypting, false if decrypting
   * @returns {Promise<string>} Unique file path
   */
  async generateUniqueFilename(basePath, suffix = "", isEncrypting = false) {
    const vault = this.app.vault;
    const pathParts = basePath.split("/");
    const filename = pathParts.pop();
    const dir = pathParts.join("/") || "";
    let name, extension;

    if (isEncrypting) {
      const cleanName = filename.replace(/\.skenc$/, "");
      const lastDot = cleanName.lastIndexOf(".");
      if (lastDot === -1) {
        name = cleanName;
        extension = ".skenc";
      } else {
        name = cleanName.substring(0, lastDot);
        const originalExtension = cleanName.substring(lastDot);
        extension = originalExtension + ".skenc";
      }
    } else {
      if (filename.endsWith(".skenc")) {
        const withoutSkenc = filename.slice(0, -6);
        const lastDot = withoutSkenc.lastIndexOf(".");
        if (lastDot === -1) {
          name = withoutSkenc;
          extension = "";
        } else {
          name = withoutSkenc.substring(0, lastDot);
          extension = withoutSkenc.substring(lastDot);
        }
      } else {
        const lastDot = filename.lastIndexOf(".");
        if (lastDot === -1) {
          name = filename;
          extension = "";
        } else {
          name = filename.substring(0, lastDot);
          extension = filename.substring(lastDot);
        }
      }
    }

    let counter = 1;

    // Helper function to construct path
    const makePath = (baseName, suffix, counter = null) => {
      let newName = baseName;
      if (suffix) newName += `-${suffix}`;
      if (counter !== null) newName += `-${counter}`;
      newName += extension;
      return dir ? `${dir}/${newName}` : newName;
    };

    // Try without suffix first
    if (!suffix) {
      const firstTry = makePath(name, "");
      if (!vault.getAbstractFileByPath(firstTry)) {
        return firstTry;
      }
    }

    // Try with suffix
    const suffixTry = makePath(name, suffix);
    if (!vault.getAbstractFileByPath(suffixTry)) {
      return suffixTry;
    }

    // Try with counter if suffix version exists
    while (true) {
      const numberedTry = makePath(name, suffix, counter);
      if (!vault.getAbstractFileByPath(numberedTry)) {
        return numberedTry;
      }
      counter++;
      if (counter > 100) {
        throw new Error("Could not find unique filename after 100 attempts");
      }
    }
  }

  /**
   * Applies CSS styles to encrypted files in explorer
   */
  applyExplorerStyles() {
    const existingStyle = document.getElementById("sankrypt-explorer-styles");
    if (existingStyle) existingStyle.remove();

    if (this.settings.showEncryptedInExplorer) {
      const style = document.createElement("style");
      style.id = "sankrypt-explorer-styles";
      style.textContent = `
        .nav-file-title[data-path$=".skenc"] {
          color: var(--text-accent) !important;
          font-weight: 500 !important;
        }
        .nav-file-title[data-path$=".skenc"]:before {
          content: "";
          display: inline-block;
          width: 14px;
          height: 14px;
          margin-right: 6px;
          vertical-align: text-bottom;
          background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>');
          background-repeat: no-repeat;
          opacity: 0.7;
        }
        .nav-file-title[data-path$=".skenc"]:hover {
          background-color: var(--background-modifier-hover) !important;
        }
        .nav-file-title[data-path$=".skenc"].is-active {
          background-color: var(--interactive-accent) !important;
          color: var(--text-on-accent) !important;
        }
      `;
      document.head.appendChild(style);
    }
  }

  /**
   * Records user activity for auto-lock timer
   */
  recordActivity() {
    this.lastActivity = Date.now();
  }

  /**
   * Resets auto-lock timer based on settings
   */
  resetAutoLockTimer() {
    if (this.autoLockTimer) clearInterval(this.autoLockTimer);

    if (this.settings.autoLockMinutes > 0 && this.masterPassword) {
      this.autoLockTimer = setInterval(() => {
        const minutesSinceActivity =
          (Date.now() - this.lastActivity) / (1000 * 60);
        if (minutesSinceActivity >= this.settings.autoLockMinutes) {
          this.lockVault();
          new obsidian.Notice("Vault auto-locked due to inactivity");
        }
      }, 60000);
    }
  }

  /**
   * Shows confirmation dialog with custom buttons
   * @param {string} title - Dialog title
   * @param {string} message - Dialog message
   * @param {string[]} buttons - Button labels
   * @returns {Promise<string>} Selected button label
   */
  async confirmAction(title, message, buttons = ["OK", "Cancel"]) {
    return new Promise((resolve) => {
      const modal = new (class extends obsidian.Modal {
        constructor(app, title, message, buttons) {
          super(app);
          this.title = title;
          this.message = message;
          this.buttons = buttons;
          this.result = null;
          this.isClosed = false;
        }

        onOpen() {
          const { contentEl, modalEl } = this;
          contentEl.empty();
          contentEl.addClass("sankrypt-modal");

          contentEl.createEl("h3", { text: this.title });
          const messageEl = contentEl.createEl("div", {
            text: this.message,
            attr: {
              style: "margin: 15px 0; white-space: pre-line; line-height: 1.5;",
            },
          });

          const buttonContainer = contentEl.createDiv({
            attr: {
              style:
                "display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;",
            },
          });

          this.buttons.forEach((buttonText) => {
            const button = buttonContainer.createEl("button", {
              text: buttonText,
              attr: { style: "padding: 8px 16px;" },
            });

            if (buttonText === "Cancel" || buttonText === "No") {
              button.addEventListener("click", () => {
                this.result = buttonText;
                this.close();
                resolve(buttonText);
              });
            } else {
              button.classList.add("mod-cta");
              button.addEventListener("click", () => {
                this.result = buttonText;
                this.close();
                resolve(buttonText);
              });
            }
          });

          // Handle modal close
          modalEl.addEventListener("click", (e) => {
            if (e.target === modalEl && !this.isClosed) {
              this.result = "Cancel";
              this.close();
              resolve("Cancel");
            }
          });
        }

        onClose() {
          const { contentEl } = this;
          this.isClosed = true;
          contentEl.empty();
          if (!this.result && this.buttons.includes("Cancel")) {
            resolve("Cancel");
          } else if (!this.result) {
            resolve(this.buttons[0]);
          }
        }
      })(this.app, title, message, buttons);

      modal.open();
    });
  }

  /**
   * Shows error modal with red styling
   * @param {string} title - Error title
   * @param {string} message - Error message
   * @returns {Promise<void>}
   */
  async showErrorModal(title, message) {
    return new Promise((resolve) => {
      const modal = new (class extends obsidian.Modal {
        constructor(app, title, message) {
          super(app);
          this.title = title;
          this.message = message;
        }

        onOpen() {
          const { contentEl } = this;
          contentEl.empty();
          contentEl.addClass("sankrypt-modal");

          // Header with error icon using createEl
          const header = contentEl.createDiv({
            attr: {
              style:
                "display: flex; align-items: center; gap: 10px; margin-bottom: 20px;",
            },
          });

          const iconDiv = header.createDiv();
          const alertSvg = iconDiv.createEl("svg", {
            attr: {
              xmlns: "http://www.w3.org/2000/svg",
              width: "24",
              height: "24",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              "stroke-width": "2",
              "stroke-linecap": "round",
              "stroke-linejoin": "round",
            },
          });
          alertSvg.createEl("circle", {
            attr: { cx: "12", cy: "12", r: "10" },
          });
          alertSvg.createEl("line", {
            attr: { x1: "12", x2: "12", y1: "8", y2: "12" },
          });
          alertSvg.createEl("line", {
            attr: { x1: "12", x2: "12.01", y1: "16", y2: "16" },
          });
          alertSvg.style.color = "#ef4444";

          header.createEl("h3", {
            text: title,
            attr: { style: "margin: 0; color: #ef4444;" },
          });

          contentEl.createEl("div", {
            text: message,
            attr: {
              style:
                "white-space: pre-line; margin: 15px 0; padding: 15px; background: var(--background-secondary); border-radius: 6px; border-left: 4px solid #ef4444;",
            },
          });

          const button = contentEl.createEl("button", {
            text: "OK",
            cls: "mod-cta",
            attr: { style: "float: right; padding: 8px 16px;" },
          });
          button.addEventListener("click", () => {
            this.close();
            resolve();
          });
        }

        onClose() {
          const { contentEl } = this;
          contentEl.empty();
          resolve();
        }
      })(this.app, title, message);

      modal.open();
    });
  }
};
