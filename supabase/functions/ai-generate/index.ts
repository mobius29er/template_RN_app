// Supabase Edge Function: AI Text Generation
//
// Generates text using OpenAI GPT-4 (or other providers).
// All AI calls should go through this function to avoid exposing API keys.
//
// POST /functions/v1/ai-generate
// Body: { prompt: string, model?: string, maxTokens?: number, temperature?: number }

import {
  handleCors,
  jsonResponse,
  errorResponse,
  parseRequestBody,
  validateRequired,
} from "../_shared/utils.ts";

interface GenerateRequest {
  prompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

interface GenerateResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  // Only allow POST
  if (req.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  try {
    // Parse request body
    const body = await parseRequestBody<GenerateRequest>(req);
    if (!body) {
      return errorResponse("Invalid request body");
    }

    // Validate required fields
    const validationError = validateRequired(body, ["prompt"]);
    if (validationError) {
      return errorResponse(validationError);
    }

    const {
      prompt,
      model = "gpt-4-turbo-preview",
      maxTokens = 1000,
      temperature = 0.7,
      systemPrompt = "You are a helpful assistant.",
    } = body;

    // Get OpenAI API key from environment
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      console.error("OPENAI_API_KEY not configured");
      return errorResponse("AI service not configured", 500);
    }

    // Call OpenAI API
    const openaiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt },
          ],
          max_tokens: maxTokens,
          temperature,
        }),
      }
    );

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      console.error("OpenAI API error:", errorData);
      return errorResponse("AI generation failed", 500);
    }

    const data = await openaiResponse.json();

    const response: GenerateResponse = {
      text: data.choices[0]?.message?.content || "",
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
    };

    return jsonResponse(response);
  } catch (error) {
    console.error("Unexpected error:", error);
    return errorResponse("Internal server error", 500);
  }
});
