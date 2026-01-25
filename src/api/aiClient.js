/**
 * AI Client with Timeout, Retry, and Error Handling
 * Handles all AI API calls with robust error recovery
 */

// Timeout constants
const AI_REQUEST_TIMEOUT = 30000; // 30 seconds
const AI_MAX_RETRIES = 2;
const AI_RETRY_DELAY = 1000; // 1 second

/**
 * Create a timeout promise
 * @param {number} ms - Timeout in milliseconds
 * @returns {Promise<never>}
 */
const createTimeout = (ms) => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Request timeout after ${ms}ms`));
    }, ms);
  });
};

/**
 * Sleep utility for retry delays
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generate AI response with timeout and retry logic
 * @param {string} prompt - The prompt to send to AI
 * @param {string} systemInstruction - Optional system instruction
 * @param {Object} options - Additional options
 * @returns {Promise<string|null>}
 */
export const generateOpenRouterResponse = async (
  prompt,
  systemInstruction = "",
  options = {}
) => {
  const {
    timeout = AI_REQUEST_TIMEOUT,
    maxRetries = AI_MAX_RETRIES,
    retryDelay = AI_RETRY_DELAY,
    model = "deepseek/deepseek-chat-v3-0324"
  } = options;

  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  
  if (!apiKey) {
    console.warn("OpenRouter API key not configured");
    return null;
  }
  
  const messages = [];
  if (systemInstruction) {
    messages.push({ role: "system", content: systemInstruction });
  }
  messages.push({ role: "user", content: prompt });

  let lastError = null;

  // Retry loop
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`AI Request attempt ${attempt + 1}/${maxRetries + 1}`);

      // Create request with timeout
      const requestPromise = fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Speed Planner',
          'X-Request-ID': `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      // Race between request and timeout
      const response = await Promise.race([
        requestPromise,
        createTimeout(timeout)
      ]);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(
          `OpenRouter API Error: ${response.status} ${response.statusText} - ${
            errorData.error?.message || errorData.message || 'Unknown error'
          }`
        );
        error.status = response.status;
        error.data = errorData;
        throw error;
      }
      
      const data = await response.json();
      
      // Validate response structure
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response structure from OpenRouter API');
      }

      const result = data.choices[0].message.content;
      
      if (attempt > 0) {
        console.log(`✅ Request succeeded after ${attempt} retries`);
      }
      
      return result;
      
    } catch (error) {
      lastError = error;
      console.error(`AI Request attempt ${attempt + 1} failed:`, error.message);

      // Don't retry on certain errors
      if (error.status === 401 || error.status === 403) {
        console.error('Authentication error - not retrying');
        return null;
      }

      if (error.status === 400) {
        console.error('Bad request - not retrying');
        return null;
      }

      // Wait before retry (except on last attempt)
      if (attempt < maxRetries) {
        const delay = retryDelay * Math.pow(2, attempt); // Exponential backoff
        console.log(`Retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }

  // All retries exhausted
  console.error('All AI request retries failed:', lastError?.message);
  return null;
};

/**
 * Legacy alias for backward compatibility
 */
export const generateGeminiResponse = generateOpenRouterResponse;

/**
 * Batch AI requests for multiple prompts
 * @param {Array<{prompt: string, systemInstruction?: string}>} requests
 * @param {Object} options
 * @returns {Promise<Array<string|null>>}
 */
export const batchGenerateAIResponses = async (requests, options = {}) => {
  const results = await Promise.all(
    requests.map(req => 
      generateOpenRouterResponse(req.prompt, req.systemInstruction, options)
    )
  );
  return results;
};

/**
 * Generate AI response with streaming (for future use)
 * @param {string} prompt - The prompt to send
 * @param {Function} onChunk - Callback for each chunk
 * @param {Function} onComplete - Callback when complete
 * @returns {Promise<void>}
 */
export const generateStreamingResponse = async (
  prompt,
  onChunk,
  onComplete
) => {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OpenRouter API key not configured');
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Speed Planner'
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat-v3-0324",
        messages: [{ role: "user", content: prompt }],
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim() !== '');

      for (const line of lines) {
        if (line === 'data: [DONE]') {
          onComplete(fullResponse);
          return;
        }
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            const content = data.choices[0]?.delta?.content;
            if (content) {
              fullResponse += content;
              onChunk(content);
            }
          } catch (e) {
            console.error('Error parsing SSE data:', e);
          }
        }
      }
    }
  } catch (error) {
    console.error('Streaming request failed:', error);
    throw error;
  }
};

/**
 * Health check for AI service
 * @returns {Promise<boolean>}
 */
export const checkAIServiceHealth = async () => {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (!apiKey) {
    return false;
  }

  try {
    const response = await Promise.race([
      fetch("https://openrouter.ai/api/v1/models", {
        headers: { 
          'Authorization': `Bearer ${apiKey}`
        }
      }),
      createTimeout(5000) // 5 second timeout for health check
    ]);

    return response.ok;
  } catch (error) {
    console.error('AI service health check failed:', error);
    return false;
  }
};

/**
 * Get AI request statistics
 */
export const getAIRequestStats = () => {
  try {
    const stats = JSON.parse(localStorage.getItem('aiRequestStats') || '{}');
    return {
      totalRequests: stats.totalRequests || 0,
      successfulRequests: stats.successfulRequests || 0,
      failedRequests: stats.failedRequests || 0,
      averageResponseTime: stats.averageResponseTime || 0,
      lastRequestTime: stats.lastRequestTime || null
    };
  } catch (error) {
    console.error('Error reading AI stats:', error);
    return null;
  }
};

/**
 * Reset AI request statistics
 */
export const resetAIRequestStats = () => {
  localStorage.removeItem('aiRequestStats');
};
