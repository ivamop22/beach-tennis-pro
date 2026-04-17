import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mxjnydrllpxqwmfwzlsr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'COLOQUE_SUA_CHAVE_ANON_AQUI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
