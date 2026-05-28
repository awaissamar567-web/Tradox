import { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import DailyLog from './pages/DailyLog';
import TradeHistory from './pages/TradeHistory';
import WeeklyReview from './pages/WeeklyReview';
import MonthlyHistory from './pages/MonthlyHistory';
import StrategyVault from './pages/StrategyVault';
import Profile from './pages/Profile';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import UpgradePlan from './pages/UpgradePlan';
import OnboardingFlow from './components/OnboardingFlow';
import { PlanGateProvider } from './components/PlanGate';
import QuickAddModal from './components/QuickAddModal';
import { Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useToast } from './context/ToastContext';
import TradoxLogo from './components/TradoxLogo';

function AppContent() {
  const { showToast } = useToast();
  const [currentTab, setCurrentTab] = useState('daily');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });

  // Handle Whop webhook success/failure redirection params & triggers
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment') || params.get('checkout') || params.get('session');

    if (paymentStatus === 'success') {
      showToast('Welcome to Tradox Pro! Your subscription has been activated successfully.', 'success');
      
      // Premium multi-side bursts celebration animation
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

      // Clear params from url bar
      params.delete('payment');
      params.delete('checkout');
      params.delete('session');
      const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
      window.history.replaceState(null, '', newUrl);
    } else if (paymentStatus === 'fail' || paymentStatus === 'cancel') {
      showToast('Subscription checkout was cancelled or failed. Please try again.', 'error');
      
      params.delete('payment');
      params.delete('checkout');
      params.delete('session');
      const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
      window.history.replaceState(null, '', newUrl);
    }
  }, [showToast]);

  // Track collapse changes in localStorage
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', sidebarCollapsed.toString());
  }, [sidebarCollapsed]);

  const renderActivePage = () => {
    switch (currentTab) {
      case 'daily':
        return <DailyLog />;
      case 'history':
        return <TradeHistory />;
      case 'weekly':
        return <WeeklyReview />;
      case 'monthly':
        return <MonthlyHistory />;
      case 'strategies':
        return <StrategyVault />;
      case 'profile':
        return <Profile onNavigateToTab={setCurrentTab} />;
      case 'privacy-policy':
        return <PrivacyPolicy />;
      case 'terms-of-service':
        return <TermsOfService />;
      case 'upgrade':
        return <UpgradePlan />;
      default:
        return <DailyLog />;
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-bgBase flex flex-col md:flex-row text-textPrimary">
        
        {/* Mobile Header Bar */}
        <div className="md:hidden w-full h-14 bg-bgSurface/95 backdrop-blur-md border-b border-customBorder/30 px-4 flex items-center justify-between sticky top-0 z-40 select-none">
          <div className="flex items-center gap-2">
            <TradoxLogo size={26} />
            <span className="font-syne text-[15px] font-extrabold text-accent tracking-[0.15em] uppercase mt-0.5">
              Tradox
            </span>
          </div>
        </div>

        {/* Onboarding Wizard Setup */}
        <OnboardingFlow />

        {/* Quick Log Modal Overlay */}
        <QuickAddModal isOpen={showQuickAdd} onClose={() => setShowQuickAdd(false)} />

        {/* Desktop Left Sidebar / Mobile Bottom Tab Bar */}
        <Sidebar 
          currentTab={currentTab} 
          setCurrentTab={setCurrentTab} 
          isCollapsed={sidebarCollapsed}
          setIsCollapsed={setSidebarCollapsed}
        />

        {/* Fluid Content Panel (Shifted right based on sidebar collapse) */}
        <main 
          className={`flex-1 pb-[76px] md:pb-0 transition-all duration-[250ms] cubic-bezier(0.4, 0, 0.2, 1) ${
            sidebarCollapsed ? 'md:pl-16' : 'md:pl-60'
          }`}
        >
          <div className="w-full max-w-[1100px] mx-auto px-4 py-6 md:p-8">
            
            {/* Keyed element triggers clean spring page-transition on view change */}
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentTab} 
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                {renderActivePage()}
              </motion.div>
            </AnimatePresence>
            
          </div>
        </main>

        {/* Floating Quick Add Execution Action */}
        <motion.button
          onClick={() => setShowQuickAdd(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-[76px] right-5 md:bottom-6 md:right-6 z-40 w-12 h-12 bg-accent hover:brightness-110 active:scale-95 text-bgBase rounded-full shadow-[0_4px_20px_rgba(255,107,0,0.4)] flex items-center justify-center transition-all cursor-pointer border border-accent/25"
          title="Quick Log Execution"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </motion.button>
        
      </div>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <PlanGateProvider>
          <AppContent />
        </PlanGateProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
