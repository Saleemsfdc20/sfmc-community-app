import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (typeof window !== "undefined" && !supabaseUrl) {
  console.error("CRITICAL: NEXT_PUBLIC_SUPABASE_URL is missing in the browser! Please restart your 'npm run dev' server so Next.js can pick up the .env.local file.");
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);
