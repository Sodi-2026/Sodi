-- supabase/migrations/20240002_add_categories_and_units.sql
-- Atualiza a tabela de insumos para suportar categorias e a nova unidade 'PACOTE'

-- 1. Adicionar a coluna categoria com um valor padrão
ALTER TABLE public.insumos 
ADD COLUMN IF NOT EXISTS categoria TEXT NOT NULL DEFAULT 'COMPONENTS AND HARDWARE';

-- 2. Atualizar a restrição de check da coluna unidade para incluir 'PACOTE'
-- Primeiro removemos a antiga (se existir) e criamos a nova
ALTER TABLE public.insumos DROP CONSTRAINT IF EXISTS insumos_unidade_check;

ALTER TABLE public.insumos 
ADD CONSTRAINT insumos_unidade_check 
CHECK (unidade IN ('M','M2','M3','UN','KG','G','L','ML','PACOTE'));

-- 3. Comentários para documentação
COMMENT ON COLUMN public.insumos.categoria IS 'Categoria do material: EXTRUSIONS, GLASS ou COMPONENTS AND HARDWARE';
