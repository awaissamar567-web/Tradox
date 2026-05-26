import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  formatCurrency, 
  formatDateOnly, 
  calculateStats 
} from '../utils/helpers';
import { ClipboardList, Trash2, RefreshCw } from 'lucide-react';
import { PlanGate, usePlanGateModal } from '../components/PlanGate';

const EMOTION_EMOJIS: { [key: string]: string } = {
  Focused: '🎯',
  Confident: '🦁',
  Anxious: '😰',
  FOMO: '🚀',
  Revenge: '😡',
  Calm: '🧘',
  Tired: '🥱',
  Greedy: '🤑',
  Patient: '🐢',
  Neutral: '😐',
};

const calculateTradeGrade = (t: any) => {
  const followed = t.followedStrategy ?? true;
  const isWin = t.outcome === 'Win';
  const isLoss = t.outcome === 'Loss';
  const mindset = t.mindset ? t.mindset.toLowerCase() : 'neutral';
  const isPositiveMindset = ['happy', 'calm', 'disciplined', 'focused', 'confident', 'patient'].includes(mindset);
  
  if (isWin && followed && isPositiveMindset) return 'A';
  if (isWin && !isPositiveMindset) return 'B';
  if (isLoss && followed) return 'C';
  if (isLoss && !followed) return 'D';
  return 'B'; // default / Breakeven
};

