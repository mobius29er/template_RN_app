/**
 * Lib module exports
 * 
 * Central export point for all library utilities.
 */

// Authentication
export * from './clerk';

// Database
export { supabase, createAuthenticatedSupabaseClient } from './supabase';

// In-App Purchases
export * from './revenuecat';

// Theme
export { theme } from './theme';

// API Client
export {
  createApiClient,
  edgeFunctions,
  newsApi,
  aiServices,
  socialServices,
  newsServices,
} from './api';
