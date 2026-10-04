/* ============================================================
   google-auth.js - Google Identity Services & OAuth 2.0 Layer
   NextStep AI | Production Google OAuth 2.0 / OpenID Connect

   ENVIRONMENT CONFIGURATION:
   Set VITE_GOOGLE_CLIENT_ID in js/env.js or .env:
     window.ENV.VITE_GOOGLE_CLIENT_ID = "YOUR_CLIENT_ID.apps.googleusercontent.com";
   Or in Vite:
     import.meta.env.VITE_GOOGLE_CLIENT_ID
   NEVER expose GOOGLE_CLIENT_SECRET in frontend code.
   ============================================================ */

const GoogleAuth = (() => {

  /* ─── STATE ──────────────────────────────────────────────── */
  let _initRetries = 0;
  let _initialized = false;
  let _tokenClient = null;
  const MAX_RETRIES = 20;
  const RETRY_DELAY = 300;

  /* ─── CONFIG: Reads VITE_GOOGLE_CLIENT_ID from environment ─── */
  function _getClientId() {
    let id = '';

    // 1. Environment configuration via js/env.js, window.ENV, or window.VITE_GOOGLE_CLIENT_ID
    if (typeof window !== 'undefined') {
      if (window.ENV && window.ENV.VITE_GOOGLE_CLIENT_ID) {
        id = window.ENV.VITE_GOOGLE_CLIENT_ID;
      } else if (window.VITE_GOOGLE_CLIENT_ID) {
        id = window.VITE_GOOGLE_CLIENT_ID;
      } else if (window.GOOGLE_CLIENT_ID) {
        id = window.GOOGLE_CLIENT_ID;
      }
    }

    // 2. Fallback to localStorage for development testing
    if (!id && typeof localStorage !== 'undefined') {
      id = localStorage.getItem('VITE_GOOGLE_CLIENT_ID') || localStorage.getItem('nxt_google_client_id') || '';
    }

    return (id || '').trim();
  }

  /* ─── LOGGING & DIAGNOSTICS (Step 2 & Step 8) ─────────────── */
  function _logDiagnostics(clientId) {
    if (typeof window !== 'undefined') {
      console.log("OAuth origin:", window.location.origin);
      console.log("Google Client ID loaded:", !!clientId);
      if (!clientId) {
        console.error("Google Client ID: MISSING");
      } else {
        console.log("Google Client ID: FOUND");
      }
    }
  }

  /* ─── JWT PARSING HELPERS ────────────────────────────────── */
  function _decodeJwt(token) {
    try {
      const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(decodeURIComponent(
        atob(b64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
      ));
    } catch (e) {
      console.error("Google OAuth error [CREDENTIAL_DECODE_FAILED]:", e);
      return null;
    }
  }

  function _validatePayload(p) {
    if (!p)                return 'Token could not be decoded.';
    if (!p.email)          return 'Google account has no email address.';
    if (!p.sub)            return 'Missing Google account identifier.';
    if (p.exp && Date.now() / 1000 > p.exp) return 'Google token has expired.';
    if (!p.email_verified) return 'Your Google email address is not verified.';
    return null;
  }

  function _formatName(n) {
    return (n || 'Google User').trim().replace(/\b\w/g, l => l.toUpperCase());
  }

  function _initials(n) {
    return (n || 'G').split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'G';
  }

  function _friendlyError(err) {
    const m = ((err && err.message) || '').toLowerCase();
    if (m.includes('network') || m.includes('fetch'))
      return 'Google sign-in was unsuccessful. Please check your connection and try again.';
    if (m.includes('cancel') || m.includes('closed') || m.includes('popup_closed'))
      return 'Sign-in was cancelled. Please try again.';
    if (m.includes('access_denied'))
      return 'Access was denied. Please allow the required permissions and try again.';
    return 'Google sign-in is temporarily unavailable. Please try again later.';
  }

  /* ─── USER UPSERT & DATABASE SYNC (Step 10) ──────────────── */
  async function _upsertUser(profile, backendSession) {
    try {
      let users = Store.getUsers();
      let user  = users.find(u => u.google_id === profile.google_id)
               || users.find(u => u.email     === profile.email);
      const isNew = !user;

      if (isNew) {
        user = {
          id:                Date.now(),
          google_id:         profile.google_id,
          name:              _formatName(profile.name),
          email:             profile.email,
          profile_image:     profile.profile_image || '',
          email_verified:    profile.email_verified,
          auth_provider:     'google',
          provider:          'google',
          role:              profile.email.includes('admin') ? 'admin' : 'student',
          phone: '', location: '', degree: '', department: '', college: '',
          year: 1, cgpa: 0,
          profileCompletion: 25,
          profile_completed: false,
          assessmentScore: 0, assessmentDone: false, analysisRun: false,
          avatar:     profile.profile_image || _initials(profile.name),
          password:   null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          jwtToken:   backendSession ? backendSession.jwt : null,
        };

        Store.setUserSkills(user.id, []);

        if (typeof SheetsDB !== 'undefined' && SheetsDB._isConfigured()) {
          try {
            const u = Object.assign({}, user);
            delete u.password;
            await SheetsDB.registerUser(u);
          } catch (e) { console.warn('[GoogleAuth] SheetsDB sync:', e.message); }
        }

        users.push(user);
        Store.setUsers(users);

      } else {
        user.google_id      = profile.google_id;
        user.email_verified = profile.email_verified;
        user.auth_provider  = user.auth_provider || 'google';
        user.updated_at     = new Date().toISOString();
        if (profile.profile_image && profile.profile_image.startsWith('http')) {
          user.profile_image = profile.profile_image;
          user.avatar        = profile.profile_image;
        }
        if (backendSession && backendSession.jwt) user.jwtToken = backendSession.jwt;
        Store.updateUser(user.id, user);
      }

      const session = _makeSession(user);
      Auth._saveSession(session, true);
      return { success: true, user: session, isNew };

    } catch (e) {
      console.error("Google OAuth error [DATABASE_ERROR]: Failed to save user session:", e);
      return { success: false, error: e.message };
    }
  }

  function _makeSession(user) {
    return {
      id:                user.id,
      name:              user.name,
      email:             user.email,
      role:              user.role,
      avatar:            user.avatar || user.profile_image || _initials(user.name),
      profile_image:     user.profile_image || '',
      provider:          user.auth_provider || 'google',
      email_verified:    user.email_verified || false,
      profile_completed: user.profile_completed || false,
    };
  }

  /* ─── UNIFIED AUTH SUCCESS HANDLER (Step 10) ──────────────── */
  async function _handleProfileLogin(profile, idToken = null) {
    _setLoadingState(true);

    try {
      let backendSession = null;
      if (idToken && typeof SheetsDB !== 'undefined' && SheetsDB._isConfigured()) {
        try {
          backendSession = await SheetsDB.post({
            action:  'verifyGoogleToken',
            idToken: idToken,
            profile: { google_id: profile.google_id, email: profile.email, name: profile.name },
          });
        } catch (e) {
          console.warn('[GoogleAuth] Backend verification skipped:', e.message);
        }
      }

      const result = await _upsertUser(profile, backendSession);

      if (!result.success) {
        _setLoadingState(false);
        _showUserError('Google sign-in was unsuccessful. Please try again.');
        console.error("Google OAuth error [UPSERT_FAILED]:", result.error);
        return;
      }

      if (backendSession && backendSession.jwt && typeof Auth !== 'undefined') {
        Auth.setJwtToken(backendSession.jwt);
      }

      _setLoadingState(false);
      if (typeof UI !== 'undefined') UI.closeModal();

      const firstName = (result.user.name || 'User').split(' ')[0];
      if (typeof UI !== 'undefined') {
        UI.toast(`Welcome${result.isNew ? '' : ' back'}, ${firstName}! 👋`, 'success');
      }

      // Step 10: If user exists -> Dashboard, If new user -> Career Profile Setup
      if (typeof Router !== 'undefined') {
        if (result.user.role === 'admin') {
          Router.navigate('admin');
        } else if (result.isNew) {
          Router.navigate('career-setup');
        } else {
          Router.navigate('dashboard');
        }
      }

    } catch (e) {
      console.error("Google OAuth error [AUTH_EXCEPTION]:", e);
      _setLoadingState(false);
      _showUserError(_friendlyError(e));
    }
  }

  /* ─── GIS CREDENTIAL CALLBACK (Step 5) ───────────────────── */
  function handleGoogleCredential(response) {
    console.log("Google authentication successful");
    console.log(response);

    if (!response || !response.credential) {
      console.error("Google OAuth error [CREDENTIAL_MISSING]: No credential in response", response);
      _setLoadingState(false);
      _showUserError('Google sign-in was cancelled. Please try again.');
      return;
    }

    const payload = _decodeJwt(response.credential);
    const err = _validatePayload(payload);
    if (err) {
      console.error("Google OAuth error [PAYLOAD_INVALID]:", err, payload);
      _setLoadingState(false);
      _showUserError('Google sign-in was unsuccessful. Please try again.');
      return;
    }

    const profile = {
      google_id:      payload.sub,
      email:          payload.email.toLowerCase().trim(),
      name:           payload.name || payload.given_name || payload.email.split('@')[0],
      profile_image:  payload.picture || '',
      email_verified: !!payload.email_verified,
      auth_provider:  'google',
    };

    _handleProfileLogin(profile, response.credential);
  }

  /* ─── GIS INITIALIZATION (Step 4 & Step 5) ────────────────── */
  function _initGIS(containerId) {
    const clientId = _getClientId();
    if (!clientId) {
      return false;
    }
    const gis = window.google && window.google.accounts && window.google.accounts.id;
    if (!gis) return false;

    try {
      if (!_initialized) {
        gis.initialize({
          client_id:             clientId,
          callback:              handleGoogleCredential,
          auto_select:           false,
          cancel_on_tap_outside: true,
          ux_mode:               'popup',
        });
        _initialized = true;
      }

      if (containerId) {
        const slot = document.getElementById(containerId);
        if (slot) {
          slot.innerHTML = '';
          gis.renderButton(slot, {
            theme:          'outline',
            size:           'large',
            text:           'continue_with',
            shape:          'rectangular',
            logo_alignment: 'left',
            width:          Math.max(slot.clientWidth || 340, 220),
          });
        }
      }
      return true;
    } catch (e) {
      console.error("Google OAuth error [GIS_INIT_FAILED]:", e);
      return false;
    }
  }

  function _initWithRetry(containerId) {
    if (_initGIS(containerId)) return;
    if (_initRetries++ < MAX_RETRIES) setTimeout(() => _initWithRetry(containerId), RETRY_DELAY);
  }

  /* ─── OAUTH2 POPUP TOKEN CLIENT ───────────────────────────── */
  function _getOrInitTokenClient(clientId) {
    if (_tokenClient) return _tokenClient;
    if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
      return null;
    }

    try {
      _tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'email profile openid',
        callback: async (tokenResponse) => {
          if (!tokenResponse || tokenResponse.error) {
            console.error("Google OAuth error [TOKEN_ERROR]:", tokenResponse);
            _setLoadingState(false);
            if (tokenResponse && tokenResponse.error !== 'popup_closed') {
              _showUserError('Google sign-in was unsuccessful. Please try again.');
            }
            return;
          }

          try {
            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
            });
            if (!res.ok) throw new Error('Userinfo HTTP ' + res.status);
            const data = await res.json();

            const profile = {
              google_id:      data.sub,
              email:          (data.email || '').toLowerCase().trim(),
              name:           data.name || data.given_name || (data.email || '').split('@')[0],
              profile_image:  data.picture || '',
              email_verified: !!data.email_verified,
              auth_provider:  'google',
            };

            await _handleProfileLogin(profile, null);

          } catch (err) {
            console.error("Google OAuth error [USERINFO_FETCH_FAILED]:", err);
            _setLoadingState(false);
            _showUserError('Google sign-in was unsuccessful. Please try again.');
          }
        },
        error_callback: (err) => {
          console.error("Google OAuth error [POPUP_ERROR]:", err);
          _setLoadingState(false);
          if (err && err.type !== 'popup_closed') {
            _showUserError('Google sign-in was unsuccessful. Please try again.');
          }
        }
      });
      return _tokenClient;
    } catch (e) {
      console.error("Google OAuth error [INIT_TOKEN_CLIENT_FAILED]:", e);
      return null;
    }
  }

  /* ─── UI HELPERS ─────────────────────────────────────────── */
  function _setLoadingState(on) {
    const overlay = document.getElementById('g-loading-overlay');
    const btn     = document.getElementById('g-signin-btn');
    if (overlay) overlay.style.display = on ? 'flex' : 'none';
    if (btn) { btn.disabled = on; btn.setAttribute('aria-busy', String(on)); }
  }

  function _showUserError(msg) {
    if (typeof UI !== 'undefined') UI.toast(msg, 'error');
    const errEl = document.getElementById('g-error-msg');
    if (errEl) { errEl.textContent = msg; errEl.style.display = 'flex'; }
  }

  /* ─── REAL GOOGLE OAUTH LAUNCHER ─────────────────────────── */
  function _launchGoogleOAuth() {
    const clientId = _getClientId();
    _logDiagnostics(clientId);

    // 1. Missing Client ID
    if (!clientId) {
      const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5500';
      console.error(
        "Google OAuth configuration error: VITE_GOOGLE_CLIENT_ID is not configured.\n" +
        "To configure real Google Sign-In:\n" +
        "1. Open js/env.js (or .env) and set:\n" +
        '   window.ENV.VITE_GOOGLE_CLIENT_ID = "YOUR_CLIENT_ID.apps.googleusercontent.com";\n' +
        "2. In Google Cloud Console (https://console.cloud.google.com/apis/credentials):\n" +
        "   - Application type: Web application\n" +
        "   - Authorized JavaScript origins must include: " + currentOrigin + "\n" +
        "3. Ensure the OAuth Consent Screen has your test user email configured."
      );
      _showUserError('Google sign-in is temporarily unavailable. Please try again later.');
      return;
    }

    // 2. Check if Google Identity Services script is available
    if (!window.google || !window.google.accounts) {
      console.error(
        "Google OAuth error [SCRIPT_NOT_LOADED]: Google Identity Services library (https://accounts.google.com/gsi/client) is not loaded or blocked."
      );
      _showUserError('Google sign-in is temporarily unavailable. Please try again later.');
      return;
    }

    _setLoadingState(true);

    // 3. Launch OAuth popup using Token Client (Standard Google Account Chooser)
    try {
      const client = _getOrInitTokenClient(clientId);
      if (client && typeof client.requestAccessToken === 'function') {
        client.requestAccessToken({ prompt: 'select_account' });
        return;
      }
    } catch (e) {
      console.warn("Google OAuth error [TOKEN_CLIENT_LAUNCH_FAILED]:", e);
    }

    // 4. Fallback to GIS ID Token prompt / One-Tap
    try {
      if (window.google.accounts.id && typeof window.google.accounts.id.prompt === 'function') {
        window.google.accounts.id.prompt(notification => {
          if (notification.isNotDisplayed()) {
            console.warn("Google OAuth [ONE_TAP_NOT_DISPLAYED]:", notification.getNotDisplayedReason());
            _setLoadingState(false);
          } else if (notification.isSkippedMoment()) {
            _setLoadingState(false);
          }
        });
        return;
      }
    } catch (e) {
      console.warn("Google OAuth error [GIS_PROMPT_FAILED]:", e);
    }

    _setLoadingState(false);
    _showUserError('Google sign-in is temporarily unavailable. Please try again later.');
  }

  /* ─── MODAL HTML — Clean, user-facing production UI (Step 12) ── */
  function _buildModal() {
    const gsvg = '<svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">'
      + '<path fill="#4285F4" d="M46.145 24.498c0-1.534-.138-3.01-.395-4.43H24v8.38h12.441c-.537 2.9-2.17 5.358-4.623 7.008v5.826h7.482c4.38-4.034 6.845-9.983 6.845-16.784z"/>'
      + '<path fill="#34A853" d="M24 47c6.24 0 11.47-2.069 15.3-5.618l-7.482-5.826C29.69 37.137 27.025 38 24 38c-6.025 0-11.13-4.068-12.952-9.537H3.383v6.015C7.19 42.655 15.002 47 24 47z"/>'
      + '<path fill="#FBBC05" d="M11.048 28.463A13.863 13.863 0 0110.4 24c0-1.545.265-3.046.648-4.463v-6.015H3.383A23.01 23.01 0 001 24c0 3.72.895 7.24 2.383 10.478l7.665-6.015z"/>'
      + '<path fill="#EA4335" d="M24 10c3.396 0 6.44 1.167 8.835 3.46l6.624-6.624C35.466 3.202 30.237 1 24 1 15.002 1 7.19 5.345 3.383 13.522l7.665 6.015C12.87 14.068 17.975 10 24 10z"/>'
      + '</svg>';

    return '<div class="g-auth-wrap">'
      + '<div class="g-loading-overlay" id="g-loading-overlay" style="display:none" aria-live="polite">'
      +   '<div class="g-loading-spinner" aria-hidden="true"></div>'
      +   '<div class="g-loading-text">Connecting to Google\u2026</div>'
      + '</div>'
      + '<div class="g-auth-header">'
      +   '<div class="g-logo-ring" aria-hidden="true">'
      +     '<svg width="32" height="32" viewBox="0 0 48 48" aria-hidden="true">'
      +     '<path fill="#4285F4" d="M46.145 24.498c0-1.534-.138-3.01-.395-4.43H24v8.38h12.441c-.537 2.9-2.17 5.358-4.623 7.008v5.826h7.482c4.38-4.034 6.845-9.983 6.845-16.784z"/>'
      +     '<path fill="#34A853" d="M24 47c6.24 0 11.47-2.069 15.3-5.618l-7.482-5.826C29.69 37.137 27.025 38 24 38c-6.025 0-11.13-4.068-12.952-9.537H3.383v6.015C7.19 42.655 15.002 47 24 47z"/>'
      +     '<path fill="#FBBC05" d="M11.048 28.463A13.863 13.863 0 0110.4 24c0-1.545.265-3.046.648-4.463v-6.015H3.383A23.01 23.01 0 001 24c0 3.72.895 7.24 2.383 10.478l7.665-6.015z"/>'
      +     '<path fill="#EA4335" d="M24 10c3.396 0 6.44 1.167 8.835 3.46l6.624-6.624C35.466 3.202 30.237 1 24 1 15.002 1 7.19 5.345 3.383 13.522l7.665 6.015C12.87 14.068 17.975 10 24 10z"/>'
      +     '</svg></div>'
      +   '<h3 class="g-auth-title">Sign in with Google</h3>'
      +   '<p class="g-auth-subtitle">Continue to <strong style="color:#4f46e5">NextStep AI</strong></p>'
      + '</div>'
      + '<div id="g-error-msg" class="g-error-banner" style="display:none" role="alert" aria-live="assertive"></div>'
      + '<div class="g-gis-slot"><div id="gauth-modal-gis-slot"></div></div>'
      + '<button type="button" class="g-continue-btn" id="g-signin-btn"'
      + ' onclick="GoogleAuth.signIn()" aria-label="Continue with Google">'
      + gsvg + ' Continue with Google</button>'
      + '<div class="g-security-note">'
      +   '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">'
      +   '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>'
      +   ' Secure Google authentication. No passwords are stored.'
      + '</div>'
      + '</div>';
  }

  /* ─── PUBLIC API ─────────────────────────────────────────── */
  return {

    init(containerId) {
      _initRetries = 0;
      _initWithRetry(containerId);
    },

    onGsiLoaded() {
      const clientId = _getClientId();
      if (clientId) {
        _initGIS('gsi-login-slot');
      }
    },

    showModal() {
      if (typeof UI === 'undefined') return;
      UI.modal('Google Authentication', _buildModal(), '');
      if (window.lucide) lucide.createIcons();
      if (_getClientId()) {
        setTimeout(() => { _initRetries = 0; _initWithRetry('gauth-modal-gis-slot'); }, 80);
      }
    },

    signIn() {
      _launchGoogleOAuth();
    },

    _promptGoogleOAuth() {
      _launchGoogleOAuth();
    },

    logout() {
      try {
        const user = typeof Auth !== 'undefined' ? Auth.getCurrentUser() : null;
        const gis  = window.google && window.google.accounts && window.google.accounts.id;
        if (user && user.email && gis) gis.revoke(user.email, () => {});
      } catch (e) {}
      _initialized = false;
      _tokenClient = null;
      if (typeof Auth   !== 'undefined') Auth.logout();
      if (typeof Router !== 'undefined') Router.navigate('login');
      if (typeof UI     !== 'undefined') UI.toast('You have been signed out securely.', 'info');
    },

    getClientId:       _getClientId,
    setClientId:       id => {
      window.VITE_GOOGLE_CLIENT_ID = (id || '').trim();
      window.GOOGLE_CLIENT_ID      = (id || '').trim();
      if (window.ENV) window.ENV.VITE_GOOGLE_CLIENT_ID = (id || '').trim();
      localStorage.setItem('nxt_google_client_id', (id || '').trim());
      localStorage.setItem('VITE_GOOGLE_CLIENT_ID', (id || '').trim());
      _initialized = false;
      _tokenClient = null;
    },
    _handleCredential: handleGoogleCredential,
  };

})();

window.__googleAuthCallback = r => GoogleAuth._handleCredential(r);
