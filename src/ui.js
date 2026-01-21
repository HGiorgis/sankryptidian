const obsidian = require("obsidian");
import { SankryptCrypto } from "./crypto.js";

// ========== ICON HELPER FUNCTIONS ==========

/**
 * Creates an SVG icon element using secure createEl method
 * @param {string} iconName - Name of the icon to create
 * @param {number} size - Icon size in pixels
 * @param {string} color - CSS color value
 * @returns {SVGSVGElement} The created SVG element
 */
export function createIcon(iconName, size = 16, color = "currentColor") {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svg.setAttribute("width", size.toString());
  svg.setAttribute("height", size.toString());
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", color);
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.style.display = "inline-block";
  svg.style.verticalAlign = "middle";
  svg.style.color = color;

  // Add paths based on icon name
  switch (iconName) {
    case "LOCK":
      const lockRect = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect",
      );
      lockRect.setAttribute("width", "18");
      lockRect.setAttribute("height", "11");
      lockRect.setAttribute("x", "3");
      lockRect.setAttribute("y", "11");
      lockRect.setAttribute("rx", "2");
      lockRect.setAttribute("ry", "2");
      svg.appendChild(lockRect);

      const lockPath = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      lockPath.setAttribute("d", "M7 11V7a5 5 0 0 1 10 0v4");
      svg.appendChild(lockPath);
      break;

    case "UNLOCK":
      const unlockRect = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect",
      );
      unlockRect.setAttribute("width", "18");
      unlockRect.setAttribute("height", "11");
      unlockRect.setAttribute("x", "3");
      unlockRect.setAttribute("y", "11");
      unlockRect.setAttribute("rx", "2");
      unlockRect.setAttribute("ry", "2");
      svg.appendChild(unlockRect);

      const unlockPath = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      unlockPath.setAttribute("d", "M7 11V7a5 5 0 0 1 9.9-1");
      svg.appendChild(unlockPath);
      break;

    case "KEY":
      const keyPath1 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      keyPath1.setAttribute(
        "d",
        "m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 2.7a1 1 0 0 0-1.4 0L15.5 5",
      );
      svg.appendChild(keyPath1);

      const keyPath2 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      keyPath2.setAttribute("d", "m21 2-9.6 9.6");
      svg.appendChild(keyPath2);

      const keyCircle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle",
      );
      keyCircle.setAttribute("cx", "7.5");
      keyCircle.setAttribute("cy", "15.5");
      keyCircle.setAttribute("r", "5.5");
      svg.appendChild(keyCircle);
      break;

    case "SHIELD":
      const shieldPath = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      shieldPath.setAttribute(
        "d",
        "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
      );
      svg.appendChild(shieldPath);
      break;

    case "SHIELD_CHECK":
      const shieldCheckPath1 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      shieldCheckPath1.setAttribute(
        "d",
        "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
      );
      svg.appendChild(shieldCheckPath1);

      const shieldCheckPath2 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      shieldCheckPath2.setAttribute("d", "m9 12 2 2 4-4");
      svg.appendChild(shieldCheckPath2);
      break;

    case "FOLDER":
      const folderPath = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      folderPath.setAttribute(
        "d",
        "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z",
      );
      svg.appendChild(folderPath);
      break;

    case "EYE":
      const eyePath1 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      eyePath1.setAttribute(
        "d",
        "M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10 7-10 7Z",
      );
      svg.appendChild(eyePath1);

      const eyeCircle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle",
      );
      eyeCircle.setAttribute("cx", "12");
      eyeCircle.setAttribute("cy", "12");
      eyeCircle.setAttribute("r", "3");
      svg.appendChild(eyeCircle);
      break;

    case "SEARCH":
      const searchCircle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle",
      );
      searchCircle.setAttribute("cx", "11");
      searchCircle.setAttribute("cy", "11");
      searchCircle.setAttribute("r", "8");
      svg.appendChild(searchCircle);

      const searchPath = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      searchPath.setAttribute("d", "m21 21-4.35-4.35");
      svg.appendChild(searchPath);
      break;

    case "INFO":
      const infoCircle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle",
      );
      infoCircle.setAttribute("cx", "12");
      infoCircle.setAttribute("cy", "12");
      infoCircle.setAttribute("r", "10");
      svg.appendChild(infoCircle);

      const infoPath1 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      infoPath1.setAttribute("d", "M12 16v-4");
      svg.appendChild(infoPath1);

      const infoPath2 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      infoPath2.setAttribute("d", "M12 8h.01");
      svg.appendChild(infoPath2);
      break;

    case "ALERT_CIRCLE":
      const alertCircle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle",
      );
      alertCircle.setAttribute("cx", "12");
      alertCircle.setAttribute("cy", "12");
      alertCircle.setAttribute("r", "10");
      svg.appendChild(alertCircle);

      const alertLine1 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line",
      );
      alertLine1.setAttribute("x1", "12");
      alertLine1.setAttribute("x2", "12");
      alertLine1.setAttribute("y1", "8");
      alertLine1.setAttribute("y2", "12");
      svg.appendChild(alertLine1);

      const alertLine2 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line",
      );
      alertLine2.setAttribute("x1", "12");
      alertLine2.setAttribute("x2", "12.01");
      alertLine2.setAttribute("y1", "16");
      alertLine2.setAttribute("y2", "16");
      svg.appendChild(alertLine2);
      break;

    case "CHECK_CIRCLE":
      const checkCirclePath1 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      checkCirclePath1.setAttribute("d", "M22 11.08V12a10 10 0 1 1-5.93-9.14");
      svg.appendChild(checkCirclePath1);

      const checkCirclePath2 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      checkCirclePath2.setAttribute("d", "m9 11 3 3L22 4");
      svg.appendChild(checkCirclePath2);
      break;

    case "X_CIRCLE":
      const xCircleCircle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle",
      );
      xCircleCircle.setAttribute("cx", "12");
      xCircleCircle.setAttribute("cy", "12");
      xCircleCircle.setAttribute("r", "10");
      svg.appendChild(xCircleCircle);

      const xCircleLine1 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line",
      );
      xCircleLine1.setAttribute("x1", "15");
      xCircleLine1.setAttribute("x2", "9");
      xCircleLine1.setAttribute("y1", "9");
      xCircleLine1.setAttribute("y2", "15");
      svg.appendChild(xCircleLine1);

      const xCircleLine2 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line",
      );
      xCircleLine2.setAttribute("x1", "9");
      xCircleLine2.setAttribute("x2", "15");
      xCircleLine2.setAttribute("y1", "9");
      xCircleLine2.setAttribute("y2", "15");
      svg.appendChild(xCircleLine2);
      break;

    // Add to the switch statement in createIcon function in ui.js
    case "SETTINGS":
      const settingsPath1 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      settingsPath1.setAttribute(
        "d",
        "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",
      );
      svg.appendChild(settingsPath1);

      const settingsCircle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle",
      );
      settingsCircle.setAttribute("cx", "12");
      settingsCircle.setAttribute("cy", "12");
      settingsCircle.setAttribute("r", "3");
      svg.appendChild(settingsCircle);
      break;

    case "REFRESH":
      const refreshPath1 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      refreshPath1.setAttribute(
        "d",
        "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",
      );
      svg.appendChild(refreshPath1);

      const refreshPath2 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      refreshPath2.setAttribute("d", "M21 3v5h-5");
      svg.appendChild(refreshPath2);

      const refreshPath3 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      refreshPath3.setAttribute(
        "d",
        "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",
      );
      svg.appendChild(refreshPath3);

      const refreshPath4 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      refreshPath4.setAttribute("d", "M8 16H3v5");
      svg.appendChild(refreshPath4);
      break;

    case "LOCK_OPEN":
      const lockOpenRect = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect",
      );
      lockOpenRect.setAttribute("width", "18");
      lockOpenRect.setAttribute("height", "11");
      lockOpenRect.setAttribute("x", "3");
      lockOpenRect.setAttribute("y", "11");
      lockOpenRect.setAttribute("rx", "2");
      lockOpenRect.setAttribute("ry", "2");
      svg.appendChild(lockOpenRect);

      const lockOpenPath = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      lockOpenPath.setAttribute("d", "M7 11V7a5 5 0 0 1 9.9-1");
      svg.appendChild(lockOpenPath);
      break;
    default:
      // Default to a simple circle if icon not found
      const defaultCircle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle",
      );
      defaultCircle.setAttribute("cx", "12");
      defaultCircle.setAttribute("cy", "12");
      defaultCircle.setAttribute("r", "10");
      svg.appendChild(defaultCircle);
  }

  return svg;
}

