// app/utils/types.ts

export type UnidadeMedida = 'M' | 'M2' | 'M3' | 'UN' | 'KG' | 'G' | 'L' | 'ML';

export interface Insumo {
  id: string;
  nome: string;
  unidade: UnidadeMedida;
  precoUnitario: number; // Preço por 1 unidade de medida (ex: preço por metro, preço por litro)
  fatorPerdaPadrao: number; // Ex: 1.10 (10% de perda)
  
  // Propriedades Dimensionais (Opções avançadas para o construtor 3D)
  dimA?: number; // Altura em mm
  dimL?: number; // Largura em mm
  dimP?: number; // Profundidade (Espessura) em mm
}

export type LogicaCalculo = 
  | 'LINEAR_L'      // Quantidade * Largura (mm) / 1000
  | 'LINEAR_A'      // Quantidade * Altura (mm) / 1000
  | 'PERIMETRO'    // Quantidade * (2L + 2A) / 1000
  | 'AREA_VAO'     // Quantidade * (L * A) / 1.000.000
  | 'AREA_VIDRO'   // Lógica customizada de vidro com transpasse e folga
  | 'FIXO';         // Quantidade fixa independente das medidas

export interface VinculoInsumo {
  id: string;
  insumoId: string;
  logica: LogicaCalculo;
  quantidadeBase: number; // Ex: usa 2 barras na largura
  ajusteMm: number;      // Ajuste/Folga em mm (ex: L - 20mm)
  transpasseMm: number;  // Para vidros ou perfis sobrepostos
}

export interface EtapaFabricacao {
  id: string;
  nome: string; // Ex: "Estrutura", "Vedação", "Vidros", "Acessórios"
  itens: VinculoInsumo[];
}

export interface Tipologia {
  id: string;
  nome: string;
  descricao?: string;
  etapas: EtapaFabricacao[];
  // Travas de Segurança
  minL: number;
  maxL: number;
  minA: number;
  maxA: number;
}

// Retorno do Motor de Cálculo
export interface DetalheCalculoItem {
  etapaNome: string;
  insumoNome: string;
  unidade: UnidadeMedida;
  quantidadeCalculada: number;
  precoUnitario: number;
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
