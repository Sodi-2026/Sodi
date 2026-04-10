// apps/frontend/app/utils/calculator.ts
import { Insumo, Tipologia, ResultadoOrcamento, VinculoInsumo, DetalheCalculoItem } from '@soday/shared';

// ---------------------------------------------------------------------------
// FUNÇÃO: Calcular preço efetivo do m² para vidros com escalonamento
// ---------------------------------------------------------------------------
function calcularPrecoVidro(insumo: Insumo, areaM2: number): number {
  if (insumo.categoria !== 'GLASS' || !insumo.escalaPrecoPorArea) {
    return insumo.precoUnitario;
  }

  if (insumo.escalaPrecoPorArea === 'FORMULA' && insumo.fatorEscalaFormula) {
    // Preço cresce gradualmente conforme a área aumenta
    // Fórmula: preço base * (1 + (fatorEscala/100) * area)
    const escala = 1 + (insumo.fatorEscalaFormula / 100) * areaM2;
    return insumo.precoUnitario * escala;
  }

  if (insumo.escalaPrecoPorArea === 'TABELA' && insumo.tabelaPrecos && insumo.tabelaPrecos.length > 0) {
    // Procura a faixa onde a área se encaixa
    const faixa = insumo.tabelaPrecos.find(
      f => areaM2 >= f.areaMinM2 && areaM2 < f.areaMaxM2
    );
    if (faixa) return faixa.precoM2;
    // Se ultrapassar todas as faixas, usa a última
    const ultimaFaixa = insumo.tabelaPrecos[insumo.tabelaPrecos.length - 1];
    return ultimaFaixa.precoM2;
  }

  return insumo.precoUnitario;
}

// ---------------------------------------------------------------------------
// FUNÇÃO: Calcular proporção para Components and Hardware
// ---------------------------------------------------------------------------
function calcularQtdProporcional(
  qtdPadrao: number,
  perimPadraoMm: number,
  perimRealMm: number
): number {
  if (perimPadraoMm <= 0) return qtdPadrao;
  const qtdProporcional = qtdPadrao * (perimRealMm / perimPadraoMm);
  return Math.ceil(qtdProporcional); // Sempre arredonda para cima
}

// ---------------------------------------------------------------------------
// MOTOR PRINCIPAL
// ---------------------------------------------------------------------------
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
      mensagemErro: `Medidas fora do limite permitido (L: ${tipologia.minL}–${tipologia.maxL}mm / A: ${tipologia.minA}–${tipologia.maxA}mm)`,
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

  // Perímetros para escalonamento de hardware
  const perimPadraoMm = 2 * tipologia.larguraPadraoMm + 2 * tipologia.alturaPadraoMm;
  const perimRealMm = 2 * L + 2 * A;

  // 2. Processar cada Etapa e cada Item Vinculado
  tipologia.etapas.forEach(etapa => {
    etapa.itens.forEach(vinculo => {
      const insumo = bancoInsumos.find(i => i.id === vinculo.insumoId);
      if (!insumo) return;

      let qtdCalculada = 0;
      let logicaDesc = '';
      let precoUnitarioEfetivo = insumo.precoUnitario;

      // -----------------------------------------------------------------------
      // COMPONENTES & HARDWARE: Escalonamento proporcional pelo perímetro
      // -----------------------------------------------------------------------
      if (insumo.categoria === 'COMPONENTS AND HARDWARE' && vinculo.logica === 'FIXO') {
        qtdCalculada = calcularQtdProporcional(vinculo.quantidadeBase, perimPadraoMm, perimRealMm);
        logicaDesc = `Proporcional (${vinculo.quantidadeBase} no padrão ${tipologia.larguraPadraoMm}x${tipologia.alturaPadraoMm}mm → ↑ ${Math.ceil((perimRealMm / perimPadraoMm) * 100) - 100}%)`;
      }
      // -----------------------------------------------------------------------
      // VIDROS: Área com ajustes L/A independentes + preço escalonado
      // -----------------------------------------------------------------------
      else if (insumo.categoria === 'GLASS') {
        const adjL = vinculo.ajusteLMm ?? vinculo.ajusteMm;
        const adjA = vinculo.ajusteAMm ?? vinculo.ajusteMm;
        const L_final = L + adjL + vinculo.transpasseMm;
        const A_final = A + adjA + vinculo.transpasseMm;
        qtdCalculada = ((L_final * A_final) / 1_000_000) * vinculo.quantidadeBase;
        precoUnitarioEfetivo = calcularPrecoVidro(insumo, qtdCalculada);
        logicaDesc = `Área ${(L_final / 1000).toFixed(2)}m × ${(A_final / 1000).toFixed(2)}m` +
          (insumo.escalaPrecoPorArea ? ` | Preço escalonado (${insumo.escalaPrecoPorArea})` : '');
      }
      // -----------------------------------------------------------------------
      // EXTRUSÕES e demais: Lógica linear original
      // -----------------------------------------------------------------------
      else {
        const adjL = vinculo.ajusteMm;
        const adjA = vinculo.ajusteMm;
        const L_final = L + adjL + vinculo.transpasseMm;
        const A_final = A + adjA + vinculo.transpasseMm;

        switch (vinculo.logica) {
          case 'LINEAR_L':
            qtdCalculada = (L_final / 1000) * vinculo.quantidadeBase;
            logicaDesc = `Largura ${(L_final / 1000).toFixed(3)}m × ${vinculo.quantidadeBase}`;
            break;
          case 'LINEAR_A':
            qtdCalculada = (A_final / 1000) * vinculo.quantidadeBase;
            logicaDesc = `Altura ${(A_final / 1000).toFixed(3)}m × ${vinculo.quantidadeBase}`;
            break;
          case 'PERIMETRO':
            qtdCalculada = ((2 * L_final + 2 * A_final) / 1000) * vinculo.quantidadeBase;
            logicaDesc = `Perímetro ${((2 * L_final + 2 * A_final) / 1000).toFixed(3)}m × ${vinculo.quantidadeBase}`;
            break;
          case 'AREA_VAO':
          case 'AREA_VIDRO':
            qtdCalculada = ((L_final * A_final) / 1_000_000) * vinculo.quantidadeBase;
            logicaDesc = `Área ${(L_final / 1000).toFixed(2)}m × ${(A_final / 1000).toFixed(2)}m`;
            break;
          case 'FIXO':
            qtdCalculada = vinculo.quantidadeBase;
            logicaDesc = `Qtd fixa`;
            break;
        }
      }

      // Fator de Perda + Custo
      const qtdComPerda = qtdCalculada * (insumo.fatorPerdaPadrao || 1);
      const custoItem = qtdComPerda * precoUnitarioEfetivo;

      detalhes.push({
        etapaNome: etapa.nome,
        insumoNome: insumo.nome,
        insumoCategoria: insumo.categoria,
        unidade: insumo.unidade,
        quantidadeCalculada: parseFloat(qtdComPerda.toFixed(3)),
        precoUnitario: precoUnitarioEfetivo,
        custoTotal: parseFloat(custoItem.toFixed(2)),
        logicaAplicada: logicaDesc
      });

      custoTotalMateriais += custoItem;
    });
  });

  const valorVenda = custoTotalMateriais * (1 + margemLucroPercent / 100);

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
