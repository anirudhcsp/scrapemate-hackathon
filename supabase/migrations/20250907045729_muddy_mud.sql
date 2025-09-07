/*
  # Initial Database Schema for ScrapeMate

  1. New Tables
    - `projects`
      - `id` (uuid, primary key)
      - `seed_url` (text, required) - The initial URL to scrape
      - `status` (text, default 'queued') - Project processing status
      - `name` (text, optional) - Human-readable project name
      - `progress` (integer, default 0) - Progress percentage (0-100)
      - `progress_message` (text, optional) - Current progress description
      - `created_at` (timestamp, auto-generated)

    - `pages`
      - `id` (uuid, primary key)
      - `project_id` (uuid, foreign key) - References projects table
      - `url` (text, required) - The scraped page URL
      - `title` (text, optional) - Page title
      - `content_md` (text, optional) - Page content in markdown format
      - `status` (text, default 'done') - Page processing status
      - `created_at` (timestamp, auto-generated)

    - `executive_briefs`
      - `id` (uuid, primary key)
      - `project_id` (uuid, unique foreign key) - References projects table
      - `company_overview` (text, optional) - AI-generated company overview
      - `products_services` (text, optional) - Products and services analysis
      - `business_model` (text, optional) - Business model insights
      - `target_market` (text, optional) - Target market analysis
      - `key_insights` (text, optional) - Key business insights
      - `competitive_positioning` (text, optional) - Competitive analysis
      - `generated_at` (timestamp, optional) - When the brief was generated
      - `created_at` (timestamp, auto-generated)

  2. Security
    - Enable RLS on all tables
    - Add policies for anonymous access (for development/demo purposes)

  3. Relationships
    - Pages belong to projects (cascade delete)
    - Executive briefs belong to projects (cascade delete, one-to-one)
*/

-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  seed_url text NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  name text,
  progress integer DEFAULT 0,
  progress_message text
);

-- Create pages table
CREATE TABLE IF NOT EXISTS public.pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  url text NOT NULL,
  title text,
  content_md text,
  status text DEFAULT 'done'
);

-- Create executive_briefs table
CREATE TABLE IF NOT EXISTS public.executive_briefs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  project_id uuid UNIQUE REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  company_overview text,
  products_services text,
  business_model text,
  target_market text,
  key_insights text,
  competitive_positioning text,
  generated_at timestamp with time zone
);

-- Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executive_briefs ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access (for development/demo purposes)
-- In production, you should create more restrictive policies

CREATE POLICY "Allow anonymous access to projects"
  ON public.projects
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous access to pages"
  ON public.pages
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous access to executive_briefs"
  ON public.executive_briefs
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pages_project_id ON public.pages(project_id);
CREATE INDEX IF NOT EXISTS idx_executive_briefs_project_id ON public.executive_briefs(project_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);