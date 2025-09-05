/*
  # Add executive briefs table

  1. New Tables
    - `executive_briefs`
      - `id` (uuid, primary key)
      - `project_id` (uuid, foreign key to projects)
      - `company_overview` (text)
      - `products_services` (text)
      - `business_model` (text)
      - `target_market` (text)
      - `key_insights` (text)
      - `competitive_positioning` (text)
      - `generated_at` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `executive_briefs` table
    - Add policy for public access (matching existing pattern)
*/

CREATE TABLE IF NOT EXISTS executive_briefs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  company_overview text,
  products_services text,
  business_model text,
  target_market text,
  key_insights text,
  competitive_positioning text,
  generated_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE executive_briefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on executive_briefs"
  ON executive_briefs
  FOR ALL
  TO public
  USING (true);