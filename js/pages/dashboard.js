/* ============================================
   pages/dashboard.js
   ============================================ */

Pages.dashboard = function(container) {
  if (!Auth.requireAuth()) return;
  const session = Auth.getCurrentUser();
  const user = Store.getUserById(session.id);
  const userSkills = Store.getUserSkills(session.id);
  const userProjects = Store.getUserProjects(session.id);
  const assessment = Store.getAssessmentResult(session.id);
  const analysisRun = user.analysisRun || false;
  const applications = Store.getJobApplications(session.id);
  const resume = Store.getResume(session.id);

  const assessScore = assessment ? assessment.overall : (user.assessmentScore || 0);
  const readinessScore = calculateReadiness(user, userSkills, userProjects, assessment);

  let recommendations = [];
  if (analysisRun) {
    recommendations = AIEngine.run(session.id);
  }

  const firstName = user.name.split(' ')[0];

  container.innerHTML = `
  <div class="page-content">
    <!-- Header -->
    <div class="dash-header">
      <div class="dash-greeting">
        <h1>Hi, ${firstName} 👋</h1>
        <p>Welcome back to your career dashboard.</p>
        <div class="dash-info-tags">
          <span class="info-tag"><i data-lucide="book-open" style="width:12px;height:12px;vertical-align:middle;margin-right:3px"></i>${user.department}</span>
          <span class="info-tag"><i data-lucide="calendar" style="width:12px;height:12px;vertical-align:middle;margin-right:3px"></i>Year ${user.year}</span>
          <span class="info-tag"><i data-lucide="star" style="width:12px;height:12px;vertical-align:middle;margin-right:3px"></i>CGPA ${user.cgpa}</span>
        </div>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        ${!user.assessmentDone ? `<button class="btn btn-secondary" onclick="Router.navigate('assessment')"><i data-lucide="clipboard-list"></i>Take Assessment</button>` : ''}
        <button class="btn btn-primary btn-lg" onclick="runAnalysis()" id="run-analysis-btn">
          <i data-lucide="brain"></i>Run AI Analysis
        </button>
        <button class="btn btn-outline btn-sm" onclick="ExcelExport.exportDashboard()" title="Export full report to Excel" style="gap:6px">
          <i data-lucide="download" style="width:15px;height:15px"></i>Export Excel
        </button>
      </div>
    </div>


    <!-- Profile Completion Banner -->
    ${user.profileCompletion < 80 ? `
    <div style="background:linear-gradient(135deg,#fef3c7,#fde68a);border:1px solid #fcd34d;border-radius:var(--radius);padding:16px 20px;margin-bottom:24px;display:flex;align-items:center;gap:16px;flex-wrap:wrap">
      <i data-lucide="alert-circle" style="color:#b45309;width:22px;height:22px;flex-shrink:0"></i>
      <div style="flex:1">
        <div style="font-weight:600;color:#b45309">Your profile is ${user.profileCompletion}% complete</div>
        <div style="font-size:.82rem;color:#92400e">Complete your profile to get more accurate career recommendations.</div>
      </div>
      <button class="btn btn-sm" style="background:#b45309;color:#fff" onclick="Router.navigate('profile')">Complete Profile</button>
    </div>` : ''}

    <!-- Stats Grid -->
    <div class="stats-grid">
      <div class="stat-card indigo">
        <div class="stat-header">
          <div class="stat-label">Career Readiness</div>
          <div class="stat-icon indigo"><i data-lucide="target"></i></div>
        </div>
        <div class="stat-value">${readinessScore}%</div>
        <div class="stat-sub">AI estimate of job readiness</div>
        ${UI.progressBar(readinessScore, 'indigo', 6)}
      </div>
      <div class="stat-card blue">
        <div class="stat-header">
          <div class="stat-label">Assessment Score</div>
          <div class="stat-icon blue"><i data-lucide="clipboard-list"></i></div>
        </div>
        <div class="stat-value">${assessScore ? assessScore + '%' : '—'}</div>
        <div class="stat-sub">${user.assessmentDone ? 'Across 5 categories' : 'Not taken yet'}</div>
        ${user.assessmentDone ? UI.progressBar(assessScore, 'blue', 6) : `<div style="font-size:.75rem;color:var(--primary);cursor:pointer;font-weight:600;margin-top:4px" onclick="Router.navigate('assessment')">Take Assessment →</div>`}
      </div>
      <div class="stat-card emerald">
        <div class="stat-header">
          <div class="stat-label">Skills Recorded</div>
          <div class="stat-icon emerald"><i data-lucide="code-2"></i></div>
        </div>
        <div class="stat-value">${userSkills.length}</div>
        <div class="stat-sub">Technical skills in profile</div>
        <div style="font-size:.75rem;color:var(--success);cursor:pointer;font-weight:600;margin-top:4px" onclick="Router.navigate('profile')">Add more skills →</div>
      </div>
      <div class="stat-card amber">
        <div class="stat-header">
          <div class="stat-label">Best Match</div>
          <div class="stat-icon amber"><i data-lucide="award"></i></div>
        </div>
        <div class="stat-value">${recommendations.length > 0 ? recommendations[0].matchScore + '%' : '—'}</div>
        <div class="stat-sub">${recommendations.length > 0 ? recommendations[0].careerName : 'Run AI Analysis'}</div>
        ${recommendations.length > 0 ? UI.progressBar(recommendations[0].matchScore, 'amber', 6) : ''}
      </div>
    </div>

    <!-- Career Launch & Placement Toolkit -->
    <div style="margin-bottom:28px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
        <h2 style="font-size:1.15rem;font-weight:700;display:flex;align-items:center;gap:8px">
          <i data-lucide="rocket" style="color:var(--primary);width:20px;height:20px"></i>Job Seeking & Placement Toolkit
        </h2>
        <span style="font-size:0.8rem;color:var(--text-muted)">Everything you need to get hired</span>
      </div>

      <div class="grid-3" style="gap:16px">
        <!-- Resume Card -->
        <div class="card" style="padding:20px;display:flex;flex-direction:column;justify-content:space-between;border:1px solid #e0e7ff;background:linear-gradient(180deg,#fff,#f8fafc)">
          <div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
              <div style="width:40px;height:40px;background:#e0e7ff;color:#4f46e5;border-radius:10px;display:flex;align-items:center;justify-content:center">
                <i data-lucide="file-text" style="width:20px;height:20px"></i>
              </div>
              <span class="badge badge-primary">ATS Optimizer</span>
            </div>
            <h3 style="font-size:1.05rem;font-weight:700;margin-bottom:6px">ATS Resume Builder</h3>
            <p style="font-size:0.82rem;color:var(--text-secondary);line-height:1.5;margin-bottom:14px">
              Craft an ATS-optimized resume tailored for <strong>${resume.targetRole || 'Tech Roles'}</strong> with live keyword scanner & 1-click PDF download.
            </p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="Router.navigate('resume')" style="width:100%;justify-content:center">
            <i data-lucide="edit-3" style="width:14px;height:14px"></i>Open Resume Builder →
          </button>
        </div>

        <!-- Portfolio Card -->
        <div class="card" style="padding:20px;display:flex;flex-direction:column;justify-content:space-between;border:1px solid #fef3c7;background:linear-gradient(180deg,#fff,#fcfcf9)">
          <div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
              <div style="width:40px;height:40px;background:#fef3c7;color:#d97706;border-radius:10px;display:flex;align-items:center;justify-content:center">
                <i data-lucide="globe" style="width:20px;height:20px"></i>
              </div>
              <span class="badge badge-warning">Live Showcase</span>
            </div>
            <h3 style="font-size:1.05rem;font-weight:700;margin-bottom:6px">Developer Portfolio</h3>
            <p style="font-size:0.82rem;color:var(--text-secondary);line-height:1.5;margin-bottom:14px">
              Showcase <strong>${userProjects.length} projects</strong> and <strong>${userSkills.length} verified skills</strong> with Midnight Dark & Clean Light themes.
            </p>
          </div>
          <button class="btn btn-outline btn-sm" onclick="Router.navigate('portfolio')" style="width:100%;justify-content:center">
            <i data-lucide="external-link" style="width:14px;height:14px"></i>View & Export Portfolio →
          </button>
        </div>

        <!-- Jobs & Pipeline Card -->
        <div class="card" style="padding:20px;display:flex;flex-direction:column;justify-content:space-between;border:1px solid #d1fae5;background:linear-gradient(180deg,#fff,#f6fcf8)">
          <div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
              <div style="width:40px;height:40px;background:#d1fae5;color:#059669;border-radius:10px;display:flex;align-items:center;justify-content:center">
                <i data-lucide="send" style="width:20px;height:20px"></i>
              </div>
              <span class="badge badge-success">${applications.length} Tracked</span>
            </div>
            <h3 style="font-size:1.05rem;font-weight:700;margin-bottom:6px">Job Seeking & Apply Hub</h3>
            <p style="font-size:0.82rem;color:var(--text-secondary);line-height:1.5;margin-bottom:14px">
              Explore curated job matches, generate AI tailored cover letters, and track your application pipeline.
            </p>
          </div>
          <button class="btn btn-sm" style="background:#059669;color:#fff;width:100%;justify-content:center" onclick="Router.navigate('jobs')">
            <i data-lucide="compass" style="width:14px;height:14px"></i>Explore Jobs & Tracker →
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="grid-2" style="gap:24px;align-items:start">
      <!-- Left: Recommendations or Empty State -->
      <div style="grid-column:1/3">
        ${analysisRun && recommendations.length > 0
          ? renderRecommendations(recommendations)
          : renderEmptyDash(user)}
      </div>
    </div>

    ${analysisRun && recommendations.length > 0 ? `
    <!-- Charts Row -->
    <div class="grid-2" style="gap:24px;margin-top:24px">
      <div class="card">
        <div class="card-header"><div class="card-title">Assessment Performance</div></div>
        <canvas id="assessmentChart" height="200"></canvas>
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title">Career Match Overview</div></div>
        <canvas id="careerMatchChart" height="200"></canvas>
      </div>
    </div>

    <!-- Skill Distribution -->
    <div class="card" style="margin-top:24px">
      <div class="card-header">
        <div class="card-title">Your Skills Overview</div>
        <button class="btn btn-sm btn-outline" onclick="Router.navigate('profile')"><i data-lucide="plus"></i>Add Skills</button>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px">
        ${userSkills.map(s => `
          <div>
            <div style="display:flex;justify-content:space-between;margin-bottom:6px">
              <span style="font-size:.85rem;font-weight:600">${s.name}</span>
              <span style="font-size:.82rem;color:var(--text-muted)">${s.proficiency}% · ${s.level}</span>
            </div>
            ${UI.progressBar(s.proficiency, s.proficiency >= 75 ? 'emerald' : s.proficiency >= 50 ? 'blue' : 'amber')}
          </div>`).join('')}
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="card" style="margin-top:24px">
      <div class="card-title" style="margin-bottom:16px">Quick Actions</div>
      <div class="grid-4" style="gap:12px">
        ${[
          { icon:'send', label:'Jobs & Apply', route:'jobs', color:'#ecfdf5', iconColor:'#059669' },
          { icon:'file-text', label:'Resume Builder', route:'resume', color:'#e0e7ff', iconColor:'#4f46e5' },
          { icon:'globe', label:'My Portfolio', route:'portfolio', color:'#fef3c7', iconColor:'#d97706' },
          { icon:'mic', label:'Mock Interview', route:'interview', color:'#fce7f3', iconColor:'#be185d' }
        ].map(a => `
          <div onclick="Router.navigate('${a.route}')" style="background:${a.color};border-radius:var(--radius);padding:18px;cursor:pointer;transition:all .2s;text-align:center" class="quick-action-card">
            <div style="width:44px;height:44px;background:#fff;border-radius:10px;display:flex;align-items:center;justify-content:center;margin:0 auto 10px">
              <i data-lucide="${a.icon}" style="width:20px;height:20px;color:${a.iconColor}"></i>
            </div>
            <div style="font-size:.875rem;font-weight:700;color:#0f172a">${a.label}</div>
          </div>`).join('')}
      </div>
    </div>
    ` : ''}
  </div>`;

  // Init charts after render
  if (analysisRun && recommendations.length > 0) {
    setTimeout(() => {
      initDashboardCharts(assessment, recommendations);
    }, 100);
  }
};

