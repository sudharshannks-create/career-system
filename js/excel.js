/* ============================================
   excel.js - Excel Export Engine (SheetJS)
   ============================================ */

const ExcelExport = {

  /* Utility: trigger download of a workbook */
  _download(wb, filename) {
    XLSX.writeFile(wb, filename);
  },

  /* Utility: create a sheet with header row and auto-fit columns */
  _makeSheet(headers, rows) {
    const data = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const colWidths = headers.map((h, i) => {
      const maxLen = Math.max(h.length, ...rows.map(r => String(r[i] ?? '').length));
      return { wch: Math.min(maxLen + 4, 60) };
    });
    ws['!cols'] = colWidths;
    return ws;
  },

  /* Utility: format salary */
  _fmtSalary(n) {
    if (!n) return '';
    if (n >= 10000000) return 'Rs.' + (n / 10000000).toFixed(1) + 'Cr';
    if (n >= 100000)   return 'Rs.' + (n / 100000).toFixed(1) + 'L';
    return 'Rs.' + n.toLocaleString('en-IN');
  },

  /* Utility: today date string */
  _today() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  },

  /* ==========================================
     1. Dashboard Export - Full Student Report
     ========================================== */
  exportDashboard() {
    const session = Auth.getCurrentUser();
    if (!session) return;
    const user     = Store.getUserById(session.id);
    const skills   = Store.getUserSkills(session.id);
    const projects = Store.getUserProjects(session.id);
    const certs    = Store.getUserCerts(session.id);
    const assessment = Store.getAssessmentResult(session.id);
    const recs     = user.analysisRun ? AIEngine.run(session.id) : [];

    const wb = XLSX.utils.book_new();

    // Sheet 1 - Profile Summary
    const profileRows = [[
      user.name || '', user.email || '', user.phone || '',
      user.college || '', user.department || '', user.degree || '',
      'Year ' + (user.year || ''), user.cgpa || '', user.location || '',
      (user.profileCompletion || 0) + '%',
      user.assessmentDone ? 'Yes' : 'No',
      assessment ? assessment.overall + '%' : (user.assessmentScore ? user.assessmentScore + '%' : 'N/A')
    ]];
    XLSX.utils.book_append_sheet(wb,
      this._makeSheet(
        ['Name','Email','Phone','College','Department','Degree','Year','CGPA','Location','Profile Completion','Assessment Done','Assessment Score'],
        profileRows
      ), 'Profile Summary');

    // Sheet 2 - Skills
    if (skills.length > 0) {
      XLSX.utils.book_append_sheet(wb,
        this._makeSheet(
          ['Skill','Category','Proficiency (%)','Level'],
          skills.map(s => [s.name, s.category || '', s.proficiency + '%', s.level])
        ), 'Skills');
    }

    // Sheet 3 - Assessment Scores
    if (assessment) {
      const catRows = [
        ['Aptitude',        assessment.Aptitude        || assessment.aptitude        || 'N/A'],
        ['Technical',       assessment.Technical       || assessment.technical       || 'N/A'],
        ['Problem Solving', assessment['Problem Solving'] || assessment.problemSolving || 'N/A'],
        ['Personality',     assessment.Personality     || assessment.personality     || 'N/A'],
        ['Career',          assessment.Career          || assessment.career          || 'N/A'],
        ['Overall',         assessment.overall         || 'N/A']
      ];
      XLSX.utils.book_append_sheet(wb,
        this._makeSheet(['Category','Score (%)'], catRows),
        'Assessment Scores');
    }

    // Sheet 4 - Career Recommendations
    if (recs.length > 0) {
      XLSX.utils.book_append_sheet(wb,
        this._makeSheet(
          ['Rank','Career','Category','Match Score','Matched Skills','Missing Skills','Why Recommended'],
          recs.map((r, i) => [
            i + 1, r.careerName, r.category, r.matchScore + '%',
            r.matchedSkills.join(', '), r.missingSkills.join(', '), r.whyRecommended
          ])
        ), 'Career Recommendations');
    }

    // Sheet 5 - Projects
    if (projects.length > 0) {
      XLSX.utils.book_append_sheet(wb,
        this._makeSheet(
          ['Project Name','Description','Technologies','Role','Duration','Link'],
          projects.map(p => [p.name, p.description || '', (p.technologies || []).join(', '), p.role || '', p.duration || '', p.link || ''])
        ), 'Projects');
    }

    // Sheet 6 - Certifications
    if (certs.length > 0) {
      XLSX.utils.book_append_sheet(wb,
        this._makeSheet(
          ['Certification','Provider','Date','Credential ID'],
          certs.map(c => [c.name, c.provider || '', c.date || '', c.credentialId || ''])
        ), 'Certifications');
    }

    const safeName = (user.name || 'Student').replace(/\s+/g, '_');
    this._download(wb, 'NextStepAI_' + safeName + '_Report_' + this._today() + '.xlsx');
    if (typeof UI !== 'undefined') UI.toast('Dashboard exported to Excel! 📊', 'success');
  },

  /* ==========================================
     2. Careers Export
     ========================================== */
  exportCareers() {
    const session = Auth.getCurrentUser();
    const wb = XLSX.utils.book_new();

    // Sheet 1 - All Careers
    XLSX.utils.book_append_sheet(wb,
      this._makeSheet(
        ['Career','Category','Description','Difficulty','Demand','Salary Range','Growth','Required Skills','Optional Skills'],
        DB.careers.map(c => [
          c.name, c.category, c.description, c.difficulty, c.demand,
          this._fmtSalary(c.salaryMin) + ' to ' + this._fmtSalary(c.salaryMax),
          c.growth, c.requiredSkills.join(', '), c.optionalSkills.join(', ')
        ])
      ), 'All Careers');

    // Sheet 2 - My Recommendations
    if (session) {
      const user = Store.getUserById(session.id);
      if (user && user.analysisRun) {
        const recs = AIEngine.run(session.id);
        XLSX.utils.book_append_sheet(wb,
          this._makeSheet(
            ['Rank','Career','Category','Match Score','Matched Skills','Skills to Learn'],
            recs.map((r, i) => [i+1, r.careerName, r.category, r.matchScore+'%', r.matchedSkills.join(', '), r.missingSkills.join(', ')])
          ), 'My Recommendations');
      }
    }

    // Sheet 3 - Courses
    XLSX.utils.book_append_sheet(wb,
      this._makeSheet(
        ['Course Name','Provider','Skill','Difficulty','Duration','Rating','Cost','Link'],
        DB.courses.map(c => [c.name, c.provider, c.skill, c.difficulty, c.duration, c.rating, c.free ? 'Free' : 'Paid', c.link])
      ), 'Courses');

    // Sheet 4 - Certifications
    XLSX.utils.book_append_sheet(wb,
      this._makeSheet(
        ['Certification','Provider','Career Path','Difficulty','Validity','Prep Time','Link'],
        DB.certifications.map(c => {
          const career = DB.careers.find(ca => ca.id === c.careerId);
          return [c.name, c.provider, career ? career.name : '', c.difficulty, c.validity, c.prepTime, c.link];
        })
      ), 'Certifications');

    // Sheet 5 - Recommended Projects
    XLSX.utils.book_append_sheet(wb,
      this._makeSheet(
        ['Project','Career Path','Difficulty','Technologies','Description','Duration'],
        DB.projects.map(p => {
          const career = DB.careers.find(c => c.id === p.careerId);
          return [p.name, career ? career.name : '', p.difficulty, (p.technologies || []).join(', '), p.description, p.duration];
        })
      ), 'Recommended Projects');

    this._download(wb, 'NextStepAI_Careers_' + this._today() + '.xlsx');
    if (typeof UI !== 'undefined') UI.toast('Careers exported to Excel! 📊', 'success');
  },

  /* ==========================================
     3. Profile Export
     ========================================== */
  exportProfile() {
    const session = Auth.getCurrentUser();
    if (!session) return;
    const user     = Store.getUserById(session.id);
    const skills   = Store.getUserSkills(session.id);
    const projects = Store.getUserProjects(session.id);
    const certs    = Store.getUserCerts(session.id);

    const wb = XLSX.utils.book_new();

    // Sheet 1 - Personal Info
    XLSX.utils.book_append_sheet(wb,
      this._makeSheet(['Field','Value'], [
        ['Full Name',          user.name        || ''],
        ['Email',              user.email       || ''],
        ['Phone',              user.phone       || ''],
        ['Location',           user.location    || ''],
        ['College',            user.college     || ''],
        ['Degree',             user.degree      || ''],
        ['Department',         user.department  || ''],
        ['Year of Study',      user.year        || ''],
        ['CGPA',               user.cgpa        || ''],
        ['Role',               user.role        || ''],
        ['Profile Completion', (user.profileCompletion || 0) + '%'],
        ['Assessment Done',    user.assessmentDone ? 'Yes' : 'No'],
        ['AI Analysis Run',    user.analysisRun  ? 'Yes' : 'No']
      ]), 'Personal Info');

    // Sheet 2 - Skills
    if (skills.length > 0) {
      XLSX.utils.book_append_sheet(wb,
        this._makeSheet(
          ['Skill','Category','Proficiency (%)','Level'],
          skills.map(s => [s.name, s.category || '', s.proficiency + '%', s.level])
        ), 'Skills');
    }

    // Sheet 3 - Projects
    if (projects.length > 0) {
      XLSX.utils.book_append_sheet(wb,
        this._makeSheet(
          ['Project','Description','Technologies','Role','Duration','Link'],
          projects.map(p => [p.name, p.description || '', (p.technologies || []).join(', '), p.role || '', p.duration || '', p.link || ''])
        ), 'Projects');
    }

    // Sheet 4 - Certifications
    if (certs.length > 0) {
      XLSX.utils.book_append_sheet(wb,
        this._makeSheet(
          ['Certification','Provider','Date','Credential ID'],
          certs.map(c => [c.name, c.provider || '', c.date || '', c.credentialId || ''])
        ), 'Certifications');
    }

    const safeName = (user.name || 'Student').replace(/\s+/g, '_');
    this._download(wb, 'NextStepAI_Profile_' + safeName + '_' + this._today() + '.xlsx');
    if (typeof UI !== 'undefined') UI.toast('Profile exported to Excel! 📊', 'success');
  },

  /* ==========================================
     4. Assessment Export
     ========================================== */
  exportAssessment() {
    const session = Auth.getCurrentUser();
    if (!session) return;
    const user = Store.getUserById(session.id);
    const assessment = Store.getAssessmentResult(session.id);

    if (!assessment && !user.assessmentDone) {
      if (typeof UI !== 'undefined') UI.toast('No assessment data to export yet.', 'warning');
      return;
    }

    const wb = XLSX.utils.book_new();

    // Sheet 1 - Summary
    XLSX.utils.book_append_sheet(wb,
      this._makeSheet(['Field','Value'], [
        ['Student Name',   user.name  || ''],
        ['Email',          user.email || ''],
        ['Assessment Done', user.assessmentDone ? 'Yes' : 'No'],
        ['Overall Score',  assessment ? assessment.overall + '%' : (user.assessmentScore + '%')]
      ]), 'Summary');

    // Sheet 2 - Category Scores
    if (assessment) {
      XLSX.utils.book_append_sheet(wb,
        this._makeSheet(['Category','Score (%)'], [
          ['Aptitude',         assessment.Aptitude        || assessment.aptitude        || 'N/A'],
          ['Technical',        assessment.Technical       || assessment.technical       || 'N/A'],
          ['Problem Solving',  assessment['Problem Solving'] || assessment.problemSolving || 'N/A'],
          ['Personality',      assessment.Personality     || assessment.personality     || 'N/A'],
          ['Career Alignment', assessment.Career          || assessment.career          || 'N/A'],
          ['Overall',          assessment.overall]
        ]), 'Category Scores');
    }

    // Sheet 3 - Questions Reference
    XLSX.utils.book_append_sheet(wb,
      this._makeSheet(
        ['#','Category','Question','Options','Correct Answer'],
        DB.questions.map(q => [q.id, q.category, q.q, q.options.join(' | '), q.options[q.answer]])
      ), 'Questions Reference');

    this._download(wb, 'NextStepAI_Assessment_' + this._today() + '.xlsx');
    if (typeof UI !== 'undefined') UI.toast('Assessment exported to Excel! 📊', 'success');
  },

  /* ==========================================
     5. Full Data Export
     ========================================== */
  exportAll() {
    const session = Auth.getCurrentUser();
    if (!session) return;
    const user     = Store.getUserById(session.id);
    const skills   = Store.getUserSkills(session.id);
    const projects = Store.getUserProjects(session.id);
    const certs    = Store.getUserCerts(session.id);
    const assessment = Store.getAssessmentResult(session.id);
    const recs     = user.analysisRun ? AIEngine.run(session.id) : [];

    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, this._makeSheet(
      ['Name','Email','Phone','College','Department','Degree','Year','CGPA','Location','Profile %','Assessment Done','Score'],
      [[user.name, user.email, user.phone, user.college, user.department,
        user.degree, 'Year ' + user.year, user.cgpa, user.location,
        (user.profileCompletion || 0) + '%', user.assessmentDone ? 'Yes' : 'No',
        assessment ? assessment.overall + '%' : (user.assessmentScore + '%')]]
    ), 'Profile');

    if (skills.length > 0) {
      XLSX.utils.book_append_sheet(wb, this._makeSheet(
        ['Skill','Category','Proficiency','Level'],
        skills.map(s => [s.name, s.category || '', s.proficiency + '%', s.level])
      ), 'Skills');
    }

    if (assessment) {
      XLSX.utils.book_append_sheet(wb, this._makeSheet(
        ['Category','Score (%)'],
        [
          ['Aptitude',       assessment.Aptitude        || assessment.aptitude        || 'N/A'],
          ['Technical',      assessment.Technical       || assessment.technical       || 'N/A'],
          ['Problem Solving',assessment['Problem Solving'] || assessment.problemSolving || 'N/A'],
          ['Personality',    assessment.Personality     || assessment.personality     || 'N/A'],
          ['Career',         assessment.Career          || assessment.career          || 'N/A'],
          ['Overall',        assessment.overall]
        ]
      ), 'Assessment');
    }

    if (recs.length > 0) {
      XLSX.utils.book_append_sheet(wb, this._makeSheet(
        ['Rank','Career','Category','Match %','Matched Skills','Missing Skills','Reason'],
        recs.map((r, i) => [i+1, r.careerName, r.category, r.matchScore+'%', r.matchedSkills.join(', '), r.missingSkills.join(', '), r.whyRecommended])
      ), 'Recommendations');
    }

    if (projects.length > 0) {
      XLSX.utils.book_append_sheet(wb, this._makeSheet(
        ['Project','Description','Technologies','Role','Duration','Link'],
        projects.map(p => [p.name, p.description||'', (p.technologies||[]).join(', '), p.role||'', p.duration||'', p.link||''])
      ), 'My Projects');
    }

    if (certs.length > 0) {
      XLSX.utils.book_append_sheet(wb, this._makeSheet(
        ['Certification','Provider','Date','Credential ID'],
        certs.map(c => [c.name, c.provider||'', c.date||'', c.credentialId||''])
      ), 'My Certifications');
    }

    XLSX.utils.book_append_sheet(wb, this._makeSheet(
      ['Career','Category','Difficulty','Demand','Salary Range','Growth','Required Skills'],
      DB.careers.map(c => [
        c.name, c.category, c.difficulty, c.demand,
        this._fmtSalary(c.salaryMin) + ' to ' + this._fmtSalary(c.salaryMax),
        c.growth, c.requiredSkills.join(', ')
      ])
    ), 'All Careers');

    XLSX.utils.book_append_sheet(wb, this._makeSheet(
      ['Course','Provider','Skill','Difficulty','Duration','Rating','Free/Paid'],
      DB.courses.map(c => [c.name, c.provider, c.skill, c.difficulty, c.duration, c.rating, c.free ? 'Free' : 'Paid'])
    ), 'All Courses');

    const safeName = (user.name || 'Student').replace(/\s+/g, '_');
    this._download(wb, 'NextStepAI_FullReport_' + safeName + '_' + this._today() + '.xlsx');
    if (typeof UI !== 'undefined') UI.toast('Full report exported to Excel! 📊', 'success');
  },

  /* ==========================================
     6. Job Applications Pipeline Export
     ========================================== */
  exportJobApplications() {
    const session = Auth.getCurrentUser();
    if (!session) return;
    const user = Store.getUserById(session.id);
    const apps = Store.getJobApplications(session.id);

    const wb = XLSX.utils.book_new();

    const appHeaders = ['Company', 'Role', 'Status', 'Salary', 'Location', 'Applied Date', 'Next Step / Deadline', 'Notes'];
    const appRows = apps.map(a => [
      a.company || '',
      a.role || '',
      (a.status || '').toUpperCase(),
      a.salary || '',
      a.location || '',
      a.appliedDate || '',
      a.nextStep || (a.nextDate ? 'Due: ' + a.nextDate : ''),
      a.notes || ''
    ]);

    XLSX.utils.book_append_sheet(wb, this._makeSheet(appHeaders, appRows), 'Job Applications');

    // Also include available job opportunities
    const jobHeaders = ['Company', 'Title', 'Category', 'Work Mode', 'Location', 'Salary', 'Experience', 'Required Skills'];
    const jobRows = (DB.jobs || []).map(j => [
      j.company, j.title, j.category, j.workMode, j.location, j.salary, j.experience, (j.requiredSkills || []).join(', ')
    ]);
    XLSX.utils.book_append_sheet(wb, this._makeSheet(jobHeaders, jobRows), 'Matched Jobs');

    const safeName = (user.name || 'Student').replace(/\s+/g, '_');
    this._download(wb, 'Job_Applications_' + safeName + '_' + this._today() + '.xlsx');
    if (typeof UI !== 'undefined') UI.toast('Job applications exported to Excel! 📁', 'success');
  },

  /* ==========================================
     7. Resume Data Export
     ========================================== */
  exportResumeData() {
    const session = Auth.getCurrentUser();
    if (!session) return;
    const user = Store.getUserById(session.id);
    const resume = Store.getResume(session.id);

    const wb = XLSX.utils.book_new();

    // Summary Sheet
    XLSX.utils.book_append_sheet(wb, this._makeSheet(
      ['Field', 'Value'],
      [
        ['Full Name', resume.fullName || user.name || ''],
        ['Professional Title', resume.title || ''],
        ['Target Role', resume.targetRole || ''],
        ['Email', resume.email || user.email || ''],
        ['Phone', resume.phone || user.phone || ''],
        ['Location', resume.location || user.location || ''],
        ['LinkedIn', resume.linkedin || ''],
        ['GitHub', resume.github || ''],
        ['Portfolio URL', resume.portfolioUrl || ''],
        ['Summary Statement', resume.summary || '']
      ]
    ), 'Personal & Summary');

    // Experience Sheet
    if (resume.experience && resume.experience.length) {
      XLSX.utils.book_append_sheet(wb, this._makeSheet(
        ['Company', 'Role', 'Location', 'Dates', 'Bullet Points'],
        resume.experience.map(e => [
          e.company, e.role, e.location || '', `${e.startDate} - ${e.endDate}`, (e.bullets || []).join(' | ')
        ])
      ), 'Experience');
    }

    // Projects Sheet
    if (resume.projects && resume.projects.length) {
      XLSX.utils.book_append_sheet(wb, this._makeSheet(
        ['Project Name', 'Role', 'Technologies', 'Link', 'Key Achievements'],
        resume.projects.map(p => [
          p.name, p.role || '', p.technologies || '', p.link || '', (p.bullets || []).join(' | ')
        ])
      ), 'Projects');
    }

    // Skills Sheet
    if (resume.skills && resume.skills.length) {
      XLSX.utils.book_append_sheet(wb, this._makeSheet(
        ['Skill Name'],
        resume.skills.map(s => [s])
      ), 'Skills');
    }

    const safeName = (user.name || 'Student').replace(/\s+/g, '_');
    this._download(wb, 'Resume_Data_' + safeName + '_' + this._today() + '.xlsx');
    if (typeof UI !== 'undefined') UI.toast('Resume data exported to Excel! 📄', 'success');
  }
};
