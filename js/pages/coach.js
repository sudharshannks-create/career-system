/* ============================================
   pages/coach.js – AI Career Coach chatbot
   ============================================ */

Pages.coach = function(container) {
  if (!Auth.requireAuth()) return;
  const session = Auth.getCurrentUser();
  const user = Store.getUserById(session.id);

  let messages = [
    { role: 'ai', text: `Hello ${user.name.split(' ')[0]}! 👋 I'm your **AI Career Coach**.\n\nI can help you with career guidance, skill recommendations, interview tips, course suggestions, and much more. What would you like to explore today?` }
  ];

  const suggestions = [
    'Which career is suitable for me?',
    'How can I become an AI Engineer?',
    'What skills should I learn next?',
    'What projects should I build?',
    'What certifications should I take?',
    'How can I improve my resume?',
    'What is the salary for ML Engineer?',
    'Show me a learning roadmap',
    'How to prepare for interviews?'
  ];

  function getAIResponse(message) {
    const msg = message.toLowerCase();
    if (msg.includes('career') && (msg.includes('suitable') || msg.includes('which') || msg.includes('recommend') || msg.includes('best'))) return DB.coachResponses.career;
    if (msg.includes('skill')) return DB.coachResponses.skills;
    if (msg.includes('project')) return DB.coachResponses.projects;
    if (msg.includes('certification') || msg.includes('cert')) return DB.coachResponses.certification;
    if (msg.includes('resume') || msg.includes('cv')) return DB.coachResponses.resume;
    if (msg.includes('interview') || msg.includes('prepare')) return DB.coachResponses.interview;
    if (msg.includes('ai engineer') || msg.includes('artificial intelligence')) return DB.coachResponses.ai;
    if (msg.includes('salary') || msg.includes('pay') || msg.includes('lpa') || msg.includes('package')) return DB.coachResponses.salary;
    if (msg.includes('roadmap') || msg.includes('path') || msg.includes('plan')) return DB.coachResponses.roadmap;
    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) return `Hello ${user.name.split(' ')[0]}! 😊 How can I help you with your career today?`;
    if (msg.includes('thank')) return `You're welcome! 🙏 Feel free to ask me anything else about your career journey!`;
    if (msg.includes('python') || msg.includes('programming')) return 'Python is an excellent choice! 🐍 Here\'s how to get started:\n\n1. **Python Fundamentals** – Variables, loops, functions, OOP\n2. **Data Structures** – Lists, dicts, tuples, sets\n3. **Libraries** – NumPy, Pandas for data\n4. **Frameworks** – Flask/Django for web, TensorFlow/PyTorch for ML\n\n**Resource:** Python.org docs, Automate the Boring Stuff, CS50P';
    if (msg.includes('machine learning') || msg.includes('ml')) return '**Machine Learning** is one of the hottest fields! Here\'s your path:\n\n📚 **Learn:** Linear/Logistic Regression, Decision Trees, SVM, Neural Networks\n🛠️ **Tools:** Scikit-learn, TensorFlow, PyTorch\n📊 **Math:** Statistics, Linear Algebra, Calculus\n\n**Best course:** Machine Learning Specialization by Andrew Ng on Coursera! (4.9★)';
    return `That's a great question! Based on your profile as a ${user.department} student with CGPA ${user.cgpa}, here are my recommendations:\n\n🎯 **For your query about "${message}":**\n\nI suggest focusing on building strong fundamentals first, then progressing to advanced topics. Your Python skills (85%) are a great foundation to build upon.\n\n💡 **Next steps:**\n1. Identify skill gaps using the Skill Gap Analyzer\n2. Follow your personalized learning roadmap\n3. Build 2-3 portfolio projects\n4. Get certified in your target domain\n\nWould you like more specific guidance on any of these areas?`;
  }

  function formatText(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');
  }

  function renderMessages() {
    const area = document.getElementById('chat-messages');
    if (!area) return;
    area.innerHTML = messages.map(m => `
    <div class="chat-msg ${m.role}">
      <div class="chat-msg-avatar">
        ${m.role === 'ai' ? '<i data-lucide="bot" style="width:16px;height:16px"></i>' : (user.avatar || user.name[0])}
      </div>
      <div class="chat-bubble">${formatText(m.text)}</div>
    </div>`).join('');
    area.scrollTop = area.scrollHeight;
    if (window.lucide) lucide.createIcons();
  }

  function sendMessage(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    messages.push({ role: 'user', text: trimmed });
    const input = document.getElementById('chat-input');
    if (input) input.value = '';
    renderMessages();

    // Show typing
    const area = document.getElementById('chat-messages');
    const typing = document.createElement('div');
    typing.className = 'chat-msg ai';
    typing.id = 'typing-indicator';
    typing.innerHTML = `<div class="chat-msg-avatar" style="background:linear-gradient(135deg,#4f46e5,#7c3aed);border-radius:10px"><i data-lucide="bot" style="width:16px;height:16px;color:#fff"></i></div><div class="chat-bubble"><div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div>`;
    area.appendChild(typing);
    area.scrollTop = area.scrollHeight;
    if (window.lucide) lucide.createIcons();

    setTimeout(() => {
      typing.remove();
      messages.push({ role: 'ai', text: getAIResponse(trimmed) });
      renderMessages();
    }, 800 + Math.random() * 700);
  }

  container.innerHTML = `
  <div class="chat-page">
    <div class="chat-layout">
      <!-- Sidebar -->
      <div class="chat-sidebar">
        <div>
          <div style="font-weight:700;font-size:.85rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.04em;margin-bottom:12px">Your Profile</div>
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
            <div class="user-avatar">${user.avatar || user.name[0]}</div>
            <div>
              <div style="font-weight:700;font-size:.875rem">${user.name}</div>
              <div style="font-size:.75rem;color:var(--text-muted)">${user.department}</div>
            </div>
          </div>
          <div style="background:var(--bg);border-radius:8px;padding:12px;display:flex;flex-direction:column;gap:6px;font-size:.78rem">
            <div style="display:flex;justify-content:space-between"><span style="color:var(--text-muted)">Year</span><span style="font-weight:600">${user.year}</span></div>
            <div style="display:flex;justify-content:space-between"><span style="color:var(--text-muted)">CGPA</span><span style="font-weight:600">${user.cgpa}</span></div>
            <div style="display:flex;justify-content:space-between"><span style="color:var(--text-muted)">Skills</span><span style="font-weight:600">${Store.getUserSkills(session.id).length}</span></div>
            <div style="display:flex;justify-content:space-between"><span style="color:var(--text-muted)">Assessment</span><span style="font-weight:600">${user.assessmentScore || 0}%</span></div>
          </div>
        </div>
        <div class="divider"></div>
        <div>
          <div style="font-weight:700;font-size:.85rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.04em;margin-bottom:12px">Quick Topics</div>
          <div style="display:flex;flex-direction:column;gap:4px">
            ${suggestions.map(s => `<button class="suggested-prompt" style="text-align:left;border-radius:8px;width:100%;font-size:.78rem" onclick="coachSend('${s.replace(/'/g, "\\'")}'">${s}</button>`).join('')}
          </div>
        </div>
        <div class="divider"></div>
        <button class="btn btn-secondary btn-sm btn-full" onclick="clearCoachChat()"><i data-lucide="trash-2"></i>Clear Chat</button>
      </div>

      <!-- Main Chat -->
      <div class="chat-main">
        <div class="chat-header">
          <div class="chat-avatar"><i data-lucide="bot" style="width:22px;height:22px;color:#fff"></i></div>
          <div>
            <div style="font-weight:700">AI Career Coach</div>
            <div style="font-size:.78rem;color:var(--text-muted);display:flex;align-items:center;gap:6px">
              <span style="width:8px;height:8px;background:#10b981;border-radius:50%;display:inline-block"></span>
              Online · Rule-based AI (LLM API ready)
            </div>
          </div>
          <div style="margin-left:auto">
            <button class="btn btn-secondary btn-sm" onclick="clearCoachChat()"><i data-lucide="refresh-cw"></i>Clear</button>
          </div>
        </div>

        <div class="chat-messages" id="chat-messages"></div>

        <div class="chat-input-area">
          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px" id="quick-prompts">
            ${suggestions.slice(0,4).map(s => `<button class="suggested-prompt" onclick="coachSend('${s.replace(/'/g, "\\'")}'">${s}</button>`).join('')}
          </div>
          <div class="chat-input-row">
            <textarea class="chat-input" id="chat-input" placeholder="Ask me anything about your career..." rows="1"
              onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();coachSendInput()}"
              oninput="this.style.height='auto';this.style.height=this.scrollHeight+'px'"></textarea>
            <button class="btn btn-primary" onclick="coachSendInput()" style="padding:11px 16px;border-radius:var(--radius-sm)">
              <i data-lucide="send" style="width:18px;height:18px"></i>
            </button>
          </div>
          <div style="font-size:.72rem;color:var(--text-muted);margin-top:6px;text-align:center">
            Powered by a rule-based AI engine. Connect an LLM API for enhanced responses.
          </div>
        </div>
      </div>
    </div>
  </div>`;

  window.coachSend = function(text) { sendMessage(text); };
  window.coachSendInput = function() {
    const input = document.getElementById('chat-input');
    if (input) sendMessage(input.value);
  };
  window.clearCoachChat = function() {
    messages = [{ role: 'ai', text: `Chat cleared! How can I help you today, ${user.name.split(' ')[0]}? 😊` }];
    renderMessages();
  };

  renderMessages();
  if (window.lucide) lucide.createIcons();
};
