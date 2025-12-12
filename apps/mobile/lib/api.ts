/**
 * API Client
 * 
 * Centralized API client for making requests to external services.
 * All API calls should go through this module for consistent error handling.
 */

/**
 * Base configuration for API requests
 */
interface ApiConfig {
  baseUrl: string;
  headers?: Record<string, string>;
  timeout?: number;
}

/**
 * API response wrapper
 */
interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

/**
 * Generic fetch wrapper with error handling
 */
async function fetchWithErrorHandling<T>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        data: null,
        error: errorText || `HTTP ${response.status}`,
        status: response.status,
      };
    }

    const data = await response.json();
    return {
      data,
      error: null,
      status: response.status,
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 0,
    };
  }
}

/**
 * Create an API client with a base URL
 */
export function createApiClient(config: ApiConfig) {
  const { baseUrl, headers: defaultHeaders, timeout } = config;

  return {
    async get<T>(endpoint: string, headers?: Record<string, string>) {
      const controller = new AbortController();
      const timeoutId = timeout 
        ? setTimeout(() => controller.abort(), timeout) 
        : null;

      try {
        return await fetchWithErrorHandling<T>(`${baseUrl}${endpoint}`, {
          method: 'GET',
          headers: { ...defaultHeaders, ...headers },
          signal: controller.signal,
        });
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
      }
    },

    async post<T>(
      endpoint: string, 
      body: unknown, 
      headers?: Record<string, string>
    ) {
      const controller = new AbortController();
      const timeoutId = timeout 
        ? setTimeout(() => controller.abort(), timeout) 
        : null;

      try {
        return await fetchWithErrorHandling<T>(`${baseUrl}${endpoint}`, {
          method: 'POST',
          body: JSON.stringify(body),
          headers: { ...defaultHeaders, ...headers },
          signal: controller.signal,
        });
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
      }
    },

    async put<T>(
      endpoint: string, 
      body: unknown, 
      headers?: Record<string, string>
    ) {
      return fetchWithErrorHandling<T>(`${baseUrl}${endpoint}`, {
        method: 'PUT',
        body: JSON.stringify(body),
        headers: { ...defaultHeaders, ...headers },
      });
    },

    async delete<T>(endpoint: string, headers?: Record<string, string>) {
      return fetchWithErrorHandling<T>(`${baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: { ...defaultHeaders, ...headers },
      });
    },
  };
}

// ============================================
// Pre-configured API clients
// ============================================

/**
 * Supabase Edge Functions client
 * Use this for all backend API calls through Supabase
 */
export const edgeFunctions = createApiClient({
  baseUrl: `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1`,
  headers: {
    'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  },
  timeout: 30000,
});

/**
 * News API client (example external API)
 */
export const newsApi = createApiClient({
  baseUrl: 'https://newsapi.org/v2',
  headers: {
    'X-Api-Key': process.env.NEWS_API_KEY || '',
  },
  timeout: 10000,
});

// ============================================
// API call wrappers for specific services
// ============================================

/**
 * AI Services - calls to Supabase Edge Functions
 */
export const aiServices = {
  /**
   * Generate text using AI (OpenAI, etc.)
   */
  async generateText(prompt: string, options?: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
  }) {
    return edgeFunctions.post<{ text: string }>('/ai-generate', {
      prompt,
      ...options,
    });
  },

  /**
   * Generate speech from text (ElevenLabs, etc.)
   */
  async textToSpeech(text: string, options?: {
    voice?: string;
    speed?: number;
  }) {
    return edgeFunctions.post<{ audioUrl: string }>('/text-to-speech', {
      text,
      ...options,
    });
  },
};

/**
 * Social Media Services
 */
export const socialServices = {
  /**
   * Fetch social media feed
   */
  async getFeed(platform: 'twitter' | 'instagram', options?: {
    limit?: number;
    cursor?: string;
  }) {
    return edgeFunctions.post<{ posts: unknown[]; nextCursor?: string }>(
      '/social-feed',
      { platform, ...options }
    );
  },

  /**
   * Share content to social media
   */
  async share(platform: string, content: {
    text: string;
    imageUrl?: string;
    linkUrl?: string;
  }) {
    return edgeFunctions.post<{ success: boolean; postId?: string }>(
      '/social-share',
      { platform, ...content }
    );
  },
};

/**
 * News Services
 */
export const newsServices = {
  /**
   * Get top headlines
   */
  async getHeadlines(options?: {
    country?: string;
    category?: string;
    pageSize?: number;
  }) {
    const params = new URLSearchParams({
      country: options?.country || 'us',
      category: options?.category || 'general',
      pageSize: String(options?.pageSize || 10),
    });
    return newsApi.get<{
      articles: Array<{
        title: string;
        description: string;
        url: string;
        urlToImage: string;
        publishedAt: string;
        source: { name: string };
      }>;
    }>(`/top-headlines?${params}`);
  },

  /**
   * Search news articles
   */
  async searchNews(query: string, options?: {
    sortBy?: 'relevancy' | 'popularity' | 'publishedAt';
    pageSize?: number;
  }) {
    const params = new URLSearchParams({
      q: query,
      sortBy: options?.sortBy || 'publishedAt',
      pageSize: String(options?.pageSize || 10),
    });
    return newsApi.get<{
      articles: Array<{
        title: string;
        description: string;
        url: string;
        urlToImage: string;
        publishedAt: string;
        source: { name: string };
      }>;
    }>(`/everything?${params}`);
  },
};
