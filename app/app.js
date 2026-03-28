/* ═══════════════════════════════════════════
   Rou Rou AI Companion — App Logic
   Navigation, interactions, and chat demo
   ═══════════════════════════════════════════ */

// ── Navigation State ──
let currentPage = 'mode';
let previousPage = null;
const pageHistory = ['mode'];

function navigateTo(pageId) {
  if (pageId === currentPage) return;

  previousPage = currentPage;

  // Deactivate current page
  const current = document.getElementById('page-' + currentPage);
  if (current) {
    current.classList.remove('active');
    current.classList.add('exit-left');
    setTimeout(() => current.classList.remove('exit-left'), 400);
  }

  // Activate target page
  const target = document.getElementById('page-' + pageId);
  if (target) {
    target.classList.add('active');
    // Scroll to top
    const scrollArea = target.querySelector('.scroll-area');
    if (scrollArea) scrollArea.scrollTop = 0;
  }

  // Update nav
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === pageId);
  });

  // Track history
  pageHistory.push(pageId);
  currentPage = pageId;
}

function goBack() {
  if (pageHistory.length > 1) {
    pageHistory.pop();
    const prev = pageHistory[pageHistory.length - 1];
    navigateTo(prev);
    pageHistory.pop(); // Remove duplicate from navigateTo pushing again
  }
}

// ── Mode Selection ──
function selectMode(el) {
  // Remove active from all
  document.querySelectorAll('.mode-card, .mode-card-small').forEach(card => {
    card.classList.remove('mode-active');
    const badge = card.querySelector('.active-badge');
    if (badge) badge.remove();
  });

  // Set active on clicked
  el.classList.add('mode-active');
  const badge = document.createElement('div');
  badge.className = 'active-badge';
  badge.textContent = 'ACTIVE';
  el.appendChild(badge);

  // Update current mode indicator
  const modeName = el.querySelector('h3')?.textContent || '';
  const indicator = document.querySelector('.current-mode-name');
  if (indicator) indicator.textContent = modeName;

  // Update chat status
  const statusMode = document.querySelector('.status-mode');
  if (statusMode) {
    const modeMap = {
      'void': '樹洞模式',
      'soulmate': '靈魂伴侶',
      'mission': '任務引導',
      'option': '選擇模式',
      'natural': '自然聊天'
    };
    const modeKey = el.dataset.mode || '';
    statusMode.textContent = '模式：' + (modeMap[modeKey] || modeName);
  }
}

// ── Chat ──
function sendMessage() {
  const input = document.getElementById('chat-input');
  const msg = input.value.trim();
  if (!msg) return;

  const container = document.getElementById('chat-messages');

  // Create user message
  const cluster = document.createElement('div');
  cluster.className = 'msg-cluster user';
  cluster.innerHTML = `
    <div class="bubble user-bubble">
      <p>${escapeHtml(msg)}</p>
    </div>
  `;

  // Insert before typing indicator
  const typingEl = container.querySelector('.typing-indicator');
  container.insertBefore(cluster, typingEl);

  // Clear input
  input.value = '';

  // Animate in
  cluster.style.opacity = '0';
  cluster.style.transform = 'translateY(10px)';
  requestAnimationFrame(() => {
    cluster.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    cluster.style.opacity = '1';
    cluster.style.transform = 'translateY(0)';
  });

  // Scroll to bottom
  container.scrollTop = container.scrollHeight;

  // Simulate AI response
  simulateResponse(container);
}

function simulateResponse(container) {
  // Show typing indicator
  const typingEl = container.querySelector('.typing-indicator');
  if (typingEl) typingEl.style.display = 'flex';

  container.scrollTop = container.scrollHeight;

  const responses = [
    '聽起來你今天承受了不少壓力呢。工作忙碌的時候，能停下來跟我聊聊已經是很棒的事了。',
    '我理解那種累的感覺。記得今天要喝個水、伸伸懶腰喔。你對自己最好的照顧，就是承認自己需要休息。',
    '謝謝你願意跟我分享。有時候光是把事情說出來，心裡就會輕一點。你現在想做什麼呢？',
    '你很勇敢，即使累了也願意面對這些。我在這裡陪你，不急。',
    '嗯，我聽到了。每個人都有覺得很重的時候。要不要試著深呼吸一下？'
  ];

  setTimeout(() => {
    if (typingEl) typingEl.style.display = 'none';

    const aiCluster = document.createElement('div');
    aiCluster.className = 'msg-cluster ai';
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    aiCluster.innerHTML = `
      <div class="bubble ai-bubble">
        <p>${randomResponse}</p>
      </div>
    `;

    const insightFloat = container.querySelector('.insight-float');
    container.insertBefore(aiCluster, insightFloat);

    // Animate
    aiCluster.style.opacity = '0';
    aiCluster.style.transform = 'translateY(10px)';
    requestAnimationFrame(() => {
      aiCluster.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
      aiCluster.style.opacity = '1';
      aiCluster.style.transform = 'translateY(0)';
    });

    container.scrollTop = container.scrollHeight;
  }, 1500 + Math.random() * 1000);
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// ── Quick Reply ──
document.querySelectorAll('.quick-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = document.getElementById('chat-input');
    input.value = btn.textContent;
    sendMessage();
  });
});

// ── Enter key to send ──
document.getElementById('chat-input')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    sendMessage();
  }
});

// ── Voice button interaction ──
document.querySelectorAll('.voice-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.voice-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// ── Mode option in settings ──
document.querySelectorAll('.mode-option').forEach(opt => {
  opt.addEventListener('click', () => {
    document.querySelectorAll('.mode-option').forEach(o => o.classList.remove('selected'));
    opt.classList.add('selected');
  });
});

// ── Remove insight button ──
document.querySelectorAll('.remove-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const row = btn.closest('.insight-row');
    if (row) {
      row.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      row.style.opacity = '0';
      row.style.transform = 'translateX(-20px)';
      row.style.maxHeight = row.offsetHeight + 'px';
      setTimeout(() => {
        row.style.maxHeight = '0';
        row.style.padding = '0';
        row.style.margin = '0';
        setTimeout(() => row.remove(), 300);
      }, 300);
    }
  });
});

// ── Initialize ──
document.addEventListener('DOMContentLoaded', () => {
  // Set initial page
  navigateTo('mode');
});
