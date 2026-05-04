/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PricingInputs {
  productionCost: number;
  fixedCosts: number;
  desiredPrice: number;
  discountPercentage: number;
  discountValue: number;
  couponPercentage: number;
  couponValue: number;
  platformFeePercentage: number;
  shippingCost: number;
  shippingPaidBy: 'seller' | 'customer';
  currency: string;
  customScenarios: number[];
  customCosts: { name: string; value: number; type: 'one-time' | 'recurring' }[];
  platformComparisons: number[];
  desiredProfitPercentage: number;
}

export interface PricingResult {
  finalPrice: number;
  totalDiscount: number;
  platformFeeValue: number;
  shippingCostValue: number;
  totalCost: number;
  netProfit: number;
  marginPercentage: number;
  roi: number;
  breakEvenPrice: number;
  suggestedPrice: number;
  comparisonResults?: { platformPercentage: number; netProfit: number; marginPercentage: number }[];
}

export interface Scenario {
  label: string;
  price: number;
  result: PricingResult;
}
