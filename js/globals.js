/* ============================================
   globals.js – Shared global functions
   Available on every page, no matter render order
   ============================================ */

// ─── Run AI Analysis ─────────────────────────
window.runAnalysis = function() {
  const session = Auth.getCurrentUser();
  if (!session) return;
  const btn = document.getElementById('run-analysis-btn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<div class="spinner" style="width:16px;height:16px;border-width:2px"></div> Analyzing...'; }

  setTimeout(() => {
    Store.updateUser(session.id, { analysisRun: true });
    UI.toast('AI career analysis completed! 🎯', 'success');
    Router.navigate('dashboard');
  }, 2000);
};

// ─── Show Career Detail Modal ─────────────────
window.showCareerDetail = function(careerId) {
  const career = DB.careers.find(c => c.id === careerId);
  if (!career) return;
  const session = Auth.getCurrentUser();
  const recs = session ? AIEngine.run(session.id) : [];
  const rec = recs.find(r => r.careerId === careerId);
  const courses = DB.courses.filter(c => career.requiredSkills.includes(c.skill)).slice(0, 4);
  const certs = DB.certifications.filter(c => c.careerId === careerId).slice(0, 3);
  const projs = DB.projects.filter(p => p.careerId === careerId).slice(0, 3);

  UI.modal(`${career.name} – Career Details`,
    `<div style="display:flex;flex-direction:column;gap:20px">
      <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
        <div style="width:56px;height:56px;background:${career.iconBg};border-radius:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <i data-lucide="${career.icon}" style="color:${career.iconColor};width:28px;height:28px"></i>
        </div>
        <div style="flex:1">
          <div style="font-size:1.15rem;font-weight:800">${career.name}</div>
          <div style="font-size:.82rem;color:var(--text-muted);margin-bottom:6px">${career.category}</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            ${UI.badge(career.difficulty, UI.diffColor(career.difficulty))}
            ${UI.badge(career.demand + ' Demand', UI.demandColor(career.demand))}
            ${rec ? `<div class="match-badge">${rec.matchScore}% Match</div>` : ''}
          </div>
        </div>
      </div>

      <p style="font-size:.875rem;line-height:1.6;color:var(--text-secondary)">${career.description}</p>

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
        <div style="display:flex;flex-wrap:wrap;gap:8px">
          ${career.requiredSkills.map(s => `<span class="skill-tag">${s}</span>`).join('')}
        </div>
      </div>

      ${career.optionalSkills && career.optionalSkills.length ? `
      <div>
        <div style="font-weight:700;font-size:.9rem;margin-bottom:10px">Good to Know</div>
        <div style="display:flex;flex-wrap:wrap;gap:8px">
          ${career.optionalSkills.map(s => `<span class="badge badge-muted">${s}</span>`).join('')}
        </div>
      </div>` : ''}

      ${rec ? `
      <div style="background:var(--primary-light);border-radius:8px;padding:14px">
        <div style="font-weight:700;color:var(--primary);margin-bottom:6px;font-size:.875rem">Why this matches you</div>
        <p style="font-size:.82rem;color:#3730a3;margin:0">${rec.whyRecommended}</p>
      </div>` : ''}

      ${courses.length ? `
      <div>
        <div style="font-weight:700;font-size:.9rem;margin-bottom:10px">Top Courses to Start</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${courses.map(c => `
          <div style="display:flex;justify-content:space-between;align-items:center;background:var(--bg);padding:10px 12px;border-radius:8px">
            <div>
              <div style="font-weight:600;font-size:.85rem">${c.name}</div>
              <div style="font-size:.75rem;color:var(--text-muted)">${c.provider} · ${c.duration} · ⭐ ${c.rating}</div>
            </div>
            <a href="${c.link}" target="_blank" class="btn btn-sm btn-outline" style="flex-shrink:0">View</a>
          </div>`).join('')}
        </div>
      </div>` : ''}

      ${certs.length ? `
      <div>
        <div style="font-weight:700;font-size:.9rem;margin-bottom:10px">Key Certifications</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${certs.map(c => `
          <div style="display:flex;justify-content:space-between;align-items:center;background:var(--bg);padding:10px 12px;border-radius:8px">
            <div>
              <div style="font-weight:600;font-size:.85rem">${c.name}</div>
              <div style="font-size:.75rem;color:var(--text-muted)">${c.provider} · Valid: ${c.validity}</div>
            </div>
            <a href="${c.link}" target="_blank" class="btn btn-sm btn-outline" style="flex-shrink:0">View</a>
          </div>`).join('')}
        </div>
      </div>` : ''}

      ${projs.length ? `
      <div>
        <div style="font-weight:700;font-size:.9rem;margin-bottom:10px">Recommended Projects</div>
        <div class="grid-2" style="gap:10px">
          ${projs.map(p => UI.projectCard(p)).join('')}
        </div>
      </div>` : ''}
    </div>`,
    `<button class="btn btn-secondary" onclick="UI.closeModal()">Close</button>
     <button class="btn btn-primary" onclick="UI.closeModal();showSkillGap(${careerId})"><i data-lucide="bar-chart-2"></i>Skill Gap</button>
     <button class="btn btn-outline" onclick="UI.closeModal();showRoadmap(${careerId})"><i data-lucide="map"></i>Roadmap</button>`
  );
  if (window.lucide) lucide.createIcons();
};