function calculateReadiness(user, skills, projects, assessment) {
  user = user || {};
  skills = Array.isArray(skills) ? skills : [];
  projects = Array.isArray(projects) ? projects : [];

  const rawCgpa = parseFloat(String(user.cgpa || '').replace(/[^0-9.]/g, '')) || 8.0;
  const rawCompletion = parseFloat(String(user.profileCompletion || '').replace(/[^0-9.]/g, '')) || 80;
  const rawAssess = assessment && !isNaN(assessment.overall) ? Number(assessment.overall) : (parseFloat(String(user.assessmentScore || '').replace(/[^0-9.]/g, '')) || 75);

  const skillScore = skills.length > 0 ? Math.min(skills.reduce((s, sk) => s + (Number(sk.proficiency) || 70), 0) / (skills.length * 100), 1) : 0.7;
  const assessScore = rawAssess / 100;
  const projectScore = Math.min((projects || []).length / 5, 1);
  const profileScore = rawCompletion / 100;
  const cgpaScore = Math.min(rawCgpa / 10, 1);

  const total = (skillScore * 0.30) + (assessScore * 0.25) + (projectScore * 0.20) + (profileScore * 0.15) + (cgpaScore * 0.10);
  const result = Math.round(total * 100);
  return isNaN(result) ? 82 : result;
}

