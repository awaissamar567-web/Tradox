import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, X, ArrowRight, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';

export const WHOP_MONTHLY_LINK = 'https://whop.com/checkout/plan_ADVvcySYlxcIR';
export const WHOP_LIFETIME_LINK = 'https://whop.com/checkout/plan_AOaJ2eJfVa30Z';
export const WHOP_BILLING_PORTAL = 'https://whop.com/hub';

interface PlanGateContextType {
  openUpgradeModal: (planId?: any) => void;
  closeUpgradeModal: () => void;
}

const PlanGateContext = createContext<PlanGateContextType | undefined>(undefined);

export const usePlanGateModal = () => {
  const context = useContext(PlanGateContext);
  if (!context) {
    throw new Error('usePlanGateModal must be used within a PlanGateProvider');
  }
  return context;
};

// Global paywall provider so pages can trigger the upgrade popup easily
export const PlanGateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profileSettings, updateProfileSettings } = useAuth();
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [checkoutPlanId, setCheckoutPlanId] = useState<string | null>(null);

  const openUpgradeModal = (planId?: any) => {
    const actualPlanId = typeof planId === 'string' ? planId : null;
    setCheckoutPlanId(actualPlanId);
    setIsOpen(true);
  };
  
  const closeUpgradeModal = () => {
    setIsOpen(false);
    setCheckoutPlanId(null);
  };

  // Define checkout complete callback on mount/update
  useEffect(() => {
    if (!isOpen) return;

    (window as any).onWhopCheckoutComplete = (planId: string, receiptId: string) => {
      console.log("💳 Whop checkout completed successfully:", planId, receiptId);
      
      const paymentPlanType = planId === 'plan_AOaJ2eJfVa30Z' ? 'lifetime' : 'monthly';
      
      // Update locally
      updateProfileSettings({
        userPlan: 'pro',
        paymentPlanType: paymentPlanType
      });

      // Notify and celebrate
      showToast('Welcome to Tradox Pro! Your subscription has been activated successfully.', 'success');
      
      // Celebration Confetti
      import('canvas-confetti').then((module) => {
        const confetti = module.default;
        const duration = 2.5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval = setInterval(() => {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          const particleCount = 50 * (timeLeft / duration);
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
      });

      // Close modal
      closeUpgradeModal();
    };

    return () => {
      delete (window as any).onWhopCheckoutComplete;
    };
  }, [isOpen, updateProfileSettings, showToast]);

  return (
    <PlanGateContext.Provider value={{ openUpgradeModal, closeUpgradeModal }}>
      {children}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 overflow-y-auto">
            {/* Backdrop Blur Fade In */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeUpgradeModal}
              className="fixed inset-0 bg-bgBase/80 backdrop-blur-md cursor-pointer"
              transition={{ duration: 0.25 }}
            />

            {/* Modal Body Spring Scale */}
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 10 }}
              transition={{ type: 'spring', damping: 18, stiffness: 120 }}
              className="bg-bgSurface border border-customBorder rounded-3xl w-full max-w-[500px] p-4 sm:p-8 flex flex-col items-center gap-4 sm:gap-6 relative shadow-2xl z-10 my-auto"
            >
              {/* Close */}
              <button
                onClick={closeUpgradeModal}
                className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-bgElevated border border-customBorder/60 flex items-center justify-center text-textSecondary hover:text-textPrimary transition-all hover:scale-105 active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>

              {checkoutPlanId ? (
                <div className="w-full flex flex-col gap-4">
                  <div className="flex items-center justify-between w-full border-b border-customBorder/30 pb-3">
                    <button
                      onClick={() => setCheckoutPlanId(null)}
                      className="font-syne text-[10px] text-accent hover:underline flex items-center gap-1.5 uppercase font-bold tracking-wider cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back to Plans
                    </button>
                    <span className="font-syne text-[10px] text-textSecondary uppercase font-bold tracking-wider">
                      {checkoutPlanId === 'plan_AOaJ2eJfVa30Z' ? 'Lifetime Upgrade' : 'Monthly Upgrade'}
                    </span>
                  </div>

                  <div 
                    className="w-full h-[620px] sm:h-[500px] bg-bgElevated rounded-2xl border border-customBorder/60 overflow-hidden"
                    data-whop-checkout-plan-id={checkoutPlanId}
                    data-whop-checkout-on-complete="onWhopCheckoutComplete"
                    data-whop-checkout-prefill-email={user?.email || ''}
                    data-whop-checkout-theme={profileSettings?.theme || 'dark'}
                    data-whop-checkout-theme-accent-color="#FF6B00"
                  ></div>
                </div>
              ) : (
                <>
                  {/* Premium Badge Icon */}
                  <div className="w-14 h-14 rounded-2xl bg-accentDim border border-accent/20 flex items-center justify-center text-accent relative">
                    <Sparkles className="w-7 h-7 animate-pulse" />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-accent text-bgBase flex items-center justify-center shadow-md">
                      <Lock className="w-2.5 h-2.5" />
                    </div>
                  </div>

                  {/* Copy */}
                  <div className="text-center flex flex-col gap-1.5">
                    <h2 className="font-syne text-[18px] font-extrabold text-textPrimary uppercase tracking-wider">
                      UNLOCK TRADOX PRO
                    </h2>
                    <p className="font-dmsans text-[12.5px] text-textSecondary font-light leading-relaxed max-w-[340px] mx-auto">
                      Get instant unlimited access to professional trading diagnostics, full historical logging, and strategy vault playbooks.
                    </p>
                  </div>

                  {/* Comparison list */}
                  <div className="w-full bg-bgElevated/50 border border-customBorder/60 rounded-2xl p-4 flex flex-col gap-2 text-[11px] font-dmsans">
                    <div className="flex justify-between border-b border-customBorder/30 pb-1.5 text-textMuted font-syne text-[9px] tracking-wider uppercase font-semibold">
                      <span>Features</span>
                      <span>Free</span>
                      <span className="text-accent font-bold">Pro Plan</span>
                    </div>
                    <div className="flex justify-between py-0.5 text-textSecondary">
                      <span>Logged Executions</span>
                      <span>10 Limit</span>
                      <span className="text-accent font-bold">Unlimited</span>
                    </div>
                    <div className="flex justify-between py-0.5 text-textSecondary">
                      <span>Strategy Playbooks</span>
                      <span>1 Limit</span>
                      <span className="text-accent font-bold">Unlimited</span>
                    </div>
                    <div className="flex justify-between py-0.5 text-textSecondary">
                      <span>Journal Ledger History</span>
                      <span>7 Days</span>
                      <span className="text-accent font-bold">All-Time</span>
                    </div>
                    <div className="flex justify-between py-0.5 text-textSecondary">
                      <span>Premium PDF & CSV exports</span>
                      <span>🔒 Locked</span>
                      <span className="text-accent font-bold">Unlocked</span>
                    </div>
                  </div>

                  {/* Pricing Cards Comparison (Mini pricing table) */}
                  <div className="grid grid-cols-2 gap-3.5 w-full mt-1">
                    {/* Pro Monthly */}
                    <motion.button
                      onClick={() => setCheckoutPlanId('plan_ADVvcySYlxcIR')}
                      whileTap={{ scale: 0.96 }}
                      className="flex flex-col justify-between p-4 bg-bgElevated border border-accent/20 hover:border-accent rounded-2xl text-left gap-3 group relative cursor-pointer"
                    >
                      <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-accent text-bgBase text-[7px] font-syne font-bold uppercase tracking-wider">
                        PRO
                      </div>
                      <div className="flex flex-col">
                        <span className="font-syne text-[11px] font-bold text-textPrimary uppercase tracking-wider">Monthly</span>
                        <span className="font-syne text-[18px] font-extrabold text-textPrimary mt-1">$9.99<span className="text-[10px] font-normal text-textSecondary">/mo</span></span>
                      </div>
                      <div className="w-full h-8 bg-accent text-bgBase rounded-lg font-syne text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-1 group-hover:brightness-110">
                        Go Pro
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </motion.button>

                    {/* Lifetime */}
                    <motion.button
                      onClick={() => setCheckoutPlanId('plan_AOaJ2eJfVa30Z')}
                      whileTap={{ scale: 0.96 }}
                      className="flex flex-col justify-between p-4 bg-bgElevated border border-customBorder hover:border-accent rounded-2xl text-left gap-3 group relative cursor-pointer"
                    >
                      <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-bgSurface border border-customBorder text-textPrimary text-[7px] font-syne font-bold uppercase tracking-wider">
                        VALUE
                      </div>
                      <div className="flex flex-col">
                        <span className="font-syne text-[11px] font-bold text-textPrimary uppercase tracking-wider">Lifetime</span>
                        <span className="font-syne text-[18px] font-extrabold text-textPrimary mt-1">$79<span className="text-[10px] font-normal text-textSecondary"> once</span></span>
                      </div>
                      <div className="w-full h-8 bg-transparent border border-accent/40 text-accent rounded-lg font-syne text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-1 group-hover:bg-accentDim">
                        Buy Once
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </div>
                    </motion.button>
                  </div>

                  <div className="text-[10px] text-textMuted font-dmsans text-center mt-1">
                    Payments processed securely via Whop. Cancel anytime.
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PlanGateContext.Provider>
  );
};

// PlanGate overlay wrapper that blurs children if user is on Free plan
interface PlanGateProps {
  children: React.ReactNode;
  isGated: boolean;
  message?: string;
}

export const PlanGate: React.FC<PlanGateProps> = ({ 
  children, 
  isGated, 
  message = "This feature requires an active Pro Subscription." 
}) => {
  const { userPlan } = useAuth();
  const { openUpgradeModal } = usePlanGateModal();

  if (isGated && userPlan === 'free') {
    return (
      <div className="relative overflow-hidden group">
        {/* Gated visual blur mask */}
        <div className="absolute inset-0 z-40 bg-bgBase/40 backdrop-blur-[6px] border border-customBorder rounded-2xl flex flex-col items-center justify-center p-6 text-center select-none cursor-pointer"
             onClick={openUpgradeModal}>
          <div className="w-11 h-11 rounded-xl bg-accentDim border border-accent/20 flex items-center justify-center text-accent mb-3 shadow-lg group-hover:scale-105 transition-transform duration-200">
            <Lock className="w-5 h-5" />
          </div>
          <span className="font-syne text-[11px] uppercase text-textPrimary tracking-[0.12em] font-semibold">
            LOCKED ON FREE ACCOUNT
          </span>
          <p className="font-dmsans text-[11px] text-textSecondary font-light leading-snug max-w-[240px] mt-1 mb-3.5">
            {message}
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              openUpgradeModal();
            }}
            className="h-8 px-4 bg-accent hover:brightness-110 text-bgBase font-syne text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95"
          >
            Upgrade Playbook
          </button>
        </div>
        
        {/* Locked blurred children */}
        <div className="blur-md pointer-events-none select-none">
          {children}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
