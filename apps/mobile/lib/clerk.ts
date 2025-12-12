/**
 * Clerk Authentication Configuration
 * 
 * This module sets up Clerk for authentication in the Expo app.
 * It includes secure token caching using expo-secure-store.
 * 
 * @see https://clerk.com/docs/quickstarts/expo
 */

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * TokenCache interface for Clerk.
 * Defines methods for storing and retrieving auth tokens.
 */
export interface TokenCache {
  getToken: (key: string) => Promise<string | null>;
  saveToken: (key: string, token: string) => Promise<void>;
  clearToken?: (key: string) => Promise<void>;
}

/**
 * Creates a token cache for Clerk using expo-secure-store.
 * This securely stores authentication tokens on the device.
 * 
 * Note: SecureStore is not supported on web, so we return undefined
 * for web platforms (Clerk will use its default storage).
 */
const createTokenCache = (): TokenCache => {
  return {
    async getToken(key: string): Promise<string | null> {
      try {
        return await SecureStore.getItemAsync(key);
      } catch (error) {
        console.error('SecureStore getToken error:', error);
        return null;
      }
    },
    async saveToken(key: string, token: string): Promise<void> {
      try {
        await SecureStore.setItemAsync(key, token);
      } catch (error) {
        console.error('SecureStore saveToken error:', error);
      }
    },
    async clearToken(key: string): Promise<void> {
      try {
        await SecureStore.deleteItemAsync(key);
      } catch (error) {
        console.error('SecureStore clearToken error:', error);
      }
    },
  };
};

/**
 * Token cache instance for Clerk.
 * Returns undefined on web (SecureStore not supported).
 */
export const tokenCache = Platform.OS !== 'web' ? createTokenCache() : undefined;

/**
 * Get the Clerk publishable key from environment variables.
 * Throws an error if not configured.
 */
export const getClerkPublishableKey = (): string => {
  const key = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  if (!key) {
    throw new Error(
      'Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. ' +
      'Please add it to your .env.local file. ' +
      'Get it from https://dashboard.clerk.com'
    );
  }
  
  return key;
};
