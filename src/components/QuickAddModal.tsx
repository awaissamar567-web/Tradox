import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { usePlanGateModal } from '../components/PlanGate';
import { X, RefreshCw, ClipboardList } from 'lucide-react';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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

const QuickAddModal: React.FC<QuickAddModalProps> = ({ isOpen, onClose }) => {
  const { trades, strategies, addTrade } = useData();
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

  if (!isOpen) return null;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!symbol.trim() || !entryPrice || !exitPrice || !positionSize || !pnl) {
      showToast('Please fill in all core trading values.', 'error');
      return;
    }

    if (userPlan === 'free' && trades.length >= 10) {
      onClose();
      openUpgradeModal();
      return;
    }

    setSubmitting(true);
    try {
      await addTrade({
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
      } as any);

      // Confetti close triggers
      const todaysTrades = trades.filter((t) => {
        const todayStr = new Date().toISOString().split('T')[0];
        const tradeDateStr = t.timestamp?.seconds 
          ? new Date(t.timestamp.seconds * 1000).toISOString().split('T')[0]
          : new Date(t.timestamp).toISOString().split('T')[0];
        return todayStr === tradeDateStr;
      });

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

      showToast('Trade successfully logged via quick action.', 'success');
      
      // Reset & close
      setSymbol('');
      setEntryPrice('');
      setExitPrice('');
      setPositionSize('');
      setPnl('');
      setNotes('');
      setMindset('Neutral');
      setFollowedStrategy(true);
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to submit trade.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-bgBase/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-bgSurface border border-customBorder rounded-3xl w-full max-w-[580px] p-6 flex flex-col gap-5 relative shadow-2xl animate-pulse-subtle max-h-[90vh] overflow-y-auto scrollbar-none">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-customBorder/60 pb-3">
          <div className="flex items-center gap-2 text-accent">
            <ClipboardList className="w-5 h-5" />
            <h2 className="font-syne text-[15px] font-bold uppercase tracking-[0.12em]">
              QUICK LOG EXECUTION
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-bgElevated border border-customBorder/60 flex items-center justify-center text-textSecondary hover:text-textPrimary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
          
          {/* Symbol */}
          <div className="flex flex-col gap-1">
            <label className="font-syne text-[9px] text-textSecondary uppercase tracking-wider" htmlFor="qa-sym">
              Ticker Symbol
            </label>
            <input
              id="qa-sym"
              type="text"
              required
              disabled={submitting}
              placeholder="e.g. BTCUSDT"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="w-full h-10 px-4 bg-bgElevated border border-customBorder rounded-xl font-dmsans text-[12px] text-textPrimary placeholder:text-textMuted outline-none focus:border-accent transition-all"
            />
          </div>

          {/* Direction */}
          <div className="flex flex-col gap-1">
            <label className="font-syne text-[9px] text-textSecondary uppercase tracking-wider">
              Direction
            </label>
            <div className="grid grid-cols-2 gap-2 h-10">
              <button
                type="button"
                onClick={() => {
                  setDirection('Long');
                  autoCalculatePnl(Number(entryPrice), Number(exitPrice), Number(positionSize), 'Long');
                }}
                className={`rounded-xl font-syne text-[10px] uppercase tracking-wider font-semibold transition-all ${
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
                className={`rounded-xl font-syne text-[10px] uppercase tracking-wider font-semibold transition-all ${
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
          <div className="flex flex-col gap-1">
            <label className="font-syne text-[9px] text-textSecondary uppercase tracking-wider" htmlFor="qa-entry">
              Entry Price ($)
            </label>
            <input
              id="qa-entry"
              type="number"
              step="any"
              required
              placeholder="0.00"
              value={entryPrice}
              onChange={(e) => {
                setEntryPrice(e.target.value);
                autoCalculatePnl(Number(e.target.value), Number(exitPrice), Number(positionSize), direction);
              }}
              className="w-full h-10 px-4 bg-bgElevated border border-customBorder rounded-xl font-dmsans text-[12px] text-textPrimary placeholder:text-textMuted outline-none focus:border-accent transition-all"
            />
          </div>

          {/* Exit Price */}
          <div className="flex flex-col gap-1">
            <label className="font-syne text-[9px] text-textSecondary uppercase tracking-wider" htmlFor="qa-exit">
              Exit Price ($)
            </label>
            <input
              id="qa-exit"
              type="number"
              step="any"
              required
              placeholder="0.00"
              value={exitPrice}
              onChange={(e) => {
                setExitPrice(e.target.value);
                autoCalculatePnl(Number(entryPrice), Number(e.target.value), Number(positionSize), direction);
              }}
              className="w-full h-10 px-4 bg-bgElevated border border-customBorder rounded-xl font-dmsans text-[12px] text-textPrimary placeholder:text-textMuted outline-none focus:border-accent transition-all"
            />
          </div>

          {/* Position Size */}
          <div className="flex flex-col gap-1">
            <label className="font-syne text-[9px] text-textSecondary uppercase tracking-wider" htmlFor="qa-size">
              Position Size (Qty)
            </label>
            <input
              id="qa-size"
              type="number"
              step="any"
              required
              placeholder="e.g. 10"
              value={positionSize}
              onChange={(e) => {
                setPositionSize(e.target.value);
                autoCalculatePnl(Number(entryPrice), Number(exitPrice), Number(e.target.value), direction);
              }}
              className="w-full h-10 px-4 bg-bgElevated border border-customBorder rounded-xl font-dmsans text-[12px] text-textPrimary placeholder:text-textMuted outline-none focus:border-accent transition-all"
            />
          </div>

          {/* Computed Net P&L */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <label className="font-syne text-[9px] text-textSecondary uppercase tracking-wider" htmlFor="qa-pnl">
                Net P&L ($)
              </label>
              <button 
                type="button" 
                onClick={() => autoCalculatePnl(Number(entryPrice), Number(exitPrice), Number(positionSize), direction)}
                className="text-[8px] font-syne text-accent uppercase tracking-wider flex items-center gap-1 hover:brightness-110"
              >
                <RefreshCw className="w-2 h-2" /> Re-calc
              </button>
            </div>
            <input
              id="qa-pnl"
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
              className={`w-full h-10 px-4 bg-bgElevated border rounded-xl font-mono text-[12px] placeholder:text-textMuted outline-none focus:ring-2 focus:ring-accentGlow transition-all ${
                Number(pnl) > 0 
                  ? 'border-greenPnl/40 text-greenPnl focus:border-greenPnl' 
                  : Number(pnl) < 0 
                    ? 'border-redPnl/40 text-redPnl focus:border-redPnl' 
                    : 'border-customBorder text-textPrimary focus:border-accent'
              }`}
            />
          </div>

          {/* Strategy Dropdown */}
          <div className="flex flex-col gap-1">
            <label className="font-syne text-[9px] text-textSecondary uppercase tracking-wider" htmlFor="qa-strat">
              Strategy / Setup
            </label>
            <select
              id="qa-strat"
              value={strategyName}
              onChange={(e) => setStrategyName(e.target.value)}
              className="w-full h-10 px-4 bg-bgElevated border border-customBorder rounded-xl font-dmsans text-[12px] text-textPrimary outline-none focus:border-accent transition-all cursor-pointer appearance-none"
            >
              <option value="None">None</option>
              {strategies.map((strat) => (
                <option key={strat.id} value={strat.name}>
                  {strat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Mindset Check */}
          <div className="flex flex-col gap-1">
            <label className="font-syne text-[9px] text-textSecondary uppercase tracking-wider" htmlFor="qa-mindset">
              Mindset at Entry
            </label>
            <select
              id="qa-mindset"
              value={mindset}
              onChange={(e) => setMindset(e.target.value)}
              className="w-full h-10 px-4 bg-bgElevated border border-customBorder rounded-xl font-dmsans text-[12px] text-textPrimary outline-none focus:border-accent transition-all cursor-pointer appearance-none"
            >
              {Object.keys(EMOTION_EMOJIS).map((emo) => (
                <option key={emo} value={emo}>
                  {EMOTION_EMOJIS[emo]} {emo.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Followed Rules Checkbox */}
          <div className="flex items-center gap-2 h-10 select-none border border-customBorder/60 bg-bgElevated/35 px-4 rounded-xl sm:col-span-2">
            <input
              id="qa-followed-strat"
              type="checkbox"
              checked={followedStrategy}
              onChange={(e) => setFollowedStrategy(e.target.checked)}
              className="w-4 h-4 accent-accent rounded border border-customBorder focus:ring-0 cursor-pointer"
            />
            <label htmlFor="qa-followed-strat" className="font-syne text-[9px] text-textSecondary uppercase tracking-wider cursor-pointer font-semibold">
              Followed Playbook Rules?
            </label>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="font-syne text-[9px] text-textSecondary uppercase tracking-wider" htmlFor="qa-note">
              Mental Notes / Details
            </label>
            <textarea
              id="qa-note"
              rows={2}
              placeholder="Jot down quick execution setups or comments..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 bg-bgElevated border border-customBorder rounded-xl font-dmsans text-[12px] text-textPrimary placeholder:text-textMuted outline-none focus:border-accent transition-all min-h-[50px] resize-none"
            />
          </div>

          {/* Actions */}
          <div className="sm:col-span-2 flex justify-end gap-2.5 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-6 bg-bgElevated hover:bg-bgElevated/80 text-textSecondary rounded-xl font-syne text-[11px] font-bold uppercase tracking-wider transition-all"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="h-10 px-8 bg-accent hover:brightness-110 text-bgBase font-syne text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all font-bold"
            >
              {submitting ? 'LOGGING...' : 'LOG EXECUTION'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default QuickAddModal;
