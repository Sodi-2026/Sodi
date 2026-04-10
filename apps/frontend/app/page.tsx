'use client';

import { useState, useEffect } from 'react';
import { useStore } from './store/useStore';
import { calcularOrcamentoPro } from './utils/calculator';
import { ResultadoOrcamento } from '@soday/shared';
import { AlertCircle, Calculator, Info, Layers, CheckCircle2, ChevronRight, Package, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function SimulatorPage() {
  const { tipologias, insumos } = useStore();
  
  const [isMounted, setIsMounted] = useState(false);
  const [selectedId, setSelectedId] = useState<string>('');
  const [L, setL] = useState<number | ''>('');
  const [A, setA] = useState<number | ''>('');
  const [margem, setMargem] = useState<number>(45);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const [resultado, setResultado] = useState<ResultadoOrcamento | null>(null);
  const selecionada = tipologias.find(t => t.id === selectedId);

  const larg = typeof L === 'number' ? L : 0;
  const alt = typeof A === 'number' ? A : 0;

  const isInvalid = selecionada && (
    (larg > 0 && (larg < selecionada.minL || larg > selecionada.maxL)) || 
    (alt > 0 && (alt < selecionada.minA || alt > selecionada.maxA))
  );

  const handleSimular = () => {
    if (!selecionada || larg <= 0 || alt <= 0) return;
    const res = calcularOrcamentoPro(larg, alt, selecionada, insumos, margem);
    setResultado(res);
  };

  if (!isMounted) return null;

  if (insumos.length === 0 || tipologias.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <div className="bg-indigo-50 border-2 border-indigo-200 border-dashed rounded-3xl p-12 shadow-inner">
           <Package className="w-20 h-20 text-indigo-300 mx-auto mb-6" />
           <h1 className="text-3xl font-black text-indigo-900 mb-4">Sistema Vazio</h1>
           <p className="text-indigo-600 mb-10 text-lg">Para que o simulador calcule custos reais, você precisa completar os passos de configuração.</p>
           <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/admin/insumos" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-8 rounded-2xl shadow-lg transition-all flex items-center justify-center">
                1. Cadastrar Materiais
              </Link>
              <Link href="/admin/engenharia" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-2xl shadow-lg transition-all flex items-center justify-center">
                2. Montar Janelas (Engenharia)
              </Link>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12 py-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-gray-100 pb-8">
        <div>
           <div className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest mb-4">
              <Calculator className="w-3 h-3 mr-2" /> Orçamentação Profissional
           </div>
           <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">Simulador <span className="text-blue-600">Pro</span></h1>
           <p className="text-gray-500 mt-2 text-lg">Combine tipologias de engenharia com medidas reais de vãos.</p>
        </div>
        
        <div className="bg-white p-3 rounded-2xl border border-gray-200 flex items-center gap-4 shadow-sm">
           <span className="text-[10px] font-bold text-gray-400 uppercase vertical-text tracking-widest pl-2">Margem de Lucro %</span>
           <input 
             type="number" 
             className="w-20 text-2xl font-black text-blue-600 outline-none text-center" 
             value={margem} 
             onChange={e => setMargem(parseFloat(e.target.value))}
           />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Lado Esquerdo: Inputs */}
        <div className="lg:col-span-4 space-y-8">
          
          <section className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
             <h2 className="text-xl font-bold mb-6 flex items-center text-gray-800">
               <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm mr-3 font-black">1</span>
               Escolha o Modelo
             </h2>
             <div className="space-y-3">
               {tipologias.map(t => (
                 <button 
                  key={t.id} 
                  onClick={() => { setSelectedId(t.id); setResultado(null); }}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all
                    ${selectedId === t.id ? 'border-blue-600 bg-blue-50/50 shadow-md ring-4 ring-blue-500/10' : 'border-gray-100 hover:bg-gray-50 hover:border-gray-200'}
                  `}
                 >
                   <div className="text-left">
                      <p className={`font-black text-sm uppercase tracking-tight ${selectedId === t.id ? 'text-blue-900' : 'text-gray-700'}`}>{t.nome}</p>
                      <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">{t.etapas.length} Etapas vinculadas</p>
                   </div>
                   {selectedId === t.id && <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 ml-4" />}
                 </button>
               ))}
             </div>
          </section>

          <section className={`bg-white rounded-3xl border border-gray-200 p-8 shadow-sm transition-all duration-500 ${selectedId ? 'opacity-100' : 'opacity-30 grayscale pointer-events-none'}`}>
             <h2 className="text-xl font-bold mb-6 flex items-center text-gray-800">
               <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm mr-3 font-black">2</span>
               Medida do Vão (mm)
             </h2>
             
             {selecionada && (
               <div className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Largura</label>
                      <input 
                        type="number" 
                        placeholder="Ex: 1200"
                        className={`w-full text-center text-3xl font-black p-4 rounded-2xl bg-gray-50 border-2 outline-none focus:bg-white transition-all
                          ${larg > 0 && (larg < selecionada.minL || larg > selecionada.maxL) ? 'border-red-500 text-red-700 focus:ring-4 focus:ring-red-100' : 'border-gray-100 focus:border-blue-500'}
                        `}
                        value={L}
                        onChange={e => { setL(e.target.value ? parseFloat(e.target.value) : ''); setResultado(null); }}
                      />
                      <div className="flex justify-between text-[9px] font-bold text-gray-400 px-1 italic">
                        <span>Min: {selecionada.minL}</span>
                        <span>Max: {selecionada.maxL}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Altura</label>
                      <input 
                        type="number" 
                        placeholder="Ex: 1000"
                        className={`w-full text-center text-3xl font-black p-4 rounded-2xl bg-gray-50 border-2 outline-none focus:bg-white transition-all
                          ${alt > 0 && (alt < selecionada.minA || alt > selecionada.maxA) ? 'border-red-500 text-red-700 focus:ring-4 focus:ring-red-100' : 'border-gray-100 focus:border-blue-500'}
                        `}
                        value={A}
                        onChange={e => { setA(e.target.value ? parseFloat(e.target.value) : ''); setResultado(null); }}
                      />
                      <div className="flex justify-between text-[9px] font-bold text-gray-400 px-1 italic">
                        <span>Min: {selecionada.minA}</span>
                        <span>Max: {selecionada.maxA}</span>
                      </div>
                    </div>
                 </div>

                 {isInvalid && (
                    <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex gap-3 items-start">
                       <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                       <p className="text-xs font-bold text-red-700 leading-relaxed uppercase tracking-tighter">Dimensões fora da trava técnica permitida!</p>
                    </div>
                 )}

                 <button 
                  onClick={handleSimular}
                  disabled={isInvalid || !L || !A}
                  className="w-full bg-blue-600 hover:bg-blue-700 hover:shadow-2xl text-white font-black py-5 rounded-2xl text-lg transition-all shadow-xl shadow-blue-500/20 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none uppercase tracking-widest"
                 >
                   Processar Orçamento
                 </button>
               </div>
             )}
          </section>
        </div>

        {/* Lado Direito: Resultados baseados no PDF */}
        <div className="lg:col-span-8">
           {resultado && resultado.sucesso ? (
              <div className="bg-gray-900 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500 border-4 border-white">
                 
                 {/* Topo Financeiro */}
                 <div className="p-10 bg-gradient-to-br from-gray-900 to-gray-800 text-white relative">
                    <div className="absolute top-8 right-8">
                       <div className="bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-2xl border border-emerald-500/30 font-black flex items-center">
                          <ShieldCheck className="w-5 h-5 mr-3" /> PRECIFICADO
                       </div>
                    </div>
                    
                    <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-xs mb-3">Valor de Venda Sugerido</p>
                    <div className="text-7xl font-black tracking-tighter text-white">
                       {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(resultado.valorVenda)}
                    </div>
                    <div className="mt-8 flex gap-6 items-center">
                       <div className="bg-white/5 backdrop-blur px-4 py-2 rounded-xl border border-white/10">
                          <p className="text-[9px] font-bold text-gray-500 uppercase">Custo Material</p>
                          <p className="text-lg font-black text-gray-300">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(resultado.custoMateriais)}</p>
                       </div>
                       <div className="bg-white/5 backdrop-blur px-4 py-2 rounded-xl border border-white/10">
                          <p className="text-[9px] font-bold text-gray-500 uppercase">Markup (Sugerido)</p>
                          <p className="text-lg font-black text-blue-400">{resultado.margemLucroPercent}%</p>
                       </div>
                    </div>
                 </div>

                 {/* Memória de Cálculo agrupada por ETAPA (Igual ao PDF da Nilfire) */}
                 <div className="bg-white p-10">
                   <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-8 border-b-2 border-gray-100 pb-4 flex items-center">
                      <Layers className="w-5 h-5 mr-2 text-blue-600" /> Detalhamento Técnico (BOM)
                   </h3>

                   <div className="space-y-10">
                      {Array.from(new Set(resultado.detalhes.map(d => d.etapaNome))).map(etapa => (
                        <div key={etapa}>
                           <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-4 bg-blue-50 px-3 py-1 rounded inline-block">{etapa}</h4>
                           <div className="grid grid-cols-1 gap-4">
                              {resultado.detalhes.filter(d => d.etapaNome === etapa).map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center group pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                                   <div className="flex gap-4 items-start">
                                      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 text-xs font-black shrink-0">
                                         {idx + 1}
                                      </div>
                                      <div>
                                         <p className="font-black text-gray-800 text-sm leading-none">{item.insumoNome}</p>
                                         <p className="text-[10px] text-gray-400 font-bold mt-2 uppercase tracking-tighter italic">Lógica: {item.logicaAplicada}</p>
                                         <div className="flex gap-4 mt-2">
                                            <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded font-black text-gray-600">Consumo: {item.quantidadeCalculada} {item.unidade}</span>
                                            <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded font-black text-gray-600">Un: R$ {item.precoUnitario.toFixed(2)}</span>
                                         </div>
                                      </div>
                                   </div>
                                   <div className="text-right">
                                      <p className="text-sm font-black text-gray-900">R$ {item.custoTotal.toFixed(2)}</p>
                                   </div>
                                </div>
                              ))}
                           </div>
                        </div>
                      ))}
                   </div>
                 </div>

              </div>
           ) : (
             <div className="bg-gray-50 rounded-[2.5rem] border-4 border-dashed border-gray-200 h-full min-h-[600px] flex flex-col items-center justify-center p-20 text-center animate-pulse">
                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-8 border-4 border-white shadow-inner">
                   <ChevronRight className="w-12 h-12 text-gray-300" />
                </div>
                <h3 className="text-2xl font-black text-gray-400 uppercase tracking-tighter">Aguardando Parâmetros</h3>
                <p className="text-gray-300 font-bold text-sm max-w-xs mx-auto mt-4">Preencha o modelo e as medidas para que o motor processe os cálculos.</p>
             </div>
           )}
        </div>

      </div>
    </div>
  );
}