/**
 * Creates an icon button with secure element creation
 * @param {string} iconName - Name of the icon
 * @param {string} title - Button title/tooltip
 * @param {Function} onClick - Click handler
 * @param {Object} options - Additional options (size, color, style)
 * @returns {HTMLButtonElement} The created button element
 */
export function createIconButton(iconName, title = "", onClick, options = {}) {
  const button = document.createElement("button");
  button.className = "sankrypt-icon-button";

  const icon = createIcon(iconName, options.size || 16, options.color);
  button.appendChild(icon);

  if (title) {
    button.title = title;
  }

  if (onClick) {
    button.addEventListener("click", onClick);
  }

  if (options.style) {
    Object.assign(button.style, options.style);
  }

  return button;
}

// ========== ENCRYPTION VIEWER ==========

/**
 * Displays encrypted files with decryption interface
 * Provides file information and decryption options without revealing content
 */
export class EncryptionViewer {
  constructor(app, plugin, file) {
    this.app = app;
    this.plugin = plugin;
    this.file = file;
    this.container = null;
    this.encryptedContent = null;
    this.fileSize = 0;
  }

  /**
   * Creates and returns the encryption viewer UI
   * @returns {Promise<HTMLElement>} The viewer container element
   */
  async createView() {
    this.container = document.createElement("div");
    this.container.className = "sankrypt-encryption-viewer";

    try {
      // Read encrypted content
      this.encryptedContent = await this.app.vault.read(this.file);
      this.fileSize = new Blob([this.encryptedContent]).size;
      this.render();
    } catch (error) {
      this.renderError(error);
    }

    return this.container;
  }

