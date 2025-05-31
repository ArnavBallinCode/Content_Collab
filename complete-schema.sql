-- Complete schema for Collaborative Coreel
-- Extends the auth schema update with additional tables

-- Create enum types (already created in update-auth-schema.sql)
-- user_role AS ENUM ('creator', 'editor')
-- project_status AS ENUM ('draft', 'submitted', 'in_progress', 'in_revision', 'completed', 'cancelled')
-- reel_type AS ENUM ('instagram', 'youtube_shorts', 'tiktok')
-- pricing_tier AS ENUM ('basic', 'pro', 'premium', 'custom')

-- Projects table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID REFERENCES auth.users(id) NOT NULL,
    editor_id UUID REFERENCES auth.users(id),
    title TEXT NOT NULL,
    description TEXT,
    raw_footage_url TEXT NOT NULL,
    editing_instructions TEXT,
    reel_type reel_type NOT NULL,
    pricing_tier pricing_tier NOT NULL,
    custom_price DECIMAL(10, 2),
    status project_status NOT NULL DEFAULT 'draft',
    ai_brief TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project versions table
CREATE TABLE IF NOT EXISTS public.project_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    version_number INTEGER NOT NULL,
    video_url TEXT NOT NULL,
    editor_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments table
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    content TEXT NOT NULL,
    timestamp DECIMAL(10, 2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status TEXT NOT NULL,
    stripe_payment_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Editor ratings table
CREATE TABLE IF NOT EXISTS public.editor_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    editor_id UUID REFERENCES auth.users(id) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Set up Row Level Security for all tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editor_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
CREATE POLICY "Creators can view their own projects"
    ON public.projects FOR SELECT
    USING (auth.uid() = creator_id);

CREATE POLICY "Editors can view projects assigned to them"
    ON public.projects FOR SELECT
    USING (auth.uid() = editor_id);

CREATE POLICY "Editors can view unassigned projects"
    ON public.projects FOR SELECT
    USING (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'editor' 
        AND editor_id IS NULL 
        AND status = 'submitted'
    );

CREATE POLICY "Creators can insert their own projects"
    ON public.projects FOR INSERT
    WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their own projects"
    ON public.projects FOR UPDATE
    USING (auth.uid() = creator_id);

CREATE POLICY "Editors can update assigned projects"
    ON public.projects FOR UPDATE
    USING (
        auth.uid() = editor_id 
        AND status IN ('in_progress', 'in_revision')
    );

CREATE POLICY "Creators can delete their own draft projects"
    ON public.projects FOR DELETE
    USING (
        auth.uid() = creator_id 
        AND status IN ('draft', 'cancelled')
    );

-- RLS Policies for project versions
CREATE POLICY "Creators can view versions of their projects"
    ON public.project_versions FOR SELECT
    USING (
        auth.uid() IN (
            SELECT creator_id FROM public.projects 
            WHERE id = project_id
        )
    );

CREATE POLICY "Editors can view versions of assigned projects"
    ON public.project_versions FOR SELECT
    USING (
        auth.uid() IN (
            SELECT editor_id FROM public.projects 
            WHERE id = project_id
        )
    );

CREATE POLICY "Editors can insert versions for assigned projects"
    ON public.project_versions FOR INSERT
    WITH CHECK (
        auth.uid() IN (
            SELECT editor_id FROM public.projects 
            WHERE id = project_id 
            AND status IN ('in_progress', 'in_revision')
        )
    );

-- RLS Policies for comments
CREATE POLICY "Users can view comments on projects they're involved with"
    ON public.comments FOR SELECT
    USING (
        auth.uid() IN (
            SELECT creator_id FROM public.projects 
            WHERE id = project_id
            UNION
            SELECT editor_id FROM public.projects 
            WHERE id = project_id
        )
    );

CREATE POLICY "Users can insert comments on projects they're involved with"
    ON public.comments FOR INSERT
    WITH CHECK (
        auth.uid() IN (
            SELECT creator_id FROM public.projects 
            WHERE id = project_id
            UNION
            SELECT editor_id FROM public.projects 
            WHERE id = project_id
        )
    );

-- RLS Policies for payments
CREATE POLICY "Creators can view payments for their projects"
    ON public.payments FOR SELECT
    USING (
        auth.uid() IN (
            SELECT creator_id FROM public.projects 
            WHERE id = project_id
        )
    );

CREATE POLICY "Editors can view payments for their projects"
    ON public.payments FOR SELECT
    USING (
        auth.uid() IN (
            SELECT editor_id FROM public.projects 
            WHERE id = project_id
        )
    );

-- RLS Policies for editor ratings
CREATE POLICY "Public can view editor ratings"
    ON public.editor_ratings FOR SELECT
    USING (true);

CREATE POLICY "Creators can insert ratings for completed projects"
    ON public.editor_ratings FOR INSERT
    WITH CHECK (
        auth.uid() IN (
            SELECT creator_id FROM public.projects 
            WHERE id = project_id 
            AND status = 'completed'
        )
    );

-- Function to update project timestamps
CREATE OR REPLACE FUNCTION public.update_project_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating project timestamps
CREATE TRIGGER update_project_timestamp
BEFORE UPDATE ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.update_project_timestamp();

-- Storage setup for file uploads
INSERT INTO storage.buckets (id, name) VALUES ('project-files', 'project-files')
ON CONFLICT DO NOTHING;

-- Storage RLS policies
CREATE POLICY "Creator and editor access for project files"
ON storage.objects FOR ALL
USING (
    bucket_id = 'project-files' AND
    (
        auth.uid()::text = (storage.foldername(name))[1] OR
        auth.uid() IN (
            SELECT creator_id FROM public.projects 
            WHERE id::text = (storage.foldername(name))[1]
            UNION
            SELECT editor_id FROM public.projects 
            WHERE id::text = (storage.foldername(name))[1]
        )
    )
);
