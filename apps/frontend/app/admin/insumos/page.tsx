'use client';

import { useStore } from '../../store/useStore';
import { Plus, Trash2, Database, TrendingUp, Pencil, Ruler, FlaskRound, Table2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Insumo, UnidadeMedida, FaixaPrecoVidro } from '@soday/shared';

export default function InsumosPage() {
  const { insumos, addInsumo, removeInsumo, updateInsumo } = useStore();

  const [isMounted, setIsMounted] = useState(false);
  const [modoEdicao, setModoEdicao] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const defaultState: Partial<Insumo> = {
    nome: '',
    categoria: 'COMPONENTS AND HARDWARE',
    unidade: 'M',
    precoUnitario: 0,
    fatorPerdaPadrao: 1.1,
    dimA: undefined,
    dimL: undefined,
    dimP: undefined,
    escalaPrecoPorArea: null,
    fatorEscalaFormula: undefined,
    tabelaPrecos: [],
  };

  const [novo, setNovo] = useState<Partial<Insumo>>(defaultState);

  useEffect(() => { setIsMounted(true); }, []);

  // ---------- TABELA DE PREÇOS (para vidros) ----------
  const handleAddFaixa = () => {
    const faixas = novo.tabelaPrecos ?? [];
    const lastMax = faixas.length > 0 ? faixas[faixas.length - 1].areaMaxM2 : 0;
    const nova: FaixaPrecoVidro = { areaMinM2: lastMax, areaMaxM2: lastMax + 2, precoM2: novo.precoUnitario ?? 0 };
    setNovo({ ...novo, tabelaPrecos: [...faixas, nova] });
  };

  const handleRemoveFaixa = (idx: number) => {
    setNovo({ ...novo, tabelaPrecos: (novo.tabelaPrecos ?? []).filter((_, i) => i !== idx) });
  };

  const handleUpdateFaixa = (idx: number, field: keyof FaixaPrecoVidro, value: number) => {
    const faixas = (novo.tabelaPrecos ?? []).map((f, i) => i === idx ? { ...f, [field]: value } : f);
    setNovo({ ...novo, tabelaPrecos: faixas });
  };

  // ---------- SALVAR ----------
  const handleSalvar = () => {
    if (!novo.nome || !novo.unidade || !novo.categoria) return;
    const payload = {
      ...novo,
      id: modoEdicao ? modoEdicao : Date.now().toString(),
      nome: novo.nome,
      categoria: novo.categoria,
      unidade: novo.unidade as UnidadeMedida,
      precoUnitario: novo.precoUnitario || 0,
      fatorPerdaPadrao: novo.fatorPerdaPadrao || 1.0,
    } as Insumo;

    if (modoEdicao) { updateInsumo(payload); setModoEdicao(null); }
    else { addInsumo(payload); }
    setNovo(defaultState);
  };

  const handleEditar = (item: Insumo) => {
    setModoEdicao(item.id);
    setNovo({ ...item, tabelaPrecos: item.tabelaPrecos ? [...item.tabelaPrecos] : [] });
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCancelarEdicao = () => { setModoEdicao(null); setNovo(defaultState); };

  const isGlass = novo.categoria === 'GLASS';

  if (!isMounted) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-6 mb-20">

      {/* HEADER */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-emerald-900 flex items-center mb-3">
          <Database className="w-8 h-8 mr-3 text-emerald-600" /> Sistema de Insumos Globais
        </h1>
        <p className="text-emerald-800 text-lg">
          Gerencie o preço e as propriedades dimensionais físicas de todos os materiais usados.
        </p>
      </div>

      {/* FORMULÁRIO */}
      <div ref={formRef} className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 border-2 ${modoEdicao ? 'border-yellow-400 ring-4 ring-yellow-400/20' : 'border-gray-200'}`}>
        <div className={`p-5 text-white flex justify-between items-center ${modoEdicao ? 'bg-yellow-600' : 'bg-gray-900'}`}>
          <div>
            <h2 className="text-xl font-black">{modoEdicao ? 'Editando Material' : 'Cadastrar Novo Material'}</h2>
            <p className="text-xs text-white/70">{modoEdicao ? 'Modifique as propriedades e salve' : 'Preencha os dados e opcionais'}</p>
          </div>
          {modoEdicao && (
            <button onClick={handleCancelarEdicao} className="text-sm bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-bold transition">Cancelar Edição</button>
          )}
        </div>

        <div className="p-6 md:p-8 space-y-8">

          {/* --- CAMPOS PRINCIPAIS --- */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
            <div className="md:col-span-3">
              <label className="block text-xs font-black text-gray-500 uppercase mb-2 tracking-widest border-b border-gray-100 pb-1">Identificação (*)</label>
              <input type="text" placeholder="Ex: Silicone, Perfil Marco, Vidro Duplo..."
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:border-emerald-500 outline-none transition-all font-bold text-lg"
                value={novo.nome} onChange={e => setNovo({ ...novo, nome: e.target.value })} />
            </div>

            <div className="md:col-span-1">
              <label className="block text-xs font-black text-gray-500 uppercase mb-2 tracking-widest border-b border-gray-100 pb-1">Categoria (*)</label>
              <select className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-gray-50 outline-none focus:border-emerald-500 font-bold"
                value={novo.categoria}
                onChange={e => setNovo({ ...novo, categoria: e.target.value as any, escalaPrecoPorArea: null, tabelaPrecos: [], fatorEscalaFormula: undefined })}>
                <option value="EXTRUSIONS">Extrusões</option>
                <option value="GLASS">Vidros</option>
                <option value="COMPONENTS AND HARDWARE">Componentes</option>
              </select>
            </div>

            <div className="md:col-span-1">
              <label className="block text-xs font-black text-gray-500 uppercase mb-2 tracking-widest border-b border-gray-100 pb-1">Unidade (*)</label>
              <select className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-gray-50 outline-none focus:border-emerald-500 font-bold"
                value={novo.unidade} onChange={e => setNovo({ ...novo, unidade: e.target.value as UnidadeMedida })}>
                <option value="M">Metro (m)</option>
                <option value="M2">Metro² (m²)</option>
                <option value="UN">Unidade (un)</option>
                <option value="KG">Quilo (kg)</option>
                <option value="PACOTE">Pacote</option>
                <option value="L">Litro (L)</option>
                <option value="ML">Mililitro (ml)</option>
              </select>
            </div>

            <div className="md:col-span-1">
              <label className="block text-xs font-black text-gray-500 uppercase mb-2 tracking-widest border-b border-gray-100 pb-1" title="1.1 = 10% de perda">Fator Perda (*)</label>
              <input type="number" step="0.01" className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 bg-gray-50 outline-none focus:border-emerald-500 text-center font-bold"
                value={novo.fatorPerdaPadrao || ''} onChange={e => setNovo({ ...novo, fatorPerdaPadrao: parseFloat(e.target.value) })} />
            </div>
          </div>

          {/* --- GEOMETRIA E PREÇO BASE --- */}
          <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div className="md:col-span-4 flex items-center text-indigo-800 font-black text-sm uppercase tracking-widest border-b border-indigo-200 pb-2 mb-2">
              <Ruler className="w-5 h-5 mr-2" /> Geometria / Tamanho Real (Opcional)
            </div>
            <div>
              <label className="block text-[10px] font-bold text-indigo-700 uppercase mb-2">Altura (mm)</label>
              <input type="number" placeholder="Ex: 30" className="w-full border border-indigo-200 rounded-lg p-3 outline-none focus:border-indigo-500 font-bold bg-white"
                value={novo.dimA || ''} onChange={e => setNovo({ ...novo, dimA: parseFloat(e.target.value) || undefined })} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-indigo-700 uppercase mb-2">Largura (mm)</label>
              <input type="number" placeholder="Ex: 30" className="w-full border border-indigo-200 rounded-lg p-3 outline-none focus:border-indigo-500 font-bold bg-white"
                value={novo.dimL || ''} onChange={e => setNovo({ ...novo, dimL: parseFloat(e.target.value) || undefined })} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-indigo-700 uppercase mb-2">Profundidade / Espessura (mm)</label>
              <input type="number" placeholder="Ex: 6" className="w-full border border-indigo-200 rounded-lg p-3 outline-none focus:border-indigo-500 font-bold bg-white"
                value={novo.dimP || ''} onChange={e => setNovo({ ...novo, dimP: parseFloat(e.target.value) || undefined })} />
            </div>
            <div className="bg-white border-2 border-emerald-200 p-2 rounded-xl">
              <label className="block text-[10px] font-black text-emerald-700 uppercase mb-1">
                Custo base por 1 {novo.unidade} (*)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm font-black text-emerald-600">R$</span>
                <input type="number" step="0.01"
                  className="w-full border-none pl-9 pr-2 py-2 bg-transparent outline-none font-black text-2xl text-emerald-800"
                  value={novo.precoUnitario || ''} onChange={e => setNovo({ ...novo, precoUnitario: parseFloat(e.target.value) })} />
              </div>
            </div>
          </div>

          {/* --- SEÇÃO EXCLUSIVA DE VIDRO --- */}
          {isGlass && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 space-y-6">
              <div className="flex items-center text-blue-800 font-black text-sm uppercase tracking-widest border-b border-blue-200 pb-3">
                <FlaskRound className="w-5 h-5 mr-2" /> Precificação Dinâmica de Vidro
              </div>

              {/* FLAG: Modo de escala */}
              <div>
                <label className="block text-xs font-black text-blue-700 uppercase mb-3 tracking-widest">Modo de Precificação por Área</label>
                <div className="flex gap-3 flex-wrap">
                  {[
                    { value: null, label: 'Preço Fixo', desc: 'Preço por m² fixo para qualquer tamanho' },
                    { value: 'FORMULA', label: '📈 Fórmula Exponencial', desc: 'Preço sobe gradualmente com a área' },
                    { value: 'TABELA', label: '📊 Tabela de Faixas', desc: 'Define preços por faixas de tamanho' },
                  ].map(opt => (
                    <button
                      key={String(opt.value)}
                      type="button"
                      onClick={() => setNovo({ ...novo, escalaPrecoPorArea: opt.value as any, tabelaPrecos: opt.value === 'TABELA' ? (novo.tabelaPrecos?.length ? novo.tabelaPrecos : []) : [], fatorEscalaFormula: opt.value === 'FORMULA' ? (novo.fatorEscalaFormula || 5) : undefined })}
                      className={`flex-1 min-w-[160px] text-left p-4 rounded-xl border-2 transition-all ${novo.escalaPrecoPorArea === opt.value ? 'border-blue-600 bg-blue-600 text-white shadow-lg' : 'border-blue-200 bg-white text-blue-800 hover:border-blue-400'}`}
                    >
                      <div className="font-black text-sm">{opt.label}</div>
                      <div className={`text-xs mt-1 ${novo.escalaPrecoPorArea === opt.value ? 'text-blue-100' : 'text-blue-500'}`}>{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Fórmula Exponencial */}
              {novo.escalaPrecoPorArea === 'FORMULA' && (
                <div className="bg-white rounded-xl p-5 border border-blue-200">
                  <div className="flex items-end gap-6">
                    <div className="flex-1">
                      <label className="block text-xs font-black text-blue-700 uppercase mb-2">Fator de Escala (% por m²)</label>
                      <input type="number" step="0.5" min="0"
                        className="w-full border-2 border-blue-200 rounded-lg p-3 text-xl font-black outline-none focus:border-blue-500"
                        value={novo.fatorEscalaFormula ?? ''}
                        onChange={e => setNovo({ ...novo, fatorEscalaFormula: parseFloat(e.target.value) })} />
                      <p className="text-xs text-blue-500 mt-2">Ex: fator 5 significa que +1 m² adiciona +5% no preço base por m².</p>
                    </div>
                    {novo.precoUnitario && novo.fatorEscalaFormula ? (
                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 min-w-[220px]">
                        <p className="text-[10px] font-black text-blue-500 uppercase mb-2">Simulação de Preço</p>
                        {[1, 2, 3, 4].map(area => {
                          const escala = 1 + (novo.fatorEscalaFormula! / 100) * area;
                          const preco = (novo.precoUnitario! * escala).toFixed(2);
                          return (
                            <div key={area} className="flex justify-between text-xs font-bold py-1 border-b border-blue-100 last:border-0">
                              <span className="text-blue-700">{area} m²</span>
                              <span className="text-blue-900">R$ {preco}/m²</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                </div>
              )}

              {/* Tabela de Faixas */}
              {novo.escalaPrecoPorArea === 'TABELA' && (
                <div className="bg-white rounded-xl p-5 border border-blue-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-blue-800 font-black text-xs uppercase tracking-widest">
                      <Table2 className="w-4 h-4 mr-2" /> Tabela de Preços por Área de Vidro
                    </div>
                    <button onClick={handleAddFaixa} className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-3 py-2 rounded-lg transition">
                      <Plus className="w-3.5 h-3.5" /> Nova Faixa
                    </button>
                  </div>

                  {(novo.tabelaPrecos ?? []).length === 0 ? (
                    <div className="text-center py-6 text-blue-300 font-bold text-xs uppercase tracking-widest border-2 border-dashed border-blue-200 rounded-xl">
                      Nenhuma faixa cadastrada. Clique em "Nova Faixa".
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-11 gap-2 text-[10px] font-black text-blue-500 uppercase tracking-widest px-2">
                        <div className="col-span-3">Área Mínima (m²)</div>
                        <div className="col-span-3">Área Máxima (m²)</div>
                        <div className="col-span-4">Preço por m² (R$)</div>
                        <div className="col-span-1"></div>
                      </div>
                      {(novo.tabelaPrecos ?? []).map((faixa, idx) => (
                        <div key={idx} className="grid grid-cols-11 gap-2 items-center bg-blue-50/50 p-2 rounded-lg border border-blue-100">
                          <div className="col-span-3">
                            <input type="number" step="0.1" min="0"
                              className="w-full border border-blue-200 rounded px-2 py-1.5 text-sm font-bold text-center bg-white outline-none focus:border-blue-500"
                              value={faixa.areaMinM2}
                              onChange={e => handleUpdateFaixa(idx, 'areaMinM2', parseFloat(e.target.value))} />
                          </div>
                          <div className="col-span-3">
                            <input type="number" step="0.1" min="0"
                              className="w-full border border-blue-200 rounded px-2 py-1.5 text-sm font-bold text-center bg-white outline-none focus:border-blue-500"
                              value={faixa.areaMaxM2}
                              onChange={e => handleUpdateFaixa(idx, 'areaMaxM2', parseFloat(e.target.value))} />
                          </div>
                          <div className="col-span-4 relative">
                            <span className="absolute left-2.5 top-1.5 text-xs font-black text-emerald-600">R$</span>
                            <input type="number" step="1" min="0"
                              className="w-full border border-emerald-200 rounded pl-8 pr-2 py-1.5 text-sm font-black text-emerald-800 bg-white outline-none focus:border-emerald-500"
                              value={faixa.precoM2}
                              onChange={e => handleUpdateFaixa(idx, 'precoM2', parseFloat(e.target.value))} />
                          </div>
                          <div className="col-span-1 flex justify-center">
                            <button onClick={() => handleRemoveFaixa(idx)} className="text-red-400 hover:text-red-600 p-1 rounded transition">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Preview da tabela */}
                      <div className="text-[10px] text-blue-500 font-bold pt-2 px-1">
                        💡 A última faixa será usada para vidros maiores que o limite máximo definido.
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* SALVAR */}
          <button
            onClick={handleSalvar}
            disabled={!novo.nome || !novo.unidade}
            className={`w-full font-black text-lg h-[60px] rounded-xl flex items-center justify-center transition-all uppercase tracking-widest shadow-xl
              ${modoEdicao ? 'bg-yellow-500 hover:bg-yellow-600 text-yellow-900 shadow-yellow-500/30' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'}
              disabled:opacity-50 disabled:grayscale`}
          >
            {modoEdicao ? 'Salvar Alterações do Material' : 'Gravar Material no Banco'}
          </button>
        </div>
      </div>

      {/* LISTAGEM */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-12">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-[10px] uppercase font-black text-gray-500 tracking-wider">Material / Categoria</th>
                <th className="px-6 py-4 text-[10px] uppercase font-black text-gray-500 tracking-wider text-center">Unidade</th>
                <th className="px-6 py-4 text-[10px] uppercase font-black text-gray-500 tracking-wider">Precificação</th>
                <th className="px-6 py-4 text-[10px] uppercase font-black text-gray-500 tracking-wider">Preço Base</th>
                <th className="px-6 py-4 text-[10px] uppercase font-black text-gray-500 tracking-wider text-right">Controle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {insumos.map(item => (
                <tr key={item.id} className={`hover:bg-gray-50 transition-colors group ${modoEdicao === item.id ? 'bg-yellow-50/50' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="font-black text-gray-900 text-base">{item.nome}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter ${
                        item.categoria === 'GLASS' ? 'bg-blue-100 text-blue-700' :
                        item.categoria === 'EXTRUSIONS' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>{item.categoria}</span>
                      <div className="text-orange-600 font-bold text-[10px] flex items-center"><TrendingUp className="w-3 h-3 mr-1" /> {item.fatorPerdaPadrao}x de perda</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1 rounded text-xs font-black uppercase shadow-sm">{item.unidade}</span>
                  </td>
                  <td className="px-6 py-4">
                    {item.categoria === 'GLASS' && item.escalaPrecoPorArea ? (
                      <div>
                        <span className={`text-[9px] font-black px-2 py-1 rounded uppercase ${item.escalaPrecoPorArea === 'FORMULA' ? 'bg-purple-100 text-purple-700' : 'bg-teal-100 text-teal-700'}`}>
                          {item.escalaPrecoPorArea === 'FORMULA' ? `📈 Fórmula (${item.fatorEscalaFormula}%/m²)` : `📊 Tabela (${item.tabelaPrecos?.length} faixas)`}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-gray-300 font-bold italic">Preço fixo por {item.unidade}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-extrabold text-emerald-700 text-lg">R$ {item.precoUnitario.toFixed(2)} <span className="text-gray-400 text-xs font-medium">/ {item.unidade}</span></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2 opacity-20 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEditar(item)} className="bg-yellow-100 text-yellow-700 hover:bg-yellow-500 hover:text-white p-2 rounded-lg transition-colors" title="Editar">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => removeInsumo(item.id)} className="bg-red-50 text-red-500 hover:bg-red-600 hover:text-white p-2 rounded-lg transition-colors" title="Deletar">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {insumos.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">O banco nacional de materiais está vazio.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
