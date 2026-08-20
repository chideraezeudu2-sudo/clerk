import React, { useState } from 'react';
import {
  DashboardTab,
  ViewMode,
  Campaign,
  DraftEmail,
  SentEmail,
  SenderMailbox,
  Persona,
  AssistantMessage,
  UserSettings,
  UserSubscription,
  PlanTier,
} from '../../types';
import { Sidebar } from './Sidebar';
import { HomeView } from './HomeView';
import { OrganizationsView } from './OrganizationsView';
import { AssistantView } from './AssistantView';
import { CampaignsView } from './CampaignsView';
import { DraftsView } from './DraftsView';
import { SentView } from './SentView';
import { SendersView } from './SendersView';
import { PersonasView } from './PersonasView';
import { SettingsView } from './SettingsView';
import { PlanUpgradeModal } from '../PlanUpgradeModal';
import { PLANS } from '../../data/plansData';

interface DashboardLayoutProps {
  currentTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  onNavigate: (view: ViewMode) => void;

  campaigns: Campaign[];
  drafts: DraftEmail[];
  sentEmails: SentEmail[];
  senders: SenderMailbox[];
  personas: Persona[];
  assistantMessages: AssistantMessage[];
  settings: UserSettings;

  // Subscription
  subscription?: UserSubscription;
  onUpdateSubscription?: (sub: Partial<UserSubscription>) => void;

  // Actions
  onSendMessage: (text: string) => void;
  onOpenCampaign: (id: string | null) => void;
  selectedCampaignId: string | null;
  onToggleCampaignStatus: (id: string) => void;
  onDeleteCampaign: (id: string) => void;
  onBatchToggleCampaignStatus?: (ids: string[], newStatus: 'active' | 'paused') => void;
  onBatchDeleteCampaigns?: (ids: string[]) => void;
  onCreateCampaign: (camp: Partial<Campaign>) => void;
  onUpdateVoiceFeedback: (campaignId: string, draftId: string, isLiked: boolean) => void;

  onApproveDraft: (id: string) => void;
  onApproveAllDrafts: () => void;
  onEditDraft: (id: string, subject: string, body: string) => void;
  onRejectDraft: (id: string, reason: string) => void;
  onBatchApproveDrafts?: (ids: string[]) => void;
  onBatchRejectDrafts?: (ids: string[], reason: string) => void;
  onBatchDiscardDrafts?: (ids: string[]) => void;

  onAddSender: (email: string) => void;
  onToggleSenderStatus: (id: string) => void;
  onRemoveSender: (id: string) => void;

  onAddPersona: (p: Omit<Persona, 'id' | 'activeCampaignsCount'>) => void;
  onEditPersona: (id: string, p: Partial<Persona>) => void;
  onDeletePersona: (id: string) => void;

  onSaveSettings: (s: Partial<UserSettings>) => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  currentTab,
  onSelectTab,
  onNavigate,
  campaigns,
  drafts,
  sentEmails,
  senders,
  personas,
  assistantMessages,
  settings,
  subscription = {
    plan: 'starter',
    status: 'trial',
    isTrial: true,
    trialDaysRemaining: 7,
    trialEndsAt: 'Aug 26, 2026',
    currentPeriodEnd: 'Aug 26, 2026',
    cancelAtPeriodEnd: false,
    leadsUsedThisMonth: 38,
    maxLeads: 100,
  },
  onUpdateSubscription,
  onSendMessage,
  onOpenCampaign,
  selectedCampaignId,
  onToggleCampaignStatus,
  onDeleteCampaign,
  onBatchToggleCampaignStatus,
  onBatchDeleteCampaigns,
  onCreateCampaign,
  onUpdateVoiceFeedback,
  onApproveDraft,
  onApproveAllDrafts,
  onEditDraft,
  onRejectDraft,
  onBatchApproveDrafts,
  onBatchRejectDrafts,
  onBatchDiscardDrafts,
  onAddSender,
  onToggleSenderStatus,
  onRemoveSender,
  onAddPersona,
  onEditPersona,
  onDeletePersona,
  onSaveSettings,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<string | undefined>(undefined);
  const [trialBannerDismissed, setTrialBannerDismissed] = useState(false);

  const pendingDraftsCount = drafts.filter((d) => d.status === 'pending').length;
  const activeCampaignsCount = campaigns.filter((c) => c.status === 'active').length;
  const currentPlan = PLANS[subscription.plan];

  const handleOpenUpgradeModal = (reason?: string) => {
    setUpgradeReason(reason);
    setUpgradeModalOpen(true);
  };

