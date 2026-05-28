import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../hooks/useData';
import { useToast } from '../context/ToastContext';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Lock 
} from 'lucide-react';
import { usePlanGateModal } from './PlanGate';

const COUNTRIES = [
  { value: 'United States', label: 'United States' },
  { value: 'United Kingdom', label: 'United Kingdom' },
  { value: 'Canada', label: 'Canada' },
  { value: 'Australia', label: 'Australia' },
  { value: 'Germany', label: 'Germany' },
  { value: 'France', label: 'France' },
  { value: 'India', label: 'India' },
  { value: 'Pakistan', label: 'Pakistan' },
  { value: 'United Arab Emirates', label: 'United Arab Emirates' },
  { value: 'Saudi Arabia', label: 'Saudi Arabia' },
  { value: 'Singapore', label: 'Singapore' },
  { value: 'South Africa', label: 'South Africa' },
  { value: 'New Zealand', label: 'New Zealand' },
  { value: 'Japan', label: 'Japan' },
  { value: 'Brazil', label: 'Brazil' },
  { value: 'Mexico', label: 'Mexico' },
  { value: 'Turkey', label: 'Turkey' },
  { value: 'Netherlands', label: 'Netherlands' },
  { value: 'Switzerland', label: 'Switzerland' },
  { value: 'Spain', label: 'Spain' },
  { value: 'Italy', label: 'Italy' },
  { value: 'Ireland', label: 'Ireland' },
];

const CURRENCIES = [
  { value: 'USD', label: 'USD ($) - US Dollar' },
  { value: 'EUR', label: 'EUR (€) - Euro' },
  { value: 'GBP', label: 'GBP (£) - British Pound' },
  { value: 'CAD', label: 'CAD (C$) - Canadian Dollar' },
  { value: 'AUD', label: 'AUD (A$) - Australian Dollar' },
  { value: 'JPY', label: 'JPY (¥) - Japanese Yen' },
  { value: 'CHF', label: 'CHF (Fr) - Swiss Franc' },
  { value: 'NZD', label: 'NZD (NZ$) - New Zealand Dollar' },
  { value: 'PKR', label: 'PKR (₨) - Pakistani Rupee' },
  { value: 'INR', label: 'INR (₹) - Indian Rupee' },
  { value: 'AED', label: 'AED (د.إ) - UAE Dirham' },
  { value: 'SAR', label: 'SAR (ر.س) - Saudi Riyal' },
  { value: 'SGD', label: 'SGD (S$) - Singapore Dollar' },
  { value: 'HKD', label: 'HKD (HK$) - Hong Kong Dollar' },
  { value: 'CNY', label: 'CNY (¥) - Chinese Yuan' },
  { value: 'ZAR', label: 'ZAR (R) - South African Rand' },
  { value: 'MXN', label: 'MXN ($) - Mexican Peso' },
  { value: 'BRL', label: 'BRL (R$) - Brazilian Real' },
  { value: 'RUB', label: 'RUB (₽) - Russian Ruble' },
  { value: 'TRY', label: 'TRY (₺) - Turkish Lira' },
  { value: 'KRW', label: 'KRW (₩) - South Korean Won' },
  { value: 'PLN', label: 'PLN (zł) - Polish Zloty' },
  { value: 'SEK', label: 'SEK (kr) - Swedish Krona' },
  { value: 'NOK', label: 'NOK (kr) - Norwegian Krone' },
  { value: 'DKK', label: 'DKK (kr) - Danish Krone' },
  { value: 'MYR', label: 'MYR (RM) - Malaysian Ringgit' },
  { value: 'IDR', label: 'IDR (Rp) - Indonesian Rupiah' },
  { value: 'THB', label: 'THB (฿) - Thai Baht' },
  { value: 'PHP', label: 'PHP (₱) - Philippine Peso' },
  { value: 'VND', label: 'VND (₫) - Vietnamese Dong' },
  { value: 'ILS', label: 'ILS (₪) - Israeli New Shekel' },
];

const TRADING_STYLES = ['Day Trader', 'Swing Trader', 'Scalper'];
const MARKETS = ['Forex', 'Crypto', 'Stocks', 'Futures'];