// ─── Show Skill Gap Modal ─────────────────────
window.showSkillGap = function(careerId) {
  const career = DB.careers.find(c => c.id === careerId);
  if (!career) return;
  const session = Auth.getCurrentUser();
  const userSkills = session ? Store.getUserSkills(session.id) : [];

  const requiredLevels = {
    Python:90, SQL:80, 'Machine Learning':85, 'Deep Learning':80,
    TensorFlow:75, PyTorch:75, MLOps:65, Git:70, JavaScript:80,
    React:80, 'Node.js':75, AWS:70, Docker:65, Kubernetes:60,
    Linux:70, Cybersecurity:80, 'Power BI':65, Statistics:75,
    Flutter:75, Kotlin:70, Figma:70, 'HTML/CSS':75, MongoDB:65,
    PostgreSQL:70, 'REST APIs':75, 'CI/CD':65, 'Computer Vision':75,
    NLP:75, 'Data Analysis':70, Tableau:65, 'User Research':70
  };

  const skills = career.requiredSkills.map(skill => {
    const userSkill = userSkills.find(s => s.name === skill);
    const userPct   = userSkill ? userSkill.proficiency : 0;
    const reqPct    = requiredLevels[skill] || 70;
    return { skill, userPct, reqPct };
  });

  const strongCount  = skills.filter(s => (s.reqPct - s.userPct) <= 5).length;
  const improveCount = skills.filter(s => (s.reqPct - s.userPct) > 5 && (s.reqPct - s.userPct) <= 25).length;
  const gapCount     = skills.filter(s => (s.reqPct - s.userPct) > 25).length;
  const overallMatch = Math.round((strongCount / skills.length) * 100);

  UI.modal(`Skill Gap Analysis – ${career.name}`,
    `<div style="display:flex;flex-direction:column;gap:16px">
      <!-- Summary Row -->
      <div class="grid-2" style="gap:10px">
        <div style="background:var(--bg);border-radius:8px;padding:14px;text-align:center">
          <div style="font-size:1.5rem;font-weight:800;color:var(--primary)">${overallMatch}%</div>
          <div style="font-size:.75rem;color:var(--text-muted)">Skill Match</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;padding:10px;background:var(--bg);border-radius:8px">
          <div style="display:flex;justify-content:space-between;font-size:.8rem">
            <span style="display:flex;align-items:center;gap:5px"><span style="width:8px;height:8px;background:var(--success);border-radius:50%;display:inline-block"></span>Strong</span>
            <strong>${strongCount}</strong>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:.8rem">
            <span style="display:flex;align-items:center;gap:5px"><span style="width:8px;height:8px;background:var(--warning);border-radius:50%;display:inline-block"></span>Improve</span>
            <strong>${improveCount}</strong>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:.8rem">
            <span style="display:flex;align-items:center;gap:5px"><span style="width:8px;height:8px;background:var(--danger);border-radius:50%;display:inline-block"></span>Gap</span>
            <strong>${gapCount}</strong>
          </div>
        </div>
      </div>

      <!-- Legend -->
      <div style="display:flex;gap:16px;font-size:.75rem;flex-wrap:wrap">
        <span style="display:flex;align-items:center;gap:5px"><span style="width:14px;height:4px;background:var(--primary);border-radius:999px;display:inline-block"></span>Your Level</span>
        <span style="display:flex;align-items:center;gap:5px"><span style="width:14px;height:4px;background:#e2e8f0;border-radius:999px;display:inline-block"></span>Required Level</span>
      </div>

      <!-- Skill Bars -->
      <div style="display:flex;flex-direction:column;gap:10px">
        ${skills.map(s => UI.skillGapBars(s.skill, s.userPct, s.reqPct)).join('')}
      </div>

      ${gapCount > 0 ? `
      <div style="background:#fef2f2;border-radius:8px;padding:12px;border-left:3px solid var(--danger)">
        <div style="font-weight:700;color:var(--danger);font-size:.85rem;margin-bottom:4px">Priority Skills to Build</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px">
          ${skills.filter(s => (s.reqPct - s.userPct) > 25).map(s => `<span class="badge badge-danger">${s.skill}</span>`).join('')}
        </div>
      </div>` : ''}
    </div>`,
    `<button class="btn btn-secondary" onclick="UI.closeModal()">Close</button>
     <button class="btn btn-primary" onclick="UI.closeModal();showRoadmap(${careerId})"><i data-lucide="map"></i>View Roadmap</button>
     <button class="btn btn-outline" onclick="UI.closeModal();Router.navigate('careers')"><i data-lucide="book-open"></i>Find Courses</button>`
  );
  if (window.lucide) lucide.createIcons();
};

