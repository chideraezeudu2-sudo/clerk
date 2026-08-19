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

  // Actions
  onSendMessage: (text: string) => void;
  onOpenCampaign: (id: string | null) => void;
  selectedCampaignId: string | null;
  onToggleCampaignStatus: (id: string) => void;
  onDeleteCampaign: (id: string) => void;
  onCreateCampaign: (camp: Partial<Campaign>) => void;
  onUpdateVoiceFeedback: (campaignId: string, draftId: string, isLiked: boolean) => void;

  onApproveDraft: (id: string) => void;
  onApproveAllDrafts: () => void;
  onEditDraft: (id: string, subject: string, body: string) => void;
  onRejectDraft: (id: string, reason: string) => void;

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
  onSendMessage,
  onOpenCampaign,
  selectedCampaignId,
  onToggleCampaignStatus,
  onDeleteCampaign,
  onCreateCampaign,
  onUpdateVoiceFeedback,
  onApproveDraft,
  onApproveAllDrafts,
  onEditDraft,
  onRejectDraft,
  onAddSender,
  onToggleSenderStatus,
  onRemoveSender,
  onAddPersona,
  onEditPersona,
  onDeletePersona,
  onSaveSettings,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pendingDraftsCount = drafts.filter((d) => d.status === 'pending').length;
  const activeCampaignsCount = campaigns.filter((c) => c.status === 'active').length;

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
        {/* Mobile Header Bar with centered logo */}
        <header className="lg:hidden flex items-center justify-between px-6 py-3 bg-[#ffffff] border-b border-[#0a2414]/10 sticky top-0 z-30">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="px-3 py-1.5 rounded-[10px] border border-[#0a2414]/10 bg-[#ffffff] text-[#0a2414] text-[13px] font-medium hover:bg-[#fafaf9] transition-colors"
            aria-label="Open navigation menu"
          >
            Menu
          </button>

          <div className="flex-1 flex justify-center">
            <button
              onClick={() => onNavigate('landing')}
              className="text-[20px] font-semibold tracking-[-0.03em] text-[#0a2414] inline-flex items-baseline"
            >
              <span>clerk</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#1ad379] inline-block ml-0.5 mb-0.5" />
            </button>
          </div>

          <div className="w-[52px] flex justify-end">
            <span className="text-[12px] text-[#607166] capitalize font-medium">
              {currentTab}
            </span>
          </div>
        </header>

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
              onCreateCampaign={onCreateCampaign}
              onUpdateVoiceFeedback={onUpdateVoiceFeedback}
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
            <SettingsView settings={settings} onSaveSettings={onSaveSettings} />
          )}
        </main>
      </div>
    </div>
  );
};