  /**
   * Renders the main encryption viewer interface
   */
  render() {
    this.container.empty();

    // Big lock icon using createEl
    const lockIcon = this.container.createDiv({
      cls: "sankrypt-encryption-icon",
    });
    const lockSvg = lockIcon.createEl("svg", {
      attr: {
        xmlns: "http://www.w3.org/2000/svg",
        width: "120",
        height: "120",
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

    // Title
    this.container.createEl("h1", {
      text: "ENCRYPTED FILE",
      cls: "sankrypt-encryption-title",
    });

    // Subtitle
    this.container.createEl("div", {
      text: `This file "${this.file.name}" is encrypted with military-grade AES-256-GCM encryption. Enter the master password to decrypt and view its contents.`,
      cls: "sankrypt-encryption-subtitle",
    });

    // File info box
    const infoBox = this.container.createDiv({
      cls: "sankrypt-encryption-info",
    });

    // Info header with icon
    const infoHeader = infoBox.createDiv();
    const infoIcon = createIcon("INFO", 20, "var(--text-accent)");
    infoHeader.appendChild(infoIcon);
    infoHeader.createEl("h3", { text: "File Information" });

    const details = infoBox.createDiv({ cls: "sankrypt-encryption-details" });

    // File details
    const detailsData = [
      { label: "File Name:", value: this.file.name.replace(".skenc", "") },
      { label: "Location:", value: this.file.path },
      {
        label: "Encrypted Size:",
        value: `${(this.fileSize / 1024).toFixed(2)} KB`,
      },
      { label: "Encryption:", value: "AES-256-GCM" },
    ];

    detailsData.forEach((detail) => {
      const detailEl = details.createDiv({ cls: "sankrypt-encryption-detail" });
      detailEl.createEl("span", {
        text: detail.label,
        cls: "sankrypt-encryption-detail-label",
      });
      detailEl.createEl("span", {
        text: detail.value,
        cls: "sankrypt-encryption-detail-value",
      });
    });

    // Security tags
    const tags = details.createDiv({ attr: { style: "margin-top: 15px;" } });
    ["Military-Grade", "AES-256", "PBKDF2", "GCM Mode"].forEach((tag) => {
      tags.createEl("span", {
        text: tag,
        cls: "sankrypt-encryption-tag",
      });
    });

    // Action buttons
    const actions = this.container.createDiv({
      cls: "sankrypt-encryption-actions",
    });

    // Decrypt button
    const decryptBtn = actions.createEl("button", {
      cls: "sankrypt-encryption-button sankrypt-encryption-button-primary",
    });
    const decryptIcon = createIcon("UNLOCK", 20, "currentColor");
    decryptBtn.appendChild(decryptIcon);
    decryptBtn.createEl("span", { text: "Decrypt File" });
    decryptBtn.addEventListener("click", async () => {
      await this.plugin.decryptFile(this.file);
    });

    // View encrypted data button
    const viewDataBtn = actions.createEl("button", {
      cls: "sankrypt-encryption-button sankrypt-encryption-button-secondary",
    });
    const viewIcon = createIcon("EYE", 20, "currentColor");
    viewDataBtn.appendChild(viewIcon);
    viewDataBtn.createEl("span", { text: "View Encrypted Data" });
    viewDataBtn.addEventListener("click", () => {
      this.showEncryptedData();
    });

    // Warning message
    const warning = this.container.createDiv({
      cls: "sankrypt-encryption-warning",
    });
    const warningIcon = createIcon("ALERT_CIRCLE", 20, "#ef4444");
    warning.appendChild(warningIcon);
    warning.createEl("p", {
      text: "WARNING: Without the correct master password, this file cannot be decrypted. Keep your password safe!",
    });
  }

  /**
   * Renders error state when file cannot be loaded
   * @param {Error} error - The error that occurred
   */
  renderError(error) {
    this.container.empty();

    const errorIcon = this.container.createDiv({
      cls: "sankrypt-encryption-icon",
    });
    const alertSvg = errorIcon.createEl("svg", {
      attr: {
        xmlns: "http://www.w3.org/2000/svg",
        width: "120",
        height: "120",
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

    this.container.createEl("h1", {
      text: "ERROR LOADING FILE",
      cls: "sankrypt-encryption-title",
      attr: { style: "color: #ef4444;" },
    });

    this.container.createEl("div", {
      text: `Failed to load encrypted file: ${error.message}`,
      cls: "sankrypt-encryption-subtitle",
      attr: { style: "color: #ef4444;" },
    });

    const retryBtn = this.container.createEl("button", {
      text: "Retry",
      cls: "sankrypt-encryption-button sankrypt-encryption-button-primary",
      attr: { style: "margin-top: 20px;" },
    });
    retryBtn.addEventListener("click", async () => {
      try {
        this.encryptedContent = await this.app.vault.read(this.file);
        this.fileSize = new Blob([this.encryptedContent]).size;
        this.render();
      } catch (err) {
        this.renderError(err);
      }
    });
  }

  /**
   * Shows modal with encrypted data preview
   */
  showEncryptedData() {
    const modal = new obsidian.Modal(this.app);
    modal.titleEl.textContent = "Encrypted Data Preview";

    const content = modal.contentEl;
    content.empty();

    // Header with icon
    const header = content.createDiv({
      attr: {
        style:
          "display: flex; align-items: center; gap: 10px; margin-bottom: 15px;",
      },
    });

    const icon = createIcon("KEY", 24, "var(--text-accent)");
    header.appendChild(icon);
    header.createEl("h3", {
      text: "Raw Encrypted Data",
      attr: { style: "margin: 0;" },
    });

    content.createEl("div", {
      text: "This is the encrypted binary data in Base64 format. It cannot be read without the master password.",
      attr: {
        style:
          "margin-bottom: 15px; padding: 10px; background: var(--background-secondary); border-radius: 6px; font-size: 13px;",
      },
    });

    // Textarea for encrypted data
    const textarea = content.createEl("textarea", {
      attr: {
        readonly: true,
        style:
          "width: 100%; height: 300px; font-family: monospace; font-size: 11px; padding: 10px; border-radius: 6px; border: 1px solid var(--background-modifier-border); background: var(--background-primary); resize: vertical;",
      },
    });

    // Show partial data for large files
    if (this.encryptedContent.length > 1000) {
      const firstPart = this.encryptedContent.substring(0, 500);
      const lastPart = this.encryptedContent.substring(
        this.encryptedContent.length - 500,
      );
      textarea.value = `${firstPart}\n\n[... ${this.encryptedContent.length - 1000} characters ...]\n\n${lastPart}`;
    } else {
      textarea.value = this.encryptedContent;
    }

    // Copy button
    const copyBtn = content.createEl("button", {
      text: "Copy to Clipboard",
      attr: { style: "margin-top: 15px; padding: 8px 16px; float: right;" },
    });
    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(this.encryptedContent);
      new obsidian.Notice("Encrypted data copied to clipboard");
    });

    // Close button
    const closeBtn = content.createEl("button", {
      text: "Close",
      attr: { style: "margin-top: 15px; padding: 8px 16px;" },
    });
    closeBtn.addEventListener("click", () => modal.close());

    modal.open();
  }
}

// ========== MODAL CLASSES ==========

/**
 * Password input modal with secure element creation
 * Handles password entry with strength validation
 */
export class PasswordModal {
  constructor(app, title, options = {}) {
    this.app = app;
    this.title = title;
    this.options = {
      isConfirm: false,
      showStrength: false,
      ...options,
    };
    this.resolve = null;
    this.modal = null;
  }

  /**
   * Opens the password modal
   * @returns {Promise<string|null>} Password or null if cancelled
   */
  open() {
    return new Promise((resolve) => {
      this.resolve = resolve;
      this.modal = new PasswordModalImpl(
        this.app,
        this.title,
        this.options,
        this,
      );
      this.modal.open();
    });
  }
}

/**
 * Implementation of password modal with secure element creation
 */
class PasswordModalImpl extends obsidian.Modal {
  constructor(app, title, options, parent) {
    super(app);
    this.title = title;
    this.options = options;
    this.parent = parent;
    this.password = "";
    this.strength = 0;
    this.input = null;
  }

  onOpen() {
    const { contentEl, modalEl } = this;
    contentEl.empty();
    contentEl.addClass("sankrypt-modal");

    // Header with icon using createEl
    const header = contentEl.createDiv({
      attr: {
        style:
          "display: flex; align-items: center; gap: 10px; margin-bottom: 20px;",
      },
    });

    const iconDiv = header.createDiv();
    const keyIcon = createIcon("KEY", 24, "var(--text-accent)");
    iconDiv.appendChild(keyIcon);
    header.createEl("h2", { text: this.title, attr: { style: "margin: 0;" } });

    // Information about spaces in passwords
    const spaceInfo = contentEl.createDiv({
      attr: {
        style: `
          margin-bottom: 10px;
          padding: 8px 12px;
          background: rgba(59, 130, 246, 0.1);
          border-radius: 6px;
          border-left: 3px solid #3b82f6;
          font-size: 12px;
          color: var(--text-normal);
        `,
      },
    });

    const infoHeader = spaceInfo.createDiv({
      attr: {
        style:
          "display: flex; align-items: center; gap: 6px; margin-bottom: 4px;",
      },
    });
    infoHeader.appendChild(createIcon("INFO", 14, "#3b82f6"));
    infoHeader.createEl("strong", { text: "Remember:" });
    spaceInfo.createEl("div", {
      text: "The safest key is the one that exists only in your mind.",
    });

    // Password input container
    const inputContainer = contentEl.createDiv({
      attr: { style: "margin: 20px 0; position: relative;" },
    });

    this.input = inputContainer.createEl("input", {
      type: "password",
      attr: {
        placeholder: "Enter your key . . . ",
        autocomplete: "new-password",
        style: `
          width: 100%;
          padding: 12px 40px 12px 12px;
          font-size: 16px;
          border-radius: 6px;
          border: 1px solid var(--background-modifier-border);
          box-sizing: border-box;
        `,
      },
    });

    // Password visibility toggle
    const toggleIcon = inputContainer.createDiv({
      attr: {
        style: `
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          cursor: pointer;
          color: var(--text-muted);
          opacity: 0.7;
          transition: opacity 0.2s ease;
        `,
      },
    });

    const eyeIcon = createIcon("EYE", 20, "var(--text-muted)");
    toggleIcon.appendChild(eyeIcon);

    let passwordVisible = false;
    toggleIcon.addEventListener(
      "mouseenter",
      () => (toggleIcon.style.opacity = "1"),
    );
    toggleIcon.addEventListener(
      "mouseleave",
      () => (toggleIcon.style.opacity = "0.7"),
    );

    toggleIcon.addEventListener("click", () => {
      passwordVisible = !passwordVisible;
      this.input.type = passwordVisible ? "text" : "password";

      // Update eye icon
      if (passwordVisible) {
        // Clear existing SVG children
        while (eyeIcon.firstChild) {
          eyeIcon.removeChild(eyeIcon.firstChild);
        }

        // Create eye-off icon SVG elements
        const path1 = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path",
        );
        path1.setAttribute("d", "M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10 7-10 7Z");
        eyeIcon.appendChild(path1);

        const path2 = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path",
        );
        path2.setAttribute("d", "M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z");
        eyeIcon.appendChild(path2);

        const line = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "line",
        );
        line.setAttribute("x1", "2");
        line.setAttribute("x2", "22");
        line.setAttribute("y1", "2");
        line.setAttribute("y2", "22");
        eyeIcon.appendChild(line);
      } else {
        // Clear existing SVG children
        while (eyeIcon.firstChild) {
          eyeIcon.removeChild(eyeIcon.firstChild);
        }

        // Create eye icon SVG elements
        const path1 = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path",
        );
        path1.setAttribute("d", "M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10 7-10 7Z");
        eyeIcon.appendChild(path1);

        const circle = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "circle",
        );
        circle.setAttribute("cx", "12");
        circle.setAttribute("cy", "12");
        circle.setAttribute("r", "3");
        eyeIcon.appendChild(circle);
      }
    });

