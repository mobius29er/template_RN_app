-- Migration: Initial Schema
-- Description: Create profiles and subscriptions tables
-- Date: 2024-01-01
--
-- This migration creates the core database schema:
-- 1. profiles - User profile data (synced with Clerk)
-- 2. subscriptions - RevenueCat subscription data
-- 3. waitlist - Waitlist signups from landing page

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
-- Stores user profile data synced from Clerk
-- The clerk_id is the primary identifier from Clerk

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_id TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Index for faster lookups by clerk_id
CREATE INDEX IF NOT EXISTS idx_profiles_clerk_id ON public.profiles(clerk_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SUBSCRIPTIONS TABLE
-- ============================================
-- Stores subscription data synced from RevenueCat
-- Use RevenueCat webhooks to keep this in sync

CREATE TYPE subscription_status AS ENUM (
    'active',
    'canceled',
    'expired',
    'trial',
    'past_due',
    'unknown'
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    revenuecat_customer_id TEXT UNIQUE NOT NULL,
    status subscription_status DEFAULT 'unknown',
    product_identifier TEXT,
    entitlements JSONB DEFAULT '[]',
    original_purchase_date TIMESTAMP WITH TIME ZONE,
    expiration_date TIMESTAMP WITH TIME ZONE,
    is_sandbox BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_revenuecat_id ON public.subscriptions(revenuecat_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- WAITLIST TABLE
-- ============================================
-- Stores waitlist signups from the landing page

CREATE TABLE IF NOT EXISTS public.waitlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    source TEXT DEFAULT 'website',
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_waitlist_email ON public.waitlist(email);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
-- Enable RLS on all tables

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only read/update their own profile
-- NOTE: For Clerk auth, you'll need to verify the clerk_id from the JWT
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT
    USING (auth.uid()::text = clerk_id OR auth.uid() IS NULL);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE
    USING (auth.uid()::text = clerk_id);

-- Subscriptions: Users can only view their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
    FOR SELECT
    USING (user_id IN (
        SELECT id FROM public.profiles WHERE clerk_id = auth.uid()::text
    ));

-- Waitlist: Anyone can insert, only admins can view
CREATE POLICY "Anyone can join waitlist" ON public.waitlist
    FOR INSERT
    WITH CHECK (true);

-- Service role can do everything (for webhooks, edge functions)
-- This is enabled by default for the service_role key

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to get or create a profile for a Clerk user
CREATE OR REPLACE FUNCTION get_or_create_profile(
    p_clerk_id TEXT,
    p_email TEXT DEFAULT NULL,
    p_first_name TEXT DEFAULT NULL,
    p_last_name TEXT DEFAULT NULL,
    p_avatar_url TEXT DEFAULT NULL
)
RETURNS public.profiles AS $$
DECLARE
    v_profile public.profiles;
BEGIN
    -- Try to find existing profile
    SELECT * INTO v_profile FROM public.profiles WHERE clerk_id = p_clerk_id;
    
    -- If not found, create one
    IF v_profile IS NULL THEN
        INSERT INTO public.profiles (clerk_id, email, first_name, last_name, avatar_url)
        VALUES (p_clerk_id, p_email, p_first_name, p_last_name, p_avatar_url)
        RETURNING * INTO v_profile;
    ELSE
        -- Update existing profile with new data if provided
        UPDATE public.profiles SET
            email = COALESCE(p_email, email),
            first_name = COALESCE(p_first_name, first_name),
            last_name = COALESCE(p_last_name, last_name),
            avatar_url = COALESCE(p_avatar_url, avatar_url)
        WHERE clerk_id = p_clerk_id
        RETURNING * INTO v_profile;
    END IF;
    
    RETURN v_profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has active subscription
CREATE OR REPLACE FUNCTION has_active_subscription(p_clerk_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.subscriptions s
        JOIN public.profiles p ON s.user_id = p.id
        WHERE p.clerk_id = p_clerk_id
        AND s.status = 'active'
        AND (s.expiration_date IS NULL OR s.expiration_date > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE public.profiles IS 'User profiles synced from Clerk authentication';
COMMENT ON TABLE public.subscriptions IS 'User subscriptions synced from RevenueCat';
COMMENT ON TABLE public.waitlist IS 'Waitlist signups from landing page';

COMMENT ON COLUMN public.profiles.clerk_id IS 'Clerk user ID - primary identifier';
COMMENT ON COLUMN public.subscriptions.revenuecat_customer_id IS 'RevenueCat customer ID';
COMMENT ON COLUMN public.subscriptions.entitlements IS 'JSON array of active entitlements';
