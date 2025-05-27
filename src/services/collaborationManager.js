const { ClaudeService, ChatGPTService } = require('./aiServices');

/**
 * Orchestrates an AI collaboration session between Claude and ChatGPT
 */
class AICollaborationSession {
  /**
   * @param {object} options
   * @param {ClaudeService} options.claudeService
   * @param {ChatGPTService} options.chatGPTService
   * @param {object} options.socket
   * @param {string} options.task
   * @param {number} [options.maxIterations=8]
   * @param {number} [options.timeLimit=180]
   */
  constructor({ claudeService, chatGPTService, socket, task, maxIterations = 8, timeLimit = 180 }) {
    this.claudeService = claudeService;
    this.chatGPTService = chatGPTService;
    this.socket = socket;
    this.task = task;
    this.maxIterations = maxIterations;
    this.timeLimit = timeLimit; // seconds
    this.iteration = 0;
    this.history = [];
    this.active = false;
    this.status = 'WORKING';
    this.startTime = null;
  }

  /**
   * Start the collaboration session
   */
  async start() {
    this.active = true;
    this.startTime = Date.now();
    this.iteration = 0;
    this.status = 'WORKING';
    this.history = [];
    this.socket.emit('chat_message', { sender: 'system', message: 'Collaboration started.' });
    await this.loop();
  }

  /**
   * Main collaboration loop
   */
  async loop() {
    while (this.active && this.shouldContinue()) {
      this.iteration++;
      // Claude as programmer
      let claudeReply;
      try {
        claudeReply = await this.sendToClaude();
        this.socket.emit('chat_message', { sender: 'ai', message: claudeReply });
      } catch (err) {
        this.socket.emit('error_message', `Claude error: ${err.message}`);
        break;
      }
      this.history.push({ role: 'assistant', content: claudeReply });
      // Check for status in Claude's reply
      const statusMatch = claudeReply.match(/STATUS:\s*\[(WORKING|COMPLETE|NEED_FEEDBACK)\]/i);
      this.status = statusMatch ? statusMatch[1].toUpperCase() : 'WORKING';
      if (this.status === 'COMPLETE') break;
      // ChatGPT as supervisor
      let chatGptReply;
      try {
        chatGptReply = await this.sendToChatGPT();
        this.socket.emit('chat_message', { sender: 'ai', message: chatGptReply });
      } catch (err) {
        this.socket.emit('error_message', `ChatGPT error: ${err.message}`);
        break;
      }
      this.history.push({ role: 'user', content: chatGptReply });
      // Optionally, check for stop condition in feedback
    }
    this.active = false;
    this.socket.emit('chat_message', { sender: 'system', message: 'Collaboration session ended.' });
  }

  /**
   * Send message to Claude (programmer)
   */
  async sendToClaude() {
    return await this.claudeService.requestProgramming(this.task, this.history);
  }

  /**
   * Send message to ChatGPT (supervisor)
   */
  async sendToChatGPT() {
    // Last Claude reply is the code to review
    const lastClaude = this.history[this.history.length - 1]?.content || '';
    return await this.chatGPTService.provideFeedback(lastClaude, this.history);
  }

  /**
   * Should the session continue?
   */
  shouldContinue() {
    if (this.status === 'COMPLETE') return false;
    if (this.iteration >= this.maxIterations) return false;
    if ((Date.now() - this.startTime) / 1000 > this.timeLimit) return false;
    return true;
  }

  /**
   * Stop the session
   */
  stop() {
    this.active = false;
  }
}

module.exports = { AICollaborationSession }; 