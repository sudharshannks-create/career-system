/* ============================================
   pages/careers.js
   ============================================ */

Pages.careers = function(container) {
  if (!Auth.requireAuth()) return;
  const session = Auth.getCurrentUser();

  let searchTerm = '';
  let filterCategory = '';
  let filterDifficulty = '';
  let filterDemand = '';
  let activeView = 'all'; // all | recommendations | courses | certifications | projects

  function getFiltered() {
    return DB.careers.filter(c => {
      const matchSearch = !searchTerm || c.name.toLowerCase().includes(searchTerm) || c.category.toLowerCase().includes(searchTerm) || c.requiredSkills.some(s => s.toLowerCase().includes(searchTerm));
      const matchCat  = !filterCategory || c.category === filterCategory;
      const matchDiff = !filterDifficulty || c.difficulty === filterDifficulty;
      const matchDem  = !filterDemand || c.demand === filterDemand;
      return matchSearch && matchCat && matchDiff && matchDem;
    });
  }

  function render() {
    const filtered = getFiltered();
    const recs = AIEngine.run(session.id);
    const categories = [...new Set(DB.careers.map(c => c.category))];

    container.innerHTML = `
    <div class="page-content">
      <div class="dash-header">
        <div>
          <h1 style="font-size:1.5rem">Career Explorer</h1>
          <p>Discover and explore career paths tailored for you</p>
        </div>
        <button class="btn btn-outline btn-sm" onclick="ExcelExport.exportCareers()" title="Export career data to Excel" style="gap:6px">
          <i data-lucide="download" style="width:15px;height:15px"></i>Export Excel
        </button>
      </div>


      <!-- View Tabs -->
      <div class="tabs">
        ${[
          { id:'all', label:'All Careers', icon:'briefcase' },
          { id:'recommendations', label:'My Recommendations', icon:'star' },
          { id:'courses', label:'Courses', icon:'book-open' },
          { id:'certifications', label:'Certifications', icon:'award' },
          { id:'projects', label:'Projects', icon:'folder' }
        ].map(t => `<button class="tab-btn ${activeView===t.id?'active':''}" onclick="switchCareerView('${t.id}')">
          <i data-lucide="${t.icon}" style="width:14px;height:14px;vertical-align:middle;margin-right:4px"></i>${t.label}
        </button>`).join('')}
      </div>

      <!-- All Careers View -->
      <div id="view-all" style="${activeView==='all'?'':'display:none'}">
        <!-- Search & Filter -->
        <div class="search-filter-bar">
          <div class="search-input-wrapper">
            <i data-lucide="search"></i>
            <input class="form-input" id="career-search" placeholder="Search careers, skills..." value="${searchTerm}" oninput="careerSearch(this.value)" />
          </div>
          <select class="filter-select" id="filter-cat" onchange="careerFilterCat(this.value)">
            <option value="">All Categories</option>
            ${categories.map(c => `<option ${filterCategory===c?'selected':''}>${c}</option>`).join('')}
          </select>
          <select class="filter-select" id="filter-diff" onchange="careerFilterDiff(this.value)">
            <option value="">All Levels</option>
            <option ${filterDifficulty==='Beginner'?'selected':''}>Beginner</option>
            <option ${filterDifficulty==='Intermediate'?'selected':''}>Intermediate</option>
            <option ${filterDifficulty==='Advanced'?'selected':''}>Advanced</option>
          </select>
          <select class="filter-select" id="filter-dem" onchange="careerFilterDem(this.value)">
            <option value="">All Demand</option>
            <option ${filterDemand==='Very High'?'selected':''}>Very High</option>
            <option ${filterDemand==='High'?'selected':''}>High</option>
            <option ${filterDemand==='Medium'?'selected':''}>Medium</option>
          </select>
        </div>

        <div style="margin-bottom:16px;color:var(--text-muted);font-size:.85rem">Showing ${filtered.length} career${filtered.length!==1?'s':''}</div>

        <div class="careers-grid">
          ${filtered.length === 0
            ? `<div style="grid-column:1/-1">${UI.emptyState('briefcase','No careers found','Try adjusting your search or filters.')}</div>`
            : filtered.map(career => renderCareerCard(career, recs.find(r => r.careerId === career.id))).join('')}
        </div>
      </div>

      <!-- Recommendations View -->
      <div id="view-recommendations" style="${activeView==='recommendations'?'':'display:none'}">
        ${recs.length > 0
          ? `<div style="display:flex;flex-direction:column;gap:16px">${recs.map((rec, i) => renderRecMiniCard(rec, i)).join('')}</div>`
          : UI.emptyState('brain','No Recommendations Yet','Run AI Analysis from your dashboard to see career recommendations.',`<button class="btn btn-primary" onclick="Router.navigate('dashboard');setTimeout(runAnalysis,200)"><i data-lucide="brain"></i>Run AI Analysis</button>`)}
      </div>

      <!-- Courses View -->
      <div id="view-courses" style="${activeView==='courses'?'':'display:none'}">
        <div class="search-filter-bar">
          <div class="search-input-wrapper">
            <i data-lucide="search"></i>
            <input class="form-input" placeholder="Search courses..." oninput="courseSearch(this.value)" />
          </div>
          <select class="filter-select" onchange="courseFilterDiff(this.value)">
            <option value="">All Levels</option>
            <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
          </select>
          <select class="filter-select" onchange="courseFilterFree(this.value)">
            <option value="">All Courses</option>
            <option value="free">Free Only</option>
            <option value="paid">Paid Only</option>
          </select>
        </div>
        <div class="grid-3" id="courses-grid">
          ${DB.courses.map(c => UI.courseCard(c)).join('')}
        </div>
      </div>

      <!-- Certifications View -->
      <div id="view-certifications" style="${activeView==='certifications'?'':'display:none'}">
        <div class="grid-2" id="certs-grid">
          ${DB.certifications.map(c => UI.certCard(c)).join('')}
        </div>
      </div>

      <!-- Projects View -->
      <div id="view-projects" style="${activeView==='projects'?'':'display:none'}">
        <div class="grid-3" id="projects-grid">
          ${DB.projects.map(p => UI.projectCard(p)).join('')}
        </div>
      </div>
    </div>`;

    if (window.lucide) lucide.createIcons();
  }

  function renderCareerCard(career, rec) {
    return `
    <div class="career-card" onclick="showFullCareerModal(${career.id})">
      <div class="career-card-header">
        <div style="display:flex;align-items:center;gap:12px">
          <div class="career-card-icon" style="background:${career.iconBg}">
            <i data-lucide="${career.icon}" style="color:${career.iconColor}"></i>
          </div>
          <div>
            <div class="career-name">${career.name}</div>
            <div style="font-size:.75rem;color:var(--text-muted)">${career.category}</div>
          </div>
        </div>
        ${rec ? `<div class="match-badge">${rec.matchScore}% Match</div>` : ''}
      </div>
      <p class="career-desc">${career.description}</p>
      <div class="career-meta">
        ${UI.badge(career.difficulty, UI.diffColor(career.difficulty))}
        ${UI.badge(career.demand + ' Demand', UI.demandColor(career.demand))}
      </div>
      <div class="career-stats">
        <div class="career-stat">
          <div class="career-stat-val">${UI.formatSalary(career.salaryMin)}–${UI.formatSalary(career.salaryMax)}</div>
          <div class="career-stat-key">Salary/yr</div>
        </div>
        <div class="career-stat">
          <div class="career-stat-val">${career.growth}</div>
          <div class="career-stat-key">Growth</div>
        </div>
        <div class="career-stat">
          <div class="career-stat-val">${career.requiredSkills.length}</div>
          <div class="career-stat-key">Skills Req.</div>
        </div>
      </div>
      <div class="career-skills-list">
        ${career.requiredSkills.slice(0,4).map(s => `<span class="skill-tag" style="font-size:.72rem">${s}</span>`).join('')}
        ${career.requiredSkills.length > 4 ? `<span class="badge badge-muted">+${career.requiredSkills.length-4}</span>` : ''}
      </div>
      <div class="career-actions">
        <button class="btn btn-outline btn-sm" onclick="event.stopPropagation();showFullCareerModal(${career.id})"><i data-lucide="eye"></i>View Career</button>
        <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation();showCareerDetail(${career.id})"><i data-lucide="bar-chart-2"></i>Skill Gap</button>
      </div>
    </div>`;
  }

  function renderRecMiniCard(rec, idx) {
    const career = DB.careers.find(c => c.id === rec.careerId);
    const medals = ['🥇','🥈','🥉','4️⃣','5️⃣'];
    return `
    <div class="rec-card">
      <div class="rec-header">
        <div style="display:flex;align-items:center;gap:14px">
          <div class="rec-icon" style="background:${career.iconBg}">
            <i data-lucide="${career.icon}" style="color:${career.iconColor}"></i>
          </div>
          <div>
            <div style="font-size:.78rem;color:var(--text-muted)">${medals[idx]} Rank ${idx+1}</div>
            <div style="font-weight:800;font-size:1rem">${rec.careerName}</div>
          </div>
        </div>
        <div style="text-align:right">
          <div class="rec-match">${rec.matchScore}%</div>
          <div class="rec-match-label">Match</div>
        </div>
      </div>
      ${UI.progressBar(rec.matchScore, 'indigo')}
      <div style="margin-top:12px;font-size:.82rem;color:var(--text-secondary)">${rec.whyRecommended}</div>
      <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">
        ${rec.matchedSkills.slice(0,4).map(s => `<span class="badge badge-success">${s}</span>`).join('')}
        ${rec.missingSkills.slice(0,3).map(s => `<span class="badge badge-danger">${s}</span>`).join('')}
      </div>
      <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap">
        <button class="btn btn-primary btn-sm" onclick="showFullCareerModal(${career.id})"><i data-lucide="eye"></i>View Details</button>
        <button class="btn btn-outline btn-sm" onclick="showSkillGap(${career.id})"><i data-lucide="bar-chart-2"></i>Skill Gap</button>
        <button class="btn btn-secondary btn-sm" onclick="showRoadmap(${career.id})"><i data-lucide="map"></i>Roadmap</button>
      </div>
    </div>`;
  }

  window.switchCareerView = function(v) {
    activeView = v;
    document.querySelectorAll('.tab-btn').forEach((b, i) => {
      const views = ['all','recommendations','courses','certifications','projects'];
      b.classList.toggle('active', views[i] === v);
    });
    ['all','recommendations','courses','certifications','projects'].forEach(id => {
      const el = document.getElementById('view-' + id);
      if (el) el.style.display = id === v ? '' : 'none';
    });
  };

  window.careerSearch = function(val) { searchTerm = val.toLowerCase(); render(); };
  window.careerFilterCat = function(val) { filterCategory = val; render(); };
  window.careerFilterDiff = function(val) { filterDifficulty = val; render(); };
  window.careerFilterDem = function(val) { filterDemand = val; render(); };

  window.courseSearch = function(val) {
    const grid = document.getElementById('courses-grid');
    if (!grid) return;
    const term = val.toLowerCase();
    grid.innerHTML = DB.courses.filter(c =>
      c.name.toLowerCase().includes(term) || c.skill.toLowerCase().includes(term) || c.provider.toLowerCase().includes(term)
    ).map(c => UI.courseCard(c)).join('');
    if (window.lucide) lucide.createIcons();
  };

  window.courseFilterDiff = function(val) {
    const grid = document.getElementById('courses-grid');
    if (!grid) return;
    grid.innerHTML = (val ? DB.courses.filter(c => c.difficulty === val) : DB.courses).map(c => UI.courseCard(c)).join('');
    if (window.lucide) lucide.createIcons();
  };

  window.courseFilterFree = function(val) {
    const grid = document.getElementById('courses-grid');
    if (!grid) return;
    const filtered = val === 'free' ? DB.courses.filter(c => c.free)
                   : val === 'paid' ? DB.courses.filter(c => !c.free)
                   : DB.courses;
    grid.innerHTML = filtered.map(c => UI.courseCard(c)).join('');
    if (window.lucide) lucide.createIcons();
  };

  window.showFullCareerModal = function(careerId) {
    const career = DB.careers.find(c => c.id === careerId);
    const recs = AIEngine.run(session.id);
    const rec = recs.find(r => r.careerId === careerId);
    const courses = DB.courses.filter(c => career.requiredSkills.includes(c.skill)).slice(0,3);
    const certs = DB.certifications.filter(c => c.careerId === careerId).slice(0,3);
    const projs = DB.projects.filter(p => p.careerId === careerId);
    const roadmap = DB.roadmaps[careerId] || DB.roadmaps[1];

    UI.modal(`${career.name}`,
      `<div style="display:flex;flex-direction:column;gap:20px">
        <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
          <div style="width:56px;height:56px;background:${career.iconBg};border-radius:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <i data-lucide="${career.icon}" style="color:${career.iconColor};width:28px;height:28px"></i>
          </div>
          <div style="flex:1">
            <div style="font-size:1.2rem;font-weight:800">${career.name}</div>
            <div style="font-size:.82rem;color:var(--text-muted);margin-bottom:6px">${career.category}</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              ${UI.badge(career.difficulty, UI.diffColor(career.difficulty))}
              ${UI.badge(career.demand + ' Demand', UI.demandColor(career.demand))}
              ${rec ? `<div class="match-badge">${rec.matchScore}% Match</div>` : ''}
            </div>
          </div>
        </div>
        <p style="font-size:.875rem;line-height:1.6">${career.description}</p>
        <div class="grid-2" style="gap:10px">
          <div style="background:var(--bg);border-radius:8px;padding:14px;text-align:center">
            <div style="font-size:1.1rem;font-weight:800">${UI.formatSalary(career.salaryMin)}–${UI.formatSalary(career.salaryMax)}</div>
            <div style="font-size:.75rem;color:var(--text-muted)">Avg Salary / year</div>
          </div>
          <div style="background:var(--bg);border-radius:8px;padding:14px;text-align:center">
            <div style="font-size:1.1rem;font-weight:800;color:var(--success)">${career.growth}</div>
            <div style="font-size:.75rem;color:var(--text-muted)">Job Growth Rate</div>
          </div>
        </div>
        <div>
          <div style="font-weight:700;font-size:.9rem;margin-bottom:10px">Required Skills</div>
          <div style="display:flex;flex-wrap:wrap;gap:8px">${career.requiredSkills.map(s => `<span class="skill-tag">${s}</span>`).join('')}</div>
        </div>
        ${courses.length ? `<div><div style="font-weight:700;font-size:.9rem;margin-bottom:10px">Top Courses</div>${courses.map(c => `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px;background:var(--bg);border-radius:8px;margin-bottom:6px"><div><div style="font-weight:600;font-size:.85rem">${c.name}</div><div style="font-size:.75rem;color:var(--text-muted)">${c.provider} · ${c.duration}</div></div><a href="${c.link}" target="_blank" class="btn btn-sm btn-outline">View</a></div>`).join('')}</div>` : ''}
        ${certs.length ? `<div><div style="font-weight:700;font-size:.9rem;margin-bottom:10px">Certifications</div>${certs.map(c => `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px;background:var(--bg);border-radius:8px;margin-bottom:6px"><div style="font-weight:600;font-size:.85rem">${c.name} <span style="font-size:.75rem;color:var(--text-muted)"> · ${c.provider}</span></div><a href="${c.link}" target="_blank" class="btn btn-sm btn-outline">View</a></div>`).join('')}</div>` : ''}
        ${projs.length ? `<div><div style="font-weight:700;font-size:.9rem;margin-bottom:10px">Recommended Projects</div><div class="grid-2" style="gap:10px">${projs.slice(0,4).map(p => UI.projectCard(p)).join('')}</div></div>` : ''}
      </div>`,
      `<button class="btn btn-secondary" onclick="UI.closeModal()">Close</button>
       <button class="btn btn-primary" onclick="UI.closeModal();showSkillGap(${careerId})"><i data-lucide="bar-chart-2"></i>Skill Gap</button>
       <button class="btn btn-outline" onclick="UI.closeModal();showRoadmap(${careerId})"><i data-lucide="map"></i>Roadmap</button>`
    );
    if (window.lucide) lucide.createIcons();
  };

  render();
};