// ─── Show Roadmap Modal ───────────────────────
window.showRoadmap = function(careerId) {
  const roadmap = DB.roadmaps[careerId] || DB.roadmaps[1];
  const session = Auth.getCurrentUser();
  const completedStages = session ? Store.getRoadmapProgress(session.id, careerId) : [];

  const stages = roadmap.stages.map(s => ({ ...s, completed: completedStages.includes(s.id) }));
  const completedCount = stages.filter(s => s.completed).length;
  const pct = Math.round((completedCount / stages.length) * 100);

  UI.modal(`Learning Roadmap – ${roadmap.title}`,
    `<div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;flex-wrap:wrap;gap:8px">
        <span style="font-size:.85rem;color:var(--text-secondary)"><strong>${completedCount}</strong> of ${stages.length} stages completed</span>
        <span class="badge badge-primary">${pct}% done</span>
      </div>
      ${UI.progressBar(pct, 'indigo')}
      <p style="font-size:.78rem;color:var(--text-muted);margin:10px 0 16px">Click a stage number to mark it complete / incomplete.</p>
      <div class="roadmap-container">
        ${stages.map((s, i) => UI.roadmapStage(s, i, i === stages.length - 1)).join('')}
      </div>
    </div>`,
    `<button class="btn btn-secondary" onclick="UI.closeModal()">Close</button>
     <button class="btn btn-primary" onclick="UI.closeModal();Router.navigate('careers')"><i data-lucide="book-open"></i>Find Courses</button>`
  );
  if (window.lucide) lucide.createIcons();

  window.toggleRoadmapStage = function(stageId) {
    if (!session) return;
    const completed = Store.getRoadmapProgress(session.id, careerId);
    const idx = completed.indexOf(stageId);
    if (idx !== -1) completed.splice(idx, 1); else completed.push(stageId);
    Store.setRoadmapProgress(session.id, careerId, completed);
    UI.toast(idx !== -1 ? 'Stage marked incomplete.' : 'Stage marked complete! ✅', idx !== -1 ? 'info' : 'success');
    showRoadmap(careerId);
  };
};

// ─── Format helpers ───────────────────────────
window.formatNumber = function(n) {
  if (n >= 10000000) return (n / 10000000).toFixed(1) + 'Cr';
  if (n >= 100000)   return (n / 100000).toFixed(0) + 'L';
  return n.toLocaleString();
};