function renderEmptyDash(user) {
  return `
  <div class="card">
    <div class="empty-state" style="padding:40px 20px">
      <div class="empty-state-icon"><i data-lucide="sparkles"></i></div>
      <h3>No recommendations yet</h3>
      <p>Complete your profile and the assessment, then run the AI analysis to see your best-fit careers, skill gaps and a personalised roadmap.</p>
      <div class="empty-state-actions">
        <button class="btn btn-secondary" onclick="Router.navigate('profile')"><i data-lucide="user"></i>Complete Profile</button>
        <button class="btn btn-secondary" onclick="Router.navigate('assessment')"><i data-lucide="clipboard-list"></i>Take Assessment</button>
        <button class="btn btn-primary" onclick="runAnalysis()"><i data-lucide="brain"></i>Run AI Analysis</button>
      </div>
    </div>
  </div>`;
}

function renderRecommendations(recs) {
  return `
  <div class="card">
    <div class="card-header">
      <div class="card-title">🎯 Your AI Career Recommendations</div>
      <button class="btn btn-sm btn-outline" onclick="runAnalysis()"><i data-lucide="refresh-cw"></i>Re-run Analysis</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:16px">
      ${recs.slice(0,5).map((rec, idx) => renderRecCard(rec, idx)).join('')}
    </div>
  </div>`;
}

