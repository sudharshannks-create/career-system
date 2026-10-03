/* ============================================
   pages/jobs.js – Job Seeking & Application Guidance Hub
   ============================================ */

Pages.jobs = function(container) {
  if (!Auth.requireAuth()) return;
  const session = Auth.getCurrentUser();
  const user = Store.getUserById(session.id);
  const userSkills = Store.getUserSkills(session.id);
  const userProjects = Store.getUserProjects(session.id);

  let activeTab = 'opportunities'; // 'opportunities' | 'pipeline' | 'guidance'
  let filterCategory = '';
  let filterWorkMode = '';
  let searchTerm = '';

  function calculateJobMatch(job) {
    const userSkillNames = userSkills.map(s => s.name.toLowerCase());
    const matched = job.requiredSkills.filter(s => userSkillNames.includes(s.toLowerCase()));
    const missing = job.requiredSkills.filter(s => !userSkillNames.includes(s.toLowerCase()));
    const score = Math.round((matched.length / job.requiredSkills.length) * 100);
    return { score, matched, missing };
  }

  function getFilteredJobs() {
    return (DB.jobs || []).filter(job => {
      const matchSearch = !searchTerm ||
        job.title.toLowerCase().includes(searchTerm) ||
        job.company.toLowerCase().includes(searchTerm) ||
        job.requiredSkills.some(s => s.toLowerCase().includes(searchTerm));
      const matchCat = !filterCategory || job.category === filterCategory;
      const matchMode = !filterWorkMode || job.workMode.toLowerCase().includes(filterWorkMode.toLowerCase());
      return matchSearch && matchCat && matchMode;
    });
  }

  function render() {
    const jobs = getFilteredJobs();
    const applications = Store.getJobApplications(session.id);
    const categories = [...new Set((DB.jobs || []).map(j => j.category))];

    // Pipeline summary metrics
    const totalApps = applications.length;
    const interviewingApps = applications.filter(a => a.status === 'interview').length;
    const offersApps = applications.filter(a => a.status === 'offer').length;
    const activeApplied = applications.filter(a => a.status === 'applied').length;
    const responseRate = totalApps > 0 ? Math.round(((interviewingApps + offersApps) / totalApps) * 100) : 0;

    container.innerHTML = `
    <div class="page-content">
      <!-- Header -->
      <div class="dash-header">
        <div>
          <h1 style="font-size:1.5rem">Job Seeking & Application Guidance Hub</h1>
          <p>Discover tailored tech openings, track your application pipeline, and leverage AI job-hunting kits.</p>
        </div>
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
          <button class="btn btn-outline btn-sm" onclick="ExcelExport.exportJobApplications()">
            <i data-lucide="download" style="width:14px;height:14px"></i>Export Applications Excel
          </button>
          <button class="btn btn-primary btn-sm" onclick="addNewApplicationModal()">
            <i data-lucide="plus" style="width:14px;height:14px"></i>Add Application
          </button>
        </div>
      </div>

      <!-- Main Navigation Tabs -->
      <div class="tabs" style="margin-bottom:24px">
        <button class="tab-btn ${activeTab==='opportunities'?'active':''}" onclick="switchJobHubTab('opportunities')">
          <i data-lucide="compass" style="width:15px;height:15px;vertical-align:middle;margin-right:6px"></i>Curated Job Matches
        </button>
        <button class="tab-btn ${activeTab==='pipeline'?'active':''}" onclick="switchJobHubTab('pipeline')">
          <i data-lucide="kanban" style="width:15px;height:15px;vertical-align:middle;margin-right:6px"></i>Application Pipeline (${applications.length})
        </button>
        <button class="tab-btn ${activeTab==='guidance'?'active':''}" onclick="switchJobHubTab('guidance')">
          <i data-lucide="book-open" style="width:15px;height:15px;vertical-align:middle;margin-right:6px"></i>Job Seeking Playbook & Toolkit
        </button>
      </div>

      <!-- TAB 1: CURATED JOB MATCHES -->
      <div id="tab-opportunities" style="${activeTab==='opportunities'?'':'display:none'}">
        <!-- Search and Filters -->
        <div class="search-filter-bar" style="margin-bottom:24px">
          <div class="search-input-wrapper">
            <i data-lucide="search" class="search-icon"></i>
            <input type="text" class="search-input" placeholder="Search by role, company, or skill (e.g. Python, Razorpay)..."
              value="${escapeHtml(searchTerm)}" oninput="handleJobSearch(this.value)" />
          </div>
          <select class="filter-select" onchange="handleCatFilter(this.value)">
            <option value="">All Career Categories</option>
            ${categories.map(c => `<option value="${c}" ${filterCategory===c?'selected':''}>${c}</option>`).join('')}
          </select>
          <select class="filter-select" onchange="handleModeFilter(this.value)">
            <option value="">All Work Modes</option>
            <option value="Hybrid" ${filterWorkMode==='Hybrid'?'selected':''}>Hybrid</option>
            <option value="On-site" ${filterWorkMode==='On-site'?'selected':''}>On-site</option>
            <option value="Remote" ${filterWorkMode==='Remote'?'selected':''}>Remote</option>
          </select>
        </div>

        <!-- Job Cards Grid -->
        <div class="job-cards-grid">
          ${jobs.map(job => {
            const match = calculateJobMatch(job);
            const isApplied = applications.some(a => (a.company || '').toLowerCase() === job.company.toLowerCase() && (a.role || '').toLowerCase() === job.title.toLowerCase());

            return `
            <div class="job-card">
              <div>
                <!-- Top company header -->
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
                  <div style="display:flex;align-items:center;gap:12px">
                    <div class="job-company-logo" style="background:${job.logoBg || 'var(--primary)'}">
                      ${job.logo || job.company.charAt(0)}
                    </div>
                    <div>
                      <div style="font-weight:700;font-size:1.05rem;line-height:1.3">${job.title}</div>
                      <div style="font-size:0.82rem;color:var(--text-muted)">${job.company} · ${job.location}</div>
                    </div>
                  </div>
                  <div style="text-align:right">
                    <span class="match-badge" style="background:${match.score >= 70 ? 'rgba(16,185,129,0.15)' : 'rgba(99,102,241,0.15)'};color:${match.score >= 70 ? '#059669' : '#4f46e5'}">
                      ${match.score}% Match
                    </span>
                  </div>
                </div>

                <!-- Salary & Meta Info -->
                <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">
                  <span class="badge badge-primary">${job.salary}</span>
                  <span class="badge badge-muted">${job.type}</span>
                  <span class="badge badge-muted">${job.workMode}</span>
                  <span class="badge badge-muted">${job.experience}</span>
                </div>

                <p style="font-size:0.84rem;color:var(--text-secondary);line-height:1.55;margin-bottom:14px">
                  ${job.description}
                </p>

                <!-- Required Skills -->
                <div>
                  <div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:6px">Required Skills</div>
                  <div style="display:flex;flex-wrap:wrap;gap:6px">
                    ${job.requiredSkills.map(sk => {
                      const hasSkill = match.matched.includes(sk);
                      return `<span class="skill-tag" style="${hasSkill ? 'background:#ecfdf5;color:#065f46;border:1px solid #a7f3d0' : ''}">
                        ${hasSkill ? '✓ ' : ''}${sk}
                      </span>`;
                    }).join('')}
                  </div>
                </div>
              </div>

              <!-- Action Bar -->
              <div style="display:flex;gap:10px;align-items:center;padding-top:14px;border-top:1px solid var(--border-light)">
                ${isApplied ? `
                  <button class="btn btn-sm btn-ghost" style="flex:1;color:var(--success);font-weight:700;cursor:default" disabled>
                    <i data-lucide="check-circle" style="width:16px;height:16px"></i>Already in Pipeline
                  </button>
                ` : `
                  <button class="btn btn-sm btn-primary" style="flex:1" onclick="openApplyKitModal(${job.id})">
                    <i data-lucide="sparkles" style="width:15px;height:15px"></i>Apply with AI Kit
                  </button>
                `}
                <button class="btn btn-sm btn-outline" onclick="showJobDetailsModal(${job.id})">
                  Overview
                </button>
              </div>
            </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- TAB 2: APPLICATION PIPELINE & TRACKER -->
      <div id="tab-pipeline" style="${activeTab==='pipeline'?'':'display:none'}">
        <!-- Pipeline Stats -->
        <div class="stats-grid" style="margin-bottom:24px">
          <div class="stat-card indigo">
            <div class="stat-header">
              <div class="stat-label">Total Applications</div>
              <div class="stat-icon indigo"><i data-lucide="send"></i></div>
            </div>
            <div class="stat-value">${totalApps}</div>
            <div class="stat-sub">Tracked in your pipeline</div>
          </div>
          <div class="stat-card blue">
            <div class="stat-header">
              <div class="stat-label">Active In Review</div>
              <div class="stat-icon blue"><i data-lucide="clock"></i></div>
            </div>
            <div class="stat-value">${activeApplied}</div>
            <div class="stat-sub">Awaiting recruiter feedback</div>
          </div>
          <div class="stat-card amber">
            <div class="stat-header">
              <div class="stat-label">Active Interviews</div>
              <div class="stat-icon amber"><i data-lucide="mic"></i></div>
            </div>
            <div class="stat-value">${interviewingApps}</div>
            <div class="stat-sub">Technical & HR rounds scheduled</div>
          </div>
          <div class="stat-card emerald">
            <div class="stat-header">
              <div class="stat-label">Offers Received</div>
              <div class="stat-icon emerald"><i data-lucide="award"></i></div>
            </div>
            <div class="stat-value">${offersApps}</div>
            <div class="stat-sub">${responseRate}% response conversion</div>
          </div>
        </div>

        <!-- Kanban Pipeline Board -->
        <div class="kanban-board">
          ${[
            { id:'wishlist', label:'Wishlist', icon:'bookmark', color:'#64748b' },
            { id:'applied', label:'Applied', icon:'send', color:'#3b82f6' },
            { id:'interview', label:'Interviewing', icon:'calendar', color:'#f59e0b' },
            { id:'offer', label:'Offer Received', icon:'trophy', color:'#10b981' },
            { id:'rejected', label:'Archived / Rejected', icon:'archive', color:'#94a3b8' }
          ].map(col => {
            const colApps = applications.filter(a => a.status === col.id);
            return `
              <div class="kanban-col">
                <div class="kanban-col-header">
                  <span style="display:flex;align-items:center;gap:6px">
                    <span style="width:8px;height:8px;background:${col.color};border-radius:50%"></span>
                    ${col.label}
                  </span>
                  <span class="kanban-badge-count">${colApps.length}</span>
                </div>

                <div style="display:flex;flex-direction:column;gap:10px">
                  ${colApps.map(app => `
                    <div class="kanban-card">
                      <div style="display:flex;justify-content:space-between;align-items:start">
                        <div>
                          <div style="font-weight:700;font-size:0.92rem;color:var(--text-primary)">${escapeHtml(app.role)}</div>
                          <div style="font-size:0.8rem;color:var(--text-muted);font-weight:600">${escapeHtml(app.company)}</div>
                        </div>
                        <button class="btn btn-sm" style="padding:2px 6px;color:var(--danger)" onclick="deleteApp(${app.id})"><i data-lucide="trash-2" style="width:13px;height:13px"></i></button>
                      </div>

                      <div style="display:flex;gap:6px;flex-wrap:wrap">
                        ${app.salary ? `<span class="badge badge-primary" style="font-size:0.7rem">${escapeHtml(app.salary)}</span>` : ''}
                        ${app.location ? `<span class="badge badge-muted" style="font-size:0.7rem">${escapeHtml(app.location)}</span>` : ''}
                      </div>

                      ${app.nextStep ? `
                        <div style="background:#f8fafc;border-left:3px solid var(--primary);padding:6px 8px;border-radius:4px;font-size:0.75rem;color:#334155">
                          <strong>Next:</strong> ${escapeHtml(app.nextStep)}
                        </div>
                      ` : ''}

                      ${app.notes ? `
                        <div style="font-size:0.75rem;color:var(--text-secondary);font-style:italic">
                          "${escapeHtml(app.notes)}"
                        </div>
                      ` : ''}

                      <div style="display:flex;justify-content:space-between;align-items:center;padding-top:6px;border-top:1px solid #f1f5f9">
                        <span style="font-size:0.7rem;color:var(--text-muted)">Applied: ${escapeHtml(app.appliedDate || 'Recent')}</span>
                        <select style="font-size:0.72rem;padding:3px 6px;border-radius:4px;border:1px solid #cbd5e1" onchange="moveAppStatus(${app.id}, this.value)">
                          <option value="wishlist" ${app.status==='wishlist'?'selected':''}>Wishlist</option>
                          <option value="applied" ${app.status==='applied'?'selected':''}>Applied</option>
                          <option value="interview" ${app.status==='interview'?'selected':''}>Interviewing</option>
                          <option value="offer" ${app.status==='offer'?'selected':''}>Offer</option>
                          <option value="rejected" ${app.status==='rejected'?'selected':''}>Archived</option>
                        </select>
                      </div>
                    </div>
                  `).join('')}

                  ${colApps.length === 0 ? `
                    <div style="font-size:0.75rem;color:var(--text-muted);text-align:center;padding:24px 10px;border:1.5px dashed #cbd5e1;border-radius:8px">
                      No applications in this stage
                    </div>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- TAB 3: JOB SEEKING PLAYBOOK & GUIDANCE -->
      <div id="tab-guidance" style="${activeTab==='guidance'?'':'display:none'}">
        <div style="max-width:960px;margin:0 auto">

          <div style="background:linear-gradient(135deg,#1e1b4b,#3730a3);color:#fff;border-radius:var(--radius);padding:24px;margin-bottom:28px;display:flex;align-items:center;gap:20px;flex-wrap:wrap">
            <div style="width:52px;height:52px;background:rgba(255,255,255,0.15);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.8rem;flex-shrink:0">
              🚀
            </div>
            <div style="flex:1;min-width:260px">
              <h2 style="font-size:1.25rem;font-weight:800;color:#fff;margin-bottom:4px">The Off-Campus & Campus Placement Playbook</h2>
              <p style="font-size:0.85rem;color:#cbd5e1;line-height:1.5">
                A battle-tested master guide covering high-conversion networking, ATS resume architecture, cold outreach emails, and interview negotiation strategies.
              </p>
            </div>
          </div>

          <!-- Section 1: The 4-Stage Off-Campus Strategy -->
          <div class="playbook-card">
            <div class="playbook-header" onclick="togglePlaybookBody('pb-1')">
              <div style="display:flex;align-items:center;gap:12px">
                <span class="badge badge-primary">Stage 1</span>
                <strong>The 4-Week Job Sourcing Strategy</strong>
              </div>
              <i data-lucide="chevron-down" id="pb-1-icon"></i>
            </div>
            <div id="pb-1" class="playbook-body">
              <p>Applying blindly on job portals yields a &lt;3% interview callback rate. Follow the 70/20/10 rule:</p>
              <ul style="margin:12px 0 16px 20px;display:flex;flex-direction:column;gap:8px">
                <li><strong>70% via Targeted Employee Referrals:</strong> Find engineering alumni from your college working at the target firm. Send them a polite message showing you already built projects in their exact tech stack.</li>
                <li><strong>20% via Direct Outreach to Hiring Managers:</strong> Search on LinkedIn: <em>"Engineering Manager" + [Target Company]</em> or <em>"Lead ML Engineer"</em>. Send a concise message solving one of their problems.</li>
                <li><strong>10% via Career Portals & ATS forms:</strong> Only apply after your resume has been tailored with the job description keywords.</li>
              </ul>
              <div style="background:#f8fafc;border-left:3px solid var(--info);padding:12px;border-radius:4px;font-size:0.82rem">
                💡 <strong>Pro Tip:</strong> Apply within the first 48 hours of a job opening being posted. Over 60% of recruiter interviews are filled from early applicant cohorts.
              </div>
            </div>
          </div>

          <!-- Section 2: Cold Outreach & Networking Templates -->
          <div class="playbook-card">
            <div class="playbook-header" onclick="togglePlaybookBody('pb-2')">
              <div style="display:flex;align-items:center;gap:12px">
                <span class="badge badge-primary">Stage 2</span>
                <strong>High-Converting Cold Outreach Templates</strong>
              </div>
              <i data-lucide="chevron-down" id="pb-2-icon"></i>
            </div>
            <div id="pb-2" class="playbook-body">
              <div style="display:flex;flex-direction:column;gap:16px">
                <div>
                  <div style="font-weight:700;color:var(--primary);margin-bottom:6px">Template A: LinkedIn Connection Request to Engineer (300 chars limit)</div>
                  <pre style="background:#f1f5f9;padding:12px;border-radius:6px;font-size:0.8rem;white-space:pre-wrap;font-family:inherit">Hi [Name], I noticed your work on distributed systems at [Company]! As a final-year CS student with projects in [Tech Stack], I love how [Company] handles [Specific Feature]. Would love to connect and follow your journey!</pre>
                </div>
                <div>
                  <div style="font-weight:700;color:var(--primary);margin-bottom:6px">Template B: Referral Request Email to Alumni</div>
                  <pre style="background:#f1f5f9;padding:12px;border-radius:6px;font-size:0.8rem;white-space:pre-wrap;font-family:inherit">Subject: Anna University Student interested in [Role] at [Company] (Job ID: #[12345])

Hi [Name],

I hope you are having a productive week! I came across your profile through our college alumni network and wanted to congratulate you on your impact at [Company].

I noticed an opening for [Role] (Job ID #[12345]) and believe my technical background strongly aligns:
• Built [Project Name], achieving [Quantifiable Result] using [Tech Stack]
• Hands-on experience with [Skill 1], [Skill 2], and deployed services on [Cloud]

Would you be open to submitting an internal referral on my behalf? My tailored resume and portfolio link are attached below. Either way, thank you for your time!

Best regards,
${user.name} | ${user.phone}</pre>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 3: ATS Resume Golden Rules -->
          <div class="playbook-card">
            <div class="playbook-header" onclick="togglePlaybookBody('pb-3')">
              <div style="display:flex;align-items:center;gap:12px">
                <span class="badge badge-primary">Stage 3</span>
                <strong>10 Golden Rules for 90%+ ATS Resume Pass Rate</strong>
              </div>
              <i data-lucide="chevron-down" id="pb-3-icon"></i>
            </div>
            <div id="pb-3" class="playbook-body">
              <div class="grid-2" style="gap:14px">
                <div style="background:#f8fafc;padding:12px;border-radius:8px">
                  <strong style="color:var(--success)">✅ DO:</strong>
                  <ul style="margin:8px 0 0 16px;font-size:0.82rem;display:flex;flex-direction:column;gap:4px">
                    <li>Use standard headers (Summary, Education, Experience, Projects, Skills).</li>
                    <li>Follow the X-Y-Z formula: <em>"Accomplished [X] as measured by [Y], by doing [Z]"</em>.</li>
                    <li>Stick to single-column or clean 2-column ATS layouts without tables.</li>
                    <li>Always submit as PDF generated through text printing.</li>
                  </ul>
                </div>
                <div style="background:#fef2f2;padding:12px;border-radius:8px">
                  <strong style="color:var(--danger)">❌ DON'T:</strong>
                  <ul style="margin:8px 0 0 16px;font-size:0.82rem;display:flex;flex-direction:column;gap:4px">
                    <li>Don't put vital contact details inside Microsoft Word headers/footers.</li>
                    <li>Don't use rating bars or stars for skills (e.g. "Python: ⭐⭐⭐⭐").</li>
                    <li>Don't embed text inside raster images or graphics.</li>
                    <li>Don't submit 3+ page resumes for entry-level / junior roles.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 4: Compensation & Salary Negotiation -->
          <div class="playbook-card">
            <div class="playbook-header" onclick="togglePlaybookBody('pb-4')">
              <div style="display:flex;align-items:center;gap:12px">
                <span class="badge badge-primary">Stage 4</span>
                <strong>Salary Negotiation & Offer Decoded</strong>
              </div>
              <i data-lucide="chevron-down" id="pb-4-icon"></i>
            </div>
            <div id="pb-4" class="playbook-body">
              <p>Before accepting an offer, break down the compensation components:</p>
              <ul style="margin:12px 0 16px 20px;display:flex;flex-direction:column;gap:8px">
                <li><strong>Base Salary (Fixed):</strong> This is your guaranteed monthly in-hand component. Ensure Base is at least 65-80% of total CTC.</li>
                <li><strong>Variable / Performance Bonus:</strong> Usually paid annually based on company and individual performance (typically 10-15%).</li>
                <li><strong>Joining / Retention Bonus:</strong> One-time cash bonus given upon joining, often with a 1-year clawback clause.</li>
                <li><strong>ESOPs / RSUs:</strong> Stock units vesting over 4 years (standard 1-year cliff of 25%).</li>
              </ul>
              <div style="background:#f5f3ff;border-left:3px solid var(--primary);padding:12px;border-radius:4px;font-size:0.82rem">
                💬 <strong>Counter-Offer Script:</strong> "Thank you for the offer, I am genuinely excited about the vision of [Company]! Based on my proficiency in [Core Skills] and market benchmarks for this role in [City], would you be able to consider an adjustment to [₹Target Base LPA]?"
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>`;

    if (window.lucide) lucide.createIcons();
  }

  // ─── Global Event Handlers ────────────────────
  window.switchJobHubTab = function(tab) {
    activeTab = tab;
    render();
  };

  window.handleJobSearch = function(val) {
    searchTerm = val.toLowerCase();
    render();
  };

  window.handleCatFilter = function(val) {
    filterCategory = val;
    render();
  };

  window.handleModeFilter = function(val) {
    filterWorkMode = val;
    render();
  };

  window.togglePlaybookBody = function(id) {
    const el = document.getElementById(id);
    const icon = document.getElementById(id + '-icon');
    if (el) {
      const isHidden = el.style.display === 'none';
      el.style.display = isHidden ? 'block' : 'none';
      if (icon) icon.style.transform = isHidden ? 'rotate(0deg)' : 'rotate(-90deg)';
    }
  };

  window.moveAppStatus = function(appId, newStatus) {
    Store.updateJobApplication(session.id, appId, { status: newStatus });
    UI.toast(`Application moved to ${newStatus.toUpperCase()}! 🚀`, 'info');
    render();
  };

  window.deleteApp = function(appId) {
    Store.deleteJobApplication(session.id, appId);
    UI.toast('Application removed from tracker.', 'info');
    render();
  };

  window.addNewApplicationModal = function() {
    UI.modal('Track New Job Application',
      `<div style="display:flex;flex-direction:column;gap:12px">
        <div class="grid-2" style="gap:10px">
          <div class="form-group">
            <label>Company Name</label>
            <input id="add-app-company" class="form-control" placeholder="e.g. Google India" />
          </div>
          <div class="form-group">
            <label>Role / Position</label>
            <input id="add-app-role" class="form-control" placeholder="e.g. Software Engineer (L3)" />
          </div>
        </div>
        <div class="grid-2" style="gap:10px">
          <div class="form-group">
            <label>Location</label>
            <input id="add-app-loc" class="form-control" placeholder="e.g. Bangalore / Remote" />
          </div>
          <div class="form-group">
            <label>Offered / Target Salary</label>
            <input id="add-app-sal" class="form-control" placeholder="e.g. ₹16 - ₹20 LPA" />
          </div>
        </div>
        <div class="grid-2" style="gap:10px">
          <div class="form-group">
            <label>Current Status</label>
            <select id="add-app-status" class="form-control">
              <option value="applied">Applied</option>
              <option value="wishlist">Wishlist</option>
              <option value="interview">Interviewing</option>
              <option value="offer">Offer Received</option>
            </select>
          </div>
          <div class="form-group">
            <label>Next Step / Interview Date</label>
            <input id="add-app-next" class="form-control" placeholder="e.g. Round 1 on Oct 12" />
          </div>
        </div>
        <div class="form-group">
          <label>Notes & Follow-ups</label>
          <textarea id="add-app-notes" class="form-control" rows="2" placeholder="Referral by alumni, focus on DSA and System Design..."></textarea>
        </div>
      </div>`,
      `<button class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>
       <button class="btn btn-primary" onclick="submitNewApp()"><i data-lucide="plus"></i>Save to Pipeline</button>`
    );
    if (window.lucide) lucide.createIcons();

    window.submitNewApp = function() {
      const company = document.getElementById('add-app-company').value.trim();
      const role = document.getElementById('add-app-role').value.trim();
      if (!company || !role) { UI.toast('Company and Role are required.', 'error'); return; }

      Store.addJobApplication(session.id, {
        company,
        role,
        location: document.getElementById('add-app-loc').value.trim(),
        salary: document.getElementById('add-app-sal').value.trim(),
        status: document.getElementById('add-app-status').value,
        nextStep: document.getElementById('add-app-next').value.trim(),
        notes: document.getElementById('add-app-notes').value.trim()
      });

      UI.closeModal();
      UI.toast('Application added to tracker! 📋', 'success');
      activeTab = 'pipeline';
      render();
    };
  };

  // ─── AI Tailored Apply Kit Modal ──────────────
  window.openApplyKitModal = function(jobId) {
    const job = (DB.jobs || []).find(j => j.id === jobId);
    if (!job) return;

    const match = calculateJobMatch(job);
    const topProj = userProjects[0] || { name: 'ML Predictive Pipeline', description: 'Real-world data modeling' };

    // AI generated cover letter tailored to this specific job
    const coverLetter = `Dear Hiring Team at ${job.company},

I am writing to express my strong enthusiasm for the ${job.title} position (${job.workMode || 'Full-time'}) at ${job.company}. As a proactive engineering student at ${user.college || 'Anna University'} with proven hands-on experience in ${match.matched.slice(0, 3).join(', ') || 'Python and Web Engineering'}, I have long admired ${job.company}'s engineering culture and high-impact products.

In my recent project, "${topProj.name}", I ${topProj.description || 'built end-to-end software microservices with 88% accuracy'}. Working on this allowed me to develop deep practical competency in ${job.requiredSkills.slice(0, 3).join(', ')}, which directly aligns with your requirements for the ${job.title} team.

I am eager to bring my analytical rigor, problem-solving mindset, and dedication to ${job.company}. Thank you for your time and consideration. I welcome the opportunity to discuss how my background can add immediate value to your group.

Sincerely,
${user.name}
${user.email} | ${user.phone || ''}
${user.location || ''}`;

    // Cold Outreach Recruiter Message
    const recruiterMsg = `Hi [Recruiter Name], I saw that ${job.company} is hiring an ${job.title}. With hands-on proficiency in ${match.matched.slice(0, 3).join(', ')} and a recent project building "${topProj.name}", I believe I would be a great cultural and technical fit. Would love to share my portfolio!`;

    // Referral message
    const referralMsg = `Hi [Alumni Name], hope you're doing well! I'm an engineering student at ${user.college || 'our university'} deeply interested in ${job.company}. I saw an opening for ${job.title} and have built relevant projects using ${job.requiredSkills.slice(0, 2).join(' & ')}. Would you be open to providing an internal referral? Here is my resume: [Link]. Thank you so much!`;

    UI.modal(`AI Application Kit – ${job.company} (${job.title})`,
      `<div style="display:flex;flex-direction:column;gap:18px">
        <!-- Match & ATS advice -->
        <div style="background:var(--primary-light);border-radius:var(--radius-sm);padding:14px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">
          <div>
            <div style="font-weight:700;color:var(--primary);font-size:0.92rem">ATS Keyword Match: ${match.score}%</div>
            <div style="font-size:0.8rem;color:#3730a3">Matched: ${match.matched.join(', ') || 'None'}</div>
            ${match.missing.length ? `<div style="font-size:0.75rem;color:#b91c1c;margin-top:2px">⚠️ Missing on resume: ${match.missing.join(', ')} (Make sure to mention these in your application!)</div>` : ''}
          </div>
          <button class="btn btn-sm btn-primary" onclick="Router.navigate('resume');UI.closeModal()"><i data-lucide="edit-3"></i>Tune Resume</button>
        </div>

        <!-- Tab selector for Kit content -->
        <div style="display:flex;gap:6px;border-bottom:1px solid var(--border);padding-bottom:6px">
          <button class="btn btn-sm btn-primary" id="kit-tab-btn-1" onclick="switchKitTab(1)">Tailored Cover Letter</button>
          <button class="btn btn-sm btn-ghost" id="kit-tab-btn-2" onclick="switchKitTab(2)">LinkedIn Recruiter DM</button>
          <button class="btn btn-sm btn-ghost" id="kit-tab-btn-3" onclick="switchKitTab(3)">Referral Request</button>
        </div>

        <!-- Cover Letter Pane -->
        <div id="kit-pane-1">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
            <span style="font-size:0.8rem;font-weight:700;color:var(--text-muted)">CUSTOM AI GENERATED COVER LETTER</span>
            <button class="btn btn-sm btn-outline" onclick="copyKitText('kit-cl-text')"><i data-lucide="copy"></i>Copy Letter</button>
          </div>
          <textarea id="kit-cl-text" class="form-control" rows="8" style="font-size:0.82rem;line-height:1.55">${coverLetter}</textarea>
        </div>

        <!-- LinkedIn Pane -->
        <div id="kit-pane-2" style="display:none">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
            <span style="font-size:0.8rem;font-weight:700;color:var(--text-muted)">LINKEDIN RECRUITER INMAIL (Under 300 Chars)</span>
            <button class="btn btn-sm btn-outline" onclick="copyKitText('kit-li-text')"><i data-lucide="copy"></i>Copy DM</button>
          </div>
          <textarea id="kit-li-text" class="form-control" rows="4" style="font-size:0.82rem;line-height:1.5">${recruiterMsg}</textarea>
        </div>

        <!-- Referral Pane -->
        <div id="kit-pane-3" style="display:none">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
            <span style="font-size:0.8rem;font-weight:700;color:var(--text-muted)">ALUMNI REFERRAL OUTREACH MESSAGE</span>
            <button class="btn btn-sm btn-outline" onclick="copyKitText('kit-ref-text')"><i data-lucide="copy"></i>Copy Message</button>
          </div>
          <textarea id="kit-ref-text" class="form-control" rows="5" style="font-size:0.82rem;line-height:1.5">${referralMsg}</textarea>
        </div>
      </div>`,
      `<button class="btn btn-secondary" onclick="UI.closeModal()">Close</button>
       <button class="btn btn-primary" onclick="addJobToPipelineDirect(${job.id}, '${escapeHtml(job.company)}', '${escapeHtml(job.title)}', '${escapeHtml(job.salary)}', '${escapeHtml(job.location)}')">
         <i data-lucide="check"></i>Add to My Application Tracker
       </button>`
    );
    if (window.lucide) lucide.createIcons();

    window.switchKitTab = function(num) {
      [1, 2, 3].forEach(n => {
        const pane = document.getElementById('kit-pane-' + n);
        const btn = document.getElementById('kit-tab-btn-' + n);
        if (pane) pane.style.display = n === num ? 'block' : 'none';
        if (btn) {
          btn.className = n === num ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-ghost';
        }
      });
    };

    window.copyKitText = function(id) {
      const el = document.getElementById(id);
      if (el) {
        navigator.clipboard.writeText(el.value).then(() => {
          UI.toast('Copied to clipboard! 📋', 'success');
        });
      }
    };

    window.addJobToPipelineDirect = function(jId, company, role, salary, location) {
      Store.addJobApplication(session.id, {
        jobId: jId,
        company,
        role,
        salary,
        location,
        status: 'applied',
        nextStep: 'Awaiting initial application review',
        notes: 'Applied with NextStep AI tailored kit.'
      });
      UI.closeModal();
      UI.toast(`Added ${company} to your Application Pipeline! 🚀`, 'success');
      activeTab = 'pipeline';
      render();
    };
  };

  window.showJobDetailsModal = function(jobId) {
    const job = (DB.jobs || []).find(j => j.id === jobId);
    if (!job) return;

    UI.modal(`${job.company} – ${job.title}`,
      `<div style="display:flex;flex-direction:column;gap:14px">
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <span class="badge badge-primary">${job.salary}</span>
          <span class="badge badge-muted">${job.type}</span>
          <span class="badge badge-muted">${job.workMode}</span>
          <span class="badge badge-muted">${job.location}</span>
        </div>
        <p style="font-size:0.88rem;line-height:1.6">${job.description}</p>
        <div>
          <strong>Required Skills:</strong>
          <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px">
            ${job.requiredSkills.map(s => `<span class="badge badge-primary">${s}</span>`).join('')}
          </div>
        </div>
        ${job.perks && job.perks.length ? `
        <div>
          <strong>Benefits & Perks:</strong>
          <ul style="margin:6px 0 0 18px;font-size:0.82rem;color:var(--text-secondary)">
            ${job.perks.map(p => `<li>${p}</li>`).join('')}
          </ul>
        </div>` : ''}
      </div>`,
      `<button class="btn btn-secondary" onclick="UI.closeModal()">Close</button>
       <button class="btn btn-primary" onclick="UI.closeModal();openApplyKitModal(${job.id})">Apply with Kit</button>`
    );
    if (window.lucide) lucide.createIcons();
  };

  render();
};
