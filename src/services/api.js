import config from '../config';

class ApiService {
  constructor() {
    this.baseURL = config.API_BASE_URL;
    this.timeout = config.DEFAULT_TIMEOUT;
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: this.timeout,
    };

    const finalOptions = { ...defaultOptions, ...options };

    try {
      const response = await fetch(url, finalOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async healthCheck() {
    return this.makeRequest('/api/health');
  }

  async chunkText(text, maxChars = config.MAX_CHUNK_SIZE) {
    return this.makeRequest('/api/chunk-text', {
      method: 'POST',
      body: JSON.stringify({ text, max_chars: maxChars }),
    });
  }
}

export default new ApiService();
