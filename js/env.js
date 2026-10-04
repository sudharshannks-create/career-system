/* ============================================================
   env.js - NextStep AI Environment Configuration
   Configure your environment variables here.
   NEVER expose sensitive secrets (like Client Secrets) here!
   ============================================================ */

window.ENV = window.ENV || {};

// Google OAuth 2.0 Web Client ID
// Obtain from: https://console.cloud.google.com/apis/credentials
// Authorized JavaScript origins must include:
//   http://localhost:5500
//   http://127.0.0.1:5500
window.ENV.VITE_GOOGLE_CLIENT_ID = "";

// Expose on window for Vite & standard compatibility
window.VITE_GOOGLE_CLIENT_ID = window.ENV.VITE_GOOGLE_CLIENT_ID;
window.GOOGLE_CLIENT_ID      = window.ENV.VITE_GOOGLE_CLIENT_ID;
