// packages/shared/src/index.ts

export type UnidadeMedida = 'M' | 'M2' | 'M3' | 'UN' | 'KG' | 'G' | 'L' | 'ML' | 'PACOTE';

export type InsumoCategoria = 'EXTRUSIONS' | 'GLASS' | 'COMPONENTS AND HARDWARE';

// Configuração de escala de preço por área (exclusivo para GLASS)
export interface FaixaPrecoVidro {
  areaMinM2: number;
  areaMaxM2: number;
  precoM2: number;
}

export interface Insumo {
  id: string;
  nome: string;
  categoria: InsumoCategoria;
  unidade: UnidadeMedida;
  precoUnitario: number; // Preço base por 1 unidade de medida
  fatorPerdaPadrao: number; // Ex: 1.10 (10% de perda)

  // Propriedades Dimensionais (para cálculos avançados)
  dimA?: number; // Altura em mm
  dimL?: number; // Largura em mm
  dimP?: number; // Profundidade (Espessura) em mm

  // Escalonamento de preço (exclusivo para GLASS)
  escalaPrecoPorArea?: 'FORMULA' | 'TABELA' | null;
  fatorEscalaFormula?: number;  // % de aumento por m² adicional (ex: 5 = 5% a mais por m²)
  tabelaPrecos?: FaixaPrecoVidro[];
}

export type LogicaCalculo =
  | 'LINEAR_L'    // Quantidade * Largura (mm) / 1000
  | 'LINEAR_A'    // Quantidade * Altura (mm) / 1000
  | 'PERIMETRO'   // Quantidade * (2L + 2A) / 1000
  | 'AREA_VAO'    // Quantidade * (L * A) / 1.000.000
  | 'AREA_VIDRO'  // Lógica de vidro com ajustes L/A independentes
  | 'FIXO';       // Quantidade fixa

export interface VinculoInsumo {
  id: string;
  insumoId: string;
  logica: LogicaCalculo;
  quantidadeBase: number;  // Quantidade para o projeto padrão
  ajusteMm: number;        // Ajuste geral (perfis/extrusões)
  ajusteLMm?: number;      // Ajuste de Largura (vidros)
  ajusteAMm?: number;      // Ajuste de Altura (vidros)
  transpasseMm: number;
}

export interface EtapaFabricacao {
  id: string;
  nome: string;
  itens: VinculoInsumo[];
}

export interface Tipologia {
  id: string;
  nome: string;
  descricao?: string;
  etapas: EtapaFabricacao[];
  // Travas de Segurança (limites de medida)
  minL: number;
  maxL: number;
  minA: number;
  maxA: number;
  // Dimensões do Projeto Padrão (referência para cálculo proporcional)
  larguraPadraoMm: number;
  alturaPadraoMm: number;
}

// Retorno do Motor de Cálculo
export interface DetalheCalculoItem {
  etapaNome: string;
  insumoNome: string;
  insumoCategoria: InsumoCategoria;
  unidade: UnidadeMedida;
  quantidadeCalculada: number;
  precoUnitario: number; // preço efetivo usado (pode ser escalonado para vidros)
  custoTotal: number;
  logicaAplicada: string;
}

export interface ResultadoOrcamento {
  sucesso: boolean;
  mensagemErro?: string;
  itemNome: string;
  medidas: { L: number; A: number };
  detalhes: DetalheCalculoItem[];
  custoMateriais: number;
  margemLucroPercent: number;
  valorVenda: number;
}
