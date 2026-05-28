import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import TradoxLogo from './TradoxLogo';
import { 
  ClipboardList, 
  History, 
  BarChart3, 
  Zap, 
  LogOut,
  User,
  X,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Target,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentTab, 
  setCurrentTab, 
  isCollapsed, 
  setIsCollapsed 
}) => {
  const { user, signOut, userPlan, profileSettings, updateProfileSettings } = useAuth();
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const desktopCardRef = useRef<HTMLDivElement>(null);
  const mobileCardRef = useRef<HTMLDivElement>(null);
  const desktopTriggerRef = useRef<HTMLButtonElement>(null);
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);

  // Close profile card on clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        (desktopCardRef.current && desktopCardRef.current.contains(target)) ||
        (mobileCardRef.current && mobileCardRef.current.contains(target)) ||
        (desktopTriggerRef.current && desktopTriggerRef.current.contains(target)) ||
        (mobileTriggerRef.current && mobileTriggerRef.current.contains(target))
      ) {
        return;
      }
      setShowProfileCard(false);
    };
    if (showProfileCard) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileCard]);

  // Reset confirmation when profile card opens/closes
  useEffect(() => {
    if (!showProfileCard) {
      setConfirmLogout(false);
    }
  }, [showProfileCard]);

  // Nav items for desktop & mobile bottom nav
  const navItems = [
    { id: 'daily', label: 'Daily Log', icon: ClipboardList },
    { id: 'history', label: 'History', icon: History },
    { id: 'weekly', label: 'Weekly', icon: BarChart3 },
    { id: 'monthly', label: 'Monthly', icon: Calendar },
    { id: 'strategies', label: 'Strategies', icon: Target },
  ];

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside 
        className={`hidden md:flex flex-col h-screen bg-bgSurface fixed left-0 top-0 z-30 select-none border-r border-customBorder/30 transition-all duration-[250ms] cubic-bezier(0.4, 0, 0.2, 1) ${
          isCollapsed ? 'w-16' : 'w-60'
        }`}
      >
        {/* Collapse Toggle Button (Desktop Only, min-width: 1024px) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute top-5 -right-3.5 z-40 w-7 h-7 bg-bgSurface border border-customBorder hover:border-accent/40 rounded-full items-center justify-center text-textSecondary hover:text-accent shadow-md transition-all duration-150 active:scale-95 hidden lg:flex"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
          )}
        </button>

        {/* Brand Logo Header */}
        <div className={`p-6 flex transition-all duration-200 border-b border-customBorder/20 ${
          isCollapsed ? 'items-center justify-center px-2 py-5' : 'items-center justify-start gap-2.5'
        }`}>
          {isCollapsed ? (
            <TradoxLogo size={28} />
          ) : (
            <>
              <TradoxLogo size={28} />
              <div className="flex flex-col gap-0.5">
                <h1 id="brand-logo" className="font-syne text-[16px] font-bold text-accent tracking-[0.18em] leading-none m-0 uppercase">
                  TRADOX
                </h1>
                <span className="font-syne text-[8px] font-semibold text-textMuted tracking-[0.12em]">
                  TRADE JOURNAL
                </span>
              </div>
            </>
          )}
        </div>

        {/* Navigation Middle */}
        <nav className="flex-1 px-3 py-6 flex flex-col gap-1.5 overflow-y-auto scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => {
                  setCurrentTab(item.id);
                  setShowProfileCard(false);
                }}
                className={`group flex items-center w-full h-10 px-3.5 rounded-xl text-left transition-all duration-150 relative cursor-pointer ${
                  isCollapsed ? 'justify-center' : 'gap-3'
                } ${
                  isActive 
                    ? 'text-accent bg-accentDim font-medium' 
                    : 'text-textSecondary hover:text-textPrimary hover:bg-bgElevated'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                {isActive && (
                  <div className="absolute left-0 top-[10px] bottom-[10px] w-[2.5px] bg-accent rounded-r" />
                )}
                
                <Icon className={`w-4 h-4 transition-colors shrink-0 ${isActive ? 'text-accent' : 'text-textSecondary group-hover:text-textPrimary'}`} />
                
                {/* Text Label fading out cleanly */}
                {!isCollapsed && (
                  <span className="font-syne text-[11.5px] uppercase tracking-[0.08em] whitespace-nowrap overflow-hidden text-ellipsis transition-opacity duration-150">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}

          {/* Bottom Nav Spacer */}
          <div className="flex-1" />

          {/* Premium "Upgrade" Tab Button */}
          <button
            onClick={() => {
              setCurrentTab('upgrade');
              setShowProfileCard(false);
            }}
            className={`group flex items-center w-full h-10 px-3.5 rounded-xl text-left transition-all duration-150 relative cursor-pointer ${
              isCollapsed ? 'justify-center' : 'gap-3'
            } ${
              currentTab === 'upgrade'
                ? 'text-accent bg-accentDim font-medium border border-accent/20'
                : 'text-textSecondary bg-accent/5 hover:text-textPrimary hover:bg-accent/10 border border-accent/10'
            }`}
            title={isCollapsed ? "Upgrade to Pro" : undefined}
          >
            <Zap className={`w-4 h-4 shrink-0 text-accent ${currentTab === 'upgrade' ? 'animate-pulse' : ''}`} />
            {!isCollapsed && (
              <span className="font-syne text-[11.5px] uppercase tracking-[0.08em] font-extrabold text-accent">
                Upgrade
              </span>
            )}
          </button>
        </nav>

        {/* User Card Bottom (Clicking opens popout card) */}
        {user && (
          <div className="relative p-4 border-t border-customBorder/30">
            
            {/* FLOATING PROFILE CARD POPUP */}
            <AnimatePresence>
              {showProfileCard && (
                <motion.div 
                  ref={desktopCardRef}
                  initial={{ opacity: 0, y: 15, scale: 0.94 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.94 }}
                  transition={{ type: 'spring', damping: 18, stiffness: 130 }}
                  className="absolute bottom-16 left-4 right-4 bg-bgOverlay border border-customBorder p-5 rounded-2xl shadow-2xl flex flex-col items-center gap-4 z-50"
                >
                  {/* Close Button */}
                  <button 
                    onClick={() => setShowProfileCard(false)}
                    className="absolute top-3.5 right-3.5 text-textSecondary hover:text-textPrimary transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Larger Synced User Avatar */}
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt="profile" 
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-full border border-accent/20 object-cover shadow-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-bgElevated border border-customBorder flex items-center justify-center">
                      <User className="w-8 h-8 text-textSecondary" />
                    </div>
                  )}

                  {/* Profile Meta details */}
                  <div className="flex flex-col items-center text-center">
                    <div className="flex items-center gap-1.5 justify-center">
                      <span className="font-syne text-[12px] text-textPrimary uppercase tracking-wider font-semibold truncate max-w-[100px]">
                        {user.displayName || 'TRADER'}
                      </span>
                      <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase leading-none shrink-0 ${
                        userPlan === 'pro'
                          ? 'bg-accent/10 text-accent border-accent/25'
                          : 'bg-textMuted/15 text-textMuted border-customBorder'
                      }`}>
                        {userPlan}
                      </span>
                    </div>
                    <span className="font-dmsans text-[11px] text-textSecondary mt-0.5 break-all max-w-[150px]">
                      {user.email}
                    </span>
                  </div>

                  {/* Edit Profile button */}
                  <button
                    onClick={() => {
                      setCurrentTab('profile');
                      setShowProfileCard(false);
                    }}
                    className="w-full h-9 bg-bgElevated border border-customBorder hover:bg-bgElevated/85 text-textPrimary rounded-xl font-syne text-[11px] uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-accent" />
                    Edit Profile
                  </button>

                  {/* Logout Action */}
                  {!confirmLogout ? (
                    <button
                      onClick={() => setConfirmLogout(true)}
                      className="w-full h-9 bg-redPnl/10 hover:bg-redPnl/20 border border-redPnl/30 text-redPnl rounded-xl font-syne text-[11px] uppercase tracking-wider transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Log Out
                    </button>
                  ) : (
                    <div className="flex flex-col gap-2 w-full text-center">
                      <span className="font-syne text-[10px] text-textSecondary uppercase tracking-wider">
                        Are you sure?
                      </span>
                      <div className="grid grid-cols-2 gap-2 w-full">
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await signOut();
                              setShowProfileCard(false);
                            } catch (err) {
                              console.error('Logout failed:', err);
                            }
                          }}
                          className="h-8 bg-redPnl hover:brightness-110 text-bgBase font-syne text-[10px] uppercase font-bold tracking-wider rounded-xl transition-all flex items-center justify-center font-bold cursor-pointer"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setConfirmLogout(false)}
                          className="h-8 bg-bgElevated hover:bg-bgElevated/85 border border-customBorder text-textSecondary font-syne text-[10px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center cursor-pointer"
                        >
                          No
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Theme Quick Toggle (Desktop only) */}
            <div className="px-1 mb-2">
              <button
                type="button"
                onClick={() => {
                  const nextTheme = (profileSettings?.theme || 'dark') === 'light' ? 'dark' : 'light';
                  updateProfileSettings({ theme: nextTheme });
                }}
                className={`flex items-center w-full h-10 px-3.5 rounded-xl transition-all duration-150 text-left hover:bg-bgElevated/50 cursor-pointer text-textSecondary hover:text-textPrimary ${
                  isCollapsed ? 'justify-center' : 'gap-3'
                }`}
                title={`Switch to ${(profileSettings?.theme || 'dark') === 'light' ? 'dark' : 'light'} mode`}
              >
                {(profileSettings?.theme || 'dark') === 'light' ? (
                  <Moon className="w-4 h-4 text-accent shrink-0" />
                ) : (
                  <Sun className="w-4 h-4 text-accent shrink-0" />
                )}
                {!isCollapsed && (
                  <span className="font-syne text-[11px] uppercase tracking-[0.08em] whitespace-nowrap overflow-hidden text-ellipsis">
                    {(profileSettings?.theme || 'dark') === 'light' ? 'Dark Mode' : 'Light Mode'}
                  </span>
                )}
              </button>
            </div>

            {/* Clickable Profile Button */}
            <button
              ref={desktopTriggerRef}
              onClick={() => setShowProfileCard(!showProfileCard)}
              className={`flex items-center w-full p-2 hover:bg-bgElevated/50 rounded-xl transition-colors text-left cursor-pointer ${
                isCollapsed ? 'justify-center' : 'gap-3'
              }`}
              title={isCollapsed ? (user.displayName || 'Trader') : undefined}
            >
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt="avatar" 
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full border border-customBorder shrink-0 object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-bgElevated border border-customBorder flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-textSecondary" />
                </div>
              )}
              {!isCollapsed && (
                <div className="flex flex-col min-w-0 flex-1 transition-opacity duration-150">
                  <span className="font-dmsans text-[11px] text-textPrimary font-medium truncate">
                    {user.displayName || 'Trader'}
                  </span>
                  <span className="font-dmsans text-[9px] text-textSecondary truncate">
                    {user.email}
                  </span>
                </div>
              )}
            </button>

          </div>
        )}
      </aside>

      {/* MOBILE BOTTOM NAV - Keeps original structure & untouched mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-[60px] bg-bgSurface border-t border-customBorder z-40 flex items-center justify-around px-4 select-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              id={`mob-nav-${item.id}`}
              onClick={() => {
                setCurrentTab(item.id);
                setShowProfileCard(false);
              }}
              className={`flex flex-col items-center justify-center w-12 h-12 transition-all relative ${
                isActive ? 'text-accent' : 'text-textSecondary'
              }`}
            >
              <Icon className="w-5 h-5" />
              {isActive && (
                <div className="absolute bottom-[2px] w-1 h-1 bg-accent rounded-full animate-pulse" />
              )}
            </button>
          );
        })}

        {/* Synced Avatar in Mobile bottom bar triggers Profile Card */}
        {user && (
          <button
            ref={mobileTriggerRef}
            onClick={() => setShowProfileCard(!showProfileCard)}
            className={`flex items-center justify-center w-12 h-12 transition-all rounded-full ${
              showProfileCard ? 'ring-2 ring-accent' : ''
            }`}
          >
            {user.photoURL ? (
              <img 
                src={user.photoURL} 
                alt="avatar" 
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-full border border-customBorder object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-textSecondary" />
            )}
          </button>
        )}

        {/* MOBILE BOTTOM SHEET FOR PROFILE */}
        <AnimatePresence>
          {showProfileCard && (
            <div 
              className="md:hidden fixed inset-0 z-50 flex items-end justify-center"
              onClick={() => setShowProfileCard(false)}
            >
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/75 backdrop-blur-[6px]"
              />

              {/* Sheet container */}
              <motion.div 
                ref={mobileCardRef}
                onClick={(e) => e.stopPropagation()}
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="w-full max-w-[480px] bg-bgOverlay border-t border-x border-customBorder p-6 pb-10 rounded-t-[28px] shadow-2xl flex flex-col items-center gap-5 relative z-10"
              >
                {/* Bottom Sheet Handlebar */}
                <div className="w-12 h-1 bg-textMuted/45 rounded-full mb-1" />

                <button 
                  onClick={() => setShowProfileCard(false)}
                  className="absolute top-5 right-5 text-textSecondary hover:text-textPrimary"
                >
                  <X className="w-4 h-4" />
                </button>

                {user?.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt="profile" 
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-full border border-accent/20 object-cover shadow-lg"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-bgElevated border border-customBorder flex items-center justify-center">
                    <User className="w-8 h-8 text-textSecondary" />
                  </div>
                )}

                <div className="flex flex-col items-center text-center">
                  <div className="flex items-center gap-1.5 justify-center">
                    <span className="font-syne text-[12px] text-textPrimary uppercase tracking-wider font-semibold">
                      {user?.displayName || 'TRADER'}
                    </span>
                    <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase leading-none shrink-0 ${
                      userPlan === 'pro'
                        ? 'bg-accent/10 text-accent border-accent/25'
                        : 'bg-textMuted/15 text-textMuted border-customBorder'
                    }`}>
                      {userPlan}
                    </span>
                  </div>
                  <span className="font-dmsans text-[11px] text-textSecondary mt-0.5 break-all">
                    {user?.email}
                  </span>
                </div>

                {/* Mobile Quick Theme Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    const nextTheme = (profileSettings?.theme || 'dark') === 'light' ? 'dark' : 'light';
                    updateProfileSettings({ theme: nextTheme });
                  }}
                  className="w-full h-11 bg-bgElevated border border-customBorder hover:bg-bgElevated/85 text-textPrimary rounded-xl font-syne text-[11px] uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {(profileSettings?.theme || 'dark') === 'light' ? (
                    <>
                      <Moon className="w-3.5 h-3.5 text-accent" />
                      Dark Mode
                    </>
                  ) : (
                    <>
                      <Sun className="w-3.5 h-3.5 text-accent" />
                      Light Mode
                    </>
                  )}
                </button>

                {/* Edit Profile Action */}
                <button
                  onClick={() => {
                    setCurrentTab('profile');
                    setShowProfileCard(false);
                  }}
                  className="w-full h-11 bg-bgElevated border border-customBorder hover:bg-bgElevated/85 text-textPrimary rounded-xl font-syne text-[11px] uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-accent" />
                  Edit Profile
                </button>

                {/* Logout Action */}
                {!confirmLogout ? (
                  <button
                    onClick={() => setConfirmLogout(true)}
                    className="w-full h-11 bg-redPnl/10 hover:bg-redPnl/20 border border-redPnl/30 text-redPnl rounded-xl font-syne text-[11px] uppercase tracking-wider transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Log Out
                  </button>
                ) : (
                  <div className="flex flex-col gap-2.5 w-full text-center">
                    <span className="font-syne text-[10px] text-textSecondary uppercase tracking-wider">
                      Are you sure?
                    </span>
                    <div className="grid grid-cols-2 gap-2.5 w-full">
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            await signOut();
                            setShowProfileCard(false);
                          } catch (err) {
                            console.error('Logout failed:', err);
                          }
                        }}
                        className="h-11 bg-redPnl hover:brightness-110 text-bgBase font-syne text-[11px] uppercase font-bold tracking-wider rounded-xl transition-all flex items-center justify-center font-bold cursor-pointer"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setConfirmLogout(false)}
                        className="h-11 bg-bgElevated hover:bg-bgElevated/85 border border-customBorder text-textSecondary font-syne text-[11px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center cursor-pointer"
                      >
                        No
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default Sidebar;
