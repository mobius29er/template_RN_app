/**
 * Type Definitions
 * 
 * Central type definitions for the application.
 */

// ============================================
// User Types
// ============================================

export interface UserProfile {
  id: string;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Subscription Types
// ============================================

export type SubscriptionStatus = 
  | 'active' 
  | 'canceled' 
  | 'expired' 
  | 'trial' 
  | 'past_due';

export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

export interface Subscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  canceledAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// API Types
// ============================================

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================
// AI Types
// ============================================

export interface GenerateTextRequest {
  prompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface GenerateTextResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface TextToSpeechRequest {
  text: string;
  voice?: string;
  speed?: number;
  format?: 'mp3' | 'wav';
}

export interface TextToSpeechResponse {
  audioUrl: string;
  duration?: number;
}

// ============================================
// News Types
// ============================================

export interface NewsArticle {
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

// ============================================
// Navigation Types (Expo Router)
// ============================================

// Define your route params here
export type RootStackParamList = {
  '(tabs)': undefined;
  '(auth)/sign-in': undefined;
  '(auth)/sign-up': undefined;
  index: undefined;
};

// ============================================
// Utility Types
// ============================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Nullable<T> = T | null;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
