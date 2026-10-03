/* ============================================
   pages/profile.js
   ============================================ */

Pages.profile = function(container) {
  if (!Auth.requireAuth()) return;
  const session = Auth.getCurrentUser();
  const user = Store.getUserById(session.id);
  const userSkills = Store.getUserSkills(session.id);
  const userProjects = Store.getUserProjects(session.id);
  const userCerts = Store.getUserCerts(session.id);

  let activeTab = 'personal';

  function render() {
    container.innerHTML = `
    <div class="page-content">
      <div class="dash-header">
        <div>
          <h1 style="font-size:1.5rem">My Profile</h1>
          <p>Manage your personal, academic and career information</p>
        </div>
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
          <button class="btn btn-outline btn-sm" onclick="Router.navigate('portfolio')" style="gap:6px">
            <i data-lucide="globe" style="width:14px;height:14px"></i>View Portfolio
          </button>
          <button class="btn btn-outline btn-sm" onclick="Router.navigate('resume')" style="gap:6px">
            <i data-lucide="file-text" style="width:14px;height:14px"></i>ATS Resume
          </button>
          <button class="btn btn-outline btn-sm" onclick="ExcelExport.exportProfile()" title="Export profile to Excel" style="gap:6px">
            <i data-lucide="download" style="width:15px;height:15px"></i>Export Excel
          </button>
          <button class="btn btn-primary" onclick="saveProfile()"><i data-lucide="save"></i>Save Profile</button>
        </div>
      </div>


      <!-- Completion Banner -->
      <div class="profile-completion">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
          <div>
            <h3>Profile Completion: ${user.profileCompletion}%</h3>
            <p>Complete all sections for better AI recommendations</p>
          </div>
          <div style="font-size:2rem;font-weight:900;color:#fff">${user.profileCompletion}%</div>
        </div>
        ${UI.progressBar(user.profileCompletion, 'indigo')}
      </div>

      <!-- Avatar Section -->
      <div class="card">
        <div class="profile-avatar-section">
          <div class="profile-avatar" style="overflow:hidden;display:flex;align-items:center;justify-content:center">${user.avatar && (user.avatar.startsWith('http') || user.avatar.startsWith('data:')) ? `<img src="${user.avatar}" alt="${user.name}" style="width:100%;height:100%;object-fit:cover;border-radius:50%" />` : (user.avatar || user.name[0])}</div>
          <div>
            <div style="font-size:1.2rem;font-weight:800">${user.name}</div>
            <div style="color:var(--text-muted);font-size:.875rem">${user.department} · Year ${user.year} · CGPA ${user.cgpa}</div>
            <div style="margin-top:6px">${UI.badge(user.role === 'admin' ? 'Administrator' : 'Student', 'primary')}</div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tabs">
          ${['personal','academic','skills','projects','certifications','preferences'].map(t =>
            `<button class="tab-btn ${activeTab===t?'active':''}" onclick="switchTab('${t}')">${t.charAt(0).toUpperCase()+t.slice(1)}</button>`
          ).join('')}
        </div>

        <!-- Tab Contents -->
        <div id="tab-personal" class="tab-content ${activeTab==='personal'?'active':''}">
          ${renderPersonalTab(user)}
        </div>
        <div id="tab-academic" class="tab-content ${activeTab==='academic'?'active':''}">
          ${renderAcademicTab(user)}
        </div>
        <div id="tab-skills" class="tab-content ${activeTab==='skills'?'active':''}">
          ${renderSkillsTab(userSkills)}
        </div>
        <div id="tab-projects" class="tab-content ${activeTab==='projects'?'active':''}">
          ${renderProjectsTab(userProjects)}
        </div>
        <div id="tab-certifications" class="tab-content ${activeTab==='certifications'?'active':''}">
          ${renderCertsTab(userCerts)}
        </div>
        <div id="tab-preferences" class="tab-content ${activeTab==='preferences'?'active':''}">
          ${renderPreferencesTab(user)}
        </div>
      </div>
    </div>`;
    if (window.lucide) lucide.createIcons();
  }

  window.switchTab = function(tab) {
    activeTab = tab;
    document.querySelectorAll('.tab-btn').forEach((b, i) => {
      const tabs = ['personal','academic','skills','projects','certifications','preferences'];
      b.classList.toggle('active', tabs[i] === tab);
    });
    document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
    const el = document.getElementById('tab-' + tab);
    if (el) el.classList.add('active');
  };

  render();
};

