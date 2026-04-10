/**
 * tipologiaService.ts — Implementação Supabase da interface DataService<Tipologia>.
 *
 * As etapas (EtapaFabricacao) e seus itens (VinculoInsumo) são serializadas
 * como JSON no campo `etapas` (tipo JSONB no Supabase).
 * Isso simplifica o modelo relacional enquanto o projeto evolui.
 *
 * COMO MIGRAR PARA API PRÓPRIA:
 * Crie um arquivo `tipologiaServiceRest.ts` que use `fetch`.
 * Troque a exportação no serviceProvider.ts.
 */

import { Tipologia } from '@soday/shared';
import { DataService } from './DataService';
import { supabase } from './supabaseClient';

const TABLE = 'tipologias';

class SupabaseTipologiaService implements DataService<Tipologia> {
  async getAll(): Promise<Tipologia[]> {
    const { data, error } = await supabase.from(TABLE).select('*').order('nome');
    if (error) throw new Error(`[tipologiaService.getAll] ${error.message}`);
    return data as Tipologia[];
  }

  async getById(id: string): Promise<Tipologia | null> {
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
    if (error) return null;
    return data as Tipologia;
  }

  async create(data: Tipologia): Promise<Tipologia> {
    const { data: created, error } = await supabase.from(TABLE).insert(data).select().single();
    if (error) throw new Error(`[tipologiaService.create] ${error.message}`);
    return created as Tipologia;
  }

  async update(data: Tipologia): Promise<Tipologia> {
    const { data: updated, error } = await supabase
      .from(TABLE)
      .update(data)
      .eq('id', data.id)
      .select()
      .single();
    if (error) throw new Error(`[tipologiaService.update] ${error.message}`);
    return updated as Tipologia;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    if (error) throw new Error(`[tipologiaService.delete] ${error.message}`);
  }
}

export const tipologiaService = new SupabaseTipologiaService();
