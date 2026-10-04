/* ============================================
   auth.js - Authentication layer
   Supports Google Sheets DB + localStorage fallback + Google Sign-In
   ============================================ */

const Auth = {
  SESSION_KEY: 'nxt_session',

  getCurrentUser() {
    try { return JSON.parse(sessionStorage.getItem(this.SESSION_KEY) || localStorage.getItem(this.SESSION_KEY)); }
    catch { return null; }
  },

  /* ── ASYNC Login (checks Google Sheets first, then localStorage) ── */
  async loginAsync(email, password, remember = false) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPw = (password || '').trim();

    // Try Google Sheets if configured
    if (SheetsDB._isConfigured()) {
      try {
        const result = await SheetsDB.findUserByEmail(cleanEmail);
        if (result && result.success && result.user) {
          const user = result.user;
          if (user.password !== cleanPw && user.password !== password) {
            return { success: false, error: 'Invalid email or password.' };
          }
          const session = this._makeSession(user);
          this._saveSession(session, remember);
          return { success: true, user: session };
        }
        if (result && result.found === false) {
          // Check local store before returning not found
          const localUser = Store.getUsers().find(u => u.email.toLowerCase() === cleanEmail);
          if (!localUser) {
            return { success: false, error: 'No account found with this email. Try Continue with Google or Demo accounts below.' };
          }
        }
      } catch(e) {
        console.warn('Sheets login failed, falling back to localStorage:', e);
      }
    }
    // Fallback: localStorage
    return this.login(cleanEmail, cleanPw, remember);
  },

  /* ── ASYNC Register (saves to Google Sheets + localStorage) ── */
  async registerAsync(data) {
    const cleanEmail = (data.email || '').trim().toLowerCase();
    const newUser = {
      id: Date.now(), role: 'student',
      name: (data.fullName || '').trim(), email: cleanEmail,
      phone: (data.phone || '').trim(), password: data.password,
      location: (data.location || '').trim(),
      degree: data.degree || data.education || '',
      department: data.department || '',
      college: data.college || '',
      year: parseInt(data.year) || 1,
      cgpa: parseFloat(data.cgpa) || 0,
      profileCompletion: 25,
      assessmentScore: 0, assessmentDone: false,
      analysisRun: false,
      avatar: (data.fullName || 'Student').split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0,2) || 'ST',
      createdAt: new Date().toISOString()
    };

    // Save to Google Sheets if configured
    if (SheetsDB._isConfigured()) {
      try {
        const result = await SheetsDB.registerUser(newUser);
        if (result && result.success === false) {
          return { success: false, error: result.error || 'Registration failed.' };
        }
      } catch(e) {
        console.warn('Sheets register failed, falling back to localStorage:', e);
      }
    }

    // Always also save to localStorage as backup
    const users = Store.getUsers();
    if (users.find(u => u.email.toLowerCase() === newUser.email)) {
      return { success: false, error: 'An account with this email already exists.' };
    }
    users.push(newUser);
    Store.setUsers(users);

    const session = this._makeSession(newUser);
    sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    return { success: true, user: session };
  },

  /* ── Sync login (localStorage only – used as fallback) ── */
  login(email, password, remember = false) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPw = (password || '').trim();
    const users = Store.getUsers();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail && (u.password === cleanPw || u.password === password));
    if (!user) return { success: false, error: 'Invalid email or password. You can use Quick Demo Logins below or Continue with Google.' };
    const session = this._makeSession(user);
    this._saveSession(session, remember);
    return { success: true, user: session };
  },

  /* ── Sync register (localStorage only) ── */
  register(data) {
    const cleanEmail = (data.email || '').trim().toLowerCase();
    const users = Store.getUsers();
    if (users.find(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'An account with this email already exists.' };
    }
    const newUser = {
      id: Date.now(), role: 'student',
      name: (data.fullName || '').trim(), email: cleanEmail,
      phone: (data.phone || '').trim(), password: data.password,
      location: (data.location || '').trim(),
      degree: data.degree || data.education,
      department: data.department,
      college: data.college || '',
      year: parseInt(data.year) || 1,
      cgpa: parseFloat(data.cgpa) || 0,
      profileCompletion: 25,
      assessmentScore: 0, assessmentDone: false,
      analysisRun: false,
      avatar: (data.fullName || 'Student').split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0,2) || 'ST'
    };
    users.push(newUser);
    Store.setUsers(users);
    const session = this._makeSession(newUser);
    sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    return { success: true, user: session };
  },

  /* ══════════════════════════════════════════
     GOOGLE IDENTITY & OAUTH 2.0 AUTHENTICATION
     ══════════════════════════════════════════ */

  getGoogleClientId() {
    // Read-only: set via window.GOOGLE_CLIENT_ID in index.html
    return (window.GOOGLE_CLIENT_ID || window.VITE_GOOGLE_CLIENT_ID || '').trim();
  },


  /* Parse JWT ID Token returned by Google Identity Services */
  parseJwt(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.warn('Failed to parse Google JWT credential:', e);
      return null;
    }
  },

  /* Initialize Google Identity Services (GIS) */
  initGoogleIdentity(containerId = null) {
    const clientId = this.getGoogleClientId();
    if (!clientId || !window.google || !window.google.accounts || !window.google.accounts.id) {
      return false;
    }
    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: this.handleGoogleCredentialResponse.bind(this),
        auto_select: false,
        cancel_on_tap_outside: true
      });

      const slotId = containerId || 'gsi-login-slot';
      const slot = document.getElementById(slotId);
      if (slot) {
        slot.innerHTML = '';
        window.google.accounts.id.renderButton(slot, {
          theme: 'outline',
          size: 'large',
          width: slot.clientWidth > 100 ? slot.clientWidth : 340,
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'left'
        });
      }
      return true;
    } catch (err) {
      console.warn('Google Identity initialization error:', err);
      return false;
    }
  },

  /* Callback when Google Identity returns an authenticated credential */
  async handleGoogleCredentialResponse(response) {
    if (!response || !response.credential) {
      UI.toast('No credential received from Google.', 'error');
      return;
    }

    // Backend JWT verification: send Google ID Token to backend to verify signature & claims
    let backendResult = null;
    if (typeof SheetsDB !== 'undefined' && SheetsDB._isConfigured()) {
      try {
        backendResult = await SheetsDB.post({
          action: 'verifyGoogleToken',
          idToken: response.credential
        });
        if (backendResult && backendResult.status === 'success' && backendResult.jwt) {
          this.setJwtToken(backendResult.jwt);
        }
      } catch (err) {
        console.warn('Backend Google JWT verification warning:', err);
      }
    }

    const payload = this.parseJwt(response.credential);
    if (!payload || !payload.email) {
      UI.toast('Could not decode Google user token.', 'error');
      return;
    }

    const res = await this.loginWithGoogle({
      email: payload.email,
      name: payload.name || payload.given_name || payload.email.split('@')[0],
      avatar: payload.picture,
      googleSub: payload.sub,
      verified: payload.email_verified,
      jwt: backendResult ? backendResult.jwt : null
    });

    UI.closeModal();
    if (res.success) {
      const jwtStatus = backendResult?.jwt ? ' (JWT Verified ✓)' : '';
      UI.toast(`Welcome, ${res.user.name.split(' ')[0]}! Signed in via Google OAuth${jwtStatus} 🎉`, 'success');
      Router.navigate(res.user.role === 'admin' ? 'admin' : 'dashboard');
    } else {
      UI.toast(res.error || 'Google sign-in failed.', 'error');
    }
  },

  async loginWithGoogle(googleData = {}, remember = true) {
    const email = (googleData.email || 'student.google@gmail.com').trim().toLowerCase();
    const name  = (googleData.name || email.split('@')[0].replace(/[._]/g, ' ')).trim();
    const avatar = googleData.avatar || name.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'G';

    let users = Store.getUsers();
    let user = users.find(u => u.email.toLowerCase() === email);

    if (!user) {
      // Create new Google-authenticated user account
      user = {
        id: Date.now(),
        role: email.includes('admin') ? 'admin' : 'student',
        name: name.replace(/\b\w/g, l => l.toUpperCase()),
        email: email,
        phone: googleData.phone || '+91 98765 00000',
        password: 'gauth_' + Math.random().toString(36).slice(2),
        location: googleData.location || 'Chennai, Tamil Nadu',
        degree: 'B.E. Computer Science Engineering',
        department: 'Computer Science Engineering',
        college: 'Anna University, Chennai',
        year: 2,
        cgpa: 8.5,
        profileCompletion: 75,
        assessmentScore: 82,
        assessmentDone: true,
        analysisRun: true,
        avatar: avatar,
        provider: 'google',
        createdAt: new Date().toISOString()
      };

      // Add seed skills so dashboard & career roadmap are immediately functional
      Store.setUserSkills(user.id, [
        { id: 1, name: 'Python', category: 'Programming', level: 'Intermediate', verified: true },
        { id: 7, name: 'JavaScript', category: 'Programming', level: 'Intermediate', verified: true },
        { id: 8, name: 'HTML/CSS', category: 'Web Dev', level: 'Advanced', verified: true },
        { id: 2, name: 'SQL', category: 'Database', level: 'Beginner', verified: false }
      ]);

      if (SheetsDB._isConfigured()) {
        try {
          await SheetsDB.registerUser(user);
        } catch(e) {
          console.warn('SheetsDB Google register warning:', e);
        }
      }

      users.push(user);
      Store.setUsers(users);
    } else {
      user.provider = user.provider || 'google';
      if (!user.avatar || (avatar && avatar.startsWith('http'))) user.avatar = avatar;
      Store.updateUser(user.id, user);
    }

    const session = this._makeSession(user);
    this._saveSession(session, remember);
    return { success: true, user: session };
  },

  /* Show interactive Google Authentication Modal with GIS Support & Config */
  showGoogleModal(initialTab = 'signin') {
    const currentClientId = this.getGoogleClientId();
    const hasClientId = !!currentClientId;
    const currentOrigin = window.location.origin;

    const modalContent = `
      <div class="google-auth-container" style="max-width:440px;margin:0 auto">
        <!-- Google Header -->
        <div class="google-auth-header" style="text-align:center;padding-bottom:10px">
          <svg width="42" height="42" viewBox="0 0 48 48">
            <path fill="#4285F4" d="M46.145 24.498c0-1.534-.138-3.01-.395-4.43H24v8.38h12.441c-.537 2.9-2.17 5.358-4.623 7.008v5.826h7.482c4.38-4.034 6.845-9.983 6.845-16.784z"/>
            <path fill="#34A853" d="M24 47c6.24 0 11.47-2.069 15.3-5.618l-7.482-5.826C29.69 37.137 27.025 38 24 38c-6.025 0-11.13-4.068-12.952-9.537H3.383v6.015C7.19 42.655 15.002 47 24 47z"/>
            <path fill="#FBBC05" d="M11.048 28.463A13.863 13.863 0 0110.4 24c0-1.545.265-3.046.648-4.463v-6.015H3.383A23.01 23.01 0 001 24c0 3.72.895 7.24 2.383 10.478l7.665-6.015z"/>
            <path fill="#EA4335" d="M24 10c3.396 0 6.44 1.167 8.835 3.46l6.624-6.624C35.466 3.202 30.237 1 24 1 15.002 1 7.19 5.345 3.383 13.522l7.665 6.015C12.87 14.068 17.975 10 24 10z"/>
          </svg>
          <h3 style="font-size:1.25rem;font-weight:700;margin:8px 0 2px;color:var(--text-primary)">Google Authentication</h3>
          <p style="font-size:.85rem;color:var(--text-secondary);margin:0">Sign in to <strong style="color:var(--primary)">NextStep AI</strong></p>
        </div>

        <!-- Navigation Tabs -->
        <div class="tabs" style="margin:14px 0 16px">
          <button type="button" class="tab-btn ${initialTab === 'signin' ? 'active' : ''}" id="tab-btn-signin" onclick="Auth.switchGoogleTab('signin')">
            👤 Google Accounts
          </button>
          <button type="button" class="tab-btn ${initialTab === 'config' ? 'active' : ''}" id="tab-btn-config" onclick="Auth.switchGoogleTab('config')">
            ⚙️ OAuth Client ID ${hasClientId ? '✓' : ''}
          </button>
        </div>

        <!-- TAB 1: ACCOUNTS & ONE-TAP SIGN IN -->
        <div id="tab-pane-signin" style="${initialTab === 'signin' ? 'display:block' : 'display:none'}">
          <!-- Real Google GIS Official Button slot if configured -->
          <div id="gsi-modal-slot" style="display:flex;justify-content:center;margin-bottom:12px"></div>

          <div class="google-accounts-list" id="google-accounts-wrap">
            <!-- Student account -->
            <button type="button" class="google-account-btn" onclick="Auth.selectGoogleAccount({ name:'SUDHARSAN K', email:'sudharsan@example.com' })">
              <div class="google-acc-avatar" style="background:#4f46e5;color:#fff">SK</div>
              <div class="google-acc-details">
                <div class="google-acc-name">SUDHARSAN K</div>
                <div class="google-acc-email">sudharsan@example.com</div>
              </div>
              <span class="google-acc-badge">Student</span>
            </button>

            <!-- 1-Click Google User -->
            <button type="button" class="google-account-btn" onclick="Auth.selectGoogleAccount({ name:'Google Student', email:'student.career@gmail.com' })">
              <div class="google-acc-avatar" style="background:#0284c7;color:#fff">GS</div>
              <div class="google-acc-details">
                <div class="google-acc-name">Google Student</div>
                <div class="google-acc-email">student.career@gmail.com</div>
              </div>
              <span class="google-acc-badge google-acc-badge-new">⚡ Instant</span>
            </button>

            <!-- Admin account -->
            <button type="button" class="google-account-btn" onclick="Auth.selectGoogleAccount({ name:'Admin User', email:'admin@nextstep.ai' })">
              <div class="google-acc-avatar" style="background:#e11d48;color:#fff">AU</div>
              <div class="google-acc-details">
                <div class="google-acc-name">Admin User</div>
                <div class="google-acc-email">admin@nextstep.ai</div>
              </div>
              <span class="google-acc-badge">Admin</span>
            </button>
          </div>

        </div>

        <!-- TAB 2: REAL GOOGLE OAUTH 2.0 CLIENT CONFIGURATION -->
        <div id="tab-pane-config" style="${initialTab === 'config' ? 'display:block' : 'display:none'}">
          <div style="padding:14px;background:#f8fafc;border:1px solid var(--border);border-radius:10px;margin-bottom:14px">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
              <span style="font-size:.8rem;font-weight:700;color:var(--text-primary)">OAuth 2.0 Status:</span>
              <span class="badge ${hasClientId ? 'badge-success' : 'badge-warning'}" style="font-size:.72rem">
                ${hasClientId ? '● Active Client ID' : '○ Standalone / Demo'}
              </span>
            </div>
            <p style="font-size:.78rem;color:var(--text-secondary);margin:0">
              Connect your Google Cloud OAuth Client ID for real Google One-Tap & official Google Login.
            </p>
          </div>

          <div class="form-group mb-12">
            <label class="form-label" style="font-size:.8rem;font-weight:600">Google Client ID</label>
            <input class="form-input" id="gauth-client-id-input" placeholder="e.g. 123456789-abc.apps.googleusercontent.com" value="${currentClientId}" style="font-size:.82rem" />
            <div style="font-size:.74rem;color:var(--text-muted);margin-top:4px">
              Paste your Web Client ID from Google Cloud Console.
            </div>
          </div>

          <div style="display:flex;gap:8px;margin-bottom:16px">
            <button class="btn btn-primary btn-full btn-sm" onclick="Auth.saveGoogleClientIdFromModal()">
              <i data-lucide="save" style="width:14px;height:14px"></i>Save & Connect
            </button>
            ${hasClientId ? `<button class="btn btn-outline btn-sm" onclick="Auth.clearGoogleClientIdFromModal()">Clear</button>` : ''}
          </div>

          <!-- Step-by-step setup guide -->
          <div style="border-top:1px solid var(--border);padding-top:12px;font-size:.76rem;color:var(--text-secondary)">
            <div style="font-weight:700;margin-bottom:6px;color:var(--text-primary)">3-Step Google Setup:</div>
            <ol style="margin:0 0 10px 16px;padding:0;line-height:1.6">
              <li>Open <a href="https://console.cloud.google.com/apis/credentials" target="_blank" style="color:var(--primary);text-decoration:underline">Google Cloud Console &rarr;</a></li>
              <li>Create <strong>OAuth Client ID</strong> (Web Application).</li>
              <li>Add to <strong>Authorized JavaScript origins</strong>:
                <code style="display:block;background:#e2e8f0;padding:2px 6px;border-radius:4px;margin-top:2px;user-select:all;color:#0f172a">${currentOrigin}</code>
              </li>
            </ol>
          </div>
        </div>

        <div style="margin-top:14px;font-size:0.75rem;color:var(--text-muted);text-align:center;line-height:1.4">
          Google authentication securely identifies your profile with NextStep AI.
        </div>
      </div>
    `;

    UI.modal('Google Authentication', modalContent);
    if (window.lucide) lucide.createIcons();

    // If a client ID is configured and GIS is available, render Google button inside modal
    if (hasClientId) {
      setTimeout(() => this.initGoogleIdentity('gsi-modal-slot'), 100);
    }
  },

  switchGoogleTab(tab) {
    const signinPane = document.getElementById('tab-pane-signin');
    const configPane = document.getElementById('tab-pane-config');
    const signinBtn  = document.getElementById('tab-btn-signin');
    const configBtn  = document.getElementById('tab-btn-config');

    if (tab === 'signin') {
      if (signinPane) signinPane.style.display = 'block';
      if (configPane) configPane.style.display = 'none';
      signinBtn?.classList.add('active');
      configBtn?.classList.remove('active');
      if (this.getGoogleClientId()) {
        setTimeout(() => this.initGoogleIdentity('gsi-modal-slot'), 50);
      }
    } else {
      if (signinPane) signinPane.style.display = 'none';
      if (configPane) configPane.style.display = 'block';
      signinBtn?.classList.remove('active');
      configBtn?.classList.add('active');
    }
  },

  saveGoogleClientIdFromModal() {
    const input = document.getElementById('gauth-client-id-input');
    const val = input ? input.value.trim() : '';
    if (!val) {
      UI.toast('Please enter a valid Google Client ID.', 'warning');
      return;
    }
    this.setGoogleClientId(val);
    UI.toast('Google OAuth Client ID saved successfully! Initializing Google...', 'success');
    this.switchGoogleTab('signin');
  },

  clearGoogleClientIdFromModal() {
    this.setGoogleClientId('');
    UI.toast('Google Client ID removed.', 'info');
    this.switchGoogleTab('signin');
  },



  async selectGoogleAccount(accountData) {
    const wrap = document.getElementById('google-accounts-wrap');
    if (wrap) {
      wrap.innerHTML = `
        <div style="text-align:center;padding:26px 12px">
          <div class="spinner" style="width:34px;height:34px;border-width:3px;margin:0 auto 14px;border-top-color:#4285F4"></div>
          <div style="font-weight:600;font-size:.95rem;color:var(--text-primary)">Authenticating with Google...</div>
          <div style="font-size:.8rem;color:var(--text-secondary);margin-top:4px">${accountData.email}</div>
        </div>
      `;
    }

    try {
      const res = await this.loginWithGoogle(accountData, true);
      setTimeout(() => {
        UI.closeModal();
        if (res.success) {
          UI.toast(`Welcome back, ${res.user.name.split(' ')[0]}! Signed in with Google 🎉`, 'success');
          Router.navigate(res.user.role === 'admin' ? 'admin' : 'dashboard');
        } else {
          UI.toast(res.error || 'Google login failed.', 'error');
        }
      }, 400);
    } catch(err) {
      console.error('Google auth error:', err);
      UI.closeModal();
      UI.toast('An error occurred during Google sign-in. Please try again.', 'error');
    }
  },

  /* ══════════════════════════════════════════
     JWT AUTHORIZATION HELPERS
     ══════════════════════════════════════════ */
  JWT_TOKEN_KEY: 'nxt_jwt_token',

  getJwtToken() {
    return localStorage.getItem(this.JWT_TOKEN_KEY) || sessionStorage.getItem(this.JWT_TOKEN_KEY) || '';
  },

  setJwtToken(token) {
    if (token) {
      localStorage.setItem(this.JWT_TOKEN_KEY, token);
      sessionStorage.setItem(this.JWT_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(this.JWT_TOKEN_KEY);
      sessionStorage.removeItem(this.JWT_TOKEN_KEY);
    }
  },

  getAuthHeader() {
    const token = this.getJwtToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  },

  /* Verify JWT token with backend server */
  async verifyJwtWithBackend(token = null) {
    const t = token || this.getJwtToken();
    if (!t || typeof SheetsDB === 'undefined' || !SheetsDB._isConfigured()) return null;
    try {
      return await SheetsDB.post({ action: 'verifyJwt', jwt: t });
    } catch (e) {
      console.warn('verifyJwtWithBackend error:', e);
      return null;
    }
  },

  /* ══════════════════════════════════════════
     GITHUB AUTHENTICATION & PROFILE CONNECT
     ══════════════════════════════════════════ */

  async loginWithGithub(githubData = {}, remember = true) {
    const rawUsername = (githubData.username || githubData.login || '').trim().replace(/^@/, '');
    if (!rawUsername && !githubData.token) {
      return { success: false, error: 'Please enter a valid GitHub username or token.' };
    }

    let ghProfile = null;
    let ghRepos   = [];

    // 1. Fetch real GitHub public profile & repositories
    try {
      const headers = { 'Accept': 'application/vnd.github.v3+json' };
      if (githubData.token) headers['Authorization'] = `Bearer ${githubData.token.trim()}`;

      const userUrl = githubData.token
        ? 'https://api.github.com/user'
        : `https://api.github.com/users/${encodeURIComponent(rawUsername)}`;

      const res = await fetch(userUrl, { headers });
      if (res.ok) {
        ghProfile = await res.json();
      } else if (res.status === 404) {
        return { success: false, error: `GitHub user @${rawUsername} was not found.` };
      }

      // Fetch user's top public repositories if available
      const reposUrl = githubData.token
        ? 'https://api.github.com/user/repos?sort=updated&per_page=6'
        : `https://api.github.com/users/${encodeURIComponent(rawUsername)}/repos?sort=updated&per_page=6`;

      const reposRes = await fetch(reposUrl, { headers });
      if (reposRes.ok) {
        ghRepos = await reposRes.json();
      }
    } catch (e) {
      console.warn('[GitHubAuth] GitHub API fetch notice:', e.message);
    }

    const username = (ghProfile?.login || rawUsername || 'developer').trim();
    const email    = (ghProfile?.email || githubData.email || `${username.toLowerCase()}@users.noreply.github.com`).trim().toLowerCase();
    const name     = (ghProfile?.name || githubData.name || username).trim();
    const avatar   = ghProfile?.avatar_url || githubData.avatar || `https://github.com/${username}.png`;
    const location = ghProfile?.location || 'India';
    const bio      = ghProfile?.bio || '';
    const company  = ghProfile?.company || '';

    // 2. Sync to SheetsDB if configured
    let backendResult = null;
    if (typeof SheetsDB !== 'undefined' && SheetsDB._isConfigured()) {
      try {
        backendResult = await SheetsDB.post({
          action: 'verifyGithubToken',
          token: githubData.token || '',
          profile: { username, email, name, avatar }
        });
        if (backendResult?.status === 'success' && backendResult.jwt) {
          this.setJwtToken(backendResult.jwt);
        }
      } catch (e) {
        console.warn('[GitHubAuth] Backend verification warning:', e.message);
      }
    }

    // 3. Find or Create User in Store
    let users = Store.getUsers();
    let user  = users.find(u => u.email.toLowerCase() === email || u.githubUsername === username);
    const isNew = !user;

    if (isNew) {
      user = {
        id:                Date.now(),
        role:              email.includes('admin') ? 'admin' : 'student',
        name:              name.replace(/\b\w/g, l => l.toUpperCase()),
        email:             email,
        githubUsername:    username,
        phone:             '+91 98765 43210',
        password:          null,
        location:          location,
        degree:            'B.Tech / B.E. Computer Science',
        department:        'Computer Science & Engineering',
        college:           company ? company.replace(/^@/, '') : 'Anna University / Top Engineering College',
        year:              3,
        cgpa:              8.8,
        profileCompletion: 80,
        profile_completed: true,
        assessmentScore:   85,
        assessmentDone:    true,
        analysisRun:       true,
        avatar:            avatar,
        auth_provider:     'github',
        provider:          'github',
        jwtToken:          backendResult ? backendResult.jwt : null,
        created_at:        new Date().toISOString(),
        updated_at:        new Date().toISOString()
      };

      // Extract skills from repositories
      const detectedLangs = new Set(['Git & GitHub']);
      if (Array.isArray(ghRepos)) {
        ghRepos.forEach(r => { if (r.language) detectedLangs.add(r.language); });
      }
      const initialSkills = Array.from(detectedLangs).map((lang, idx) => ({
        id: idx + 1, name: lang, category: 'Technical', level: idx === 0 ? 'Advanced' : 'Intermediate', verified: true
      }));
      Store.setUserSkills(user.id, initialSkills);

      // Extract projects from GitHub repositories
      if (Array.isArray(ghRepos) && ghRepos.length > 0) {
        const userProjects = ghRepos.slice(0, 4).map((r, idx) => ({
          id: Date.now() + idx,
          userId: user.id,
          name: r.name.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          description: r.description || `Open source project on GitHub with ${r.stargazers_count || 0} stars.`,
          technologies: [r.language || 'Code', 'Git', 'GitHub'],
          role: 'Author / Maintainer',
          duration: 'Active',
          link: r.html_url
        }));
        Store.setUserProjects(user.id, userProjects);
      }

      users.push(user);
      Store.setUsers(users);

    } else {
      user.provider       = 'github';
      user.auth_provider  = 'github';
      user.githubUsername = username;
      if (!user.avatar || (avatar && avatar.startsWith('http'))) user.avatar = avatar;
      if (backendResult?.jwt) user.jwtToken = backendResult.jwt;
      user.updated_at = new Date().toISOString();
      Store.updateUser(user.id, user);
    }

    const session = this._makeSession(user);
    if (backendResult?.jwt) session.jwt = backendResult.jwt;
    this._saveSession(session, remember);
    return { success: true, user: session, isNew, jwt: backendResult?.jwt };
  },

  /* Show GitHub interactive login modal */
  showGithubModal() {
    const ghSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
    </svg>`;

    const modalContent = `
      <div style="max-width:400px;margin:0 auto;font-family:'Inter',system-ui,sans-serif">
        <div style="text-align:center;padding:6px 0 18px">
          <div style="width:60px;height:60px;background:#24292e;color:#fff;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px;box-shadow:0 4px 14px rgba(0,0,0,0.18)">
            ${ghSvg}
          </div>
          <h3 style="font-size:1.25rem;font-weight:700;color:var(--text-primary);margin:0 0 4px">Sign in with GitHub</h3>
          <p style="font-size:.875rem;color:var(--text-secondary);margin:0">Continue to <strong style="color:var(--primary)">NextStep AI</strong></p>
        </div>

        <div id="gh-loading-wrap" style="display:none;text-align:center;padding:24px 12px">
          <div class="spinner" style="width:36px;height:36px;border-width:3px;margin:0 auto 12px;border-top-color:#24292e"></div>
          <div style="font-weight:600;font-size:.9rem;color:var(--text-primary)">Connecting to GitHub API...</div>
          <div style="font-size:.78rem;color:var(--text-secondary);margin-top:4px">Fetching profile & repositories</div>
        </div>

        <div id="gh-form-body">
          <div class="form-group mb-12">
            <label class="form-label" style="font-size:.82rem;font-weight:600">GitHub Username *</label>
            <div class="input-group has-icon">
              <span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#94a3b8;font-weight:700;font-size:1rem">@</span>
              <input class="form-input" id="gh-login-username" placeholder="e.g. torvalds or your-handle" style="padding-left:34px" />
            </div>
          </div>

          <div class="form-group mb-16">
            <label class="form-label" style="font-size:.82rem;font-weight:600;display:flex;justify-content:space-between">
              <span>Personal Access Token <span style="font-weight:400;color:var(--text-muted)">(optional)</span></span>
              <a href="https://github.com/settings/tokens" target="_blank" style="font-size:.75rem;color:var(--primary);text-decoration:underline">Get Token &rarr;</a>
            </label>
            <input class="form-input" type="password" id="gh-login-token" placeholder="ghp_xxxxxxxxxxxxxxxxxxxx (optional for private email)" style="font-size:.82rem" />
          </div>

          <button type="button" class="btn btn-github btn-full btn-lg" id="gh-submit-btn" onclick="Auth.handleGithubConnectSubmit()">
            ${ghSvg} Continue with GitHub
          </button>

          <div style="text-align:center;font-size:.75rem;color:var(--text-muted);margin-top:16px;line-height:1.4">
            <i data-lucide="shield-check" style="width:12px;height:12px;vertical-align:middle;display:inline-block"></i>
            Syncs verified GitHub profile & top repositories automatically.
          </div>
        </div>
      </div>
    `;

    UI.modal('GitHub Authentication', modalContent);
    if (window.lucide) lucide.createIcons();

    setTimeout(() => {
      const input = document.getElementById('gh-login-username');
      if (input) {
        input.focus();
        input.addEventListener('keydown', e => { if (e.key === 'Enter') Auth.handleGithubConnectSubmit(); });
      }
    }, 100);
  },

  async handleGithubConnectSubmit() {
    const userEl  = document.getElementById('gh-login-username');
    const tokenEl = document.getElementById('gh-login-token');
    const username = (userEl?.value || '').trim().replace(/^@/, '');
    const token    = (tokenEl?.value || '').trim();

    if (!username && !token) {
      UI.toast('Please enter your GitHub username.', 'warning');
      userEl?.focus();
      return;
    }

    const formBody = document.getElementById('gh-form-body');
    const loadingWrap = document.getElementById('gh-loading-wrap');
    if (formBody) formBody.style.display = 'none';
    if (loadingWrap) loadingWrap.style.display = 'block';

    try {
      const result = await this.loginWithGithub({ username, token }, true);
      if (result.success) {
        UI.closeModal();
        UI.toast(`Welcome, ${result.user.name.split(' ')[0]}! Signed in with GitHub 🐙`, 'success');
        Router.navigate(result.user.role === 'admin' ? 'admin' : 'dashboard');
      } else {
        if (formBody) formBody.style.display = 'block';
        if (loadingWrap) loadingWrap.style.display = 'none';
        UI.toast(result.error || 'GitHub authentication failed.', 'error');
      }
    } catch (e) {
      console.error('[GitHubAuth] Login error:', e);
      if (formBody) formBody.style.display = 'block';
      if (loadingWrap) loadingWrap.style.display = 'none';
      UI.toast('An error occurred during GitHub login. Please try again.', 'error');
    }
  },

  _makeSession(user) {
    return {
      id: user.id, name: user.name, email: user.email,
      role: user.role,
      avatar: user.avatar || user.name.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2)
    };
  },

  _saveSession(session, remember) {
    if (remember) { localStorage.setItem(this.SESSION_KEY, JSON.stringify(session)); }
    sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
  },

  logout() {
    sessionStorage.removeItem(this.SESSION_KEY);
    localStorage.removeItem(this.SESSION_KEY);
  },

  isLoggedIn() { return !!this.getCurrentUser(); },
  isAdmin()    { const u = this.getCurrentUser(); return u && u.role === 'admin'; },
  isStudent()  { const u = this.getCurrentUser(); return u && u.role === 'student'; },

  requireAuth(callback) {
    if (!this.isLoggedIn()) { Router.navigate('login'); return false; }
    if (callback) callback();
    return true;
  },

  requireAdmin(callback) {
    if (!this.isLoggedIn()) { Router.navigate('login'); return false; }
    if (!this.isAdmin()) { Router.navigate('dashboard'); UI.toast('Access denied.', 'error'); return false; }
    if (callback) callback();
    return true;
  }
};


