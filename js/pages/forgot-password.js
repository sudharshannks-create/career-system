/* ============================================
   pages/forgot-password.js
   ============================================ */

Pages.forgotPassword = function(container) {
  container.innerHTML = `
  <div class="auth-page">
    <div class="auth-left">
      <div class="auth-left-content">
        <div class="auth-brand">
          <div class="auth-brand-icon"><i data-lucide="zap" style="width:26px;height:26px;color:#fff"></i></div>
          <div class="auth-brand-name">NextStep AI</div>
        </div>
        <div class="auth-tagline">Recover your account</div>
        <p class="auth-sub">Enter your registered email and we'll send you a link to reset your password.</p>
      </div>
    </div>
    <div class="auth-right">
      <div class="auth-form-box">
        <div style="width:56px;height:56px;background:var(--primary-light);border-radius:16px;display:flex;align-items:center;justify-content:center;margin-bottom:20px">
          <i data-lucide="key-round" style="width:26px;height:26px;color:var(--primary)"></i>
        </div>
        <h2>Forgot Password?</h2>
        <p>No worries! Enter your email address and we'll send you reset instructions.</p>

        <div id="fp-success" style="display:none;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px 16px;margin-bottom:16px">
          <div style="display:flex;align-items:center;gap:10px;color:#166534;font-weight:600;font-size:.9rem">
            <i data-lucide="check-circle" style="width:18px;height:18px"></i>
            Reset link sent!
          </div>
          <p style="font-size:.82rem;color:#166534;margin-top:4px">Check your email for the password reset link. (Demo: link logged to console)</p>
        </div>

        <div class="form-group">
          <label class="form-label">Email Address</label>
          <div class="input-group has-icon">
            <i data-lucide="mail" class="input-icon"></i>
            <input class="form-input" type="email" id="fp-email" placeholder="Enter your registered email" />
          </div>
          <div class="form-error" id="err-fp-email">Please enter a valid email address.</div>
        </div>

        <button class="btn btn-primary btn-full btn-lg" id="fp-btn" onclick="forgotSubmit()">
          <i data-lucide="send"></i>Send Reset Link
        </button>

        <p style="text-align:center;margin-top:24px;font-size:.875rem;color:var(--text-secondary)">
          Remember your password? <a onclick="Router.navigate('login')" style="font-weight:600;cursor:pointer">Back to Sign in</a>
        </p>
      </div>
    </div>
  </div>`;
};

function forgotSubmit() {
  const email = document.getElementById('fp-email').value.trim();
  const errEl = document.getElementById('err-fp-email');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { errEl.classList.add('show'); return; }
  errEl.classList.remove('show');

  const btn = document.getElementById('fp-btn');
  btn.disabled = true; btn.innerHTML = '<div class="spinner" style="width:18px;height:18px;border-width:2px"></div> Sending...';

  setTimeout(() => {
    console.log('[NextStep AI] Password reset link for:', email);
    document.getElementById('fp-success').style.display = 'block';
    btn.innerHTML = '<i data-lucide="check"></i>Link Sent';
    btn.style.background = 'var(--success)';
    if (window.lucide) lucide.createIcons();
  }, 1000);
}
