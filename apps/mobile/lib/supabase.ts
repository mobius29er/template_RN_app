/**
 * Supabase Client Configuration
 * 
 * This module sets up the Supabase client for the Expo app.
 * Uses Clerk for authentication, NOT Supabase Auth.
 * 
 * @see https://supabase.com/docs/guides/getting-started/quickstarts/reactnative
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// TODO: Generate database types from Supabase and replace 'any'
// Run: npx supabase gen types typescript --project-id <your-project-id> > types/database.ts
type Database = any;

/**
 * Get Supabase configuration from environment variables.
 */
const getSupabaseConfig = () => {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'Missing Supabase configuration. ' +
      'Please add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your .env.local file. ' +
      'Get these from https://supabase.com/dashboard'
    );
  }

  return { url, anonKey };
};

/**
 * Create a Supabase client instance.
 * 
 * Note: This client uses the anon key and relies on Row Level Security (RLS).
 * Authentication is handled by Clerk, and the user's Clerk ID is used
 * for RLS policies.
 */
export const createSupabaseClient = (): SupabaseClient => {
  const { url, anonKey } = getSupabaseConfig();

  return createClient(url, anonKey, {
    auth: {
      // Disable Supabase Auth features since we use Clerk
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
};

/**
 * Create a Supabase client with a custom access token.
 * Use this when you need to make authenticated requests with the user's JWT.
 * 
 * @param accessToken - The JWT access token from Clerk
 */
export const createAuthenticatedSupabaseClient = (
  accessToken: string
): SupabaseClient<Database> => {
  const { url, anonKey } = getSupabaseConfig();

  return createClient<Database>(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
};

/**
 * Default Supabase client instance.
 * Use this for unauthenticated requests or when RLS allows public access.
 */
export const supabase = createSupabaseClient();
