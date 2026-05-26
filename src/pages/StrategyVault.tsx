import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { usePlanGateModal, PlanGate } from '../components/PlanGate';
import { Zap, Plus, BookOpen, Clock, Target, CheckCircle } from 'lucide-react';

const StrategyVault: React.FC = () => {
  const { strategies, addStrategy } = useData();
  const { userPlan } = useAuth();
  const { showToast } = useToast();
  const { openUpgradeModal } = usePlanGateModal();

  const [name, setName] = useState('');
  const [timeframe, setTimeframe] = useState('');
  const [riskReward, setRiskReward] = useState('');
  const [rules, setRules] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSaveStrategy = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !timeframe.trim() || !riskReward.trim() || !rules.trim()) {
      showToast('Please fill in all strategy parameters.', 'error');
      return;
    }

    if (userPlan === 'free' && strategies.length >= 1) {
      openUpgradeModal();
      return;
    }

    setSubmitting(true);
    try {
      await addStrategy({
        name: name.toUpperCase().trim(),
        timeframe: timeframe.trim(),
        riskReward: riskReward.trim(),
        rules: rules.trim(),
        timestamp: new Date()
      });

      showToast('New playbook strategy archived.', 'success');
      
      // Reset & close form
      setName('');
      setTimeframe('');
      setRiskReward('');
      setRules('');
      setShowAddForm(false);
    } catch (err: any) {
      showToast('Failed to add strategy.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-transition flex flex-col gap-8 select-none">
      
      {/* Heading */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-syne text-[20px] font-bold text-textPrimary uppercase tracking-[0.15em] m-0">
            STRATEGY VAULT
          </h1>
          <p className="font-dmsans text-[13px] text-textSecondary font-light">
            Document your edge. Define execution filters, risk parameters, and mechanical playbooks.
          </p>
        </div>

        {/* Toggle Form Button - Curved to rounded-xl */}
        <button
          onClick={() => {
            if (userPlan === 'free' && strategies.length >= 1 && !showAddForm) {
              openUpgradeModal();
              return;
            }
            setShowAddForm(!showAddForm);
          }}
          className="h-10 px-5 bg-accent hover:brightness-110 active:scale-[0.98] text-bgBase font-syne text-[11px] font-semibold uppercase tracking-[0.1em] rounded-xl transition-all duration-150 flex items-center justify-center gap-2 font-bold"
        >
          <Plus className="w-4 h-4" />
          {showAddForm ? 'CLOSE VAULT' : 'ARCHIVE SETUP'}
        </button>
      </header>

      {/* STRATEGY ADD FORM (CONDITIONAL) */}
      {showAddForm && (
        <PlanGate isGated={strategies.length >= 1} message="You have reached the Free Plan limit of 1 custom trading strategy setup. Upgrade to Pro to document unlimited playbooks.">
          <section className="bg-bgSurface p-6 rounded-2xl border border-customBorder flex flex-col gap-6 animate-pulse-subtle">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-accent" />
              <h2 className="font-syne text-[14px] font-bold text-textPrimary uppercase tracking-[0.12em]">
                DEFINE TRADING SETUP CRITERIA
              </h2>
            </div>

            <form onSubmit={handleSaveStrategy} className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              
              {/* Strategy Name */}
              <div className="flex flex-col gap-1.5">
                <label className="font-syne text-[10px] text-textSecondary uppercase tracking-[0.12em]" htmlFor="strat-name">
                  Strategy Name
                </label>
                <input
                  id="strat-name"
                  type="text"
                  required
                  placeholder="e.g. VWAP BOUNCE"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 px-4 bg-bgElevated border border-customBorder rounded-xl font-dmsans text-[13px] text-textPrimary placeholder:text-textMuted outline-none focus:border-accent focus:ring-4 focus:ring-accentGlow transition-all duration-200"
                />
              </div>

              {/* Timeframe */}
              <div className="flex flex-col gap-1.5">
                <label className="font-syne text-[10px] text-textSecondary uppercase tracking-[0.12em]" htmlFor="strat-tf">
                  Market / Timeframe
                </label>
                <input
                  id="strat-tf"
                  type="text"
                  required
                  placeholder="e.g. 5m / 1h (Intraday)"
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="w-full h-10 px-4 bg-bgElevated border border-customBorder rounded-xl font-dmsans text-[13px] text-textPrimary placeholder:text-textMuted outline-none focus:border-accent focus:ring-4 focus:ring-accentGlow transition-all duration-200"
                />
              </div>

              {/* Risk:Reward ratio */}
              <div className="flex flex-col gap-1.5">
                <label className="font-syne text-[10px] text-textSecondary uppercase tracking-[0.12em]" htmlFor="strat-rr">
                  Risk : Reward Target
                </label>
                <input
                  id="strat-rr"
                  type="text"
                  required
                  placeholder="e.g. 1:2, 1:3+"
                  value={riskReward}
                  onChange={(e) => setRiskReward(e.target.value)}
                  className="w-full h-10 px-4 bg-bgElevated border border-customBorder rounded-xl font-dmsans text-[13px] text-textPrimary placeholder:text-textMuted outline-none focus:border-accent focus:ring-4 focus:ring-accentGlow transition-all duration-200"
                />
              </div>

              {/* Strategy Rules */}
              <div className="flex flex-col sm:col-span-3 gap-1.5">
                <label className="font-syne text-[10px] text-textSecondary uppercase tracking-[0.12em]" htmlFor="strat-rules">
                  Execution Rules (Use line breaks to create steps)
                </label>
                <textarea
                  id="strat-rules"
                  rows={4}
                  required
                  placeholder="1. Trigger: Price breaks above yesterday's high.&#10;2. Validation: Volume is > 1.5x average.&#10;3. Stop: Below breakout candle low.&#10;4. Target: 2R profit take..."
                  value={rules}
                  onChange={(e) => setRules(e.target.value)}
                  className="w-full px-4 py-3 bg-bgElevated border border-customBorder rounded-xl font-dmsans text-[13px] text-textPrimary placeholder:text-textMuted outline-none focus:border-accent focus:ring-4 focus:ring-accentGlow transition-all duration-200 resize-y min-h-[96px]"
                />
              </div>

              {/* Save Button */}
              <div className="sm:col-span-3 flex justify-end">
                <button
                  type="submit"
                  id="save-strat-btn"
                  disabled={submitting}
                  className="h-10 px-8 bg-accent hover:brightness-110 active:scale-[0.98] text-bgBase font-syne text-[13px] font-semibold uppercase tracking-[0.1em] rounded-xl transition-all duration-150 flex items-center justify-center font-bold"
                >
                  {submitting ? 'Archiving Edge...' : 'Archive to Vault'}
                </button>
              </div>

            </form>
          </section>
        </PlanGate>
      )}

      {/* STRATEGIES PLAYBOOK GRID */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-customBorder pb-2">
          <BookOpen className="w-4 h-4 text-accent" />
          <h2 className="font-syne text-[13px] uppercase text-textSecondary tracking-[0.15em]">
            Archived Edge & Playbooks ({strategies.length})
          </h2>
        </div>

        {strategies.length === 0 ? (
          <div className="bg-bgSurface/40 border border-customBorder p-12 rounded-2xl text-center">
            <span className="font-dmsans text-[13px] text-textSecondary font-light">
              Your Strategy Vault is empty. Define your setups to establish mechanical consistency.
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {strategies.map((strat) => (
              <div 
                key={strat.id}
                className="bg-bgSurface p-5 rounded-2xl border border-customBorder flex flex-col gap-4 hover:border-accent/20 transition-all duration-200 select-text"
              >
                
                {/* Header */}
                <div className="flex justify-between items-start gap-3">
                  <div className="flex flex-col gap-0.5">
                    <h3 className="font-syne text-[15px] font-bold text-textPrimary uppercase tracking-wider">
                      {strat.name}
                    </h3>
                  </div>
                  <span className="shrink-0 p-1.5 bg-accentDim text-accent rounded-full">
                    <Zap className="w-5 h-5" />
                  </span>
                </div>

                {/* Specs */}
                <div className="grid grid-cols-2 gap-3 py-2 border-t border-b border-customBorder/40">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-textSecondary" />
                    <div className="flex flex-col">
                      <span className="font-syne text-[8px] uppercase text-textMuted tracking-wider leading-none">TIMEFRAME</span>
                      <span className="font-dmsans text-[11px] text-textSecondary mt-0.5 truncate">{strat.timeframe}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-3.5 h-3.5 text-accent" />
                    <div className="flex flex-col">
                      <span className="font-syne text-[8px] uppercase text-textMuted tracking-wider leading-none">RISK:REWARD</span>
                      <span className="font-mono text-[11px] text-accent mt-0.5">{strat.riskReward}</span>
                    </div>
                  </div>
                </div>

                {/* Rules List - Curved inner blocks */}
                <div className="flex flex-col gap-2">
                  <span className="font-syne text-[9px] uppercase text-textSecondary tracking-wider font-semibold">Rules of Engagement</span>
                  <div className="flex flex-col gap-2 bg-bgElevated/50 p-3 rounded-xl">
                    {strat.rules.split('\n').filter(r => r.trim()).map((rule, idx) => (
                      <div key={idx} className="flex gap-2.5 items-start">
                        <CheckCircle className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                        <p className="font-dmsans text-[12px] text-textPrimary font-light leading-relaxed">
                          {rule}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
};

export default StrategyVault;
