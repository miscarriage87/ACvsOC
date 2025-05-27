const socket = io();

const form = document.getElementById('task-form');
const input = document.getElementById('task-input');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const chatMessages = document.getElementById('chat-messages');
const statusBar = document.getElementById('status-bar');
const loadingIndicator = document.getElementById('loading-indicator');
const claudeModelSelect = document.getElementById('claude-model-select');
const openaiModelSelect = document.getElementById('openai-model-select');
const tokenCounter = document.getElementById('token-counter');

let sessionActive = false;
const turnIndicator = document.createElement('div');
turnIndicator.id = 'turn-indicator';
document.querySelector('.container').insertBefore(turnIndicator, document.getElementById('task-form'));

let sessionTimer = null;
let sessionStart = null;
let sessionInterval = null;
let currentTurn = null;
let maxIterations = 0;
let currentIteration = 0;
let totalTokens = 0;

function showLoading(show) {
  if (show) {
    loadingIndicator.innerHTML = '<div class="loading-spinner"></div>';
    loadingIndicator.style.display = 'block';
  } else {
    loadingIndicator.innerHTML = '';
    loadingIndicator.style.display = 'none';
  }
}

function setTurn(turn) {
  currentTurn = turn;
  if (turn === 'ai-claude') {
    turnIndicator.innerHTML = '<span class="icon-claude">🦙</span> <span style="color:#6366f1">Claude (Programmierer) denkt ...</span>';
  } else if (turn === 'ai-gpt') {
    turnIndicator.innerHTML = '<span class="icon-gpt">🤖</span> <span style="color:#be185d">ChatGPT (Reviewer) denkt ...</span>';
  } else {
    turnIndicator.innerHTML = '';
  }
}

function startSessionTimer() {
  sessionStart = Date.now();
  if (sessionInterval) clearInterval(sessionInterval);
  sessionInterval = setInterval(() => {
    if (!sessionStart) return;
    const elapsed = Math.floor((Date.now() - sessionStart) / 1000);
    statusBar.textContent = `⏱️ ${elapsed}s | Iteration: ${currentIteration}/${maxIterations}`;
  }, 1000);
}

function stopSessionTimer() {
  if (sessionInterval) clearInterval(sessionInterval);
  sessionInterval = null;
}

function updateTokenCounter() {
  tokenCounter.textContent = `Total tokens used: ${totalTokens}`;
}

async function loadModels() {
  startBtn.disabled = true;
  try {
    const [claudeRes, openaiRes] = await Promise.all([
      fetch('/api/models/anthropic'),
      fetch('/api/models/openai'),
    ]);
    const claudeData = await claudeRes.json();
    const openaiData = await openaiRes.json();
    claudeModelSelect.innerHTML = '';
    openaiModelSelect.innerHTML = '';
    (claudeData.models || []).forEach(m => {
      const opt = document.createElement('option');
      opt.value = m;
      opt.textContent = m;
      claudeModelSelect.appendChild(opt);
    });
    (openaiData.models || []).forEach(m => {
      const opt = document.createElement('option');
      opt.value = m;
      opt.textContent = m;
      openaiModelSelect.appendChild(opt);
    });
    startBtn.disabled = false;
  } catch (e) {
    claudeModelSelect.innerHTML = '<option>Fehler beim Laden</option>';
    openaiModelSelect.innerHTML = '<option>Fehler beim Laden</option>';
    startBtn.disabled = true;
    statusBar.textContent = 'Fehler beim Laden der Modelle.';
  }
}
window.addEventListener('DOMContentLoaded', loadModels);

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!input.value.trim() || sessionActive) return;
  sessionActive = true;
  startBtn.disabled = true;
  stopBtn.disabled = false;
  addMessage('user', input.value);
  socket.emit('start_task', {
    taskDescription: input.value,
    claudeModel: claudeModelSelect.value,
    openaiModel: openaiModelSelect.value
  });
  input.value = '';
  showLoading(true);
  statusBar.textContent = 'Collaboration started...';
});

stopBtn.addEventListener('click', () => {
  if (!sessionActive) return;
  sessionActive = false;
  startBtn.disabled = false;
  stopBtn.disabled = true;
  socket.emit('stop_task');
  addMessage('system', 'Collaboration stopped.');
  showLoading(false);
  statusBar.textContent = '';
});

socket.on('chat_message', (data) => {
  if (typeof data.tokens === 'number') {
    totalTokens += data.tokens;
    updateTokenCounter();
  }
  if (data.sender === 'system' && typeof data.message === 'string') {
    // Parse iteration/max from system message
    const iterMatch = data.message.match(/Iteration: (\d+) \/ (\d+)/);
    if (iterMatch) {
      currentIteration = parseInt(iterMatch[1], 10);
      maxIterations = parseInt(iterMatch[2], 10);
    }
    if (data.message.match(/Collaboration started/)) {
      startSessionTimer();
    }
    if (data.message.match(/Collaboration session ended/)) {
      stopSessionTimer();
      setTurn(null);
    }
    if (data.message.match(/Total tokens used:/)) {
      tokenCounter.textContent = data.message;
    }
    statusBar.textContent = data.message;
  }
  if (data.sender === 'ai-claude') setTurn('ai-claude');
  if (data.sender === 'ai-gpt') setTurn('ai-gpt');
  addMessage(data.sender, data.message, data.tokens);
  if (data.sender === 'ai-claude' || data.sender === 'ai-gpt') showLoading(false);
});

socket.on('error_message', (msg) => {
  addMessage('system', msg);
  showLoading(false);
});

function addMessage(sender, message, tokens) {
  const li = document.createElement('li');
  let icon = '';
  if (sender === 'user') icon = '<span class="icon-user">🧑‍💻</span>';
  if (sender === 'ai-claude') icon = '<span class="icon-claude">🦙</span>';
  if (sender === 'ai-gpt') icon = '<span class="icon-gpt">🤖</span>';
  let html = '';
  if (typeof message === 'object') {
    html = icon + '<pre>' + JSON.stringify(message, null, 2) + '</pre>';
    li.style.fontFamily = 'monospace';
    li.style.background = '#f3f4f6';
  } else if (sender === 'ai-claude' || sender === 'ai-gpt') {
    // Render as Markdown
    html = icon + '<span class="markdown-msg">' + marked.parse(message) + '</span>';
    if (typeof tokens === 'number') {
      html += `<span class="token-badge">· ${tokens} tokens</span>`;
    }
  } else {
    html = icon + ' ' + message;
  }
  li.innerHTML = html;
  if (sender === 'user') li.classList.add('user');
  else if (sender === 'ai-claude') li.classList.add('ai', 'ai-claude');
  else if (sender === 'ai-gpt') li.classList.add('ai', 'ai-gpt');
  else if (sender === 'system') {
    li.classList.add('system');
    li.style.fontStyle = 'italic';
    li.style.fontFamily = 'monospace';
    li.style.background = '#e0e7ef';
  }
  if (sender === 'system' && message && message.toLowerCase().includes('error')) {
    li.classList.add('error');
    li.style.color = '#b91c1c';
    li.style.fontWeight = 'bold';
  }
  chatMessages.appendChild(li);
  chatMessages.scrollTop = chatMessages.scrollHeight;
} 