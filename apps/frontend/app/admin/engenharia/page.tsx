'use client';

import { useStore } from '../../store/useStore';
import { Plus, Trash2, Ruler, Info, Box, PlusCircle, Settings2, ShieldAlert, Pencil } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Tipologia, EtapaFabricacao, VinculoInsumo, LogicaCalculo, Insumo } from '@soday/shared';

export default function EngenhariaPage() {
  const { tipologias, insumos, addTipologia, removeTipologia, updateTipologia } = useStore();

  const [isMounted, setIsMounted] = useState(false);
  const [modoEdicaoId, setModoEdicaoId] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const construtorVazio: Partial<Tipologia> = {
    nome: '',
    minL: 500, maxL: 3000,
    minA: 500, maxA: 2400,
    larguraPadraoMm: 1200,
    alturaPadraoMm: 1200,
    etapas: []
  };

  const [editando, setEditando] = useState<Partial<Tipologia>>(construtorVazio);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [etapaInput, setEtapaInput] = useState('');

  const handleAddEtapa = () => {
    if(!etapaInput) return;
    const novaEtapa: EtapaFabricacao = {
      id: Date.now().toString(),
      nome: etapaInput,
      itens: []
    };
    setEditando({ ...editando, etapas: [...(editando.etapas || []), novaEtapa] });
    setEtapaInput('');
  };

  const handleRemoveEtapa = (id: string) => {
    setEditando({ ...editando, etapas: editando.etapas?.filter(e => e.id !== id) });
  };

  const handleAddItem = (etapaId: string) => {
    const novoVinculo: VinculoInsumo = {
      id: Math.random().toString(),
      insumoId: '',
      logica: 'LINEAR_L',
      quantidadeBase: 1,
      ajusteMm: 0,
      transpasseMm: 0
    };
    
    const novasEtapas = editando.etapas?.map(e => {
      if(e.id === etapaId) return { ...e, itens: [...e.itens, novoVinculo] };
      return e;
    });
    setEditando({ ...editando, etapas: novasEtapas });
  };

  const updateItem = (etapaId: string, itemId: string, data: Partial<VinculoInsumo>) => {
    const novasEtapas = editando.etapas?.map(e => {
      if(e.id === etapaId) {
        return {
          ...e,
          itens: e.itens.map(it => it.id === itemId ? { ...it, ...data } : it)
        };
      }
      return e;
    });
    setEditando({ ...editando, etapas: novasEtapas });
  };

  const handleRemoveItem = (etapaId: string, itemId: string) => {
    const novasEtapas = editando.etapas?.map(e => {
      if(e.id === etapaId) {
        return { ...e, itens: e.itens.filter(it => it.id !== itemId) };
      }
      return e;
    });
    setEditando({ ...editando, etapas: novasEtapas });
  };

  const handleSalvarTudo = () => {
    if(!editando.nome) return;

    const payload: Tipologia = {
      id: modoEdicaoId ? modoEdicaoId : Date.now().toString(),
      nome: editando.nome!,
      minL: editando.minL || 500,
      maxL: editando.maxL || 3000,
      minA: editando.minA || 500,
      maxA: editando.maxA || 2000,
      larguraPadraoMm: editando.larguraPadraoMm || 1200,
      alturaPadraoMm: editando.alturaPadraoMm || 1200,
      etapas: editando.etapas || []
    };

    if (modoEdicaoId) {
      updateTipologia(payload);
    } else {
      addTipologia(payload);
    }
    
    setEditando(construtorVazio);
    setModoEdicaoId(null);
  };

  const handleEditarTipologia = (t: Tipologia) => {
    setModoEdicaoId(t.id);
    // Clone profundo para não alterar a store diretamente no form
    setEditando(JSON.parse(JSON.stringify(t)));
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCancelar = () => {
    setModoEdicaoId(null);
    setEditando(construtorVazio);
  };

  if (!isMounted) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-6 mb-20">
      
      {/* HEADER ORIENTADO */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-indigo-900 flex items-center mb-3">
          <Ruler className="w-8 h-8 mr-3 text-indigo-600" /> Passo 2: Arquiteto de Tipologias
        </h1>
        <p className="text-indigo-800 text-lg font-medium">
          Aqui você "constrói" como uma janela é feita, vinculando os insumos em etapas lógicas de produção.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* EDITOR DE JANELA */}
        <div ref={formRef} className="xl:col-span-8 space-y-8">
          <div className={`bg-white rounded-2xl border-2 shadow-xl overflow-hidden transition-all duration-300 ${modoEdicaoId ? 'border-yellow-400 ring-4 ring-yellow-400/20' : 'border-gray-200'}`}>
            <div className={`p-6 text-white flex justify-between items-center ${modoEdicaoId ? 'bg-yellow-600' : 'bg-gray-900'}`}>
              <div>
                <h2 className="text-xl font-bold flex items-center"><Box className={`w-5 h-5 mr-2 ${modoEdicaoId ? 'text-white' : 'text-gray-400'}`} /> {modoEdicaoId ? 'Editando Composição (Draft)' : 'Construtor de Composição'}</h2>
                <p className="text-white/70 text-xs mt-1 uppercase tracking-widest font-bold">Defina as peças e fórmulas de cálculo</p>
              </div>
              {modoEdicaoId && (
                <button onClick={handleCancelar} className="bg-white/20 hover:bg-white/30 transition px-4 py-2 rounded-lg font-bold text-sm">Cancelar / Novo</button>
              )}
            </div>

            <div className="p-8 space-y-10">
              
              {/* Infos Básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8 border-b border-gray-100">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Nome do Modelo (Tipologia)</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Janela 2 Folhas de Correr" 
                    className="w-full border-b-2 border-gray-100 focus:border-indigo-500 outline-none py-3 text-2xl font-extrabold text-gray-800 transition-all"
                    value={editando.nome}
                    onChange={e => setEditando({...editando, nome: e.target.value})}
                  />
                </div>
                
                <div className="bg-red-50/50 p-4 rounded-xl border border-red-100">
                  <div className="flex items-center text-red-800 font-bold mb-3 text-xs uppercase tracking-wide">
                    <ShieldAlert className="w-4 h-4 mr-1 text-red-500" /> Travas de Largura (mm)
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-[10px] text-red-400 font-bold mb-1">Mínima</label>
                      <input type="number" className="w-full bg-white border border-red-200 rounded p-2 text-sm font-bold" value={editando.minL} onChange={e => setEditando({...editando, minL: parseFloat(e.target.value)})} />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] text-red-400 font-bold mb-1">Máxima</label>
                      <input type="number" className="w-full bg-white border border-red-200 rounded p-2 text-sm font-bold" value={editando.maxL} onChange={e => setEditando({...editando, maxL: parseFloat(e.target.value)})} />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 grid grid-cols-2 gap-4">
                  <div className="col-span-2 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-200 pb-2">
                    📐 Dimensões do Projeto Padrão (referência para escalas)
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Largura Padrão (mm)</label>
                    <input type="number" className="w-full bg-white border border-gray-200 rounded p-2 text-sm font-bold" value={editando.larguraPadraoMm || ''} onChange={e => setEditando({...editando, larguraPadraoMm: parseFloat(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Altura Padrão (mm)</label>
                    <input type="number" className="w-full bg-white border border-gray-200 rounded p-2 text-sm font-bold" value={editando.alturaPadraoMm || ''} onChange={e => setEditando({...editando, alturaPadraoMm: parseFloat(e.target.value)})} />
                  </div>
                </div>
              </div>

              {/* Gerenciar Etapas */}
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-extrabold text-gray-900 border-l-4 border-indigo-500 pl-4">Etapas de Composição</h3>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Nome da Etapa (Ex: Vedação)" 
                      className="border border-gray-300 rounded px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      value={etapaInput}
                      onChange={e => setEtapaInput(e.target.value)}
                    />
                    <button onClick={handleAddEtapa} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded text-sm flex items-center transition">
                      <PlusCircle className="w-4 h-4 mr-1" /> Add Etapa
                    </button>
                  </div>
                </div>

                {editando.etapas?.map((etapa, eIdx) => (
                  <div key={etapa.id} className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-b border-gray-200">
                      <span className="font-extrabold text-gray-700 uppercase tracking-widest text-xs">{eIdx + 1}. {etapa.nome}</span>
                      <button onClick={() => handleRemoveEtapa(etapa.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-4 h-4"/></button>
                    </div>
                    
                    <div className="p-6 space-y-8">
                      {['EXTRUSIONS', 'GLASS', 'COMPONENTS AND HARDWARE'].map(cat => {
                        const itemsDaCategoria = etapa.itens.filter(it => {
                          const ins = insumos.find(i => i.id === it.insumoId);
                          return ins ? ins.categoria === cat : cat === 'COMPONENTS AND HARDWARE' && !it.insumoId;
                        });

                        if (itemsDaCategoria.length === 0 && cat !== 'COMPONENTS AND HARDWARE') return null;

                        return (
                          <div key={cat} className="space-y-3">
                             <div className="flex items-center gap-2 mb-2">
                                <div className={`w-2 h-2 rounded-full ${cat === 'GLASS' ? 'bg-blue-500' : cat === 'EXTRUSIONS' ? 'bg-orange-500' : 'bg-gray-400'}`}></div>
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{cat}</span>
                             </div>
                             
                             {itemsDaCategoria.map((item, iIdx) => {
                               const insItem = insumos.find(i => i.id === item.insumoId);
                               const isGlass = insItem?.categoria === 'GLASS';

                               return (
                                <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-white border border-gray-100 p-4 rounded-xl shadow-sm relative group">
                                  <div className="md:col-span-3">
                                     <label className="block text-[10px] font-bold text-gray-400 mb-1">Insumo Base</label>
                                     <select 
                                        className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={item.insumoId}
                                        onChange={e => updateItem(etapa.id, item.id, { insumoId: e.target.value })}
                                     >
                                        <option value="">Selecione...</option>
                                        {insumos.map(ins => <option key={ins.id} value={ins.id}>{ins.nome} ({ins.unidade})</option>)}
                                     </select>
                                  </div>

                                  <div className="md:col-span-3">
                                     <label className="block text-[10px] font-bold text-gray-400 mb-1">Lógica p/ Quantidade</label>
                                     <select 
                                        className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm font-medium outline-none"
                                        value={item.logica}
                                        onChange={e => updateItem(etapa.id, item.id, { logica: e.target.value as LogicaCalculo })}
                                     >
                                        <option value="LINEAR_L">Pela LARGURA (L)</option>
                                        <option value="LINEAR_A">Pela ALTURA (A)</option>
                                        <option value="PERIMETRO">PELO PERÍMETRO (2L+2A)</option>
                                        <option value="AREA_VAO">PELA ÁREA (LxA)</option>
                                        <option value="FIXO">QUANTIDADE FIXA</option>
                                     </select>
                                  </div>

                                  <div className="md:col-span-1">
                                     <label className="block text-[10px] font-bold text-gray-400 mb-1">Quant.</label>
                                     <input type="number" className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm font-bold" value={item.quantidadeBase} onChange={e => updateItem(etapa.id, item.id, { quantidadeBase: parseFloat(e.target.value) })}/>
                                  </div>

                                  {isGlass ? (
                                    <>
                                      <div className="md:col-span-2">
                                         <label className="block text-[10px] font-black text-blue-500 mb-1">Ajuste L (mm)</label>
                                         <input type="number" className="w-full border border-blue-200 rounded px-2 py-1.5 text-sm font-bold bg-blue-50" placeholder="L" value={item.ajusteLMm ?? 0} onChange={e => updateItem(etapa.id, item.id, { ajusteLMm: parseFloat(e.target.value) })}/>
                                      </div>
                                      <div className="md:col-span-2">
                                         <label className="block text-[10px] font-black text-blue-500 mb-1">Ajuste A (mm)</label>
                                         <input type="number" className="w-full border border-blue-200 rounded px-2 py-1.5 text-sm font-bold bg-blue-50" placeholder="A" value={item.ajusteAMm ?? 0} onChange={e => updateItem(etapa.id, item.id, { ajusteAMm: parseFloat(e.target.value) })}/>
                                      </div>
                                    </>
                                  ) : (
                                    <div className="md:col-span-4">
                                       <label className="block text-[10px] font-bold text-gray-400 mb-1">Ajuste Global (mm)</label>
                                       <input type="number" className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm font-bold bg-yellow-50" placeholder="Ex: -45" value={item.ajusteMm} onChange={e => updateItem(etapa.id, item.id, { ajusteMm: parseFloat(e.target.value) })}/>
                                    </div>
                                  )}

                                  <div className="md:col-span-1 flex justify-end">
                                     <button onClick={() => handleRemoveItem(etapa.id, item.id)} className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white p-2 rounded transition-all">
                                       <Trash2 className="w-4 h-4"/>
                                     </button>
                                  </div>
                                </div>
                               );
                             })}
                          </div>
                        );
                      })}
                      
                      <button 
                        onClick={() => handleAddItem(etapa.id)}
                        className="w-full border-2 border-dashed border-gray-200 rounded-xl py-3 text-xs font-bold text-gray-400 hover:border-indigo-300 hover:text-indigo-500 transition-all flex items-center justify-center uppercase tracking-widest"
                      >
                        <Plus className="w-4 h-4 mr-1" /> Adicionar Novo Item a esta Etapa
                      </button>
                    </div>
                  </div>
                ))}

                {(!editando.etapas || editando.etapas.length === 0) && (
                  <div className="text-center py-10 bg-indigo-50/50 border-2 border-dashed border-indigo-200 rounded-2xl italic text-gray-400">
                    Crie sua primeira etapa de montagem acima (ex: Perfilaria, Vidros, Vedação...)
                  </div>
                )}
              </div>

              <button 
                onClick={handleSalvarTudo}
                disabled={!editando.nome || editando.etapas?.length === 0}
                className={`w-full text-white font-black py-5 rounded-2xl text-xl shadow-2xl transition-all disabled:opacity-30 disabled:grayscale uppercase tracking-widest border-4
                 ${modoEdicaoId ? 'bg-yellow-500 border-yellow-600 hover:bg-yellow-600 hover:border-yellow-700' : 'bg-gray-900 border-gray-900 hover:bg-indigo-600 hover:border-indigo-600'}
                `}
              >
                {modoEdicaoId ? 'Salvar Restruturação' : 'Gravar Nova Tipologia'}
              </button>

            </div>
          </div>
        </div>

        {/* LISTAGEM DE TIPOLOGIES EXISTENTES */}
        <div className="xl:col-span-4 space-y-6">
           <h2 className="text-xl font-bold text-gray-900 flex items-center">
             <Settings2 className="w-5 h-5 mr-2 text-gray-500" /> Modelos Salvos
           </h2>

           <div className="space-y-4">
              {tipologias.map(t => (
                <div key={t.id} className={`bg-white border-2 rounded-xl p-5 shadow-sm transition-all group ${modoEdicaoId === t.id ? 'border-yellow-400 ring-2 ring-yellow-400/20' : 'border-gray-200 hover:shadow-md'}`}>
                  
                  <div className="flex justify-between items-start mb-2">
                     <h4 className="font-extrabold text-gray-800 truncate pr-2 max-w-[80%]">{t.nome}</h4>
                     <div className="flex gap-1 opacity-20 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditarTipologia(t)} className="bg-yellow-100 text-yellow-700 hover:bg-yellow-500 hover:text-white p-1.5 rounded transition"><Pencil className="w-3.5 h-3.5"/></button>
                        <button onClick={() => removeTipologia(t.id)} className="bg-red-50 text-red-500 hover:bg-red-600 hover:text-white p-1.5 rounded transition"><Trash2 className="w-3.5 h-3.5"/></button>
                     </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                     <span className="bg-gray-100 text-[10px] font-black px-2 py-0.5 rounded text-gray-600 border border-gray-200 uppercase">{t.etapas.length} Etapas</span>
                     <span className="bg-red-50 text-[10px] font-black px-2 py-0.5 rounded text-red-600 border border-red-100 uppercase">{t.maxL}x{t.maxA} Max</span>
                  </div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter border-t border-gray-100 pt-2 mt-2">Árvore de Fabricação:</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                     {t.etapas.map(e => (
                       <span key={e.id} className="text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold border border-indigo-100">{e.nome} ({e.itens.length}x)</span>
                     ))}
                  </div>
                </div>
              ))}
              {tipologias.length === 0 && (
                <div className="p-8 text-center text-gray-400 border border-dashed rounded-xl font-bold uppercase tracking-widest text-xs">Vazio</div>
              )}
           </div>
        </div>

      </div>
    </div>
  );
}