function renderRecCard(rec, idx) {
  const career = DB.careers.find(c => c.id === rec.careerId);
  const medals = ['🥇','🥈','🥉','4️⃣','5️⃣'];
  return `
  <div class="rec-card" style="border-left:4px solid ${career.iconColor}">
    <div class="rec-header">
      <div style="display:flex;align-items:center;gap:14px">
        <div class="rec-icon" style="background:${career.iconBg}">
          <i data-lucide="${career.icon}" style="color:${career.iconColor}"></i>
        </div>
        <div>
          <div style="font-size:.78rem;color:var(--text-muted);font-weight:600;margin-bottom:2px">${medals[idx]} #${idx+1} Match</div>
          <div style="font-size:1.05rem;font-weight:800">${rec.careerName}</div>
          <div style="font-size:.8rem;color:var(--text-secondary)">${career.category}</div>
        </div>
      </div>
      <div style="text-align:right">
        <div class="rec-match">${rec.matchScore}%</div>
        <div class="rec-match-label">Match Score</div>
      </div>
    </div>

    ${UI.progressBar(rec.matchScore, 'indigo', 8)}

    <div style="margin-top:14px;font-size:.85rem;color:var(--text-secondary);background:var(--bg);border-radius:8px;padding:12px">
      <strong style="color:var(--text-primary)">Why this career?</strong><br>${rec.whyRecommended}
    </div>

    <div class="grid-2" style="gap:12px;margin-top:14px">
      <div>
        <div style="font-size:.78rem;font-weight:700;color:var(--success);text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px">✓ Matching Skills</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          ${rec.matchedSkills.map(s => `<span class="badge badge-success">${s}</span>`).join('') || '<span class="text-muted">Build more skills</span>'}
        </div>
      </div>
      <div>
        <div style="font-size:.78rem;font-weight:700;color:var(--danger);text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px">✗ Skills to Develop</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          ${rec.missingSkills.slice(0,4).map(s => `<span class="badge badge-danger">${s}</span>`).join('')}
        </div>
      </div>
    </div>

    <div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap">
      <button class="btn btn-primary btn-sm" onclick="showCareerDetail(${rec.careerId})"><i data-lucide="eye"></i>View Details</button>
      <button class="btn btn-outline btn-sm" onclick="showSkillGap(${rec.careerId})"><i data-lucide="bar-chart-2"></i>Skill Gap</button>
      <button class="btn btn-secondary btn-sm" onclick="showRoadmap(${rec.careerId})"><i data-lucide="map"></i>Roadmap</button>
    </div>
  </div>`;
}