    // Focus input after delay
    setTimeout(() => {
      this.input.focus();
      this.input.select();
    }, 10);

    // Password strength meter (if enabled)
    if (this.options.showStrength) {
      const strengthContainer = contentEl.createDiv({
        attr: { style: "margin: 15px 0;" },
      });

      const strengthBar = strengthContainer.createDiv({
        attr: {
          style: `
            height: 6px;
            background: var(--background-modifier-border);
            border-radius: 3px;
            overflow: hidden;
            margin: 5px 0;
          `,
        },
      });

      const strengthFill = strengthBar.createDiv({
        attr: {
          style: `
            height: 100%;
            width: 0%;
            background: #ef4444;
            transition: width 0.3s ease, background 0.3s ease;
            border-radius: 3px;
          `,
        },
      });

      const strengthText = strengthContainer.createDiv({
        attr: {
          style:
            "font-size: 12px; color: var(--text-muted); display: flex; justify-content: space-between;",
        },
      });

      strengthText.createEl("span", { text: "Password strength:" });
      const value = strengthText.createEl("span", { text: "None" });
      value.style.fontWeight = "bold";

      this.input.addEventListener("input", () => {
        const validation = SankryptCrypto.validatePassword(this.input.value);
        this.strength = validation.strength;
        strengthFill.style.width = `${this.strength}%`;

        // Update color based on strength
        if (this.strength < 40) {
          strengthFill.style.background = "#ef4444";
          value.textContent = "Weak";
          value.style.color = "#ef4444";
        } else if (this.strength < 70) {
          strengthFill.style.background = "#f59e0b";
          value.textContent = "Moderate";
          value.style.color = "#f59e0b";
        } else if (this.strength < 90) {
          strengthFill.style.background = "#10b981";
          value.textContent = "Strong";
          value.style.color = "#10b981";
        } else {
          strengthFill.style.background = "#3b82f6";
          value.textContent = "Very Strong";
          value.style.color = "#3b82f6";
        }
      });
    }

