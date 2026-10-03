/* ============================================
   pages/login.js
   ============================================ */

Pages.login = function (container) {
  container.innerHTML = `
  <div class="auth-page">
    <div class="auth-left">
      <div class="auth-left-content">
        <div class="auth-brand">
          <div class="auth-brand-icon"><i data-lucide="zap" style="width:26px;height:26px;color:#fff"></i></div>
          <div class="auth-brand-name">NextStep AI</div>
        </div>
        <div class="auth-tagline">Your AI-powered path to the right career.</div>
        <p class="auth-sub">Join thousands of students who discovered their ideal career with personalized AI recommendations.</p>
        <div class="auth-features">
          <div class="auth-feature"><div class="auth-feature-icon"><i data-lucide="brain" style="width:16px;height:16px;color:#a5b4fc"></i></div><span>AI-powered career matching based on your unique profile</span></div>
          <div class="auth-feature"><div class="auth-feature-icon"><i data-lucide="bar-chart-2" style="width:16px;height:16px;color:#a5b4fc"></i></div><span>Visual skill gap analysis with personalized roadmaps</span></div>
          <div class="auth-feature"><div class="auth-feature-icon"><i data-lucide="message-circle" style="width:16px;height:16px;color:#a5b4fc"></i></div><span>24/7 AI Career Coach for instant guidance</span></div>
          <div class="auth-feature"><div class="auth-feature-icon"><i data-lucide="mic" style="width:16px;height:16px;color:#a5b4fc"></i></div><span>Mock interview practice with real feedback</span></div>
        </div>
      </div>
    </div>
    <div class="auth-right">
      <div class="auth-form-box">
        <h2>Welcome back Nextstep AI</h2>
        <p>Sign in to your NextStep AI account</p>
        <div id="login-error" class="form-error show" style="display:none;background:#fef2f2;border:1px solid #fecdd3;border-radius:8px;padding:10px 14px;margin-bottom:16px;font-size:.85rem;color:#be123c"></div>

        <div class="form-group">
          <label class="form-label">Email Address</label>
          <div class="input-group has-icon">
            <i data-lucide="mail" class="input-icon"></i>
            <input class="form-input" type="email" id="login-email" placeholder="Enter your email" autocomplete="email" />
          </div>
          <div class="form-error" id="err-email">Please enter a valid email.</div>
        </div>

        <div class="form-group">
          <label class="form-label">Password</label>
          <div class="input-group has-icon">
            <i data-lucide="lock" class="input-icon"></i>
            <input class="form-input" type="password" id="login-password" placeholder="Enter your password" autocomplete="current-password" />
            <button class="input-toggle" id="toggle-pw" type="button"><i data-lucide="eye"></i></button>
          </div>
          <div class="form-error" id="err-password">Password is required.</div>
        </div>

        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
          <div class="form-check">
            <input type="checkbox" id="remember-me" />
            <label for="remember-me">Remember me</label>
          </div>
          <a onclick="Router.navigate('forgot-password')" style="font-size:.85rem;font-weight:500;cursor:pointer">Forgot password?</a>
        </div>

        <button class="btn btn-primary btn-full btn-lg" id="login-btn" onclick="loginSubmit()">
          <i data-lucide="log-in"></i>Sign In
        </button>

        <div class="form-divider"><span>or continue with</span></div>

        <div id="gsi-login-slot" style="display:flex;justify-content:center;margin-bottom:10px"></div>

        <div class="social-login-grid" style="display:flex;flex-direction:column;gap:10px;margin-top:6px">
          <!-- Google Login Button -->
          <button type="button" class="btn btn-google btn-full" id="google-login-btn" onclick="Auth.showGoogleModal()">
            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#4285F4" d="M46.145 24.498c0-1.534-.138-3.01-.395-4.43H24v8.38h12.441c-.537 2.9-2.17 5.358-4.623 7.008v5.826h7.482c4.38-4.034 6.845-9.983 6.845-16.784z"/><path fill="#34A853" d="M24 47c6.24 0 11.47-2.069 15.3-5.618l-7.482-5.826C29.69 37.137 27.025 38 24 38c-6.025 0-11.13-4.068-12.952-9.537H3.383v6.015C7.19 42.655 15.002 47 24 47z"/><path fill="#FBBC05" d="M11.048 28.463A13.863 13.863 0 0110.4 24c0-1.545.265-3.046.648-4.463v-6.015H3.383A23.01 23.01 0 001 24c0 3.72.895 7.24 2.383 10.478l7.665-6.015z"/><path fill="#EA4335" d="M24 10c3.396 0 6.44 1.167 8.835 3.46l6.624-6.624C35.466 3.202 30.237 1 24 1 15.002 1 7.19 5.345 3.383 13.522l7.665 6.015C12.87 14.068 17.975 10 24 10z"/></svg>
            Continue with Google
          </button>

          <!-- GitHub Login Button -->
          <button type="button" class="btn btn-github btn-full" id="github-login-btn" onclick="Auth.showGithubModal()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
            Continue with GitHub
          </button>
        </div>

        <p style="text-align:center;margin-top:20px;font-size:.875rem;color:var(--text-secondary)">
          Don't have an account? <a onclick="Router.navigate('register')" style="font-weight:600;cursor:pointer">Create account</a>
        </p>
      </div>
    </div>
  </div>`;

  // Toggle password visibility
  document.getElementById('toggle-pw').addEventListener('click', function () {
    const pw = document.getElementById('login-password');
    const isText = pw.type === 'text';
    pw.type = isText ? 'password' : 'text';
    this.innerHTML = isText ? '<i data-lucide="eye"></i>' : '<i data-lucide="eye-off"></i>';
    if (window.lucide) lucide.createIcons();
  });

  // Clear errors when typing
  ['login-email', 'login-password'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', () => {
      document.getElementById('login-error').style.display = 'none';
      if (id === 'login-email') document.getElementById('err-email')?.classList.remove('show');
      if (id === 'login-password') document.getElementById('err-password')?.classList.remove('show');
    });
    el.addEventListener('keydown', e => { if (e.key === 'Enter') loginSubmit(); });
  });

  // Try mounting Google One Tap / GIS button if Client ID exists
  if (Auth.getGoogleClientId()) {
    setTimeout(() => Auth.initGoogleIdentity('gsi-login-slot'), 200);
  }

  if (window.lucide) lucide.createIcons();
};



