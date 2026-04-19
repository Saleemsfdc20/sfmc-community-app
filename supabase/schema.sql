-- SFMC Mumbai Experience Hub - Production Schema Dump
-- Date: 2026-04-19

-- -----------------------------------------------------
-- Table structure for attendees
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.attendees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    mobile TEXT,
    city TEXT,
    role TEXT CHECK (role IN ('Marketer', 'Developer', 'Student', 'Other')),
    first_time BOOLEAN DEFAULT true,
    linkedin_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.attendees ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------
-- RLS Policies For attendees
-- -----------------------------------------------------

-- 1. Allow public reads (Need access to render /members live directory)
CREATE POLICY "Allow public read" 
ON public.attendees 
FOR SELECT 
TO public 
USING (true);

-- 2. Allow public inserts (Needed for the /register Check-in page)
CREATE POLICY "Allow public insert" 
ON public.attendees 
FOR INSERT 
TO public 
WITH CHECK (true);

-- 3. Authenticated Admin Update (Edit via Dashboard)
CREATE POLICY "Enable update for authenticated users only"
ON public.attendees
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Authenticated Admin Delete (Trash via Dashboard)
CREATE POLICY "Enable delete for authenticated users only"
ON public.attendees
FOR DELETE
TO authenticated
USING (true);

-- -----------------------------------------------------
-- Realtime Subscriptions
-- -----------------------------------------------------

-- Note: The following command needs to be executed to enable realtime on public.attendees
-- This is already done in the dashboard, but keeping it for reference:
-- alter publication supabase_realtime add table attendees;
