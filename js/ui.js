/* ============================================
   ui.js – Shared UI helpers
   ============================================ */

const UI = {
  // ─── Toast Notifications ─────────────────
  toast(message, type = 'info', duration = 3500) {
    const icons = { success:'check-circle', error:'x-circle', warning:'alert-triangle', info:'info' };
    const container = document.getElementById('toast-container');
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<i data-lucide="${icons[type] || 'info'}" style="width:18px;height:18px"></i><span>${message}</span>`;
    container.appendChild(el);
    if (window.lucide) lucide.createIcons({ el });
    setTimeout(() => {
      el.classList.add('hiding');
      setTimeout(() => el.remove(), 300);
    }, duration);
  },

  // ─── Modal ───────────────────────────────
  modal(title, content, actions = '') {
    const container = document.getElementById('modal-container');
    container.innerHTML = `
      <div class="modal-overlay" id="modal-overlay">
        <div class="modal">
          <div class="modal-header">
            <h3>${title}</h3>
            <button class="modal-close" onclick="UI.closeModal()"><i data-lucide="x"></i></button>
          </div>
          <div class="modal-body">${content}</div>
          ${actions ? `<div class="modal-footer mt-20" style="display:flex;gap:10px;justify-content:flex-end">${actions}</div>` : ''}
        </div>
      </div>`;
    if (window.lucide) lucide.createIcons();
    document.getElementById('modal-overlay').addEventListener('click', e => {
      if (e.target.id === 'modal-overlay') this.closeModal();
    });
  },

  closeModal() {
    document.getElementById('modal-container').innerHTML = '';
  },

  // ─── Navbar ──────────────────────────────
  renderNavbar(activeRoute) {
    const user = Auth.getCurrentUser();
    const fullUser = Store.getUserById(user.id);
    const isAdmin = user.role === 'admin';
    const links = isAdmin
      ? [{ route:'admin', label:'Admin', icon:'shield' }]
      : [
          { route:'dashboard',  label:'Dashboard', icon:'layout-dashboard' },
          { route:'profile',    label:'Profile',   icon:'user' },
          { route:'assessment', label:'Assess',    icon:'clipboard-list' },
          { route:'careers',    label:'Careers',   icon:'briefcase' },
          { route:'jobs',       label:'Jobs',      icon:'send' },
          { route:'resume',     label:'Resume',    icon:'file-text' },
          { route:'portfolio',  label:'Portfolio', icon:'globe' },
          { route:'coach',      label:'Coach',     icon:'message-circle' },
          { route:'interview',  label:'Interview', icon:'mic' }
        ];

    const linksHtml = links.map(l => `
      <button class="nav-link ${activeRoute === l.route ? 'active' : ''}" onclick="Router.navigate('${l.route}')">
        <i data-lucide="${l.icon}"></i>${l.label}
      </button>`).join('');

    return `
      <nav class="navbar">
        <div class="navbar-inner">
          <a class="navbar-brand" onclick="Router.navigate('${isAdmin ? 'admin' : 'dashboard'}')">
            <div class="brand-icon"><i data-lucide="zap" style="width:18px;height:18px"></i></div>
            <span>NextStep AI</span>
          </a>
          <div class="nav-links">${linksHtml}</div>
          <div class="navbar-right">
            <div class="user-info">
              <div class="user-avatar" style="overflow:hidden;display:flex;align-items:center;justify-content:center">${user.avatar && (user.avatar.startsWith('http') || user.avatar.startsWith('data:')) ? `<img src="${user.avatar}" alt="${user.name}" style="width:100%;height:100%;object-fit:cover;border-radius:50%" />` : (user.avatar || user.name[0])}</div>
              <div>
                <div class="user-name">${user.name.split(' ')[0]}</div>
                <div class="user-role">${user.role === 'admin' ? 'Administrator' : 'Student'}</div>
              </div>
            </div>
            <button class="btn-logout" onclick="Auth.logout();Router.navigate('login');UI.toast('Logged out successfully.','info')" title="Logout">
              <i data-lucide="log-out" style="width:17px;height:17px"></i>
            </button>
          </div>
          <button class="hamburger" id="hamburger-btn" onclick="UI.toggleMobileMenu()">
            <i data-lucide="menu" style="width:22px;height:22px"></i>
          </button>
        </div>
      </nav>
      <div class="mobile-menu" id="mobile-menu">
        ${links.map(l => `<button class="nav-link ${activeRoute === l.route ? 'active' : ''}" onclick="Router.navigate('${l.route}');UI.closeMobileMenu()"><i data-lucide="${l.icon}"></i>${l.label}</button>`).join('')}
        <button class="nav-link" style="color:#ef4444" onclick="Auth.logout();Router.navigate('login')"><i data-lucide="log-out"></i>Logout</button>
      </div>`;
  },

  initNavbar() {
    if (window.lucide) lucide.createIcons();
  },

  toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) menu.classList.toggle('open');
  },

  closeMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) menu.classList.remove('open');
  },

  // ─── Progress Bar ────────────────────────
  progressBar(pct, color = 'indigo', height = 8) {
    return `<div class="progress-bar" style="height:${height}px"><div class="progress-fill ${color}" style="width:${pct}%"></div></div>`;
  },

  // ─── Badge ───────────────────────────────
  badge(text, type = 'primary') {
    return `<span class="badge badge-${type}">${text}</span>`;
  },

  // ─── Demand color ────────────────────────
  demandColor(demand) {
    if (demand === 'Very High') return 'success';
    if (demand === 'High') return 'info';
    if (demand === 'Medium') return 'warning';
    return 'muted';
  },

  diffColor(diff) {
    if (diff === 'Beginner') return 'success';
    if (diff === 'Intermediate') return 'warning';
    return 'danger';
  },

  // ─── Salary formatter ────────────────────
  formatSalary(val) {
    if (val >= 100000) return `₹${(val/100000).toFixed(0)}L`;
    return `₹${(val/1000).toFixed(0)}K`;
  },

  // ─── Skill Gap Status ────────────────────
  gapStatus(student, required) {
    const diff = required - student;
    if (diff <= 5)  return { label:'Strong', color:'#10b981', badge:'success' };
    if (diff <= 20) return { label:'Improve', color:'#f59e0b', badge:'warning' };
    return { label:'Gap', color:'#ef4444', badge:'danger' };
  },

  // ─── Loading State ───────────────────────
  loading(msg = 'Loading...') {
    return `<div class="loading-spinner"><div class="spinner"></div><p class="text-muted">${msg}</p></div>`;
  },

  // ─── Empty State ─────────────────────────
  emptyState(icon, title, desc, actions = '') {
    return `
      <div class="empty-state">
        <div class="empty-state-icon"><i data-lucide="${icon}"></i></div>
        <h3>${title}</h3>
        <p>${desc}</p>
        ${actions ? `<div class="empty-state-actions">${actions}</div>` : ''}
      </div>`;
  },

  // ─── Course Card ─────────────────────────
  courseCard(course) {
    const stars = '★'.repeat(Math.floor(course.rating)) + (course.rating % 1 >= 0.5 ? '½' : '');
    return `
      <div class="course-card">
        <div>
          <div class="course-provider">${course.provider}</div>
          <div class="course-name">${course.name}</div>
        </div>
        <div class="course-meta">
          <span class="course-meta-item"><i data-lucide="tag" style="width:12px;height:12px"></i>${course.skill}</span>
          <span class="course-meta-item"><i data-lucide="clock" style="width:12px;height:12px"></i>${course.duration}</span>
          <span class="course-meta-item"><i data-lucide="bar-chart" style="width:12px;height:12px"></i>${course.difficulty}</span>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div class="course-rating"><span>${course.rating}</span><span style="color:#f59e0b">${stars}</span></div>
          ${course.free ? UI.badge('Free','success') : UI.badge('Paid','muted')}
        </div>
        <a href="${course.link}" target="_blank" class="btn btn-outline btn-sm btn-full">
          <i data-lucide="external-link"></i>View Course
        </a>
      </div>`;
  },

  // ─── Cert Card ───────────────────────────
  certCard(cert) {
    return `
      <div class="card card-sm" style="display:flex;flex-direction:column;gap:10px">
        <div style="display:flex;align-items:flex-start;gap:12px">
          <div class="stat-icon indigo" style="flex-shrink:0"><i data-lucide="award" style="width:18px;height:18px"></i></div>
          <div style="flex:1">
            <div style="font-weight:700;font-size:.9rem">${cert.name}</div>
            <div style="font-size:.78rem;color:var(--text-muted)">${cert.provider}</div>
          </div>
          ${UI.badge(cert.difficulty, UI.diffColor(cert.difficulty))}
        </div>
        <div style="display:flex;gap:16px;font-size:.78rem;color:var(--text-secondary)">
          <span><i data-lucide="calendar" style="width:12px;height:12px;vertical-align:middle"></i> Valid: ${cert.validity}</span>
          <span><i data-lucide="clock" style="width:12px;height:12px;vertical-align:middle"></i> Prep: ${cert.prepTime}</span>
        </div>
        <a href="${cert.link}" target="_blank" class="btn btn-outline btn-sm"><i data-lucide="external-link"></i>View Certification</a>
      </div>`;
  },

  // ─── Skill Gap Bars ──────────────────────
  skillGapBars(skillName, studentPct, requiredPct) {
    const status = this.gapStatus(studentPct, requiredPct);
    return `
      <div class="skill-gap-row">
        <div class="skill-gap-name">${skillName}</div>
        <div class="skill-gap-bars">
          <div class="skill-gap-bar-row">
            <div class="skill-gap-bar-label" style="font-size:.7rem;color:var(--primary)">You</div>
            <div class="skill-gap-bar"><div class="fill" style="width:${studentPct}%;background:var(--primary);height:100%;border-radius:999px"></div></div>
            <span style="font-size:.75rem;font-weight:700;color:var(--primary);width:34px">${studentPct}%</span>
          </div>
          <div class="skill-gap-bar-row">
            <div class="skill-gap-bar-label" style="font-size:.7rem;color:var(--text-muted)">Required</div>
            <div class="skill-gap-bar"><div class="fill" style="width:${requiredPct}%;background:#e2e8f0;height:100%;border-radius:999px"></div></div>
            <span style="font-size:.75rem;font-weight:700;color:var(--text-muted);width:34px">${requiredPct}%</span>
          </div>
        </div>
        <div class="skill-gap-status">${UI.badge(status.label, status.badge)}</div>
      </div>`;
  },

  // ─── Project Card ────────────────────────
  projectCard(project) {
    const colors = { Beginner:'success', Intermediate:'warning', Advanced:'danger' };
    return `
      <div class="card card-sm" style="display:flex;flex-direction:column;gap:10px">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px">
          <div style="font-weight:700;font-size:.9rem">${project.name}</div>
          ${UI.badge(project.difficulty, colors[project.difficulty] || 'muted')}
        </div>
        <p style="font-size:.8rem;line-height:1.5;margin:0">${project.description}</p>
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          ${project.technologies.map(t => `<span class="skill-tag" style="font-size:.7rem">${t}</span>`).join('')}
        </div>
        <div style="display:flex;gap:16px;font-size:.78rem;color:var(--text-secondary)">
          <span><i data-lucide="clock" style="width:12px;height:12px;vertical-align:middle"></i> ${project.duration}</span>
        </div>
        <div style="font-size:.78rem;color:var(--text-muted)"><strong>Skills:</strong> ${project.skills.join(', ')}</div>
      </div>`;
  },

  // ─── Roadmap Stage ───────────────────────
  roadmapStage(stage, idx, isLast) {
    const cls = stage.completed ? 'completed' : (idx === 0 ? 'active' : '');
    const dotCls = stage.completed ? 'completed' : (idx === 0 ? 'active' : '');
    return `
      <div class="roadmap-stage">
        <div class="roadmap-connector">
          <div class="roadmap-dot ${dotCls}" onclick="toggleRoadmapStage(${stage.id})">${stage.completed ? '<i data-lucide="check" style="width:14px;height:14px"></i>' : stage.id}</div>
          ${!isLast ? '<div class="roadmap-line"></div>' : ''}
        </div>
        <div class="roadmap-card ${cls}" style="margin-bottom:8px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
            <div class="roadmap-stage-title">Stage ${stage.id}: ${stage.title}</div>
            ${stage.completed ? UI.badge('Completed','success') : (idx === 0 ? UI.badge('In Progress','info') : UI.badge('Upcoming','muted'))}
          </div>
          <div class="roadmap-stage-meta">
            <span class="roadmap-meta-item"><i data-lucide="clock"></i>${stage.duration}</span>
            <span class="roadmap-meta-item"><i data-lucide="book-open"></i>${stage.resources[0]}</span>
          </div>
          <div class="roadmap-stage-skills">
            ${stage.skills.map(s => `<span class="skill-tag" style="font-size:.7rem">${s}</span>`).join('')}
          </div>
        </div>
      </div>`;
  }
};
