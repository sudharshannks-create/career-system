/* ============================================
   pages/register.js
   ============================================ */

Pages.register = function(container) {
  container.innerHTML = `
  <div class="auth-page">
    <div class="auth-left">
      <div class="auth-left-content">
        <div class="auth-brand">
          <div class="auth-brand-icon"><i data-lucide="zap" style="width:26px;height:26px;color:#fff"></i></div>
          <div class="auth-brand-name">NextStep AI</div>
        </div>
        <div class="auth-tagline">Start your AI-powered career journey today.</div>
        <p class="auth-sub">Create your profile, take the assessment, and get personalized career recommendations in minutes.</p>
        <div class="auth-features">
          <div class="auth-feature"><div class="auth-feature-icon"><i data-lucide="target" style="width:16px;height:16px;color:#a5b4fc"></i></div><span>Personalized career roadmaps based on your skills</span></div>
          <div class="auth-feature"><div class="auth-feature-icon"><i data-lucide="trending-up" style="width:16px;height:16px;color:#a5b4fc"></i></div><span>Real-time skill gap analysis and course recommendations</span></div>
          <div class="auth-feature"><div class="auth-feature-icon"><i data-lucide="award" style="width:16px;height:16px;color:#a5b4fc"></i></div><span>Certification guidance for your target career</span></div>
        </div>
      </div>
    </div>
    <div class="auth-right" style="overflow-y:auto;align-items:flex-start;padding:32px 60px">
      <div class="auth-form-box" style="max-width:500px;width:100%;padding:20px 0">
        <h2>Create Account</h2>
        <p>Join NextStep AI and discover your ideal career path</p>

        <div id="reg-error" style="display:none;background:#fef2f2;border:1px solid #fecdd3;border-radius:8px;padding:10px 14px;margin-bottom:16px;font-size:.85rem;color:#be123c"></div>
        <div id="reg-success" style="display:none;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:10px 14px;margin-bottom:16px;font-size:.85rem;color:#166534">Account created successfully!</div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Full Name *</label>
            <div class="input-group has-icon">
              <i data-lucide="user" class="input-icon"></i>
              <input class="form-input" type="text" id="reg-name" placeholder="John Doe" />
            </div>
            <div class="form-error" id="err-name">Full name is required.</div>
          </div>
          <div class="form-group">
            <label class="form-label">Email *</label>
            <div class="input-group has-icon">
              <i data-lucide="mail" class="input-icon"></i>
              <input class="form-input" type="email" id="reg-email" placeholder="you@example.com" />
            </div>
            <div class="form-error" id="err-reg-email">Valid email required.</div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Phone Number</label>
            <div class="input-group has-icon">
              <i data-lucide="phone" class="input-icon"></i>
              <input class="form-input" type="tel" id="reg-phone" placeholder="+91 98765 43210" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Location</label>
            <div class="input-group has-icon">
              <i data-lucide="map-pin" class="input-icon"></i>
              <input class="form-input" type="text" id="reg-location" placeholder="Chennai, Tamil Nadu" />
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Password *</label>
            <div class="input-group has-icon">
              <i data-lucide="lock" class="input-icon"></i>
              <input class="form-input" type="password" id="reg-password" placeholder="Min 6 characters" />
              <button class="input-toggle" id="toggle-reg-pw" type="button"><i data-lucide="eye"></i></button>
            </div>
            <div class="form-error" id="err-reg-pw">Min 6 characters required.</div>
          </div>
          <div class="form-group">
            <label class="form-label">Confirm Password *</label>
            <div class="input-group has-icon">
              <i data-lucide="lock" class="input-icon"></i>
              <input class="form-input" type="password" id="reg-confirm" placeholder="Repeat password" />
            </div>
            <div class="form-error" id="err-confirm">Passwords do not match.</div>
          </div>
        </div>

        <div class="divider"></div>
        <p style="font-size:.8rem;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.04em;margin-bottom:12px">Academic Information</p>

        <div class="form-group">
          <label class="form-label">Degree / Education *</label>
          <div class="input-group has-icon">
            <i data-lucide="graduation-cap" class="input-icon"></i>
            <input class="form-input" type="text" id="reg-education" placeholder="B.E. Mechanical Engineering" />
          </div>
          <div class="form-error" id="err-edu">Education is required.</div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Department *</label>
            <select class="form-select" id="reg-dept">
              <option value="">Select Department</option>
              <option>Computer Science Engineering</option>
              <option>Information Technology</option>
              <option>Electronics and Communication</option>
              <option>Electrical Engineering</option>
              <option>Mechanical Engineering</option>
              <option>Civil Engineering</option>
              <option>Data Science</option>
              <option>Artificial Intelligence</option>
              <option>Other</option>
            </select>
            <div class="form-error" id="err-dept">Please select a department.</div>
          </div>
          <div class="form-group">
            <label class="form-label">Year of Study *</label>
            <select class="form-select" id="reg-year">
              <option value="">Select Year</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
              <option value="5">5th Year / PG</option>
            </select>
            <div class="form-error" id="err-year">Please select your year.</div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">CGPA (out of 10)</label>
          <div class="input-group has-icon">
            <i data-lucide="star" class="input-icon"></i>
            <input class="form-input" type="number" id="reg-cgpa" placeholder="e.g. 8.5" min="0" max="10" step="0.1" />
          </div>
        </div>

        <button class="btn btn-primary btn-full btn-lg" id="reg-btn" onclick="registerSubmit()" style="margin-top:8px">
          <i data-lucide="user-plus"></i>Create Account
        </button>

        <div class="form-divider" style="margin:18px 0"><span>or register with</span></div>

        <div id="gsi-reg-slot" style="display:flex;justify-content:center;margin-bottom:10px"></div>

        <button type="button" class="btn btn-google btn-full" onclick="GoogleAuth.showModal()">
          <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#4285F4" d="M46.145 24.498c0-1.534-.138-3.01-.395-4.43H24v8.38h12.441c-.537 2.9-2.17 5.358-4.623 7.008v5.826h7.482c4.38-4.034 6.845-9.983 6.845-16.784z"/><path fill="#34A853" d="M24 47c6.24 0 11.47-2.069 15.3-5.618l-7.482-5.826C29.69 37.137 27.025 38 24 38c-6.025 0-11.13-4.068-12.952-9.537H3.383v6.015C7.19 42.655 15.002 47 24 47z"/><path fill="#FBBC05" d="M11.048 28.463A13.863 13.863 0 0110.4 24c0-1.545.265-3.046.648-4.463v-6.015H3.383A23.01 23.01 0 001 24c0 3.72.895 7.24 2.383 10.478l7.665-6.015z"/><path fill="#EA4335" d="M24 10c3.396 0 6.44 1.167 8.835 3.46l6.624-6.624C35.466 3.202 30.237 1 24 1 15.002 1 7.19 5.345 3.383 13.522l7.665 6.015C12.87 14.068 17.975 10 24 10z"/></svg>
          Continue with Google
        </button>

        <p style="text-align:center;margin-top:20px;font-size:.875rem;color:var(--text-secondary)">
          Already have an account? <a onclick="Router.navigate('login')" style="font-weight:600;cursor:pointer">Sign in</a>
        </p>
      </div>
    </div>
  </div>`;

  document.getElementById('toggle-reg-pw').addEventListener('click', function() {
    const pw = document.getElementById('reg-password');
    const isText = pw.type === 'text';
    pw.type = isText ? 'password' : 'text';
    this.innerHTML = isText ? '<i data-lucide="eye"></i>' : '<i data-lucide="eye-off"></i>';
    if (window.lucide) lucide.createIcons();
  });

  // Auto-dismiss errors when typing or changing selections
  const fieldIds = ['reg-name', 'reg-email', 'reg-phone', 'reg-location', 'reg-password', 'reg-confirm', 'reg-education', 'reg-dept', 'reg-year', 'reg-cgpa'];
  fieldIds.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const clearErr = () => {
      const errBox = document.getElementById('reg-error');
      if (errBox) errBox.style.display = 'none';
      const succBox = document.getElementById('reg-success');
      if (succBox) succBox.style.display = 'none';

      if (id === 'reg-name') document.getElementById('err-name')?.classList.remove('show');
      if (id === 'reg-email') document.getElementById('err-reg-email')?.classList.remove('show');
      if (id === 'reg-password') document.getElementById('err-reg-pw')?.classList.remove('show');
      if (id === 'reg-confirm') document.getElementById('err-confirm')?.classList.remove('show');
      if (id === 'reg-education') document.getElementById('err-edu')?.classList.remove('show');
      if (id === 'reg-dept') document.getElementById('err-dept')?.classList.remove('show');
      if (id === 'reg-year') document.getElementById('err-year')?.classList.remove('show');
    };
    el.addEventListener('input', clearErr);
    el.addEventListener('change', clearErr);
    el.addEventListener('keydown', e => { if (e.key === 'Enter') registerSubmit(); });
  });

  if (GoogleAuth.getClientId()) {
    setTimeout(() => GoogleAuth.init('gsi-reg-slot'), 200);
  }
};

