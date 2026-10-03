/* ============================================================
   sheets-db.js  –  Google Sheets as Database
   Connects your web app to Google Sheets via Apps Script API
   ============================================================

   HOW IT WORKS:
   - Your Google Apps Script (Web App) acts as a REST API
   - This file calls that API to read/write user data
   - All user accounts, profiles, skills etc. live in Google Sheets

   SETUP: Set your deployed Apps Script URL below:
   ============================================================ */

const SheetsDB = {

  // ─── PASTE YOUR APPS SCRIPT WEB APP URL HERE ─────────────
  // After deploying your Apps Script, replace this URL:
  API_URL: 'PASTE_YOUR_APPS_SCRIPT_URL_HERE',
  // ─────────────────────────────────────────────────────────

  _isConfigured() {
    return this.API_URL && this.API_URL !== 'PASTE_YOUR_APPS_SCRIPT_URL_HERE';
  },

  /* ── Generic GET request ── */
  async get(params = {}) {
    if (!this._isConfigured()) {
      console.warn('SheetsDB: API_URL not configured. Using localStorage fallback.');
      return null;
    }
    const url = new URL(this.API_URL);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    try {
      const res = await fetch(url.toString());
      return await res.json();
    } catch (err) {
      console.error('SheetsDB GET error:', err);
      return null;
    }
  },

  /* ── Generic POST request ── */
  async post(body = {}) {
    if (!this._isConfigured()) {
      console.warn('SheetsDB: API_URL not configured. Using localStorage fallback.');
      return null;
    }
    try {
      const res = await fetch(this.API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(body)
      });
      return await res.json();
    } catch (err) {
      console.error('SheetsDB POST error:', err);
      return null;
    }
  },

  /* ══════════════════════════════════════════
     USER OPERATIONS
     ══════════════════════════════════════════ */

  /* Find user by email for login */
  async findUserByEmail(email) {
    return await this.get({ action: 'findUser', email });
  },

  /* Register a new user (Security: never sends password to Google Sheets) */
  async registerUser(userData) {
    const { password, confirmPassword, ...safeData } = userData;
    return await this.post({ action: 'registerUser', ...safeData });
  },

  /* Update user profile fields */
  async updateUser(userId, fields) {
    return await this.post({ action: 'updateUser', userId, ...fields });
  },

  /* Get full user profile by id */
  async getUser(userId) {
    return await this.get({ action: 'getUser', userId });
  },

  /* ══════════════════════════════════════════
     ASSESSMENT OPERATIONS
     ══════════════════════════════════════════ */

  async saveAssessment(userId, scores) {
    return await this.post({ action: 'saveAssessment', userId, ...scores });
  },

  async getAssessment(userId) {
    return await this.get({ action: 'getAssessment', userId });
  },

  /* ══════════════════════════════════════════
     SKILLS OPERATIONS
     ══════════════════════════════════════════ */

  async saveSkills(userId, skills) {
    return await this.post({ action: 'saveSkills', userId, skills: JSON.stringify(skills) });
  },

  async getSkills(userId) {
    return await this.get({ action: 'getSkills', userId });
  },

  /* ══════════════════════════════════════════
     ADMIN: Get all users
     ══════════════════════════════════════════ */

  async getAllUsers() {
    return await this.get({ action: 'getAllUsers' });
  }
};
