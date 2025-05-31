# Database Schema Fix Instructions

## The Problem
The collaborative video platform has a database trigger that creates user profiles automatically, but it's failing due to missing Row Level Security (RLS) INSERT policy on the `profiles` table.

## Quick Fix Option 1: Apply SQL Schema via Supabase Dashboard

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Navigate to your project: `xhbqcwlujwwrvitkfpvg`
3. Go to the SQL Editor
4. Copy and paste the following SQL:

```sql
-- Add the missing INSERT policy for profiles table
CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);
```

5. Click "Run" to execute the SQL

## Quick Fix Option 2: Temporary Workaround (Alternative)

If you can't access the Supabase dashboard right now, I can modify the sign-up flow to work around the trigger issue temporarily by:

1. Disabling the automatic trigger
2. Manually creating profiles in the sign-up flow
3. Ensuring proper role assignment

Would you like me to implement the temporary workaround, or can you apply the SQL fix via the dashboard?

## Full Schema (if needed)

If the above doesn't work, here's the complete schema that should be applied:

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enum types
CREATE TYPE user_role AS ENUM ('creator', 'editor');

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

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);
```

## Testing After Fix

1. Go to http://localhost:3001/sign-up
2. Create a new account with "Video Editor" role
3. Check that the account is created successfully
4. Verify the role is correctly set to "editor"