function renderPersonalTab(user) {
  return `
  <div class="section-header">
    <div class="section-title"><i data-lucide="user"></i>Personal Information</div>
  </div>
  <div class="form-row">
    <div class="form-group"><label class="form-label">Full Name</label><input class="form-input" id="p-name" value="${user.name}" /></div>
    <div class="form-group"><label class="form-label">Email</label><input class="form-input" id="p-email" type="email" value="${user.email}" /></div>
  </div>
  <div class="form-row">
    <div class="form-group"><label class="form-label">Phone Number</label><input class="form-input" id="p-phone" value="${user.phone || ''}" placeholder="+91 98765 43210" /></div>
    <div class="form-group"><label class="form-label">Location</label><input class="form-input" id="p-location" value="${user.location || ''}" placeholder="City, State" /></div>
  </div>
  <div class="form-group"><label class="form-label">About Me</label>
    <textarea class="form-textarea" id="p-about" placeholder="Write a short bio about yourself...">${user.about || ''}</textarea>
  </div>`;
}

function renderAcademicTab(user) {
  return `
  <div class="section-header">
    <div class="section-title"><i data-lucide="graduation-cap"></i>Academic Information</div>
  </div>
  <div class="form-row">
    <div class="form-group"><label class="form-label">Degree / Education</label><input class="form-input" id="p-degree" value="${user.degree || ''}" placeholder="B.E. Computer Science" /></div>
    <div class="form-group"><label class="form-label">Department</label><input class="form-input" id="p-dept" value="${user.department || ''}" placeholder="Computer Science Engineering" /></div>
  </div>
  <div class="form-row">
    <div class="form-group"><label class="form-label">College / University</label><input class="form-input" id="p-college" value="${user.college || ''}" placeholder="Anna University" /></div>
    <div class="form-group"><label class="form-label">Year of Study</label>
      <select class="form-select" id="p-year">
        ${[1,2,3,4,5].map(y => `<option value="${y}" ${user.year==y?'selected':''}>${y}${['st','nd','rd','th','th'][y-1]} Year</option>`).join('')}
      </select>
    </div>
  </div>
  <div class="form-row">
    <div class="form-group"><label class="form-label">CGPA (out of 10)</label><input class="form-input" id="p-cgpa" type="number" step="0.1" min="0" max="10" value="${user.cgpa || ''}" /></div>
    <div class="form-group"><label class="form-label">Expected Graduation</label><input class="form-input" id="p-grad" type="month" value="${user.graduation || ''}" /></div>
  </div>`;
}

