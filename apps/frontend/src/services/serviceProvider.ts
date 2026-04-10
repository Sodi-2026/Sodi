/**
 * serviceProvider.ts — Ponto central de configuração dos serviços.
 *
 * ESTE É O ÚNICO ARQUIVO QUE PRECISA SER ALTERADO PARA TROCAR DE BACKEND.
 *
 * Exemplo de migração para REST API própria:
 *
 *   // Antes (Supabase):
 *   export { insumoService } from './insumoService';
 *   export { tipologiaService } from './tipologiaService';
 *
 *   // Depois (API própria no Render/VPS):
 *   export { insumoService } from './insumoServiceRest';
 *   export { tipologiaService } from './tipologiaServiceRest';
 *
 * Os componentes, páginas e stores não precisam ser alterados.
 */

export { insumoService } from './insumoService';
export { tipologiaService } from './tipologiaService';
