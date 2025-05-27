const axios = require('axios');

const CLAUDE_INIT_PROMPT = 'Du bist Claude, ein KI-Modell von Anthropic. Du kannst, falls sinnvoll, in Markdown antworten.';
const GPT_INIT_PROMPT = 'Du bist ChatGPT, ein KI-Modell von OpenAI. Du kannst, falls sinnvoll, in Markdown antworten.';

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
   * @param {string} model
   * @returns {Promise<{content: string, tokens: number}>}
   */
  async sendMessage({ message, history = [], model }) {
    const messages = [
      { role: 'user', content: CLAUDE_INIT_PROMPT },
      ...history,
      { role: 'user', content: message },
    ];
    const body = {
      model,
      max_tokens: 2048,
      messages,
      system: CLAUDE_INIT_PROMPT,
    };
    const start = Date.now();
    try {
      const response = await axios.post(
        this.baseURL,
        body,
        {
          headers: this.headers,
          timeout: this.timeout,
        }
      );
      let content = '';
      if (response.data && typeof response.data.content === 'string') {
        content = response.data.content;
      } else if (response.data && Array.isArray(response.data.content)) {
        content = response.data.content.map(c => c.text || c).join('\n');
      } else if (response.data && response.data.text) {
        content = response.data.text;
      } else {
        content = JSON.stringify(response.data);
      }
      // Token usage: sum input_tokens + output_tokens if available
      let tokens = null;
      if (response.data && response.data.usage) {
        tokens = (response.data.usage.input_tokens || 0) + (response.data.usage.output_tokens || 0);
      }
      const duration = Math.floor((Date.now() - start) / 1000);
      logStep({ model, role: 'claude', action: 'response', duration });
      return { content, tokens };
    } catch (error) {
      const duration = Math.floor((Date.now() - start) / 1000);
      logStep({ model, role: 'claude', action: 'error', duration, error: error.message });
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

  static async fetchAvailableModels(apiKey) {
    // Anthropic does not have a public models endpoint, so return a static list for now
    return [
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',
      'claude-3-5-sonnet-20241022',
    ];
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
   * @param {string} model
   * @returns {Promise<{content: string, tokens: number}>}
   */
  async sendMessage({ message, history = [], model }) {
    const messages = [
      { role: 'system', content: GPT_INIT_PROMPT },
      ...history,
      { role: 'user', content: message },
    ];
    const body = {
      model,
      max_tokens: 2048,
      messages,
    };
    const start = Date.now();
    try {
      const response = await axios.post(
        this.baseURL,
        body,
        {
          headers: this.headers,
          timeout: this.timeout,
        }
      );
      let content = '';
      if (response.data && response.data.choices && response.data.choices[0].message && typeof response.data.choices[0].message.content === 'string') {
        content = response.data.choices[0].message.content;
      } else {
        content = JSON.stringify(response.data);
      }
      // Token usage: usage.total_tokens
      let tokens = null;
      if (response.data && response.data.usage && typeof response.data.usage.total_tokens === 'number') {
        tokens = response.data.usage.total_tokens;
      }
      const duration = Math.floor((Date.now() - start) / 1000);
      logStep({ model, role: 'chatgpt', action: 'response', duration });
      return { content, tokens };
    } catch (error) {
      const duration = Math.floor((Date.now() - start) / 1000);
      logStep({ model, role: 'chatgpt', action: 'error', duration, error: error.message });
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

  static async fetchAvailableModels(apiKey) {
    try {
      const response = await axios.get('https://api.openai.com/v1/models', {
        headers: { 'Authorization': `Bearer ${apiKey}` },
        timeout: 10000,
      });
      // Only return chat/completions models
      return response.data.data
        .filter(m => m.id.startsWith('gpt-'))
        .map(m => m.id);
    } catch (error) {
      return ['gpt-4-turbo-preview', 'gpt-4', 'gpt-3.5-turbo'];
    }
  }
}

function logStep({ model, role, action, duration, error }) {
  const ts = new Date().toISOString();
  let msg = `[${ts}] [${model}] [${role}] ${action}`;
  if (duration !== undefined) msg += ` (${duration}s)`;
  if (error) msg += ` | ERROR: ${error}`;
  console.log(msg);
}

module.exports = { ClaudeService, ChatGPTService }; 