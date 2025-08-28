-- Add is_active column to agents table
ALTER TABLE public.agents 
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;