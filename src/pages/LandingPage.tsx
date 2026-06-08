import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BrainCircuit, 
  Target, 
  Sparkles, 
  Check, 
  ShieldCheck, 
  Activity, 
  ChevronRight,
  Calculator,
  TrendingUp,
  BarChart3,
  BookOpen
} from 'lucide-react';
import TradoxLogo from '../components/TradoxLogo';
import { usePlanGateModal } from '../components/PlanGate';
import { ContainerScroll } from '../components/ui/ContainerScrollAnimation';
import DisplayCards from '../components/ui/DisplayCards';

const LandingPage: React.FC = () => {
  const { openUpgradeModal } = usePlanGateModal();

  // Win-Rate Simulator State
  const [winRate, setWinRate] = useState<number>(55);
  const [avgWin, setAvgWin] = useState<number>(300);
  const [avgLoss, setAvgLoss] = useState<number>(150);

  // Expectancy Calculation
  const expectancy = (winRate / 100) * avgWin - ((100 - winRate) / 100) * avgLoss;
  const projectedReturn = expectancy * 100;
  const isExpectancyPositive = expectancy > 0;

  const trackingCards = [
    {
      icon: <Target className="w-4 h-4 text-accent" />,
      title: "Execution Quality Grading",
      description: "Log entries, exit targets, and position sizes. Tradox evaluates execution based on discipline, grading each trade (A-D) so you know when you are trading with your edge or gambling.",
      date: "Discipline Diagnostics",
      iconClassName: "text-accent",
      titleClassName: "text-textPrimary",
      className:
        "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:rounded-xl before:h-[100%] before:content-[''] before:bg-bgBase/40 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      icon: <BrainCircuit className="w-4 h-4 text-accent animate-pulse" />,
      title: "Emotional Analytics",
      description: "Revenge trading, FOMO, and anxiety destroy accounts. Associate emotional states (Focused, Confident, Anxious, Greedy, Patient) to identify psychological patterns that hurt profit.",
      date: "Mindset Diagnostics",
      iconClassName: "text-accent",
      titleClassName: "text-textPrimary",
      className:
        "[grid-area:stack] translate-x-12 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:rounded-xl before:h-[100%] before:content-[''] before:bg-bgBase/40 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      icon: <Activity className="w-4 h-4 text-accent" />,
      title: "Strategy Vault Playbooks",
      description: "Save setups with rules, timeframe settings, and target Risk-Reward parameters. Backtest setups, filter trades by strategy, and verify which playbooks earn money over time.",
      date: "Playbook Vault",
      iconClassName: "text-accent",
      titleClassName: "text-textPrimary",
      className:
        "[grid-area:stack] translate-x-24 translate-y-20 hover:translate-y-10",
    },
  ];

  const handleLaunchApp = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-bgBase text-textPrimary font-dmsans selection:bg-accentDim selection:text-accent relative">
      {/* Background ambient glow circles */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-accent/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[45vw] h-[45vw] bg-accent/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-[40vw] h-[40vw] bg-accent/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-40" />

      {/* STICKY HEADER */}
      <header className="sticky top-0 z-50 bg-bgBase/80 backdrop-blur-md border-b border-customBorder px-4 sm:px-8 py-3.5 flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <TradoxLogo size={28} />
          <span className="font-syne text-[16px] font-extrabold text-accent tracking-[0.2em] uppercase mt-0.5">
            Tradox
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-[12px] font-syne uppercase tracking-wider text-textSecondary font-semibold">
          <a href="#features" className="hover:text-textPrimary transition-colors">Features</a>
          <a href="#simulator" className="hover:text-textPrimary transition-colors">Edge Simulator</a>
          <a href="#pricing" className="hover:text-textPrimary transition-colors">Pricing</a>
        </nav>
        <button 
          onClick={handleLaunchApp}
          className="h-9 px-5 border border-accent/30 hover:border-accent bg-accentDim text-accent font-syne text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          Enter Journal
        </button>
      </header>

      {/* HERO + 3D SCROLL ANIMATION */}
      <div className="flex flex-col relative">
        <ContainerScroll
          titleComponent={
            <div className="flex flex-col items-center gap-5 px-4">
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-accentDim border border-accent/20 text-[10px] font-syne uppercase font-bold tracking-wider text-accent"
              >
                <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse" />
                The Trader's Psychological edge
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="font-syne text-[32px] sm:text-[48px] md:text-[56px] font-black uppercase text-textPrimary leading-[1.05] tracking-tight max-w-[850px] drop-shadow-xl"
              >
                Spreadsheets lie.<br/>
                Your emotions cost capital.<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-orange-400">Log with precision.</span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="font-light text-[14px] sm:text-[16px] text-textSecondary leading-relaxed max-w-[550px]"
              >
                Tradox is a high-fidelity trading ledger, emotional diagnostic tool, and playbook vault built for serious traders who want to scale their setups with mathematical expectancy.
              </motion.p>
            </div>
          }
        >
          {/* Inner App Dashboard Mockup */}
          <div className="w-full h-full bg-bgBase p-3 md:p-6 flex flex-col gap-4 md:gap-5 overflow-hidden">
            
            {/* Simulated App Navbar */}
            <div className="flex items-center justify-between border-b border-customBorder/30 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-redPnl/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-greenPnl/70" />
                <span className="font-mono text-[10px] text-textMuted ml-2">TRADOX_LEDGER_V1.EXE</span>
              </div>
              <div className="flex gap-2 items-center">
                <div className="h-5 px-2.5 bg-accentDim border border-accent/20 rounded text-[8px] font-syne text-accent uppercase font-bold tracking-wider flex items-center">Pro</div>
                <div className="w-6 h-6 rounded-full bg-accent/20 border border-accent/30" />
              </div>
            </div>

            {/* Quick Metrics Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <div className="flex flex-col gap-1 bg-bgSurface/50 border border-customBorder/30 rounded-xl p-3">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-3 h-3 text-greenPnl" />
                  <span className="font-syne text-[8px] uppercase tracking-wider text-textSecondary">Net P&L</span>
                </div>
                <span className="font-mono text-[16px] md:text-[20px] font-bold text-greenPnl leading-tight">+$2,450</span>
              </div>
              <div className="flex flex-col gap-1 bg-bgSurface/50 border border-customBorder/30 rounded-xl p-3">
                <div className="flex items-center gap-1.5">
                  <Target className="w-3 h-3 text-accent" />
                  <span className="font-syne text-[8px] uppercase tracking-wider text-textSecondary">Win Rate</span>
                </div>
                <span className="font-mono text-[16px] md:text-[20px] font-bold text-accent leading-tight">72.4%</span>
              </div>
              <div className="flex flex-col gap-1 bg-bgSurface/50 border border-customBorder/30 rounded-xl p-3">
                <div className="flex items-center gap-1.5">
                  <BarChart3 className="w-3 h-3 text-textSecondary" />
                  <span className="font-syne text-[8px] uppercase tracking-wider text-textSecondary">Executions</span>
                </div>
                <span className="font-mono text-[16px] md:text-[20px] font-bold text-textPrimary leading-tight">142</span>
              </div>
              <div className="flex flex-col gap-1 bg-bgSurface/50 border border-customBorder/30 rounded-xl p-3">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-3 h-3 text-accent" />
                  <span className="font-syne text-[8px] uppercase tracking-wider text-textSecondary">Playbooks</span>
                </div>
                <span className="font-mono text-[16px] md:text-[20px] font-bold text-textPrimary leading-tight">5 Active</span>
              </div>
            </div>

            {/* Equity Curve Chart */}
            <div className="relative w-full flex-1 min-h-[120px] bg-bgSurface/30 border border-customBorder/30 rounded-xl overflow-hidden flex flex-col justify-end p-2">
              <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="scrollGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="#FF6B00" stopOpacity="0.0"/>
                  </linearGradient>
                </defs>
                <path d="M 0 95 L 40 85 L 80 88 L 120 70 L 160 78 L 200 48 L 240 55 L 280 20 L 320 28 L 360 8 L 400 3 L 400 100 L 0 100 Z" fill="url(#scrollGlow)" />
                <path d="M 0 95 L 40 85 L 80 88 L 120 70 L 160 78 L 200 48 L 240 55 L 280 20 L 320 28 L 360 8 L 400 3" fill="none" stroke="#FF6B00" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="200" cy="48" r="4" fill="#0D0D0D" stroke="#FF6B00" strokeWidth="2" />
                <circle cx="280" cy="20" r="4" fill="#0D0D0D" stroke="#FF6B00" strokeWidth="2" />
                <circle cx="400" cy="3" r="4" fill="#FF6B00" />
              </svg>
              <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-bgBase/70 border border-customBorder/60 text-[9px] font-mono text-textSecondary uppercase tracking-widest">
                Account Equity Curve
              </div>
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-greenPnl/10 border border-greenPnl/25 text-[9px] font-mono text-greenPnl uppercase tracking-widest">
                ↑ +18.7% MTD
              </div>
            </div>

            {/* Trade Log Table Mini */}
            <div className="w-full bg-bgSurface/30 border border-customBorder/30 rounded-xl overflow-hidden">
              <div className="grid grid-cols-5 gap-2 text-[8px] font-syne uppercase tracking-wider text-textMuted p-2.5 border-b border-customBorder/20">
                <span>Pair</span>
                <span>Side</span>
                <span>P&L</span>
                <span>Grade</span>
                <span>Emotion</span>
              </div>
              <div className="grid grid-cols-5 gap-2 text-[10px] font-mono text-textSecondary p-2.5 border-b border-customBorder/10">
                <span className="text-textPrimary font-semibold">EUR/USD</span>
                <span className="text-greenPnl">Long</span>
                <span className="text-greenPnl font-semibold">+$320</span>
                <span className="text-accent font-bold">A</span>
                <span>Focused</span>
              </div>
              <div className="grid grid-cols-5 gap-2 text-[10px] font-mono text-textSecondary p-2.5 border-b border-customBorder/10">
                <span className="text-textPrimary font-semibold">GBP/JPY</span>
                <span className="text-redPnl">Short</span>
                <span className="text-redPnl font-semibold">-$85</span>
                <span className="text-yellow-500 font-bold">B</span>
                <span>Anxious</span>
              </div>
              <div className="grid grid-cols-5 gap-2 text-[10px] font-mono text-textSecondary p-2.5">
                <span className="text-textPrimary font-semibold">BTC/USD</span>
                <span className="text-greenPnl">Long</span>
                <span className="text-greenPnl font-semibold">+$540</span>
                <span className="text-accent font-bold">A+</span>
                <span>Confident</span>
              </div>
            </div>
          </div>
        </ContainerScroll>
      </div>

      {/* CORE FEATURES DISCUSSION SECTION */}
      <section id="features" className="py-20 px-4 max-w-5xl mx-auto border-t border-customBorder select-none">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 lg:gap-12 items-center">
          
          {/* Left Column: Card Stack (5 cols) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-start order-last lg:order-first">
            <div className="pt-20 pb-12 lg:py-6 w-full flex justify-center lg:justify-start">
              <DisplayCards cards={trackingCards} />
            </div>
          </div>

          {/* Right Column: Headers & Info (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-left order-first lg:order-last">
            <div className="flex flex-col gap-2">
              <span className="text-accent font-mono text-[10px] uppercase tracking-[0.2em] font-bold">
                Systematic Diagnostics
              </span>
              <h2 className="font-syne text-[26px] sm:text-[32px] font-black uppercase text-textPrimary leading-tight m-0">
                SYSTEMATIC METRIC TRACKING
              </h2>
              <p className="font-dmsans text-[13.5px] text-textSecondary font-light leading-relaxed max-w-[500px]">
                Designed to address performance anomalies, execution quality, and behavioral leaks. Stop guessing what works and start measuring your edge with mathematical precision.
              </p>
            </div>

            {/* Feature Bullet Points */}
            <div className="flex flex-col gap-5 mt-2">
              <div className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-syne text-[12px] font-bold uppercase tracking-wider text-textPrimary">
                    Grade Every Execution
                  </span>
                  <span className="font-dmsans text-[11.5px] text-textSecondary leading-relaxed">
                    Evaluate entry quality, stop placement, and exit targets. Automatically grade trades A-D to differentiate disciplined wins from lucky gambles.
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-syne text-[12px] font-bold uppercase tracking-wider text-textPrimary">
                    Isolate Psychological Leaks
                  </span>
                  <span className="font-dmsans text-[11.5px] text-textSecondary leading-relaxed">
                    Track emotional states like FOMO, anxiety, or revenge trading. Direct correlation charts show you exactly how much capital your emotions are costing you.
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-syne text-[12px] font-bold uppercase tracking-wider text-textPrimary">
                    Establish Playbook Expectancy
                  </span>
                  <span className="font-dmsans text-[11.5px] text-textSecondary leading-relaxed">
                    Document strategy vault playbooks. Backtest setups, filter reports by setup name, and verify which systems generate positive expectancy.
                  </span>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </section>

      {/* DYNAMIC METRICS SIMULATOR WIDGET */}
      <section id="simulator" className="py-20 px-4 bg-bgSurface/40 border-t border-b border-customBorder select-none">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Simulator Content Left (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-accentDim border border-accent/20 text-[9px] font-syne uppercase font-bold tracking-wider text-accent w-fit">
              <Calculator className="w-3 h-3" /> Mathematical Expectancy
            </div>
            <h2 className="font-syne text-[22px] sm:text-[28px] font-black uppercase text-textPrimary leading-tight">
              Test Your Expected Edge Expectancy
            </h2>
            <p className="font-light text-[12.5px] text-textSecondary leading-relaxed">
              Expected value per trade determines account growth. Adjust your average metrics below. Even with a low win rate, a strong risk-reward ratio generates highly profitable expectancy.
            </p>
          </div>

          {/* Simulator Widget Right (7 cols) */}
          <div className="lg:col-span-7 bg-bgSurface border border-customBorder/70 rounded-3xl p-6 flex flex-col gap-6 shadow-xl relative">
            
            {/* Live Expectancy Output Panel */}
            <div className={`p-4 rounded-2xl flex items-center justify-between transition-colors ${
              isExpectancyPositive ? 'bg-greenPnl/5 border border-greenPnl/25' : 'bg-redPnl/5 border border-redPnl/25'
            }`}>
              <div className="flex flex-col gap-0.5">
                <span className="font-syne text-[9px] uppercase tracking-wider text-textSecondary">Expectancy Per Trade</span>
                <span className={`font-mono text-[20px] font-bold ${
                  isExpectancyPositive ? 'text-greenPnl' : 'text-redPnl'
                }`}>
                  {isExpectancyPositive ? '+' : ''}${expectancy.toFixed(2)}
                </span>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <span className="font-syne text-[9px] uppercase tracking-wider text-textSecondary">100-Trade Return</span>
                <span className={`font-mono text-[20px] font-bold ${
                  isExpectancyPositive ? 'text-greenPnl' : 'text-redPnl'
                }`}>
                  {isExpectancyPositive ? '+' : ''}${projectedReturn.toFixed(0)}
                </span>
              </div>
            </div>

            {/* Inputs & Sliders */}
            <div className="flex flex-col gap-5 text-[11px] font-syne uppercase tracking-wider text-textSecondary font-semibold">
              {/* Win Rate Slider */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between font-mono text-[11px]">
                  <span>Win Rate %</span>
                  <span className="text-accent font-bold font-sans">{winRate}%</span>
                </div>
                <input 
                  type="range" 
                  min="20" 
                  max="90" 
                  value={winRate} 
                  onChange={(e) => setWinRate(Number(e.target.value))}
                  className="w-full accent-accent h-1 bg-bgElevated rounded-lg appearance-none cursor-pointer outline-none"
                />
              </div>

              {/* Avg Win Size */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between font-mono text-[11px]">
                  <span>Average Win ($)</span>
                  <span className="text-textPrimary font-sans">${avgWin}</span>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="2000" 
                  step="25"
                  value={avgWin} 
                  onChange={(e) => setAvgWin(Number(e.target.value))}
                  className="w-full accent-accent h-1 bg-bgElevated rounded-lg appearance-none cursor-pointer outline-none"
                />
              </div>

              {/* Avg Loss Size */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between font-mono text-[11px]">
                  <span>Average Loss ($)</span>
                  <span className="text-textPrimary font-sans">${avgLoss}</span>
                </div>
                <input 
                  type="range" 
                  min="25" 
                  max="1000" 
                  step="25"
                  value={avgLoss} 
                  onChange={(e) => setAvgLoss(Number(e.target.value))}
                  className="w-full accent-accent h-1 bg-bgElevated rounded-lg appearance-none cursor-pointer outline-none"
                />
              </div>
            </div>

            {/* Expectancy Advice */}
            <div className="text-[11px] text-textMuted font-dmsans flex items-center gap-1.5 border-t border-customBorder/30 pt-4">
              <span className="text-accent font-bold">ℹ️</span>
              {isExpectancyPositive 
                ? 'Your mathematical expectancy is positive. Stick to this risk plan in your playbook.' 
                : 'Your expectancy is negative. Improve your risk-to-reward ratio (larger wins) or refine entry rules.'}
            </div>

          </div>
        </div>
      </section>

      {/* PRICING & UPGRADE PLANS (Integrated with Whop) */}
      <section id="pricing" className="py-20 px-4 max-w-5xl mx-auto select-none">
        <div className="flex flex-col items-center text-center gap-3 mb-16">
          <h2 className="font-syne text-[20px] font-bold text-textPrimary uppercase tracking-[0.15em] m-0">
            PRICING & UPGRADES
          </h2>
          <p className="font-dmsans text-[13px] text-textSecondary font-light max-w-[420px]">
            Scale your journaling boundaries. Upgrade or purchase lifetime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* Free Card */}
          <div className="flex flex-col justify-between bg-bgSurface p-6 rounded-3xl border border-customBorder hover:border-textSecondary/25 transition-all duration-300">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-0.5">
                <h3 className="font-syne text-[15px] font-extrabold uppercase tracking-wider text-textPrimary">Free Journal</h3>
                <span className="text-[11px] text-textSecondary">Essential tracking features.</span>
              </div>
              <div className="flex items-baseline gap-1 border-b border-customBorder/30 pb-4">
                <span className="font-syne text-[28px] font-black text-textPrimary">$0</span>
                <span className="text-[10px] text-textSecondary font-light uppercase tracking-wider">/ Free</span>
              </div>
              <ul className="flex flex-col gap-2.5 text-[11px] text-textSecondary mt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span>Max 10 logged executions</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span>7-day history ledger view</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span>1 Strategy vault playbook</span>
                </li>
                <li className="flex items-center gap-2 text-textMuted line-through">
                  <span>Export to PDF or Excel CSV</span>
                </li>
              </ul>
            </div>
            <button 
              onClick={handleLaunchApp}
              className="w-full h-10 mt-8 bg-bgElevated border border-customBorder text-textSecondary rounded-xl font-syne text-[10px] uppercase tracking-wider font-bold hover:text-textPrimary transition-all cursor-pointer"
            >
              Get Free Access
            </button>
          </div>

          {/* Pro Monthly Card */}
          <div className="flex flex-col justify-between bg-bgSurface p-6 rounded-3xl border border-accent shadow-[0_0_24px_rgba(255,107,0,0.08)] ring-1 ring-accent/25 relative">
            <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-accent text-bgBase text-[7.5px] font-syne font-bold uppercase tracking-wider">
              RECOMMENDED
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-0.5">
                <h3 className="font-syne text-[15px] font-extrabold uppercase tracking-wider text-textPrimary">Pro Subscription</h3>
                <span className="text-[11px] text-textSecondary font-light">Complete diagnostic suite.</span>
              </div>
              <div className="flex items-baseline gap-1 border-b border-customBorder/30 pb-4">
                <span className="font-syne text-[28px] font-black text-textPrimary">$9.99</span>
                <span className="text-[10px] text-textSecondary font-light uppercase tracking-wider">/ monthly</span>
              </div>
              <ul className="flex flex-col gap-2.5 text-[11px] text-textSecondary mt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span className="text-textPrimary font-medium">Unlimited executions logged</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span className="text-textPrimary font-medium">Full trade history (All-Time)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span className="text-textPrimary font-medium">Unlimited Strategy playbooks</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span className="text-textPrimary font-medium">Premium PDF & CSV exports</span>
                </li>
              </ul>
            </div>
            <button 
              onClick={() => openUpgradeModal('plan_ADVvcySYlxcIR')}
              className="w-full h-10 mt-8 bg-accent hover:brightness-110 text-bgBase rounded-xl font-syne text-[10px] uppercase tracking-wider font-extrabold transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
            >
              Subscribe Monthly
              <ChevronRight className="w-3 h-3 stroke-[2.5]" />
            </button>
          </div>

          {/* Lifetime Card */}
          <div className="flex flex-col justify-between bg-bgSurface p-6 rounded-3xl border border-customBorder hover:border-textSecondary/25 transition-all duration-300">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-0.5">
                <h3 className="font-syne text-[15px] font-extrabold uppercase tracking-wider text-textPrimary">Lifetime Access</h3>
                <span className="text-[11px] text-textSecondary font-light">Pay once, own forever.</span>
              </div>
              <div className="flex items-baseline gap-1 border-b border-customBorder/30 pb-4">
                <span className="font-syne text-[28px] font-black text-textPrimary">$79</span>
                <span className="text-[10px] text-textSecondary font-light uppercase tracking-wider">/ one-time</span>
              </div>
              <ul className="flex flex-col gap-2.5 text-[11px] text-textSecondary mt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span>Unlimited executions & vault playbooks</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span>PDF + CSV spreadsheet exports</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span className="text-textPrimary font-medium">Never pay again (No subscriptions)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span>Early access to all future modules</span>
                </li>
              </ul>
            </div>
            <button 
              onClick={() => openUpgradeModal('plan_AOaJ2eJfVa30Z')}
              className="w-full h-10 mt-8 bg-transparent border border-accent/40 hover:bg-accentDim text-accent rounded-xl font-syne text-[10px] uppercase tracking-wider font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              Get Lifetime access
              <ShieldCheck className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-customBorder py-12 px-4 sm:px-8 max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-[11px] text-textSecondary select-none">
        <div className="flex items-center gap-2">
          <TradoxLogo size={20} />
          <span className="font-syne font-extrabold text-accent uppercase tracking-widest">Tradox</span>
        </div>
        <div className="flex items-center gap-8 font-syne uppercase tracking-wider font-semibold">
          <a href="/terms-of-service" className="hover:text-textPrimary">Terms</a>
          <a href="/privacy-policy" className="hover:text-textPrimary">Privacy</a>
          <span>© {new Date().getFullYear()} Tradox. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
