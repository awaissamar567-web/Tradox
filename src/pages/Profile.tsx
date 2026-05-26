import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  User, 
  Mail, 
  MapPin, 
  DollarSign, 
  Bookmark, 
  Settings, 
  Camera, 
  Shield, 
  Moon, 
  Sun,
  FileText
} from 'lucide-react';

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
  { value: 'USD', symbol: '$', label: 'US Dollar' },
  { value: 'EUR', symbol: '€', label: 'Euro' },
  { value: 'GBP', symbol: '£', label: 'British Pound' },
  { value: 'CAD', symbol: 'C$', label: 'Canadian Dollar' },
  { value: 'AUD', symbol: 'A$', label: 'Australian Dollar' },
  { value: 'JPY', symbol: '¥', label: 'Japanese Yen' },
  { value: 'CHF', symbol: 'Fr', label: 'Swiss Franc' },
  { value: 'NZD', symbol: 'NZ$', label: 'New Zealand Dollar' },
  { value: 'PKR', symbol: '₨', label: 'Pakistani Rupee' },
  { value: 'INR', symbol: '₹', label: 'Indian Rupee' },
  { value: 'AED', symbol: 'د.إ', label: 'UAE Dirham' },
  { value: 'SAR', symbol: 'ر.س', label: 'Saudi Riyal' },
  { value: 'SGD', symbol: 'S$', label: 'Singapore Dollar' },
  { value: 'HKD', symbol: 'HK$', label: 'Hong Kong Dollar' },
  { value: 'CNY', symbol: '¥', label: 'Chinese Yuan' },
  { value: 'ZAR', symbol: 'R', label: 'South African Rand' },
  { value: 'MXN', symbol: '$', label: 'Mexican Peso' },
  { value: 'BRL', symbol: 'R$', label: 'Brazilian Real' },
  { value: 'RUB', symbol: '₽', label: 'Russian Ruble' },
  { value: 'TRY', symbol: '₺', label: 'Turkish Lira' },
  { value: 'KRW', symbol: '₩', label: 'South Korean Won' },
  { value: 'PLN', symbol: 'zł', label: 'Polish Zloty' },
  { value: 'SEK', symbol: 'kr', label: 'Swedish Krona' },
  { value: 'NOK', symbol: 'kr', label: 'Norwegian Krone' },
  { value: 'DKK', symbol: 'kr', label: 'Danish Krone' },
  { value: 'MYR', symbol: 'RM', label: 'Malaysian Ringgit' },
  { value: 'IDR', symbol: 'Rp', label: 'Indonesian Rupiah' },
  { value: 'THB', symbol: '฿', label: 'Thai Baht' },
  { value: 'PHP', symbol: '₱', label: 'Philippine Peso' },
  { value: 'VND', symbol: '₫', label: 'Vietnamese Dong' },
  { value: 'ILS', symbol: '₪', label: 'Israeli New Shekel' },
];

const TRADING_STYLES = ['Day Trader', 'Swing Trader', 'Scalper'];
const MARKETS = ['Forex', 'Crypto', 'Stocks', 'Futures'];

interface ProfileProps {
  onNavigateToTab?: (tab: string) => void;
}

