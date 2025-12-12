// Supabase Edge Function: News API
//
// Fetches news from external news APIs (NewsAPI, etc).
// This is a framework for integrating news content into your app.
//
// GET /functions/v1/news?category=technology&limit=10
// POST /functions/v1/news (with body for more complex queries)

import {
  handleCors,
  jsonResponse,
  errorResponse,
  parseRequestBody,
} from "../_shared/utils.ts";

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  urlToImage?: string;
  publishedAt: string;
  source: {
    name: string;
    id?: string;
  };
  author?: string;
  content?: string;
}

interface NewsResponse {
  articles: NewsArticle[];
  totalResults: number;
}

interface NewsQuery {
  category?: string;
  q?: string;
  country?: string;
  limit?: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Get NewsAPI key
    const newsApiKey = Deno.env.get("NEWS_API_KEY");
    if (!newsApiKey) {
      console.error("NEWS_API_KEY not configured");
      return errorResponse("News service not configured", 500);
    }

    let query: NewsQuery = {};

    // Parse query params or body
    if (req.method === "GET") {
      const url = new URL(req.url);
      query = {
        category: url.searchParams.get("category") || undefined,
        q: url.searchParams.get("q") || undefined,
        country: url.searchParams.get("country") || "us",
        limit: parseInt(url.searchParams.get("limit") || "10"),
      };
    } else if (req.method === "POST") {
      const body = await parseRequestBody<NewsQuery>(req);
      if (body) {
        query = body;
      }
    } else {
      return errorResponse("Method not allowed", 405);
    }

    // Build NewsAPI URL
    // Documentation: https://newsapi.org/docs
    const params = new URLSearchParams({
      apiKey: newsApiKey,
      country: query.country || "us",
      pageSize: String(Math.min(query.limit || 10, 100)),
    });

    if (query.category) {
      params.append("category", query.category);
    }

    if (query.q) {
      params.append("q", query.q);
    }

    // Determine endpoint based on query
    const endpoint = query.q
      ? "https://newsapi.org/v2/everything"
      : "https://newsapi.org/v2/top-headlines";

    const response = await fetch(`${endpoint}?${params.toString()}`);

    if (!response.ok) {
      const errorData = await response.text();
      console.error("NewsAPI error:", errorData);
      return errorResponse("Failed to fetch news", 500);
    }

    const data = await response.json();

    // Transform response
    const articles: NewsArticle[] = data.articles.map((article: any) => ({
      title: article.title,
      description: article.description,
      url: article.url,
      urlToImage: article.urlToImage,
      publishedAt: article.publishedAt,
      source: article.source,
      author: article.author,
      content: article.content,
    }));

    const newsResponse: NewsResponse = {
      articles,
      totalResults: data.totalResults,
    };

    return jsonResponse(newsResponse);
  } catch (error) {
    console.error("News fetch error:", error);
    return errorResponse("Internal server error", 500);
  }
});
