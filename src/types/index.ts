// Types based on the database schema
export type UserRole = 'creator' | 'editor';
export type ProjectStatus = 'draft' | 'submitted' | 'in_progress' | 'in_revision' | 'completed' | 'cancelled';
export type ReelType = 'instagram' | 'youtube_shorts' | 'tiktok';
export type PricingTier = 'basic' | 'pro' | 'premium' | 'custom';

export interface Profile {
  id: string;
  role: UserRole;
  bio?: string;
  skillset?: string[];
  portfolio_urls?: string[];
  preferences?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  creator_id: string;
  editor_id?: string;
  title: string;
  description?: string;
  raw_footage_url: string;
  editing_instructions?: string;
  reel_type: ReelType;
  pricing_tier: PricingTier;
  custom_price?: number;
  status: ProjectStatus;
  ai_brief?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectVersion {
  id: string;
  project_id: string;
  version_number: number;
  video_url: string;
  editor_notes?: string;
  created_at: string;
}

export interface Comment {
  id: string;
  project_id: string;
  user_id: string;
  content: string;
  timestamp?: number;
  created_at: string;
}

export interface Payment {
  id: string;
  project_id: string;
  amount: number;
  status: string;
  stripe_payment_id?: string;
  created_at: string;
}

export interface EditorRating {
  id: string;
  project_id: string;
  editor_id: string;
  rating: number;
  review?: string;
  created_at: string;
}
