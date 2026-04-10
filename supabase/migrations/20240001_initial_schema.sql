-- supabase/migrations/20240001_initial_schema.sql
-- Migration inicial: cria as tabelas de insumos e tipologias.
--
-- COMO APLICAR:
--   npx supabase db push        (no projeto cloud)
--   npx supabase migration up   (no ambiente local com Docker)

-- ============================================================
-- TABELA: insumos
-- Armazena os materiais/perfis usados nas composições de janelas
-- ============================================================
CREATE TABLE IF NOT EXISTS public.insumos (
    id             TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    nome           TEXT NOT NULL,
    unidade        TEXT NOT NULL CHECK (unidade IN ('M','M2','M3','UN','KG','G','L','ML')),
    preco_unitario NUMERIC(10,2) NOT NULL DEFAULT 0,
    fator_perda_padrao NUMERIC(4,2) NOT NULL DEFAULT 1.0,
    -- Geometria opcional (para cálculos 3D avançados)
    dim_a          NUMERIC(10,2),  -- Altura em mm
    dim_l          NUMERIC(10,2),  -- Largura em mm
    dim_p          NUMERIC(10,2),  -- Profundidade em mm
    created_at     TIMESTAMPTZ DEFAULT NOW(),
    updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABELA: tipologias
-- Armazena os modelos de janelas com suas etapas de fabricação
-- As etapas e vínculos de insumos são persistidos como JSONB
-- para flexibilidade durante o desenvolvimento inicial.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tipologias (
    id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    nome        TEXT NOT NULL,
    descricao   TEXT,
    min_l       NUMERIC(10,2) NOT NULL DEFAULT 500,
    max_l       NUMERIC(10,2) NOT NULL DEFAULT 3000,
    min_a       NUMERIC(10,2) NOT NULL DEFAULT 500,
    max_a       NUMERIC(10,2) NOT NULL DEFAULT 2400,
    -- Etapas de fabricação com vínculos de insumos (JSONB)
    etapas      JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Row Level Security (RLS) — habilitar após configurar Auth
-- ============================================================
-- ALTER TABLE public.insumos ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.tipologias ENABLE ROW LEVEL SECURITY;

-- Política temporária de acesso livre (remover em produção)
-- CREATE POLICY "Allow all" ON public.insumos FOR ALL USING (true);
-- CREATE POLICY "Allow all" ON public.tipologias FOR ALL USING (true);
