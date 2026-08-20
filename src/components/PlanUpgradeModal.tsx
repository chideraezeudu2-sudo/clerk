import React from 'react';
import { PlanTier, UserSubscription } from '../types';
import { PLANS } from '../data/plansData';

interface PlanUpgradeModalProps {
  isOpen: boolean;
  currentSubscription: UserSubscription;
  onClose: () => void;
  onSelectPlan: (newPlan: PlanTier) => void;
  title?: string;
  reasonMessage?: string;
}

export const PlanUpgradeModal: React.FC<PlanUpgradeModalProps> = ({
  isOpen,
  currentSubscription,
  onClose,
  onSelectPlan,
  title = 'Choose your plan',
  reasonMessage,
}) => {
  if (!isOpen) return null;

  const planList = [PLANS.starter, PLANS.growth, PLANS.scale];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
    >
      <div className="w-full max-w-4xl bg-[#ffffff] rounded-[12px] p-6 sm:p-8 border border-[#0a2414]/10 shadow-2xl relative text-[#0a2414] my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 px-2.5 py-1 text-[13px] rounded-[6px] hover:bg-[#f9f6f1] text-[#607166] transition-colors"
          aria-label="Close modal"
        >
          ✕ Close
        </button>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-[12px] uppercase tracking-wider text-[#17b267] font-semibold block mb-1.5">
            Plans & Volume
          </span>
          <h2 className="text-[26px] sm:text-[32px] font-medium tracking-[-0.02em] text-[#0a2414] mb-2">
            {title}
          </h2>
          <p className="text-[14.5px] text-[#607166] leading-relaxed">
            Every plan gets the full product. The only difference is volume.
            {currentSubscription.isTrial && currentSubscription.plan === 'starter' && (
              <span className="block mt-1 font-medium text-[#17b267]">
                You are currently in your Starter 7-day free trial ({currentSubscription.trialDaysRemaining} days remaining).
              </span>
            )}
          </p>

          {reasonMessage && (
            <div className="mt-4 p-3 bg-[#f3fbe9] border border-[#17b267]/30 rounded-[8px] text-[13px] text-[#0a2414] font-medium">
              💡 {reasonMessage}
            </div>
          )}
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          {planList.map((p) => {
            const isCurrent = currentSubscription.plan === p.id;
            const isPopular = p.isPopular;

            return (
              <div
                key={p.id}
                className={`rounded-[10px] p-6 flex flex-col justify-between relative transition-all ${
                  isPopular
                    ? 'bg-[#f3fbe9]/40 border-2 border-[#17b267] shadow-sm'
                    : 'bg-[#ffffff] border border-[#0a2414]/10 hover:border-[#0a2414]/25'
                }`}
              >
                {isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-[#1ad379] text-[#0a2414] text-[11px] font-bold tracking-tight uppercase border border-[#0a2414]/10 shadow-xs">
                    Most popular
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-[19px] font-semibold text-[#0a2414]">{p.name}</h3>
                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded-[6px] bg-[#0a2414] text-[#ffffff] text-[11px] font-semibold">
                        Current Plan
                      </span>
                    )}
                  </div>

                  <p className="text-[12.5px] text-[#607166] min-h-[36px] mb-4">
                    {p.description}
                  </p>

                  <div className="flex items-baseline space-x-1 mb-6 pb-5 border-b border-[#0a2414]/8">
                    <span className="text-[34px] font-semibold tracking-tight text-[#0a2414]">
                      ${p.price}
                    </span>
                    <span className="text-[13px] text-[#607166]">/month</span>
                  </div>

                  {/* Feature Checklist */}
                  <ul className="space-y-2.5 text-[13px] text-[#283a2e] mb-6">
                    {p.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-[#17b267] font-bold shrink-0 mt-0.5">✓</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSelectPlan(p.id);
                    onClose();
                  }}
                  disabled={isCurrent}
                  className={`w-full py-2.5 px-4 rounded-[8px] text-[13.5px] font-semibold tracking-tight transition-all active:scale-[0.98] ${
                    isCurrent
                      ? 'bg-[#fafaf9] border border-[#0a2414]/10 text-[#607166] cursor-default'
                      : isPopular
                      ? 'bg-[#1ad379] hover:bg-[#17b267] text-[#0a2414] shadow-sm'
                      : 'bg-[#0a2414] hover:bg-[#283a2e] text-[#ffffff]'
                  }`}
                >
                  {isCurrent
                    ? 'Active Plan'
                    : currentSubscription.isTrial
                    ? `Switch Trial to ${p.name}`
                    : `Upgrade to ${p.name}`}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="text-center text-[12.5px] text-[#607166] border-t border-[#0a2414]/8 pt-4">
          <span>
            Need help choosing? Upgrades take effect immediately. Downgrades apply at the end of your billing period.
          </span>
        </div>
      </div>
    </div>
  );
};
