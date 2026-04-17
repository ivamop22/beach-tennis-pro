import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mxjnydrllpxqwmfwzlsr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14am55ZHJsbHB4cXdtZnd6bHNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNzYxNTcsImV4cCI6MjA5MTg1MjE1N30.eBjZuqVcEFnW4CZJQxvkPoaYH6vzoRdzcTTapoB21Cs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
