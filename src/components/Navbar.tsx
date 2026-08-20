import React from 'react';
import { ViewMode } from '../types';

interface NavbarProps {
  onNavigate: (view: ViewMode) => void;
  currentView: ViewMode;
  onScrollToSection?: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigate,
  currentView,
  onScrollToSection,
}) => {
  const handleHowItWorks = () => {
    if (currentView !== 'landing') {
      onNavigate('landing');
      setTimeout(() => {
        const el = document.getElementById('how-it-works');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById('how-it-works');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      if (onScrollToSection) onScrollToSection('how-it-works');
    }
  };

  return (
    <header
      id="public-header"
      className="sticky top-0 z-50 w-full bg-[#ffffff] border-b border-[#0a2414]/10 transition-all"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left: Brand Name Only - Pure text "Klerk", no icons, no symbols */}
        <div className="flex items-center space-x-6">
          <button
            id="brand-logo-button"
            onClick={() => onNavigate('landing')}
            className="text-[23px] font-semibold tracking-[-0.04em] text-[#0a2414] hover:opacity-85 transition-opacity select-none font-sans inline-flex items-baseline"
            aria-label="Klerk home"
          >
            <span>Klerk</span>
          {/* C→K logo mark (simple, distinctive) */}
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-[6px] bg-[#1ad379] text-[#0a2414] text-[14px] font-bold leading-none ml-1 select-none">K</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#1ad379] inline-block ml-0.5 mb-0.5" />
          </button>

          {/* Quick Mockup Navigation Badge */}
          <div className="hidden md:flex items-center space-x-2 text-[13px] text-[#607166] pl-4 border-l border-[#0a2414]/10">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`px-3 py-1 rounded-[6px] border text-[13px] font-medium transition-colors ${
                currentView === 'dashboard'
                  ? 'bg-[#0a2414] text-[#ffffff] border-[#0a2414]'
                  : 'bg-[#f9f6f1] text-[#0a2414] border-[#0a2414]/10 hover:border-[#0a2414]/25'
              }`}
            >
              Live App Mockup
            </button>
            <button
              onClick={() => onNavigate('onboarding')}
              className={`px-3 py-1 rounded-[6px] border text-[13px] font-medium transition-colors ${
                currentView === 'onboarding'
                  ? 'bg-[#0a2414] text-[#ffffff] border-[#0a2414]'
                  : 'bg-[#f9f6f1] text-[#0a2414] border-[#0a2414]/10 hover:border-[#0a2414]/25'
              }`}
            >
              Onboarding Flow
            </button>
          </div>
        </div>

        {/* Right side navigation */}
        <div className="flex items-center space-x-5 sm:space-x-7">
          <button
            id="nav-how-it-works"
            onClick={handleHowItWorks}
            className="text-[14px] font-medium text-[#0a2414] hover:text-[#17b267] transition-colors"
          >
            How it works
          </button>

          <button
            id="nav-login"
            onClick={() => onNavigate('login')}
            className="text-[14px] font-medium text-[#0a2414] hover:text-[#17b267] transition-colors"
          >
            Log in
          </button>

          <button
            id="nav-signup"
            onClick={() => onNavigate('signup')}
            className="px-4 py-2 rounded-[6px] bg-[#1ad379] hover:bg-[#17b267] text-[#0a2414] text-[14px] font-medium tracking-tight transition-all active:scale-[0.98] shadow-sm"
          >
            Get started
          </button>
        </div>
      </div>
    </header>
  );
};
