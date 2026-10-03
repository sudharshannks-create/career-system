/* ============================================
   pages/resume.js – ATS-Friendly Resume Builder
   ============================================ */

Pages.resume = function(container) {
  if (!Auth.requireAuth()) return;
  const session = Auth.getCurrentUser();
  const user = Store.getUserById(session.id);

  let resume = Store.getResume(session.id);

  // Common target roles
  const targetRoles = [
    'Machine Learning Engineer',
    'Data Scientist',
    'AI Engineer',
    'Full Stack Developer',
    'Cloud Engineer',
    'Cybersecurity Engineer',
    'Frontend Developer',
    'Software Engineer'
  ];

  // Action verbs list for ATS analyzer
  const actionVerbs = [
    'engineered', 'developed', 'architected', 'spearheaded', 'implemented',
    'designed', 'built', 'automated', 'optimized', 'reduced', 'increased',
    'streamlined', 'deployed', 'orchestrated', 'collaborated', 'created',
    'trained', 'formulated', 'led', 'analyzed', 'integrated'
  ];

  function calculateATS(res) {
    let score = 0;
    const feedback = [];
    const resumeText = JSON.stringify(res).toLowerCase();

    // 1. Contact info (15 pts)
    let contactPts = 0;
    if (res.fullName && res.fullName.length > 2) contactPts += 3;
    if (res.email && res.email.includes('@')) contactPts += 4;
    if (res.phone && res.phone.length > 6) contactPts += 3;
    if (res.linkedin || res.github) contactPts += 5;
    score += contactPts;
    if (contactPts < 15) feedback.push('Add both LinkedIn and GitHub links for maximum recruiter credibility.');

    // 2. Summary Quality (15 pts)
    const summaryWords = (res.summary || '').trim().split(/\s+/).filter(Boolean).length;
    if (summaryWords >= 35) {
      score += 15;
    } else if (summaryWords >= 15) {
      score += 8;
      feedback.push('Expand your summary to 35-60 words highlighting core strengths and target role.');
    } else {
      feedback.push('Add a compelling professional summary (3-4 impactful sentences).');
    }

    // 3. Action Verbs Density (20 pts)
    const foundVerbs = actionVerbs.filter(v => resumeText.includes(v));
    const verbPts = Math.min(foundVerbs.length * 3, 20);
    score += verbPts;
    if (foundVerbs.length < 4) {
      feedback.push(`Start bullet points with strong action verbs (e.g. Engineered, Architected, Automated). Found ${foundVerbs.length}/4+ recommended.`);
    }

    // 4. Quantifiable Metrics & Numbers (15 pts)
    const metricsMatches = resumeText.match(/\d+[\%kmb]?|\b\d+\b/g) || [];
    if (metricsMatches.length >= 4) {
      score += 15;
    } else if (metricsMatches.length >= 2) {
      score += 9;
      feedback.push('Include more numbers and quantifiable metrics (e.g., "reduced latency by 28%", "accuracy of 88%").');
    } else {
      score += 4;
      feedback.push('Quantify project results with measurable percentages, scales, or performance metrics.');
    }

    // 5. Skills Section (15 pts)
    const skillsCount = (res.skills || []).length;
    if (skillsCount >= 8) {
      score += 15;
    } else if (skillsCount >= 4) {
      score += 10;
      feedback.push('Include 8-12 relevant technical skills and libraries.');
    } else {
      score += 5;
      feedback.push('Add core technical skills to pass ATS filters.');
    }

    // 6. Experience & Projects Completeness (20 pts)
    let compPts = 0;
    if (res.experience && res.experience.length > 0) compPts += 10;
    if (res.projects && res.projects.length >= 2) compPts += 10;
    else if (res.projects && res.projects.length === 1) compPts += 5;
    score += compPts;
    if (compPts < 20) feedback.push('Showcase at least 2 detailed technical projects or internships.');

    // Keyword match for target role
    const matchedCareer = DB.careers.find(c => c.name.toLowerCase() === (res.targetRole || '').toLowerCase()) || DB.careers[0];
    const roleKeywords = matchedCareer ? matchedCareer.requiredSkills : ['Python', 'SQL', 'Git'];
    const matchedKeywords = roleKeywords.filter(k => resumeText.includes(k.toLowerCase()));
    const missingKeywords = roleKeywords.filter(k => !resumeText.includes(k.toLowerCase()));

    return {
      score: Math.min(score, 100),
      feedback,
      roleKeywords,
      matchedKeywords,
      missingKeywords
    };
  }

  function render() {
    const ats = calculateATS(resume);

    container.innerHTML = `
    <div class="page-content">
      <!-- Header -->
      <div class="dash-header">
        <div>
          <h1 style="font-size:1.5rem">ATS Resume Builder & Optimizer</h1>
          <p>Create recruiters-approved, ATS-parseable resumes tailored for your target tech roles.</p>
        </div>
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
          <button class="btn btn-outline btn-sm" onclick="ExcelExport.exportResumeData()" title="Export resume data to Excel">
            <i data-lucide="download" style="width:14px;height:14px"></i>Export Excel
          </button>
          <button class="btn btn-secondary btn-sm" onclick="syncResumeFromProfile()" title="Auto-fill latest details from your Profile">
            <i data-lucide="refresh-cw" style="width:14px;height:14px"></i>Sync From Profile
          </button>
          <button class="btn btn-primary" onclick="printResume()">
            <i data-lucide="printer" style="width:16px;height:16px"></i>Print / Download PDF
          </button>
        </div>
      </div>

      <!-- ATS Score Banner -->
      <div class="ats-score-box">
        <div style="display:flex;align-items:center;gap:20px;flex:1;flex-wrap:wrap">
          <div class="ats-score-circle" style="border-color:${ats.score >= 80 ? '#10b981' : (ats.score >= 60 ? '#f59e0b' : '#ef4444')}">
            ${ats.score}
            <span>ATS Score</span>
          </div>
          <div style="flex:1;min-width:240px">
            <div style="font-size:1.1rem;font-weight:700">
              ${ats.score >= 85 ? '🌟 Excellent ATS Compatibility!' : (ats.score >= 70 ? '👍 Strong Resume – A few optimizations remaining' : '⚠️ ATS Optimization Recommended')}
            </div>
            <div style="font-size:0.82rem;color:#cbd5e1;margin-top:4px">
              Target Role: <strong>${resume.targetRole || 'Machine Learning Engineer'}</strong> ·
              Matched <strong>${ats.matchedKeywords.length} of ${ats.roleKeywords.length}</strong> core industry keywords.
            </div>
            <div class="ats-chips-wrap">
              ${ats.matchedKeywords.map(k => `<span class="ats-chip found"><i data-lucide="check" style="width:12px;height:12px"></i>${k}</span>`).join('')}
              ${ats.missingKeywords.map(k => `<span class="ats-chip missing" title="Keyword missing in resume text"><i data-lucide="plus" style="width:12px;height:12px"></i>${k}</span>`).join('')}
            </div>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">
          <div style="font-size:0.75rem;color:#94a3b8">Template Style</div>
          <div style="display:flex;gap:6px">
            ${[
              { id:'modern', label:'Modern Tech' },
              { id:'classic', label:'Classic ATS' },
              { id:'minimal', label:'Minimalist' }
            ].map(t => `
              <button class="btn btn-sm ${resume.template === t.id ? 'btn-primary' : 'btn-outline'}"
                style="${resume.template !== t.id ? 'background:rgba(255,255,255,0.1);color:#fff;border-color:rgba(255,255,255,0.2)' : ''}"
                onclick="setResumeTemplate('${t.id}')">${t.label}</button>
            `).join('')}
          </div>
        </div>
      </div>

      ${ats.feedback.length > 0 ? `
      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:var(--radius);padding:14px 18px;margin-bottom:24px;font-size:0.83rem;color:#92400e">
        <strong style="display:flex;align-items:center;gap:6px;margin-bottom:6px"><i data-lucide="lightbulb" style="width:16px;height:16px"></i>AI ATS Recommendations to reach 95%+:</strong>
        <ul style="margin-left:22px;display:flex;flex-direction:column;gap:3px">
          ${ats.feedback.map(f => `<li>${f}</li>`).join('')}
        </ul>
      </div>` : ''}

      <!-- Layout: Editor vs Preview -->
      <div class="resume-builder-layout">
        <!-- Editor Pane -->
        <div class="resume-editor-pane">

          <!-- Section: Target Role & Personal Info -->
          <div class="resume-section-card">
            <div class="resume-section-header">
              <span class="resume-section-title"><i data-lucide="user" style="color:var(--primary);width:18px;height:18px"></i>Contact & Target Role</span>
              <span class="badge badge-primary">Essential</span>
            </div>
            <div class="grid-2" style="gap:12px">
              <div class="form-group">
                <label>Target Role / Career Focus</label>
                <select class="form-control" onchange="updateResumeField('targetRole', this.value)">
                  ${targetRoles.map(r => `<option value="${r}" ${resume.targetRole === r ? 'selected' : ''}>${r}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label>Professional Title</label>
                <input class="form-control" value="${escapeHtml(resume.title || '')}" oninput="updateResumeField('title', this.value)" placeholder="e.g. AI Engineer & Full Stack Developer" />
              </div>
            </div>
            <div class="grid-2" style="gap:12px;margin-top:10px">
              <div class="form-group">
                <label>Full Name</label>
                <input class="form-control" value="${escapeHtml(resume.fullName || '')}" oninput="updateResumeField('fullName', this.value)" />
              </div>
              <div class="form-group">
                <label>Email Address</label>
                <input class="form-control" value="${escapeHtml(resume.email || '')}" oninput="updateResumeField('email', this.value)" />
              </div>
            </div>
            <div class="grid-2" style="gap:12px;margin-top:10px">
              <div class="form-group">
                <label>Phone Number</label>
                <input class="form-control" value="${escapeHtml(resume.phone || '')}" oninput="updateResumeField('phone', this.value)" />
              </div>
              <div class="form-group">
                <label>Location (City, State, Country)</label>
                <input class="form-control" value="${escapeHtml(resume.location || '')}" oninput="updateResumeField('location', this.value)" />
              </div>
            </div>
            <div class="grid-3" style="gap:10px;margin-top:10px">
              <div class="form-group">
                <label>LinkedIn URL</label>
                <input class="form-control" value="${escapeHtml(resume.linkedin || '')}" oninput="updateResumeField('linkedin', this.value)" placeholder="linkedin.com/in/username" />
              </div>
              <div class="form-group">
                <label>GitHub URL</label>
                <input class="form-control" value="${escapeHtml(resume.github || '')}" oninput="updateResumeField('github', this.value)" placeholder="github.com/username" />
              </div>
              <div class="form-group">
                <label>Portfolio / Website</label>
                <input class="form-control" value="${escapeHtml(resume.portfolioUrl || '')}" oninput="updateResumeField('portfolioUrl', this.value)" placeholder="yourname.dev" />
              </div>
            </div>
          </div>

          <!-- Section: Professional Summary -->
          <div class="resume-section-card">
            <div class="resume-section-header">
              <span class="resume-section-title"><i data-lucide="file-text" style="color:var(--primary);width:18px;height:18px"></i>Professional Summary</span>
              <button class="btn btn-outline btn-sm" onclick="generateAISummary()" style="gap:4px">
                <i data-lucide="sparkles" style="width:14px;height:14px;color:#7c3aed"></i>AI Summary Generator
              </button>
            </div>
            <div class="form-group">
              <textarea class="form-control" rows="4" oninput="updateResumeField('summary', this.value)" placeholder="Write a concise 3-4 sentence summary of your background, technical skills, and achievements...">${escapeHtml(resume.summary || '')}</textarea>
            </div>
            <div style="font-size:0.75rem;color:var(--text-muted);display:flex;justify-content:space-between">
              <span>Tip: Mention target role, years of experience/education, key languages, and 1 tangible accomplishment.</span>
              <span>${(resume.summary || '').trim().split(/\s+/).filter(Boolean).length} words</span>
            </div>
          </div>

          <!-- Section: Work & Internships Experience -->
          <div class="resume-section-card">
            <div class="resume-section-header">
              <span class="resume-section-title"><i data-lucide="briefcase" style="color:var(--primary);width:18px;height:18px"></i>Experience & Internships</span>
              <button class="btn btn-outline btn-sm" onclick="addExperience()"><i data-lucide="plus"></i>Add Position</button>
            </div>
            <div id="experience-list" style="display:flex;flex-direction:column;gap:16px">
              ${(resume.experience || []).map((exp, idx) => `
                <div style="background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-sm);padding:14px">
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
                    <span style="font-weight:700;font-size:0.88rem">Experience #${idx + 1}</span>
                    <button class="btn btn-sm" style="color:var(--danger);padding:4px 8px" onclick="removeExperience(${idx})"><i data-lucide="trash-2" style="width:14px;height:14px"></i></button>
                  </div>
                  <div class="grid-2" style="gap:10px">
                    <input class="form-control" placeholder="Company Name" value="${escapeHtml(exp.company || '')}" oninput="updateExp(${idx}, 'company', this.value)" />
                    <input class="form-control" placeholder="Job Title / Role" value="${escapeHtml(exp.role || '')}" oninput="updateExp(${idx}, 'role', this.value)" />
                  </div>
                  <div class="grid-3" style="gap:10px;margin-top:8px">
                    <input class="form-control" placeholder="Location (e.g. Bangalore / Remote)" value="${escapeHtml(exp.location || '')}" oninput="updateExp(${idx}, 'location', this.value)" />
                    <input class="form-control" placeholder="Start Date" value="${escapeHtml(exp.startDate || '')}" oninput="updateExp(${idx}, 'startDate', this.value)" />
                    <input class="form-control" placeholder="End Date (or Present)" value="${escapeHtml(exp.endDate || '')}" oninput="updateExp(${idx}, 'endDate', this.value)" />
                  </div>
                  <div class="form-group" style="margin-top:10px">
                    <label style="font-size:0.78rem">Bullet Points (One accomplishment per line, use quantifiable metrics)</label>
                    <textarea class="form-control" rows="3" oninput="updateExpBullets(${idx}, this.value)">${escapeHtml((exp.bullets || []).join('\n'))}</textarea>
                  </div>
                </div>
              `).join('')}
              ${(!resume.experience || resume.experience.length === 0) ? `<p style="font-size:0.82rem;color:var(--text-muted);text-align:center">No work experience added yet. Click "Add Position" or rely on technical projects.</p>` : ''}
            </div>
          </div>

          <!-- Section: Projects -->
          <div class="resume-section-card">
            <div class="resume-section-header">
              <span class="resume-section-title"><i data-lucide="code" style="color:var(--primary);width:18px;height:18px"></i>Technical Projects</span>
              <button class="btn btn-outline btn-sm" onclick="addResumeProject()"><i data-lucide="plus"></i>Add Project</button>
            </div>
            <div id="projects-list" style="display:flex;flex-direction:column;gap:16px">
              ${(resume.projects || []).map((proj, idx) => `
                <div style="background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-sm);padding:14px">
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
                    <span style="font-weight:700;font-size:0.88rem">Project #${idx + 1}</span>
                    <button class="btn btn-sm" style="color:var(--danger);padding:4px 8px" onclick="removeResumeProject(${idx})"><i data-lucide="trash-2" style="width:14px;height:14px"></i></button>
                  </div>
                  <div class="grid-2" style="gap:10px">
                    <input class="form-control" placeholder="Project Name" value="${escapeHtml(proj.name || '')}" oninput="updateProj(${idx}, 'name', this.value)" />
                    <input class="form-control" placeholder="Role (e.g. Solo Developer)" value="${escapeHtml(proj.role || '')}" oninput="updateProj(${idx}, 'role', this.value)" />
                  </div>
                  <div class="grid-2" style="gap:10px;margin-top:8px">
                    <input class="form-control" placeholder="Technologies (e.g. Python, Flask, React)" value="${escapeHtml(proj.technologies || '')}" oninput="updateProj(${idx}, 'technologies', this.value)" />
                    <input class="form-control" placeholder="GitHub / Live Demo Link" value="${escapeHtml(proj.link || '')}" oninput="updateProj(${idx}, 'link', this.value)" />
                  </div>
                  <div class="form-group" style="margin-top:10px">
                    <label style="font-size:0.78rem">Bullet Points (One accomplishment per line)</label>
                    <textarea class="form-control" rows="3" oninput="updateProjBullets(${idx}, this.value)">${escapeHtml((proj.bullets || []).join('\n'))}</textarea>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Section: Education & Skills -->
          <div class="resume-section-card">
            <div class="resume-section-header">
              <span class="resume-section-title"><i data-lucide="graduation-cap" style="color:var(--primary);width:18px;height:18px"></i>Education & Skills</span>
            </div>
            <div class="grid-2" style="gap:12px">
              <div class="form-group">
                <label>Degree & Major</label>
                <input class="form-control" value="${escapeHtml(resume.education && resume.education[0] ? resume.education[0].degree : '')}" oninput="updateEdu('degree', this.value)" />
              </div>
              <div class="form-group">
                <label>College / University</label>
                <input class="form-control" value="${escapeHtml(resume.education && resume.education[0] ? resume.education[0].college : '')}" oninput="updateEdu('college', this.value)" />
              </div>
            </div>
            <div class="grid-2" style="gap:12px;margin-top:8px">
              <div class="form-group">
                <label>Graduation Year / Timeline</label>
                <input class="form-control" value="${escapeHtml(resume.education && resume.education[0] ? resume.education[0].year : '')}" oninput="updateEdu('year', this.value)" />
              </div>
              <div class="form-group">
                <label>CGPA / Score</label>
                <input class="form-control" value="${escapeHtml(resume.education && resume.education[0] ? resume.education[0].cgpa : '')}" oninput="updateEdu('cgpa', this.value)" />
              </div>
            </div>
            <div class="form-group" style="margin-top:16px">
              <label>Technical Skills (Comma separated)</label>
              <textarea class="form-control" rows="2" oninput="updateResumeSkills(this.value)">${escapeHtml((resume.skills || []).join(', '))}</textarea>
            </div>
          </div>

        </div>

        <!-- Live Preview Pane -->
        <div class="resume-preview-container">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px" class="preview-toolbar">
            <div style="font-weight:700;font-size:0.9rem;display:flex;align-items:center;gap:6px">
              <i data-lucide="eye" style="width:16px;height:16px;color:var(--primary)"></i>Live ATS Preview
            </div>
            <div style="display:flex;gap:8px">
              <button class="btn btn-sm btn-outline" onclick="saveResumeNow()"><i data-lucide="save"></i>Save Changes</button>
              <button class="btn btn-sm btn-primary" onclick="printResume()"><i data-lucide="printer"></i>Print</button>
            </div>
          </div>

          <!-- The Sheet -->
          <div id="resume-sheet-preview" class="resume-sheet ${resume.template || 'modern'}">
            ${renderResumePreviewHTML(resume)}
          </div>
        </div>
      </div>
    </div>`;

    if (window.lucide) lucide.createIcons();
  }

  // ─── Resume Sheet HTML Generator ──────────────
  function renderResumePreviewHTML(res) {
    const isClassic = res.template === 'classic';
    const isMinimal = res.template === 'minimal';

    return `
      <!-- Header -->
      <div style="text-align:${isClassic ? 'center' : 'left'}">
        <h1 class="resume-name">${escapeHtml(res.fullName || 'YOUR NAME')}</h1>
        <div class="resume-title">${escapeHtml(res.title || 'Professional Title')}</div>
        <div class="resume-contact-bar">
          ${res.phone ? `<span>📞 ${escapeHtml(res.phone)}</span>` : ''}
          ${res.email ? `<span>✉️ ${escapeHtml(res.email)}</span>` : ''}
          ${res.location ? `<span>📍 ${escapeHtml(res.location)}</span>` : ''}
          ${res.linkedin ? `<span>🔗 ${escapeHtml(res.linkedin)}</span>` : ''}
          ${res.github ? `<span>🐙 ${escapeHtml(res.github)}</span>` : ''}
          ${res.portfolioUrl ? `<span>🌐 ${escapeHtml(res.portfolioUrl)}</span>` : ''}
        </div>
      </div>

      <!-- Professional Summary -->
      ${res.summary ? `
        <div class="resume-sec-h">Professional Summary</div>
        <p style="font-size:0.82rem;line-height:1.55;color:#334155;margin-bottom:12px">${escapeHtml(res.summary)}</p>
      ` : ''}

      <!-- Education -->
      ${res.education && res.education.length > 0 ? `
        <div class="resume-sec-h">Education</div>
        ${res.education.map(e => `
          <div class="resume-item">
            <div class="resume-item-top">
              <span>${escapeHtml(e.college || '')}</span>
              <span style="font-size:0.8rem;color:#64748b">${escapeHtml(e.year || '')}</span>
            </div>
            <div class="resume-item-sub">
              <span>${escapeHtml(e.degree || '')}</span>
              <span><strong>${escapeHtml(e.cgpa || '')}</strong></span>
            </div>
          </div>
        `).join('')}
      ` : ''}

      <!-- Technical Skills -->
      ${res.skills && res.skills.length > 0 ? `
        <div class="resume-sec-h">Technical Skills</div>
        <div class="resume-skills-grid" style="margin-bottom:12px">
          ${res.skills.map(s => `<span class="resume-skill-pill">${escapeHtml(s)}</span>`).join('')}
        </div>
      ` : ''}

      <!-- Experience -->
      ${res.experience && res.experience.length > 0 ? `
        <div class="resume-sec-h">Experience</div>
        ${res.experience.map(e => `
          <div class="resume-item">
            <div class="resume-item-top">
              <span>${escapeHtml(e.role || '')} · <strong>${escapeHtml(e.company || '')}</strong></span>
              <span style="font-size:0.8rem;color:#64748b">${escapeHtml(e.startDate || '')} – ${escapeHtml(e.endDate || 'Present')}</span>
            </div>
            ${e.location ? `<div style="font-size:0.75rem;color:#64748b;margin-bottom:3px">${escapeHtml(e.location)}</div>` : ''}
            ${e.bullets && e.bullets.length ? `
              <ul class="resume-bullets">
                ${e.bullets.map(b => `<li>${escapeHtml(b)}</li>`).join('')}
              </ul>
            ` : ''}
          </div>
        `).join('')}
      ` : ''}

      <!-- Projects -->
      ${res.projects && res.projects.length > 0 ? `
        <div class="resume-sec-h">Projects</div>
        ${res.projects.map(p => `
          <div class="resume-item">
            <div class="resume-item-top">
              <span><strong>${escapeHtml(p.name || '')}</strong> ${p.role ? `(${escapeHtml(p.role)})` : ''}</span>
              ${p.link ? `<span style="font-size:0.78rem;color:#4f46e5">${escapeHtml(p.link)}</span>` : ''}
            </div>
            ${p.technologies ? `<div style="font-size:0.75rem;color:#64748b;margin-bottom:3px">Tech Stack: <em>${escapeHtml(p.technologies)}</em></div>` : ''}
            ${p.bullets && p.bullets.length ? `
              <ul class="resume-bullets">
                ${p.bullets.map(b => `<li>${escapeHtml(b)}</li>`).join('')}
              </ul>
            ` : ''}
          </div>
        `).join('')}
      ` : ''}

      <!-- Certifications -->
      ${res.certifications && res.certifications.length > 0 ? `
        <div class="resume-sec-h">Certifications</div>
        ${res.certifications.map(c => `
          <div class="resume-item" style="margin-bottom:4px">
            <div class="resume-item-top" style="font-size:0.82rem">
              <span>${escapeHtml(c.name || '')} – <em>${escapeHtml(c.provider || '')}</em></span>
              <span style="font-size:0.78rem;color:#64748b">${escapeHtml(c.date || '')}</span>
            </div>
          </div>
        `).join('')}
      ` : ''}
    `;
  }

  // ─── Global Handlers for Resume Page ──────────
  window.updateResumeField = function(field, val) {
    resume[field] = val;
    Store.saveResume(session.id, resume);
    refreshPreviewOnly();
  };

  window.setResumeTemplate = function(tpl) {
    resume.template = tpl;
    Store.saveResume(session.id, resume);
    render();
  };

  window.updateResumeSkills = function(val) {
    resume.skills = val.split(',').map(s => s.trim()).filter(Boolean);
    Store.saveResume(session.id, resume);
    refreshPreviewOnly();
  };

  window.updateEdu = function(field, val) {
    if (!resume.education || !resume.education[0]) {
      resume.education = [{}];
    }
    resume.education[0][field] = val;
    Store.saveResume(session.id, resume);
    refreshPreviewOnly();
  };

  window.addExperience = function() {
    if (!resume.experience) resume.experience = [];
    resume.experience.push({
      id: Date.now(),
      company: 'Tech Company',
      role: 'Software Engineer',
      location: 'Bangalore, India',
      startDate: 'Jan 2024',
      endDate: 'Present',
      bullets: ['Spearheaded engineering initiatives improving system performance by 25%.']
    });
    Store.saveResume(session.id, resume);
    render();
  };

  window.removeExperience = function(idx) {
    resume.experience.splice(idx, 1);
    Store.saveResume(session.id, resume);
    render();
  };

  window.updateExp = function(idx, field, val) {
    resume.experience[idx][field] = val;
    Store.saveResume(session.id, resume);
    refreshPreviewOnly();
  };

  window.updateExpBullets = function(idx, val) {
    resume.experience[idx].bullets = val.split('\n').filter(b => b.trim().length > 0);
    Store.saveResume(session.id, resume);
    refreshPreviewOnly();
  };

  window.addResumeProject = function() {
    if (!resume.projects) resume.projects = [];
    resume.projects.push({
      id: Date.now(),
      name: 'New Technical Project',
      role: 'Lead Developer',
      technologies: 'Python, React, PostgreSQL',
      link: 'https://github.com/developer/project',
      bullets: ['Engineered scalable application architecture resulting in 99% uptime and streamlined user workflow.']
    });
    Store.saveResume(session.id, resume);
    render();
  };

  window.removeResumeProject = function(idx) {
    resume.projects.splice(idx, 1);
    Store.saveResume(session.id, resume);
    render();
  };

  window.updateProj = function(idx, field, val) {
    resume.projects[idx][field] = val;
    Store.saveResume(session.id, resume);
    refreshPreviewOnly();
  };

  window.updateProjBullets = function(idx, val) {
    resume.projects[idx].bullets = val.split('\n').filter(b => b.trim().length > 0);
    Store.saveResume(session.id, resume);
    refreshPreviewOnly();
  };

  window.refreshPreviewOnly = function() {
    const previewEl = document.getElementById('resume-sheet-preview');
    if (previewEl) {
      previewEl.className = `resume-sheet ${resume.template || 'modern'}`;
      previewEl.innerHTML = renderResumePreviewHTML(resume);
    }
  };

  window.saveResumeNow = function() {
    Store.saveResume(session.id, resume);
    UI.toast('Resume saved successfully! 💾', 'success');
  };

  window.printResume = function() {
    window.print();
  };

  window.syncResumeFromProfile = function() {
    const u = Store.getUserById(session.id);
    const s = Store.getUserSkills(session.id);
    const p = Store.getUserProjects(session.id);
    const c = Store.getUserCerts(session.id);

    resume.fullName = u.name || resume.fullName;
    resume.email = u.email || resume.email;
    resume.phone = u.phone || resume.phone;
    resume.location = u.location || resume.location;
    resume.education = [{
      degree: u.degree || 'Bachelor of Engineering',
      college: u.college || 'Engineering College',
      year: `Year ${u.year || 3}`,
      cgpa: `CGPA: ${u.cgpa || 8.0}`
    }];
    resume.skills = s.map(sk => sk.name);
    if (p.length) {
      resume.projects = p.map(pr => ({
        id: pr.id,
        name: pr.name,
        role: pr.role || 'Solo Developer',
        technologies: Array.isArray(pr.technologies) ? pr.technologies.join(', ') : (pr.technologies || ''),
        link: pr.link || '',
        bullets: [pr.description || '', 'Developed modular microservices with end-to-end integration testing.']
      }));
    }
    if (c.length) {
      resume.certifications = c.map(cr => ({
        id: cr.id,
        name: cr.name,
        provider: cr.provider,
        date: cr.date
      }));
    }

    Store.saveResume(session.id, resume);
    UI.toast('Resume synced with your latest profile data! 🔄', 'success');
    render();
  };

  window.generateAISummary = function() {
    const summaries = [
      `Results-oriented ${resume.targetRole || 'Software Engineer'} with hands-on proficiency in ${resume.skills ? resume.skills.slice(0, 4).join(', ') : 'Python and Machine Learning'}. Proven track record of developing end-to-end production software and machine learning models with 88%+ accuracy. Adept at translating complex analytical problems into scalable, high-performance systems.`,
      `Analytical and forward-thinking ${user.degree || 'Engineering'} student passionate about ${resume.targetRole || 'AI/ML Systems'}. Strong technical foundation in ${resume.skills ? resume.skills.slice(0, 3).join(', ') : 'Python, SQL'} with demonstrated experience delivering scalable full-stack applications and automated pipelines.`,
      `Dedicated ${resume.targetRole || 'Developer'} specializing in building efficient algorithms, predictive intelligence, and responsive web solutions. Experienced in collaborating across agile sprints and leveraging modern developer tooling (Git, Docker, Cloud) to achieve measurable business impact.`
    ];

    UI.modal('AI Resume Summary Generator',
      `<div style="display:flex;flex-direction:column;gap:14px">
        <p style="font-size:0.85rem;color:var(--text-secondary)">Select an AI-crafted summary tailored to your target role (${resume.targetRole}):</p>
        ${summaries.map((s, idx) => `
          <div style="background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-sm);padding:14px;cursor:pointer;transition:all 0.2s"
               onclick="applyAISummary(${idx})"
               onmouseover="this.style.borderColor='var(--primary)';this.style.background='#f5f3ff'"
               onmouseout="this.style.borderColor='var(--border)';this.style.background='var(--bg)'">
            <div style="font-weight:700;font-size:0.82rem;color:var(--primary);margin-bottom:4px">Option ${idx + 1}</div>
            <p style="font-size:0.82rem;line-height:1.5;margin:0;color:#334155">${s}</p>
          </div>
        `).join('')}
      </div>`,
      `<button class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>`
    );

    window.applyAISummary = function(idx) {
      resume.summary = summaries[idx];
      Store.saveResume(session.id, resume);
      UI.closeModal();
      UI.toast('AI Summary applied to resume! ✨', 'success');
      render();
    };
  };

  render();
};

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
