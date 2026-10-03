/* ============================================
   pages/assessment.js
   ============================================ */

Pages.assessment = function(container) {
  if (!Auth.requireAuth()) return;
  const session = Auth.getCurrentUser();

  let currentQ = 0;
  let answers = {};
  let phase = 'intro'; // intro | quiz | result
  const questions = DB.questions;

  const categories = ['Aptitude','Technical','Problem Solving','Personality','Career'];

  function getCategory(q) { return q.category; }
  function getCatQuestions(cat) { return questions.filter(q => q.category === cat); }

  function calcScores() {
    const scores = {};
    categories.forEach(cat => {
      const qs = getCatQuestions(cat);
      let correct = 0;
      qs.forEach(q => { if (answers[q.id] === q.answer) correct++; });
      scores[cat] = Math.round((correct / qs.length) * 100);
    });
    // Personality and Career are scored differently (any answer is valid, score based on completion)
    const pCat = getCatQuestions('Personality');
    const answered = pCat.filter(q => answers[q.id] !== undefined).length;
    scores['Personality'] = Math.round((answered / pCat.length) * 100 * 0.88 + 8);
    const cCat = getCatQuestions('Career');
    const answeredC = cCat.filter(q => answers[q.id] !== undefined).length;
    scores['Career'] = Math.round((answeredC / cCat.length) * 100 * 0.92 + 5);
    scores['Aptitude'] = Math.max(scores['Aptitude'], 40);
    scores['Technical'] = Math.max(scores['Technical'], 45);
    scores['Problem Solving'] = Math.max(scores['Problem Solving'], 40);
    const overall = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / categories.length);
    return { ...scores, overall };
  }

  function renderIntro() {
    container.innerHTML = `
    <div class="page-content">
      <div class="assessment-container">
        <div style="text-align:center;margin-bottom:32px">
          <div style="width:72px;height:72px;background:var(--primary-light);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px">
            <i data-lucide="clipboard-list" style="width:32px;height:32px;color:var(--primary)"></i>
          </div>
          <h1 style="font-size:1.75rem;margin-bottom:8px">AI Career Assessment</h1>
          <p>Answer 25 questions across 5 categories to unlock your personalized career profile.</p>
        </div>

        <div class="grid-2" style="gap:14px;margin-bottom:28px">
          ${categories.map(cat => `
          <div class="card card-sm" style="display:flex;align-items:center;gap:12px">
            <div class="stat-icon indigo"><i data-lucide="check-circle" style="width:18px;height:18px"></i></div>
            <div>
              <div style="font-weight:700;font-size:.875rem">${cat}</div>
              <div style="font-size:.75rem;color:var(--text-muted)">${getCatQuestions(cat).length} questions</div>
            </div>
          </div>`).join('')}
        </div>

        <div class="card" style="background:var(--primary-light);border-color:#c7d2fe;margin-bottom:24px">
          <div style="display:flex;gap:12px;align-items:flex-start">
            <i data-lucide="info" style="color:var(--primary);width:20px;height:20px;flex-shrink:0;margin-top:2px"></i>
            <div>
              <div style="font-weight:600;color:var(--primary);margin-bottom:4px">Instructions</div>
              <ul style="font-size:.85rem;color:#3730a3;padding-left:16px;display:flex;flex-direction:column;gap:4px">
                <li>The assessment has 25 questions across 5 categories.</li>
                <li>Select the best answer for each question.</li>
                <li>You can navigate back and forth using Previous/Next buttons.</li>
                <li>Ensure all questions are answered before submitting.</li>
                <li>Results are used to generate your AI career recommendations.</li>
              </ul>
            </div>
          </div>
        </div>

        ${Store.getAssessmentResult(session.id) ? `
        <div class="card" style="background:#f0fdf4;border-color:#bbf7d0;margin-bottom:24px">
          <div style="display:flex;align-items:center;gap:10px;color:#166534">
            <i data-lucide="check-circle" style="width:20px;height:20px"></i>
            <div><strong>Assessment already completed!</strong> Score: ${Store.getAssessmentResult(session.id).overall}%</div>
          </div>
        </div>` : ''}

        <button class="btn btn-primary btn-full btn-lg" onclick="startAssessment()">
          <i data-lucide="play"></i>${Store.getAssessmentResult(session.id) ? 'Retake Assessment' : 'Start Assessment'}
        </button>
      </div>
    </div>`;
  }

  function renderQuestion() {
    const q = questions[currentQ];
    const total = questions.length;
    const pct = Math.round((currentQ / total) * 100);
    container.innerHTML = `
    <div class="page-content">
      <div class="assessment-container">
        <div class="assessment-progress-header">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px">
            <span style="font-size:.82rem;font-weight:600;color:var(--text-muted)">Question ${currentQ + 1} of ${total}</span>
            <span class="badge badge-primary">${q.category}</span>
          </div>
          ${UI.progressBar(pct, 'indigo')}
          <div style="display:flex;gap:6px;margin-top:12px;justify-content:center;flex-wrap:wrap">
            ${questions.map((_, i) => `
              <div style="width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.65rem;font-weight:700;cursor:pointer;
                background:${i === currentQ ? 'var(--primary)' : answers[questions[i].id] !== undefined ? '#10b981' : 'var(--border)'};
                color:${i === currentQ || answers[questions[i].id] !== undefined ? '#fff' : 'var(--text-muted)'};
                border:2px solid ${i === currentQ ? 'var(--primary-dark)' : 'transparent'}"
                onclick="jumpToQ(${i})">${i+1}</div>`).join('')}
          </div>
        </div>

        <div class="question-card">
          <div class="question-number">Question ${currentQ + 1} · ${q.category}</div>
          <div class="question-text">${q.q}</div>
          <div class="answer-options">
            ${q.options.map((opt, i) => `
            <div class="answer-option ${answers[q.id] === i ? 'selected' : ''}" onclick="selectAnswer(${q.id}, ${i})">
              <div class="option-label">${['A','B','C','D'][i]}</div>
              <div class="option-text">${opt}</div>
            </div>`).join('')}
          </div>
          <div class="question-nav">
            <button class="btn btn-secondary" onclick="prevQ()" ${currentQ === 0 ? 'disabled' : ''}>
              <i data-lucide="arrow-left"></i>Previous
            </button>
            <span style="font-size:.82rem;color:var(--text-muted)">${Object.keys(answers).length}/${total} answered</span>
            ${currentQ < total - 1
              ? `<button class="btn btn-primary" onclick="nextQ()">Next<i data-lucide="arrow-right"></i></button>`
              : `<button class="btn btn-primary" onclick="submitAssessment()" ${Object.keys(answers).length < total ? '' : ''}>
                  <i data-lucide="send"></i>Submit Assessment
                </button>`}
          </div>
        </div>
      </div>
    </div>`;
    if (window.lucide) lucide.createIcons();
  }

  function renderResults(scores) {
    const catIcons = { Aptitude:'calculator', Technical:'code-2', 'Problem Solving':'puzzle', Personality:'heart', Career:'briefcase' };
    container.innerHTML = `
    <div class="page-content">
      <div class="assessment-container">
        <div style="text-align:center;margin-bottom:32px">
          <div style="width:80px;height:80px;background:linear-gradient(135deg,#10b981,#059669);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px">
            <i data-lucide="check-circle" style="width:36px;height:36px;color:#fff"></i>
          </div>
          <h1 style="font-size:1.75rem;margin-bottom:6px">Assessment Completed! 🎉</h1>
          <p>Here are your results across all 5 categories.</p>
        </div>

        <!-- Overall Score -->
        <div class="card" style="text-align:center;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;margin-bottom:24px;padding:32px">
          <div style="font-size:.875rem;opacity:.8;margin-bottom:8px;text-transform:uppercase;letter-spacing:.05em">Overall Assessment Score</div>
          <div style="font-size:4rem;font-weight:900;line-height:1">${scores.overall}%</div>
          <div style="font-size:.9rem;opacity:.8;margin-top:8px">${scores.overall >= 80 ? '🌟 Excellent Performance!' : scores.overall >= 60 ? '👍 Good Performance' : '📈 Room to Grow'}</div>
          ${UI.progressBar(scores.overall, 'indigo')}
        </div>

        <!-- Category Scores -->
        <div class="score-categories" style="grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:14px;display:grid;margin-bottom:24px">
          ${categories.map(cat => `
          <div class="score-cat">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
              <div class="stat-icon indigo" style="width:30px;height:30px"><i data-lucide="${catIcons[cat] || 'star'}" style="width:14px;height:14px"></i></div>
              <div class="score-cat-name">${cat}</div>
            </div>
            <div class="score-cat-val">${scores[cat] || 0}%</div>
            ${UI.progressBar(scores[cat] || 0, scores[cat] >= 80 ? 'emerald' : scores[cat] >= 60 ? 'blue' : 'amber')}
          </div>`).join('')}
        </div>

        <!-- Chart -->
        <div class="card" style="margin-bottom:24px">
          <div class="card-title" style="margin-bottom:16px">Performance Breakdown</div>
          <canvas id="assessmentResultChart" height="160"></canvas>
        </div>

        <div style="display:flex;gap:12px;flex-wrap:wrap">
          <button class="btn btn-primary btn-lg" onclick="Router.navigate('dashboard');setTimeout(runAnalysis,200)">
            <i data-lucide="brain"></i>Run AI Career Analysis
          </button>
          <button class="btn btn-secondary" onclick="retakeAssessment()"><i data-lucide="refresh-cw"></i>Retake</button>
        </div>
      </div>
    </div>`;

    setTimeout(() => {
      const ctx = document.getElementById('assessmentResultChart');
      if (ctx) {
        new Chart(ctx, {
          type: 'radar',
          data: {
            labels: categories,
            datasets: [{
              label: 'Your Score',
              data: categories.map(c => scores[c] || 0),
              backgroundColor: 'rgba(79,70,229,.15)',
              borderColor: '#4f46e5', borderWidth: 2,
              pointBackgroundColor: '#4f46e5', pointRadius: 5
            }]
          },
          options: { responsive:true, scales:{ r:{ beginAtZero:true, max:100, ticks:{ callback: v => v+'%' } } }, plugins:{ legend:{display:false} } }
        });
      }
    }, 100);
    if (window.lucide) lucide.createIcons();
  }

  // ─── Global functions for event handlers ──
  window.startAssessment = function() { currentQ = 0; answers = {}; renderQuestion(); };
  window.retakeAssessment = function() { currentQ = 0; answers = {}; renderQuestion(); };
  window.jumpToQ = function(i) { currentQ = i; renderQuestion(); };
  window.selectAnswer = function(qId, optIdx) {
    answers[qId] = optIdx;
    const opts = document.querySelectorAll('.answer-option');
    opts.forEach((el, i) => el.classList.toggle('selected', i === optIdx));
  };
  window.nextQ = function() { if (currentQ < questions.length - 1) { currentQ++; renderQuestion(); } };
  window.prevQ = function() { if (currentQ > 0) { currentQ--; renderQuestion(); } };
  window.submitAssessment = function() {
    const unanswered = questions.filter(q => answers[q.id] === undefined).length;
    if (unanswered > 0) {
      if (!confirm(`${unanswered} question(s) are unanswered. Submit anyway?`)) return;
    }
    const scores = calcScores();
    // Map category names to keys
    const result = {
      overall: scores.overall,
      aptitude: scores['Aptitude'],
      technical: scores['Technical'],
      problemSolving: scores['Problem Solving'],
      personality: scores['Personality'],
      career: scores['Career'],
      date: new Date().toISOString()
    };
    Store.setAssessmentResult(session.id, result);
    Store.updateUser(session.id, { assessmentScore: result.overall, assessmentDone: true });
    renderResults(scores);
    UI.toast('Assessment submitted successfully! 🎉', 'success');
  };

  renderIntro();
};
