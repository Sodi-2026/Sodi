/**
 * supabaseClient.ts — Singleton do cliente Supabase.
 *
 * Lê as variáveis de ambiente do arquivo .env.local
 * NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY
 *
 * Se as variáveis não estiverem definidas, o app funciona normalmente
 * mas qualquer chamada ao Supabase falhará (para facilitar o desenvolvimento local).
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
  // Aviso em desenvolvimento — não interrompe a build
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      '[SODAY] Supabase não configurado. ' +
      'Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local. ' +
      'O app usará dados locais (mock/localStorage) como fallback.'
    );
  }
}

export const supabase: SupabaseClient = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder');
