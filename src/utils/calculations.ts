/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PricingInputs, PricingResult, Scenario } from '../types';

export function calculatePricing(inputs: PricingInputs): PricingResult {
  const {
    productionCost,
    fixedCosts,
    desiredPrice,
    discountPercentage,
    discountValue,
    couponPercentage,
    couponValue,
    platformFeePercentage,
    shippingCost,
    shippingPaidBy,
    customCosts = [],
    desiredProfitPercentage = 0
  } = inputs;

  const customCostsTotal = customCosts.reduce((acc, cost) => acc + cost.value, 0);

  // Calculate Discounts
  const percentageDiscount = (desiredPrice * discountPercentage) / 100;
  const percentageCoupon = (desiredPrice * couponPercentage) / 100;
  const totalDiscount = percentageDiscount + discountValue + percentageCoupon + couponValue;
  
  const finalPrice = Math.max(0, desiredPrice - totalDiscount);

  // Platform Fee
  const platformFeeValue = (finalPrice * platformFeePercentage) / 100;

  // Shipping
  const shippingCostValue = shippingPaidBy === 'seller' ? shippingCost : 0;

  // Total Cost
  const totalCost = productionCost + fixedCosts + customCostsTotal + platformFeeValue + shippingCostValue;

  // Profit
  const netProfit = finalPrice - totalCost;
  
  // Margin & ROI
  const marginPercentage = finalPrice > 0 ? (netProfit / finalPrice) * 100 : 0;
  const roi = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;

  // Break-even Calculation
  // finalPrice = productionCost + fixedCosts + (finalPrice * platformFeePercentage / 100) + shippingCostValue
  // finalPrice * (1 - platformFeePercentage / 100) = productionCost + fixedCosts + shippingCostValue
  // breakEvenPrice = (productionCost + fixedCosts + shippingCostValue) / (1 - platformFeePercentage / 100)
  const breakEvenPrice = (productionCost + fixedCosts + customCostsTotal + shippingCostValue) / (1 - platformFeePercentage / 100);
  
  // Suggested Price
  const divisor = 1 - (platformFeePercentage / 100) - (desiredProfitPercentage / 100);
  const totalBaseCosts = productionCost + fixedCosts + customCostsTotal + shippingCostValue;
  const suggestedPrice = divisor > 0 ? totalBaseCosts / divisor : 0;

  return {
    finalPrice,
    totalDiscount,
    platformFeeValue,
    shippingCostValue,
    totalCost,
    netProfit,
    marginPercentage,
    roi,
    breakEvenPrice: isFinite(breakEvenPrice) ? breakEvenPrice : 0,
    suggestedPrice: isFinite(suggestedPrice) ? suggestedPrice : 0,
    comparisonResults: inputs.platformComparisons?.map(p => {
      const pFee = (finalPrice * p) / 100;
      const tCost = productionCost + fixedCosts + customCostsTotal + pFee + shippingCostValue;
      const nProfit = finalPrice - tCost;
      return {
        platformPercentage: p,
        netProfit: nProfit,
        marginPercentage: finalPrice > 0 ? (nProfit / finalPrice) * 100 : 0
      };
    })
  };
}

export function formatCurrency(value: number, currencyCode: string = 'BRL'): string {
  const locale = currencyCode === 'BRL' ? 'pt-BR' : currencyCode === 'USD' ? 'en-US' : 'de-DE';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
  }).format(value);
}

export function generateCSV(inputs: PricingInputs, results: PricingResult, scenarios: Scenario[]): string {
  const sanitize = (val: any) => {
    if (typeof val === 'number') {
      // Round to 2 decimal places and ensure it's a string
      return `"${val.toFixed(2).replace('.', ',')}"`;
    }
    return `"${String(val).replace(/"/g, '""')}"`;
  };
  
  const rows = [
    ['--- RELATÓRIO LUCRASMART ---'],
    ['Data/Hora', new Date().toLocaleString('pt-BR')],
    ['Moeda', inputs.currency],
    [],
    ['--- PRODUTO E BASE ---'],
    ['Custo Produção', inputs.productionCost],
    ['Custos Fixos', inputs.fixedCosts],
    ...(inputs.customCosts || []).map(c => [c.name, c.value]),
    [],
    ['--- TAXAS E DESCONTOS ---'],
    ['Preço Desejado', inputs.desiredPrice],
    ['Preço Sugerido (Meta %)', results.suggestedPrice],
    ['Lucro Desejado (%)', inputs.desiredProfitPercentage],
    ['Taxa Plataforma (%)', inputs.platformFeePercentage],
    ['Cupom (%)', inputs.couponPercentage],
    [],
    ['--- LOGÍSTICA ---'],
    ['Responsável pelo Frete', inputs.shippingPaidBy === 'seller' ? 'Vendedor' : 'Cliente'],
    ['Custo do Frete', inputs.shippingCost],
    [],
    ['--- RESULTADO ATUAL ---'],
    ['Preço Final (Bruto)', results.finalPrice],
    ['Lucro Líquido Unitário', results.netProfit],
    ['Margem de Lucro (%)', results.marginPercentage],
    ['ROI (%)', results.roi],
    ['Ponto de Equilíbrio (Break-even)', results.breakEvenPrice],
    [],
    ['--- SIMULAÇÃO DE CENÁRIOS ---'],
    ['Cenário', 'Preço de Venda', 'Custo Total', 'Lucro Líquido', 'Margem (%)'],
  ];

  const formattedRows = rows.map(r => r.map(sanitize).join(';'));

  scenarios.forEach(s => {
    formattedRows.push([
      sanitize(s.label),
      sanitize(s.price),
      sanitize(s.result.totalCost),
      sanitize(s.result.netProfit),
      sanitize(s.result.marginPercentage)
    ].join(';'));
  });

  return formattedRows.join('\n');
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
}
