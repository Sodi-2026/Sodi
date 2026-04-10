import { Insumo, Tipologia, ResultadoOrcamento, VinculoInsumo, DetalheCalculoItem } from '@soday/shared';

export function calcularOrcamentoPro(
  L: number, // mm
  A: number, // mm
  tipologia: Tipologia,
  bancoInsumos: Insumo[],
  margemLucroPercent: number = 45
): ResultadoOrcamento {
  
  // 1. Validações de Travas de Segurança
  if (L < tipologia.minL || L > tipologia.maxL || A < tipologia.minA || A > tipologia.maxA) {
    return {
      sucesso: false,
      mensagemErro: `Medidas fora do limite permitido (${tipologia.minL}x${tipologia.minA} a ${tipologia.maxL}x${tipologia.maxA})`,
      itemNome: tipologia.nome,
      medidas: { L, A },
      detalhes: [],
      custoMateriais: 0,
      margemLucroPercent,
      valorVenda: 0
    };
  }

  const detalhes: DetalheCalculoItem[] = [];
  let custoTotalMateriais = 0;

  // 2. Processar cada Etapa e cada Item Vinculado
  tipologia.etapas.forEach(etapa => {
    etapa.itens.forEach(vinculo => {
      const insumo = bancoInsumos.find(i => i.id === vinculo.insumoId);
      if (!insumo) return;

      let qtdCalculada = 0;
      let logicaDesc = '';

      const L_final = L + vinculo.ajusteMm + vinculo.transpasseMm;
      const A_final = A + vinculo.ajusteMm + vinculo.transpasseMm;

      // MOTOR DE REGRAS MATEMÁTICAS
      switch (vinculo.logica) {
        case 'LINEAR_L':
          qtdCalculada = (L_final / 1000) * vinculo.quantidadeBase;
          logicaDesc = `(${L}mm + ajuste) * ${vinculo.quantidadeBase}`;
          break;
        case 'LINEAR_A':
          qtdCalculada = (A_final / 1000) * vinculo.quantidadeBase;
          logicaDesc = `(${A}mm + ajuste) * ${vinculo.quantidadeBase}`;
          break;
        case 'PERIMETRO':
          qtdCalculada = ((2 * L_final + 2 * A_final) / 1000) * vinculo.quantidadeBase;
          logicaDesc = `Perímetro * ${vinculo.quantidadeBase}`;
          break;
        case 'AREA_VAO':
        case 'AREA_VIDRO':
          qtdCalculada = ((L_final * A_final) / 1000000) * vinculo.quantidadeBase;
          logicaDesc = `Área (m2) * ${vinculo.quantidadeBase}`;
          break;
        case 'FIXO':
          qtdCalculada = vinculo.quantidadeBase;
          logicaDesc = 'Quantidade fixa';
          break;
      }

      // Aplicação do Fator de Perda do Insumo
      const qtdComPerda = qtdCalculada * (insumo.fatorPerdaPadrao || 1);
      const custoItem = qtdComPerda * insumo.precoUnitario;

      detalhes.push({
        etapaNome: etapa.nome,
        insumoNome: insumo.nome,
        unidade: insumo.unidade,
        quantidadeCalculada: parseFloat(qtdComPerda.toFixed(3)),
        precoUnitario: insumo.precoUnitario,
        custoTotal: parseFloat(custoItem.toFixed(2)),
        logicaAplicada: logicaDesc
      });

      custoTotalMateriais += custoItem;
    });
  });

  const valorVenda = custoTotalMateriais * (1 + (margemLucroPercent / 100));

  return {
    sucesso: true,
    itemNome: tipologia.nome,
    medidas: { L, A },
    detalhes,
    custoMateriais: parseFloat(custoTotalMateriais.toFixed(2)),
    margemLucroPercent,
    valorVenda: parseFloat(valorVenda.toFixed(2))
  };
}
