/* ============================================================
   pages/career-setup.js - Career Profile Setup for new users
   NextStep AI | Shown to new Google-authenticated users only
   ============================================================ */

Pages.careerSetup = function(container) {

  var user = Auth.getCurrentUser();
  if (!user) { Router.navigate('login'); return; }

  var currentStep = 1;
  var totalSteps  = 4;

  var STEPS = [
    {
      label: 'Step 1 of 4',
      title: 'Personal Information',
      sub:   'Tell us a little about yourself.',
      fields: [
        { id: 'cs-name',     label: 'Full Name',     type: 'text', required: true,  placeholder: 'e.g. Sudharsan Kumar',  icon: 'user'    },
        { id: 'cs-phone',    label: 'Phone Number',  type: 'tel',  required: false, placeholder: 'e.g. +91 98765 43210', icon: 'phone'   },
        { id: 'cs-location', label: 'Location',      type: 'text', required: false, placeholder: 'e.g. Chennai, India',  icon: 'map-pin' },
      ],
    },
    {
      label: 'Step 2 of 4',
      title: 'Education',
      sub:   'Share your academic background.',
      fields: [
        { id: 'cs-degree',     label: 'Degree',             type: 'select', required: true,
          options: ['','B.E. / B.Tech','B.Sc','B.Com','B.A','M.E. / M.Tech','M.Sc','MBA','MCA','Diploma','PhD','Other'] },
        { id: 'cs-department', label: 'Department / Major', type: 'text',   required: true,  placeholder: 'e.g. Computer Science', icon: 'book-open' },
        { id: 'cs-college',    label: 'College / University', type: 'text', required: false, placeholder: 'e.g. Anna University',   icon: 'graduation-cap' },
        { id: 'cs-year',       label: 'Year of Study',      type: 'select', required: false,
          options: ['','1st Year','2nd Year','3rd Year','4th Year','Graduate','Post-Graduate','Alumni'] },
        { id: 'cs-cgpa',       label: 'CGPA / Percentage',  type: 'number', required: false, placeholder: 'e.g. 8.5',
          icon: 'bar-chart-2', min: '0', max: '10', step: '0.01' },
      ],
    },
    {
      label: 'Step 3 of 4',
      title: 'Skills and Interests',
      sub:   'What are you good at, and what excites you?',
      fields: [
        { id: 'cs-skills',   label: 'Technical Skills',  type: 'textarea', required: false,
          placeholder: 'e.g. Python, React, Machine Learning, SQL (comma separated)', icon: 'code' },
        { id: 'cs-interest', label: 'Areas of Interest', type: 'textarea', required: false,
          placeholder: 'e.g. AI/ML, Web Development, Data Science', icon: 'lightbulb' },
        { id: 'cs-certs',    label: 'Certifications (optional)', type: 'textarea', required: false,
          placeholder: 'e.g. AWS Cloud Practitioner, Google Data Analytics', icon: 'award' },
      ],
    },
    {
      label: 'Step 4 of 4',
      title: 'Career Preferences',
      sub:   'Help us understand your career goals.',
      fields: [
        { id: 'cs-role',     label: 'Target Job Role',      type: 'text',     required: false,
          placeholder: 'e.g. Software Engineer, Data Scientist', icon: 'briefcase' },
        { id: 'cs-industry', label: 'Preferred Industries',  type: 'textarea', required: false,
          placeholder: 'e.g. FinTech, Healthcare, E-commerce',   icon: 'building' },
        { id: 'cs-projects', label: 'Projects / Experience', type: 'textarea', required: false,
          placeholder: 'Briefly describe your key projects or work experience', icon: 'folder' },
      ],
    },
  ];

  var data = {};

  function _renderField(f) {
    var req     = f.required ? ' <span style="color:#ef4444">*</span>' : '';
    var iconHtml = f.icon ? '<i data-lucide="' + f.icon + '" class="input-icon" aria-hidden="true"></i>' : '';

    if (f.type === 'select') {
      var opts = f.options.map(function(o, i) {
        return '<option value="' + o + '"' + (i === 0 ? ' disabled selected' : '') + '>'
          + (o || 'Select...') + '</option>';
      }).join('');
      return '<div class="form-group">'
        + '<label class="form-label" for="' + f.id + '">' + f.label + req + '</label>'
        + '<div class="input-group"><select class="form-input" id="' + f.id + '"'
        + (f.required ? ' required' : '') + '>' + opts + '</select></div></div>';
    }

    if (f.type === 'textarea') {
      var pl = (f.placeholder || '').replace(/"/g, '&quot;');
      var val = (data[f.id] || '');
      var pad = f.icon ? '42px' : '14px';
      return '<div class="form-group">'
        + '<label class="form-label" for="' + f.id + '">' + f.label + req + '</label>'
        + '<div class="input-group has-icon">' + iconHtml
        + '<textarea class="form-input" id="' + f.id + '" rows="3" placeholder="' + pl + '"'
        + ' style="resize:vertical;padding-left:' + pad + '">' + val + '</textarea></div></div>';
    }

    var extras = f.min !== undefined
      ? ' min="' + f.min + '" max="' + f.max + '" step="' + f.step + '"'
      : '';
    var pl2 = (f.placeholder || '').replace(/"/g, '&quot;');
    return '<div class="form-group">'
      + '<label class="form-label" for="' + f.id + '">' + f.label + req + '</label>'
      + '<div class="input-group has-icon">' + iconHtml
      + '<input class="form-input" type="' + f.type + '" id="' + f.id + '"'
      + ' placeholder="' + pl2 + '"' + extras + (f.required ? ' required' : '')
      + ' value="' + (data[f.id] || '') + '" autocomplete="off" /></div></div>';
  }

  function _renderStep(step) {
    var s    = STEPS[step - 1];
    var pct  = Math.round((step / totalSteps) * 100);
    var fields = s.fields.map(_renderField).join('');

    var dots = '';
    for (var di = 0; di < totalSteps; di++) {
      dots += '<div style="width:8px;height:8px;border-radius:50%;background:'
        + (di < step ? '#4f46e5' : '#e2e8f0') + ';transition:background .3s"></div>';
    }

    var backBtn = step > 1
      ? '<button class="btn btn-outline" id="setup-back-btn" onclick="setupBack()">&#8592; Back</button>'
      : '<div></div>';
    var nextLabel = step < totalSteps ? 'Continue &#8594;' : '&#10003; Finish Setup';

    return '<div class="setup-page"><div class="setup-container">'
      + '<div class="setup-header">'
      + '<div style="display:inline-flex;align-items:center;gap:10px;margin-bottom:10px">'
      + '<div style="width:36px;height:36px;background:linear-gradient(135deg,#4f46e5,#7c3aed);border-radius:10px;'
      + 'display:flex;align-items:center;justify-content:center">'
      + '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5">'
      + '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>'
      + '<span style="font-size:1rem;font-weight:700;color:var(--text-primary)">NextStep '
      + '<span style="color:#4f46e5">AI</span></span></div>'
      + '<h1 style="font-size:1.35rem;font-weight:800;color:var(--text-primary);margin:0 0 4px">Complete your profile</h1>'
      + '<p style="font-size:.875rem;color:var(--text-secondary);margin:0">Help us personalise your AI career recommendations.</p>'
      + '</div>'
      + '<div class="setup-progress-bar" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100">'
      + '<div class="setup-progress-fill" style="width:' + pct + '%"></div></div>'
      + '<div class="setup-step" id="setup-step-card">'
      + '<div class="setup-step-label">' + s.label + '</div>'
      + '<div class="setup-step-title">' + s.title + '</div>'
      + '<div class="setup-step-sub">' + s.sub + '</div>'
      + '<div id="setup-error" class="g-error-banner" style="display:none" role="alert"></div>'
      + '<form id="setup-form" onsubmit="return false" novalidate>' + fields + '</form>'
      + '<div class="setup-nav">' + backBtn
      + '<div style="display:flex;align-items:center;gap:12px">'
      + '<button class="setup-skip" id="setup-skip-btn" onclick="setupSkip()">Skip for now</button>'
      + '<button class="btn btn-primary" id="setup-next-btn" onclick="setupNext()">' + nextLabel + '</button>'
      + '</div></div>'
      + '</div>'
      + '<div style="display:flex;justify-content:center;gap:8px;margin-top:20px" aria-hidden="true">' + dots + '</div>'
      + '</div></div>';
  }

  function _collectStep(step) {
    STEPS[step - 1].fields.forEach(function(f) {
      var el = document.getElementById(f.id);
      if (el) data[f.id] = el.value.trim();
    });
  }

  function _validateStep(step) {
    _collectStep(step);
    var required = STEPS[step - 1].fields.filter(function(f) { return f.required; });
    for (var i = 0; i < required.length; i++) {
      var f = required[i];
      if (!data[f.id]) {
        var errEl = document.getElementById('setup-error');
        if (errEl) { errEl.textContent = '"' + f.label + '" is required.'; errEl.style.display = 'flex'; }
        var el = document.getElementById(f.id);
        if (el) el.focus();
        return false;
      }
    }
    var errEl2 = document.getElementById('setup-error');
    if (errEl2) errEl2.style.display = 'none';
    return true;
  }

  function _saveProfile() {
    try {
      var users   = Store.getUsers();
      var userObj = users.find(function(u) { return u.id === user.id; });
      if (!userObj) return;

      var skillNames = (data['cs-skills'] || '').split(',').map(function(s) { return s.trim(); }).filter(Boolean);

      Object.assign(userObj, {
        name:              data['cs-name']       || userObj.name,
        phone:             data['cs-phone']      || '',
        location:          data['cs-location']   || '',
        degree:            data['cs-degree']     || '',
        department:        data['cs-department'] || '',
        college:           data['cs-college']    || '',
        year:              parseInt(data['cs-year'])   || 1,
        cgpa:              parseFloat(data['cs-cgpa']) || 0,
        interests:         data['cs-interest']   || '',
        certifications:    data['cs-certs']      || '',
        targetRole:        data['cs-role']        || '',
        preferredIndustry: data['cs-industry']   || '',
        projects:          data['cs-projects']   || '',
        profile_completed: true,
        profileCompletion: 80,
        updated_at: new Date().toISOString(),
      });

      Store.updateUser(userObj.id, userObj);

      if (skillNames.length) {
        var skills = skillNames.map(function(name, i) {
          return { id: i + 1, name: name, category: 'General', level: 'Intermediate', verified: false };
        });
        Store.setUserSkills(userObj.id, skills);
      }

      var session = Object.assign({}, Auth.getCurrentUser(), {
        name: userObj.name, profile_completed: true,
      });
      Auth._saveSession(session, true);

    } catch(e) { console.error('[CareerSetup] Save error:', e); }
  }

  window.setupNext = function() {
    if (!_validateStep(currentStep)) return;
    var btn = document.getElementById('setup-next-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Saving...'; }
    if (currentStep < totalSteps) {
      currentStep++;
      container.innerHTML = _renderStep(currentStep);
      if (window.lucide) lucide.createIcons();
      window.scrollTo(0, 0);
    } else {
      _saveProfile();
      if (typeof UI     !== 'undefined') UI.toast('Profile complete! Welcome to NextStep AI!', 'success');
      if (typeof Router !== 'undefined') Router.navigate('dashboard');
    }
  };

  window.setupBack = function() {
    if (currentStep > 1) {
      _collectStep(currentStep);
      currentStep--;
      container.innerHTML = _renderStep(currentStep);
      if (window.lucide) lucide.createIcons();
      window.scrollTo(0, 0);
    }
  };

  window.setupSkip = function() {
    if (currentStep === totalSteps) { _collectStep(currentStep); _saveProfile(); }
    if (typeof UI     !== 'undefined') UI.toast('You can complete your profile anytime from Settings.', 'info');
    if (typeof Router !== 'undefined') Router.navigate('dashboard');
  };

  data['cs-name'] = user.name || '';
  container.innerHTML = _renderStep(currentStep);
  if (window.lucide) lucide.createIcons();
};
