import { createClient } from '@supabase/supabase-js';

// Menggunakan casting 'any' agar TypeScript tidak protes saat build di Vercel
const env = (import.meta as any).env;

const supabaseUrl = env?.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = env?.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

if (!env?.VITE_SUPABASE_URL) {
  console.warn("AWAS: VITE_SUPABASE_URL belum terpasang di Environment Variables Vercel.");
}
