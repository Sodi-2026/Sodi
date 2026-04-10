import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Insumo, Tipologia } from '@soday/shared';

interface AppState {
  insumos: Insumo[];
  tipologias: Tipologia[];
  
  // Insumos Actions
  addInsumo: (insumo: Insumo) => void;
  removeInsumo: (id: string) => void;
  updateInsumo: (insumo: Insumo) => void;
  
  // Tipologias Actions
  addTipologia: (tipologia: Tipologia) => void;
  removeTipologia: (id: string) => void;
  updateTipologia: (tipologia: Tipologia) => void;
}

// Mock inicial baseado no PDF Nilfire para facilitar teste
const mockInsumos: Insumo[] = [
  { id: 'i1', nome: 'Perfil Marco 5050 LDN', unidade: 'M', precoUnitario: 35.00, fatorPerdaPadrao: 1.1 },
  { id: 'i2', nome: 'Perfil Folha 5030 TDN', unidade: 'M', precoUnitario: 28.00, fatorPerdaPadrao: 1.1 },
  { id: 'i3', nome: 'Vidro Pryodur 11mm', unidade: 'M2', precoUnitario: 1200.00, fatorPerdaPadrao: 1.05 },
  { id: 'i4', nome: 'Silicone Promaseal A', unidade: 'L', precoUnitario: 85.00, fatorPerdaPadrao: 1.0 },
  { id: 'i5', nome: 'Fixador 105mm Lug', unidade: 'UN', precoUnitario: 4.50, fatorPerdaPadrao: 1.0 },
];

const mockTipologias: Tipologia[] = [
  {
    id: 't1',
    nome: 'Janela de Correr Bal-FZ 30 (2 Folhas)',
    minL: 600, maxL: 3000,
    minA: 600, maxA: 2400,
    etapas: [
      {
        id: 'e1',
        nome: 'Estrutura de Alumínio',
        itens: [
          { id: 'v1', insumoId: 'i1', logica: 'LINEAR_L', quantidadeBase: 2, ajusteMm: 0, transpasseMm: 0 }, // 2 horizontais
          { id: 'v2', insumoId: 'i1', logica: 'LINEAR_A', quantidadeBase: 2, ajusteMm: 0, transpasseMm: 0 }, // 2 verticais
        ]
      },
      {
        id: 'e2',
        nome: 'Vidros e Vedação',
        itens: [
          { id: 'v3', insumoId: 'i3', logica: 'AREA_VAO', quantidadeBase: 1, ajusteMm: -45, transpasseMm: 25 },
          { id: 'v4', insumoId: 'i4', logica: 'PERIMETRO', quantidadeBase: 0.1, ajusteMm: 0, transpasseMm: 0 }, // 0.1L por metro de perim
        ]
      },
      {
        id: 'e3',
        nome: 'Fixação e Acessórios',
        itens: [
          { id: 'v5', insumoId: 'i5', logica: 'FIXO', quantidadeBase: 8, ajusteMm: 0, transpasseMm: 0 },
        ]
      }
    ]
  }
];

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      insumos: mockInsumos,
      tipologias: mockTipologias,

      addInsumo: (insumo) => set((state) => ({ insumos: [...state.insumos, insumo] })),
      removeInsumo: (id) => set((state) => ({ insumos: state.insumos.filter((i) => i.id !== id) })),
      updateInsumo: (insumo) => set((state) => ({ 
        insumos: state.insumos.map((i) => i.id === insumo.id ? insumo : i) 
      })),
      
      addTipologia: (tipologia) => set((state) => ({ tipologias: [...state.tipologias, tipologia] })),
      removeTipologia: (id) => set((state) => ({ tipologias: state.tipologias.filter((t) => t.id !== id) })),
      updateTipologia: (tipologia) => set((state) => ({ 
        tipologias: state.tipologias.map((t) => t.id === tipologia.id ? tipologia : t) 
      })),
    }),
    {
      name: 'soday-esquadrias-v2-storage',
    }
  )
);