const DailyLog: React.FC = () => {
  const { trades, strategies, addTrade, deleteTrade } = useData();
  const { userPlan } = useAuth();
  const { showToast } = useToast();
  const { openUpgradeModal } = usePlanGateModal();

  // Form State
  const [symbol, setSymbol] = useState('');
  const [direction, setDirection] = useState<'Long' | 'Short'>('Long');
  const [entryPrice, setEntryPrice] = useState('');
  const [exitPrice, setExitPrice] = useState('');
  const [positionSize, setPositionSize] = useState('');
  const [pnl, setPnl] = useState('');
  const [strategyName, setStrategyName] = useState('None');
  const [outcome, setOutcome] = useState<'Win' | 'Loss' | 'BE'>('Win');
  const [mindset, setMindset] = useState('Neutral');
  const [followedStrategy, setFollowedStrategy] = useState(true);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Filter today's trades
  const todayStr = formatDateOnly(new Date());
  const todaysTrades = trades.filter((t) => formatDateOnly(t.timestamp) === todayStr);
  const todayStats = calculateStats(todaysTrades);

  // Calculate win streak (consecutive days with positive net P&L)
  const calculateWinStreak = () => {
    const dailyPnlMap: { [dateStr: string]: number } = {};
    trades.forEach((t) => {
      const dateStr = formatDateOnly(t.timestamp);
      dailyPnlMap[dateStr] = (dailyPnlMap[dateStr] || 0) + Number(t.pnl || 0);
    });

    const sortedDates = Object.keys(dailyPnlMap).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 0;
    for (let i = 0; i < sortedDates.length; i++) {
      const dateStr = sortedDates[i];
      const pnlVal = dailyPnlMap[dateStr];
      if (pnlVal > 0) {
        streak++;
      } else if (pnlVal < 0) {
        break;
      }
    }
    return streak;
  };

  const currentWinStreak = calculateWinStreak();

  // Whop plan warnings
  const totalLoggedTrades = trades.length;
  const isApproachingLimit = userPlan === 'free' && totalLoggedTrades >= 8 && totalLoggedTrades < 10;
  const isLimitExceeded = userPlan === 'free' && totalLoggedTrades >= 10;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!symbol.trim() || !entryPrice || !exitPrice || !positionSize || !pnl) {
      showToast('Please fill in all core trading values.', 'error');
      return;
    }

    if (userPlan === 'free' && trades.length >= 10) {
      openUpgradeModal();
      return;
    }

    setSubmitting(true);
    try {
      const newTrade = {
        symbol: symbol.toUpperCase().trim(),
        direction,
        entryPrice: Number(entryPrice),
        exitPrice: Number(exitPrice),
        positionSize: Number(positionSize),
        pnl: Number(pnl),
        strategy: strategyName,
        outcome,
        mindset,
        notes: notes.trim(),
        followedStrategy,
        timestamp: new Date()
      };

      await addTrade(newTrade);

      // Trigger Confetti if the day closes positive (net daily P&L > 0)
      const futureDailyPnl = todaysTrades.reduce((sum, t) => sum + Number(t.pnl || 0), 0) + Number(pnl);
      if (futureDailyPnl > 0) {
        import('canvas-confetti').then((module) => {
          const confetti = module.default;
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 }
          });
        });
      }

      showToast('Trade successfully logged to database.', 'success');
      
      // Reset form fields
      setSymbol('');
      setEntryPrice('');
      setExitPrice('');
      setPositionSize('');
      setPnl('');
      setNotes('');
      setMindset('Neutral');
      setFollowedStrategy(true);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to submit trade.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDelete = async (id: string) => {
    if (confirm('Delete this trade from today\'s log?')) {
      try {
        await deleteTrade(id);
        showToast('Trade deleted.', 'info');
      } catch (err) {
        showToast('Failed to delete trade.', 'error');
      }
    }
  };

  // Helper auto-outcome calculator when exits/entries change
  const autoCalculatePnl = (entry: number, exit: number, size: number, dir: 'Long' | 'Short') => {
    if (!entry || !exit || !size) return;
    const computed = dir === 'Long' ? (exit - entry) * size : (entry - exit) * size;
    setPnl(String(Math.round(computed * 100) / 100));
    if (computed > 0) {
      setOutcome('Win');
    } else if (computed < 0) {
      setOutcome('Loss');
    } else {
      setOutcome('BE');
    }
  };

  const renderGradeBadge = (t: any) => {
    const grade = calculateTradeGrade(t);
    let gradeBg = '';
    let gradeText = '';
    let gradeBorder = '';

    switch (grade) {
      case 'A':
        gradeBg = 'bg-green-500/10';
        gradeText = 'text-greenPnl';
        gradeBorder = 'border-green-500/25';
        break;
      case 'B':
        gradeBg = 'bg-yellow-500/10';
        gradeText = 'text-yellow-500';
        gradeBorder = 'border-yellow-500/25';
        break;
      case 'C':
        gradeBg = 'bg-orange-500/10';
        gradeText = 'text-orange-500';
        gradeBorder = 'border-orange-500/25';
        break;
      case 'D':
        gradeBg = 'bg-red-500/10';
        gradeText = 'text-redPnl';
        gradeBorder = 'border-red-500/25';
        break;
      default:
        gradeBg = 'bg-bgElevated';
        gradeText = 'text-textSecondary';
        gradeBorder = 'border-customBorder';
    }

    return (
      <span className={`inline-flex items-center justify-center font-mono font-bold text-[10px] w-5 h-5 rounded-full border ${gradeBg} ${gradeText} ${gradeBorder} shrink-0`} title={`Grade ${grade}`}>
        {grade}
      </span>
    );
  };

  return (
    <div className="page-transition flex flex-col gap-8 select-none">
      
      {/* Page Heading */}
      <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-syne text-[20px] font-bold text-textPrimary uppercase tracking-[0.15em] m-0">
            DAILY JOURNAL
          </h1>
          <p className="font-dmsans text-[13px] text-textSecondary font-light">
            Logged executions for today, {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}.
          </p>
        </div>

        {/* Header Badges */}
        <div className="flex items-center gap-3">
          {/* Win Streak Counter */}
          <div className="flex items-center gap-2 bg-accentDim/30 border border-accent/20 px-3.5 py-1.5 rounded-2xl shrink-0">
            <span className="text-[12px] font-syne uppercase tracking-wider text-textSecondary font-semibold">Streak:</span>
            <span className="font-mono text-[14px] font-bold text-accent">🔥 {currentWinStreak} Days</span>
          </div>

          {/* Whop limit count */}
          {userPlan === 'free' && (
            <div className="flex items-center gap-2 bg-bgSurface border border-customBorder px-3.5 py-1.5 rounded-2xl shrink-0">
              <span className="text-[11px] font-syne uppercase text-textSecondary tracking-wider font-semibold">Limit:</span>
              <span className="font-mono text-[12px] font-bold text-accent">{trades.length} / 10 Used</span>
            </div>
          )}
        </div>
      </header>

      {/* Free Plan Approaching warning banner */}
      {isApproachingLimit && (
        <div className="bg-orange-500/10 border border-orange-500/30 text-orange-500 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[12px] font-dmsans select-none animate-pulse-subtle">
          <div className="flex flex-col gap-0.5">
            <span className="font-syne font-bold uppercase tracking-wider">Plan Limit Approaching ({totalLoggedTrades}/10 Trades)</span>
            <span className="font-light">You are reaching the capacity of the Free tier. Upgrade to Pro to record unlimited playbooks.</span>
          </div>
          <button
            onClick={openUpgradeModal}
            className="h-8 px-4 bg-orange-500 hover:brightness-110 text-bgBase font-syne text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all font-semibold"
          >
            Upgrade to Pro
          </button>
        </div>
      )}

      {/* STATS BANNER */}
      <section className="relative pt-6 border-t border-accent flex flex-col md:flex-row md:items-center w-full">
        {/* Mobile: 2x2 grid, Desktop: 1x4 row */}
        <div className="grid grid-cols-2 md:flex md:flex-row md:items-center w-full gap-4 md:gap-0">
          
          {/* STAT 1: Today's P&L */}
          <div className="flex flex-col items-start px-2 sm:px-4 md:w-1/4">
            <span className="font-syne text-[9px] sm:text-[10px] uppercase text-textSecondary tracking-[0.12em]">
              Today's Net P&L
            </span>
            <span className={`font-mono text-[20px] xs:text-[24px] sm:text-[28px] md:text-[32px] font-semibold leading-tight mt-1 ${
              todayStats.totalPnl > 0 ? 'text-greenPnl' : todayStats.totalPnl < 0 ? 'text-redPnl' : 'text-textPrimary'
            }`}>
              {todayStats.totalPnl > 0 ? '+' : ''}{formatCurrency(todayStats.totalPnl)}
            </span>
          </div>

          <div className="hidden md:block w-[1px] h-10 bg-customBorder" />

          {/* STAT 2: Trade Count */}
          <div className="flex flex-col items-start px-2 sm:px-4 md:w-1/4 border-l border-customBorder md:border-l-0">
            <span className="font-syne text-[9px] sm:text-[10px] uppercase text-textSecondary tracking-[0.12em]">
              Executions
            </span>
            <span className="font-mono text-[20px] xs:text-[24px] sm:text-[28px] md:text-[32px] font-semibold text-textPrimary leading-tight mt-1">
              {todayStats.tradeCount}
            </span>
          </div>

          <div className="hidden md:block w-[1px] h-10 bg-customBorder" />

          {/* STAT 3: Win Rate */}
          <div className="flex flex-col items-start px-2 sm:px-4 border-t border-customBorder pt-4 md:pt-0 md:border-t-0">
            <span className="font-syne text-[9px] sm:text-[10px] uppercase text-textSecondary tracking-[0.12em]">
              Win Ratio
            </span>
            <span className="font-mono text-[20px] xs:text-[24px] sm:text-[28px] md:text-[32px] font-semibold text-accent leading-tight mt-1">
              {todayStats.winRate}%
            </span>
          </div>

          <div className="hidden md:block w-[1px] h-10 bg-customBorder" />

          {/* STAT 4: Best Trade */}
          <div className="flex flex-col items-start px-2 sm:px-4 border-t border-l border-customBorder pt-4 md:pt-0 md:border-t-0 md:border-l-0">
            <span className="font-syne text-[9px] sm:text-[10px] uppercase text-textSecondary tracking-[0.12em]">
              Peak Trade
            </span>
            <span className={`font-mono text-[20px] xs:text-[24px] sm:text-[28px] md:text-[32px] font-semibold leading-tight mt-1 ${
              todayStats.bestTrade > 0 ? 'text-greenPnl' : 'text-textPrimary'
            }`}>
              {todayStats.bestTrade > 0 ? '+' : ''}{formatCurrency(todayStats.bestTrade)}
            </span>
          </div>

        </div>
      </section>

      <div className="w-full">
          <section className="bg-bgSurface p-6 rounded-2xl border border-customBorder flex flex-col gap-6 select-none">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-accent" />
              <h2 className="font-syne text-[16px] font-bold text-textPrimary uppercase tracking-[0.12em]">
                LOG NEW EXECUTION
              </h2>
            </div>

            <PlanGate isGated={isLimitExceeded} message="You have reached the Free Plan limit of 10 logged trades. Upgrade to Pro to record unlimited trades.">
              <form onSubmit={handleFormSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-4">
                
                {/* Symbol */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-syne text-[10px] text-textSecondary uppercase tracking-[0.12em]" htmlFor="sym">
                    Ticker Symbol
                  </label>
                  <input
                    id="sym"
                    type="text"
                    required
                    disabled={submitting}
                    placeholder="e.g. BTCUSDT"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    className="w-full h-10 px-4 bg-bgElevated border border-customBorder rounded-xl font-dmsans text-[13px] text-textPrimary placeholder:text-textMuted outline-none focus:border-accent focus:ring-4 focus:ring-accentGlow transition-all duration-200"
                  />
                </div>

                {/* Direction */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-syne text-[10px] text-textSecondary uppercase tracking-[0.12em]">
                    Direction
                  </label>
                  <div className="grid grid-cols-2 gap-2 h-10">
                    <button
                      type="button"
                      onClick={() => {
                        setDirection('Long');
                        autoCalculatePnl(Number(entryPrice), Number(exitPrice), Number(positionSize), 'Long');
                      }}
                      className={`rounded-xl font-syne text-[11px] uppercase tracking-wider font-semibold transition-all duration-150 ${
                        direction === 'Long'
                          ? 'bg-greenPnl/10 border border-greenPnl text-greenPnl'
                          : 'bg-bgElevated border border-customBorder text-textSecondary hover:text-textPrimary'
                      }`}
                    >
                      LONG
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDirection('Short');
                        autoCalculatePnl(Number(entryPrice), Number(exitPrice), Number(positionSize), 'Short');
                      }}
                      className={`rounded-xl font-syne text-[11px] uppercase tracking-wider font-semibold transition-all duration-150 ${
                        direction === 'Short'
                          ? 'bg-redPnl/10 border border-redPnl text-redPnl'
                          : 'bg-bgElevated border border-customBorder text-textSecondary hover:text-textPrimary'
                      }`}
                    >
                      SHORT
                    </button>
                  </div>
                </div>

                {/* Entry Price */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-syne text-[10px] text-textSecondary uppercase tracking-[0.12em]" htmlFor="entry">
                    Entry Price ($)
                  </label>
                  <input
                    id="entry"
                    type="number"
                    step="any"
                    required
                    placeholder="0.00"
                    value={entryPrice}
                    onChange={(e) => {
                      setEntryPrice(e.target.value);
                      autoCalculatePnl(Number(e.target.value), Number(exitPrice), Number(positionSize), direction);
                    }}
                    className="w-full h-10 px-4 bg-bgElevated border border-customBorder rounded-xl font-dmsans text-[13px] text-textPrimary placeholder:text-textMuted outline-none focus:border-accent focus:ring-4 focus:ring-accentGlow transition-all duration-200"
                  />
                </div>

                {/* Exit Price */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-syne text-[10px] text-textSecondary uppercase tracking-[0.12em]" htmlFor="exit">
                    Exit Price ($)
                  </label>
                  <input
                    id="exit"
                    type="number"
                    step="any"
                    required
                    placeholder="0.00"
                    value={exitPrice}
                    onChange={(e) => {
                      setExitPrice(e.target.value);
                      autoCalculatePnl(Number(entryPrice), Number(e.target.value), Number(positionSize), direction);
                    }}
                    className="w-full h-10 px-4 bg-bgElevated border border-customBorder rounded-xl font-dmsans text-[13px] text-textPrimary placeholder:text-textMuted outline-none focus:border-accent focus:ring-4 focus:ring-accentGlow transition-all duration-200"
                  />
                </div>

                {/* Position Size */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-syne text-[10px] text-textSecondary uppercase tracking-[0.12em]" htmlFor="size">
                    Position Size (Qty)
                  </label>
                  <input
                    id="size"
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 10"
                    value={positionSize}
                    onChange={(e) => {
                      setPositionSize(e.target.value);
                      autoCalculatePnl(Number(entryPrice), Number(exitPrice), Number(e.target.value), direction);
                    }}
                    className="w-full h-10 px-4 bg-bgElevated border border-customBorder rounded-xl font-dmsans text-[13px] text-textPrimary placeholder:text-textMuted outline-none focus:border-accent focus:ring-4 focus:ring-accentGlow transition-all duration-200"
                  />
                </div>

                {/* Computed Net P&L */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="font-syne text-[10px] text-textSecondary uppercase tracking-[0.12em]" htmlFor="pnl-val">
                      Net P&L ($)
                    </label>
                    <button 
                      type="button" 
                      onClick={() => autoCalculatePnl(Number(entryPrice), Number(exitPrice), Number(positionSize), direction)}
                      className="text-[9px] font-syne text-accent uppercase tracking-wider flex items-center gap-1 hover:brightness-110"
                    >
                      <RefreshCw className="w-2.5 h-2.5" /> Re-calc
                    </button>
                  </div>
                  <input
                    id="pnl-val"
                    type="number"
                    step="any"
                    required
                    placeholder="0.00"
                    value={pnl}
                    onChange={(e) => {
                      setPnl(e.target.value);
                      const computedVal = Number(e.target.value);
                      if (computedVal > 0) setOutcome('Win');
                      else if (computedVal < 0) setOutcome('Loss');
                      else setOutcome('BE');
                    }}
                    className={`w-full h-10 px-4 bg-bgElevated border rounded-xl font-mono text-[13px] placeholder:text-textMuted outline-none focus:ring-4 focus:ring-accentGlow transition-all duration-200 ${
                      Number(pnl) > 0 
                        ? 'border-greenPnl/40 text-greenPnl focus:border-greenPnl' 
                        : Number(pnl) < 0 
                          ? 'border-redPnl/40 text-redPnl focus:border-redPnl' 
                          : 'border-customBorder text-textPrimary focus:border-accent'
                    }`}
                  />
                </div>

                {/* Strategy Dropdown */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-syne text-[10px] text-textSecondary uppercase tracking-[0.12em]" htmlFor="strat">
                    Strategy / Setup
                  </label>
                  <select
                    id="strat"
                    value={strategyName}
                    onChange={(e) => setStrategyName(e.target.value)}
                    className="w-full h-10 px-4 bg-bgElevated border border-customBorder rounded-xl font-dmsans text-[13px] text-textPrimary outline-none focus:border-accent focus:ring-4 focus:ring-accentGlow transition-all duration-200 appearance-none cursor-pointer"
                  >
                    <option value="None">None</option>
                    {strategies.map((strat) => (
                      <option key={strat.id} value={strat.name}>
                        {strat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Custom Outcome */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-syne text-[10px] text-textSecondary uppercase tracking-[0.12em]" htmlFor="outc">
                    Outcome
                  </label>
                  <select
                    id="outc"
                    value={outcome}
                    onChange={(e) => setOutcome(e.target.value as any)}
                    className="w-full h-10 px-4 bg-bgElevated border border-customBorder rounded-xl font-dmsans text-[13px] text-textPrimary outline-none focus:border-accent focus:ring-4 focus:ring-accentGlow transition-all duration-200 appearance-none cursor-pointer"
                  >
                    <option value="Win">WIN</option>
                    <option value="Loss">LOSS</option>
                    <option value="BE">BREAKEVEN (BE)</option>
                  </select>
                </div>

                {/* Mindset Check */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-syne text-[10px] text-textSecondary uppercase tracking-[0.12em]" htmlFor="mindset">
                    Mindset / Emotion at Entry
                  </label>
                  <select
                    id="mindset"
                    value={mindset}
                    onChange={(e) => setMindset(e.target.value)}
                    className="w-full h-10 px-4 bg-bgElevated border border-customBorder rounded-xl font-dmsans text-[13px] text-textPrimary outline-none focus:border-accent focus:ring-4 focus:ring-accentGlow transition-all duration-200 appearance-none cursor-pointer"
                  >
                    {Object.keys(EMOTION_EMOJIS).map((emo) => (
                      <option key={emo} value={emo}>
                        {EMOTION_EMOJIS[emo]} {emo.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Followed Plan/Strategy? Checkbox */}
                <div className="flex items-center gap-2.5 h-10 select-none border border-customBorder/60 bg-bgElevated/35 px-4 rounded-xl">
                  <input
                    id="followed-strat"
                    type="checkbox"
                    checked={followedStrategy}
                    onChange={(e) => setFollowedStrategy(e.target.checked)}
                    className="w-4.5 h-4.5 accent-accent rounded border border-customBorder focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="followed-strat" className="font-syne text-[10px] text-textSecondary uppercase tracking-[0.12em] cursor-pointer font-semibold">
                    Followed Strategy Rules?
                  </label>
                </div>

                {/* Notes - Spans 2 columns on lg to align nicely with grid spacing */}
                <div className="flex flex-col sm:col-span-2 gap-1.5">
                  <label className="font-syne text-[10px] text-textSecondary uppercase tracking-[0.12em]" htmlFor="note">
                    Mental Notes / Execution Details
                  </label>
                  <textarea
                    id="note"
                    rows={1}
                    placeholder="Specify setup triggers, emotional triggers, or execution mishaps..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-2 bg-bgElevated border border-customBorder rounded-xl font-dmsans text-[13px] text-textPrimary placeholder:text-textMuted outline-none focus:border-accent focus:ring-4 focus:ring-accentGlow transition-all duration-200 resize-y min-h-[40px]"
                  />
                </div>

                {/* Submit Container */}
                <div className="sm:col-span-2 lg:col-span-3 flex justify-end mt-1">
                  <button
                    type="submit"
                    id="submit-trade-btn"
                    disabled={submitting}
                    className="h-10 px-8 bg-accent hover:brightness-110 active:scale-[0.98] text-bgBase font-syne text-[13px] font-semibold uppercase tracking-[0.1em] rounded-xl transition-all duration-150 flex items-center justify-center gap-2 font-bold"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-bgBase border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      'Commit Execution'
                    )}
                  </button>
                </div>

              </form>
            </PlanGate>
          </section>
        </div>

      {/* TODAY'S EXECUTIONS TABLE */}
      <section className="flex flex-col gap-4">
        <h2 className="font-syne text-[13px] uppercase text-textSecondary tracking-[0.15em] border-b border-customBorder pb-2">
          Today's Executions ({todaysTrades.length})
        </h2>

        {todaysTrades.length === 0 ? (
          <div className="bg-bgSurface/40 border border-customBorder p-8 rounded-2xl text-center">
            <span className="font-dmsans text-[13px] text-textSecondary font-light">
              No executions logged yet today. Prepare your setup and stick to the edge.
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            
            {/* MOBILE LAYOUT: CARD LIST (Shown only on phone screens) */}
            <div className="flex flex-col gap-3.5 md:hidden">
              {todaysTrades.map((t) => {
                const isLong = t.direction === 'Long';
                const isWin = t.outcome === 'Win';
                const isLoss = t.outcome === 'Loss';

                return (
                  <div 
                    key={t.id} 
                    className="bg-bgSurface border border-customBorder/70 p-4 rounded-2xl flex flex-col gap-3 relative hover:border-accent/15 transition-all"
                  >
                    {/* Header Row */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        {renderGradeBadge(t)}
                        <span className="font-mono text-[14px] font-semibold text-textPrimary uppercase tracking-tight">
                          {t.symbol}
                        </span>
                        <span className={`inline-flex items-center text-[9px] font-mono font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded border ${
                          isLong 
                            ? 'bg-greenPnl/5 text-greenPnl border-greenPnl/20' 
                            : 'bg-redPnl/5 text-redPnl border-redPnl/20'
                        }`}>
                          {t.direction}
                        </span>
                      </div>
                      
                      {/* P&L & Delete Action */}
                      <div className="flex items-center gap-3">
                        <span className={`font-mono text-[14px] font-semibold ${
                          t.pnl > 0 ? 'text-greenPnl' : t.pnl < 0 ? 'text-redPnl' : 'text-textPrimary'
                        }`}>
                          {t.pnl > 0 ? '+' : ''}{t.pnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                        
                        <button
                          onClick={() => handleQuickDelete(t.id)}
                          className="text-textSecondary hover:text-redPnl p-1 transition-colors"
                          title="Delete trade"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Meta/Sub-details grid */}
                    <div className="grid grid-cols-3 gap-2 border-y border-customBorder/20 py-2.5 my-0.5 text-[11px] font-mono">
                      <div className="flex flex-col">
                        <span className="text-textMuted font-syne text-[8px] uppercase tracking-wider">Entry</span>
                        <span className="text-textPrimary mt-0.5 font-medium">{t.entryPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex flex-col border-l border-customBorder/20 pl-2.5">
                        <span className="text-textMuted font-syne text-[8px] uppercase tracking-wider">Exit</span>
                        <span className="text-textPrimary mt-0.5 font-medium">{t.exitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex flex-col border-l border-customBorder/20 pl-2.5">
                        <span className="text-textMuted font-syne text-[8px] uppercase tracking-wider">Size</span>
                        <span className="text-textSecondary mt-0.5 font-medium">{t.positionSize}</span>
                      </div>
                    </div>

                    {/* Bottom strip: Outcome, Strategy, Mindset */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[10px]">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center text-[9px] font-mono tracking-wider px-2 py-0.5 rounded border ${
                          isWin 
                            ? 'bg-greenPnl/5 text-greenPnl border-greenPnl/25' 
                            : isLoss 
                              ? 'bg-redPnl/5 text-redPnl border-redPnl/25' 
                              : 'bg-bgElevated text-textSecondary border-customBorder'
                        }`}>
                          {t.outcome}
                        </span>
                        {t.strategy && t.strategy !== 'None' && (
                          <span className="font-syne text-[9px] text-textSecondary uppercase tracking-wide bg-bgElevated px-1.5 py-0.5 rounded border border-customBorder/50">
                            {t.strategy}
                          </span>
                        )}
                      </div>

                      {t.mindset && (
                        <div className="flex items-center gap-1 font-dmsans text-[11px] text-textSecondary">
                          <span>{EMOTION_EMOJIS[t.mindset] || '😐'}</span>
                          <span className="uppercase tracking-wider text-[9px]">{t.mindset}</span>
                        </div>
                      )}
                    </div>

                    {/* Notes if present */}
                    {t.notes && (
                      <div className="mt-1 bg-bgElevated/40 p-2.5 rounded-xl border border-customBorder/40">
                        <p className="font-dmsans text-[11px] text-textSecondary font-light leading-relaxed">
                          {t.notes}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* DESKTOP LAYOUT: TABLE (Shown only on tablets/laptops and up) */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-customBorder/30">
              <table className="w-full text-left border-collapse select-none">
                <thead>
                  <tr className="bg-bgElevated border-b border-customBorder text-textSecondary font-syne text-[10px] uppercase tracking-[0.12em]">
                    <th className="py-3 px-4 font-semibold text-center w-8">Grade</th>
                    <th className="py-3 px-4 font-semibold">Asset</th>
                    <th className="py-3 px-4 font-semibold">Dir</th>
                    <th className="py-3 px-4 font-semibold">Entry ($)</th>
                    <th className="py-3 px-4 font-semibold">Exit ($)</th>
                    <th className="py-3 px-4 font-semibold">Size</th>
                    <th className="py-3 px-4 font-semibold text-right">P&L ($)</th>
                    <th className="py-3 px-4 font-semibold">Outcome</th>
                    <th className="py-3 px-4 font-semibold">Strategy</th>
                    <th className="py-3 px-4 font-semibold">Mindset</th>
                    <th className="py-3 px-4 font-semibold text-center w-12">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-customBorder/30">
                  {todaysTrades.map((t, idx) => {
                    const isLong = t.direction === 'Long';
                    const isWin = t.outcome === 'Win';
                    const isLoss = t.outcome === 'Loss';

                    return (
                      <tr 
                        key={t.id}
                        className={`transition-colors duration-150 ${idx % 2 === 0 ? 'bg-bgSurface' : 'bg-transparent'} hover:bg-bgElevated`}
                      >
                        {/* Grade Badge */}
                        <td className="py-3.5 px-4 text-center">
                          {renderGradeBadge(t)}
                        </td>

                        {/* Asset Symbol */}
                        <td className="py-3.5 px-4 font-mono text-[13px] font-semibold text-textPrimary uppercase">
                          {t.symbol}
                        </td>

                        {/* Direction Tag */}
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center text-[10px] font-mono font-medium tracking-wide uppercase px-2 py-0.5 rounded-lg border ${
                            isLong 
                              ? 'bg-greenPnl/5 text-greenPnl border-greenPnl/20' 
                              : 'bg-redPnl/5 text-redPnl border-redPnl/20'
                          }`}>
                            {t.direction}
                          </span>
                        </td>

                        {/* Entry Price */}
                        <td className="py-3.5 px-4 font-mono text-[13px] text-textPrimary">
                          {t.entryPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>

                        {/* Exit Price */}
                        <td className="py-3.5 px-4 font-mono text-[13px] text-textPrimary">
                          {t.exitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>

                        {/* Qty Size */}
                        <td className="py-3.5 px-4 font-mono text-[13px] text-textSecondary">
                          {t.positionSize}
                        </td>

                        {/* Net P&L */}
                        <td className={`py-3.5 px-4 font-mono text-[13px] text-right font-medium ${
                          t.pnl > 0 ? 'text-greenPnl' : t.pnl < 0 ? 'text-redPnl' : 'text-textPrimary'
                        }`}>
                          {t.pnl > 0 ? '+' : ''}{t.pnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>

                        {/* Outcome Tag */}
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-lg border ${
                            isWin 
                              ? 'bg-greenPnl/5 text-greenPnl border-greenPnl/25' 
                              : isLoss 
                                ? 'bg-redPnl/5 text-redPnl border-redPnl/25' 
                                : 'bg-bgElevated text-textSecondary border-customBorder'
                          }`}>
                            {t.outcome}
                          </span>
                        </td>

                        {/* Strategy */}
                        <td className="py-3.5 px-4 font-syne text-[10px] text-textSecondary uppercase tracking-wide">
                          {t.strategy}
                        </td>

                        {/* Mindset Cell */}
                        <td className="py-3.5 px-4 font-dmsans text-[12px] text-textPrimary">
                          <span className="inline-flex items-center gap-1">
                            <span>{EMOTION_EMOJIS[t.mindset] || '😐'}</span>
                            <span className="text-[11px] text-textSecondary uppercase tracking-wider">{t.mindset || 'Neutral'}</span>
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleQuickDelete(t.id)}
                            className="text-textSecondary hover:text-redPnl p-1 transition-colors duration-150"
                            title="Delete trade"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>)}
      </section>

    </div>
  );
};

export default DailyLog;