    // Action buttons
    const buttonContainer = contentEl.createDiv({
      attr: {
        style:
          "display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;",
      },
    });

    // Cancel button
    const cancelBtn = createIconButton(
      "X_CIRCLE",
      "Cancel",
      () => {
        this.close();
        if (this.parent.resolve) {
          this.parent.resolve(null);
        }
      },
      {
        size: 18,
        style: {
          padding: "8px 16px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        },
      },
    );
    cancelBtn.appendChild(document.createTextNode(" Cancel"));

    // Submit button
    const submitBtn = createIconButton(
      "CHECK_CIRCLE",
      this.options.isConfirm ? "Confirm" : "Submit",
      () => {
        this.password = this.input.value; // Preserve spaces
        this.close();
        if (this.parent.resolve) {
          this.parent.resolve(this.password);
        }
      },
      {
        size: 18,
        style: {
          padding: "8px 16px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: "var(--interactive-accent)",
          color: "var(--text-on-accent)",
          border: "none",
        },
      },
    );
    submitBtn.appendChild(
      document.createTextNode(
        ` ${this.options.isConfirm ? "Confirm" : "Submit"}`,
      ),
    );

    buttonContainer.appendChild(cancelBtn);
    buttonContainer.appendChild(submitBtn);

    // Keyboard shortcuts
    this.input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.password = this.input.value; // Preserve spaces
        this.close();
        if (this.parent.resolve) {
          this.parent.resolve(this.password);
        }
      }
      if (e.key === "Escape") {
        this.close();
        if (this.parent.resolve) {
          this.parent.resolve(null);
        }
      }
    });

    // Handle modal close via clicking outside
    modalEl.addEventListener("click", (e) => {
      if (e.target === modalEl) {
        this.close();
        if (this.parent.resolve) {
          this.parent.resolve(null);
        }
      }
    });

    contentEl.appendChild(buttonContainer);
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
    // Ensure resolve is called if modal closed without button
    if (this.parent.resolve && !this.password) {
      this.parent.resolve(null);
    }
  }
}

