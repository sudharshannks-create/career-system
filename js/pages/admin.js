/* ============================================
   pages/admin.js – Admin Dashboard
   ============================================ */

Pages.admin = function(container) {
  if (!Auth.requireAdmin()) return;

  let activeSection = 'dashboard';

  const navItems = [
    { id:'dashboard',       label:'Dashboard',       icon:'layout-dashboard' },
    { id:'students',        label:'Students',         icon:'users' },
    { id:'careers',        label:'Careers',          icon:'briefcase' },
    { id:'skills',          label:'Skills',           icon:'code-2' },
    { id:'questions',       label:'Questions',        icon:'help-circle' },
    { id:'courses',         label:'Courses',          icon:'book-open' },
    { id:'projects',        label:'Projects',         icon:'folder' },
    { id:'certifications',  label:'Certifications',   icon:'award' },
    { id:'reports',         label:'Reports',          icon:'bar-chart-2' },
    { id:'settings',        label:'Settings',         icon:'settings' }
  ];

  function render() {
    const users = Store.getUsers().filter(u => u.role === 'student');
    container.innerHTML = `
    <div class="admin-layout">
      <div class="admin-sidebar">
        <div class="admin-sidebar-brand">
          <i data-lucide="shield" style="width:16px;height:16px;vertical-align:middle;margin-right:6px"></i>
          Admin Panel
        </div>
        ${navItems.map(n => `
        <div class="admin-nav-item ${activeSection===n.id?'active':''}" onclick="adminNav('${n.id}')">
          <i data-lucide="${n.icon}"></i>${n.label}
        </div>`).join('')}
        <div style="flex:1"></div>
        <div class="admin-nav-item" onclick="Auth.logout();Router.navigate('login')">
          <i data-lucide="log-out"></i>Logout
        </div>
      </div>
      <div class="admin-content" id="admin-content">
        ${renderSection(activeSection, users)}
      </div>
    </div>`;
    if (window.lucide) lucide.createIcons();
  }

  function renderSection(section, students) {
    switch(section) {
      case 'dashboard':     return renderAdminDash(students);
      case 'students':      return renderStudents(students);
      case 'careers':       return renderAdminCareers();
      case 'skills':        return renderAdminSkills();
      case 'questions':     return renderAdminQuestions();
      case 'courses':       return renderAdminCourses();
      case 'projects':      return renderAdminProjects();
      case 'certifications':return renderAdminCerts();
      case 'reports':       return renderAdminReports(students);
      case 'settings':      return renderAdminSettings();
      default:              return renderAdminDash(students);
    }
  }

  function renderAdminDash(students) {
    const totalStudents = students.length;
    const completedAssessments = students.filter(s => s.assessmentDone).length;
    const avgAssessment = students.length > 0 ? Math.round(students.reduce((a, s) => a + (s.assessmentScore || 0), 0) / students.length) : 0;
    const avgReadiness = 78;

    return `
    <div>
      <div style="margin-bottom:24px">
        <h2 style="font-size:1.5rem">Admin Dashboard</h2>
        <p style="color:var(--text-muted)">System overview and student analytics</p>
      </div>

      <div class="admin-stat-grid">
        ${[
          { label:'Total Students', val: totalStudents, icon:'users', color:'indigo' },
          { label:'Assessments Done', val: completedAssessments, icon:'clipboard-list', color:'blue' },
          { label:'Career Recs', val: students.filter(s => s.analysisRun).length, icon:'target', color:'emerald' },
          { label:'Avg Assessment', val: avgAssessment + '%', icon:'bar-chart', color:'amber' },
          { label:'Avg Readiness', val: avgReadiness + '%', icon:'trending-up', color:'indigo' }
        ].map(s => `
        <div class="admin-stat">
          <div class="stat-icon ${s.color}" style="margin:0 auto 8px"><i data-lucide="${s.icon}" style="width:18px;height:18px"></i></div>
          <div class="admin-stat-val">${s.val}</div>
          <div class="admin-stat-label">${s.label}</div>
        </div>`).join('')}
      </div>

      <div class="grid-2" style="gap:20px;margin-bottom:20px">
        <div class="card">
          <div class="card-title" style="margin-bottom:16px">Student Overview</div>
          <canvas id="admin-dept-chart" height="220"></canvas>
        </div>
        <div class="card">
          <div class="card-title" style="margin-bottom:16px">Assessment Score Distribution</div>
          <canvas id="admin-score-chart" height="220"></canvas>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title">Recent Students</div>
          <button class="btn btn-sm btn-outline" onclick="adminNav('students')">View All</button>
        </div>
        ${renderStudentTable(students.slice(0, 5))}
      </div>
    </div>`;
  }

  function renderStudentTable(students) {
    return `
    <div class="table-wrapper">
      <table>
        <thead><tr>
          <th>Name</th><th>Department</th><th>Year</th><th>CGPA</th><th>Assessment</th><th>Readiness</th><th>Actions</th>
        </tr></thead>
        <tbody>
          ${students.map(s => `<tr>
            <td><div style="display:flex;align-items:center;gap:8px"><div class="user-avatar" style="width:30px;height:30px;font-size:.7rem;flex-shrink:0">${s.avatar||s.name[0]}</div><div><div style="font-weight:600;font-size:.85rem">${s.name}</div><div style="font-size:.72rem;color:var(--text-muted)">${s.email}</div></div></div></td>
            <td style="font-size:.82rem">${s.department}</td>
            <td style="font-size:.82rem">Year ${s.year}</td>
            <td>${UI.badge(s.cgpa, s.cgpa >= 8 ? 'success' : s.cgpa >= 6 ? 'warning' : 'danger')}</td>
            <td>${s.assessmentDone ? UI.badge(s.assessmentScore + '%', 'success') : UI.badge('Pending', 'muted')}</td>
            <td><div style="display:flex;align-items:center;gap:8px"><span style="font-size:.82rem;font-weight:600">${s.profileCompletion}%</span>${UI.progressBar(s.profileCompletion,'indigo',4)}</div></td>
            <td><div style="display:flex;gap:6px">
              <button class="btn btn-ghost btn-sm" onclick="viewStudent(${s.id})" title="View"><i data-lucide="eye" style="width:14px;height:14px"></i></button>
              <button class="btn btn-ghost btn-sm" style="color:var(--danger)" onclick="deleteStudent(${s.id})" title="Delete"><i data-lucide="trash-2" style="width:14px;height:14px"></i></button>
            </div></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
  }

  function renderStudents(students) {
    return `
    <div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px">
        <h2 style="font-size:1.35rem">Student Management</h2>
        <span class="badge badge-primary">${students.length} students</span>
      </div>
      <div class="search-filter-bar" style="margin-bottom:20px">
        <div class="search-input-wrapper">
          <i data-lucide="search"></i>
          <input class="form-input" placeholder="Search students..." oninput="adminStudentSearch(this.value)" />
        </div>
        <select class="filter-select" onchange="adminStudentFilterYear(this.value)">
          <option value="">All Years</option>
          <option>Year 1</option><option>Year 2</option><option>Year 3</option><option>Year 4</option>
        </select>
        <select class="filter-select" onchange="adminStudentFilterAssess(this.value)">
          <option value="">All Status</option>
          <option value="done">Assessment Done</option>
          <option value="pending">Assessment Pending</option>
        </select>
      </div>
      <div class="card" id="student-table-wrapper">
        ${renderStudentTable(students)}
      </div>
    </div>`;
  }

  function renderAdminCareers() {
    return `
    <div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px">
        <h2 style="font-size:1.35rem">Career Management</h2>
        <button class="btn btn-primary btn-sm" onclick="showAddCareerModal()"><i data-lucide="plus"></i>Add Career</button>
      </div>
      <div class="card">
        <div class="table-wrapper">
          <table>
            <thead><tr><th>Career</th><th>Category</th><th>Difficulty</th><th>Demand</th><th>Salary Range</th><th>Actions</th></tr></thead>
            <tbody>
              ${DB.careers.map(c => `<tr>
                <td><div style="display:flex;align-items:center;gap:10px">
                  <div style="width:32px;height:32px;background:${c.iconBg};border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
                    <i data-lucide="${c.icon}" style="color:${c.iconColor};width:15px;height:15px"></i>
                  </div>
                  <div style="font-weight:600;font-size:.875rem">${c.name}</div>
                </div></td>
                <td><span class="badge badge-primary">${c.category}</span></td>
                <td>${UI.badge(c.difficulty, UI.diffColor(c.difficulty))}</td>
                <td>${UI.badge(c.demand, UI.demandColor(c.demand))}</td>
                <td style="font-size:.82rem">${UI.formatSalary(c.salaryMin)}–${UI.formatSalary(c.salaryMax)}</td>
                <td><div style="display:flex;gap:6px">
                  <button class="btn btn-ghost btn-sm"><i data-lucide="edit" style="width:14px;height:14px"></i></button>
                  <button class="btn btn-ghost btn-sm" style="color:var(--danger)"><i data-lucide="trash-2" style="width:14px;height:14px"></i></button>
                </div></td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
  }

  function renderAdminSkills() {
    return `
    <div>
      <div style="display:flex;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px">
        <h2 style="font-size:1.35rem">Skill Management</h2>
        <button class="btn btn-primary btn-sm" onclick="UI.toast('Add skill form coming soon!','info')"><i data-lucide="plus"></i>Add Skill</button>
      </div>
      <div class="card">
        <div class="table-wrapper">
          <table>
            <thead><tr><th>Skill Name</th><th>Category</th><th>Actions</th></tr></thead>
            <tbody>${DB.skills.map(s => `<tr>
              <td style="font-weight:600;font-size:.875rem">${s.name}</td>
              <td><span class="badge badge-info">${s.category}</span></td>
              <td><div style="display:flex;gap:6px">
                <button class="btn btn-ghost btn-sm"><i data-lucide="edit" style="width:14px;height:14px"></i></button>
                <button class="btn btn-ghost btn-sm" style="color:var(--danger)"><i data-lucide="trash-2" style="width:14px;height:14px"></i></button>
              </div></td>
            </tr>`).join('')}</tbody>
          </table>
        </div>
      </div>
    </div>`;
  }

  function renderAdminQuestions() {
    return `
    <div>
      <div style="display:flex;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px">
        <h2 style="font-size:1.35rem">Question Bank</h2>
        <button class="btn btn-primary btn-sm" onclick="UI.toast('Add question form coming soon!','info')"><i data-lucide="plus"></i>Add Question</button>
      </div>
      <div class="card">
        <div class="table-wrapper">
          <table>
            <thead><tr><th>#</th><th>Question</th><th>Category</th><th>Actions</th></tr></thead>
            <tbody>${DB.questions.map((q, i) => `<tr>
              <td style="font-size:.78rem;color:var(--text-muted)">${i+1}</td>
              <td style="font-size:.82rem;max-width:300px">${q.q}</td>
              <td><span class="badge badge-primary">${q.category}</span></td>
              <td><div style="display:flex;gap:6px">
                <button class="btn btn-ghost btn-sm"><i data-lucide="edit" style="width:14px;height:14px"></i></button>
                <button class="btn btn-ghost btn-sm" style="color:var(--danger)"><i data-lucide="trash-2" style="width:14px;height:14px"></i></button>
              </div></td>
            </tr>`).join('')}</tbody>
          </table>
        </div>
      </div>
    </div>`;
  }

  function renderAdminCourses() {
    return `
    <div>
      <div style="display:flex;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px">
        <h2 style="font-size:1.35rem">Course Management</h2>
        <button class="btn btn-primary btn-sm" onclick="UI.toast('Add course form coming soon!','info')"><i data-lucide="plus"></i>Add Course</button>
      </div>
      <div class="card">
        <div class="table-wrapper">
          <table>
            <thead><tr><th>Course</th><th>Provider</th><th>Skill</th><th>Difficulty</th><th>Duration</th><th>Free?</th><th>Actions</th></tr></thead>
            <tbody>${DB.courses.map(c => `<tr>
              <td style="font-weight:600;font-size:.85rem">${c.name}</td>
              <td style="font-size:.82rem">${c.provider}</td>
              <td><span class="badge badge-info">${c.skill}</span></td>
              <td>${UI.badge(c.difficulty, UI.diffColor(c.difficulty))}</td>
              <td style="font-size:.82rem">${c.duration}</td>
              <td>${c.free ? UI.badge('Free','success') : UI.badge('Paid','muted')}</td>
              <td><div style="display:flex;gap:6px">
                <button class="btn btn-ghost btn-sm"><i data-lucide="edit" style="width:14px;height:14px"></i></button>
                <button class="btn btn-ghost btn-sm" style="color:var(--danger)"><i data-lucide="trash-2" style="width:14px;height:14px"></i></button>
              </div></td>
            </tr>`).join('')}</tbody>
          </table>
        </div>
      </div>
    </div>`;
  }

  function renderAdminProjects() {
    return `
    <div>
      <div style="display:flex;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px">
        <h2 style="font-size:1.35rem">Project Bank</h2>
        <button class="btn btn-primary btn-sm"><i data-lucide="plus"></i>Add Project</button>
      </div>
      <div class="grid-3" style="gap:14px">
        ${DB.projects.map(p => UI.projectCard(p)).join('')}
      </div>
    </div>`;
  }

  function renderAdminCerts() {
    return `
    <div>
      <div style="display:flex;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px">
        <h2 style="font-size:1.35rem">Certification Management</h2>
        <button class="btn btn-primary btn-sm"><i data-lucide="plus"></i>Add Certification</button>
      </div>
      <div class="grid-2" style="gap:14px">
        ${DB.certifications.map(c => UI.certCard(c)).join('')}
      </div>
    </div>`;
  }

  function renderAdminReports(students) {
    return `
    <div>
      <h2 style="font-size:1.35rem;margin-bottom:20px">Analytics & Reports</h2>
      <div class="grid-2" style="gap:20px;margin-bottom:20px">
        <div class="card">
          <div class="card-title" style="margin-bottom:16px">Top Career Preferences</div>
          <canvas id="career-pref-chart" height="220"></canvas>
        </div>
        <div class="card">
          <div class="card-title" style="margin-bottom:16px">Skill Distribution</div>
          <canvas id="skill-dist-chart" height="220"></canvas>
        </div>
      </div>
      <div class="card">
        <div class="card-title" style="margin-bottom:16px">System Statistics</div>
        <div class="grid-4" style="gap:14px">
          ${[
            { label:'Total Users', val: Store.getUsers().length },
            { label:'Total Skills', val: DB.skills.length },
            { label:'Total Careers', val: DB.careers.length },
            { label:'Total Courses', val: DB.courses.length },
            { label:'Total Projects', val: DB.projects.length },
            { label:'Total Certs', val: DB.certifications.length },
            { label:'Ass. Questions', val: DB.questions.length },
            { label:'Interview Sets', val: Object.keys(DB.interviewQuestions).length }
          ].map(s => `<div class="admin-stat"><div class="admin-stat-val">${s.val}</div><div class="admin-stat-label">${s.label}</div></div>`).join('')}
        </div>
      </div>
    </div>`;
  }

  function renderAdminSettings() {
    return `
    <div>
      <h2 style="font-size:1.35rem;margin-bottom:20px">System Settings</h2>
      <div class="grid-2" style="gap:20px">
        <div class="card">
          <div class="card-title" style="margin-bottom:16px">AI Configuration</div>
          <div class="form-group"><label class="form-label">AI Provider</label>
            <select class="form-select"><option>Rule-based Engine (Demo)</option><option>OpenAI GPT-4</option><option>Google Gemini</option><option>Anthropic Claude</option></select>
          </div>
          <div class="form-group"><label class="form-label">API Key</label>
            <input class="form-input" type="password" placeholder="Enter your API key to enable LLM" /></div>
          <button class="btn btn-primary" onclick="UI.toast('Settings saved!','success')"><i data-lucide="save"></i>Save Settings</button>
        </div>
        <div class="card">
          <div class="card-title" style="margin-bottom:16px">Application Settings</div>
          <div class="form-group"><label class="form-label">App Name</label><input class="form-input" value="NextStep AI" /></div>
          <div class="form-group"><label class="form-label">Tagline</label><input class="form-input" value="Your AI-powered path to the right career." /></div>
          <div class="form-group">
            <div class="form-check">
              <input type="checkbox" id="allow-reg" checked />
              <label for="allow-reg">Allow new registrations</label>
            </div>
          </div>
          <button class="btn btn-primary" onclick="UI.toast('Settings saved!','success')"><i data-lucide="save"></i>Save Settings</button>
        </div>
        <div class="card">
          <div class="card-title" style="margin-bottom:12px" style="color:var(--danger)">Danger Zone</div>
          <p style="font-size:.85rem;margin-bottom:12px">These actions cannot be undone. Be careful!</p>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <button class="btn btn-danger btn-sm" onclick="if(confirm('Reset all student data?')){localStorage.removeItem('nxt_initialized');Store.init();UI.toast('Data reset.','info')}">
              <i data-lucide="refresh-cw"></i>Reset Student Data
            </button>
            <button class="btn btn-secondary btn-sm" onclick="UI.toast('Export coming soon!','info')">
              <i data-lucide="download"></i>Export Data
            </button>
          </div>
        </div>
      </div>
    </div>`;
  }

  // ─── Global functions ─────────────────────
  window.adminNav = function(section) {
    activeSection = section;
    const users = Store.getUsers().filter(u => u.role === 'student');
    document.querySelectorAll('.admin-nav-item').forEach((el, i) => {
      el.classList.toggle('active', navItems[i] && navItems[i].id === section);
    });
    document.getElementById('admin-content').innerHTML = renderSection(section, users);
    if (window.lucide) lucide.createIcons();
    if (section === 'dashboard') initAdminCharts();
    if (section === 'reports') initReportCharts();
  };

  window.viewStudent = function(id) {
    const student = Store.getUserById(id);
    const skills = Store.getUserSkills(id);
    const projects = Store.getUserProjects(id);
    const certs = Store.getUserCerts(id);
    UI.modal(`Student Profile – ${student.name}`,
      `<div style="display:flex;flex-direction:column;gap:16px">
        <div style="display:flex;align-items:center;gap:14px">
          <div class="user-avatar" style="width:50px;height:50px;font-size:1.2rem">${student.avatar||student.name[0]}</div>
          <div>
            <div style="font-weight:800;font-size:1.05rem">${student.name}</div>
            <div style="font-size:.82rem;color:var(--text-muted)">${student.email} · ${student.phone || 'N/A'}</div>
          </div>
        </div>
        <div class="grid-2" style="gap:10px">
          ${[['Department',student.department],['Year','Year '+student.year],['CGPA',student.cgpa],['Assessment',student.assessmentDone?student.assessmentScore+'%':'Pending'],['Profile',student.profileCompletion+'%'],['Location',student.location||'N/A']].map(([k,v]) =>
            `<div style="background:var(--bg);border-radius:8px;padding:10px"><div style="font-size:.72rem;color:var(--text-muted);text-transform:uppercase">${k}</div><div style="font-weight:700;font-size:.9rem">${v}</div></div>`
          ).join('')}
        </div>
        <div><div style="font-weight:700;margin-bottom:8px;font-size:.875rem">Skills (${skills.length})</div><div style="display:flex;flex-wrap:wrap;gap:6px">${skills.map(s=>`<span class="skill-tag">${s.name} ${s.proficiency}%</span>`).join('')}</div></div>
        <div><div style="font-weight:700;margin-bottom:4px;font-size:.875rem">Projects: ${projects.length} · Certifications: ${certs.length}</div></div>
      </div>`,
      `<button class="btn btn-secondary" onclick="UI.closeModal()">Close</button>`
    );
    if (window.lucide) lucide.createIcons();
  };

  window.deleteStudent = function(id) {
    if (!confirm('Delete this student?')) return;
    const users = Store.getUsers().filter(u => u.id !== id);
    Store.setUsers(users);
    UI.toast('Student deleted.', 'success');
    adminNav('students');
  };

  window.adminStudentSearch = function(val) {
    const students = Store.getUsers().filter(u => u.role === 'student');
    const filtered = val ? students.filter(s => s.name.toLowerCase().includes(val.toLowerCase()) || s.email.toLowerCase().includes(val.toLowerCase()) || s.department.toLowerCase().includes(val.toLowerCase())) : students;
    const wrapper = document.getElementById('student-table-wrapper');
    if (wrapper) { wrapper.innerHTML = renderStudentTable(filtered); if (window.lucide) lucide.createIcons(); }
  };
  window.adminStudentFilterYear = function(val) {
    const students = Store.getUsers().filter(u => u.role === 'student');
    const year = parseInt(val.replace('Year ',''));
    const filtered = val ? students.filter(s => s.year === year) : students;
    const wrapper = document.getElementById('student-table-wrapper');
    if (wrapper) { wrapper.innerHTML = renderStudentTable(filtered); if (window.lucide) lucide.createIcons(); }
  };
  window.adminStudentFilterAssess = function(val) {
    const students = Store.getUsers().filter(u => u.role === 'student');
    const filtered = val === 'done' ? students.filter(s => s.assessmentDone)
                   : val === 'pending' ? students.filter(s => !s.assessmentDone) : students;
    const wrapper = document.getElementById('student-table-wrapper');
    if (wrapper) { wrapper.innerHTML = renderStudentTable(filtered); if (window.lucide) lucide.createIcons(); }
  };

  function initAdminCharts() {
    setTimeout(() => {
      const deptCtx = document.getElementById('admin-dept-chart');
      if (deptCtx) {
        const students = Store.getUsers().filter(u => u.role === 'student');
        const depts = {};
        students.forEach(s => { depts[s.department] = (depts[s.department] || 0) + 1; });
        new Chart(deptCtx, { type:'doughnut', data: { labels: Object.keys(depts), datasets:[{ data: Object.values(depts), backgroundColor:['#4f46e5','#3b82f6','#10b981','#f59e0b','#ef4444','#7c3aed'], borderWidth:0 }] }, options: { responsive:true, plugins:{ legend:{ position:'bottom', labels:{ font:{ size:11 } } } } } });
      }
      const scoreCtx = document.getElementById('admin-score-chart');
      if (scoreCtx) {
        new Chart(scoreCtx, { type:'bar', data: { labels:['<50','50-60','60-70','70-80','80-90','90+'], datasets:[{ label:'Students', data:[0,1,2,5,8,3], backgroundColor:'#4f46e5', borderRadius:4 }] }, options:{ responsive:true, plugins:{ legend:{display:false} }, scales:{ y:{ beginAtZero:true } } } });
      }
    }, 100);
  }

  function initReportCharts() {
    setTimeout(() => {
      const prefCtx = document.getElementById('career-pref-chart');
      if (prefCtx) {
        new Chart(prefCtx, { type:'bar', data: { labels:['AI/ML','Data Sci','Full Stack','Cloud','Cybersec','DevOps'], datasets:[{ label:'Students', data:[12,8,10,6,4,5], backgroundColor:['#4f46e5','#3b82f6','#10b981','#0284c7','#be185d','#c2410c'].map(c=>c+'bb'), borderRadius:4 }] }, options:{ responsive:true, plugins:{ legend:{display:false} }, scales:{ y:{ beginAtZero:true } } } });
      }
      const skillCtx = document.getElementById('skill-dist-chart');
      if (skillCtx) {
        new Chart(skillCtx, { type:'radar', data: { labels:['Python','SQL','ML','JavaScript','Cloud','Docker'], datasets:[{ label:'Avg Proficiency', data:[75,65,60,55,40,35], backgroundColor:'rgba(79,70,229,.15)', borderColor:'#4f46e5', borderWidth:2, pointBackgroundColor:'#4f46e5' }] }, options:{ responsive:true, plugins:{ legend:{display:false} }, scales:{ r:{ beginAtZero:true, max:100 } } } });
      }
    }, 100);
  }

  render();
  setTimeout(() => { if (activeSection === 'dashboard') initAdminCharts(); }, 200);
};