function renderSkillsTab(userSkills) {
  const categories = ['Programming','Database','AI/ML','Cloud','Web Dev','DevOps','Tools','Analytics','Security','Design','Mobile'];
  return `
  <div class="section-header">
    <div class="section-title"><i data-lucide="code-2"></i>Technical Skills</div>
    <button class="btn btn-sm btn-outline" onclick="showAddSkillModal()"><i data-lucide="plus"></i>Add Skill</button>
  </div>
  ${userSkills.length === 0 ? `<div class="empty-state" style="padding:32px"><div class="empty-state-icon"><i data-lucide="code-2"></i></div><p>No skills added yet. Add your technical skills to get better recommendations.</p><button class="btn btn-primary btn-sm" onclick="showAddSkillModal()"><i data-lucide="plus"></i>Add Your First Skill</button></div>` : ''}
  <div style="display:flex;flex-direction:column;gap:12px" id="skills-list">
    ${userSkills.map((s, i) => `
    <div style="display:grid;grid-template-columns:180px 1fr 120px 80px;gap:12px;align-items:center;background:var(--bg);padding:12px 16px;border-radius:8px">
      <div style="font-weight:600;font-size:.875rem">${s.name}</div>
      <div>
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <span style="font-size:.75rem;color:var(--text-muted)">Proficiency</span>
          <span style="font-size:.75rem;font-weight:700;color:var(--primary)">${s.proficiency}%</span>
        </div>
        <input type="range" min="0" max="100" value="${s.proficiency}" style="width:100%;accent-color:var(--primary)" oninput="updateSkillProficiency(${i}, this.value)" />
      </div>
      <select class="form-select" style="padding:6px 10px;font-size:.78rem" onchange="updateSkillLevel(${i}, this.value)">
        ${['Beginner','Intermediate','Advanced','Expert'].map(l => `<option ${s.level===l?'selected':''}>${l}</option>`).join('')}
      </select>
      <button class="btn btn-ghost btn-sm" style="color:var(--danger)" onclick="removeSkill(${i})"><i data-lucide="trash-2" style="width:15px;height:15px"></i></button>
    </div>`).join('')}
  </div>

  <div class="divider" style="margin:20px 0"></div>
  <div class="section-title" style="margin-bottom:14px"><i data-lucide="heart"></i>Soft Skills</div>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px">
    ${DB.softSkills.map(s => `
    <div style="background:var(--bg);border-radius:8px;padding:14px">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px">
        <span style="font-size:.875rem;font-weight:600">${s.name}</span>
        <span style="font-size:.82rem;font-weight:700;color:var(--primary)">${s.score}%</span>
      </div>
      ${UI.progressBar(s.score, 'indigo')}
    </div>`).join('')}
  </div>`;
}

window.showAddSkillModal = function() {
  UI.modal('Add Technical Skill',
    `<div class="form-group"><label class="form-label">Skill Name</label>
      <select class="form-select" id="new-skill-name">
        <option value="">Select a skill</option>
        ${DB.skills.map(s => `<option value="${s.name}">${s.name} (${s.category})</option>`).join('')}
      </select>
    </div>
    <div class="form-group"><label class="form-label">Proficiency (%)</label>
      <input class="form-input" type="number" id="new-skill-pct" min="0" max="100" placeholder="e.g. 75" />
    </div>
    <div class="form-group"><label class="form-label">Experience Level</label>
      <select class="form-select" id="new-skill-level">
        <option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>Expert</option>
      </select>
    </div>`,
    `<button class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>
     <button class="btn btn-primary" onclick="addSkillFromModal()"><i data-lucide="plus"></i>Add Skill</button>`
  );
};

window.addSkillFromModal = function() {
  const name  = document.getElementById('new-skill-name').value;
  const pct   = parseInt(document.getElementById('new-skill-pct').value) || 50;
  const level = document.getElementById('new-skill-level').value;
  if (!name) { UI.toast('Please select a skill.', 'error'); return; }
  const session = Auth.getCurrentUser();
  const skills = Store.getUserSkills(session.id);
  if (skills.find(s => s.name === name)) { UI.toast('Skill already added.', 'warning'); return; }
  skills.push({ skillId: Date.now(), name, proficiency: pct, level });
  Store.setUserSkills(session.id, skills);
  UI.closeModal();
  UI.toast(`${name} added successfully!`, 'success');
  Pages.profile(document.getElementById('page-container'));
};

window.removeSkill = function(idx) {
  const session = Auth.getCurrentUser();
  const skills = Store.getUserSkills(session.id);
  skills.splice(idx, 1);
  Store.setUserSkills(session.id, skills);
  UI.toast('Skill removed.', 'info');
  Pages.profile(document.getElementById('page-container'));
};

window.updateSkillProficiency = function(idx, val) {
  const session = Auth.getCurrentUser();
  const skills = Store.getUserSkills(session.id);
  if (skills[idx]) { skills[idx].proficiency = parseInt(val); Store.setUserSkills(session.id, skills); }
};

window.updateSkillLevel = function(idx, val) {
  const session = Auth.getCurrentUser();
  const skills = Store.getUserSkills(session.id);
  if (skills[idx]) { skills[idx].level = val; Store.setUserSkills(session.id, skills); }
};

