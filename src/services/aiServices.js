const axios = require('axios');

/**
 * Service for interacting with Anthropic Claude API
 */
class ClaudeService {
  /**
   * @param {string} apiKey Anthropic API key
   */
  constructor(apiKey) {
    if (!apiKey) throw new Error('Missing Anthropic API key');
    this.apiKey = apiKey;
    this.baseURL = 'https://api.anthropic.com/v1/messages';
    this.model = 'claude-3-5-sonnet-20241022';
    this.headers = {
      'x-api-key': this.apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    };
    this.timeout = 30000;
  }

  /**
   * Send a general message to Claude
   * @param {string} message
   * @param {Array} history
   * @returns {Promise<string>}
   */
  async sendMessage(message, history = []) {
    return this.requestProgramming(message, history, false);
  }

  /**
   * Request programming/code from Claude with programmer system prompt
   * @param {string} task
   * @param {Array} history
   * @param {boolean} [isProgrammer=true]
   * @returns {Promise<string>}
   */
  async requestProgramming(task, history = [], isProgrammer = true) {
    const systemPrompt = isProgrammer
      ? 'You are a programmer. Write functional code, explain decisions, end with STATUS: [WORKING/COMPLETE/NEED_FEEDBACK]'
      : '';
    const messages = [
      ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
      ...history,
      { role: 'user', content: task },
    ];
    try {
      const response = await axios.post(
        this.baseURL,
        {
          model: this.model,
          max_tokens: 2048,
          messages,
        },
        {
          headers: this.headers,
          timeout: this.timeout,
        }
      );
      if (response.data && response.data.content) {
        return response.data.content;
      }
      throw new Error('Invalid response from Claude API');
    } catch (error) {
      this.handleError(error, 'Claude');
    }
  }

  /**
   * Handle and log errors
   * @param {Error} error
   * @param {string} service
   */
  handleError(error, service) {
    if (error.response) {
      console.error(`[${service} API Error]`, error.response.status, error.response.data);
      throw new Error(`${service} API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else if (error.code === 'ECONNABORTED') {
      throw new Error(`${service} API request timed out.`);
    } else {
      console.error(`[${service} API Error]`, error.message);
      throw new Error(`${service} API Error: ${error.message}`);
    }
  }
}

/**
 * Service for interacting with OpenAI ChatGPT API
 */
class ChatGPTService {
  /**
   * @param {string} apiKey OpenAI API key
   */
  constructor(apiKey) {
    if (!apiKey) throw new Error('Missing OpenAI API key');
    this.apiKey = apiKey;
    this.baseURL = 'https://api.openai.com/v1/chat/completions';
    this.model = 'gpt-4-turbo-preview';
    this.headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
    this.timeout = 30000;
  }

  /**
   * Send a general message to ChatGPT
   * @param {string} message
   * @param {Array} history
   * @returns {Promise<string>}
   */
  async sendMessage(message, history = []) {
    return this.provideFeedback(message, history, false);
  }

  /**
   * Provide feedback as a supervisor
   * @param {string} codeOrMessage
   * @param {Array} history
   * @param {boolean} [isSupervisor=true]
   * @returns {Promise<string>}
   */
  async provideFeedback(codeOrMessage, history = [], isSupervisor = true) {
    const systemPrompt = isSupervisor
      ? 'You are a code supervisor. Review code, provide constructive feedback, suggest improvements, assess completion'
      : '';
    const messages = [
      ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
      ...history,
      { role: 'user', content: codeOrMessage },
    ];
    try {
      const response = await axios.post(
        this.baseURL,
        {
          model: this.model,
          max_tokens: 2048,
          messages,
        },
        {
          headers: this.headers,
          timeout: this.timeout,
        }
      );
      if (response.data && response.data.choices && response.data.choices[0].message.content) {
        return response.data.choices[0].message.content;
      }
      throw new Error('Invalid response from OpenAI API');
    } catch (error) {
      this.handleError(error, 'OpenAI');
    }
  }

  /**
   * Handle and log errors
   * @param {Error} error
   * @param {string} service
   */
  handleError(error, service) {
    if (error.response) {
      console.error(`[${service} API Error]`, error.response.status, error.response.data);
      throw new Error(`${service} API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else if (error.code === 'ECONNABORTED') {
      throw new Error(`${service} API request timed out.`);
    } else {
      console.error(`[${service} API Error]`, error.message);
      throw new Error(`${service} API Error: ${error.message}`);
    }
  }
}

module.exports = { ClaudeService, ChatGPTService }; 