async function loginSubmit() {
  const emailEl = document.getElementById('login-email');
  const pwEl = document.getElementById('login-password');
  if (!emailEl || !pwEl) return;

  const email = emailEl.value.trim();
  const password = pwEl.value.trim();
  const remember = document.getElementById('remember-me')?.checked || false;

  let valid = true;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    document.getElementById('err-email')?.classList.add('show'); valid = false;
  } else { document.getElementById('err-email')?.classList.remove('show'); }
  if (!password) {
    document.getElementById('err-password')?.classList.add('show'); valid = false;
  } else { document.getElementById('err-password')?.classList.remove('show'); }
  if (!valid) return;

  const btn = document.getElementById('login-btn');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner" style="width:18px;height:18px;border-width:2px"></div> Signing in...';
  }

  const result = await Auth.loginAsync(email, password, remember);

  if (result.success) {
    UI.toast(`Welcome back, ${result.user.name.split(' ')[0]}! 👋`, 'success');
    Router.navigate(result.user.role === 'admin' ? 'admin' : 'dashboard');
  } else {
    const errEl = document.getElementById('login-error');
    if (errEl) {
      errEl.style.display = 'block';
      errEl.textContent = result.error;
    }
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i data-lucide="log-in"></i>Sign In';
      if (window.lucide) lucide.createIcons();
    }
  }
}


