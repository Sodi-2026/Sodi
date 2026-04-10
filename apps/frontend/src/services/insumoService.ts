/**
 * insumoService.ts — Implementação Supabase da interface DataService<Insumo>.
 *
 * COMO MIGRAR PARA API PRÓPRIA:
 * Crie um arquivo `insumoServiceRest.ts` que implemente DataService<Insumo>
 * usando `fetch` para chamar sua API em /api/insumos.
 * Depois troque a exportação no serviceProvider.ts.
 *
 * Nenhum componente, página ou store precisa ser alterado.
 */

import { Insumo } from '@soday/shared';
import { DataService } from './DataService';
import { supabase } from './supabaseClient';

const TABLE = 'insumos';

class SupabaseInsumoService implements DataService<Insumo> {
  async getAll(): Promise<Insumo[]> {
    const { data, error } = await supabase.from(TABLE).select('*').order('nome');
    if (error) throw new Error(`[insumoService.getAll] ${error.message}`);
    return data as Insumo[];
  }

  async getById(id: string): Promise<Insumo | null> {
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single();
    if (error) return null;
    return data as Insumo;
  }

  async create(data: Insumo): Promise<Insumo> {
    const { data: created, error } = await supabase.from(TABLE).insert(data).select().single();
    if (error) throw new Error(`[insumoService.create] ${error.message}`);
    return created as Insumo;
  }

  async update(data: Insumo): Promise<Insumo> {
    const { data: updated, error } = await supabase
      .from(TABLE)
      .update(data)
      .eq('id', data.id)
      .select()
      .single();
    if (error) throw new Error(`[insumoService.update] ${error.message}`);
    return updated as Insumo;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    if (error) throw new Error(`[insumoService.delete] ${error.message}`);
  }
}

export const insumoService = new SupabaseInsumoService();
