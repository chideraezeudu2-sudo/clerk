import React from 'react';

interface EmptyStateProps {
  type: 'campaigns' | 'drafts' | 'personas' | 'sent' | 'signals' | 'search';
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: string;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  description,
  primaryAction,
  secondaryAction,
}) => {
  return (
    <div className="p-10 sm:p-14 rounded-[10px] bg-[#ffffff] border border-[#0a2414]/10 text-center flex flex-col items-center justify-center space-y-5 max-w-2xl mx-auto my-4">
      {/* Visual Placeholder Vector Illustration */}
      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#f3fbe9] border border-[#17b267]/25 flex items-center justify-center relative select-none">
        {type === 'campaigns' && (
          <svg
            className="w-12 h-12 text-[#17b267]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Clean target: outer ring, inner ring, bullseye */}
            <circle cx="12" cy="12" r="10" stroke="#0a2414" opacity="0.5" />
            <circle cx="12" cy="12" r="6" stroke="#0a2414" opacity="0.8" />
            <circle cx="12" cy="12" r="2" fill="#1ad379" stroke="#0a2414" strokeWidth="1.5" />
          </svg>
        )}

        {type === 'drafts' && (
          <svg
            className="w-12 h-12 text-[#17b267]"
            viewBox="0 0 48 48"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Letter envelope background */}
            <rect x="8" y="12" width="32" height="24" rx="4" fill="#ffffff" stroke="#0a2414" strokeWidth="1.8" />
            <path d="M8 16L24 28L40 16" stroke="#0a2414" strokeWidth="1.8" />
            {/* Badge checkmark */}
            <circle cx="34" cy="14" r="8" fill="#1ad379" stroke="#0a2414" strokeWidth="1.8" />
            <path d="M31 14L33.5 16.5L37 11.5" stroke="#0a2414" strokeWidth="2" />
            {/* Sparkle */}
            <path d="M12 8L13 11L16 12L13 13L12 16L11 13L8 12L11 11Z" fill="#1ad379" />
          </svg>
        )}

        {type === 'personas' && (
          <svg
            className="w-12 h-12 text-[#17b267]"
            viewBox="0 0 48 48"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* User identity card */}
            <rect x="10" y="8" width="28" height="32" rx="4" fill="#ffffff" stroke="#0a2414" strokeWidth="1.8" />
            {/* User avatar head and body */}
            <circle cx="24" cy="18" r="5" stroke="#0a2414" strokeWidth="1.8" fill="#f3fbe9" />
            <path d="M16 32C16 27.5 19.5 25 24 25C28.5 25 32 27.5 32 32" stroke="#0a2414" strokeWidth="1.8" />
            {/* Voice soundwaves */}
            <path d="M38 18C40 20 40 24 38 26" stroke="#1ad379" strokeWidth="2" />
            <path d="M42 15C45 19 45 25 42 29" stroke="#1ad379" strokeWidth="2" opacity="0.6" />
          </svg>
        )}

        {type === 'sent' && (
          <svg
            className="w-12 h-12 text-[#17b267]"
            viewBox="0 0 48 48"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Paper Airplane */}
            <path
              d="M10 24L38 10L28 38L22 26L10 24Z"
              fill="#ffffff"
              stroke="#0a2414"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <path d="M38 10L22 26" stroke="#0a2414" strokeWidth="1.8" />
            {/* Motion trail dashes */}
            <path d="M6 34C10 32 14 30 18 30" stroke="#1ad379" strokeWidth="2" strokeDasharray="3 3" />
            <circle cx="38" cy="10" r="3" fill="#1ad379" />
          </svg>
        )}

        {type === 'search' && (
          <svg
            className="w-12 h-12 text-[#607166]"
            viewBox="0 0 48 48"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="21" cy="21" r="12" stroke="#0a2414" strokeWidth="1.8" />
            <line x1="30" y1="30" x2="40" y2="40" stroke="#0a2414" strokeWidth="2.5" />
            <path d="M17 21H25" stroke="#17b267" strokeWidth="2" />
          </svg>
        )}

      </div>

      {/* Text Copy */}
      <div className="space-y-2 max-w-md">
        <h3 className="text-[19px] sm:text-[21px] font-semibold text-[#0a2414] tracking-tight">
          {title}
        </h3>
        <p className="text-[13.5px] sm:text-[14px] text-[#607166] leading-relaxed">
          {description}
        </p>
      </div>

      {/* Call to Actions */}
      {(primaryAction || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {primaryAction && (
            <button
              onClick={primaryAction.onClick}
              className="px-5 py-2.5 rounded-[10px] bg-[#1ad379] hover:bg-[#17b267] text-[#0a2414] text-[13.5px] font-semibold tracking-tight transition-all active:scale-[0.98] shadow-sm flex items-center space-x-1.5"
            >
              {primaryAction.icon && <span>{primaryAction.icon}</span>}
              <span>{primaryAction.label}</span>
            </button>
          )}

          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="px-4 py-2.5 rounded-[10px] border border-[#0a2414]/15 bg-white hover:bg-[#fafaf9] text-[#0a2414] text-[13.5px] font-medium transition-colors"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
