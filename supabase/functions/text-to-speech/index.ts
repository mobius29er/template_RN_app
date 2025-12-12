// Supabase Edge Function: Text-to-Speech
//
// Converts text to speech using ElevenLabs.
// Stores the resulting audio file in Supabase Storage.
//
// POST /functions/v1/text-to-speech
// Body: { text: string, voice?: string, speed?: number }

import {
  handleCors,
  jsonResponse,
  errorResponse,
  parseRequestBody,
  validateRequired,
  createSupabaseClient,
} from "../_shared/utils.ts";

interface TTSRequest {
  text: string;
  voice?: string;
  speed?: number;
}

interface TTSResponse {
  audioUrl: string;
  duration?: number;
}

// Default voice settings
const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel voice
const DEFAULT_MODEL_ID = "eleven_monolingual_v1";

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
    const body = await parseRequestBody<TTSRequest>(req);
    if (!body) {
      return errorResponse("Invalid request body");
    }

    // Validate required fields
    const validationError = validateRequired(body, ["text"]);
    if (validationError) {
      return errorResponse(validationError);
    }

    const { text, voice = DEFAULT_VOICE_ID } = body;

    // Limit text length
    if (text.length > 5000) {
      return errorResponse("Text too long. Maximum 5000 characters.");
    }

    // Get ElevenLabs API key
    const elevenLabsKey = Deno.env.get("ELEVENLABS_API_KEY");
    if (!elevenLabsKey) {
      console.error("ELEVENLABS_API_KEY not configured");
      return errorResponse("TTS service not configured", 500);
    }

    // Call ElevenLabs API
    const ttsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": elevenLabsKey,
        },
        body: JSON.stringify({
          text,
          model_id: DEFAULT_MODEL_ID,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text();
      console.error("ElevenLabs API error:", errorText);
      return errorResponse("TTS generation failed", 500);
    }

    // Get the audio data
    const audioData = await ttsResponse.arrayBuffer();

    // Generate unique filename
    const filename = `audio/${crypto.randomUUID()}.mp3`;

    // Upload to Supabase Storage
    const supabase = createSupabaseClient();
    const { error: uploadError } = await supabase.storage
      .from("audio")
      .upload(filename, audioData, {
        contentType: "audio/mpeg",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return errorResponse("Failed to store audio", 500);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("audio")
      .getPublicUrl(filename);

    const response: TTSResponse = {
      audioUrl: urlData.publicUrl,
    };

    return jsonResponse(response);
  } catch (error) {
    console.error("Unexpected error:", error);
    return errorResponse("Internal server error", 500);
  }
});
