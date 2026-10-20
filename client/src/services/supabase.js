import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  supabaseAnonKey.length > 20
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Sign up a new user using Supabase Auth
 * @param {string} email
 * @param {string} password
 * @param {object} metadata - e.g. { fullName, role, phone, district }
 */
export const signUpWithSupabase = async (email, password, metadata = {}) => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not yet configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in client/.env');
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });

  if (error) throw error;
  return data;
};

/**
 * Sign in an existing user using Supabase Auth
 * @param {string} email
 * @param {string} password
 */
export const signInWithSupabase = async (email, password) => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not yet configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in client/.env');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};
