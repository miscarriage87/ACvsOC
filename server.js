require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const path = require('path');
const { ClaudeService, ChatGPTService } = require('./src/services/aiServices');
const { AICollaborationSession } = require('./src/services/collaborationManager');

// Validate environment variables
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('Missing ANTHROPIC_API_KEY in environment');
  process.exit(1);
}
if (!process.env.OPENAI_API_KEY) {
  console.error('Missing OPENAI_API_KEY in environment');
  process.exit(1);
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Basic API route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// AI service instances
const claudeService = new ClaudeService(process.env.ANTHROPIC_API_KEY);
const chatGPTService = new ChatGPTService(process.env.OPENAI_API_KEY);

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  let session = null;

  socket.on('start_task', async (taskDescription) => {
    if (session && session.active) {
      socket.emit('error_message', 'A session is already running. Please stop it first.');
      return;
    }
    try {
      session = new AICollaborationSession({
        claudeService,
        chatGPTService,
        socket,
        task: taskDescription,
        maxIterations: 8,
        timeLimit: 180
      });
      await session.start();
    } catch (err) {
      socket.emit('error_message', `Session error: ${err.message}`);
    }
  });

  socket.on('stop_task', () => {
    if (session) {
      session.stop();
      socket.emit('chat_message', {
        sender: 'system',
        message: 'Collaboration stopped.'
      });
    }
  });

  socket.on('disconnect', () => {
    if (session) session.stop();
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 