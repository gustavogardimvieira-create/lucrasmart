import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, BarChart3, ShieldCheck, Zap, TrendingUp, Calculator } from 'lucide-react';
import { formatCurrency } from '../utils/calculations';

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#f5f5f4] text-[#0a0a0a] selection:bg-indigo-100 font-sans overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-[#f5f5f4]/80 backdrop-blur-sm border-b border-black/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#0a0a0a] rounded flex items-center justify-center">
            <Calculator className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="font-bold tracking-tighter text-xl">LucraSmart<span className="text-emerald-500">.</span></span>
        </div>
        <button 
          onClick={onStart}
          className="px-5 py-2 bg-[#0a0a0a] text-white rounded-full text-sm font-medium hover:scale-105 transition-transform flex items-center gap-2 group"
        >
          Acessar Calculadora
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </nav>

      {/* Hero Section - Split Layout Pattern */}
      <main className="pt-24 min-h-screen flex flex-col lg:flex-row items-stretch">
        <div className="flex-1 px-6 lg:px-24 flex flex-col justify-center py-12 lg:py-0 border-r border-black/5">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] uppercase font-bold tracking-widest mb-6">
              <Zap className="w-3 h-3 fill-emerald-600" />
              Inteligência Financeira para Vendedores
            </div>
            <h1 className="text-5xl lg:text-7xl xl:text-8xl font-bold leading-[0.88] tracking-tighter mb-8">
              PRECIFIQUE <br />
              <span className="text-emerald-500">COM ALTA</span> <br />
              PRECISÃO.
            </h1>
            <p className="text-lg text-slate-500 max-w-md mb-10 leading-relaxed font-medium">
              Elimine o "achismo" da sua precificação. Calcule lucros reais, taxas de marketplace e ROI em segundos com visualização de dados profissional.
            </p>
            <div className="flex flex-wrap gap-4 mt-4">
              <button 
                onClick={onStart}
                className="px-8 py-4 bg-[#0a0a0a] text-white rounded-2xl text-lg font-bold hover:shadow-2xl hover:shadow-emerald-500/20 transition-all flex items-center gap-3 group"
              >
                Começar agora
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>

        <div className="flex-1 bg-[#0a0a0a] relative overflow-hidden flex items-center justify-center p-6 lg:p-12">
          {/* Abstract Floating Elements */}
          <div className="absolute top-1/4 -left-12 w-64 h-64 bg-emerald-500/20 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-1/4 -right-12 w-64 h-64 bg-indigo-500/20 blur-[120px] rounded-full animate-pulse delay-1000" />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: -2 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="w-full max-w-lg bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10"
          >
            <div className="space-y-6">
              <div className="flex justify-between items-end border-b border-white/10 pb-6">
                <div>
                  <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-1 italic">Simulation Preview</p>
                  <p className="text-white text-3xl font-mono font-bold tracking-tighter">R$ 1.540,80</p>
                  <p className="text-white/40 text-[10px] font-medium tracking-wide">LUCRO LÍQUIDO SIMULADO</p>
                </div>
                <div className="text-right">
                  <p className="text-white text-xl font-mono font-bold text-emerald-400">28.4%</p>
                  <p className="text-white/40 text-[10px] font-medium tracking-wide italic">Margem de Lucro</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-white/40 text-[10px] font-bold uppercase mb-2">Break-even</p>
                  <p className="text-white font-mono text-lg font-bold tracking-tighter">R$ 84,20</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-white/40 text-[10px] font-bold uppercase mb-2">ROI</p>
                  <p className="text-white font-mono text-lg font-bold tracking-tighter">142.0%</p>
                </div>
              </div>

              <div className="pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Distribuição de Custo</span>
                  <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Total: 71.6%</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden flex">
                  <div className="h-full bg-emerald-400" style={{ width: '40%' }} />
                  <div className="h-full bg-indigo-400" style={{ width: '20%' }} />
                  <div className="h-full bg-amber-400" style={{ width: '15%' }} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Rail Text Decoration */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden xl:block">
            <p className="rail-text text-white/20 font-bold tracking-[0.2em] uppercase text-[10px] [writing-mode:vertical-rl] rotate-180">
              SMART PRICING INFRASTRUCTURE • REALTIME ANALYTICS • PROFIT MAXIMIZATION
            </p>
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section className="py-24 px-6 lg:px-24 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <h2 className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.3em] mb-4">Functional Core</h2>
            <h3 className="text-4xl font-bold tracking-tighter">Tudo que você precisa <br /> para dominar seus números.</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: BarChart3, title: "Análise Multicanal", desc: "Compare taxas de diferentes marketplaces lado a lado para encontrar o melhor canal." },
              { icon: ShieldCheck, title: "Segurança de Margem", desc: "Alertas visuais automáticos quando sua operação entra em zona de prejuízo." },
              { icon: Zap, title: "Scalling ROI", desc: "Entenda o poder de multiplicação do seu capital em cada produto do catálogo." },
              { icon: TrendingUp, title: "Simulação de Stress", desc: "Descubra até onde você pode chegar com descontos e cupons sem quebrar." },
              { icon: Calculator, title: "Custos Granulares", desc: "Matéria-prima, energia, frete e embalagem. Nada fica de fora do cálculo." },
              { icon: ArrowRight, title: "Exportação Pro", desc: "Gere relatórios CSV profissionais e sanitizados para sua planilha principal." }
            ].map((f, i) => (
              <div key={i} className="group p-8 rounded-3xl border border-slate-100 hover:border-emerald-200 transition-all hover:bg-emerald-50/30">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-100 group-hover:scale-110 transition-all text-slate-400 group-hover:text-emerald-600">
                  <f.icon className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold mb-2 tracking-tight">{f.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 lg:px-24 border-t border-black/5 bg-[#f5f5f4]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#0a0a0a] rounded flex items-center justify-center">
              <Calculator className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span className="font-bold tracking-tighter text-sm uppercase">LucraSmart<span className="text-emerald-500">.</span></span>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            © 2024 LucraSmart • Made for high-performance sellers
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-black transition-colors">Privacy</a>
            <a href="#" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-black transition-colors">Terms</a>
          </div>
        </div>
      </footer>

      {/* Visual Decorations - Hardware style */}
      <div className="fixed bottom-6 left-6 z-50 pointer-events-none hidden md:block">
        <div className="bg-[#0a0a0a] text-white p-4 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest leading-none mb-1">Status</span>
            <span className="text-[10px] font-mono tracking-tighter leading-none">SYSTEM_READY</span>
          </div>
          <div className="w-px h-6 bg-white/20" />
          <div className="flex flex-col">
            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Ver</span>
            <span className="text-[10px] font-mono tracking-tighter leading-none">v1.2.4</span>
          </div>
        </div>
      </div>
    </div>
  );
}
