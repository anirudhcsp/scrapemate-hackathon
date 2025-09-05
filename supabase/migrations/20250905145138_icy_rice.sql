/*
  # Add progress tracking columns to projects table

  1. New Columns
    - `progress` (integer) - Progress percentage (0-100)
    - `progress_message` (text) - Current progress message

  2. Changes
    - Add progress tracking columns to projects table
    - Set default values for existing projects
*/

-- Add progress columns to projects table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'progress'
  ) THEN
    ALTER TABLE projects ADD COLUMN progress integer DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'progress_message'
  ) THEN
    ALTER TABLE projects ADD COLUMN progress_message text DEFAULT NULL;
  END IF;
END $$;