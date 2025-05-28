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
   * @param {string} options.claudeModel
   * @param {string} options.openaiModel
   * @param {number} [options.maxIterations=8]
   * @param {number} [options.timeLimit=180]
   * @param {boolean} [options.autoRun=true]
   */
  constructor({ claudeService, chatGPTService, socket, task, claudeModel, openaiModel, maxIterations = 8, timeLimit = 180, autoRun = true }) {
    this.claudeService = claudeService;
    this.chatGPTService = chatGPTService;
    this.socket = socket;
    this.task = task;
    this.claudeModel = claudeModel;
    this.openaiModel = openaiModel;
    this.maxIterations = maxIterations;
    this.timeLimit = timeLimit; // seconds
    this.iteration = 0;
    this.history = [];
    this.active = false;
    this.status = 'WORKING';
    this.startTime = null;
    this.totalTokens = 0;
    this.autoRun = autoRun;
    this._continueResolver = null;
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
      const timeLeft = Math.max(0, this.timeLimit - Math.floor((Date.now() - this.startTime) / 1000));
      this.socket.emit('chat_message', { sender: 'system', message: `Iteration: ${this.iteration} / ${this.maxIterations} | Time left: ${timeLeft}s | Status: ${this.status}` });
      this.socket.emit('chat_message', { sender: 'system', message: `Tokens used so far: ${this.totalTokens}` });
      console.log(`[Session] Iteration ${this.iteration} started. Time left: ${timeLeft}s, Status: ${this.status}`);
      // Claude as programmer
      let claudeReply, claudeTokens = 0;
      let claudeStart = Date.now();
      try {
        const result = await this.claudeService.sendMessage({ message: this.task, history: this.history, model: this.claudeModel });
        claudeReply = result.content;
        claudeTokens = result.tokens || 0;
        this.totalTokens += claudeTokens;
        if (typeof claudeReply !== 'string') claudeReply = JSON.stringify(claudeReply);
        const elapsed = Math.floor((Date.now() - claudeStart) / 1000);
        this.socket.emit('chat_message', { sender: 'ai-claude', message: `[Claude] (${elapsed}s):\n${claudeReply}`, tokens: claudeTokens });
        console.log(`[Session] Claude finished in ${elapsed}s. Tokens: ${claudeTokens}`);
      } catch (err) {
        this.socket.emit('error_message', `Claude error: ${err.message}`);
        console.log(`[Session] Claude error: ${err.message}`);
        break;
      }
      this.history.push({ role: 'assistant', content: claudeReply });
      // Check for status in Claude's reply
      let statusMatch = null;
      if (typeof claudeReply === 'string') {
        statusMatch = claudeReply.match(/STATUS:\s*\[(WORKING|COMPLETE|NEED_FEEDBACK)\]/i);
      }
      this.status = statusMatch ? statusMatch[1].toUpperCase() : 'WORKING';
      if (this.status === 'COMPLETE') break;
      // ChatGPT as supervisor
      let chatGptReply, gptTokens = 0;
      let gptStart = Date.now();
      try {
        const result = await this.chatGPTService.sendMessage({ message: claudeReply, history: this.history, model: this.openaiModel });
        chatGptReply = result.content;
        gptTokens = result.tokens || 0;
        this.totalTokens += gptTokens;
        if (typeof chatGptReply !== 'string') chatGptReply = JSON.stringify(chatGptReply);
        const elapsed = Math.floor((Date.now() - gptStart) / 1000);
        this.socket.emit('chat_message', { sender: 'ai-gpt', message: `[ChatGPT] (${elapsed}s):\n${chatGptReply}`, tokens: gptTokens });
        console.log(`[Session] ChatGPT finished in ${elapsed}s. Tokens: ${gptTokens}`);
      } catch (err) {
        this.socket.emit('error_message', `ChatGPT error: ${err.message}`);
        console.log(`[Session] ChatGPT error: ${err.message}`);
        break;
      }
      this.history.push({ role: 'user', content: chatGptReply });
      // Wenn autoRun false, dann warte auf continueRound
      if (!this.autoRun && this.active && this.shouldContinue()) {
        await new Promise(resolve => {
          this._continueResolver = resolve;
          this.socket.emit('chat_message', { sender: 'system', message: 'WAIT_FOR_CONTINUE' });
        });
        this._continueResolver = null;
      }
    }
    this.active = false;
    this.socket.emit('chat_message', { sender: 'system', message: `Collaboration session ended. Iterations: ${this.iteration}, Status: ${this.status}` });
    this.socket.emit('chat_message', { sender: 'system', message: `Total tokens used: ${this.totalTokens}` });
    console.log(`[Session] Collaboration session ended. Iterations: ${this.iteration}, Status: ${this.status}, Total tokens: ${this.totalTokens}`);
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

  /**
   * Ermöglicht das Fortsetzen der Runde bei autoRun=OFF
   */
  continueRound() {
    if (this._continueResolver) {
      this._continueResolver();
    }
  }
}

module.exports = { AICollaborationSession }; 