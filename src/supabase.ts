import { createClient, SupabaseClient } from '@supabase/supabase-js';

const env = (import.meta as { env?: Record<string, string | undefined> }).env ?? {};
const supabaseUrl = (env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (env.VITE_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

const safeUrl = supabaseUrl || 'https://unconfigured.supabase.co';
const safeAnonKey = supabaseAnonKey || 'unconfigured-anon-key';

export const supabase: SupabaseClient = createClient(safeUrl, safeAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export const SUPABASE_STORAGE_BUCKET = 'daveboostz-assets';