function renderProjectsTab(projects) {
  return `
  <div class="section-header">
    <div class="section-title"><i data-lucide="folder-open"></i>Projects</div>
    <button class="btn btn-sm btn-outline" onclick="showAddProjectModal()"><i data-lucide="plus"></i>Add Project</button>
  </div>
  ${projects.length === 0 ? `<div class="empty-state" style="padding:32px"><div class="empty-state-icon"><i data-lucide="folder"></i></div><p>No projects added yet.</p><button class="btn btn-primary btn-sm" onclick="showAddProjectModal()">Add Project</button></div>` : ''}
  <div style="display:flex;flex-direction:column;gap:14px">
    ${projects.map((p, i) => `
    <div style="background:var(--bg);border-radius:var(--radius-sm);padding:18px;position:relative">
      <button onclick="removeProject(${i})" style="position:absolute;top:12px;right:12px;background:none;border:none;cursor:pointer;color:var(--danger)"><i data-lucide="trash-2" style="width:15px;height:15px"></i></button>
      <div style="font-weight:700;margin-bottom:4px">${p.name}</div>
      <p style="font-size:.82rem;margin-bottom:10px">${p.description}</p>
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px">${p.technologies.map(t => `<span class="skill-tag" style="font-size:.72rem">${t}</span>`).join('')}</div>
      <div style="display:flex;gap:16px;font-size:.78rem;color:var(--text-muted)">
        <span><i data-lucide="user" style="width:12px;height:12px;vertical-align:middle"></i> ${p.role}</span>
        <span><i data-lucide="clock" style="width:12px;height:12px;vertical-align:middle"></i> ${p.duration}</span>
        ${p.link ? `<a href="${p.link}" target="_blank" style="color:var(--primary)"><i data-lucide="link" style="width:12px;height:12px;vertical-align:middle"></i> GitHub</a>` : ''}
      </div>
    </div>`).join('')}
  </div>`;
}

window.showAddProjectModal = function() {
  UI.modal('Add Project',
    `<div class="form-group"><label class="form-label">Project Name *</label><input class="form-input" id="proj-name" placeholder="e.g. Student Performance Predictor" /></div>
    <div class="form-group"><label class="form-label">Description</label><textarea class="form-textarea" id="proj-desc" placeholder="Briefly describe what the project does..."></textarea></div>
    <div class="form-group"><label class="form-label">Technologies (comma separated)</label><input class="form-input" id="proj-tech" placeholder="Python, Scikit-learn, Flask" /></div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Your Role</label><input class="form-input" id="proj-role" placeholder="e.g. Solo Developer" /></div>
      <div class="form-group"><label class="form-label">Duration</label><input class="form-input" id="proj-dur" placeholder="e.g. 2 months" /></div>
    </div>
    <div class="form-group"><label class="form-label">GitHub / Project Link</label><input class="form-input" id="proj-link" type="url" placeholder="https://github.com/..." /></div>`,
    `<button class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>
     <button class="btn btn-primary" onclick="addProjectFromModal()"><i data-lucide="plus"></i>Add Project</button>`
  );
};

window.addProjectFromModal = function() {
  const name = document.getElementById('proj-name').value.trim();
  if (!name) { UI.toast('Project name is required.', 'error'); return; }
  const session = Auth.getCurrentUser();
  const projects = Store.getUserProjects(session.id);
  projects.push({
    id: Date.now(), userId: session.id,
    name, description: document.getElementById('proj-desc').value.trim(),
    technologies: document.getElementById('proj-tech').value.split(',').map(t => t.trim()).filter(Boolean),
    role: document.getElementById('proj-role').value.trim() || 'Developer',
    duration: document.getElementById('proj-dur').value.trim() || 'N/A',
    link: document.getElementById('proj-link').value.trim()
  });
  Store.setUserProjects(session.id, projects);
  UI.closeModal();
  UI.toast('Project added successfully!', 'success');
  Pages.profile(document.getElementById('page-container'));
};