/**
 * File browser modal for managing encrypted files
 * Provides list view with selection and action options
 */
export class FileBrowserModal {
  constructor(app, files, plugin) {
    this.app = app;
    this.files = files;
    this.plugin = plugin;
    this.modal = null;
  }

  /**
   * Opens the file browser modal
   * @param {string} action - Type of action ("decrypt" or "browse")
   */
  open(action = "decrypt") {
    this.modal = new FileBrowserModalImpl(
      this.app,
      this.files,
      this.plugin,
      action,
    );
    this.modal.open();
  }
}

/**
 * Implementation of file browser modal with secure element creation
 */
class FileBrowserModalImpl extends obsidian.Modal {
  constructor(app, files, plugin, action) {
    super(app);
    this.files = files;
    this.plugin = plugin;
    this.action = action;
    this.selectedFiles = new Set();
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("sankrypt-modal");

    // Header with icon
    const header = contentEl.createDiv({
      attr: {
        style:
          "display: flex; align-items: center; gap: 10px; margin-bottom: 20px;",
      },
    });

    const iconDiv = header.createDiv();
    const folderIcon = createIcon(
      this.action === "decrypt" ? "FOLDER_SEARCH" : "FOLDER",
      28,
      "var(--text-accent)",
    );
    iconDiv.appendChild(folderIcon);

    const titleText =
      this.action === "decrypt" ? "Decrypt Files" : "Encrypted Files";
    header.createEl("h2", {
      text: `${titleText} (${this.files.length})`,
      attr: { style: "margin: 0;" },
    });

    // Search bar
    const searchContainer = contentEl.createDiv({
      attr: {
        style: "margin: 15px 0; display: flex; align-items: center; gap: 10px;",
      },
    });

    const searchIcon = createIcon("SEARCH", 18, "var(--text-muted)");
    searchContainer.appendChild(searchIcon);

    const searchInput = searchContainer.createEl("input", {
      type: "search",
      placeholder: "Search encrypted files...",
      attr: {
        style:
          "flex: 1; padding: 10px 12px; border-radius: 6px; border: 1px solid var(--background-modifier-border);",
      },
    });

    setTimeout(() => searchInput.focus(), 10);

    // File list container
    const listContainer = contentEl.createDiv({
      attr: {
        style: `
          max-height: 400px;
          overflow-y: auto;
          margin: 15px 0;
          border: 1px solid var(--background-modifier-border);
          border-radius: 8px;
          padding: 10px;
          background: var(--background-primary);
        `,
      },
    });

    // Render initial file list
    this.renderFileList(listContainer, this.files);

    // Search functionality
    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase();
      const filtered = this.files.filter(
        (file) =>
          file.name.toLowerCase().includes(query) ||
          file.path.toLowerCase().includes(query),
      );
      listContainer.empty();
      this.renderFileList(listContainer, filtered);
    });

    // Action buttons
    const buttonContainer = contentEl.createDiv({
      attr: { style: "display: flex; gap: 10px; margin-top: 20px;" },
    });

    if (this.action === "decrypt") {
      // Decrypt selected button
      const decryptSelectedBtn = createIconButton(
        "UNLOCK",
        `Decrypt Selected (${this.selectedFiles.size})`,
        async () => {
          this.close();
          for (const filePath of this.selectedFiles) {
            const file = this.files.find((f) => f.path === filePath);
            if (file) await this.plugin.decryptFile(file);
          }
        },
        {
          size: 18,
          style: {
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "var(--interactive-accent)",
            color: "var(--text-on-accent)",
            border: "none",
          },
        },
      );
      decryptSelectedBtn.disabled = this.selectedFiles.size === 0;
      buttonContainer.appendChild(decryptSelectedBtn);

      // Decrypt all button
      const decryptAllBtn = createIconButton(
        "UNLOCK",
        "Decrypt All",
        async () => {
          this.close();
          for (const file of this.files) {
            await this.plugin.decryptFile(file);
          }
        },
        {
          size: 18,
          style: {
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "var(--background-secondary)",
            border: "1px solid var(--background-modifier-border)",
          },
        },
      );
      buttonContainer.appendChild(decryptAllBtn);
    }

    // Cancel/Close button
    const cancelBtn = createIconButton(
      "X_CIRCLE",
      this.action === "decrypt" ? "Cancel" : "Close",
      () => this.close(),
      {
        size: 18,
        style: {
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginLeft: this.action === "decrypt" ? "" : "auto",
        },
      },
    );
    buttonContainer.appendChild(cancelBtn);

    contentEl.appendChild(buttonContainer);
  }

  /**
   * Renders file list with selection and action buttons
   * @param {HTMLElement} container - Container element
   * @param {TFile[]} files - Files to display
   */
  renderFileList(container, files) {
    if (files.length === 0) {
      const emptyState = container.createDiv({
        attr: {
          style:
            "text-align: center; padding: 40px 20px; color: var(--text-muted);",
        },
      });

      const icon = createIcon(
        "SEARCH",
        48,
        "var(--background-modifier-border)",
      );
      emptyState.appendChild(icon);

      emptyState.createEl("div", {
        text: "No encrypted files found",
        attr: {
          style: "font-size: 14px; font-weight: bold; margin-bottom: 5px;",
        },
      });
      emptyState.createEl("div", {
        text: "Try a different search term",
        attr: { style: "font-size: 12px;" },
      });
      return;
    }

    files.forEach((file) => {
      const fileItem = container.createDiv({
        attr: {
          style: `
            padding: 12px;
            margin: 8px 0;
            border-radius: 8px;
            background: var(--background-secondary);
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 12px;
            border: 2px solid transparent;
            transition: all 0.2s ease;
          `,
        },
      });

      const isSelected = this.selectedFiles.has(file.path);
      if (isSelected) {
        fileItem.style.borderColor = "var(--interactive-accent)";
        fileItem.style.background = "var(--background-modifier-hover)";
      }

      // Checkbox for selection
      const checkboxContainer = fileItem.createDiv({
        attr: { style: "display: flex; align-items: center;" },
      });

      const checkbox = checkboxContainer.createEl("input", {
        type: "checkbox",
        attr: { style: "width: 18px; height: 18px; cursor: pointer;" },
      });
      checkbox.checked = isSelected;

      checkbox.addEventListener("change", (e) => {
        e.stopPropagation();
        if (checkbox.checked) {
          this.selectedFiles.add(file.path);
        } else {
          this.selectedFiles.delete(file.path);
        }
        this.onOpen(); // Refresh to update counts
      });

      // File icon
      const fileIcon = fileItem.createDiv();
      const keyIcon = createIcon(
        "KEY",
        20,
        isSelected ? "var(--interactive-accent)" : "var(--text-muted)",
      );
      fileIcon.appendChild(keyIcon);

      // File info
      const fileInfo = fileItem.createDiv();
      fileInfo.style.flex = "1";
      fileInfo.style.minWidth = "0";

      fileInfo.createEl("div", {
        text: file.name.replace(".skenc", ""),
        attr: {
          style:
            "font-weight: 600; font-size: 14px; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;",
        },
      });

      fileInfo.createEl("div", {
        text: file.path,
        attr: {
          style:
            "font-size: 11px; color: var(--text-muted); opacity: 0.8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;",
        },
      });

      // Action buttons
      const actionContainer = fileItem.createDiv({
        attr: { style: "display: flex; gap: 8px; align-items: center;" },
      });

      if (this.action === "decrypt") {
        const decryptBtn = createIconButton(
          "UNLOCK",
          "Decrypt this file",
          async (e) => {
            e.stopPropagation();
            this.close();
            await this.plugin.decryptFile(file);
          },
          { size: 16, style: { padding: "6px" } },
        );
        actionContainer.appendChild(decryptBtn);
      }

      const viewBtn = createIconButton(
        "EYE",
        "View encrypted content",
        async (e) => {
          e.stopPropagation();
          await this.app.workspace.getLeaf().openFile(file);
        },
        { size: 16, style: { padding: "6px" } },
      );
      actionContainer.appendChild(viewBtn);

      // Selection on click
      fileItem.addEventListener("click", (e) => {
        if (e.target === checkbox || e.target.closest("button")) return;
        if (this.selectedFiles.has(file.path)) {
          this.selectedFiles.delete(file.path);
        } else {
          this.selectedFiles.add(file.path);
        }
        this.onOpen(); // Refresh
      });

      // Hover effects
      fileItem.addEventListener("mouseenter", () => {
        if (!isSelected) {
          fileItem.style.background = "var(--background-modifier-hover)";
          keyIcon.style.color = "var(--text-normal)";
        }
      });

      fileItem.addEventListener("mouseleave", () => {
        if (!isSelected) {
          fileItem.style.background = "var(--background-secondary)";
          keyIcon.style.color = "var(--text-muted)";
        }
      });

      container.appendChild(fileItem);
    });
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
