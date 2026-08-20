import React, { useState } from 'react';
import { PlanTier } from '../types';
import { PLANS } from '../data/plansData';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'signup';
  initialPlan?: PlanTier;
  onClose: () => void;
  onSuccess: (plan?: PlanTier) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  initialPlan = 'starter',
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [selectedPlan, setSelectedPlan] = useState<PlanTier>(
    initialPlan === 'starter' || initialPlan === 'growth' || initialPlan === 'scale' ? initialPlan : 'starter'
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Sync mode and plan when props change
  React.useEffect(() => {
    setMode(initialMode);
    if (initialPlan && (initialPlan === 'starter' || initialPlan === 'growth' || initialPlan === 'scale')) {
      setSelectedPlan(initialPlan);
    }
  }, [initialMode, initialPlan]);

  if (!isOpen) return null;

  const planInfo = PLANS[selectedPlan] || PLANS.starter;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const { error: authError } =
        mode === 'signup'
          ? await supabase.auth.signUp({ email, password })
          : await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      onSuccess(selectedPlan);
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      if (authError) throw authError;
      // Browser redirects to Google; session is picked up on return.
    } catch (err: any) {
      setError(err?.message || 'Google sign-in failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#ffffff] rounded-[9px] p-6 sm:p-8 border border-[#0a2414]/10 shadow-2xl relative text-[#0a2414] animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 px-2.5 py-1 text-[13px] rounded-[6px] hover:bg-[#f9f6f1] text-[#607166] transition-colors"
          aria-label="Close modal"
        >
          Close
        </button>

        <div className="text-center mb-5">
          <h2 className="text-[28px] font-semibold tracking-[-0.03em] text-[#0a2414] mb-1">
            clerk
          </h2>
          <p className="text-[14px] text-[#607166]">
            {mode === 'signup'
              ? 'Create your account to start watching for buying signals.'
              : 'Welcome back. Sign in to your outreach dashboard.'}
          </p>

          {mode === 'signup' && (
            <div
              className={`mt-3 p-2.5 rounded-[8px] flex items-center justify-between text-[12.5px] border ${
                selectedPlan === 'starter'
                  ? 'bg-[#f3fbe9] border-[#17b267]/30'
                  : 'bg-[#fafaf9] border-[#0a2414]/10'
              }`}
            >
              {selectedPlan === 'starter' ? (
                <>
                  <div className="text-left">
                    <span className="font-semibold text-[#0a2414]">7-day free trial on Starter</span>
                    <span className="block text-[#607166] text-[11.5px]">${planInfo.price}/mo on day 8 • Cancel anytime</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-[4px] bg-[#1ad379] text-[#0a2414] font-bold text-[10.5px] uppercase">
                    Free Trial
                  </span>
                </>
              ) : (
                <>
                  <div className="text-left">
                    <span className="font-semibold text-[#0a2414]">{planInfo.name} Plan</span>
                    <span className="block text-[#607166] text-[11.5px]">${planInfo.price}/month • Cancel anytime</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-[4px] bg-[#0a2414]/5 text-[#0a2414] font-semibold text-[10.5px]">
                    Billed Monthly
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 rounded-[6px] border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700">
            {error}
          </div>
        )}

        {/* Google Continue */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={isLoading}
          className="w-full flex items-center justify-center space-x-3 py-2.5 px-4 rounded-[6px] border border-[#0a2414]/15 bg-[#ffffff] hover:bg-[#f9f6f1] text-[#0a2414] text-[14px] font-medium transition-colors mb-5 shadow-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative mb-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#0a2414]/10" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase">
            <span className="bg-[#ffffff] px-2 text-[#607166]">Or with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-[#0a2414] mb-1">
              Work email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full px-3.5 py-2 rounded-[6px] border border-[#0a2414]/15 bg-[#ffffff] focus:border-[#17b267] focus:ring-1 focus:ring-[#17b267] text-[14px] text-[#0a2414] outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[13px] font-medium text-[#0a2414]">
                Password
              </label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => alert('Password reset instructions sent to your email.')}
                  className="text-[12px] text-[#17b267] hover:underline"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2 rounded-[6px] border border-[#0a2414]/15 bg-[#ffffff] focus:border-[#17b267] focus:ring-1 focus:ring-[#17b267] text-[14px] text-[#0a2414] outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-[6px] bg-[#1ad379] hover:bg-[#17b267] text-[#0a2414] text-[14px] font-medium tracking-tight transition-all active:scale-[0.98] shadow-sm flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-[#0a2414] border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <span>{mode === 'signup' ? 'Create account' : 'Log in'}</span>
            )}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-[#0a2414]/8 text-center text-[13px] text-[#607166]">
          {mode === 'signup' ? (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-medium text-[#0a2414] hover:text-[#17b267] underline"
              >
                Log in
              </button>
            </p>
          ) : (
            <p>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="font-medium text-[#0a2414] hover:text-[#17b267] underline"
              >
                Sign up
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