window.removeProject = function(idx) {
  const session = Auth.getCurrentUser();
  const projects = Store.getUserProjects(session.id);
  projects.splice(idx, 1);
  Store.setUserProjects(session.id, projects);
  UI.toast('Project removed.', 'info');
  Pages.profile(document.getElementById('page-container'));
};

function renderCertsTab(certs) {
  return `
  <div class="section-header">
    <div class="section-title"><i data-lucide="award"></i>Certifications</div>
    <button class="btn btn-sm btn-outline" onclick="showAddCertModal()"><i data-lucide="plus"></i>Add Certification</button>
  </div>
  ${certs.length === 0 ? `<div class="empty-state" style="padding:32px"><div class="empty-state-icon"><i data-lucide="award"></i></div><p>No certifications added yet.</p><button class="btn btn-primary btn-sm" onclick="showAddCertModal()">Add Certification</button></div>` : ''}
  <div class="grid-2" style="gap:14px">
    ${certs.map((c, i) => `
    <div style="background:var(--bg);border-radius:var(--radius-sm);padding:16px;display:flex;gap:12px;align-items:flex-start">
      <div class="stat-icon indigo" style="flex-shrink:0"><i data-lucide="award" style="width:18px;height:18px"></i></div>
      <div style="flex:1">
        <div style="font-weight:700;font-size:.875rem">${c.name}</div>
        <div style="font-size:.78rem;color:var(--text-muted)">${c.provider} · ${c.date || ''}</div>
        ${c.credentialId ? `<div style="font-size:.75rem;color:var(--text-muted)">ID: ${c.credentialId}</div>` : ''}
      </div>
      <button onclick="removeCert(${i})" style="background:none;border:none;cursor:pointer;color:var(--danger)"><i data-lucide="trash-2" style="width:14px;height:14px"></i></button>
    </div>`).join('')}
  </div>`;
}

window.showAddCertModal = function() {
  UI.modal('Add Certification',
    `<div class="form-group"><label class="form-label">Certification Name *</label><input class="form-input" id="cert-name" placeholder="e.g. AWS Cloud Practitioner" /></div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Provider *</label><input class="form-input" id="cert-provider" placeholder="e.g. Amazon AWS" /></div>
      <div class="form-group"><label class="form-label">Date Obtained</label><input class="form-input" id="cert-date" type="month" /></div>
    </div>
    <div class="form-group"><label class="form-label">Credential ID</label><input class="form-input" id="cert-id" placeholder="e.g. AWS-CP-2024" /></div>`,
    `<button class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>
     <button class="btn btn-primary" onclick="addCertFromModal()"><i data-lucide="plus"></i>Add</button>`
  );
};

window.addCertFromModal = function() {
  const name = document.getElementById('cert-name').value.trim();
  if (!name) { UI.toast('Name is required.', 'error'); return; }
  const session = Auth.getCurrentUser();
  const certs = Store.getUserCerts(session.id);
  certs.push({ id: Date.now(), userId: session.id, name, provider: document.getElementById('cert-provider').value.trim(), date: document.getElementById('cert-date').value, credentialId: document.getElementById('cert-id').value.trim() });
  Store.setUserCerts(session.id, certs);
  UI.closeModal();
  UI.toast('Certification added!', 'success');
  Pages.profile(document.getElementById('page-container'));
};

window.removeCert = function(idx) {
  const session = Auth.getCurrentUser();
  const certs = Store.getUserCerts(session.id);
  certs.splice(idx, 1);
  Store.setUserCerts(session.id, certs);
  UI.toast('Certification removed.', 'info');
  Pages.profile(document.getElementById('page-container'));
};

