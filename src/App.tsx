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

function AppContent() {
  const [currentTab, setCurrentTab] = useState('daily');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });

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
        return <Profile />;
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
