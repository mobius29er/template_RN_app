// Supabase Edge Function: Social Media API
//
// Framework for integrating social media APIs (Twitter, Instagram, etc).
// This provides a unified interface for social media content.
//
// GET /functions/v1/social-media?platform=twitter&type=feed&limit=10
// POST /functions/v1/social-media (with body for posting content)

import {
  handleCors,
  jsonResponse,
  errorResponse,
  parseRequestBody,
} from "../_shared/utils.ts";

// Supported platforms
type Platform = "twitter" | "instagram" | "tiktok" | "youtube";

interface SocialMediaPost {
  id: string;
  platform: Platform;
  author: {
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  content: string;
  mediaUrls?: string[];
  likes: number;
  comments: number;
  shares: number;
  createdAt: string;
  url: string;
}

interface SocialMediaQuery {
  platform: Platform;
  type: "feed" | "user" | "hashtag" | "search";
  query?: string;
  limit?: number;
}

interface SocialMediaResponse {
  posts: SocialMediaPost[];
  nextCursor?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    let query: SocialMediaQuery;

    // Parse query params or body
    if (req.method === "GET") {
      const url = new URL(req.url);
      query = {
        platform: url.searchParams.get("platform") as Platform || "twitter",
        type: (url.searchParams.get("type") as any) || "feed",
        query: url.searchParams.get("query") || undefined,
        limit: parseInt(url.searchParams.get("limit") || "20"),
      };
    } else if (req.method === "POST") {
      const body = await parseRequestBody<SocialMediaQuery>(req);
      if (!body) {
        return errorResponse("Invalid request body");
      }
      query = body;
    } else {
      return errorResponse("Method not allowed", 405);
    }

    // Get platform-specific API keys
    const apiKey = Deno.env.get(`${query.platform.toUpperCase()}_API_KEY`);
    
    // NOTE: This is a framework/placeholder
    // Real implementation would require:
    // 1. Twitter: OAuth 2.0 and Twitter API v2
    // 2. Instagram: Instagram Graph API via Facebook
    // 3. TikTok: TikTok API
    // 4. YouTube: YouTube Data API v3
    
    // For now, return mock data structure
    console.log(`Social media request: ${query.platform}/${query.type}`, {
      query: query.query,
      limit: query.limit,
    });

    // Mock response showing the expected structure
    const mockPosts: SocialMediaPost[] = [
      {
        id: "mock-1",
        platform: query.platform,
        author: {
          username: "example_user",
          displayName: "Example User",
          avatarUrl: "https://via.placeholder.com/48",
        },
        content: "This is a placeholder post. Implement actual API integration.",
        likes: 42,
        comments: 5,
        shares: 3,
        createdAt: new Date().toISOString(),
        url: `https://${query.platform}.com/example_user/status/123`,
      },
    ];

    const response: SocialMediaResponse = {
      posts: mockPosts,
      nextCursor: undefined,
    };

    // Add note about implementation
    console.log("NOTE: Social media function returns mock data. Implement actual API integration.");

    return jsonResponse({
      ...response,
      _note: "This is mock data. Implement platform-specific API integration.",
    });
  } catch (error) {
    console.error("Social media error:", error);
    return errorResponse("Internal server error", 500);
  }
});

/*
 * IMPLEMENTATION GUIDE:
 * 
 * Twitter API v2:
 * - Get Bearer Token from Twitter Developer Portal
 * - Use endpoints like /2/tweets, /2/users/:id/tweets
 * - Documentation: https://developer.twitter.com/en/docs/twitter-api
 *
 * Instagram Graph API:
 * - Requires Facebook App and Instagram Business/Creator account
 * - Use /me/media endpoint with access token
 * - Documentation: https://developers.facebook.com/docs/instagram-api
 *
 * TikTok API:
 * - Apply for TikTok Developer access
 * - Use Content Posting API or Display API
 * - Documentation: https://developers.tiktok.com/
 *
 * YouTube Data API v3:
 * - Get API key from Google Cloud Console
 * - Use /videos, /search endpoints
 * - Documentation: https://developers.google.com/youtube/v3
 */
