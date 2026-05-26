import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Check, Shield, Zap, Sparkles } from 'lucide-react';

const UpgradePlan: React.FC = () => {
  const { userPlan } = useAuth();

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Essential journaling tools for beginners.',
      features: [
        'Max 10 executions logged',
        '7-day trade history only',
        '1 strategy in vault',
        'No CSV export',
        'No PDF export',
        'Basic monthly analytics only',
      ],
      buttonText: userPlan === 'free' ? 'Current Plan' : 'Free Tier',
      disabled: true,
      popular: false,
      valueBadge: '',
      link: '#',
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$9.99',
      period: 'month',
      description: 'Complete suite for dedicated traders.',
      features: [
        'Unlimited executions',
        'Full trade history (all-time)',
        'Unlimited strategies',
        'CSV + PDF export',
        'Full monthly analytics',
        'Priority support',
      ],
      buttonText: userPlan === 'pro' ? 'Manage Billing' : 'Upgrade to Pro →',
      disabled: false,
      popular: true,
      valueBadge: 'MOST POPULAR',
      link: userPlan === 'pro' ? 'https://whop.com/hub/' : 'https://whop.com/checkout/plan_ADVvcySYlxcIR',
    },
    {
      id: 'lifetime',
      name: 'Lifetime',
      price: '$79',
      period: 'one-time',
      description: 'Founding member access, never pay again.',
      features: [
        'Unlimited executions',
        'Full trade history (all-time)',
        'Unlimited strategies',
        'CSV + PDF export',
        'Full monthly analytics',
        'Priority support',
        'Never pay again (one-time fee)',
        'Founding member badge on profile',
        'Early access to all future features',
      ],
      buttonText: userPlan === 'pro' ? 'Manage Billing' : 'Get Lifetime Access →',
      disabled: false,
      popular: false,
      valueBadge: 'BEST VALUE',
      link: userPlan === 'pro' ? 'https://whop.com/hub/' : 'https://whop.com/checkout/plan_AOaJ2eJfVa30Z',
    },
  ];

  // Framer Motion Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <div className="page-transition flex flex-col gap-8 select-none max-w-6xl mx-auto pb-12">
      {/* Header */}
      <header className="flex flex-col items-center text-center gap-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accentDim border border-accent/20 text-[10px] font-syne uppercase font-bold tracking-wider text-accent">
          <Zap className="w-3.5 h-3.5" />
          Premium Journal Upgrades
        </div>
        <h1 className="font-syne text-[24px] sm:text-[32px] font-extrabold text-textPrimary uppercase tracking-[0.1em] m-0">
          Elevate Your Edge
        </h1>
        <p className="font-dmsans text-[13px] sm:text-[14px] text-textSecondary font-light max-w-[500px]">
          Upgrade to unlock institutional-grade trading tools, infinite history, unlimited playbooks, and priority support.
        </p>
      </header>

      {/* Grid container */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch mt-4"
      >
        {plans.map((plan) => {
          const isCurrent = plan.id === userPlan;
          
          return (
            <motion.div
              key={plan.id}
              variants={cardVariants}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className={`flex flex-col justify-between bg-bgSurface p-6 sm:p-8 rounded-3xl border transition-colors relative ${
                plan.popular
                  ? 'border-accent shadow-[0_0_24px_rgba(255,107,0,0.15)] ring-1 ring-accent/30'
                  : 'border-customBorder hover:border-textSecondary/30'
              }`}
            >
              {/* Badges */}
              {plan.valueBadge && (
                <div className={`absolute -top-3.5 left-6 px-3.5 py-1 rounded-full text-[9px] font-syne uppercase font-bold tracking-wider ${
                  plan.popular 
                    ? 'bg-accent text-bgBase shadow-[0_4px_12px_rgba(255,107,0,0.35)]'
                    : 'bg-bgElevated border border-customBorder text-textPrimary'
                }`}>
                  {plan.valueBadge}
                </div>
              )}

              {/* Top part */}
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1">
                  <h3 className="font-syne text-[18px] uppercase tracking-wider font-extrabold text-textPrimary">
                    {plan.name}
                  </h3>
                  <p className="font-dmsans text-[12px] text-textSecondary min-h-[32px]">
                    {plan.description}
                  </p>
                </div>

                {/* Price block */}
                <div className="flex items-baseline gap-1.5 border-b border-customBorder/50 pb-5">
                  <span className="font-syne text-[32px] sm:text-[38px] font-extrabold text-textPrimary leading-none">
                    {plan.price}
                  </span>
                  <span className="font-dmsans text-[12px] text-textSecondary uppercase tracking-wider font-light">
                    / {plan.period}
                  </span>
                </div>

                {/* Features List */}
                <div className="flex flex-col gap-3 py-2">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-[12px] font-dmsans text-textPrimary">
                      <div className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-accentDim border border-accent/15 flex items-center justify-center text-accent">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span className="leading-snug">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Action button */}
              <div className="mt-8">
                {plan.disabled ? (
                  <button
                    disabled
                    className="w-full h-11 bg-bgElevated border border-customBorder text-textSecondary rounded-xl font-syne text-[11px] uppercase tracking-widest font-bold cursor-not-allowed flex items-center justify-center gap-1.5"
                  >
                    {isCurrent ? <Shield className="w-3.5 h-3.5 text-accent" /> : null}
                    {plan.buttonText}
                  </button>
                ) : (
                  <motion.a
                    href={plan.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileTap={{ scale: 0.96 }}
                    className={`w-full h-11 rounded-xl font-syne text-[11px] uppercase tracking-widest font-extrabold transition-all flex items-center justify-center gap-2 ${
                      plan.popular
                        ? 'bg-accent hover:brightness-110 text-bgBase shadow-[0_4px_16px_rgba(255,107,0,0.25)]'
                        : 'bg-transparent border border-accent/40 text-accent hover:bg-accentDim'
                    }`}
                  >
                    {plan.id === 'lifetime' ? <Sparkles className="w-3.5 h-3.5" /> : null}
                    {plan.buttonText}
                  </motion.a>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default UpgradePlan;