const Profile: React.FC<ProfileProps> = ({ onNavigateToTab }) => {
  const { user, profileSettings, updateProfileSettings, userPlan } = useAuth();
  const { showToast } = useToast();

  const [country, setCountry] = useState(profileSettings?.country || 'United States');
  const [timezone, setTimezone] = useState(profileSettings?.timezone || 'UTC');
  const [currency, setCurrency] = useState(profileSettings?.currency || 'USD');
  const [brokerLabel, setBrokerLabel] = useState(profileSettings?.brokerLabel || '');
  const [tradingStyle, setTradingStyle] = useState(profileSettings?.tradingStyle || 'Day Trader');
  const [primaryMarket, setPrimaryMarket] = useState(profileSettings?.primaryMarket || 'Forex');
  const [theme, setTheme] = useState(profileSettings?.theme || 'dark');
  const [avatar, setAvatar] = useState<string | null>(profileSettings?.customAvatarUrl || null);

  const [submitting, setSubmitting] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  // Sync active currency to localStorage on mount or change
  useEffect(() => {
    if (profileSettings?.currency) {
      localStorage.setItem('tradox_active_currency', profileSettings.currency);
    }
  }, [profileSettings?.currency]);

  // Live theme preview inside Profile settings
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  if (!user || !profileSettings) {
    return (
      <div className="flex items-center justify-center p-12 text-textSecondary font-dmsans text-[13px]">
        Loading profile data...
      </div>
    );
  }

  // Handle Avatar image select -> base64
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('Avatar image must be smaller than 2MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setAvatar(base64String);
      showToast('Avatar loaded. Save changes to update profile.', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Auto resolve local timezone behind the scenes
      const resolvedTz = Intl.DateTimeFormat().resolvedOptions().timeZone || timezone;
      setTimezone(resolvedTz);

      await updateProfileSettings({
        country,
        timezone: resolvedTz,
        tradingStyle,
        primaryMarket,
        currency,
        brokerLabel,
        theme,
        customAvatarUrl: avatar
      });

      // Update helper currency selection instantly
      localStorage.setItem('tradox_active_currency', currency);
      showToast('Profile configuration updated.', 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to save profile changes.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-transition flex flex-col gap-8 select-none">
      
      {/* Heading */}
      <header className="flex flex-col gap-1.5">
        <h1 className="font-syne text-[20px] font-bold text-textPrimary uppercase tracking-[0.15em] m-0">
          Trader Profile & Settings
        </h1>
        <p className="font-dmsans text-[13px] text-textSecondary font-light">
          Manage your credentials, custom timezone clocks, trading style preferences, and premium Whop plan details.
        </p>
      </header>

      <form onSubmit={handleSaveChanges} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Avatar and Plan Badge */}
        <div className="bg-bgSurface p-6 rounded-2xl border border-customBorder flex flex-col items-center justify-between text-center gap-5 min-h-[300px]">
          
          <div className="flex flex-col items-center gap-4 w-full">
            
            {/* Avatar Upload Indicator */}
            <div className="relative group cursor-pointer w-24 h-24 rounded-full border border-customBorder flex items-center justify-center bg-bgElevated overflow-hidden shadow-lg hover:border-accent transition-colors">
              {avatar || user.photoURL ? (
                <img 
                  src={avatar || user.photoURL || ''} 
                  alt="avatar" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-textSecondary" />
              )}
              
              <label 
                htmlFor="avatar-input" 
                className="absolute inset-0 bg-bgBase/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-[10px] text-textPrimary font-syne uppercase tracking-wider font-semibold cursor-pointer transition-opacity"
              >
                <Camera className="w-4 h-4 text-accent mb-1" />
                Change
              </label>
              
              <input 
                id="avatar-input"
                type="file" 
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            <div className="flex flex-col">
              <span className="font-syne text-[14px] text-textPrimary uppercase tracking-wider font-bold">
                {user.displayName || 'TRADER'}
              </span>
              <span className="font-dmsans text-[11px] text-textSecondary mt-0.5 truncate max-w-[180px]">
                {user.email}
              </span>
            </div>

            {/* Plan Badge */}
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-syne uppercase font-bold tracking-wider ${
              userPlan === 'pro'
                ? 'bg-accentDim text-accent border-accent/30 shadow-md animate-pulse-subtle'
                : 'bg-bgElevated text-textSecondary border-customBorder'
            }`}>
              <Shield className="w-3.5 h-3.5" />
              Account Status: {userPlan}
            </div>

          </div>

          {/* Theme Selector Widget */}
          <div className="w-full flex flex-col gap-2 border-t border-customBorder/50 pt-4">
            <span className="font-syne text-[9px] uppercase text-textSecondary tracking-wider font-semibold">
              Interface Color Theme
            </span>
            <div className="grid grid-cols-2 gap-2 bg-bgElevated p-1 rounded-xl border border-customBorder/40">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`h-8 rounded-lg flex items-center justify-center gap-1.5 transition-all text-[11px] font-syne uppercase ${
                  theme === 'dark'
                    ? 'bg-bgSurface text-accent font-bold border border-accent/15'
                    : 'text-textSecondary hover:text-textPrimary'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                Dark Theme
              </button>
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`h-8 rounded-lg flex items-center justify-center gap-1.5 transition-all text-[11px] font-syne uppercase ${
                  theme === 'light'
                    ? 'bg-bgSurface text-accent font-bold border border-accent/15'
                    : 'text-textSecondary hover:text-textPrimary'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                Light Theme
              </button>
            </div>
          </div>

        </div>

        {/* Right Side: Account and Meta settings */}
        <div className="lg:col-span-2 bg-bgSurface p-6 rounded-2xl border border-customBorder flex flex-col gap-5">
          
          <div className="flex items-center gap-2 border-b border-customBorder/60 pb-2">
            <Settings className="w-4 h-4 text-accent" />
            <h2 className="font-syne text-[12px] uppercase text-textSecondary tracking-[0.12em] font-bold">
              WORKSPACE PARAMETERS
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Display Name Input */}
            <div className="flex flex-col gap-1.5">
              <label className="font-syne text-[10px] text-textSecondary uppercase tracking-wider">DisplayName</label>
              <input
                type="text"
                disabled
                value={user.displayName || 'Trader'}
                className="w-full h-10 px-4 bg-bgElevated/50 border border-customBorder rounded-xl font-dmsans text-[13px] text-textMuted outline-none cursor-not-allowed"
              />
            </div>

            {/* Read-only email address */}
            <div className="flex flex-col gap-1.5">
              <label className="font-syne text-[10px] text-textSecondary uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-[11px] w-4.5 h-4.5 text-textMuted" />
                <input
                  type="email"
                  disabled
                  value={user.email || ''}
                  className="w-full h-10 pl-11 pr-4 bg-bgElevated/50 border border-customBorder rounded-xl font-dmsans text-[13px] text-textMuted outline-none cursor-not-allowed"
                />
              </div>
            </div>

            {/* Country Select */}
            <div className="flex flex-col gap-1.5">
              <label className="font-syne text-[10px] text-textSecondary uppercase tracking-wider">Your Country</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-[11px] w-4.5 h-4.5 text-textMuted" />
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full h-10 pl-11 pr-3 bg-bgElevated border border-customBorder rounded-xl font-dmsans text-[13px] text-textPrimary outline-none focus:border-accent transition-all cursor-pointer"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.value} value={c.value} className="bg-bgSurface">
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Read-Only Timezone */}
            <div className="flex flex-col gap-1.5">
              <label className="font-syne text-[10px] text-textSecondary uppercase tracking-wider">Detected Timezone</label>
              <div className="relative">
                <Settings className="absolute left-3.5 top-[11px] w-4.5 h-4.5 text-textMuted" />
                <input
                  type="text"
                  disabled
                  value={timezone}
                  className="w-full h-10 pl-11 pr-4 bg-bgElevated/50 border border-customBorder rounded-xl font-dmsans text-[13px] text-textMuted outline-none cursor-not-allowed"
                />
              </div>
            </div>

            {/* Currency Select */}
            <div className="flex flex-col gap-1.5">
              <label className="font-syne text-[10px] text-textSecondary uppercase tracking-wider">Journal Currency</label>
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-[11px] w-4.5 h-4.5 text-textMuted" />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full h-10 pl-11 pr-3 bg-bgElevated border border-customBorder rounded-xl font-dmsans text-[13px] text-textPrimary outline-none focus:border-accent transition-all cursor-pointer"
                >
                  {CURRENCIES.map((cur) => (
                    <option key={cur.value} value={cur.value} className="bg-bgSurface">
                      {cur.symbol} — {cur.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Prop Firm / Broker label */}
            <div className="flex flex-col gap-1.5">
              <label className="font-syne text-[10px] text-textSecondary uppercase tracking-wider">Prop Firm / Broker Label</label>
              <div className="relative">
                <Bookmark className="absolute left-3.5 top-[11px] w-4.5 h-4.5 text-textMuted" />
                <input
                  type="text"
                  placeholder="e.g. FTMO, FundedNext"
                  value={brokerLabel}
                  onChange={(e) => setBrokerLabel(e.target.value)}
                  className="w-full h-10 pl-11 pr-4 bg-bgElevated border border-customBorder rounded-xl font-dmsans text-[13px] text-textPrimary placeholder:text-textMuted outline-none focus:border-accent transition-all"
                />
              </div>
            </div>

            {/* Trading Style */}
            <div className="flex flex-col gap-1.5">
              <label className="font-syne text-[10px] text-textSecondary uppercase tracking-wider">Trading Playbook Style</label>
              <select
                value={tradingStyle}
                onChange={(e) => setTradingStyle(e.target.value)}
                className="w-full h-10 px-3 bg-bgElevated border border-customBorder rounded-xl font-dmsans text-[13px] text-textPrimary outline-none focus:border-accent transition-all cursor-pointer"
              >
                {TRADING_STYLES.map((tStyle) => (
                  <option key={tStyle} value={tStyle} className="bg-bgSurface">{tStyle}</option>
                ))}
              </select>
            </div>

            {/* Primary Asset Market */}
            <div className="flex flex-col gap-1.5">
              <label className="font-syne text-[10px] text-textSecondary uppercase tracking-wider">Primary Market Environment</label>
              <select
                value={primaryMarket}
                onChange={(e) => setPrimaryMarket(e.target.value)}
                className="w-full h-10 px-3 bg-bgElevated border border-customBorder rounded-xl font-dmsans text-[13px] text-textPrimary outline-none focus:border-accent transition-all cursor-pointer"
              >
                {MARKETS.map((mkt) => (
                  <option key={mkt} value={mkt} className="bg-bgSurface">{mkt}</option>
                ))}
              </select>
            </div>

          </div>

          {/* Whop Portal manage billing */}
          <div className="bg-bgElevated/40 border border-customBorder/60 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
            <div className="flex flex-col gap-0.5">
              <span className="font-syne text-[11px] font-bold text-textPrimary uppercase tracking-wider">
                Whop Membership Billing
              </span>
              <p className="font-dmsans text-[11px] text-textSecondary font-light leading-normal max-w-[340px]">
                Review subscription parameters, view payment history, and manage or cancel premium billing licenses.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToTab?.('upgrade')}
              className="h-9 px-4 shrink-0 bg-transparent border border-accent/40 hover:bg-accentDim text-accent font-syne text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Manage Billing
            </button>
          </div>

          {/* Conditional Cancel option for $9.99 monthly subscribers */}
          {userPlan === 'pro' && profileSettings?.paymentPlanType !== 'lifetime' && (
            <div className="bg-bgElevated/20 border border-customBorder/60 p-4 rounded-xl flex flex-col gap-3 mt-2">
              {!showConfirmCancel ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-syne text-[11px] font-bold text-textSecondary uppercase tracking-wider">
                      Membership Cancellation
                    </span>
                    <p className="font-dmsans text-[11px] text-textSecondary font-light leading-normal max-w-[340px]">
                      You have an active monthly Pro subscription ($9.99/mo).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowConfirmCancel(true)}
                    className="text-[11px] font-syne uppercase font-bold text-textMuted hover:text-redPnl transition-colors underline bg-transparent border-none cursor-pointer outline-none"
                  >
                    Cancel Subscription
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="font-syne text-[11px] font-bold text-redPnl uppercase tracking-wider">
                      Are you absolutely sure you want to cancel?
                    </span>
                    <p className="font-dmsans text-[11px] text-textSecondary font-light leading-normal">
                      By canceling, you will lose access to logging unlimited trades, viewing all-time history, unlimited strategies, and exporting reports. You will retain access until the end of your current billing period.
                    </p>
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <a
                      href="https://whop.com/hub/"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setShowConfirmCancel(false)}
                      className="h-8 px-4 bg-redPnl/15 hover:bg-redPnl/25 border border-redPnl/30 text-redPnl font-syne text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center cursor-pointer text-center"
                    >
                      Yes, Cancel subscription
                    </a>
                    <button
                      type="button"
                      onClick={() => setShowConfirmCancel(false)}
                      className="h-8 px-4 bg-bgElevated border border-customBorder text-textPrimary font-syne text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center cursor-pointer hover:brightness-110"
                    >
                      No, Keep Pro Plan
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action buttons & terms */}
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-customBorder/50 pt-4 mt-2 gap-4">
            
            {/* TOS and Privacy links */}
            <div className="flex items-center gap-3 text-[11px] font-dmsans text-textSecondary">
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-accent" />
                Legal Agreements:
              </span>
              <a href="https://doc-hosting.flycricket.io/tradox-privacy-policy/8b8e80d1-595c-48a6-801e-5abdf8874da3/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-accent hover:underline">Privacy Policy</a>
              <span className="text-textMuted">•</span>
              <a href="https://doc-hosting.flycricket.io/tradox-terms-of-use/7b59b34f-1e32-4423-b131-190bd4a7f6a7/terms" target="_blank" rel="noopener noreferrer" className="hover:text-accent hover:underline">Terms of Service</a>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="h-10 px-8 w-full sm:w-auto bg-accent hover:brightness-110 active:scale-[0.98] text-bgBase font-syne text-[12px] font-semibold uppercase tracking-[0.1em] rounded-xl transition-all flex items-center justify-center font-bold"
            >
              {submitting ? 'Saving Configuration...' : 'Save Configuration'}
            </button>
          </div>

        </div>

      </form>
      
    </div>
  );
};

export default Profile;
