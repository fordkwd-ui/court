-- Run this script in the Supabase SQL Editor

-- 1. Create the application state table
CREATE TABLE IF NOT EXISTS public.app_state (
  id text PRIMARY KEY,
  data jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Set up row level security (RLS) policies
-- For MVP, we will allow anonymous read and update so the client can sync without authentication yet.
ALTER TABLE public.app_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
  ON public.app_state
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert and update access"
  ON public.app_state
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);
