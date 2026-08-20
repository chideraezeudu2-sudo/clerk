import React from 'react';
import { Campaign, DashboardTab, ViewMode } from '../../types';

interface SidebarProps {
  currentTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  onNavigate: (view: ViewMode) => void;
  pendingDraftsCount: number;
  activeCampaignsCount: number;
  mailboxesCount: number;
  campaigns?: Campaign[];
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onNavigate,
  pendingDraftsCount,
  activeCampaignsCount,
  mailboxesCount,
  campaigns = [],
  isOpenMobile,
  onCloseMobile,
}) => {
  const totalWatchedTargets = campaigns.reduce((acc, c) => acc + (c.leadsCount || 0), 0) || 120;
  const activeKeywords = Array.from(
    new Set(
      campaigns
        .filter((c) => c.status === 'active')
        .flatMap((c) => c.signalKeywords || [])
    )
  ).slice(0, 2);

  const signalDescription =
    activeKeywords.length > 0
      ? `Watching ${totalWatchedTargets}+ targets for ${activeKeywords.join(' and ')}.`
      : `Watching ${totalWatchedTargets}+ targets for hiring surges and competitor discontent.`;

  const navItems: {
    id: DashboardTab;
    label: string;
    badge?: number | string;
    badgeVariant?: 'green' | 'neutral';
  }[] = [
    { id: 'home', label: 'Overview' },
    {
      id: 'organizations',
      label: 'Organizations',
      badge: '1.7M',
      badgeVariant: 'neutral',
    },
    {
      id: 'drafts',
      label: 'Review Queue',
      badge: pendingDraftsCount > 0 ? pendingDraftsCount : undefined,
      badgeVariant: 'green',
    },
    {
      id: 'campaigns',
      label: 'Campaigns',
      badge: activeCampaignsCount,
    },
    {
      id: 'assistant',
      label: 'Assistant',
    },
    { id: 'sent', label: 'Sent Log' },
    {
      id: 'senders',
      label: 'Senders',
      badge: mailboxesCount,
    },
    { id: 'personas', label: 'Personas' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden backdrop-blur-sm"
          onClick={onCloseMobile}
        />
      )}

      <aside
        id="dashboard-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#ffffff] border-r border-[#0a2414]/10 flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top brand & navigation */}
        <div className="p-6 flex flex-col h-full overflow-y-auto space-y-6">
          {/* Logo Header */}
          <div className="flex items-center px-1.5">
            <button
              onClick={() => onNavigate('landing')}
              className="text-[23px] font-semibold tracking-[-0.04em] text-[#0a2414] hover:opacity-80 transition-opacity inline-flex items-baseline"
            >
              <span>clerk</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#1ad379] inline-block ml-0.5 mb-0.5" />
            </button>
          </div>

          {/* Navigation Items with 6px rhythm */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = currentTab === item.id || (item.id === 'drafts' && currentTab === 'queue');

              return (
                <button
                  key={item.id}
                  id={`sidebar-nav-${item.id}`}
                  onClick={() => {
                    onSelectTab(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-[10px] text-[13.5px] font-medium transition-all ${
                    isActive
                      ? 'bg-[#ffffff] text-[#0a2414] border border-[#0a2414]/15'
                      : 'text-[#607166] hover:text-[#0a2414] hover:bg-[#fafaf9] border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#1ad379]"></span>}
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded-[6px] text-[11px] font-medium ${
                        item.badgeVariant === 'green'
                          ? 'bg-[#1ad379] text-[#0a2414]'
                          : 'bg-[#0a2414]/6 text-[#0a2414]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Active Signal Box */}
          <div className="mt-auto p-4 rounded-[10px] bg-[#ffffff] border border-[#17b267]/30 text-[12px] space-y-1.5">
            <div className="flex items-center space-x-1.5 text-[#0a2414] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1ad379] animate-pulse" />
              <span>Signal Monitor Active</span>
            </div>
            <p className="text-[#607166] leading-relaxed">
              {signalDescription}
            </p>
          </div>
        </div>

        {/* Bottom Profile & Sign out */}
        <div className="p-6 border-t border-[#0a2414]/10 bg-[#ffffff] space-y-3">
          <div className="flex items-center justify-between px-1 text-[13px]">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-[10px] bg-[#0a2414] text-[#ffffff] text-[12px] font-semibold flex items-center justify-center">
                CE
              </div>
              <div className="truncate text-left">
                <div className="font-semibold text-[#0a2414] truncate text-[13px]">Chidera Ezeudu</div>
                <div className="text-[11.5px] text-[#607166] truncate">chidera@clerk.so</div>
              </div>
            </div>
          </div>

          <div className="pt-1">
            <button
              onClick={() => onNavigate('landing')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-[10px] text-[12.5px] text-[#607166] hover:text-[#360003] hover:bg-[#ffbac3]/15 border border-[#0a2414]/8 hover:border-[#ffbac3]/40 transition-colors font-medium text-left"
            >
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
