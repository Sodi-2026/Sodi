-- supabase/migrations/20240003_engineering_advanced.sql
-- Adiciona dimensões padrão na tipologia e suporte a escalonamento de preço no insumo

-- Dimensões do Projeto Padrão para cada tipologia
ALTER TABLE public.tipologias
  ADD COLUMN IF NOT EXISTS largura_padrao_mm NUMERIC(10,2) NOT NULL DEFAULT 1200,
  ADD COLUMN IF NOT EXISTS altura_padrao_mm  NUMERIC(10,2) NOT NULL DEFAULT 1200;

-- Campos de escalonamento de preço para insumos do tipo GLASS
ALTER TABLE public.insumos
  ADD COLUMN IF NOT EXISTS escala_preco_por_area TEXT CHECK (escala_preco_por_area IN ('FORMULA', 'TABELA')),
  ADD COLUMN IF NOT EXISTS fator_escala_formula  NUMERIC(8,4),
  ADD COLUMN IF NOT EXISTS tabela_precos         JSONB;

-- Comentários para documentação
COMMENT ON COLUMN public.tipologias.largura_padrao_mm IS 'Largura de referência do projeto padrão (mm) para cálculo de proporcionalidade';
COMMENT ON COLUMN public.tipologias.altura_padrao_mm  IS 'Altura de referência do projeto padrão (mm) para cálculo de proporcionalidade';
COMMENT ON COLUMN public.insumos.escala_preco_por_area IS 'FORMULA = cálculo exponencial, TABELA = faixas de preço por m²';
COMMENT ON COLUMN public.insumos.tabela_precos IS 'Array JSONB de faixas: [{areaMinM2, areaMaxM2, precoM2}]';
