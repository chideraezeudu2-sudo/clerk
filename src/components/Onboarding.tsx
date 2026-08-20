import React, { useState } from 'react';
import { OnboardingState, ViewMode } from '../types';
import { apiFetch } from '../lib/api';

interface OnboardingProps {
  onComplete: () => void;
  onNavigate: (view: ViewMode) => void;
}

// Authentic SVG Vector Logos
export const Logos = {
  Google: () => (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
  ),
  Gmail: () => (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
      <path fill="#EA4335" d="M12 13.5L1.5 5.5V19.5C1.5 20.33 2.17 21 3 21H6V11.5L12 16L18 11.5V21H21C21.83 21 22.5 20.33 22.5 19.5V5.5L12 13.5Z" />
      <path fill="#4285F4" d="M22.5 5.5L18 9V4.5C18 3.67 18.67 3 19.5 3H21C21.83 3 22.5 3.67 22.5 4.5V5.5Z" />
      <path fill="#FBBC05" d="M1.5 5.5L6 9V4.5C6 3.67 5.33 3 4.5 3H3C2.17 3 1.5 3.67 1.5 4.5V5.5Z" />
      <path fill="#34A853" d="M18 9L12 13.5L6 9V4.5L12 9L18 4.5V9Z" />
    </svg>
  ),
  Outlook: () => (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
      <path fill="#0078D4" d="M22.5 6.5v11c0 1.38-1.12 2.5-2.5 2.5h-10V4H20c1.38 0 2.5 1.12 2.5 2.5z" />
      <path fill="#28A8EA" d="M10 4H2.5C1.12 4 0 5.12 0 6.5v11C0 18.88 1.12 20 2.5 20H10V4z" />
      <circle cx="6.5" cy="12" r="3.5" fill="#ffffff" />
      <path fill="#0078D4" d="M6.5 10a2 2 0 100 4 2 2 0 000-4z" />
    </svg>
  ),
  Microsoft: () => (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
      <path fill="#f25022" d="M1 1h10v10H1z" />
      <path fill="#00a4ef" d="M1 13h10v10H1z" />
      <path fill="#7fba00" d="M13 1h10v10H13z" />
      <path fill="#ffb900" d="M13 13h10v10H13z" />
    </svg>
  ),
  LinkedIn: () => (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="#0A66C2">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  ),
  GitHub: () => (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="#0a2414">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  ),
  Stripe: () => (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="#635BFF">
      <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.97 15.654.4 12.443.4 6.721.4 2.656 3.407 2.656 8.35c0 6.64 8.784 5.992 8.784 9.176 0 .977-.858 1.488-2.28 1.488-2.271 0-5.31-1.127-7.23-2.138L1 22.42c1.921 1.07 5.176 1.78 8.872 1.78 6.035 0 10.37-2.932 10.37-8.118 0-7.065-8.868-6.196-8.868-9.176z" />
    </svg>
  ),
  Supabase: () => (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
      <path
        d="M13.43 2.115c-.714-.952-2.175-.446-2.175.753v8.528H2.867c-1.199 0-1.799 1.45-.95 2.298l9.692 9.692c.714.952 2.175.446 2.175-.753V14.105h8.388c1.199 0 1.799-1.45.95-2.298L13.43 2.115z"
        fill="#3ECF8E"
      />
    </svg>
  ),
  Linear: () => (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="#5E6AD2">
      <path d="M2.5 12C2.5 6.753 6.753 2.5 12 2.5c2.348 0 4.502.85 6.172 2.268L3.768 19.172A9.458 9.458 0 012.5 12zm1.66 8.768L18.572 6.36A9.458 9.458 0 0121.5 12c0 5.247-4.253 9.5-9.5 9.5a9.458 9.458 0 01-7.84-4.232z" />
    </svg>
  ),
  Notion: () => (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="#000000">
      <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l11.082-.699c.327 0 .093-.28-.094-.42l-2.052-1.54c-.56-.42-1.306-.793-2.612-.699L3.06 2.062c-.42.047-.513.28-.326.466l1.725 1.68zm-.373 3.639v12.783c0 .84.42 1.166 1.306 1.12l12.482-.746c.886-.047 1.073-.606 1.073-1.306V7.054c0-.7-.327-.98-1.026-.933l-12.762.793c-.7.047-1.073.327-1.073.933zm11.87 1.54c.094.42 0 .84-.42.887l-.746.14v7.745c-.466.28-.933.466-1.353.466-.653 0-.98-.28-1.493-1.073l-4.246-6.625v6.579l1.4.327c.047.42-.14.793-.56.84l-2.846.186c-.094-.42.14-.84.56-.887l.84-.186V9.897l-1.12-.093c-.047-.42.186-.793.606-.84l2.8-.187 4.526 6.952V9.897l-1.026-.14c-.047-.42.233-.793.653-.84l2.846-.187c.093 0 .14.28.186.606z" />
    </svg>
  ),
};

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onNavigate }) => {
  const [state, setState] = useState<OnboardingState>({
    currentStep: 1,
    mailboxEmail: '',
    mailboxPassword: '',
    isMailboxConnected: false,
    mailingAddress: '',
    personaName: '',
    personaDescription: '',
    personaWebsite: '',
    targetAudience: '',
    voiceSample: '',
    voiceTone: 'casual',
    isCompleted: false,
  });

  const [provider, setProvider] = useState<'gmail' | 'outlook'>('gmail');
  const [showAppPassHelp, setShowAppPassHelp] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeSignalPicks, setActiveSignalPicks] = useState<string[]>([]);

  const handleConnectMailbox = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);
    setError('');
    try {
      // Verify + save the mailbox via the senders endpoint
      await apiFetch('/api/senders', {
        method: 'POST',
        body: { email: state.mailboxEmail, password: state.mailboxPassword, provider },
      });
      setState((prev) => ({ ...prev, isMailboxConnected: true }));
    } catch (err: any) {
      setError(err?.message || 'Could not connect mailbox. For Gmail use a 16-character App Password.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleNext = () => {
    setError('');
    if (state.currentStep === 5) {
      submitOnboarding();
    } else {
      setState((prev) => ({ ...prev, currentStep: prev.currentStep + 1 }));
    }
  };

  const submitOnboarding = async () => {
    setIsSaving(true);
    setError('');
    try {
      await apiFetch('/api/onboarding', {
        method: 'POST',
        body: {
          mailboxEmail: state.mailboxEmail,
          mailboxPassword: state.mailboxPassword,
          provider,
          mailingAddress: state.mailingAddress,
          personaName: state.personaName,
          personaDescription: state.personaDescription,
          personaWebsite: state.personaWebsite,
          targetAudience: state.targetAudience,
          voiceSample: state.voiceSample,
          voiceTone: state.voiceTone,
        },
      });
      setState((prev) => ({ ...prev, isCompleted: true }));
    } catch (err: any) {
      setError(err?.message || 'Could not finish setup. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (state.currentStep > 1) {
      setState((prev) => ({ ...prev, currentStep: prev.currentStep - 1 }));
    }
  };

  const toggleSignal = (sig: string) => {
    setActiveSignalPicks((prev) =>
      prev.includes(sig) ? prev.filter((s) => s !== sig) : [...prev, sig]
    );
  };

  return (
    <div className="min-h-screen bg-[#f3fbe9]/50 py-10 px-4 sm:px-6 text-[#0a2414] flex flex-col justify-between">
      {/* Top Header */}
      <div className="max-w-[680px] mx-auto w-full mb-8">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => onNavigate('landing')}
            className="text-[23px] font-semibold tracking-[-0.04em] text-[#0a2414] hover:opacity-85 transition-opacity inline-flex items-baseline"
          >
            <span>clerk</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#1ad379] inline-block ml-0.5 mb-0.5" />
          </button>
          {!state.isCompleted && (
            <div className="flex items-center space-x-2 text-[13px] text-[#607166]">
              <span>Step {state.currentStep} of 5</span>
              <span className="text-[#0a2414]/20">•</span>
              <span className="font-medium text-[#0a2414]">
                {state.currentStep === 1 && 'Connect Mailbox'}
                {state.currentStep === 2 && 'Mailing Compliance'}
                {state.currentStep === 3 && 'Persona Setup'}
                {state.currentStep === 4 && 'Signal Targets'}
                {state.currentStep === 5 && 'Tone & Voice'}
              </span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {!state.isCompleted && (
          <div className="w-full bg-[#0a2414]/10 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#1ad379] h-full transition-all duration-300 rounded-full"
              style={{ width: `${(state.currentStep / 5) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Main Form Card Container */}
      <div className="max-w-[680px] mx-auto w-full bg-[#ffffff] border border-[#0a2414]/10 rounded-[9px] p-6 sm:p-10 shadow-[0_20px_40px_-10px_rgba(10,36,20,0.06)]">
        {state.isCompleted ? (
          /* ALL SET DONE SCREEN */
          <div className="text-center space-y-6 py-4">
            <div className="w-12 h-12 rounded-full bg-[#f3fbe9] border border-[#17b267]/30 text-[#17b267] flex items-center justify-center mx-auto text-[20px] font-semibold">
              ✓
            </div>

            <div className="space-y-2">
              <h1 className="text-[28px] sm:text-[34px] font-medium tracking-tight text-[#0a2414]">
                You're all set up.
              </h1>
              <p className="text-[16px] text-[#283a2e] max-w-[500px] mx-auto leading-relaxed">
                clerk is now watching live hiring triggers and funding filings. Head to your review queue to inspect your first drafted leads.
              </p>
            </div>

            <div className="p-4 rounded-[6px] bg-[#f9f6f1] border border-[#0a2414]/8 max-w-[480px] mx-auto text-left text-[13px] space-y-2">
              <div className="text-[#17b267] font-semibold flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-[#1ad379]" />
                <span>Initial Signals Engine Active</span>
              </div>
              <p className="text-[#607166]">
                {state.isMailboxConnected
                  ? <>Connected mailbox: <span className="text-[#0a2414] font-medium">{state.mailboxEmail}</span> (Safe ramp rate: 15/day limit).</>
                  : 'Mailbox not connected yet — you can add one later from the Senders tab.'}
              </p>
              <div className="pt-2 border-t border-[#0a2414]/6 flex items-center justify-between text-[12px] text-[#607166]">
                <span>{state.mailingAddress ? 'Mailing compliance attached' : 'Mailing address not set'}</span>
                {state.mailingAddress && <span className="text-[#17b267] font-medium">CAN-SPAM Verified</span>}
              </div>
            </div>

            <button
              onClick={onComplete}
              className="px-8 py-3.5 rounded-[6px] bg-[#1ad379] hover:bg-[#17b267] text-[#0a2414] text-[15px] font-medium tracking-tight transition-all active:scale-[0.98] shadow-sm mx-auto"
            >
              Go to dashboard
            </button>
          </div>
        ) : (
          <div>
            {/* STEP 1: Connect Mailbox with Provider Selection & Real Logos */}
            {state.currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-[24px] sm:text-[28px] font-medium tracking-tight text-[#0a2414] mb-2">
                    Connect your sender mailbox
                  </h1>
                  <p className="text-[15px] text-[#283a2e]">
                    clerk dispatches directly from your native mailbox with dedicated IP isolation. Connect one to get started.
                  </p>
                </div>

                {!state.isMailboxConnected ? (
                  <>
                    {/* Mailbox Provider Selection (Only shown when not yet connected) */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setProvider('gmail')}
                        className={`p-3.5 rounded-[8px] border text-left flex items-center space-x-3 transition-all ${
                          provider === 'gmail'
                            ? 'border-[#17b267] bg-[#f3fbe9] text-[#0a2414] ring-1 ring-[#17b267]'
                            : 'border-[#0a2414]/15 bg-[#ffffff] text-[#607166] hover:border-[#0a2414]/30'
                        }`}
                      >
                        <Logos.Gmail />
                        <div>
                          <div className="font-medium text-[14px] text-[#0a2414]">Google / Gmail</div>
                          <div className="text-[11px] text-[#607166]">Google Workspace & @gmail</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setProvider('outlook')}
                        className={`p-3.5 rounded-[8px] border text-left flex items-center space-x-3 transition-all ${
                          provider === 'outlook'
                            ? 'border-[#17b267] bg-[#f3fbe9] text-[#0a2414] ring-1 ring-[#17b267]'
                            : 'border-[#0a2414]/15 bg-[#ffffff] text-[#607166] hover:border-[#0a2414]/30'
                        }`}
                      >
                        <Logos.Outlook />
                        <div>
                          <div className="font-medium text-[14px] text-[#0a2414]">Office 365 / Outlook</div>
                          <div className="text-[11px] text-[#607166]">Microsoft Exchange</div>
                        </div>
                      </button>
                    </div>

                    <form onSubmit={handleConnectMailbox} className="space-y-4">
                      {error && (
                        <div className="rounded-[6px] border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700">
                          {error}
                        </div>
                      )}
                      <div>
                        <label className="block text-[13px] font-medium text-[#0a2414] mb-1">
                          {provider === 'gmail' ? 'Google Workspace / Gmail Address' : 'Outlook / Exchange Address'}
                        </label>
                        <input
                          type="email"
                          required
                          value={state.mailboxEmail}
                          onChange={(e) =>
                            setState({ ...state, mailboxEmail: e.target.value })
                          }
                          placeholder="you@company.com"
                          className="w-full px-3.5 py-2.5 rounded-[6px] border border-[#0a2414]/15 focus:border-[#17b267] focus:ring-1 focus:ring-[#17b267] text-[14px] text-[#0a2414] outline-none"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[13px] font-medium text-[#0a2414]">
                            {provider === 'gmail' ? 'Google App Password (16 characters)' : 'App-Specific Password'}
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowAppPassHelp(!showAppPassHelp)}
                            className="text-[12px] text-[#17b267] hover:underline"
                          >
                            How to generate an app password
                          </button>
                        </div>
                        <input
                          type="password"
                          required
                          value={state.mailboxPassword}
                          onChange={(e) =>
                            setState({ ...state, mailboxPassword: e.target.value })
                          }
                          placeholder="xxxx xxxx xxxx xxxx"
                          className="w-full px-3.5 py-2.5 rounded-[6px] border border-[#0a2414]/15 focus:border-[#17b267] focus:ring-1 focus:ring-[#17b267] text-[14px] text-[#0a2414] outline-none"
                        />
                      </div>

                      {showAppPassHelp && (
                        <div className="p-4 rounded-[6px] bg-[#f9f6f1] border border-[#0a2414]/10 text-[13px] text-[#283a2e] space-y-1.5">
                          <p className="font-medium text-[#0a2414]">Quick 30-second setup:</p>
                          <ol className="list-decimal pl-4 space-y-1 text-[#607166]">
                            <li>Turn on 2-Step Verification if it's off (Google Account → Security).</li>
                            <li>Go to <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="text-[#17b267] underline">myaccount.google.com/apppasswords</a> — you can't reach it from the menus anymore.</li>
                            <li>Name it "clerk", click Create, and paste the 16-character code here.</li>
                          </ol>
                        </div>
                      )}

                      <div className="p-3 bg-[#f9f6f1] rounded-[6px] border border-[#0a2414]/8 flex items-center justify-between text-[12px] text-[#607166]">
                        <span>Zero shared IP pools • 14-day automated warm-up ramp</span>
                        <span className="text-[#17b267] font-medium">Safe Sending</span>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <button
                          type="button"
                          onClick={() => onNavigate('landing')}
                          className="text-[14px] font-medium text-[#607166] hover:text-[#0a2414]"
                        >
                          ← Back to home
                        </button>
                        <button
                          type="submit"
                          disabled={isConnecting}
                          className="px-6 py-2.5 rounded-[6px] bg-[#1ad379] hover:bg-[#17b267] text-[#0a2414] text-[14px] font-medium tracking-tight transition-all active:scale-[0.98] shadow-sm flex items-center justify-center space-x-2"
                        >
                          {isConnecting ? (
                            <span>Verifying credentials...</span>
                          ) : (
                            <span>Connect mailbox</span>
                          )}
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  /* ONLY the single connected provider is shown once connected */
                  <div className="space-y-6">
                    <div className="p-4 rounded-[8px] bg-[#f3fbe9] border border-[#17b267]/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {provider === 'gmail' ? <Logos.Gmail /> : <Logos.Outlook />}
                          <div>
                            <div className="font-medium text-[14px] text-[#0a2414] flex items-center space-x-2">
                              <span>{provider === 'gmail' ? 'Google Workspace / Gmail' : 'Office 365 / Outlook'}</span>
                              <span className="px-1.5 py-0.5 rounded bg-[#1ad379] text-[#0a2414] text-[11px] font-semibold">
                                Connected
                              </span>
                            </div>
                            <div className="text-[13px] text-[#283a2e] font-medium">{state.mailboxEmail}</div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setState((prev) => ({ ...prev, isMailboxConnected: false }))}
                          className="text-[12px] font-medium text-[#607166] hover:text-[#0a2414] underline"
                        >
                          Change
                        </button>
                      </div>

                      <div className="pt-2 border-t border-[#17b267]/20 flex items-center justify-between text-[12px] text-[#283a2e]">
                        <span>Initial warm-up ramp: <strong>15 sends/day limit</strong></span>
                        <span className="text-[#17b267] font-semibold">Health Score: 100%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        onClick={() => onNavigate('landing')}
                        className="text-[14px] font-medium text-[#607166] hover:text-[#0a2414]"
                      >
                        ← Back to home
                      </button>

                      <button
                        onClick={handleNext}
                        className="px-8 py-3 rounded-[6px] bg-[#1ad379] hover:bg-[#17b267] text-[#0a2414] text-[14px] font-medium tracking-tight transition-all active:scale-[0.98] shadow-sm"
                      >
                        Save and continue to Step 2
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: Add Mailing Address */}
            {state.currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-[24px] sm:text-[28px] font-medium tracking-tight text-[#0a2414] mb-2">
                    Add your legal mailing address
                  </h1>
                  <p className="text-[15px] text-[#283a2e]">
                    This appears in the physical compliance footer of every dispatched email. Required by CAN-SPAM and GDPR.
                  </p>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#0a2414] mb-1">
                    Physical business address or registered virtual mailbox
                  </label>
                  <textarea
                    rows={3}
                    value={state.mailingAddress}
                    onChange={(e) =>
                      setState({ ...state, mailingAddress: e.target.value })
                    }
                    placeholder="123 Market St, Suite 400, San Francisco, CA 94103"
                    className="w-full px-3.5 py-2.5 rounded-[6px] border border-[#0a2414]/15 focus:border-[#17b267] focus:ring-1 focus:ring-[#17b267] text-[14px] text-[#0a2414] outline-none"
                  />
                  <span className="text-[12px] text-[#607166] mt-1 block">
                    clerk automatically attaches this along with a 1-click opt-out line to protect your mailbox deliverability.
                  </span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#0a2414]/10">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="text-[14px] font-medium text-[#607166] hover:text-[#0a2414]"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-2.5 rounded-[6px] bg-[#1ad379] hover:bg-[#17b267] text-[#0a2414] text-[14px] font-medium"
                  >
                    Save and continue
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Set up Persona (Presets removed as requested) */}
            {state.currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-[24px] sm:text-[28px] font-medium tracking-tight text-[#0a2414] mb-2">
                    Set up your persona
                  </h1>
                  <p className="text-[15px] text-[#283a2e]">
                    A persona defines who you represent: your product, value proposition, and landing page.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[13px] font-medium text-[#0a2414] mb-1">
                      Company or product name
                    </label>
                    <input
                      type="text"
                      value={state.personaName}
                      onChange={(e) =>
                        setState({ ...state, personaName: e.target.value })
                      }
                      placeholder="e.g. clerk Systems"
                      className="w-full px-3.5 py-2 rounded-[6px] border border-[#0a2414]/15 focus:border-[#17b267] text-[14px] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-[#0a2414] mb-1">
                      One or two lines on what it does
                    </label>
                    <textarea
                      rows={2}
                      value={state.personaDescription}
                      onChange={(e) =>
                        setState({ ...state, personaDescription: e.target.value })
                      }
                      placeholder="e.g. Outbound sales tool that monitors buying signals across the web"
                      className="w-full px-3.5 py-2 rounded-[6px] border border-[#0a2414]/15 focus:border-[#17b267] text-[14px] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-[#0a2414] mb-1">
                      Website or landing page link
                    </label>
                    <input
                      type="url"
                      value={state.personaWebsite}
                      onChange={(e) =>
                        setState({ ...state, personaWebsite: e.target.value })
                      }
                      placeholder="https://yourcompany.com"
                      className="w-full px-3.5 py-2 rounded-[6px] border border-[#0a2414]/15 focus:border-[#17b267] text-[14px] outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#0a2414]/10">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="text-[14px] font-medium text-[#607166] hover:text-[#0a2414]"
                  >
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-2.5 rounded-[6px] bg-[#1ad379] hover:bg-[#17b267] text-[#0a2414] text-[14px] font-medium"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Describe Target Audience & Select Signals */}
            {state.currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-[24px] sm:text-[28px] font-medium tracking-tight text-[#0a2414] mb-2">
                    Define signals & target audience
                  </h1>
                  <p className="text-[15px] text-[#283a2e]">
                    Select which verified signals clerk should monitor to trigger personalized outreach.
                  </p>
                </div>

                {/* Intent Signal Triggers Chips */}
                <div>
                  <span className="text-[13px] font-medium text-[#0a2414] block mb-2">
                    Active Signal Watchers:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      {
                        id: 'hiring_surges',
                        title: 'Hiring Surges',
                        desc: 'Engineering, Sales Ops & GTM roles posted on job boards',
                      },
                      {
                        id: 'funding_series_a',
                        title: 'Funding Filings',
                        desc: 'Series Seed/A/B round announcements & SEC disclosures',
                      },
                      {
                        id: 'competitor_discontent',
                        title: 'Competitor Discontent',
                        desc: 'Deliverability complaints & legacy sequencer migrations',
                      },
                      {
                        id: 'tech_changes',
                        title: 'Tech Stack Migrations',
                        desc: 'Replatforming to Postgres, AWS, or modern developer APIs',
                      },
                    ].map((sig) => {
                      const isSelected = activeSignalPicks.includes(sig.id);
                      return (
                        <div
                          key={sig.id}
                          onClick={() => toggleSignal(sig.id)}
                          className={`p-3 rounded-[8px] border cursor-pointer transition-all text-left ${
                            isSelected
                              ? 'border-[#17b267] bg-[#f3fbe9] text-[#0a2414] ring-1 ring-[#17b267]'
                              : 'border-[#0a2414]/10 bg-[#ffffff] text-[#607166] hover:border-[#0a2414]/25'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-[13px] text-[#0a2414]">{sig.title}</span>
                            <span className={`text-[11px] px-1.5 py-0.5 rounded-[4px] ${isSelected ? 'bg-[#1ad379] text-[#0a2414] font-semibold' : 'bg-[#0a2414]/5'}`}>
                              {isSelected ? 'Active' : 'Add'}
                            </span>
                          </div>
                          <p className="text-[12px] text-[#607166]">{sig.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#0a2414] mb-1">
                    Who are you trying to reach, and why would they care?
                  </label>
                  <textarea
                    rows={3}
                    value={state.targetAudience}
                    onChange={(e) =>
                      setState({ ...state, targetAudience: e.target.value })
                    }
                    placeholder="e.g. VP of Engineering and Head of Sales Ops at Series A-B tech companies who are scaling their outbound pipelines or struggling with deliverability..."
                    className="w-full px-3.5 py-2.5 rounded-[6px] border border-[#0a2414]/15 focus:border-[#17b267] text-[14px] outline-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#0a2414]/10">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="text-[14px] font-medium text-[#607166] hover:text-[#0a2414]"
                  >
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-2.5 rounded-[6px] bg-[#1ad379] hover:bg-[#17b267] text-[#0a2414] text-[14px] font-medium"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: Set Your Voice with Interactive Tone Tester */}
            {state.currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-[24px] sm:text-[28px] font-medium tracking-tight text-[#0a2414] mb-2">
                    Set your email voice
                  </h1>
                  <p className="text-[15px] text-[#283a2e]">
                    clerk drafts emails that sound like a thoughtful founder or peer, never a generic template.
                  </p>
                </div>

                {/* Tone selector */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'casual', label: 'Founder Direct', desc: 'Short & punchy' },
                    { id: 'formal', label: 'Executive', desc: 'Refined & clear' },
                    { id: 'concise', label: 'Under 75 Words', desc: 'Zero fluff' },
                    { id: 'storytelling', label: 'Trigger First', desc: 'Context-heavy' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setState({ ...state, voiceTone: t.id as any })}
                      className={`p-2.5 rounded-[6px] border text-left transition-all ${
                        state.voiceTone === t.id
                          ? 'border-[#17b267] bg-[#f3fbe9] text-[#0a2414] ring-1 ring-[#17b267]'
                          : 'border-[#0a2414]/10 bg-[#ffffff] text-[#607166] hover:border-[#0a2414]/25'
                      }`}
                    >
                      <div className="text-[13px] font-medium text-[#0a2414]">{t.label}</div>
                      <div className="text-[11px] text-[#607166]">{t.desc}</div>
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[13px] font-medium text-[#0a2414] mb-2">
                      Voice instructions or paste a past email you liked
                    </label>
                    <textarea
                      rows={3}
                      value={state.voiceSample}
                      onChange={(e) =>
                        setState({ ...state, voiceSample: e.target.value })
                      }
                      placeholder="Paste an email you've sent that felt right, or describe your tone..."
                      className="w-full px-3.5 py-2.5 rounded-[6px] border border-[#0a2414]/15 focus:border-[#17b267] text-[14px] outline-none"
                    />
                  </div>

                  <div className="p-3 bg-[#f3fbe9] rounded-[6px] border border-[#17b267]/25 text-[13px] text-[#0a2414] space-y-1">
                    <span className="font-semibold block text-[12px] uppercase text-[#17b267]">
                      Signal Rule:
                    </span>
                    <span>
                      Every drafted email opens with the exact verified trigger (e.g. job posting or funding round) so recipients immediately understand why you're reaching out.
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#0a2414]/10">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="text-[14px] font-medium text-[#607166] hover:text-[#0a2414]"
                  >
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-[6px] bg-[#1ad379] hover:bg-[#17b267] text-[#0a2414] text-[14px] font-medium disabled:opacity-60"
                  >
                    {isSaving ? 'Finishing...' : 'Finish setup'}
                  </button>
                </div>
                {error && (
                  <div className="mt-3 rounded-[6px] border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700">
                    {error}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Footer note */}
      <div className="max-w-[680px] mx-auto w-full text-center mt-6 text-[12px] text-[#607166]">
        Native mailbox sending with dedicated warmup ramp • 100% human-in-the-loop review queue
      </div>
    </div>
  );
};
