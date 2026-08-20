import React, { useState } from 'react';
import { ViewMode, PlanTier } from '../types';
import { HeroProductMockup } from './HeroProductMockup';
import { PLANS } from '../data/plansData';

interface LandingPageProps {
  onNavigate: (view: ViewMode) => void;
  onOpenAuth?: (mode: 'login' | 'signup', plan?: PlanTier) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onOpenAuth }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const scrollToSection = (e: React.MouseEvent, sectionId: string) => {
    e.preventDefault();
    const elem = document.getElementById(sectionId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleStartOnboarding = (plan?: PlanTier | unknown) => {
    const validPlan: PlanTier =
      typeof plan === 'string' && (plan === 'starter' || plan === 'growth' || plan === 'scale')
        ? plan
        : 'starter';
    if (onOpenAuth) {
      onOpenAuth('signup', validPlan);
    } else {
      onNavigate('signup');
    }
  };

  const handleOpenLogin = () => {
    if (onOpenAuth) {
      onOpenAuth('login');
    } else {
      onNavigate('login');
    }
  };

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const faqItems = [
    {
      q: 'Does this send emails without me seeing them first?',
      a: 'No. Every email sits in a review queue until you approve it. Nothing goes out on its own.',
    },
    {
      q: 'Will this get my Gmail account flagged or banned?',
      a: 'Every mailbox you connect starts on a slow ramp and stays under Gmail’s sending limits. You’re still sending real, personalized emails, not a blast, which is what actually keeps accounts healthy.',
    },
    {
      q: 'Can I connect more than one Gmail account?',
      a: 'Yes. Add as many as you want. Klerk spreads sends across all of them and gives each one its own independent warm-up.',
    },
    {
      q: 'What happens when someone replies?',
      a: 'Klerk reads your inbox and matches replies back to the right contact and campaign automatically. A reply also stops any scheduled follow-ups to that person.',
    },
    {
      q: 'What if someone wants to stop hearing from me?',
      a: 'Every email includes an opt-out line. Anyone who replies asking to stop gets added to a suppression list and will never be contacted again by any campaign.',
    },
    {
      q: 'What happens after the trial?',
      a: 'If you start on the Starter 7-day free trial, your card is charged on day 8. Cancel anytime before then and you won’t be charged.',
    },
    {
      q: 'Can I switch plans later?',
      a: 'Yes, anytime, from Settings. Upgrades apply right away. Downgrades apply at the start of your next billing cycle.',
    },
  ];

  return (
    <div id="landing-page-root" className="w-full bg-[#ffffff] text-[#0a2414]">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-[#ffffff]/90 backdrop-blur-md border-b border-[#0a2414]/10">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 relative flex items-center justify-between">
          {/* Left: Navigation Links */}
          <nav className="flex items-center space-x-6 text-[14px] text-[#607166]">
            <a
              href="#how-it-works"
              onClick={(e) => scrollToSection(e, 'how-it-works')}
              className="hover:text-[#0a2414] transition-colors hidden sm:inline-block cursor-pointer"
            >
              How it works
            </a>
            <a
              href="#why-Klerk"
              onClick={(e) => scrollToSection(e, 'why-Klerk')}
              className="hover:text-[#0a2414] transition-colors hidden md:inline-block cursor-pointer"
            >
              Why Klerk
            </a>
            <a
              href="#pricing"
              onClick={(e) => scrollToSection(e, 'pricing')}
              className="hover:text-[#0a2414] transition-colors hidden sm:inline-block cursor-pointer"
            >
              Pricing
            </a>
            <a
              href="#faq"
              onClick={(e) => scrollToSection(e, 'faq')}
              className="hover:text-[#0a2414] transition-colors hidden md:inline-block cursor-pointer"
            >
              FAQ
            </a>
          </nav>

          {/* Center: Brand Logo */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-auto">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-[23px] font-semibold tracking-[-0.04em] text-[#0a2414] hover:opacity-85 transition-opacity inline-flex items-baseline"
            >
              <span>Klerk</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#1ad379] inline-block ml-0.5 mb-0.5" />
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleOpenLogin}
              className="px-3.5 py-2 text-[14px] font-medium text-[#607166] hover:text-[#0a2414] transition-colors"
            >
              Log in
            </button>
            <button
              onClick={() => handleStartOnboarding()}
              className="px-4 py-2 rounded-[6px] bg-[#1ad379] hover:bg-[#17b267] text-[#0a2414] text-[14px] font-medium tracking-tight transition-all active:scale-[0.98] shadow-sm"
            >
              Get started
            </button>
          </div>
        </div>
      </header>

      {/* 1. HERO SECTION */}
      <section className="pt-16 pb-20 px-4 sm:px-6 max-w-[1200px] mx-auto text-center">
        {/* Top Announcement Pill */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-[6px] bg-[#f3fbe9] border border-[#0a2414]/12 text-[13px] text-[#0a2414] mb-8">
          <span className="w-2 h-2 rounded-full bg-[#1ad379]"></span>
          <span>Klerk is now live</span>
        </div>

        {/* Display Headline */}
        <h1 className="text-[40px] sm:text-[60px] md:text-[76px] font-normal leading-[0.96] tracking-[-0.03em] text-[#0a2414] max-w-[960px] mx-auto mb-6">
          Stop guessing who's ready to buy. <span className="font-medium">Start watching for it.</span>
        </h1>

        {/* Subheadline */}
        <p className="text-[17px] sm:text-[19px] leading-[1.4] text-[#283a2e] max-w-[780px] mx-auto mb-9 font-normal">
          Klerk watches the web for companies that are hiring, raising money, or switching tools, then writes the first email for you, citing the exact reason it reached out. You approve it. It sends from your own inbox, at a pace that won't get you flagged.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col items-center justify-center space-y-4 mb-16">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              id="hero-cta-signup"
              onClick={() => handleStartOnboarding()}
              className="px-10 py-3.5 rounded-[6px] bg-[#1ad379] hover:bg-[#17b267] text-[#0a2414] text-[16px] font-medium tracking-tight transition-all active:scale-[0.98] shadow-sm min-w-[200px]"
            >
              Get started
            </button>
          </div>

          <a
            href="#how-it-works"
            className="text-[14px] text-[#607166] hover:text-[#0a2414] transition-colors underline underline-offset-4"
          >
            See how it works
          </a>
        </div>

        {/* Hero Product UI Visual Mockup */}
        <div className="w-full mt-4">
          <HeroProductMockup onApproveDraft={handleStartOnboarding} />
        </div>
      </section>

      {/* 2. THE PROBLEM SECTION */}
      <section className="py-20 px-4 sm:px-6 bg-[#f3fbe9] border-y border-[#0a2414]/10">
        <div className="max-w-[800px] mx-auto text-left">
          <span className="text-[12px] uppercase tracking-wider text-[#17b267] font-semibold block mb-3">
            The fundamental flaw in cold outreach
          </span>
          <h2 className="text-[32px] sm:text-[44px] font-medium leading-[1.05] tracking-[-0.025em] text-[#0a2414] mb-6">
            Cold outreach is a numbers game only if you play it wrong
          </h2>
          <div className="space-y-4 text-[16px] sm:text-[17px] leading-[1.55] text-[#283a2e]">
            <p>
              Most outreach tools help you send more emails, faster. That's the wrong problem to solve. The real problem is you're emailing people who have no reason to care yet. A generic "hope this finds you well" email to a company that just posted a job opening three weeks ago and a company that hasn't touched their tech stack in five years get treated the same way: ignored.
            </p>
            <p className="font-medium text-[#0a2414]">
              Klerk flips the order. It finds the companies that are already showing signs they need something, and only then writes the email, built around that specific sign.
            </p>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS (5 Steps) */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 max-w-[1200px] mx-auto">
        <div className="mb-14 text-center max-w-[700px] mx-auto">
          <span className="text-[12px] uppercase tracking-wider text-[#607166] block mb-2 font-medium">
            The 5-Step Signal Pipeline
          </span>
          <h2 className="text-[36px] sm:text-[48px] font-medium tracking-[-0.02em] leading-tight text-[#0a2414]">
            How Klerk turns real web changes into approved conversations
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            {
              step: '1',
              title: 'It watches.',
              body: 'Klerk checks job postings, funding announcements, public reviews, and tech stack changes for the companies that match who you sell to.',
            },
            {
              step: '2',
              title: 'It finds a reason.',
              body: 'When something changes, that’s a signal: a company hiring for a role your product supports, a startup that just raised money, or a public complaint.',
            },
            {
              step: '3',
              title: 'It writes the first draft.',
              body: 'The email opens with that exact signal, not a guess. Every draft says why it was written, so you can see the reasoning before it goes anywhere.',
            },
            {
              step: '4',
              title: 'You approve it.',
              body: 'Nothing sends without you saying yes. Edit it, reject it, or send it as written with 1-click in your review queue.',
            },
            {
              step: '5',
              title: 'It sends and tracks.',
              body: 'Goes out from your own Gmail, at a pace built to keep your account healthy. Replies and bounces get tracked automatically.',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="p-6 rounded-[9px] bg-[#f9f6f1] border border-[#0a2414]/10 flex flex-col justify-between hover:border-[#17b267]/40 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-7 h-7 rounded-[6px] bg-[#0a2414] text-[#ffffff] text-[13px] flex items-center justify-center font-medium">
                    0{item.step}
                  </span>
                </div>
                <h3 className="text-[17px] font-medium text-[#0a2414] mb-2">{item.title}</h3>
                <p className="text-[14px] leading-relaxed text-[#283a2e]">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. WHAT IT WATCHES FOR (4 Cards) */}
      <section id="why-Klerk" className="py-20 px-4 sm:px-6 bg-[#f3fbe9] border-t border-[#0a2414]/10">
        <div className="max-w-[1200px] mx-auto">
          <div className="max-w-[700px] mb-12">
            <span className="text-[12px] uppercase tracking-wider text-[#17b267] font-semibold block mb-2">
              Verifiable Intent Signals
            </span>
            <h2 className="text-[32px] sm:text-[44px] font-medium tracking-[-0.02em] text-[#0a2414]">
              What Klerk watches for across the web
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-7 rounded-[9px] bg-[#ffffff] border border-[#0a2414]/10 shadow-[0_1px_0_0_rgba(10,36,20,0.06)] space-y-3">
              <div>
                <span className="text-[12px] uppercase tracking-wider text-[#17b267] font-semibold block mb-1">Signal Type 01</span>
                <h3 className="text-[19px] font-medium text-[#0a2414]">Hiring signals</h3>
              </div>
              <p className="text-[15px] leading-relaxed text-[#283a2e]">
                A company posting a job that matches what you sell usually means they're about to need it more, not less. Catch them while budgets are allocated.
              </p>
              <div className="p-3 bg-[#f9f6f1] rounded-[6px] text-[13px] text-[#607166]">
                Example: "Veloce opened 3 Staff Infrastructure roles focusing on outbound APIs"
              </div>
            </div>

            <div className="p-7 rounded-[9px] bg-[#ffffff] border border-[#0a2414]/10 shadow-[0_1px_0_0_rgba(10,36,20,0.06)] space-y-3">
              <div>
                <span className="text-[12px] uppercase tracking-wider text-[#17b267] font-semibold block mb-1">Signal Type 02</span>
                <h3 className="text-[19px] font-medium text-[#0a2414]">Funding signals</h3>
              </div>
              <p className="text-[15px] leading-relaxed text-[#283a2e]">
                A company that just raised money is about to spend some of it. Being early to that conversation before their inbox is flooded by thousands of generic blasts matters.
              </p>
              <div className="p-3 bg-[#f9f6f1] rounded-[6px] text-[13px] text-[#607166]">
                Example: "Kestrel Health announced $14.5M Series A lead by Benchmark"
              </div>
            </div>

            <div className="p-7 rounded-[9px] bg-[#ffffff] border border-[#0a2414]/10 shadow-[0_1px_0_0_rgba(10,36,20,0.06)] space-y-3">
              <div>
                <span className="text-[12px] uppercase tracking-wider text-[#17b267] font-semibold block mb-1">Signal Type 03</span>
                <h3 className="text-[19px] font-medium text-[#0a2414]">Public complaints</h3>
              </div>
              <p className="text-[15px] leading-relaxed text-[#283a2e]">
                When people complain in public about a competitor, that's the clearest signal there is. Someone is already actively looking for an alternative that solves their pain.
              </p>
              <div className="p-3 bg-[#f9f6f1] rounded-[6px] text-[13px] text-[#607166]">
                Example: "Public Reddit post on r/sales regarding deliverability dips on shared pools"
              </div>
            </div>

            <div className="p-7 rounded-[9px] bg-[#ffffff] border border-[#0a2414]/10 shadow-[0_1px_0_0_rgba(10,36,20,0.06)] space-y-3">
              <div>
                <span className="text-[12px] uppercase tracking-wider text-[#17b267] font-semibold block mb-1">Signal Type 04</span>
                <h3 className="text-[19px] font-medium text-[#0a2414]">Tech changes</h3>
              </div>
              <p className="text-[15px] leading-relaxed text-[#283a2e]">
                A company switching tools is a company already in a buying mindset. Catch them while the architectural decision is still open and vendor evaluations are happening.
              </p>
              <div className="p-3 bg-[#f9f6f1] rounded-[6px] text-[13px] text-[#607166]">
                Example: "Aether Cloud removed legacy Apollo tags, configured custom DNS records"
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. WHY EMAILS DON'T SOUND LIKE SPAM */}
      <section className="py-20 px-4 sm:px-6 max-w-[860px] mx-auto text-left">
        <span className="text-[12px] uppercase tracking-wider text-[#607166] block mb-2 font-medium">
          Strict Anti-Hallucination Rule
        </span>
        <h2 className="text-[32px] sm:text-[44px] font-medium tracking-[-0.02em] leading-tight text-[#0a2414] mb-6">
          Every email has to earn the right to say why it exists
        </h2>
        <div className="space-y-4 text-[16px] sm:text-[17px] leading-[1.6] text-[#283a2e]">
          <p>
            Klerk will not write an email that opens with a made-up reason. If there is no real signal for a contact, it says so and falls back to the strongest true detail it has instead of inventing one.
          </p>
          <p>
            Every draft includes a short note explaining exactly which signal it used and why, so you're never sending something you can't stand behind if someone writes back and asks "why me?"
          </p>
        </div>
      </section>

      {/* 6. DARK FEATURE BLOCK: RUNS ON YOUR OWN INBOX, SAFELY */}
      <section className="py-20 px-4 sm:px-6 bg-[#283a2e] text-[#f3fbe9] border-t border-[#0a2414]/20">
        <div className="max-w-[1000px] mx-auto">
          <div className="max-w-[700px] mb-10">
            <span className="text-[12px] uppercase tracking-wider text-[#1ad379] block mb-2 font-medium">
              Native Gmail Integration
            </span>
            <h2 className="text-[34px] sm:text-[46px] font-medium tracking-[-0.02em] leading-tight text-[#f3fbe9] mb-4">
              No new domain to warm up, no sketchy sending infrastructure
            </h2>
            <p className="text-[16px] sm:text-[17px] leading-[1.6] text-[#f3fbe9]/85">
              Klerk sends through your actual Gmail accounts using your own app passwords, not a shared server that a thousand other companies are also sending from. New mailboxes start slow and ramp up over two weeks. You can connect more than one mailbox, and Klerk spreads your sending across all of them so no single account carries the whole load.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="p-5 rounded-[9px] bg-[#0a2414]/50 border border-[#f3fbe9]/10">
              <span className="text-[13px] text-[#1ad379] block mb-1 font-medium">01 / Two-Week Ramp</span>
              <p className="text-[14px] text-[#f3fbe9]/90">
                New accounts automatically start at 10-15 sends/day and scale safely without tripping spam filters.
              </p>
            </div>
            <div className="p-5 rounded-[9px] bg-[#0a2414]/50 border border-[#f3fbe9]/10">
              <span className="text-[13px] text-[#1ad379] block mb-1 font-medium">02 / Multi-Mailbox Pool</span>
              <p className="text-[14px] text-[#f3fbe9]/90">
                Connect 2, 5, or 10 mailboxes. Klerk distributes the campaign load automatically across all accounts.
              </p>
            </div>
            <div className="p-5 rounded-[9px] bg-[#0a2414]/50 border border-[#f3fbe9]/10">
              <span className="text-[13px] text-[#1ad379] block mb-1 font-medium">03 / Built-in Compliance</span>
              <p className="text-[14px] text-[#f3fbe9]/90">
                Every email includes the physical address and 1-click suppression line required by law.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. BUILT FOR ONE PERSON RUNNING A FEW THINGS AT ONCE */}
      <section className="py-20 px-4 sm:px-6 bg-[#ffffff]">
        <div className="max-w-[860px] mx-auto text-left">
          <div className="mb-2">
            <span className="text-[12px] uppercase tracking-wider text-[#17b267] font-semibold">
              Multi-Product Support
            </span>
          </div>
          <h2 className="text-[32px] sm:text-[44px] font-medium tracking-[-0.02em] leading-tight text-[#0a2414] mb-6">
            One login, every product you're building
          </h2>
          <p className="text-[16px] sm:text-[17px] leading-[1.6] text-[#283a2e] mb-4">
            If you're running more than one product, you don't need a separate tool for each one. Set up a campaign per product, each with its own audience, its own voice, and its own sequence, and Klerk keeps them all running out of the same inbox pool, the same dashboard, the same login.
          </p>
        </div>
      </section>

      {/* 8. PRICING SECTION */}
      <section id="pricing" className="py-20 px-4 sm:px-6 bg-[#fafaf9] border-t border-[#0a2414]/10">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center max-w-[800px] mx-auto mb-14">
            <h2 className="text-[32px] sm:text-[44px] font-medium tracking-[-0.025em] text-[#0a2414] leading-tight mb-4">
              Pricing that scales with how much outreach you're actually running
            </h2>
            <p className="text-[16px] sm:text-[17.5px] leading-[1.5] text-[#283a2e]">
              Start with a free 7-day trial.
            </p>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1100px] mx-auto">
            {/* Starter */}
            <div className="rounded-[12px] p-7 bg-[#ffffff] border border-[#0a2414]/10 flex flex-col justify-between hover:border-[#0a2414]/25 transition-all shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-[22px] font-semibold text-[#0a2414]">Starter</h3>
                  <span className="px-2 py-0.5 rounded-[4px] bg-[#1ad379]/20 text-[#0a2414] font-semibold text-[11px]">
                    7-day trial
                  </span>
                </div>
                <p className="text-[13.5px] text-[#607166] min-h-[40px] mb-4">
                  For someone testing this out on one product.
                </p>

                <div className="flex items-baseline space-x-1 mb-6 pb-6 border-b border-[#0a2414]/8">
                  <span className="text-[38px] font-semibold tracking-tight text-[#0a2414]">$29</span>
                  <span className="text-[14px] text-[#607166]">/month</span>
                </div>

                <ul className="space-y-3 text-[13.5px] text-[#283a2e] mb-8">
                  <li className="flex items-start space-x-2.5">
                    <span className="text-[#17b267] font-bold shrink-0 mt-0.5">✓</span>
                    <span>1 connected mailbox</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <span className="text-[#17b267] font-bold shrink-0 mt-0.5">✓</span>
                    <span>1 campaign</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <span className="text-[#17b267] font-bold shrink-0 mt-0.5">✓</span>
                    <span>Up to 100 signal-matched leads a month</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <span className="text-[#17b267] font-bold shrink-0 mt-0.5">✓</span>
                    <span>AI-drafted outreach and follow-ups</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <span className="text-[#17b267] font-bold shrink-0 mt-0.5">✓</span>
                    <span>Reply and bounce tracking</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => handleStartOnboarding('starter')}
                className="w-full py-3 px-4 rounded-[8px] bg-[#1ad379] hover:bg-[#17b267] text-[#0a2414] text-[14px] font-semibold tracking-tight transition-all active:scale-[0.98] shadow-sm"
              >
                Start free trial
              </button>
            </div>

            {/* Growth - Most Popular */}
            <div className="rounded-[12px] p-7 bg-[#f3fbe9]/50 border-2 border-[#17b267] flex flex-col justify-between relative shadow-md">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#1ad379] text-[#0a2414] text-[11.5px] font-bold tracking-tight uppercase border border-[#0a2414]/10 shadow-xs">
                Most popular
              </span>

              <div>
                <h3 className="text-[22px] font-semibold text-[#0a2414] mb-1.5">Growth</h3>
                <p className="text-[13.5px] text-[#607166] min-h-[40px] mb-4">
                  For someone running this seriously across a couple of things.
                </p>

                <div className="flex items-baseline space-x-1 mb-6 pb-6 border-b border-[#0a2414]/8">
                  <span className="text-[38px] font-semibold tracking-tight text-[#0a2414]">$99</span>
                  <span className="text-[14px] text-[#607166]">/month</span>
                </div>

                <ul className="space-y-3 text-[13.5px] text-[#283a2e] mb-8">
                  <li className="flex items-start space-x-2.5">
                    <span className="text-[#17b267] font-bold shrink-0 mt-0.5">✓</span>
                    <span>Up to 3 connected mailboxes</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <span className="text-[#17b267] font-bold shrink-0 mt-0.5">✓</span>
                    <span>Up to 5 campaigns</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <span className="text-[#17b267] font-bold shrink-0 mt-0.5">✓</span>
                    <span>Up to 500 signal-matched leads a month</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <span className="text-[#17b267] font-bold shrink-0 mt-0.5">✓</span>
                    <span>Everything in Starter</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <span className="text-[#17b267] font-bold shrink-0 mt-0.5">✓</span>
                    <span>Faster signal scanning (checks for new signals more often)</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => handleStartOnboarding('growth')}
                className="w-full py-3 px-4 rounded-[8px] bg-[#0a2414] hover:bg-[#283a2e] text-[#ffffff] text-[14px] font-semibold tracking-tight transition-all active:scale-[0.98] shadow-sm"
              >
                Get started
              </button>
            </div>

            {/* Scale */}
            <div className="rounded-[12px] p-7 bg-[#ffffff] border border-[#0a2414]/10 flex flex-col justify-between hover:border-[#0a2414]/25 transition-all shadow-xs">
              <div>
                <h3 className="text-[22px] font-semibold text-[#0a2414] mb-1.5">Scale</h3>
                <p className="text-[13.5px] text-[#607166] min-h-[40px] mb-4">
                  For someone running several products or a heavier volume.
                </p>

                <div className="flex items-baseline space-x-1 mb-6 pb-6 border-b border-[#0a2414]/8">
                  <span className="text-[38px] font-semibold tracking-tight text-[#0a2414]">$299</span>
                  <span className="text-[14px] text-[#607166]">/month</span>
                </div>

                <ul className="space-y-3 text-[13.5px] text-[#283a2e] mb-8">
                  <li className="flex items-start space-x-2.5">
                    <span className="text-[#17b267] font-bold shrink-0 mt-0.5">✓</span>
                    <span>Unlimited mailboxes</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <span className="text-[#17b267] font-bold shrink-0 mt-0.5">✓</span>
                    <span>Unlimited campaigns</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <span className="text-[#17b267] font-bold shrink-0 mt-0.5">✓</span>
                    <span>Up to 2,000 signal-matched leads a month</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <span className="text-[#17b267] font-bold shrink-0 mt-0.5">✓</span>
                    <span>Everything in Growth</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <span className="text-[#17b267] font-bold shrink-0 mt-0.5">✓</span>
                    <span>A 30-minute setup call with you, personally</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => handleStartOnboarding('scale')}
                className="w-full py-3 px-4 rounded-[8px] border border-[#0a2414]/15 bg-[#ffffff] hover:bg-[#fafaf9] text-[#0a2414] text-[14px] font-semibold tracking-tight transition-all active:scale-[0.98]"
              >
                Get started
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FAQ SECTION */}
      <section id="faq" className="py-20 px-4 sm:px-6 bg-[#f9f6f1] border-t border-[#0a2414]/10">
        <div className="max-w-[800px] mx-auto">
          <h2 className="text-[32px] sm:text-[40px] font-medium tracking-[-0.02em] text-[#0a2414] mb-8 text-center">
            Frequently Asked Questions
          </h2>

          <div className="space-y-3">
            {faqItems.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-[9px] border border-[#0a2414]/10 bg-[#ffffff] overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-5 text-left flex items-center justify-between space-x-4 focus:outline-none"
                  >
                    <span className="text-[16px] font-medium text-[#0a2414]">{item.q}</span>
                    <span className="text-[13px] font-medium text-[#17b267]">
                      {isOpen ? 'Close' : 'Expand'}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-[15px] leading-relaxed text-[#283a2e] border-t border-[#0a2414]/6 pt-3">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. BOTTOM CTA */}
      <section className="py-20 px-4 sm:px-6 text-center bg-[#f3fbe9] border-t border-[#0a2414]/10">
        <div className="max-w-[700px] mx-auto space-y-6">
          <h2 className="text-[36px] sm:text-[48px] font-medium tracking-[-0.025em] text-[#0a2414] leading-tight">
            Ready to stop guessing who’s ready to buy?
          </h2>
          <p className="text-[17px] text-[#283a2e]">
            Connect your mailbox, set your buying signals, and review your first drafted leads today.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => handleStartOnboarding()}
              className="px-10 py-3.5 rounded-[6px] bg-[#1ad379] hover:bg-[#17b267] text-[#0a2414] text-[16px] font-medium tracking-tight transition-all active:scale-[0.98] shadow-sm min-w-[200px]"
            >
              Get started
            </button>
          </div>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="py-12 px-4 sm:px-6 border-t border-[#0a2414]/10 bg-[#ffffff] text-[14px]">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Col */}
          <div className="space-y-2">
            <span className="text-[21px] font-semibold tracking-[-0.04em] text-[#0a2414] inline-flex items-baseline">
              <span>Klerk</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#1ad379] inline-block ml-0.5 mb-0.5" />
            </span>
            <p className="text-[#607166] text-[13px]">
               Signal-grounded outreach that protects your inbox reputation.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-2">
            <span className="text-[12px] uppercase text-[#607166] block font-medium">
              Product
            </span>
            <ul className="space-y-1.5 text-[#0a2414]">
              <li>
                <a href="#how-it-works" onClick={(e) => scrollToSection(e, 'how-it-works')} className="hover:text-[#17b267] transition-colors">
                  How it works
                </a>
              </li>
              <li>
                <a href="#pricing" onClick={(e) => scrollToSection(e, 'pricing')} className="hover:text-[#17b267] transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#faq" onClick={(e) => scrollToSection(e, 'faq')} className="hover:text-[#17b267] transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <button onClick={handleOpenLogin} className="hover:text-[#17b267] transition-colors">
                  Log in
                </button>
              </li>
              <li>
                <button onClick={() => handleStartOnboarding()} className="hover:text-[#17b267] transition-colors">
                  Get started
                </button>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-2">
            <span className="text-[12px] uppercase text-[#607166] block font-medium">
              Legal
            </span>
            <ul className="space-y-1.5 text-[#0a2414]">
              <li>
                <button onClick={() => onNavigate('terms')} className="hover:text-[#17b267] transition-colors">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('privacy')} className="hover:text-[#17b267] transition-colors">
                  Privacy Policy
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto mt-8 pt-6 border-t border-[#0a2414]/6 flex flex-col sm:flex-row items-center justify-between text-[12px] text-[#607166]">
          <span>© 2026 Klerk. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};
