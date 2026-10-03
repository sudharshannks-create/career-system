/* ============================================
   pages/interview.js – AI Mock Interview
   ============================================ */

Pages.interview = function(container) {
  if (!Auth.requireAuth()) return;
  const session = Auth.getCurrentUser();
  const user = Store.getUserById(session.id);

  let phase = 'setup'; // setup | interview | result
  let selectedCareer = '';
  let selectedDifficulty = '';
  let selectedType = '';
  let currentQIdx = 0;
  let answers = [];
  let questions = [];
  let startTime = null;

  const careers = [
    { id:'ml-engineer', label:'ML Engineer', icon:'brain', color:'#7c3aed', bg:'#ede9fe' },
    { id:'software-engineer', label:'Software Engineer', icon:'code-2', color:'#3b82f6', bg:'#dbeafe' },
    { id:'data-scientist', label:'Data Scientist', icon:'bar-chart-2', color:'#10b981', bg:'#ecfdf5' },
    { id:'ai-engineer', label:'AI Engineer', icon:'cpu', color:'#ef4444', bg:'#fef2f2' },
    { id:'cloud-engineer', label:'Cloud Engineer', icon:'cloud', color:'#0284c7', bg:'#e0f2fe' },
    { id:'full-stack', label:'Full Stack Dev', icon:'layers', color:'#f59e0b', bg:'#fef3c7' }
  ];

  function getQuestions() {
    const careerKey = selectedCareer === 'ml-engineer' ? 'ml-engineer'
      : selectedCareer === 'data-scientist' ? 'data-scientist'
      : 'software-engineer';
    const pool = DB.interviewQuestions[careerKey] || DB.interviewQuestions['software-engineer'];
    const techQs = pool.technical || [];
    const hrQs   = pool.hr || [];
    if (selectedType === 'technical') return techQs.slice(0, 7);
    if (selectedType === 'hr')        return hrQs.slice(0, 5);
    return [...techQs.slice(0, 5), ...hrQs.slice(0, 3)];
  }

  function renderSetup() {
    container.innerHTML = `
    <div class="page-content">
      <div class="interview-setup">
        <div style="text-align:center;margin-bottom:32px">
          <div style="width:72px;height:72px;background:var(--primary-light);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px">
            <i data-lucide="mic" style="width:32px;height:32px;color:var(--primary)"></i>
          </div>
          <h1 style="font-size:1.75rem;margin-bottom:8px">AI Mock Interview</h1>
          <p>Practice real interview questions and get instant feedback on your performance.</p>
        </div>

        <!-- Career Selection -->
        <div class="card" style="margin-bottom:20px">
          <div class="card-title" style="margin-bottom:14px">1. Select Career Role</div>
          <div class="interview-select-grid">
            ${careers.map(c => `
            <div class="interview-option ${selectedCareer===c.id?'selected':''}" onclick="selectInterviewCareer('${c.id}')">
              <div style="width:36px;height:36px;background:${c.bg};border-radius:10px;display:flex;align-items:center;justify-content:center;margin:0 auto 6px">
                <i data-lucide="${c.icon}" style="color:${c.color};width:18px;height:18px"></i>
              </div>
              <span>${c.label}</span>
            </div>`).join('')}
          </div>
        </div>

        <!-- Difficulty -->
        <div class="card" style="margin-bottom:20px">
          <div class="card-title" style="margin-bottom:14px">2. Select Difficulty</div>
          <div class="interview-select-grid">
            ${[
              { id:'beginner', label:'Beginner', icon:'shield', desc:'Entry-level questions' },
              { id:'intermediate', label:'Intermediate', icon:'shield-half', desc:'Mid-level challenges' },
              { id:'advanced', label:'Advanced', icon:'shield-check', desc:'Senior-level depth' }
            ].map(d => `
            <div class="interview-option ${selectedDifficulty===d.id?'selected':''}" onclick="selectInterviewDiff('${d.id}')">
              <i data-lucide="${d.icon}" style="width:22px;height:22px;margin-bottom:4px"></i>
              <span>${d.label}</span>
              <div style="font-size:.72rem;color:var(--text-muted);margin-top:2px">${d.desc}</div>
            </div>`).join('')}
          </div>
        </div>

        <!-- Type -->
        <div class="card" style="margin-bottom:28px">
          <div class="card-title" style="margin-bottom:14px">3. Interview Type</div>
          <div class="interview-select-grid">
            ${[
              { id:'technical', label:'Technical', icon:'code-2', desc:'Technical questions' },
              { id:'hr', label:'HR Round', icon:'users', desc:'Behavioral questions' },
              { id:'mixed', label:'Mixed', icon:'shuffle', desc:'Both technical & HR' }
            ].map(t => `
            <div class="interview-option ${selectedType===t.id?'selected':''}" onclick="selectInterviewType('${t.id}')">
              <i data-lucide="${t.icon}" style="width:22px;height:22px;margin-bottom:4px"></i>
              <span>${t.label}</span>
              <div style="font-size:.72px;color:var(--text-muted);margin-top:2px">${t.desc}</div>
            </div>`).join('')}
          </div>
        </div>

        <button class="btn btn-primary btn-full btn-lg" onclick="startInterview()" ${!selectedCareer||!selectedDifficulty||!selectedType?'disabled':''} id="start-interview-btn">
          <i data-lucide="play"></i>Start Interview
        </button>
      </div>
    </div>`;
    if (window.lucide) lucide.createIcons();
  }

  function renderInterview() {
    const q = questions[currentQIdx];
    const progress = Math.round((currentQIdx / questions.length) * 100);
    container.innerHTML = `
    <div class="page-content">
      <div style="max-width:700px;margin:0 auto">
        <!-- Header -->
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;flex-wrap:wrap;gap:12px">
          <div>
            <h2 style="font-size:1.25rem">Mock Interview – ${careers.find(c=>c.id===selectedCareer)?.label}</h2>
            <div style="font-size:.82rem;color:var(--text-muted)">${selectedType === 'technical' ? 'Technical Round' : selectedType === 'hr' ? 'HR Round' : 'Mixed Round'} · ${selectedDifficulty}</div>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="endInterview()"><i data-lucide="square"></i>End Interview</button>
        </div>

        <!-- Progress -->
        <div style="margin-bottom:24px">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px">
            <span style="font-size:.82rem;font-weight:600">Question ${currentQIdx+1} of ${questions.length}</span>
            <span style="font-size:.82rem;color:var(--text-muted)">${progress}% complete</span>
          </div>
          ${UI.progressBar(progress, 'indigo')}
        </div>

        <!-- Question Card -->
        <div class="card" style="margin-bottom:20px;border-left:4px solid var(--primary)">
          <div style="display:flex;gap:12px;align-items:flex-start">
            <div style="width:36px;height:36px;background:var(--primary-light);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-weight:800;color:var(--primary)">${currentQIdx+1}</div>
            <div>
              <div style="font-size:.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.04em;margin-bottom:6px">${currentQIdx < 5 ? 'Technical' : 'HR'} Question</div>
              <div style="font-size:1.05rem;font-weight:700;line-height:1.4;color:var(--text-primary)">${q}</div>
            </div>
          </div>
        </div>

        <!-- Answer Area -->
        <div class="card" style="margin-bottom:20px">
          <div style="font-weight:600;margin-bottom:10px;display:flex;align-items:center;gap:8px">
            <i data-lucide="message-square" style="width:16px;height:16px;color:var(--primary)"></i>
            Your Answer
          </div>
          <textarea class="form-textarea" id="interview-answer" style="min-height:140px;font-size:.9rem" placeholder="Type your answer here... Take your time to think before responding.">${answers[currentQIdx] || ''}</textarea>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
            <span style="font-size:.75rem;color:var(--text-muted)" id="char-count">0 characters</span>
            <span style="font-size:.75rem;color:var(--text-muted)">Press Tab then Enter to submit</span>
          </div>
        </div>

        <!-- Tips -->
        <div style="background:var(--primary-light);border-radius:8px;padding:12px 16px;margin-bottom:20px;display:flex;gap:10px">
          <i data-lucide="lightbulb" style="color:var(--primary);width:16px;height:16px;flex-shrink:0;margin-top:2px"></i>
          <div style="font-size:.8rem;color:#3730a3"><strong>Tip:</strong> Use the STAR method for behavioral questions: Situation, Task, Action, Result. For technical questions, think aloud and explain your reasoning.</div>
        </div>

        <!-- Navigation -->
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button class="btn btn-secondary" onclick="prevIntQ()" ${currentQIdx===0?'disabled':''}>
            <i data-lucide="arrow-left"></i>Previous
          </button>
          <button class="btn btn-primary" onclick="submitIntAnswer()">
            <i data-lucide="check"></i>Submit Answer
          </button>
          ${currentQIdx < questions.length - 1
            ? `<button class="btn btn-outline" onclick="nextIntQ()">Next<i data-lucide="arrow-right"></i></button>`
            : `<button class="btn btn-danger" onclick="endInterview()"><i data-lucide="flag"></i>Finish Interview</button>`}
        </div>
      </div>
    </div>`;

    const textarea = document.getElementById('interview-answer');
    const charCount = document.getElementById('char-count');
    if (textarea) {
      if (answers[currentQIdx]) charCount.textContent = answers[currentQIdx].length + ' characters';
      textarea.addEventListener('input', () => { charCount.textContent = textarea.value.length + ' characters'; });
    }
    if (window.lucide) lucide.createIcons();
  }

  function renderResult() {
    const answered = answers.filter(a => a && a.trim().length > 10).length;
    const total = questions.length;
    const completion = Math.round((answered / total) * 100);
    const avgLen = answers.reduce((s, a) => s + (a ? a.length : 0), 0) / (answered || 1);

    // Mock scoring
    const technicalScore = Math.min(Math.round(completion * 0.88 + Math.random() * 10), 95);
    const communicationScore = Math.min(Math.round(avgLen > 150 ? 82 + Math.random() * 12 : 55 + Math.random() * 20), 95);
    const problemSolvingScore = Math.min(Math.round(70 + Math.random() * 20), 92);
    const confidenceScore = Math.min(Math.round(answered > 0 ? 75 + Math.random() * 18 : 40), 93);
    const overallScore = Math.round((technicalScore + communicationScore + problemSolvingScore + confidenceScore) / 4);

    container.innerHTML = `
    <div class="page-content">
      <div style="max-width:700px;margin:0 auto">
        <div style="text-align:center;margin-bottom:32px">
          <div style="width:80px;height:80px;background:linear-gradient(135deg,#4f46e5,#7c3aed);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px">
            <i data-lucide="trophy" style="width:36px;height:36px;color:#fff"></i>
          </div>
          <h1 style="margin-bottom:8px">Interview Complete! 🎉</h1>
          <p>Here's your performance analysis.</p>
        </div>

        <!-- Overall Score -->
        <div class="card" style="text-align:center;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;margin-bottom:24px;padding:32px">
          <div style="font-size:.875rem;opacity:.8;margin-bottom:6px;text-transform:uppercase;letter-spacing:.05em">Overall Interview Score</div>
          <div style="font-size:4rem;font-weight:900;line-height:1">${overallScore}%</div>
          <div style="font-size:.9rem;opacity:.8;margin-top:8px">${overallScore >= 80 ? '🌟 Excellent!' : overallScore >= 60 ? '👍 Good Performance!' : '📈 Keep Practicing!'}</div>
          <div style="margin-top:12px">Answered: ${answered}/${total} questions</div>
        </div>

        <!-- Breakdown -->
        <div class="grid-2" style="gap:14px;margin-bottom:24px">
          ${[
            { label:'Technical Knowledge', score: technicalScore, icon:'code-2', color:'indigo' },
            { label:'Communication', score: communicationScore, icon:'message-circle', color:'blue' },
            { label:'Problem Solving', score: problemSolvingScore, icon:'puzzle', color:'emerald' },
            { label:'Confidence', score: confidenceScore, icon:'zap', color:'amber' }
          ].map(s => `
          <div class="score-cat">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
              <div class="stat-icon ${s.color}" style="width:32px;height:32px"><i data-lucide="${s.icon}" style="width:15px;height:15px"></i></div>
              <div class="score-cat-name" style="font-size:.85rem">${s.label}</div>
            </div>
            <div class="score-cat-val">${s.score}%</div>
            ${UI.progressBar(s.score, s.color)}
          </div>`).join('')}
        </div>

        <!-- Q&A Review -->
        <div class="card" style="margin-bottom:24px">
          <div class="card-title" style="margin-bottom:16px">Questions & Your Answers</div>
          <div style="display:flex;flex-direction:column;gap:12px">
            ${questions.map((q, i) => `
            <div style="background:var(--bg);border-radius:8px;padding:14px">
              <div style="font-size:.75rem;font-weight:700;color:var(--primary);margin-bottom:4px">Q${i+1}</div>
              <div style="font-weight:600;font-size:.875rem;margin-bottom:8px">${q}</div>
              <div style="font-size:.82rem;color:var(--text-secondary);background:#fff;border-radius:6px;padding:10px;border:1px solid var(--border)">
                ${answers[i] && answers[i].trim() ? answers[i] : '<em style="color:var(--text-muted)">Not answered</em>'}
              </div>
            </div>`).join('')}
          </div>
        </div>

        <!-- Suggestions -->
        <div class="card" style="margin-bottom:24px;background:var(--primary-light);border-color:#c7d2fe">
          <div class="card-title" style="color:var(--primary);margin-bottom:12px">💡 Improvement Suggestions</div>
          <ul style="padding-left:18px;display:flex;flex-direction:column;gap:8px;font-size:.875rem;color:#3730a3">
            ${communicationScore < 75 ? '<li>Practice structuring longer, more detailed answers to demonstrate depth.</li>' : '<li>Strong communication! Keep using clear, structured responses.</li>'}
            ${technicalScore < 80 ? '<li>Review core technical concepts daily. Use LeetCode for DSA practice.</li>' : '<li>Excellent technical knowledge! Consider contributing to open-source projects.</li>'}
            <li>Use the STAR method (Situation, Task, Action, Result) for all behavioral questions.</li>
            <li>Research the company deeply before real interviews. Prepare 3-5 questions to ask the interviewer.</li>
            ${answered < total ? '<li>Try to answer every question in real interviews — a structured partial answer is better than silence.</li>' : ''}
          </ul>
        </div>

        <div style="display:flex;gap:12px;flex-wrap:wrap">
          <button class="btn btn-primary btn-lg" onclick="restartInterview()"><i data-lucide="refresh-cw"></i>Practice Again</button>
          <button class="btn btn-secondary" onclick="Router.navigate('coach')"><i data-lucide="message-circle"></i>Ask AI Coach</button>
        </div>
      </div>
    </div>`;
    if (window.lucide) lucide.createIcons();
  }

  // ─── Global functions ─────────────────────
  window.selectInterviewCareer = function(id) {
    selectedCareer = id;
    document.querySelectorAll('.interview-option').forEach(el => el.classList.remove('selected'));
    event.currentTarget.classList.add('selected');
    updateStartBtn();
  };
  window.selectInterviewDiff = function(id) {
    selectedDifficulty = id;
    document.querySelectorAll('.card:nth-child(2) .interview-option').forEach(el => el.classList.remove('selected'));
    event.currentTarget.classList.add('selected');
    updateStartBtn();
  };
  window.selectInterviewType = function(id) {
    selectedType = id;
    event.currentTarget.classList.add('selected');
    updateStartBtn();
  };

  function updateStartBtn() {
    const btn = document.getElementById('start-interview-btn');
    if (btn) btn.disabled = !(selectedCareer && selectedDifficulty && selectedType);
  }

  window.startInterview = function() {
    if (!selectedCareer || !selectedDifficulty || !selectedType) { UI.toast('Please select all options.', 'error'); return; }
    questions = getQuestions();
    answers = new Array(questions.length).fill('');
    currentQIdx = 0;
    startTime = Date.now();
    phase = 'interview';
    renderInterview();
  };

  window.submitIntAnswer = function() {
    const textarea = document.getElementById('interview-answer');
    if (textarea) answers[currentQIdx] = textarea.value.trim();
    UI.toast('Answer saved!', 'success');
    if (currentQIdx < questions.length - 1) { currentQIdx++; renderInterview(); }
  };

  window.nextIntQ = function() {
    const textarea = document.getElementById('interview-answer');
    if (textarea) answers[currentQIdx] = textarea.value.trim();
    if (currentQIdx < questions.length - 1) { currentQIdx++; renderInterview(); }
  };

  window.prevIntQ = function() {
    const textarea = document.getElementById('interview-answer');
    if (textarea) answers[currentQIdx] = textarea.value.trim();
    if (currentQIdx > 0) { currentQIdx--; renderInterview(); }
  };

  window.endInterview = function() {
    const textarea = document.getElementById('interview-answer');
    if (textarea) answers[currentQIdx] = textarea.value.trim();
    renderResult();
  };

  window.restartInterview = function() {
    phase = 'setup';
    selectedCareer = ''; selectedDifficulty = ''; selectedType = '';
    renderSetup();
  };

  renderSetup();
};
