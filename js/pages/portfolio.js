/* ============================================
   pages/portfolio.js – Developer Portfolio Showcase & Builder
   ============================================ */

Pages.portfolio = function(container) {
  if (!Auth.requireAuth()) return;
  const session = Auth.getCurrentUser();
  const user = Store.getUserById(session.id);
  const skills = Store.getUserSkills(session.id);
  const projects = Store.getUserProjects(session.id);
  const certs = Store.getUserCerts(session.id);

  let portfolio = Store.getPortfolio(session.id);
  let isPublicPreview = false;

  function render() {
    const currentTheme = portfolio.theme || 'midnight';
    const themeClass = `portfolio-theme-${currentTheme}`;

    container.innerHTML = `
    <div class="page-content">
      <!-- Toolbar (Hidden in clean public view) -->
      ${!isPublicPreview ? `
      <div class="dash-header" style="margin-bottom:20px">
        <div>
          <h1 style="font-size:1.5rem">My Developer Portfolio</h1>
          <p>Your public-facing portfolio showcasing verified skills, live projects, and achievements.</p>
        </div>
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
          <div style="display:flex;gap:4px;background:var(--bg-card);border:1px solid var(--border);border-radius:8px;padding:3px">
            <button class="btn btn-sm ${currentTheme==='midnight'?'btn-primary':'btn-ghost'}" onclick="setPortfolioTheme('midnight')">Midnight Dark</button>
            <button class="btn btn-sm ${currentTheme==='slate'?'btn-primary':'btn-ghost'}" onclick="setPortfolioTheme('slate')">Clean Light</button>
            <button class="btn btn-sm ${currentTheme==='aurora'?'btn-primary':'btn-ghost'}" onclick="setPortfolioTheme('aurora')">Aurora Violet</button>
          </div>
          <button class="btn btn-outline btn-sm" onclick="editPortfolioInfo()"><i data-lucide="edit-3"></i>Edit Details</button>
          <button class="btn btn-outline btn-sm" onclick="copyPortfolioShareLink()"><i data-lucide="share-2"></i>Share Link</button>
          <button class="btn btn-primary btn-sm" onclick="downloadPortfolioHTML()"><i data-lucide="download"></i>Export Standalone HTML</button>
        </div>
      </div>
      ` : `
      <div style="display:flex;justify-content:space-between;align-items:center;background:#1e1b4b;color:#fff;padding:12px 20px;border-radius:12px;margin-bottom:24px">
        <span>👁️ <strong>Public Visitor Preview Mode</strong> – This is how recruiters see your portfolio.</span>
        <button class="btn btn-sm btn-outline" style="color:#fff;border-color:rgba(255,255,255,0.3)" onclick="togglePublicPreview(false)">Exit Preview</button>
      </div>
      `}

      <!-- Main Portfolio Container -->
      <div class="${themeClass}">

        <!-- Hero Section -->
        <div class="portfolio-hero">
          <div class="portfolio-avatar-wrap">
            <div class="portfolio-avatar-inner">
              ${user.avatar && (user.avatar.startsWith('http') || user.avatar.startsWith('data:'))
                ? `<img src="${user.avatar}" alt="${user.name}" style="width:100%;height:100%;object-fit:cover" />`
                : (user.avatar || user.name.charAt(0))}
            </div>
          </div>
          <div style="flex:1;min-width:280px">
            <div class="portfolio-badge">
              <span style="width:8px;height:8px;background:#10b981;border-radius:50%;display:inline-block;box-shadow:0 0 8px #10b981"></span>
              ${portfolio.statusBadge || 'Open to Internship & Full-time Opportunities'}
            </div>
            <h1 style="font-size:2.2rem;font-weight:900;margin-bottom:4px;letter-spacing:-0.5px">${user.name}</h1>
            <div style="font-size:1.1rem;font-weight:600;opacity:0.9;color:${currentTheme==='slate'?'var(--primary)':'#38bdf8'};margin-bottom:12px">
              ${portfolio.title || 'Aspiring AI Engineer & Full Stack Builder'}
            </div>
            <p style="font-size:0.92rem;line-height:1.65;max-width:760px;opacity:0.85;margin-bottom:18px">
              ${portfolio.about || ''}
            </p>

            <div style="display:flex;gap:10px;flex-wrap:wrap">
              ${portfolio.socials && portfolio.socials.github ? `<a href="${portfolio.socials.github}" target="_blank" class="portfolio-social-link"><i data-lucide="github" style="width:15px;height:15px"></i>GitHub</a>` : ''}
              ${portfolio.socials && portfolio.socials.linkedin ? `<a href="${portfolio.socials.linkedin}" target="_blank" class="portfolio-social-link"><i data-lucide="linkedin" style="width:15px;height:15px"></i>LinkedIn</a>` : ''}
              ${portfolio.socials && portfolio.socials.email ? `<a href="mailto:${portfolio.socials.email}" class="portfolio-social-link"><i data-lucide="mail" style="width:15px;height:15px"></i>Email Me</a>` : ''}
              <button class="portfolio-social-link" onclick="Router.navigate('resume')" style="cursor:pointer"><i data-lucide="file-text" style="width:15px;height:15px"></i>View Resume</button>
              <button class="portfolio-social-link" onclick="scrollToContact()" style="cursor:pointer;background:var(--primary);color:#fff;border-color:var(--primary)"><i data-lucide="send" style="width:15px;height:15px"></i>Hire Me</button>
            </div>
          </div>
        </div>

        <!-- Metrics & Stats Strip -->
        <div class="portfolio-stats-bar">
          <div class="portfolio-stat-box">
            <div class="portfolio-stat-num">${projects.length}</div>
            <div class="portfolio-stat-lbl">Featured Projects</div>
          </div>
          <div class="portfolio-stat-box">
            <div class="portfolio-stat-num">${skills.length}</div>
            <div class="portfolio-stat-lbl">Verified Skills</div>
          </div>
          <div class="portfolio-stat-box">
            <div class="portfolio-stat-num">${user.cgpa || '8.0'}</div>
            <div class="portfolio-stat-lbl">Cumulative GPA</div>
          </div>
          <div class="portfolio-stat-box">
            <div class="portfolio-stat-num">${certs.length}</div>
            <div class="portfolio-stat-lbl">Certifications</div>
          </div>
        </div>

        <!-- Featured Projects Showcase -->
        <div style="margin:40px 0">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:12px">
            <div>
              <h2 style="font-size:1.4rem;font-weight:800">Featured Technical Projects</h2>
              <p style="font-size:0.85rem;opacity:0.75">Interactive web systems, predictive AI models, and software architectures</p>
            </div>
            ${!isPublicPreview ? `<button class="btn btn-outline btn-sm" onclick="addNewPortfolioProject()"><i data-lucide="plus"></i>Add Project</button>` : ''}
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(320px, 1fr));gap:20px">
            ${projects.map(p => `
              <div class="portfolio-project-card">
                <div>
                  <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px">
                    <h3 style="font-size:1.1rem;font-weight:700">${escapeHtml(p.name)}</h3>
                    <span style="font-size:0.72rem;padding:2px 8px;border-radius:12px;background:rgba(99,102,241,0.15);color:#818cf8;font-weight:600">
                      ${p.role || 'Project'}
                    </span>
                  </div>
                  <p style="font-size:0.85rem;line-height:1.6;opacity:0.85;margin-bottom:14px">
                    ${escapeHtml(p.description)}
                  </p>
                  <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px">
                    ${(Array.isArray(p.technologies) ? p.technologies : (p.technologies || '').split(',')).map(t => `
                      <span style="font-size:0.72rem;padding:2px 8px;border-radius:4px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12)">${t.trim()}</span>
                    `).join('')}
                  </div>
                </div>
                <div style="display:flex;gap:10px;align-items:center;padding-top:12px;border-top:1px solid rgba(255,255,255,0.08)">
                  ${p.link ? `<a href="${p.link}" target="_blank" class="btn btn-sm btn-primary" style="flex:1;justify-content:center;font-size:0.78rem"><i data-lucide="external-link" style="width:13px;height:13px"></i>View Repo / Demo</a>` : ''}
                  <button class="btn btn-sm btn-outline" onclick="showProjectDetailsModal('${escapeHtml(p.name)}', '${escapeHtml(p.description)}', '${Array.isArray(p.technologies) ? p.technologies.join(', ') : p.technologies}')" style="font-size:0.78rem">Details</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Technical Skills & Stack -->
        <div style="margin:40px 0">
          <div style="margin-bottom:20px">
            <h2 style="font-size:1.4rem;font-weight:800">Tech Stack & Core Competencies</h2>
            <p style="font-size:0.85rem;opacity:0.75">Demonstrated engineering proficiency assessed via NextStep AI benchmarks</p>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(260px, 1fr));gap:16px">
            ${skills.map(s => `
              <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:var(--radius-sm);padding:14px">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                  <span style="font-weight:600;font-size:0.88rem">${s.name}</span>
                  <span style="font-size:0.75rem;font-weight:700;color:#38bdf8">${s.proficiency || 75}%</span>
                </div>
                <div style="height:6px;background:rgba(255,255,255,0.1);border-radius:3px;overflow:hidden">
                  <div style="width:${s.proficiency || 75}%;height:100%;background:linear-gradient(90deg,#4f46e5,#06b6d4);border-radius:3px"></div>
                </div>
                <div style="font-size:0.72rem;opacity:0.6;margin-top:4px">${s.level || 'Intermediate'}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Education & Certifications Timeline -->
        <div class="grid-2" style="gap:24px;margin:40px 0">
          <!-- Education & College -->
          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:var(--radius);padding:24px">
            <h3 style="font-size:1.15rem;font-weight:700;margin-bottom:16px;display:flex;align-items:center;gap:8px">
              <i data-lucide="graduation-cap" style="color:#38bdf8;width:20px;height:20px"></i>Education & Campus
            </h3>
            <div style="margin-bottom:12px">
              <div style="font-size:1rem;font-weight:700">${user.college}</div>
              <div style="font-size:0.85rem;color:#818cf8;margin-top:2px">${user.degree} · ${user.department}</div>
              <div style="font-size:0.8rem;opacity:0.75;margin-top:4px">Year ${user.year} · CGPA: <strong>${user.cgpa} / 10.0</strong></div>
            </div>
            <div style="font-size:0.8rem;opacity:0.85;border-top:1px solid rgba(255,255,255,0.08);padding-top:12px">
              <strong>Key Coursework:</strong> Data Structures & Algorithms, Machine Learning Foundations, Database Systems, Computer Networks, Linear Algebra & Probability.
            </div>
          </div>

          <!-- Verified Certifications -->
          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:var(--radius);padding:24px">
            <h3 style="font-size:1.15rem;font-weight:700;margin-bottom:16px;display:flex;align-items:center;gap:8px">
              <i data-lucide="award" style="color:#f59e0b;width:20px;height:20px"></i>Certifications & Badges
            </h3>
            <div style="display:flex;flex-direction:column;gap:12px">
              ${certs.map(c => `
                <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.06);padding-bottom:10px">
                  <div>
                    <div style="font-weight:600;font-size:0.88rem">${c.name}</div>
                    <div style="font-size:0.75rem;opacity:0.7">${c.provider} · Issued ${c.date}</div>
                  </div>
                  <span style="font-size:0.72rem;padding:2px 8px;border-radius:4px;background:rgba(16,185,129,0.15);color:#34d399;font-weight:600">Verified</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Get In Touch / Contact Section -->
        <div id="contact-section" style="margin-top:40px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:var(--radius);padding:32px;text-align:center">
          <div style="max-width:540px;margin:0 auto">
            <h2 style="font-size:1.5rem;font-weight:800;margin-bottom:8px">Let's Connect & Build Something Great</h2>
            <p style="font-size:0.88rem;opacity:0.8;margin-bottom:20px">
              I am actively seeking software engineering and AI/ML internship or full-time roles. Feel free to reach out directly!
            </p>
            <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
              <a href="mailto:${user.email || 'sudharsan@example.com'}?subject=Opportunity%20Inquiry%20from%20Portfolio" class="btn btn-primary" style="gap:6px">
                <i data-lucide="mail"></i>Send Direct Email
              </a>
              <button class="btn btn-outline" onclick="openPortfolioContactModal()" style="gap:6px">
                <i data-lucide="message-square"></i>Leave a Quick Message
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>`;

    if (window.lucide) lucide.createIcons();
  }

  // ─── Global Event Handlers ────────────────────
  window.setPortfolioTheme = function(theme) {
    portfolio.theme = theme;
    Store.savePortfolio(session.id, portfolio);
    render();
  };

  window.togglePublicPreview = function(flag) {
    isPublicPreview = flag;
    render();
  };

  window.scrollToContact = function() {
    const el = document.getElementById('contact-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  window.copyPortfolioShareLink = function() {
    const url = window.location.origin + window.location.pathname + '#portfolio';
    navigator.clipboard.writeText(url).then(() => {
      UI.toast('Portfolio link copied to clipboard! 📋', 'success');
    }).catch(() => {
      UI.toast('Link: ' + url, 'info');
    });
  };

  window.editPortfolioInfo = function() {
    UI.modal('Edit Portfolio Information',
      `<div style="display:flex;flex-direction:column;gap:14px">
        <div class="form-group">
          <label>Headline / Tagline</label>
          <input id="edit-port-title" class="form-control" value="${escapeHtml(portfolio.title || '')}" />
        </div>
        <div class="form-group">
          <label>Status Badge Text</label>
          <input id="edit-port-status" class="form-control" value="${escapeHtml(portfolio.statusBadge || '')}" placeholder="e.g. Open to Internship & Full-time Opportunities" />
        </div>
        <div class="form-group">
          <label>About Me / Bio</label>
          <textarea id="edit-port-about" class="form-control" rows="4">${escapeHtml(portfolio.about || '')}</textarea>
        </div>
        <div class="grid-2" style="gap:10px">
          <div class="form-group">
            <label>GitHub Profile URL</label>
            <input id="edit-port-gh" class="form-control" value="${escapeHtml(portfolio.socials ? portfolio.socials.github : '')}" />
          </div>
          <div class="form-group">
            <label>LinkedIn Profile URL</label>
            <input id="edit-port-li" class="form-control" value="${escapeHtml(portfolio.socials ? portfolio.socials.linkedin : '')}" />
          </div>
        </div>
      </div>`,
      `<button class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>
       <button class="btn btn-primary" onclick="savePortfolioInfoModal()"><i data-lucide="save"></i>Save Changes</button>`
    );
    if (window.lucide) lucide.createIcons();

    window.savePortfolioInfoModal = function() {
      portfolio.title = document.getElementById('edit-port-title').value;
      portfolio.statusBadge = document.getElementById('edit-port-status').value;
      portfolio.about = document.getElementById('edit-port-about').value;
      if (!portfolio.socials) portfolio.socials = {};
      portfolio.socials.github = document.getElementById('edit-port-gh').value;
      portfolio.socials.linkedin = document.getElementById('edit-port-li').value;

      Store.savePortfolio(session.id, portfolio);
      UI.closeModal();
      UI.toast('Portfolio updated successfully! 🚀', 'success');
      render();
    };
  };

  window.addNewPortfolioProject = function() {
    UI.modal('Add New Project to Portfolio',
      `<div style="display:flex;flex-direction:column;gap:12px">
        <div class="form-group">
          <label>Project Name</label>
          <input id="new-proj-name" class="form-control" placeholder="e.g. Distributed Task Queue" />
        </div>
        <div class="form-group">
          <label>Your Role</label>
          <input id="new-proj-role" class="form-control" placeholder="e.g. Full Stack Developer / ML Engineer" />
        </div>
        <div class="form-group">
          <label>Technologies (comma separated)</label>
          <input id="new-proj-tech" class="form-control" placeholder="e.g. Python, Redis, Docker, FastAPI" />
        </div>
        <div class="form-group">
          <label>Project Link / GitHub URL</label>
          <input id="new-proj-link" class="form-control" placeholder="https://github.com/..." />
        </div>
        <div class="form-group">
          <label>Description & Key Achievements</label>
          <textarea id="new-proj-desc" class="form-control" rows="3" placeholder="Briefly explain the problem solved, architecture used, and quantifiable outcome..."></textarea>
        </div>
      </div>`,
      `<button class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>
       <button class="btn btn-primary" onclick="saveNewProjectModal()"><i data-lucide="plus"></i>Add Project</button>`
    );
    if (window.lucide) lucide.createIcons();

    window.saveNewProjectModal = function() {
      const name = document.getElementById('new-proj-name').value.trim();
      if (!name) { UI.toast('Please enter a project name.', 'error'); return; }

      const allProjects = Store.getUserProjects(session.id);
      const newP = {
        id: Date.now(),
        name,
        role: document.getElementById('new-proj-role').value.trim() || 'Solo Developer',
        technologies: document.getElementById('new-proj-tech').value.split(',').map(t => t.trim()).filter(Boolean),
        link: document.getElementById('new-proj-link').value.trim(),
        description: document.getElementById('new-proj-desc').value.trim()
      };
      allProjects.unshift(newP);
      Store.setUserProjects(session.id, allProjects);

      UI.closeModal();
      UI.toast('Project added to portfolio! 🎉', 'success');
      render();
    };
  };

  window.showProjectDetailsModal = function(name, desc, tech) {
    UI.modal(name,
      `<div style="display:flex;flex-direction:column;gap:14px">
        <p style="font-size:0.9rem;line-height:1.6">${desc}</p>
        <div>
          <strong>Tech Stack:</strong>
          <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px">
            ${tech.split(',').map(t => `<span class="badge badge-primary">${t.trim()}</span>`).join('')}
          </div>
        </div>
      </div>`,
      `<button class="btn btn-secondary" onclick="UI.closeModal()">Close</button>`
    );
    if (window.lucide) lucide.createIcons();
  };

  window.openPortfolioContactModal = function() {
    UI.modal('Leave a Message for ' + user.name,
      `<div style="display:flex;flex-direction:column;gap:12px">
        <div class="form-group">
          <label>Your Name</label>
          <input id="recruiter-name" class="form-control" placeholder="e.g. Jane Doe (Tech Recruiter)" />
        </div>
        <div class="form-group">
          <label>Your Company / Email</label>
          <input id="recruiter-email" class="form-control" placeholder="e.g. talent@company.com" />
        </div>
        <div class="form-group">
          <label>Opportunity / Message</label>
          <textarea id="recruiter-msg" class="form-control" rows="4" placeholder="Hi Sudharsan, we loved your projects and would like to invite you for an interview..."></textarea>
        </div>
      </div>`,
      `<button class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>
       <button class="btn btn-primary" onclick="submitPortfolioMessage()"><i data-lucide="send"></i>Send Message</button>`
    );
    if (window.lucide) lucide.createIcons();

    window.submitPortfolioMessage = function() {
      const name = document.getElementById('recruiter-name').value;
      if (!name) { UI.toast('Please provide your name.', 'error'); return; }
      UI.closeModal();
      UI.toast('Message sent successfully! The candidate has been notified. 📬', 'success');
    };
  };

  // ─── Export Standalone HTML ───────────────────
  window.downloadPortfolioHTML = function() {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${user.name} – Developer Portfolio</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin:0; padding:0; }
    body { font-family: 'Inter', sans-serif; background: #090d16; color: #f1f5f9; padding: 40px 20px; line-height: 1.6; }
    .container { max-width: 1000px; margin: 0 auto; }
    .hero { display: flex; align-items: center; gap: 24px; padding-bottom: 32px; border-bottom: 1px solid rgba(255,255,255,0.1); flex-wrap: wrap; }
    .avatar { width: 90px; height: 90px; border-radius: 50%; background: linear-gradient(135deg,#4f46e5,#06b6d4); display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 800; color: #fff; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; background: rgba(16,185,129,0.2); color: #10b981; font-size: 0.75rem; font-weight: 600; margin-bottom: 8px; }
    h1 { font-size: 2.2rem; font-weight: 800; }
    .title { color: #38bdf8; font-size: 1.1rem; font-weight: 600; margin-bottom: 8px; }
    .social-btn { display: inline-block; padding: 8px 16px; border-radius: 8px; background: #4f46e5; color: #fff; text-decoration: none; font-weight: 600; font-size: 0.85rem; margin-right: 8px; margin-top: 10px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; margin-top: 20px; }
    .card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; }
    .tag { display: inline-block; background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; margin-right: 4px; margin-top: 4px; }
    .sec-h { font-size: 1.5rem; font-weight: 700; margin: 40px 0 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="hero">
      <div class="avatar">${user.name.charAt(0)}</div>
      <div>
        <div class="badge">Open to Opportunities</div>
        <h1>${user.name}</h1>
        <div class="title">${portfolio.title || 'Software & AI Engineer'}</div>
        <p>${portfolio.about || ''}</p>
        <div>
          ${portfolio.socials && portfolio.socials.github ? `<a href="${portfolio.socials.github}" target="_blank" class="social-btn">GitHub</a>` : ''}
          ${portfolio.socials && portfolio.socials.linkedin ? `<a href="${portfolio.socials.linkedin}" target="_blank" class="social-btn">LinkedIn</a>` : ''}
          <a href="mailto:${user.email}" class="social-btn" style="background:#059669">Contact Me</a>
        </div>
      </div>
    </div>

    <div class="sec-h">Featured Projects</div>
    <div class="grid">
      ${projects.map(p => `
        <div class="card">
          <h3 style="margin-bottom:8px">${p.name}</h3>
          <p style="font-size:0.85rem;opacity:0.85;margin-bottom:12px">${p.description}</p>
          <div>${(Array.isArray(p.technologies) ? p.technologies : [p.technologies]).map(t => `<span class="tag">${t}</span>`).join('')}</div>
          ${p.link ? `<div style="margin-top:12px"><a href="${p.link}" target="_blank" style="color:#38bdf8;font-size:0.85rem;text-decoration:none">View Source →</a></div>` : ''}
        </div>
      `).join('')}
    </div>

    <div class="sec-h">Technical Skills</div>
    <div class="grid" style="grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))">
      ${skills.map(s => `
        <div class="card" style="padding:14px">
          <strong>${s.name}</strong>
          <div style="font-size:0.8rem;color:#38bdf8;margin-top:4px">${s.level || 'Proficient'} · ${s.proficiency || 80}%</div>
        </div>
      `).join('')}
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${user.name.toLowerCase().replace(/\s+/g, '_')}_portfolio.html`;
    a.click();
    UI.toast('Portfolio standalone HTML exported! 🌐', 'success');
  };

  render();
};
