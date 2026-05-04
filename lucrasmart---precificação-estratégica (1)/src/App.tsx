/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, ReactNode } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  RotateCcw,
  BarChart3,
  HelpCircle,
  Save,
  Package,
  Tag,
  CreditCard,
  Truck,
  AlertTriangle,
  Info,
  Download,
  Plus,
  X,
  Globe,
  PieChart as PieChartIcon,
  Layers,
  ArrowRight,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import LandingPage from './components/LandingPage';
import { PricingInputs, PricingResult, Scenario } from './types';
import { calculatePricing, formatCurrency, formatPercent, generateCSV } from './utils/calculations';

const DEFAULT_INPUTS: PricingInputs = {
  productionCost: 0,
  fixedCosts: 0,
  desiredPrice: 0,
  discountPercentage: 0,
  discountValue: 0,
  couponPercentage: 0,
  couponValue: 0,
  platformFeePercentage: 0,
  shippingCost: 0,
  shippingPaidBy: 'seller',
  currency: 'BRL',
  customScenarios: [],
  customCosts: [],
  platformComparisons: [5, 10, 15, 20],
  desiredProfitPercentage: 20,
};

interface TooltipProps {
  content: string;
  children: ReactNode;
}

function Tooltip({ content, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block" onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)}>
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-white text-[10px] rounded-lg shadow-xl pointer-events-none"
          >
            {content}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<'landing' | 'app'>('landing');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('lucrasmart_theme');
    return (saved as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('lucrasmart_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const [inputs, setInputs] = useState<PricingInputs>(() => {
    const saved = localStorage.getItem('lucrasmart_inputs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_INPUTS, ...parsed };
      } catch (e) {
        return DEFAULT_INPUTS;
      }
    }
    return DEFAULT_INPUTS;
  });

  useEffect(() => {
    localStorage.setItem('lucrasmart_inputs', JSON.stringify(inputs));
  }, [inputs]);

  const results = useMemo(() => calculatePricing(inputs), [inputs]);

  const scenarios = useMemo((): Scenario[] => {
    const basePrice = inputs.desiredPrice || results.breakEvenPrice;
    const defaultScenarios = [
      { label: 'Baixo (Estratégico)', price: basePrice * 0.9, result: calculatePricing({ ...inputs, desiredPrice: basePrice * 0.9 }) },
      { label: 'Ideal (Meta)', price: basePrice, result: calculatePricing({ ...inputs, desiredPrice: basePrice }) },
      { label: 'Alto (Premium)', price: basePrice * 1.15, result: calculatePricing({ ...inputs, desiredPrice: basePrice * 1.15 }) },
    ];
    
    const custom = inputs.customScenarios.map((p, i) => ({
      label: `Personalizado ${i + 1}`,
      price: p,
      result: calculatePricing({ ...inputs, desiredPrice: p })
    }));

    return [...defaultScenarios, ...custom].sort((a, b) => a.price - b.price);
  }, [inputs, results.breakEvenPrice]);

  const handleInputChange = (key: keyof PricingInputs, value: any) => {
    setInputs(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetInputs = () => {
    setInputs(DEFAULT_INPUTS);
    localStorage.removeItem('lucrasmart_inputs');
  };

  const [isAddingScenario, setIsAddingScenario] = useState(false);
  const [newScenarioPrice, setNewScenarioPrice] = useState('');

  const addCustomScenario = () => {
    const price = parseFloat(newScenarioPrice);
    if (!isNaN(price) && price > 0) {
      setInputs(prev => ({
        ...prev,
        customScenarios: [...prev.customScenarios, price]
      }));
      setNewScenarioPrice('');
      setIsAddingScenario(false);
    } else {
      alert('Por favor, insira um valor numérico válido.');
    }
  };

  const removeCustomScenario = (index: number) => {
    setInputs(prev => ({
      ...prev,
      customScenarios: prev.customScenarios.filter((_, i) => i !== index)
    }));
  };

  const addCustomCost = () => {
    setInputs(prev => ({
      ...prev,
      customCosts: [...prev.customCosts, { name: 'Novo Custo', value: 0 }]
    }));
  };

  const removeCustomCost = (index: number) => {
    setInputs(prev => ({
      ...prev,
      customCosts: prev.customCosts.filter((_, i) => i !== index)
    }));
  };

  const updateCustomCost = (index: number, field: 'name' | 'value' | 'type', value: any) => {
    setInputs(prev => {
      const newCosts = [...prev.customCosts];
      newCosts[index] = { ...newCosts[index], [field]: value };
      return { ...prev, customCosts: newCosts };
    });
  };

  const chartData = useMemo(() => {
    const customCostsTotal = inputs.customCosts.reduce((acc, c) => acc + c.value, 0);
    return [
      { name: 'Produção', value: inputs.productionCost, color: '#10b981' },
      { name: 'Fixos', value: inputs.fixedCosts, color: '#3b82f6' },
      { name: 'Customizados', value: customCostsTotal, color: '#8b5cf6' },
      { name: 'Taxas', value: results.platformFeeValue, color: '#f59e0b' },
      { name: 'Logística', value: results.shippingCostValue, color: '#ef4444' },
    ].filter(d => d.value > 0);
  }, [inputs, results]);

  const downloadReport = () => {
    const csvContent = generateCSV(inputs, results, scenarios);
    const BOM = "\uFEFF"; // UTF-8 BOM
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `lucrasmart_relatorio_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (view === 'landing') {
    return <LandingPage onStart={() => setView('app')} />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans p-4 md:p-8 overflow-x-hidden`}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 cursor-pointer group" onClick={() => setView('landing')}>
              <div className={`p-2 ${theme === 'dark' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-white'} rounded-lg group-hover:scale-110 transition-transform`}>
                <Calculator className="w-6 h-6" />
              </div>
              <h1 className={`text-2xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                LucraSmart <span className="text-emerald-500">v1.4</span>
              </h1>
            </div>
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} font-medium uppercase tracking-wider`}>Calculadora de Margem e Simulação de Vendas</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className={`p-2.5 rounded-lg border transition-all ${
                theme === 'dark' 
                  ? 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800 shadow-lg shadow-amber-900/10' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm'
              }`}
              title={theme === 'light' ? 'Ativar Modo Escuro' : 'Ativar Modo Claro'}
            >
              {theme === 'light' ? <Moon className="w-5 h-5 fill-slate-100" /> : <Sun className="w-5 h-5 fill-amber-400" />}
            </button>
            <div className={`flex items-center gap-2 px-3 py-2 border rounded-lg shadow-sm transition-colors ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <Globe className={`w-4 h-4 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} />
              <select 
                value={inputs.currency}
                onChange={(e) => handleInputChange('currency', e.target.value)}
                className={`text-sm font-bold bg-transparent outline-none cursor-pointer ${
                  theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
                }`}
              >
                <option value="BRL">BRL (R$)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
            <button 
              onClick={resetInputs}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
              id="reset-button"
            >
              <RotateCcw className="w-4 h-4" />
              Limpar
            </button>
            <button 
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold shadow-sm hover:bg-emerald-700 transition-all border border-emerald-500"
              onClick={downloadReport}
            >
              <Download className="w-4 h-4" />
              Relatório
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Controls - Left Sidebar */}
          <aside className="lg:col-span-4 space-y-8">
            <section id="product-section">
              <h3 className={`text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                <span className={`w-4 h-px ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-300'}`}></span> 1. Produto e Base
              </h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className={`text-xs font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Custo de Produção / Aquisição</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{inputs.currency === 'BRL' ? 'R$' : inputs.currency === 'USD' ? '$' : '€'}</span>
                    <input 
                      type="number" 
                      value={inputs.productionCost || ''}
                      onChange={(e) => handleInputChange('productionCost', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                      className={`w-full pl-10 pr-3 py-2 border rounded-md outline-none text-sm font-mono transition-all ${
                        theme === 'dark' 
                          ? 'bg-slate-900 border-slate-800 text-white focus:ring-emerald-500/30 focus:border-emerald-500' 
                          : 'bg-white border-slate-200 focus:ring-emerald-500 shadow-sm'
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className={`text-xs font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Embalagem e Custos Fixos</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{inputs.currency === 'BRL' ? 'R$' : inputs.currency === 'USD' ? '$' : '€'}</span>
                    <input 
                      type="number" 
                      value={inputs.fixedCosts || ''}
                      onChange={(e) => handleInputChange('fixedCosts', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                      className={`w-full pl-10 pr-3 py-2 border rounded-md outline-none text-sm font-mono transition-all ${
                        theme === 'dark' 
                          ? 'bg-slate-900 border-slate-800 text-white focus:ring-emerald-500/30 focus:border-emerald-500' 
                          : 'bg-white border-slate-200 focus:ring-emerald-500 shadow-sm'
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {inputs.customCosts.map((cost, idx) => (
                  <div key={idx} className="space-y-1 animate-in fade-in slide-in-from-left-2 duration-300">
                    <div className="flex justify-between items-center group">
                      <div className="flex items-center gap-2 flex-1">
                        <select 
                          value={cost.type || 'one-time'}
                          onChange={(e) => updateCustomCost(idx, 'type', e.target.value)}
                          className={`text-[8px] font-bold uppercase tracking-tighter px-1 py-0.5 rounded transition-colors ${
                            theme === 'dark' ? 'bg-slate-800 text-slate-400 hover:text-slate-200' : 'bg-slate-100 text-slate-500'
                          } border-none outline-none`}
                        >
                          <option value="one-time">Único</option>
                          <option value="recurring">Mensal</option>
                        </select>
                        <input 
                          type="text"
                          value={cost.name}
                          onChange={(e) => updateCustomCost(idx, 'name', e.target.value)}
                          className={`text-xs font-semibold bg-transparent outline-none border-b transition-colors ${
                            theme === 'dark' ? 'text-slate-300 border-transparent focus:border-emerald-500/50' : 'text-slate-600 border-transparent focus:border-emerald-500'
                          } w-full`}
                        />
                      </div>
                      <button 
                        onClick={() => removeCustomCost(idx)}
                        className={`opacity-0 group-hover:opacity-100 p-0.5 rounded transition-all ${
                          theme === 'dark' ? 'hover:bg-rose-900/30 text-rose-500' : 'hover:bg-rose-50 text-rose-400 hover:text-rose-600'
                        }`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{inputs.currency === 'BRL' ? 'R$' : inputs.currency === 'USD' ? '$' : '€'}</span>
                      <input 
                        type="number" 
                        value={cost.value || ''}
                        onChange={(e) => updateCustomCost(idx, 'value', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                        className={`w-full pl-10 pr-3 py-2 border rounded-md outline-none text-sm font-mono transition-all ${
                          theme === 'dark' 
                            ? 'bg-slate-900 border-slate-800 text-white focus:ring-emerald-500/30 focus:border-emerald-500' 
                            : 'bg-white border-slate-200 focus:ring-emerald-500 shadow-sm'
                        }`}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                ))}

                <button 
                  onClick={addCustomCost}
                  className={`w-full py-2 border border-dashed rounded-md text-[10px] uppercase font-bold transition-all flex items-center justify-center gap-1 ${
                    theme === 'dark' 
                      ? 'border-slate-800 text-slate-500 hover:bg-slate-900 hover:text-slate-400 hover:border-slate-700' 
                      : 'border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <Plus className="w-3 h-3" />
                  Adicionar Custo Customizado
                </button>
              </div>
            </section>

            <section id="sale-section">
              <h3 className={`text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                <span className={`w-4 h-px ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-300'}`}></span> 2. Taxas e Descontos
              </h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className={`text-xs font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Preço de Venda Desejado</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{inputs.currency === 'BRL' ? 'R$' : inputs.currency === 'USD' ? '$' : '€'}</span>
                    <input 
                      type="number" 
                      value={inputs.desiredPrice || ''}
                      onChange={(e) => handleInputChange('desiredPrice', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                      className={`w-full pl-10 pr-3 py-2 border rounded-md outline-none text-sm font-mono transition-all ${
                        theme === 'dark' 
                          ? 'bg-slate-900 border-slate-800 text-white focus:ring-emerald-500/30 focus:border-emerald-500' 
                          : 'bg-white border-slate-200 focus:ring-emerald-500 shadow-sm'
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className={`text-xs font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Taxa Plataforma (%)</label>
                    <input 
                      type="number" 
                      value={inputs.platformFeePercentage || ''}
                      onChange={(e) => handleInputChange('platformFeePercentage', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                      className={`w-full px-3 py-2 border rounded-md outline-none text-sm font-mono transition-all ${
                        theme === 'dark' 
                          ? 'bg-slate-900 border-slate-800 text-white focus:ring-emerald-500/30 focus:border-emerald-500' 
                          : 'bg-white border-slate-200 focus:ring-emerald-500 shadow-sm'
                      }`}
                      placeholder="%"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={`text-xs font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Cupom Médio (%)</label>
                    <input 
                      type="number" 
                      value={inputs.couponPercentage || ''}
                      onChange={(e) => handleInputChange('couponPercentage', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                      className={`w-full px-3 py-2 border rounded-md outline-none text-sm font-mono transition-all ${
                        theme === 'dark' 
                          ? 'bg-slate-900 border-slate-800 text-white focus:ring-emerald-500/30 focus:border-emerald-500' 
                          : 'bg-white border-slate-200 focus:ring-emerald-500 shadow-sm'
                      }`}
                      placeholder="%"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className={`text-xs font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Lucro Desejado (%)</label>
                    <Tooltip content="Informe a margem de lucro líquido que você deseja atingir. O sistema calculará o preço ideal para chegar nessa meta.">
                      <HelpCircle className="w-3 h-3 text-slate-400 cursor-help" />
                    </Tooltip>
                  </div>
                  <input 
                    type="number" 
                    value={inputs.desiredProfitPercentage || ''}
                    onChange={(e) => handleInputChange('desiredProfitPercentage', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-md outline-none text-sm font-mono transition-all ${
                      theme === 'dark' 
                        ? 'bg-slate-900 border-slate-800 text-white focus:ring-emerald-500/30 focus:border-emerald-500' 
                        : 'bg-white border-slate-200 focus:ring-emerald-500 shadow-sm'
                    }`}
                    placeholder="%"
                  />
                </div>
                <div className={`p-4 border rounded-xl transition-all ${
                  theme === 'dark' ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-emerald-50 border-emerald-100'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>Preço Sugerido (Meta {inputs.desiredProfitPercentage}%)</p>
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <p className={`text-xl font-mono font-bold ${theme === 'dark' ? 'text-emerald-300' : 'text-emerald-700'}`}>{formatCurrency(results.suggestedPrice, inputs.currency)}</p>
                  </div>
                  <p className={`text-[9px] mt-1 italic font-medium ${theme === 'dark' ? 'text-emerald-500/70' : 'text-emerald-600'}`}>Preço de venda bruto recomendado</p>
                </div>
              </div>
            </section>

            <section id="logistics-section">
              <div className="flex items-center gap-2 mb-4">
                <h3 className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                  <span className={`w-4 h-px ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-300'}`}></span> 3. Logística
                </h3>
                <Tooltip content="Informe se o frete é pago por você (vendedor) ou se o cliente arca com o custo diretamente.">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                </Tooltip>
              </div>
              <div className={`p-4 rounded-xl border transition-all ${
                theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
              } space-y-4`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Frete pago pelo vendedor?</span>
                  <div 
                    onClick={() => handleInputChange('shippingPaidBy', inputs.shippingPaidBy === 'seller' ? 'customer' : 'seller')}
                    className={`w-10 h-5 rounded-full flex items-center px-1 transition-colors cursor-pointer ${inputs.shippingPaidBy === 'seller' ? 'bg-emerald-500 justify-end' : 'bg-slate-200 justify-start'}`}
                  >
                    <div className="w-3 h-3 bg-white rounded-full shadow-sm"></div>
                  </div>
                </div>
                {inputs.shippingPaidBy === 'seller' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="relative"
                  >
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{inputs.currency === 'BRL' ? 'R$' : inputs.currency === 'USD' ? '$' : '€'}</span>
                    <input 
                      type="number" 
                      value={inputs.shippingCost || ''}
                      onChange={(e) => handleInputChange('shippingCost', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                      className={`w-full pl-10 pr-3 py-2 border rounded-md outline-none text-sm font-mono transition-all ${
                        theme === 'dark' 
                          ? 'bg-slate-900 border-slate-800 text-white focus:ring-emerald-500/30 focus:border-emerald-500' 
                          : 'bg-white border-slate-200 focus:ring-emerald-500 shadow-sm'
                      }`}
                      placeholder="0.00"
                    />
                  </motion.div>
                )}
              </div>
            </section>
            <section id="comparisons-section">
              <h3 className={`text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                <span className={`w-4 h-px ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-300'}`}></span> 4. Comparativo Marketplace
              </h3>
              <div className="space-y-4">
                <div className={`p-4 rounded-xl border transition-all ${
                  theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
                }`}>
                  <p className={`text-[10px] uppercase font-bold mb-3 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Variações de Taxas (%)</p>
                  <div className="grid grid-cols-2 gap-2">
                    {inputs.platformComparisons.map((p, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input 
                          type="number"
                          value={p}
                          onChange={(e) => {
                            const newComp = [...inputs.platformComparisons];
                            newComp[i] = parseFloat(e.target.value || '0');
                            handleInputChange('platformComparisons', newComp);
                          }}
                          className={`w-full px-2 py-1 text-xs font-mono border rounded outline-none transition-all ${
                            theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-300 focus:border-indigo-500/50' : 'bg-slate-50 border-slate-100 focus:border-indigo-400'
                          }`}
                        />
                        <button 
                          onClick={() => handleInputChange('platformComparisons', inputs.platformComparisons.filter((_, idx) => idx !== i))}
                          className="text-slate-300 hover:text-rose-500 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {inputs.platformComparisons.length < 6 && (
                      <button 
                        onClick={() => handleInputChange('platformComparisons', [...inputs.platformComparisons, 0])}
                        className={`px-2 py-1 text-[10px] uppercase font-bold border border-dashed rounded transition-all ${
                          theme === 'dark' ? 'border-indigo-900 text-indigo-500 hover:bg-indigo-950/20' : 'text-indigo-400 border-indigo-100 hover:bg-indigo-50'
                        }`}
                      >
                        + Taxa
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </aside>

          {/* Results Area - Right Side */}
          <main className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="stat-cards">
              <motion.div 
                layout
                animate={results.netProfit < 0 ? { 
                  borderColor: ['#fecaca', '#f87171', '#fecaca'],
                  backgroundColor: ['#ffffff', '#fff1f2', '#ffffff'],
                  scale: [1, 1.02, 1]
                } : {
                  borderColor: '#f1f5f9',
                  backgroundColor: '#ffffff',
                  scale: 1
                }}
                transition={results.netProfit < 0 ? { 
                  borderColor: { repeat: Infinity, duration: 1.5 },
                  backgroundColor: { repeat: Infinity, duration: 1.5 },
                  scale: { repeat: Infinity, duration: 1.5 }
                } : { 
                  duration: 0.3 
                }}
                className={`p-6 rounded-2xl border transition-all duration-500 shadow-sm relative`}
                style={{
                  borderColor: results.netProfit < 0 ? '#f87171' : (theme === 'dark' ? '#1e293b' : '#f1f5f9'),
                  backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff'
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Lucro Líquido</p>
                    {results.netProfit < 0 ? (
                      <motion.div
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                      </motion.div>
                    ) : (
                      <Tooltip content="O lucro real após todas as deduções. Ex: Sobra R$ 25,00 após vender por R$ 100,00 e gastar R$ 75,00.">
                        <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                      </Tooltip>
                    )}
                  </div>
                  {results.netProfit >= 0 ? <TrendingUp className="w-4 h-4 text-emerald-500" /> : <TrendingDown className="w-4 h-4 text-rose-500" />}
                </div>
                <h2 className={`text-3xl font-mono font-bold ${results.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {formatCurrency(results.netProfit, inputs.currency)}
                </h2>
                <p className="text-[10px] text-slate-400 mt-2">Por unidade vendida</p>
              </motion.div>

              <motion.div 
                layout
                animate={results.netProfit < 0 ? { 
                  borderColor: ['#fecaca', '#f87171', '#fecaca'],
                  backgroundColor: theme === 'dark' ? ['#0f172a', '#450a0a', '#0f172a'] : ['#ffffff', '#fff1f2', '#ffffff'],
                  scale: [1, 1.02, 1]
                } : {
                  borderColor: theme === 'dark' ? '#1e293b' : '#f1f5f9',
                  backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                  scale: 1
                }}
                transition={results.netProfit < 0 ? { 
                  borderColor: { repeat: Infinity, duration: 1.5 },
                  backgroundColor: { repeat: Infinity, duration: 1.5 },
                  scale: { repeat: Infinity, duration: 1.5 }
                } : { 
                  duration: 0.3 
                }}
                className={`p-6 rounded-2xl border transition-all duration-500 shadow-sm relative`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Margem Real</p>
                    {results.netProfit < 0 ? (
                      <motion.div
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                      </motion.div>
                    ) : (
                      <Tooltip content="Eficiência da venda. 25% significa que cada R$ 1,00 vendido gera R$ 0,25 de lucro útil.">
                        <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                      </Tooltip>
                    )}
                  </div>
                  <BarChart3 className="w-4 h-4 text-slate-400" />
                </div>
                <h2 className={`text-3xl font-mono font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  {results.marginPercentage.toFixed(1)}%
                </h2>
                <p className={`text-[10px] mt-2 font-bold ${results.marginPercentage > 25 ? 'text-emerald-500' : results.marginPercentage > 0 ? 'text-amber-500' : 'text-rose-500'}`}>
                   {results.marginPercentage > 25 ? 'Acima da meta (25%)' : results.marginPercentage > 10 ? 'Margem saudável' : 'Margem crítica'}
                </p>
              </motion.div>

              <motion.div 
                layout
                className={`p-6 rounded-2xl border shadow-sm transition-all duration-500 ${
                  theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">ROI</p>
                    <Tooltip content="O Retorno sobre Investimento. Ex: 100% significa que para cada R$ 1,00 investido, você recupera R$ 1,00 e ganha mais R$ 1,00 de lucro.">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                    </Tooltip>
                  </div>
                  <div className={`px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${
                    theme === 'dark' ? 'bg-indigo-900/30 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
                  }`}>Core Feature</div>
                </div>
                <h2 className={`text-3xl font-mono font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                  {results.roi.toFixed(1)}%
                </h2>
                <p className="text-[10px] text-slate-400 mt-2">Poder de multiplicação</p>
              </motion.div>

              <motion.div 
                layout
                className={`p-6 rounded-2xl border shadow-xl transition-all duration-500 ${
                  theme === 'dark' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-900 border-slate-800 text-white'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <p className={`text-xs font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-emerald-100' : 'text-slate-400'}`}>Break-even</p>
                  <Tooltip content="O preço mínimo para cobrir custos e ter lucro zero. Ex: Se gastou R$ 50,00 total, o Break-even será > R$ 50,00 para pagar taxas.">
                    <HelpCircle className={`w-4 h-4 opacity-50 cursor-help ${theme === 'dark' ? 'text-white' : 'text-slate-400'}`} />
                  </Tooltip>
                </div>
                <h2 className="text-3xl font-mono font-bold">
                  {formatCurrency(results.breakEvenPrice, inputs.currency)}
                </h2>
                <p className={`text-[10px] mt-2 ${theme === 'dark' ? 'text-emerald-100/70' : 'text-slate-500'}`}>Preço mínimo de segurança</p>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cost Pie Chart */}
              <div className={`p-6 rounded-2xl border shadow-sm flex flex-col transition-all duration-500 ${
                theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <PieChartIcon className="w-4 h-4 text-indigo-500" />
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Distribuição de Custos</h4>
                  </div>
                  <Tooltip content="Visualize onde seu dinheiro está sendo gasto. Quanto maior a fatia, maior o peso no seu lucro.">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                  </Tooltip>
                </div>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        formatter={(value: number) => formatCurrency(value, inputs.currency)}
                        contentStyle={{ 
                          fontSize: '10px', 
                          borderRadius: '8px', 
                          border: 'none', 
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                          backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                          color: theme === 'dark' ? '#f1f5f9' : '#0f172a'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
                  {chartData.map((d, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></div>
                      <span className={`text-[10px] font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{d.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Platform Comparison Side-by-Side */}
              <div className={`p-6 rounded-2xl border shadow-sm flex flex-col transition-all duration-500 ${
                theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-500" />
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Comparativo de Taxas</h4>
                  </div>
                  <Tooltip content="Veja como diferentes taxas de marketplace impactam seu lucro final. Útil para comparar Amazon vs Shopee vs Mercado Livre.">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                  </Tooltip>
                </div>
                <div className="space-y-3 flex-1 overflow-y-auto max-h-48 pr-2">
                  {results.comparisonResults?.sort((a, b) => a.platformPercentage - b.platformPercentage).map((c, i) => (
                    <div key={i} className={`p-3 rounded-xl flex items-center justify-between transition-colors ${
                      theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50'
                    }`}>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Taxa {c.platformPercentage}%</p>
                        <p className={`text-sm font-mono font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{formatCurrency(c.netProfit, inputs.currency)}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-xs font-bold ${c.marginPercentage > 20 ? 'text-emerald-500' : (theme === 'dark' ? 'text-slate-400' : 'text-slate-500')}`}>
                          {c.marginPercentage.toFixed(1)}% <span className="text-[8px] uppercase tracking-tighter">Margem</span>
                        </p>
                        {c.platformPercentage === inputs.platformFeePercentage && (
                          <span className={`${theme === 'dark' ? 'bg-indigo-900/50 text-indigo-400' : 'bg-indigo-100 text-indigo-600'} text-[8px] px-1 py-0.5 rounded uppercase font-bold tracking-widest`}>Atual</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`p-6 rounded-2xl border shadow-sm flex flex-col justify-center transition-all duration-500 ${
                theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
              }`}>
                 <div className="flex items-center gap-2 mb-4">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Composição de Preço</h4>
                    <Tooltip content="Como o valor bruto é reduzido. Ex: De R$ 100,00 para R$ 90,00 após 10% de desconto ou cupom aplicado.">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                    </Tooltip>
                 </div>
                 <div className="space-y-3">
                    <div className="flex justify-between text-sm italic">
                       <span className={theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}>Preço Desejado</span>
                       <span className={`font-mono font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-900'}`}>{formatCurrency(inputs.desiredPrice, inputs.currency)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                       <span className={theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}>Descontos (Cupom/Taxa)</span>
                       <span className="text-rose-500 font-mono">-{formatCurrency(results.totalDiscount, inputs.currency)}</span>
                    </div>
                    <div className={`flex justify-between text-sm font-bold pt-2 border-t ${theme === 'dark' ? 'border-slate-800' : 'border-slate-50'}`}>
                       <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-700'}>Preço Final Cliente</span>
                       <span className="text-emerald-600 font-mono">{formatCurrency(results.finalPrice, inputs.currency)}</span>
                    </div>
                 </div>
              </div>
              
              <div className={`p-6 rounded-2xl border shadow-sm flex flex-col justify-center transition-all duration-500 ${
                theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
              }`}>
                 <div className="flex items-center gap-2 mb-4">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Deduções e Custos</h4>
                    <Tooltip content="Soma de taxas e logística. Ex: Taxa Plataforma (R$ 15) + Frete (R$ 20) = R$ 35 em deduções sobre a venda.">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                    </Tooltip>
                 </div>
                 <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                       <span className={theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}>Base (Prod + Fixos)</span>
                       <span className={`font-mono ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{formatCurrency(inputs.productionCost + inputs.fixedCosts + (inputs.customCosts || []).reduce((acc, c) => acc + c.value, 0), inputs.currency)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                       <span className={theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}>Taxas Plataforma</span>
                       <span className="text-rose-500 font-mono">-{formatCurrency(results.platformFeeValue, inputs.currency)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                       <span className={theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}>Logística</span>
                       <span className="text-rose-500 font-mono">-{formatCurrency(results.shippingCostValue, inputs.currency)}</span>
                    </div>
                    <div className={`flex justify-between text-sm font-bold pt-2 border-t ${theme === 'dark' ? 'border-slate-800' : 'border-slate-50'}`}>
                       <span className={`uppercase ${theme === 'dark' ? 'text-slate-400' : 'text-slate-700'}`}>Custo Efetivo Total</span>
                       <span className={`font-mono ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>{formatCurrency(results.totalCost, inputs.currency)}</span>
                    </div>
                 </div>
              </div>
            </div>

            {/* Simulation View / Scenarios */}
            <section className={`rounded-2xl border overflow-hidden flex flex-col transition-all duration-500 ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 shadow-xl' : 'bg-white border-slate-100 shadow-sm'
            }`}>
              <div className="flex justify-between items-start p-6 pb-2">
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Simulação de Cenários</h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Comparativo de preços baseados no mercado</p>
                  </div>
                  <Tooltip content="Testar se vender mais barato por volume vale mais que vender caro com alta margem. Útil para promoções.">
                    <HelpCircle className="w-4 h-4 text-slate-300 cursor-help mb-5" />
                  </Tooltip>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2"><div className="w-2 h-2 bg-rose-400 rounded-full"></div><span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Prejuízo</span></div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 bg-emerald-400 rounded-full"></div><span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Lucro</span></div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <AnimatePresence mode="wait">
                      {isAddingScenario ? (
                        <motion.div 
                          key="input"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="flex items-center gap-2"
                        >
                          <input 
                            type="number"
                            autoFocus
                            value={newScenarioPrice}
                            onChange={(e) => setNewScenarioPrice(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') addCustomScenario();
                              if (e.key === 'Escape') setIsAddingScenario(false);
                            }}
                            placeholder="Preço..."
                            className={`w-24 px-2 py-1 text-xs border rounded outline-none font-mono transition-all ${
                              theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white focus:ring-1 focus:ring-indigo-500' : 'border-indigo-200 focus:ring-1 focus:ring-indigo-500'
                            }`}
                          />
                          <button 
                            onClick={addCustomScenario}
                            className="p-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button 
                            onClick={() => setIsAddingScenario(false)}
                            className={`p-1.5 rounded transition-colors ${
                              theme === 'dark' ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                            }`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </motion.div>
                      ) : (
                        <motion.button 
                          key="button"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => setIsAddingScenario(true)}
                          className={`flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest border rounded-lg transition-all ${
                            theme === 'dark' ? 'text-indigo-400 border-indigo-900 hover:bg-indigo-950/30' : 'text-indigo-600 border-indigo-100 hover:bg-indigo-50'
                          }`}
                        >
                          <Plus className="w-3 h-3" />
                          Novo Ponto
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              <div className="px-6 pb-6 overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`text-left border-b ${theme === 'dark' ? 'border-slate-800' : 'border-slate-50'}`}>
                      <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cenário</th>
                      <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Preço Venda</th>
                      <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Taxas + Frete</th>
                      <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lucro</th>
                      <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Margem</th>
                      <th className="pb-4 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-mono">
                    {scenarios.map((s, idx) => {
                      const isCustom = s.label.startsWith('Personalizado');
                      const isIdeal = s.label === 'Ideal (Meta)';
                      return (
                        <tr key={idx} className={`border-b transition-colors ${
                          theme === 'dark' ? 'border-slate-800' : 'border-slate-50'
                        } ${
                          isIdeal 
                            ? (theme === 'dark' ? 'bg-emerald-950/20' : 'bg-emerald-50/50') 
                            : (theme === 'dark' ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50/50')
                        }`}>
                          <td className={`py-4 pr-4 font-sans ${isIdeal ? (theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700') + ' font-bold' : 'text-slate-500 font-medium italic'}`}>
                             {s.label}
                             {isIdeal && <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded uppercase font-bold font-sans ${
                               theme === 'dark' ? 'bg-emerald-900 text-emerald-300' : 'bg-emerald-200 text-emerald-800'
                             }`}>Meta</span>}
                          </td>
                          <td className={`py-4 px-2 font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>{formatCurrency(s.price, inputs.currency)}</td>
                          <td className="py-4 px-2 text-slate-500">{formatCurrency(s.result.platformFeeValue + s.result.shippingCostValue, inputs.currency)}</td>
                          <td className={`py-4 px-2 font-bold ${s.result.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                            {formatCurrency(s.result.netProfit, inputs.currency)}
                          </td>
                          <td className={`py-4 pl-4 text-right font-bold ${s.result.marginPercentage >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                            {s.result.marginPercentage.toFixed(1)}%
                          </td>
                          <td className="py-4 pl-4">
                            {isCustom && (
                              <button 
                                onClick={() => removeCustomScenario(inputs.customScenarios.indexOf(s.price))}
                                className={`p-1 rounded transition-colors ${
                                  theme === 'dark' ? 'hover:bg-rose-900/40 text-rose-500' : 'hover:bg-rose-100 text-rose-400 hover:text-rose-600'
                                }`}
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Summary Bar */}
              <div className={`p-4 border-t flex justify-between items-center transition-all duration-500 ${
                theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-100'
              }`}>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">Dados sincronizados Local</span>
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  SESSÃO: {new Date().toLocaleDateString('pt-BR')}
                </div>
              </div>
            </section>
          </main>
        </div>

        {/* Footer info */}
        <footer className="text-center py-8 text-slate-400 text-xs flex flex-col gap-2">
           <p>© {new Date().getFullYear()} LucraSmart - O seu aliado no lucro real.</p>
           <div className="flex justify-center gap-4 uppercase tracking-widest font-bold">
              <span>Dados Processados Localmente</span>
              <span>•</span>
              <span>Lógica de Precificação 1.0</span>
           </div>
        </footer>
      </div>
    </div>
  );
}