const OnboardingFlow: React.FC = () => {
  const { user, onboardingComplete, updateProfileSettings } = useAuth();
  const { addStrategy } = useData();
  const { showToast } = useToast();
  const { openUpgradeModal } = usePlanGateModal();

  const [step, setStep] = useState(1);
  const [name, setName] = useState(user?.displayName || '');
  const [country, setCountry] = useState('United States');
  const [currency, setCurrency] = useState('USD');
  const [style, setStyle] = useState('Day Trader');
  const [market, setMarket] = useState('Forex');

  // Strategy Step 4 State
  const [stratName, setStratName] = useState('');
  const [stratTf, setStratTf] = useState('');
  const [stratRr, setStratRr] = useState('');
  const [stratRules, setStratRules] = useState('');

  const [submitting, setSubmitting] = useState(false);

  // If onboarding is already completed, do not render
  if (onboardingComplete || !user) return null;

  const handleNext = () => {
    if (step === 1 && !name.trim()) {
      showToast('Please specify your name.', 'error');
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleFinishOnboarding = async (planSelected: 'free' | 'pro') => {
    setSubmitting(true);
    try {
      // 1. If strategy entered, add it
      if (stratName.trim() && stratRules.trim()) {
        await addStrategy({
          name: stratName.toUpperCase().trim(),
          timeframe: stratTf.trim() || '5m',
          riskReward: stratRr.trim() || '1:2',
          rules: stratRules.trim(),
          timestamp: new Date()
        });
      }

      // Automatically resolve local timezone for background sync
      const autoTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      
      // Save currency to localStorage for helpers to fetch instantly
      localStorage.setItem('tradox_active_currency', currency);

      // 2. Save profile setup configuration to Context / Firestore
      await updateProfileSettings({
        onboardingComplete: true,
        country,
        currency,
        timezone: autoTimezone,
        tradingStyle: style,
        primaryMarket: market,
        userPlan: planSelected
      });

      showToast('Onboarding configuration completed successfully.', 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to complete onboarding settings.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-bgBase z-50 flex items-center justify-center p-4 select-none overflow-y-auto">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-accent/5 blur-[160px] rounded-full pointer-events-none" />

      <div className="bg-bgSurface border border-customBorder rounded-3xl w-full max-w-[540px] p-6 md:p-8 flex flex-col gap-6 relative shadow-2xl z-10 my-8">
        
        {/* Step Indicator */}
        <div className="flex justify-between items-center border-b border-customBorder pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent animate-pulse" />
            <span className="font-syne text-[10px] uppercase text-textSecondary tracking-[0.15em] font-semibold">
              Onboarding Setup Checklist
            </span>
          </div>
          <span className="font-mono text-[11px] text-accent font-bold bg-accentDim px-2.5 py-0.5 rounded-full">
            {step} / 5
          </span>
        </div>

        {/* STEP 1: Name, Country, and Currency */}
        {step === 1 && (
          <div className="flex flex-col gap-5 animate-pulse-subtle">
            <div className="flex flex-col gap-1.5">
              <h2 className="font-syne text-[18px] font-bold text-textPrimary uppercase tracking-wide">
                What's your profile details?
              </h2>
              <p className="font-dmsans text-[12px] text-textSecondary font-light">
                Configure your display name, country, and preferred journal currency.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-syne text-[10px] text-textSecondary uppercase tracking-wider" htmlFor="ob-name">
                  Trader Display Name
                </label>
                <input
                  id="ob-name"
                  type="text"
                  placeholder="e.g. Maverick"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 px-4 bg-bgElevated border border-customBorder rounded-xl font-dmsans text-[13px] text-textPrimary outline-none focus:border-accent focus:ring-4 focus:ring-accentGlow transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <label className="font-syne text-[10px] text-textSecondary uppercase tracking-wider" htmlFor="ob-country">
                    Your Country
                  </label>
                  <select
                    id="ob-country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full h-11 px-3 bg-bgElevated border border-customBorder rounded-xl font-dmsans text-[13px] text-textPrimary outline-none focus:border-accent focus:ring-4 focus:ring-accentGlow transition-all cursor-pointer"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.value} value={c.value} className="bg-bgSurface">
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-syne text-[10px] text-textSecondary uppercase tracking-wider" htmlFor="ob-curr">
                    Journal Currency
                  </label>
                  <select
                    id="ob-curr"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full h-11 px-3 bg-bgElevated border border-customBorder rounded-xl font-dmsans text-[13px] text-textPrimary outline-none focus:border-accent focus:ring-4 focus:ring-accentGlow transition-all cursor-pointer"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.value} value={c.value} className="bg-bgSurface">
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Trading Style */}
        {step === 2 && (
          <div className="flex flex-col gap-5 animate-pulse-subtle">
            <div className="flex flex-col gap-1.5">
              <h2 className="font-syne text-[18px] font-bold text-textPrimary uppercase tracking-wide">
                Your Trading Style?
              </h2>
              <p className="font-dmsans text-[12px] text-textSecondary font-light">
                Select your primary playbook strategy execution method.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {TRADING_STYLES.map((tStyle) => {
                const isSelected = style === tStyle;
                return (
                  <button
                    key={tStyle}
                    type="button"
                    onClick={() => setStyle(tStyle)}
                    className={`h-12 w-full px-5 rounded-xl border flex items-center justify-between transition-all duration-150 ${
                      isSelected
                        ? 'bg-accentDim border-accent text-accent'
                        : 'bg-bgElevated/50 border-customBorder text-textSecondary hover:text-textPrimary hover:bg-bgElevated'
                    }`}
                  >
                    <span className="font-syne text-[12px] uppercase font-bold tracking-wider">{tStyle}</span>
                    {isSelected && <Check className="w-4.5 h-4.5" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: Primary Market */}
        {step === 3 && (
          <div className="flex flex-col gap-5 animate-pulse-subtle">
            <div className="flex flex-col gap-1.5">
              <h2 className="font-syne text-[18px] font-bold text-textPrimary uppercase tracking-wide">
                Primary Trading Market?
              </h2>
              <p className="font-dmsans text-[12px] text-textSecondary font-light">
                Specify the asset environment you primarily target.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              {MARKETS.map((mkt) => {
                const isSelected = market === mkt;
                return (
                  <button
                    key={mkt}
                    type="button"
                    onClick={() => setMarket(mkt)}
                    className={`h-16 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all duration-150 ${
                      isSelected
                        ? 'bg-accentDim border-accent text-accent scale-[1.02]'
                        : 'bg-bgElevated/50 border-customBorder text-textSecondary hover:text-textPrimary hover:bg-bgElevated'
                    }`}
                  >
                    <span className="font-syne text-[12px] uppercase font-bold tracking-wider">{mkt}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: First Strategy (Skippable) */}
        {step === 4 && (
          <div className="flex flex-col gap-4 animate-pulse-subtle">
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-baseline">
                <h2 className="font-syne text-[18px] font-bold text-textPrimary uppercase tracking-wide">
                  Set Up Your First Strategy
                </h2>
                <span className="font-mono text-[9px] text-textMuted uppercase tracking-wider">SKIPPABLE</span>
              </div>
              <p className="font-dmsans text-[12px] text-textSecondary font-light">
                Define the execution rules of your edge setup. You can modify this later.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-3 flex flex-col gap-1.5">
                <label className="font-syne text-[9px] text-textSecondary uppercase tracking-wider" htmlFor="ob-strat-name">
                  Strategy Ticker Name
                </label>
                <input
                  id="ob-strat-name"
                  type="text"
                  placeholder="e.g. VWAP BOUNCE"
                  value={stratName}
                  onChange={(e) => setStratName(e.target.value)}
                  className="w-full h-10 px-3 bg-bgElevated border border-customBorder rounded-xl font-dmsans text-[12px] text-textPrimary outline-none focus:border-accent transition-all"
                />
              </div>

              <div className="col-span-2 flex flex-col gap-1.5">
                <label className="font-syne text-[9px] text-textSecondary uppercase tracking-wider" htmlFor="ob-strat-rules">
                  Setup Execution Rules
                </label>
                <textarea
                  id="ob-strat-rules"
                  rows={2}
                  placeholder="1. Break of structure... 2. Retest of VWAP..."
                  value={stratRules}
                  onChange={(e) => setStratRules(e.target.value)}
                  className="w-full px-3 py-2 bg-bgElevated border border-customBorder rounded-xl font-dmsans text-[12px] text-textPrimary outline-none focus:border-accent transition-all resize-none min-h-[58px]"
                />
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-syne text-[8px] text-textSecondary uppercase tracking-wider" htmlFor="ob-strat-tf">
                    Timeframe
                  </label>
                  <input
                    id="ob-strat-tf"
                    type="text"
                    placeholder="e.g. 5m"
                    value={stratTf}
                    onChange={(e) => setStratTf(e.target.value)}
                    className="w-full h-8 px-2 bg-bgElevated border border-customBorder rounded-xl font-dmsans text-[11px] text-textPrimary outline-none focus:border-accent"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-syne text-[8px] text-textSecondary uppercase tracking-wider" htmlFor="ob-strat-rr">
                    Risk Ratio
                  </label>
                  <input
                    id="ob-strat-rr"
                    type="text"
                    placeholder="e.g. 1:2"
                    value={stratRr}
                    onChange={(e) => setStratRr(e.target.value)}
                    className="w-full h-8 px-2 bg-bgElevated border border-customBorder rounded-xl font-dmsans text-[11px] text-textPrimary outline-none focus:border-accent"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Pricing Table Wall */}
        {step === 5 && (
          <div className="flex flex-col gap-4 animate-pulse-subtle">
            <div className="flex flex-col gap-1.5 text-center">
              <h2 className="font-syne text-[18px] font-bold text-textPrimary uppercase tracking-wide">
                CHOOSE YOUR WORKSPACE PLAN
              </h2>
              <p className="font-dmsans text-[12px] text-textSecondary font-light max-w-[380px] mx-auto leading-relaxed">
                Unlock professional trade limits and CSV/PDF metrics instantly.
              </p>
            </div>

            {/* Matrix comparison table */}
            <div className="w-full bg-bgElevated/40 border border-customBorder/60 rounded-2xl p-4 flex flex-col gap-2.5 text-[11px] font-dmsans">
              <div className="flex justify-between border-b border-customBorder/30 pb-1.5 text-textMuted font-syne text-[8px] tracking-wider uppercase font-semibold">
                <span>Features</span>
                <span>FREE PLAN</span>
                <span className="text-accent font-bold">PRO ACCOUNT</span>
              </div>
              <div className="flex justify-between text-textSecondary border-b border-customBorder/10 pb-1">
                <span>Total Executions</span>
                <span>Max 10</span>
                <span className="text-greenPnl font-semibold">Unlimited</span>
              </div>
              <div className="flex justify-between text-textSecondary border-b border-customBorder/10 pb-1">
                <span>Custom Setups</span>
                <span>Max 1</span>
                <span className="text-greenPnl font-semibold">Unlimited</span>
              </div>
              <div className="flex justify-between text-textSecondary border-b border-customBorder/10 pb-1">
                <span>Journal History</span>
                <span>7 Days Only</span>
                <span className="text-greenPnl font-semibold">Lifetime Access</span>
              </div>
              <div className="flex justify-between text-textSecondary">
                <span>Advanced Analytics</span>
                <span>Locked</span>
                <span className="text-greenPnl font-semibold">Full Graphics</span>
              </div>
            </div>

            <div className="text-[10px] text-textMuted font-dmsans text-center leading-normal">
              By continuing, you agree to the{' '}
              <a href="https://doc-hosting.flycricket.io/tradox-terms-of-use/7b59b34f-1e32-4423-b131-190bd4a7f6a7/terms" target="_blank" rel="noopener noreferrer" className="text-accent underline font-semibold">Terms of Service</a>{' '}
              and{' '}
              <a href="https://doc-hosting.flycricket.io/tradox-privacy-policy/8b8e80d1-595c-48a6-801e-5abdf8874da3/privacy" target="_blank" rel="noopener noreferrer" className="text-accent underline font-semibold">Privacy Policy</a>.
            </div>
          </div>
        )}

        {/* BOTTOM NAVIGATION ACTIONS */}
        <div className="flex items-center justify-between border-t border-customBorder pt-4 mt-2">
          {step > 1 ? (
            <button
              onClick={handleBack}
              disabled={submitting}
              className="h-10 px-5 bg-bgElevated hover:bg-bgElevated/80 text-textSecondary hover:text-textPrimary rounded-xl font-syne text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              BACK
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              onClick={handleNext}
              className="h-10 px-6 bg-accent hover:brightness-110 text-bgBase font-syne text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 ml-auto font-semibold"
            >
              CONTINUE
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-3 w-full ml-0 sm:ml-4">
              {/* Start Free option */}
              <button
                onClick={() => handleFinishOnboarding('free')}
                disabled={submitting}
                className="h-11 bg-bgElevated hover:bg-bgElevated/85 text-textPrimary font-syne text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center"
              >
                {submitting ? 'Setting up...' : 'Start Free (limited)'}
              </button>

              {/* Upgrade Whop Pro redirect option */}
              <button
                onClick={async () => {
                  // Complete onboarding with 'free' first. The plan will upgrade to 'pro'
                  // automatically via webhook or completion callback.
                  await handleFinishOnboarding('free');
                  openUpgradeModal('plan_ADVvcySYlxcIR');
                }}
                disabled={submitting}
                className="h-11 bg-accent hover:brightness-110 active:scale-[0.98] text-bgBase font-syne text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 text-center font-bold cursor-pointer"
              >
                Go Pro – $9.99/mo
                <Lock className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default OnboardingFlow;
