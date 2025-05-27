const socket = io();

const form = document.getElementById('task-form');
const input = document.getElementById('task-input');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const chatMessages = document.getElementById('chat-messages');

let sessionActive = false;

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!input.value.trim() || sessionActive) return;
  sessionActive = true;
  startBtn.disabled = true;
  stopBtn.disabled = false;
  addMessage('user', input.value);
  socket.emit('start_task', input.value);
  input.value = '';
});

stopBtn.addEventListener('click', () => {
  if (!sessionActive) return;
  sessionActive = false;
  startBtn.disabled = false;
  stopBtn.disabled = true;
  socket.emit('stop_task');
  addMessage('system', 'Collaboration stopped.');
});

socket.on('chat_message', (data) => {
  addMessage(data.sender, data.message);
});

socket.on('error_message', (msg) => {
  addMessage('system', msg);
});

function addMessage(sender, message) {
  const li = document.createElement('li');
  li.textContent = message;
  if (sender === 'user') li.classList.add('user');
  else if (sender === 'ai') li.classList.add('ai');
  else li.style.fontStyle = 'italic';
  chatMessages.appendChild(li);
  chatMessages.scrollTop = chatMessages.scrollHeight;
} 