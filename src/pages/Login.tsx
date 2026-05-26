import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Mail, Lock, Flame, X } from 'lucide-react';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfService from './TermsOfService';

const Login: React.FC = () => {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const { showToast } = useToast();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeDoc, setActiveDoc] = useState<'privacy' | 'terms' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      showToast('Please fill in all credentials.', 'error');
      return;
    }

    if (isSignUp && !agreeToTerms) {
      showToast('You must agree to the Terms of Service and Privacy Policy to register.', 'error');
      return;
    }
    
    setSubmitting(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
        showToast('Account successfully registered.', 'success');
      } else {
        await signInWithEmail(email, password);
        showToast('Welcome back to Tradox Journal.', 'success');
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Authentication failed. Please verify credentials.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (isSignUp && !agreeToTerms) {
      showToast('You must agree to the Terms of Service and Privacy Policy to register.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await signInWithGoogle();
      showToast('Google OAuth success.', 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Google Auth failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bgBase flex items-center justify-center p-4 select-none relative overflow-hidden">
      
      {/* Absolute subtle background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-accent/5 blur-[130px] rounded-full pointer-events-none" />

      {/* Main card box is deeply curved (rounded-3xl) for a premium state-of-the-art visual style */}
      <div className="w-full max-w-[440px] bg-bgSurface p-8 rounded-3xl border border-customBorder relative z-10 flex flex-col gap-6">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-1.5">
          <div className="flex items-center gap-2 text-accent">
            <Flame className="w-6 h-6 animate-pulse" />
            <h1 className="font-syne text-[24px] font-bold tracking-[0.25em] leading-none m-0">
              TRADOX
            </h1>
          </div>
          <p className="font-syne text-[10px] text-textSecondary uppercase tracking-[0.15em]">
            Precision Trading Journal
          </p>
        </div>

        {/* Form Auth */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email field */}
          <div className="flex flex-col gap-1.5">
            <label className="font-syne text-[10px] text-textSecondary uppercase tracking-[0.12em]" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-[13px] w-5 h-5 text-textMuted" />
              <input
                id="email"
                type="email"
                required
                disabled={submitting}
                placeholder="trader@tradox.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 pl-11 pr-4 bg-bgElevated border border-customBorder rounded-xl font-dmsans text-[13px] text-textPrimary placeholder:text-textMuted outline-none focus:border-accent focus:ring-4 focus:ring-accentGlow transition-all duration-200"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="flex flex-col gap-1.5">
            <label className="font-syne text-[10px] text-textSecondary uppercase tracking-[0.12em]" htmlFor="password">
              Security Key
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-[13px] w-5 h-5 text-textMuted" />
              <input
                id="password"
                type="password"
                required
                disabled={submitting}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 pl-11 pr-4 bg-bgElevated border border-customBorder rounded-xl font-dmsans text-[13px] text-textPrimary placeholder:text-textMuted outline-none focus:border-accent focus:ring-4 focus:ring-accentGlow transition-all duration-200"
              />
            </div>
          </div>

          {/* Force-accept Checkbox at registration */}
          {isSignUp && (
            <div className="flex items-start gap-2.5 mt-1 select-none">
              <input
                id="terms"
                type="checkbox"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="w-4.5 h-4.5 accent-accent mt-0.5 rounded border border-customBorder focus:ring-0 cursor-pointer"
              />
              <label htmlFor="terms" className="font-dmsans text-[11px] text-textSecondary leading-snug cursor-pointer">
                I agree to the{' '}
                <button
                  type="button"
                  onClick={() => setActiveDoc('terms')}
                  className="text-accent hover:underline font-semibold"
                >
                  Terms of Service
                </button>{' '}
                and{' '}
                <button
                  type="button"
                  onClick={() => setActiveDoc('privacy')}
                  className="text-accent hover:underline font-semibold"
                >
                  Privacy Policy
                </button>
              </label>
            </div>
          )}

          {/* Primary Action Button - Curved (rounded-xl) */}
          <button
            type="submit"
            id="auth-submit-btn"
            disabled={submitting}
            className="w-full h-11 mt-2 bg-accent hover:brightness-110 active:scale-[0.98] text-bgBase font-syne text-[13px] font-semibold uppercase tracking-[0.1em] rounded-xl transition-all duration-150 flex items-center justify-center font-bold"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-bgBase border-t-transparent rounded-full animate-spin"></div>
            ) : (
              isSignUp ? 'register' : 'login'
            )}
          </button>
        </form>

        <div className="flex items-center justify-center text-center border-t border-customBorder/50 pt-4">
          <button
            type="button"
            id="auth-toggle-mode"
            disabled={submitting}
            onClick={() => {
              setIsSignUp(!isSignUp);
              setAgreeToTerms(false);
            }}
            className="font-dmsans text-[12px] text-textSecondary hover:text-accent transition-colors duration-150 uppercase tracking-wider"
          >
            {isSignUp ? 'already registered? login' : 'new trader? register'}
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-[1px] bg-customBorder" />
          <span className="font-syne text-[9px] text-textMuted uppercase tracking-wider">OR GOOGLE OAUTH</span>
          <div className="flex-1 h-[1px] bg-customBorder" />
        </div>

        {/* Google OAuth Wrapper */}
        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            id="google-auth-btn"
            disabled={submitting}
            onClick={handleGoogleLogin}
            className="w-full h-11 border border-accent/35 bg-transparent hover:bg-accentDim active:scale-[0.98] text-accent font-syne text-[13px] font-semibold uppercase tracking-[0.1em] rounded-xl transition-all duration-150 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5 shrink-0 fill-current" viewBox="0 0 24 24">
              <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.94 5.94 0 0 1 8 12.57c0-3.3 2.64-5.97 5.99-5.97 1.54 0 2.94.57 4 1.51l3.23-3.23C19.26 2.97 16.74 2 14 2 8.16 2 3.43 6.73 3.43 12.57s4.73 10.57 10.57 10.57c6.14 0 10.14-4.31 10.14-10.3 0-.69-.06-1.2-.18-1.56H12.24z"/>
            </svg>
            Google Sign In / Sign Up
          </button>
        </div>

      </div>

      {/* OVERLAY MODAL FOR LEGAL DOCUMENTS */}
      {activeDoc && (
        <div className="fixed inset-0 bg-bgBase/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-bgSurface border border-customBorder rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col relative shadow-2xl overflow-hidden animate-pulse-subtle">
            <button
              onClick={() => setActiveDoc(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-xl bg-bgElevated border border-customBorder/60 flex items-center justify-center text-textSecondary hover:text-textPrimary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex-1 overflow-y-auto p-6 md:p-8 scrollbar-none">
              {activeDoc === 'privacy' ? <PrivacyPolicy /> : <TermsOfService />}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Login;