async function registerSubmit() {
  const name      = document.getElementById('reg-name').value.trim();
  const email     = document.getElementById('reg-email').value.trim();
  const password  = document.getElementById('reg-password').value;
  const confirm   = document.getElementById('reg-confirm').value;
  const education = document.getElementById('reg-education').value.trim();
  const dept      = document.getElementById('reg-dept').value;
  const year      = document.getElementById('reg-year').value;
  const phone     = document.getElementById('reg-phone').value.trim();
  const location  = document.getElementById('reg-location').value.trim();
  const cgpa      = document.getElementById('reg-cgpa').value;

  const errEl  = document.getElementById('reg-error');
  const succEl = document.getElementById('reg-success');
  if (errEl) errEl.style.display = 'none';
  if (succEl) succEl.style.display = 'none';

  // 1. Validate required fields
  let valid = true;
  const showErr = (id, show) => {
    const el = document.getElementById(id);
    if (el) el.classList[show ? 'add' : 'remove']('show');
  };

  showErr('err-name', !name);
  if (!name) valid = false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  showErr('err-reg-email', !email || !emailRegex.test(email));
  if (!email || !emailRegex.test(email)) valid = false;

  showErr('err-reg-pw', password.length < 6);
  if (password.length < 6) valid = false;

  showErr('err-confirm', password !== confirm);
  if (password !== confirm) valid = false;

  showErr('err-edu', !education);
  if (!education) valid = false;

  showErr('err-dept', !dept);
  if (!dept) valid = false;

  showErr('err-year', !year);
  if (!year) valid = false;

  if (!valid) return;

  // 2. Prevent duplicate submission while request is processing
  const btn = document.getElementById('reg-btn');
  btn.disabled = true;
  btn.innerHTML = '<div class="spinner" style="width:18px;height:18px;border-width:2px"></div> Creating account...';

  // 3. Security requirement: Do NOT include password or confirm password in the Google Sheets payload
  const sheetsPayload = {
    fullName: name,
    email: email,
    phone: phone,
    location: location,
    education: education,
    department: dept,
    year: year,
    cgpa: cgpa
  };

  try {
    // 4. Send non-sensitive data to Google Apps Script Web App API if configured
    if (typeof SheetsDB !== 'undefined' && SheetsDB._isConfigured()) {
      const response = await fetch(SheetsDB.API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(sheetsPayload)
      });

      const resData = await response.json();

      if (!resData || resData.status === 'error' || resData.success === false) {
        throw new Error(resData?.message || resData?.error || 'Failed to save account to Google Sheets.');
      }
    }

    // 5. Store user session locally so NextStep AI portal works seamlessly
    if (typeof Auth !== 'undefined') {
      const regResult = Auth.register({
        fullName: name,
        email: email,
        password: password,
        phone: phone,
        location: location,
        education: education,
        department: dept,
        year: year,
        cgpa: cgpa
      });

      if (!regResult.success && (!SheetsDB || !SheetsDB._isConfigured())) {
        throw new Error(regResult.error || 'An account with this email already exists.');
      }
    }

    // 6. Display “Account created successfully!” after successful submission
    if (succEl) {
      succEl.textContent = 'Account created successfully!';
      succEl.style.display = 'block';
    }
    if (typeof UI !== 'undefined' && UI.toast) {
      UI.toast('Account created successfully!', 'success');
    }

    // 7. Transition to dashboard
    setTimeout(() => {
      if (typeof Router !== 'undefined') Router.navigate('dashboard');
    }, 1200);

  } catch (error) {
    console.error('Account creation error:', error);
    if (errEl) {
      errEl.textContent = error.message || 'Submission failed. Please check your connection and try again.';
      errEl.style.display = 'block';
    }
    btn.disabled = false;
    btn.innerHTML = '<i data-lucide="user-plus"></i>Create Account';
    if (window.lucide) lucide.createIcons();
  }
}