  const handleSelectPlan = (newPlan: PlanTier) => {
    const planConfig = PLANS[newPlan];
    const isStarter = newPlan === 'starter';
    if (onUpdateSubscription) {
      onUpdateSubscription({
        plan: newPlan,
        isTrial: isStarter ? subscription.isTrial : false,
        status: isStarter && subscription.isTrial ? 'trial' : 'active',
        maxLeads: planConfig.maxLeadsPerMonth,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#ffffff] text-[#0a2414] flex font-sans antialiased">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={onSelectTab}
        onNavigate={onNavigate}
        pendingDraftsCount={pendingDraftsCount}
        activeCampaignsCount={activeCampaignsCount}
        mailboxesCount={senders.length}
        campaigns={campaigns}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Mobile Header Bar */}
        <header className="lg:hidden flex items-center justify-between px-6 py-3 bg-[#ffffff] border-b border-[#0a2414]/10 sticky top-0 z-30">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="px-3 py-1.5 rounded-[10px] border border-[#0a2414]/10 bg-[#ffffff] text-[#0a2414] text-[13px] font-medium hover:bg-[#fafaf9] transition-colors"
              aria-label="Open navigation menu"
            >
              Menu
            </button>
            <button
              onClick={() => onNavigate('landing')}
              className="text-[20px] font-semibold tracking-[-0.03em] text-[#0a2414] inline-flex items-baseline"
            >
              <span>clerk</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#1ad379] inline-block ml-0.5 mb-0.5" />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[12px] text-[#607166] capitalize font-medium">
              {currentTab}
            </span>
          </div>
        </header>

        {/* 7-DAY TRIAL BANNER (Clean, Non-Intrusive, Dismissible - Starter only) */}
        {subscription.isTrial && subscription.plan === 'starter' && !trialBannerDismissed && (
          <div className="bg-[#f3fbe9] border-b border-[#17b267]/30 px-6 py-2.5 flex items-center justify-between gap-4 text-[13px] z-20">
            <div className="flex items-center space-x-2.5 text-[#0a2414]">
              <span className="w-2 h-2 rounded-full bg-[#1ad379] shrink-0" />
              <span>
                <strong>{subscription.trialDaysRemaining} days left</strong> in your free trial of the{' '}
                <strong className="capitalize">{currentPlan.name} Plan</strong> (${currentPlan.price}/mo). You will be billed on{' '}
                {subscription.trialEndsAt || 'Aug 26, 2026'} unless cancelled.
              </span>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <button
                type="button"
                onClick={() => handleOpenUpgradeModal()}
                className="font-semibold text-[#17b267] hover:underline underline-offset-2"
              >
                Change Plan / Upgrade →
              </button>
              <button
                type="button"
                onClick={() => setTrialBannerDismissed(true)}
                className="text-[#607166] hover:text-[#0a2414] px-1 text-[13px]"
                aria-label="Dismiss trial banner"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Tab View Container with 24px rhythm */}
        <main
          className={`flex-1 w-full ${
            currentTab === 'assistant'
              ? 'p-0 max-w-none flex flex-col h-[calc(100vh-57px)] lg:h-screen overflow-hidden bg-[#ffffff]'
              : 'p-6 sm:p-6 lg:p-6 max-w-[1200px] mx-auto space-y-6 bg-[#ffffff]'
          }`}
        >
          {currentTab === 'home' && (
            <HomeView
              campaigns={campaigns}
              onOpenCampaign={(id) => {
                onOpenCampaign(id);
                onSelectTab('campaigns');
              }}
              onNavigateTab={onSelectTab}
            />
          )}

          {currentTab === 'organizations' && (
            <OrganizationsView
              onAddOrgToCampaign={(org) => {
                onSelectTab('campaigns');
              }}
            />
          )}

          {currentTab === 'assistant' && (
            <AssistantView
              messages={assistantMessages}
              onSendMessage={onSendMessage}
              campaigns={campaigns}
              pendingDraftsCount={pendingDraftsCount}
              onNavigateToDrafts={() => onSelectTab('drafts')}
            />
          )}

          {currentTab === 'campaigns' && (
            <CampaignsView
              campaigns={campaigns}
              personas={personas}
              selectedCampaignId={selectedCampaignId}
              onSelectCampaign={onOpenCampaign}
              onToggleStatus={onToggleCampaignStatus}
              onDeleteCampaign={onDeleteCampaign}
              onBatchToggleStatus={onBatchToggleCampaignStatus}
              onBatchDeleteCampaigns={onBatchDeleteCampaigns}
              onCreateCampaign={onCreateCampaign}
              onUpdateVoiceFeedback={onUpdateVoiceFeedback}
              subscription={subscription}
              onOpenUpgradeModal={handleOpenUpgradeModal}
            />
          )}

          {(currentTab === 'drafts' || currentTab === 'queue') && (
            <DraftsView
              drafts={drafts}
              campaigns={campaigns}
              onApproveDraft={onApproveDraft}
              onApproveAll={onApproveAllDrafts}
              onEditDraft={onEditDraft}
              onRejectDraft={onRejectDraft}
              onBatchApproveDrafts={onBatchApproveDrafts}
              onBatchRejectDrafts={onBatchRejectDrafts}
              onBatchDiscardDrafts={onBatchDiscardDrafts}
              subscription={subscription}
              onOpenUpgradeModal={handleOpenUpgradeModal}
            />
          )}

          {currentTab === 'sent' && (
            <SentView sentEmails={sentEmails} campaigns={campaigns} />
          )}

          {currentTab === 'senders' && (
            <SendersView
              senders={senders}
              onAddSender={onAddSender}
              onToggleStatus={onToggleSenderStatus}
              onRemoveSender={onRemoveSender}
              subscription={subscription}
              onOpenUpgradeModal={handleOpenUpgradeModal}
            />
          )}

          {currentTab === 'personas' && (
            <PersonasView
              personas={personas}
              onAddPersona={onAddPersona}
              onEditPersona={onEditPersona}
              onDeletePersona={onDeletePersona}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              settings={settings}
              onSaveSettings={onSaveSettings}
              subscription={subscription}
              onUpdateSubscription={onUpdateSubscription}
              onOpenUpgradeModal={handleOpenUpgradeModal}
              campaigns={campaigns}
              senders={senders}
            />
          )}
        </main>
      </div>

      {/* Plan Upgrade Modal */}
      <PlanUpgradeModal
        isOpen={upgradeModalOpen}
        currentSubscription={subscription}
        onClose={() => {
          setUpgradeModalOpen(false);
          setUpgradeReason(undefined);
        }}
        onSelectPlan={handleSelectPlan}
        reasonMessage={upgradeReason}
      />
    </div>
  );
};
