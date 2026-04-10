/**
 * DataService.ts — Interface genérica de contrato do Service Layer.
 *
 * OBJETIVO: O frontend nunca deve conhecer QUEM é o backend.
 * Ele só sabe que pode chamar getAll(), create(), update() e delete().
 *
 * Para trocar de Supabase para uma REST API própria:
 * 1. Crie um novo arquivo que implemente esta interface (ex: RestApiInsumoService.ts)
 * 2. Atualize o arquivo serviceProvider.ts para retornar a nova implementação
 * 3. Nenhum componente ou store precisa ser alterado.
 */

export interface DataService<T, TInsert = T> {
  /**
   * Busca todos os registros.
   */
  getAll(): Promise<T[]>;

  /**
   * Busca um registro pelo ID.
   */
  getById(id: string): Promise<T | null>;

  /**
   * Cria um novo registro.
   */
  create(data: TInsert): Promise<T>;

  /**
   * Atualiza um registro existente (busca pelo id dentro do objeto).
   */
  update(data: T): Promise<T>;

  /**
   * Remove um registro pelo ID.
   */
  delete(id: string): Promise<void>;
}
