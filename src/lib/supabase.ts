import { createClient } from '@supabase/supabase-js';

// These would normally come from import.meta.env
// We use placeholder values for local development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlZmF1bHQiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY3OTY2ODQzOCwiZXhwIjoxOTk1MjQ0NDM4fQ.invalid_key_for_local_dev';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
