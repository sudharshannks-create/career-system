/* ============================================================
   google-auth.js  –  Dedicated Google Identity Services layer
   NextStep AI  |  Production-ready Google OAuth 2.0 / OpenID Connect

   HOW TO GET YOUR GOOGLE_CLIENT_ID:
   1. Go to https://console.cloud.google.com/apis/credentials
   2. Click "Create Credentials" → "OAuth 2.0 Client ID"
   3. Application type: "Web application"
   4. Add Authorised JavaScript origins:
        • http://localhost  •  http://127.0.0.1
        • https://YOUR_DOMAIN.github.io  (production)
   5. Copy the Client ID and paste it in the Setup tab inside the app.
   ============================================================ */

const GoogleAuth = (() => {

  /* ─── CONFIG ─────────────────────────────────────────────── */
  const CLIENT_ID_KEY = 'nxt_google_client_id';

  /* ─── STATE ──────────────────────────────────────────────── */
  let _initRetries  = 0;
  const MAX_RETRIES = 10;
  const RETRY_DELAY = 500;

  /* ─── HELPERS ────────────────────────────────────────────── */
  function _getClientId() {
    return localStorage.getItem(CLIENT_ID_KEY) || window.GOOGLE_CLIENT_ID || '';
  }

  function _setClientId(id) {
    const c = (id || '').trim();
    c ? localStorage.setItem(CLIENT_ID_KEY, c) : localStorage.removeItem(CLIENT_ID_KEY);
  }

  function _decodeJwt(token) {
    try {
      const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(decodeURIComponent(
        atob(b64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
      ));
    } catch { return null; }
  }

  function _validatePayload(p) {
    if (!p)                return 'Token could not be decoded.';
    if (!p.email)          return 'Google account has no email address.';
    if (!p.sub)            return 'Missing Google account identifier.';
    if (p.exp && Date.now() / 1000 > p.exp) return 'Google token has expired. Please sign in again.';
    if (!p.email_verified) return 'Your Google email address is not verified.';
    return null;
  }

  function _buildProfile(p) {
    return {
      google_id:      p.sub,
      email:          p.email.toLowerCase().trim(),
      name:           p.name || p.given_name || p.email.split('@')[0],
      profile_image:  p.picture || '',
      email_verified: !!p.email_verified,
      auth_provider:  'google',
    };
  }

  function _formatName(n) {
    return (n || 'Google User').trim().replace(/\b\w/g, l => l.toUpperCase());
  }

  function _initials(n) {
    return (n || 'G').split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'G';
  }

  function _friendlyError(err) {
    const m = (err.message || '').toLowerCase();
    if (m.includes('network') || m.includes('fetch'))  return 'Network error. Please check your connection.';
    if (m.includes('cancel') || m.includes('closed') || m.includes('popup_closed')) return 'Sign-in was cancelled. Please try again.';
    if (m.includes('access_denied'))  return 'Access was denied. Please allow the required Google permissions.';
    if (m.includes('expired'))        return 'Your session expired. Please sign in again.';
    return 'An unexpected error occurred during Google sign-in. Please try again.';
  }

  /* ─── CORE: Handle Google credential callback ─────────────── */
  async function _onGoogleCredential(response) {
    if (!response || !response.credential) {
      _showError('Google sign-in was cancelled or no credential was received.');
      return;
    }

    const payload = _decodeJwt(response.credential);
    const err = _validatePayload(payload);
    if (err) { _showError(err); return; }

    const profile = _buildProfile(payload);
    _setLoadingState(true);

    try {
      // Optional backend verification
      let backendSession = null;
      if (typeof SheetsDB !== 'undefined' && SheetsDB._isConfigured()) {
        try {
          backendSession = await SheetsDB.post({
            action: 'verifyGoogleToken',
            idToken: response.credential,
            profile: { google_id: profile.google_id, email: profile.email, name: profile.name }
          });
        } catch (e) { console.warn('[GoogleAuth] Backend verification skipped:', e.message); }
      }

      const result = await _upsertUser(profile, backendSession);

      if (!result.success) {
        _setLoadingState(false);
        _showError(result.error || 'Failed to create your account. Please try again.');
        return;
      }

      if (backendSession?.jwt && typeof Auth !== 'undefined') Auth.setJwtToken(backendSession.jwt);

      _setLoadingState(false);
      if (typeof UI !== 'undefined') {
        UI.closeModal();
        UI.toast(
          `Welcome${result.isNew ? '' : ' back'}, ${result.user.name.split(' ')[0]}!` +
          ` Signed in with Google${backendSession?.jwt ? ' ✓' : ''} 🎉`,
          'success'
        );
      }
      if (typeof Router !== 'undefined') Router.navigate(result.user.role === 'admin' ? 'admin' : 'dashboard');

    } catch (e) {
      console.error('[GoogleAuth]', e);
      _setLoadingState(false);
      _showError(_friendlyError(e));
    }
  }

  /* ─── USER UPSERT ─────────────────────────────────────────── */
  async function _upsertUser(profile, backendSession) {
    try {
      let users = Store.getUsers();
      let user  = users.find(u => u.google_id === profile.google_id)
               || users.find(u => u.email === profile.email);
      const isNew = !user;

      if (isNew) {
        user = {
          id:               Date.now(),
          google_id:        profile.google_id,
          name:             _formatName(profile.name),
          email:            profile.email,
          profile_image:    profile.profile_image,
          email_verified:   profile.email_verified,
          auth_provider:    'google',
          role:             profile.email.includes('admin') ? 'admin' : 'student',
          phone: '', location: '', degree: '', department: '', college: '',
          year: 1, cgpa: 0, profileCompletion: 40,
          assessmentScore: 0, assessmentDone: false, analysisRun: false,
          avatar:     profile.profile_image || _initials(profile.name),
          password:   null, // Never store passwords for Google users
          provider:   'google',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          jwtToken:   backendSession?.jwt || null,
        };

        Store.setUserSkills(user.id, [
          { id: 1, name: 'Problem Solving', category: 'Core',        level: 'Intermediate', verified: true },
          { id: 2, name: 'Communication',   category: 'Soft Skills', level: 'Intermediate', verified: true },
        ]);

        if (typeof SheetsDB !== 'undefined' && SheetsDB._isConfigured()) {
          try { await SheetsDB.registerUser({ ...user, password: undefined }); }
          catch (e) { console.warn('[GoogleAuth] SheetsDB sync:', e.message); }
        }

        users.push(user);
        Store.setUsers(users);

      } else {
        user.google_id      = profile.google_id;
        user.email_verified = profile.email_verified;
        user.auth_provider  = user.auth_provider || 'google';
        user.updated_at     = new Date().toISOString();
        if (profile.profile_image?.startsWith('http')) {
          user.profile_image = profile.profile_image;
          user.avatar = profile.profile_image;
        }
        if (backendSession?.jwt) user.jwtToken = backendSession.jwt;
        Store.updateUser(user.id, user);
      }

      const session = _makeSession(user);
      Auth._saveSession(session, true);
      return { success: true, user: session, isNew };

    } catch (e) {
      console.error('[GoogleAuth] upsertUser error:', e);
      return { success: false, error: e.message };
    }
  }

  function _makeSession(user) {
    return {
      id:             user.id,
      name:           user.name,
      email:          user.email,
      role:           user.role,
      avatar:         user.avatar || user.profile_image || _initials(user.name),
      profile_image:  user.profile_image || '',
      provider:       user.auth_provider || 'google',
      email_verified: user.email_verified || false,
    };
  }

  /* ─── GIS INIT ────────────────────────────────────────────── */
  function _initGIS(containerId) {
    const clientId = _getClientId();
    if (!clientId) return false;
    const gis = window.google?.accounts?.id;
    if (!gis) return false;

    try {
      gis.initialize({
        client_id:             clientId,
        callback:              _onGoogleCredential,
        auto_select:           false,
        cancel_on_tap_outside: true,
      });

      if (containerId) {
        const slot = document.getElementById(containerId);
        if (slot) {
          slot.innerHTML = '';
          gis.renderButton(slot, {
            theme: 'outline', size: 'large',
            text: 'continue_with', shape: 'rectangular',
            logo_alignment: 'left',
            width: Math.max(slot.clientWidth || 340, 200),
          });
        }
      }
      return true;
    } catch (e) {
      console.warn('[GoogleAuth] GIS init:', e.message);
      return false;
    }
  }

  function _initWithRetry(containerId) {
    if (_initGIS(containerId)) return;
    if (_initRetries++ < MAX_RETRIES) setTimeout(() => _initWithRetry(containerId), RETRY_DELAY);
  }

  /* ─── UI HELPERS ──────────────────────────────────────────── */
  function _setLoadingState(on) {
    const overlay = document.getElementById('g-loading-overlay');
    if (overlay) overlay.style.display = on ? 'flex' : 'none';
    document.querySelectorAll('.g-account-card,.g-continue-btn,.btn-google').forEach(b => { b.disabled = on; });
  }

  function _showError(msg) {
    if (typeof UI !== 'undefined') UI.toast(msg, 'error');
    console.warn('[GoogleAuth]', msg);
  }

  /* ─── MODAL HTML — Clean SaaS UI ─────────────────────────── */
  function _buildModal() {
    const clientId    = _getClientId();
    const hasClientId = !!clientId;
    const origin      = window.location.origin;

    return `<div class="g-auth-wrap">

  <!-- Loading overlay -->
  <div class="g-loading-overlay" id="g-loading-overlay" style="display:none">
    <div class="spinner" style="width:36px;height:36px;border-width:3px;border-top-color:#4285F4"></div>
    <div style="font-size:.88rem;font-weight:600;color:#0f172a;margin-top:2px">Authenticating with Google…</div>
    <div id="g-loading-email" style="font-size:.78rem;color:#64748b;margin-top:2px"></div>
  </div>

  <!-- Header -->
  <div class="g-auth-header">
    <div class="g-logo-ring">
      <svg width="28" height="28" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#4285F4" d="M46.145 24.498c0-1.534-.138-3.01-.395-4.43H24v8.38h12.441c-.537 2.9-2.17 5.358-4.623 7.008v5.826h7.482c4.38-4.034 6.845-9.983 6.845-16.784z"/>
        <path fill="#34A853" d="M24 47c6.24 0 11.47-2.069 15.3-5.618l-7.482-5.826C29.69 37.137 27.025 38 24 38c-6.025 0-11.13-4.068-12.952-9.537H3.383v6.015C7.19 42.655 15.002 47 24 47z"/>
        <path fill="#FBBC05" d="M11.048 28.463A13.863 13.863 0 0110.4 24c0-1.545.265-3.046.648-4.463v-6.015H3.383A23.01 23.01 0 001 24c0 3.72.895 7.24 2.383 10.478l7.665-6.015z"/>
        <path fill="#EA4335" d="M24 10c3.396 0 6.44 1.167 8.835 3.46l6.624-6.624C35.466 3.202 30.237 1 24 1 15.002 1 7.19 5.345 3.383 13.522l7.665 6.015C12.87 14.068 17.975 10 24 10z"/>
      </svg>
    </div>
    <h3 class="g-auth-title">Sign in with Google</h3>
    <p class="g-auth-subtitle">Continue to <strong style="color:#4f46e5">NextStep AI</strong></p>
  </div>

  <!-- Tab bar -->
  <div class="g-tabs" role="tablist">
    <button type="button" class="g-tab-btn active" id="gauth-tab-signin"
            onclick="GoogleAuth.switchTab('signin')" role="tab" aria-selected="true">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      Sign In
    </button>
    <button type="button" class="g-tab-btn" id="gauth-tab-config"
            onclick="GoogleAuth.switchTab('config')" role="tab" aria-selected="false">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
      Setup
      <span class="g-tab-dot" style="background:${hasClientId ? '#22c55e' : '#f59e0b'}" title="${hasClientId ? 'Configured' : 'Not configured'}"></span>
    </button>
  </div>

  <!-- TAB 1: SIGN IN -->
  <div id="gauth-pane-signin" role="tabpanel">

    ${hasClientId ? `
      <div class="g-gis-slot"><div id="gauth-modal-gis-slot"></div></div>
      <div class="g-divider">or choose a demo account</div>
    ` : `
      <div class="g-oauth-notice" role="status">
        <span class="g-oauth-notice-icon">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </span>
        <div>
          <div class="g-oauth-notice-title">⚠ Google Client ID not configured</div>
          <div class="g-oauth-notice-body">Connect your Google OAuth app from the <strong>Setup</strong> tab to enable real Google sign-in, or use a demo account below.</div>
        </div>
      </div>
    `}

    <!-- Demo account cards (side-by-side grid) -->
    <div class="g-accounts-grid">
      <button type="button" class="g-account-card" id="gauth-acc-student"
              onclick="GoogleAuth.signInWithDemoAccount({ google_id:'demo_student_001', name:'Sudharsan K', email:'sudharsan@example.com', profile_image:'', email_verified:true })"
              aria-label="Sign in as Sudharsan K (Student)">
        <div class="g-card-avatar" style="background:linear-gradient(135deg,#4f46e5,#7c3aed)">SK</div>
        <div class="g-card-name">Sudharsan K</div>
        <div class="g-card-email">sudharsan@example.com</div>
        <span class="g-card-badge">Student</span>
      </button>

      <button type="button" class="g-account-card" id="gauth-acc-admin"
              onclick="GoogleAuth.signInWithDemoAccount({ google_id:'demo_admin_001', name:'Admin User', email:'admin@nextstep.ai', profile_image:'', email_verified:true })"
              aria-label="Sign in as Admin User">
        <div class="g-card-avatar" style="background:linear-gradient(135deg,#e11d48,#be123c)">AU</div>
        <div class="g-card-name">Admin User</div>
        <div class="g-card-email">admin@nextstep.ai</div>
        <span class="g-card-badge admin">Admin</span>
      </button>
    </div>

    <!-- Continue with Google button (official branding) -->
    <button type="button" class="g-continue-btn"
            onclick="${hasClientId ? "GoogleAuth._promptGoogleOAuth()" : "GoogleAuth.switchTab('config')"}"
            aria-label="Continue with Google">
      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#4285F4" d="M46.145 24.498c0-1.534-.138-3.01-.395-4.43H24v8.38h12.441c-.537 2.9-2.17 5.358-4.623 7.008v5.826h7.482c4.38-4.034 6.845-9.983 6.845-16.784z"/>
        <path fill="#34A853" d="M24 47c6.24 0 11.47-2.069 15.3-5.618l-7.482-5.826C29.69 37.137 27.025 38 24 38c-6.025 0-11.13-4.068-12.952-9.537H3.383v6.015C7.19 42.655 15.002 47 24 47z"/>
        <path fill="#FBBC05" d="M11.048 28.463A13.863 13.863 0 0110.4 24c0-1.545.265-3.046.648-4.463v-6.015H3.383A23.01 23.01 0 001 24c0 3.72.895 7.24 2.383 10.478l7.665-6.015z"/>
        <path fill="#EA4335" d="M24 10c3.396 0 6.44 1.167 8.835 3.46l6.624-6.624C35.466 3.202 30.237 1 24 1 15.002 1 7.19 5.345 3.383 13.522l7.665 6.015C12.87 14.068 17.975 10 24 10z"/>
      </svg>
      Continue with Google
    </button>

    <!-- Security note -->
    <div class="g-security-note">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      Secure Google authentication. No passwords are stored.
    </div>
  </div>

  <!-- TAB 2: SETUP -->
  <div id="gauth-pane-config" role="tabpanel" style="display:none">

    <div class="g-status-chip ${hasClientId ? 'ok' : 'warn'}">
      <span class="g-status-dot"></span>
      ${hasClientId ? 'Google OAuth Active — Client ID configured' : 'Not connected — paste your Client ID below'}
    </div>

    <div class="form-group">
      <label class="form-label" for="gauth-client-id-input" style="font-size:.8rem">
        Google OAuth Client ID
        <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer"
           style="font-weight:400;font-size:.73rem;color:#4f46e5;margin-left:6px;text-decoration:underline">
          Get from Console ↗
        </a>
      </label>
      <input class="form-input" id="gauth-client-id-input" type="text"
             placeholder="123456789-abc.apps.googleusercontent.com"
             value="${clientId}" autocomplete="off" spellcheck="false"
             style="font-family:monospace;font-size:.79rem" />
      <div style="font-size:.71rem;color:#94a3b8;margin-top:5px">
        Only the Client ID is needed — never paste a Client Secret into any frontend file.
      </div>
    </div>

    <div style="display:flex;gap:8px;margin-top:14px">
      <button class="btn btn-primary btn-full btn-sm" onclick="GoogleAuth.saveClientId()">
        💾 Save &amp; Connect
      </button>
      ${hasClientId ? `<button class="btn btn-outline btn-sm" onclick="GoogleAuth.clearClientId()" style="white-space:nowrap;flex-shrink:0">Clear</button>` : ''}
    </div>

    <div class="g-setup-guide">
      <div class="g-setup-guide-title">3-Step Setup</div>
      <ol class="g-setup-steps">
        <li>Open <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer">Google Cloud Console →</a></li>
        <li>Create an <strong>OAuth 2.0 Client ID</strong> (type: Web application)</li>
        <li>
          Add to <strong>Authorised JavaScript origins</strong>:<br>
          <code class="g-origin-code" onclick="GoogleAuth._copyOrigin(this)" title="Click to copy">${origin}</code>
          <span style="font-size:.68rem;color:#94a3b8"> — click to copy</span>
        </li>
      </ol>
      <div style="font-size:.71rem;color:#94a3b8;margin-top:10px;padding-top:10px;border-top:1px solid #e2e8f0">
        ⚠ Never commit <code>.env</code> files or paste a Client Secret into frontend code.
      </div>
    </div>
  </div>

</div>`;
  }

  /* ─── PUBLIC API ──────────────────────────────────────────── */
  return {

    init(containerId) {
      _initRetries = 0;
      _initWithRetry(containerId);
    },

    showModal() {
      if (typeof UI === 'undefined') return;
      UI.modal('Google Authentication', _buildModal(), '');
      if (window.lucide) lucide.createIcons();
      if (_getClientId()) {
        setTimeout(() => { _initRetries = 0; _initWithRetry('gauth-modal-gis-slot'); }, 80);
      }
    },

    switchTab(tab) {
      const ps = document.getElementById('gauth-pane-signin');
      const pc = document.getElementById('gauth-pane-config');
      const bs = document.getElementById('gauth-tab-signin');
      const bc = document.getElementById('gauth-tab-config');

      if (tab === 'signin') {
        ps && (ps.style.display = 'block');
        pc && (pc.style.display = 'none');
        bs?.classList.add('active');    bs?.setAttribute('aria-selected', 'true');
        bc?.classList.remove('active'); bc?.setAttribute('aria-selected', 'false');
        if (_getClientId()) setTimeout(() => { _initRetries = 0; _initWithRetry('gauth-modal-gis-slot'); }, 50);
      } else {
        ps && (ps.style.display = 'none');
        pc && (pc.style.display = 'block');
        bs?.classList.remove('active'); bs?.setAttribute('aria-selected', 'false');
        bc?.classList.add('active');    bc?.setAttribute('aria-selected', 'true');
        setTimeout(() => document.getElementById('gauth-client-id-input')?.focus(), 80);
      }
    },

    saveClientId() {
      const val = (document.getElementById('gauth-client-id-input')?.value || '').trim();
      if (!val || !val.includes('.apps.googleusercontent.com')) {
        if (typeof UI !== 'undefined') UI.toast('Please enter a valid Google Client ID (ends with .apps.googleusercontent.com)', 'warning');
        return;
      }
      _setClientId(val);
      if (typeof Auth !== 'undefined' && Auth.setGoogleClientId) Auth.setGoogleClientId(val);
      if (typeof UI !== 'undefined') UI.toast('Google Client ID saved! Initialising Google Sign-In…', 'success');
      this.switchTab('signin');
      setTimeout(() => { _initRetries = 0; _initWithRetry('gauth-modal-gis-slot'); }, 200);
    },

    clearClientId() {
      _setClientId('');
      if (typeof Auth !== 'undefined' && Auth.setGoogleClientId) Auth.setGoogleClientId('');
      if (typeof UI !== 'undefined') UI.toast('Google Client ID removed.', 'info');
      this.showModal();
    },

    async signInWithDemoAccount(accountData) {
      // Show loading state inside the cards area
      const grid = document.querySelector('.g-accounts-grid');
      if (grid) {
        const emailEl = document.getElementById('g-loading-email');
        if (emailEl) emailEl.textContent = accountData.email;
        _setLoadingState(true);
      }

      try {
        const profile = {
          google_id:      accountData.google_id || 'demo_' + Date.now(),
          email:          accountData.email,
          name:           accountData.name,
          profile_image:  accountData.profile_image || '',
          email_verified: accountData.email_verified !== false,
          auth_provider:  'google',
        };
        const result = await _upsertUser(profile, null);

        setTimeout(() => {
          _setLoadingState(false);
          if (typeof UI !== 'undefined') UI.closeModal();
          if (!result.success) {
            if (typeof UI !== 'undefined') UI.toast(result.error || 'Sign-in failed.', 'error');
            return;
          }
          if (typeof UI !== 'undefined') {
            UI.toast(`Welcome${result.isNew ? '' : ' back'}, ${result.user.name.split(' ')[0]}! Signed in with Google 🎉`, 'success');
          }
          if (typeof Router !== 'undefined') Router.navigate(result.user.role === 'admin' ? 'admin' : 'dashboard');
        }, 600);

      } catch (e) {
        console.error('[GoogleAuth] Demo sign-in error:', e);
        _setLoadingState(false);
        if (typeof UI !== 'undefined') { UI.closeModal(); UI.toast(_friendlyError(e), 'error'); }
      }
    },

    /* Trigger the GIS One-Tap prompt (when Client ID is configured) */
    _promptGoogleOAuth() {
      const gis = window.google?.accounts?.id;
      if (!gis) {
        if (typeof UI !== 'undefined') UI.toast('Google Sign-In SDK not loaded. Please refresh the page.', 'warning');
        return;
      }
      try { gis.prompt(); }
      catch (e) { console.warn('[GoogleAuth] prompt error:', e); }
    },

    logout() {
      try {
        const user = typeof Auth !== 'undefined' ? Auth.getCurrentUser() : null;
        if (user?.email && window.google?.accounts?.id) {
          window.google.accounts.id.revoke(user.email, () => {});
        }
      } catch {}
      if (typeof Auth !== 'undefined') Auth.logout();
      if (typeof Router !== 'undefined') Router.navigate('login');
      if (typeof UI !== 'undefined') UI.toast('You have been signed out securely.', 'info');
    },

    getClientId:      _getClientId,
    setClientId:      _setClientId,
    _handleCredential: _onGoogleCredential,

    _copyOrigin(el) {
      navigator.clipboard?.writeText(el.textContent.trim()).then(() => {
        const orig = el.textContent;
        el.textContent = 'Copied!';
        setTimeout(() => el.textContent = orig, 1500);
      });
    },
  };
})();

window.__googleAuthCallback = r => GoogleAuth._handleCredential(r);
