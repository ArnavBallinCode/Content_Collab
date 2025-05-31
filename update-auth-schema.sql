-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enum types
CREATE TYPE user_role AS ENUM ('creator', 'editor');
CREATE TYPE project_status AS ENUM ('draft', 'submitted', 'in_progress', 'in_revision', 'completed', 'cancelled');
CREATE TYPE reel_type AS ENUM ('instagram', 'youtube_shorts', 'tiktok');
CREATE TYPE pricing_tier AS ENUM ('basic', 'pro', 'premium', 'custom');

-- Update the profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT,
    role user_role NOT NULL DEFAULT 'creator',
    bio TEXT,
    skillset TEXT[],
    portfolio_urls TEXT[],
    preferences JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create automatic profile creation trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role)
    VALUES (new.id, new.email, COALESCE((new.raw_user_meta_data->>'role')::user_role, 'creator'));
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Set up Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Set up auth email templates
SELECT * FROM auth.config();

UPDATE auth.config SET
    site_url = 'http://localhost:3000',
    additional_redirect_urls = '{"http://localhost:3000/auth/callback"}',
    enable_email_signup = true,
    enable_email_autoconfirm = true;
