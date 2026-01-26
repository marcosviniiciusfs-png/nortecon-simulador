import { createClient } from '@supabase/supabase-js';

// Em projetos Lovable Cloud, essas variáveis são injetadas automaticamente
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

// Criar cliente mesmo sem variáveis configuradas (para evitar erro no build)
// O erro será tratado quando uma operação real for tentada
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper para verificar se o Supabase está configurado
export const isSupabaseConfigured = () => Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