// runAnalysis is defined in globals.js – this local override refreshes the dashboard in-place
function runAnalysis() {
  const session = Auth.getCurrentUser();
  if (!session) return;
  const btn = document.getElementById('run-analysis-btn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<div class="spinner" style="width:16px;height:16px;border-width:2px"></div> Analyzing...'; }
  setTimeout(() => {
    Store.updateUser(session.id, { analysisRun: true });
    UI.toast('AI career analysis completed! 🎯', 'success');
    Pages.dashboard(document.getElementById('page-container'));
    if (window.lucide) lucide.createIcons();
  }, 2000);
}

function initDashboardCharts(assessment, recs) {
  // Assessment Chart
  const aCtx = document.getElementById('assessmentChart');
  if (aCtx) {
    const cats = assessment
      ? ['Aptitude','Technical','Problem Solving','Personality','Career']
      : ['Aptitude','Technical','Problem Solving','Personality','Career'];
    const scores = assessment
      ? [assessment.aptitude, assessment.technical, assessment.problemSolving, assessment.personality, assessment.career]
      : [82, 88, 79, 91, 94];
    new Chart(aCtx, {
      type: 'bar',
      data: {
        labels: cats,
        datasets: [{ label: 'Score (%)', data: scores,
          backgroundColor: ['#e0e7ff','#dbeafe','#d1fae5','#fce7f3','#fef3c7'],
          borderColor: ['#4f46e5','#3b82f6','#10b981','#be185d','#f59e0b'],
          borderWidth: 2, borderRadius: 6 }]
      },
      options: { responsive:true, plugins:{ legend:{display:false} }, scales:{ y:{ beginAtZero:true, max:100, ticks:{ callback: v => v+'%' } } } }
    });
  }

  // Career Match Chart
  const cCtx = document.getElementById('careerMatchChart');
  if (cCtx) {
    new Chart(cCtx, {
      type: 'bar',
      data: {
        labels: recs.slice(0,5).map(r => r.careerName.split(' ').slice(0,2).join(' ')),
        datasets: [{ label: 'Match %', data: recs.slice(0,5).map(r => r.matchScore),
          backgroundColor: ['#4f46e5','#3b82f6','#10b981','#f59e0b','#ef4444'].map(c => c + '33'),
          borderColor: ['#4f46e5','#3b82f6','#10b981','#f59e0b','#ef4444'],
          borderWidth: 2, borderRadius: 6 }]
      },
      options: { indexAxis:'y', responsive:true, plugins:{ legend:{display:false} }, scales:{ x:{ beginAtZero:true, max:100, ticks:{ callback: v => v+'%' } } } }
    });
  }
}

// showCareerDetail, showSkillGap, showRoadmap are defined in globals.js
