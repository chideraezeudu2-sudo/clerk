import React, { useState } from 'react';

interface HeroProductMockupProps {
  onApproveDraft?: () => void;
}

export const HeroProductMockup: React.FC<HeroProductMockupProps> = ({ onApproveDraft }) => {
  const [activeTab, setActiveTab] = useState<'review' | 'signal' | 'live'>('review');
  const [isApproved, setIsApproved] = useState(false);

  return (
    <div
      id="hero-product-preview-card"
      className="w-full bg-[#f9f6f1] border border-[#0a2414]/10 rounded-[9px] overflow-hidden shadow-[0_20px_40px_-10px_rgba(10,36,20,0.12)] text-left"
    >
      {/* Top Application Bar */}
      <div className="bg-[#ffffff] px-4 py-3 border-b border-[#0a2414]/8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="flex space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0a2414]/15"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#0a2414]/15"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#0a2414]/15"></span>
          </div>
          <span className="text-[13px] font-medium tracking-tight text-[#0a2414] pl-2 border-l border-[#0a2414]/10">
            clerk / queue / series-a-hiring
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-[6px] bg-[#f3fbe9] border border-[#17b267]/30 text-[12px] text-[#0a2414]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1ad379]"></span>
            <span>Watching 64 companies</span>
          </span>
        </div>
      </div>

      {/* Sub-navigation bar inside the mockup */}
      <div className="bg-[#f9f6f1] px-4 py-2 border-b border-[#0a2414]/8 flex items-center justify-between">
        <div className="flex space-x-2">
          <span className="px-3 py-1 text-[13px] rounded-[6px] font-medium bg-[#ffffff] text-[#0a2414] shadow-sm border border-[#0a2414]/10">
            Pending Review (1)
          </span>
        </div>
      </div>

      {/* Mockup Body Content */}
      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#ffffff]">
        {/* Left / Main Email Body */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 rounded-[6px] bg-[#f9f6f1] border border-[#0a2414]/8 space-y-2">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-[#607166]">To:</span>
              <span className="font-medium text-[#0a2414]">Marcus Vance &lt;marcus@velocedata.io&gt;</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-[#607166]">Role:</span>
              <span className="text-[#0a2414]">VP of Engineering @ Veloce Data</span>
            </div>
            <div className="flex items-center justify-between text-[13px] pt-1 border-t border-[#0a2414]/6">
              <span className="text-[#607166]">Subject:</span>
              <span className="font-medium text-[#0a2414]">Scaling outbound at Veloce with the new engineering hires</span>
            </div>
          </div>

          <div className="p-4 rounded-[6px] border border-[#0a2414]/10 bg-white space-y-3 text-[14px] leading-relaxed text-[#0a2414]">
            <p>Hi Marcus,</p>
            <p className="bg-[#f3fbe9] p-2.5 rounded-[6px] border-l-2 border-[#1ad379] text-[#0a2414]">
              Saw you posted 3 backend roles this week to scale your data pipelines and outbound integrations at Veloce.
            </p>
            <p className="text-[#283a2e]">
              Typically when engineering teams ramp GTM data infrastructure, maintaining clean email deliverability and coordinating multi-inbox limits becomes an unnecessary dev distraction.
            </p>
            <p className="text-[#283a2e]">
              We built clerk to run intent-triggered outreach directly from your own Gmail mailboxes with zero shared-pool contamination and automatic warm-up pacing.
            </p>
            <p>Open to seeing a 2-minute walkthrough of how it monitors engineering signals?</p>
            <div className="pt-3 text-[13px] text-[#607166] border-t border-[#0a2414]/6">
              Best,<br />Chidera • Sent via clerk (native Gmail app pass)
            </div>
          </div>

          {/* Action Approval Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="text-[12px] text-[#607166]">
              Next queue dispatch: 14:00 (in 32m)
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                className="px-3.5 py-1.5 text-[13px] rounded-[6px] border border-[#0a2414]/15 text-[#0a2414] hover:bg-[#f9f6f1] transition-colors"
              >
                Edit Body
              </button>
              <button
                type="button"
                id="hero-approve-draft-btn"
                onClick={() => {
                  if (onApproveDraft) {
                    onApproveDraft();
                  } else {
                    setIsApproved(!isApproved);
                  }
                }}
                className={`px-4 py-1.5 text-[13px] rounded-[6px] font-medium transition-all ${
                  isApproved
                    ? 'bg-[#0a2414] text-[#ffffff]'
                    : 'bg-[#1ad379] hover:bg-[#17b267] text-[#0a2414]'
                }`}
              >
                {isApproved ? 'Approved for Dispatch' : 'Approve Draft'}
              </button>
            </div>
          </div>
        </div>

        {/* Right / Why this was written sidebar */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-[6px] bg-[#f3fbe9] border border-[#17b267]/25 space-y-3">
            <div className="text-[#0a2414]">
              <span className="text-[13px] font-semibold tracking-tight">Signal Reasoning & Proof</span>
            </div>

            <div className="space-y-2 text-[13px]">
              <div className="p-3 bg-white/90 rounded-[6px] border border-[#0a2414]/6">
                <span className="text-[11px] uppercase tracking-wider text-[#17b267] font-semibold block mb-0.5">
                  Hiring Intent Verified
                </span>
                <p className="font-medium text-[#0a2414]">
                  Senior Infrastructure Engineer (Outbound & API Integrations)
                </p>
                <p className="text-[12px] text-[#607166] mt-1">
                  Detected on company careers page & LinkedIn Jobs 2 hours ago.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-[6px] bg-[#f9f6f1] border border-[#0a2414]/8 space-y-2 text-[13px]">
            <span className="text-[11px] uppercase tracking-wider text-[#607166] block">
              Sender Configuration
            </span>
            <div className="flex items-center justify-between text-[#0a2414]">
              <span className="text-[13px] font-medium">chidera@clerk.so</span>
              <span className="text-[11px] px-2 py-0.5 rounded-[4px] bg-[#ffffff] border border-[#0a2414]/10 text-[#17b267]">
                Warm-up: Day 9 of 14
              </span>
            </div>
            <p className="text-[12px] text-[#607166] leading-relaxed">
              Safe ramp rate active (Max 35/day). Includes physical compliance footer automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
