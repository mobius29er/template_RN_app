// Supabase Edge Functions - Shared Utilities
// 
// Common utilities and types used across edge functions.

import { createClient } from "npm:@supabase/supabase-js@2";

// ============================================
// TYPES
// ============================================

export interface CorsHeaders {
  "Access-Control-Allow-Origin": string;
  "Access-Control-Allow-Headers": string;
  "Access-Control-Allow-Methods": string;
}

export interface ErrorResponse {
  error: string;
  details?: string;
}

export interface SuccessResponse<T> {
  data: T;
}

// ============================================
// CORS
// ============================================

export const corsHeaders: CorsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

export function handleCors(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  return null;
}

// ============================================
// SUPABASE CLIENT
// ============================================

export function createSupabaseClient(authHeader?: string) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  // Use service key for admin operations, anon key for user operations
  if (authHeader) {
    return createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

// ============================================
// RESPONSE HELPERS
// ============================================

export function jsonResponse<T>(
  data: T,
  status: number = 200
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

export function errorResponse(
  error: string,
  status: number = 400,
  details?: string
): Response {
  const body: ErrorResponse = { error };
  if (details) body.details = details;

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

// ============================================
// REQUEST HELPERS
// ============================================

export async function parseRequestBody<T>(req: Request): Promise<T | null> {
  try {
    return await req.json() as T;
  } catch {
    return null;
  }
}

export function getAuthToken(req: Request): string | null {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.slice(7);
}

// ============================================
// VALIDATION
// ============================================

export function validateRequired(
  data: Record<string, unknown>,
  fields: string[]
): string | null {
  for (const field of fields) {
    if (!data[field]) {
      return `Missing required field: ${field}`;
    }
  }
  return null;
}