function renderPreferencesTab(user) {
  return `
  <div class="section-header"><div class="section-title"><i data-lucide="settings"></i>Career Preferences</div></div>
  <div class="form-row">
    <div class="form-group"><label class="form-label">Preferred Career Domain</label>
      <select class="form-select" id="pref-domain">
        <option value="">Select domain</option>
        ${['Artificial Intelligence','Data Science','Software Development','Cloud Computing','Cybersecurity','Web Development','Mobile Development','DevOps','UI/UX Design','Product Management'].map(d => `<option ${user.prefDomain===d?'selected':''}>${d}</option>`).join('')}
      </select>
    </div>
    <div class="form-group"><label class="form-label">Preferred Job Role</label><input class="form-input" id="pref-role" value="${user.prefRole||''}" placeholder="e.g. ML Engineer" /></div>
  </div>
  <div class="form-row">
    <div class="form-group"><label class="form-label">Preferred Location</label><input class="form-input" id="pref-loc" value="${user.prefLocation||''}" placeholder="e.g. Bangalore, Chennai" /></div>
    <div class="form-group"><label class="form-label">Work Preference</label>
      <select class="form-select" id="pref-work">
        ${['Remote','Hybrid','On-site','Flexible','Startup','MNC'].map(w => `<option ${user.prefWork===w?'selected':''}>${w}</option>`).join('')}
      </select>
    </div>
  </div>
  <div class="form-group"><label class="form-label">Industry Interest</label>
    <select class="form-select" id="pref-industry">
      ${['Technology','Finance & Fintech','Healthcare & Biotech','E-commerce','Gaming','Education','Automotive','Manufacturing','Media & Entertainment','Government'].map(ind => `<option ${user.prefIndustry===ind?'selected':''}>${ind}</option>`).join('')}
    </select>
  </div>
  <div class="form-group"><label class="form-label">Expected Salary (LPA)</label>
    <input class="form-input" id="pref-salary" type="number" value="${user.prefSalary||''}" placeholder="e.g. 10" min="3" max="100" />
  </div>`;
}

window.saveProfile = function() {
  const session = Auth.getCurrentUser();
  const updates = {};

  // Personal
  const pName = document.getElementById('p-name');
  if (pName) {
    updates.name = pName.value.trim() || session.name;
    updates.email = document.getElementById('p-email')?.value.trim();
    updates.phone = document.getElementById('p-phone')?.value.trim();
    updates.location = document.getElementById('p-location')?.value.trim();
    updates.about = document.getElementById('p-about')?.value.trim();
  }

  // Academic
  const pDegree = document.getElementById('p-degree');
  if (pDegree) {
    updates.degree = pDegree.value.trim();
    updates.department = document.getElementById('p-dept')?.value.trim();
    updates.college = document.getElementById('p-college')?.value.trim();
    updates.year = parseInt(document.getElementById('p-year')?.value) || 1;
    updates.cgpa = parseFloat(document.getElementById('p-cgpa')?.value) || 0;
    updates.graduation = document.getElementById('p-grad')?.value;
  }

  // Preferences
  const prefDomain = document.getElementById('pref-domain');
  if (prefDomain) {
    updates.prefDomain = prefDomain.value;
    updates.prefRole = document.getElementById('pref-role')?.value.trim();
    updates.prefLocation = document.getElementById('pref-loc')?.value.trim();
    updates.prefWork = document.getElementById('pref-work')?.value;
    updates.prefIndustry = document.getElementById('pref-industry')?.value;
    updates.prefSalary = document.getElementById('pref-salary')?.value;
  }

  // Recalculate profile completion
  const userSkills = Store.getUserSkills(session.id);
  const projects = Store.getUserProjects(session.id);
  const certs = Store.getUserCerts(session.id);
  const currentUser = Store.getUserById(session.id);
  const mergedUser = { ...currentUser, ...updates };
  let score = 20;
  if (mergedUser.name && mergedUser.email) score += 15;
  if (mergedUser.phone && mergedUser.location) score += 10;
  if (mergedUser.degree && mergedUser.department && mergedUser.cgpa) score += 20;
  if (userSkills.length >= 3) score += 15;
  if (projects.length >= 1) score += 10;
  if (certs.length >= 1) score += 10;
  updates.profileCompletion = Math.min(score, 100);

  Store.updateUser(session.id, updates);
  // Update session name
  const sData = Auth.getCurrentUser();
  if (updates.name) {
    sData.name = updates.name;
    sessionStorage.setItem(Auth.SESSION_KEY, JSON.stringify(sData));
  }

  UI.toast('Profile updated successfully! ✅', 'success');
  Pages.profile(document.getElementById('page-container'));
};
