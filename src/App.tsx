import React, { useState } from 'react';
import {
  ViewMode,
  DashboardTab,
  Campaign,
  DraftEmail,
  SentEmail,
  SenderMailbox,
  Persona,
  AssistantMessage,
  UserSettings,
  UserSubscription,
  PlanTier,
} from './types';
import { PLANS } from './data/plansData';
import {
  initialCampaigns,
  initialDrafts,
  initialSentEmails,
  initialSenders,
  initialPersonas,
  initialAssistantMessages,
  initialUserSettings,
} from './data/mockData';

import { LandingPage } from './components/LandingPage';
import { Onboarding } from './components/Onboarding';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { AuthModal } from './components/AuthModal';
import { TermsPage, PrivacyPage } from './components/LegalPages';
import { UndoToast, UndoItem } from './components/UndoToast';

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('landing');
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>('home');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

  // Subscription state
  const [subscription, setSubscription] = useState<UserSubscription>({
    plan: 'starter',
    status: 'trial',
    isTrial: true,
    trialDaysRemaining: 7,
    trialEndsAt: 'Aug 26, 2026',
    currentPeriodEnd: 'Aug 26, 2026',
    cancelAtPeriodEnd: false,
    leadsUsedThisMonth: 38,
    maxLeads: 100,
  });

  // Undo Toast state
  const [undoItem, setUndoItem] = useState<UndoItem | null>(null);

  // Auth modal state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authPlan, setAuthPlan] = useState<PlanTier>('starter');

  // Application Data State
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [drafts, setDrafts] = useState<DraftEmail[]>(initialDrafts);
  const [sentEmails, setSentEmails] = useState<SentEmail[]>(initialSentEmails);
  const [senders, setSenders] = useState<SenderMailbox[]>(initialSenders);
  const [personas, setPersonas] = useState<Persona[]>(initialPersonas);
  const [assistantMessages, setAssistantMessages] = useState<AssistantMessage[]>(
    initialAssistantMessages
  );
  const [settings, setSettings] = useState<UserSettings>(initialUserSettings);

  // Navigation handlers
  const handleOpenAuth = (mode: 'login' | 'signup', plan?: PlanTier) => {
    setAuthMode(mode);
    if (plan && (plan === 'starter' || plan === 'growth' || plan === 'scale')) {
      setAuthPlan(plan);
    } else {
      setAuthPlan('starter');
    }
    setIsAuthOpen(true);
  };

  const handleAuthSuccess = (selectedPlan?: PlanTier) => {
    setIsAuthOpen(false);
    const chosenPlan: PlanTier =
      selectedPlan && (selectedPlan === 'starter' || selectedPlan === 'growth' || selectedPlan === 'scale')
        ? selectedPlan
        : authPlan;
    const planConfig = PLANS[chosenPlan] || PLANS.starter;
    const isStarter = chosenPlan === 'starter';

    setSubscription((prev) => ({
      ...prev,
      plan: chosenPlan,
      isTrial: isStarter,
      status: isStarter ? 'trial' : 'active',
      maxLeads: planConfig.maxLeadsPerMonth,
    }));

    // If signup, route to onboarding; if login, route directly to dashboard
    if (authMode === 'signup') {
      setViewMode('onboarding');
    } else {
      setViewMode('dashboard');
    }
  };

  const handleUpdateSubscription = (updated: Partial<UserSubscription>) => {
    setSubscription((prev) => ({ ...prev, ...updated }));
  };

  // Draft approval workflow
  const handleApproveDraft = (draftId: string) => {
    const draft = drafts.find((d) => d.id === draftId);
    if (!draft) return;

    // Mark as approved and move to Sent
    setDrafts((prev) =>
      prev.map((d) => (d.id === draftId ? { ...d, status: 'approved' } : d))
    );

    const newSent: SentEmail = {
      id: `sent-${Date.now()}`,
      campaignId: draft.campaignId,
      campaignName: draft.campaignName,
      recipientName: draft.recipientName,
      recipientCompany: draft.recipientCompany,
      recipientEmail: draft.recipientEmail,
      subject: draft.subject,
      body: draft.body,
      sentAt: 'Just now',
      status: 'sent',
      senderMailbox: senders[0]?.email || 'chidera@clerk.so',
    };

    setSentEmails((prev) => [newSent, ...prev]);

    // Update campaign counts
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === draft.campaignId ? { ...c, sentCount: c.sentCount + 1 } : c
      )
    );
  };

  const handleApproveAllDrafts = () => {
    const pending = drafts.filter((d) => d.status === 'pending');
    pending.forEach((draft) => {
      handleApproveDraft(draft.id);
    });
  };

  const handleBatchApproveDrafts = (ids: string[]) => {
    ids.forEach((id) => handleApproveDraft(id));
  };

  const handleEditDraft = (draftId: string, subject: string, body: string) => {
    setDrafts((prev) =>
      prev.map((d) =>
        d.id === draftId ? { ...d, subject, body } : d
      )
    );
  };

  const handleRejectDraft = (draftId: string, reason: string) => {
    setDrafts((prev) =>
      prev.map((d) =>
        d.id === draftId ? { ...d, status: 'rejected', rejectReason: reason } : d
      )
    );
  };

  const handleBatchRejectDrafts = (ids: string[], reason: string) => {
    setDrafts((prev) =>
      prev.map((d) =>
        ids.includes(d.id) ? { ...d, status: 'rejected', rejectReason: reason } : d
      )
    );
  };

  const handleBatchDiscardDrafts = (ids: string[]) => {
    setDrafts((prev) => prev.filter((d) => !ids.includes(d.id)));
  };

  // Campaign management
  const handleToggleCampaignStatus = (id: string) => {
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: c.status === 'active' ? 'paused' : 'active' }
          : c
      )
    );
  };

  const handleBatchToggleCampaignStatus = (ids: string[], newStatus: 'active' | 'paused') => {
    setCampaigns((prev) =>
      prev.map((c) => (ids.includes(c.id) ? { ...c, status: newStatus } : c))
    );
  };

  const handleDeleteCampaign = (id: string) => {
    const idx = campaigns.findIndex((c) => c.id === id);
    const campToDelete = campaigns.find((c) => c.id === id);
    if (!campToDelete) return;

    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    if (selectedCampaignId === id) {
      setSelectedCampaignId(null);
    }

    setUndoItem({
      id: `undo-camp-${Date.now()}`,
      type: 'campaign',
      title: `Campaign "${campToDelete.name}" deleted`,
      item: campToDelete,
      index: idx >= 0 ? idx : 0,
    });
  };

  const handleBatchDeleteCampaigns = (ids: string[]) => {
    const deletedItems = campaigns.filter((c) => ids.includes(c.id));
    if (deletedItems.length === 0) return;

    setCampaigns((prev) => prev.filter((c) => !ids.includes(c.id)));
    if (selectedCampaignId && ids.includes(selectedCampaignId)) {
      setSelectedCampaignId(null);
    }

    if (deletedItems.length === 1) {
      setUndoItem({
        id: `undo-camp-${Date.now()}`,
        type: 'campaign',
        title: `Campaign "${deletedItems[0].name}" deleted`,
        item: deletedItems[0],
        index: 0,
      });
    }
  };

  const handleCreateCampaign = (campData: Partial<Campaign>) => {
    const newCamp: Campaign = {
      id: `camp-${Date.now()}`,
      name: campData.name || 'New Intent Campaign',
      personaId: campData.personaId || personas[0].id,
      status: 'active',
      leadsCount: 1,
      sentCount: 0,
      repliedCount: 0,
      bouncedCount: 0,
      createdAt: 'Just now',
      signalKeywords: campData.signalKeywords || ['Hiring VP Eng'],
      signals: [
        {
          id: `sig-${Date.now()}`,
          type: 'hiring',
          title: 'Hiring Lead Backend Architect',
          company: 'Acme Cloud Inc.',
          contactName: 'Sarah Jenkins',
          contactRole: 'VP of Engineering',
          contactEmail: 'sjenkins@acmecloud.io',
          detectedAt: 'Just now',
          confidenceScore: 96,
          detail: 'New job posting on Greenhouse highlighting migration from legacy mail pipelines.',
        },
      ],
      sequence: [
        {
          stepNumber: 1,
          label: 'Signal Introduction',
          delayDays: 0,
          sentCount: 0,
          templateSnippet: 'Noticed your posting for Backend Architect...',
          openRate: 0,
          replyRate: 0,
        },
        {
          stepNumber: 2,
          label: 'Relevant Case Study',
          delayDays: 3,
          sentCount: 0,
          templateSnippet: 'Quick follow-up on the delivery infrastructure...',
          openRate: 0,
          replyRate: 0,
        },
        {
          stepNumber: 3,
          label: 'Final Friendly Check-in',
          delayDays: 5,
          sentCount: 0,
          templateSnippet: 'Wanted to bubble this to top of inbox before closing loop...',
          openRate: 0,
          replyRate: 0,
        },
      ],
      voiceStyle: 'Direct, peer-to-peer engineering tone. No marketing fluff.',
      voiceSamples: [
        'Hey Sarah — saw your team is ramping backend mail pipelines at Acme.',
        'We built clerk to solve native deliverability with peer-to-peer warm-up.',
      ],
    };

    setCampaigns((prev) => [newCamp, ...prev]);

    // Also auto-generate a sample draft in queue for this campaign
    const newDraft: DraftEmail = {
      id: `draft-${Date.now()}`,
      campaignId: newCamp.id,
      campaignName: newCamp.name,
      recipientName: 'Sarah Jenkins',
      recipientCompany: 'Acme Cloud Inc.',
      recipientRole: 'VP of Engineering',
      recipientEmail: 'sjenkins@acmecloud.io',
      signalSnippet: 'Acme posted Backend Architect job 2 hours ago (Greenhouse)',
      subject: 'Acme backend mail pipelines & native deliverability',
      body: `Hey Sarah,\n\nSaw Acme is hiring a Backend Architect on Greenhouse to modernize delivery systems.\n\nQuick thought: our team built clerk to automate signal-based outreach with native mailbox warm-up, so teams scale outbound without hitting spam traps or burn domains.\n\nOpen to taking a quick look this week?\n\nBest,\nChidera`,
      status: 'pending',
      generatedAt: 'Just now',
    };

    setDrafts((prev) => [newDraft, ...prev]);
  };

  const handleUpdateVoiceFeedback = (
    campaignId: string,
    draftId: string,
    isLiked: boolean
  ) => {
    setAssistantMessages((prev) => [
      ...prev,
      {
        id: `feedback-${Date.now()}`,
        sender: 'assistant',
        content: `Got it! Logged your ${
          isLiked ? 'thumbs up 👍' : 'revision preference 👎'
        } for "${campaignId}". The autonomous voice model is updating future drafts to reflect this style.`,
        timestamp: 'Just now',
      },
    ]);
  };

  // Assistant messaging
  const handleSendMessage = (text: string) => {
    const userMsg: AssistantMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: text,
      timestamp: 'Just now',
    };

    setAssistantMessages((prev) => [...prev, userMsg]);

    // Simulate AI clerk agent response
    setTimeout(() => {
      const lower = text.toLowerCase();
      let replyContent = `Understood. I have adjusted your active crawls and queued up new verified prospects matching your prompt.`;

      if (lower.includes('campaign') || lower.includes('create')) {
        replyContent = `Created a new campaign draft targeted to your query. I've populated the sequence templates and scanned the latest hiring signals. Head over to the Campaigns tab to review!`;
      } else if (lower.includes('draft') || lower.includes('queue') || lower.includes('approve')) {
        replyContent = `Checked your queue. You have ${
          drafts.filter((d) => d.status === 'pending').length
        } drafts awaiting review. You can approve them individually or use "Approve All" to schedule immediate dispatch.`;
      } else if (lower.includes('sender') || lower.includes('mailbox') || lower.includes('inbox')) {
        replyContent = `All ${senders.length} connected mailboxes are currently healthy with optimal reputation scores and active progressive ramp warmups.`;
      } else if (lower.includes('persona')) {
        replyContent = `Your personas are active. I am currently matching company headcount and tech stack against your target ICP parameters.`;
      }

      const botMsg: AssistantMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        content: replyContent,
        timestamp: 'Just now',
      };

      setAssistantMessages((prev) => [...prev, botMsg]);
    }, 600);
  };

  // Senders management
  const handleAddSender = (email: string) => {
    const newSender: SenderMailbox = {
      id: `sender-${Date.now()}`,
      email,
      provider: email.includes('gmail') ? 'google' : 'microsoft',
      status: 'warming',
      healthScore: 98,
      dailyCap: 20,
      sentToday: 0,
      connectedDays: 1,
    };
    setSenders((prev) => [newSender, ...prev]);
  };

  const handleToggleSenderStatus = (id: string) => {
    setSenders((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: s.status === 'active' ? 'paused' : 'active' }
          : s
      )
    );
  };

  const handleRemoveSender = (id: string) => {
    setSenders((prev) => prev.filter((s) => s.id !== id));
  };

  // Personas management
  const handleAddPersona = (
    newP: Omit<Persona, 'id' | 'activeCampaignsCount'>
  ) => {
    const created: Persona = {
      ...newP,
      id: `persona-${Date.now()}`,
      activeCampaignsCount: 0,
    };
    setPersonas((prev) => [...prev, created]);
  };

  const handleEditPersona = (id: string, updated: Partial<Persona>) => {
    setPersonas((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
    );
  };

  const handleDeletePersona = (id: string) => {
    const idx = personas.findIndex((p) => p.id === id);
    const personaToDelete = personas.find((p) => p.id === id);
    if (!personaToDelete) return;

    setPersonas((prev) => prev.filter((p) => p.id !== id));

    setUndoItem({
      id: `undo-pers-${Date.now()}`,
      type: 'persona',
      title: `Persona "${personaToDelete.name}" deleted`,
      item: personaToDelete,
      index: idx >= 0 ? idx : 0,
    });
  };

  const handleUndoAction = (item: UndoItem) => {
    if (item.type === 'campaign') {
      const camp = item.item as Campaign;
      setCampaigns((prev) => {
        if (prev.some((c) => c.id === camp.id)) return prev;
        const copy = [...prev];
        const insertIdx = Math.min(item.index, copy.length);
        copy.splice(insertIdx, 0, camp);
        return copy;
      });
    } else if (item.type === 'persona') {
      const pers = item.item as Persona;
      setPersonas((prev) => {
        if (prev.some((p) => p.id === pers.id)) return prev;
        const copy = [...prev];
        const insertIdx = Math.min(item.index, copy.length);
        copy.splice(insertIdx, 0, pers);
        return copy;
      });
    }
    setUndoItem(null);
  };

  const handleSaveSettings = (updated: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...updated }));
  };

  return (
    <div className="min-h-screen bg-[#f3fbe9] text-[#0a2414] font-sans selection:bg-[#ffbac3] selection:text-[#360003]">
      {/* 1. Landing Page View */}
      {viewMode === 'landing' && (
        <LandingPage
          onNavigate={setViewMode}
          onOpenAuth={handleOpenAuth}
        />
      )}

      {/* 2. Onboarding Flow View */}
      {viewMode === 'onboarding' && (
        <Onboarding
          onComplete={() => setViewMode('dashboard')}
          onNavigate={setViewMode}
        />
      )}

      {/* 3. Dashboard View (8 tabs) */}
      {viewMode === 'dashboard' && (
        <DashboardLayout
          currentTab={dashboardTab}
          onSelectTab={setDashboardTab}
          onNavigate={setViewMode}
          campaigns={campaigns}
          drafts={drafts}
          sentEmails={sentEmails}
          senders={senders}
          personas={personas}
          assistantMessages={assistantMessages}
          settings={settings}
          subscription={subscription}
          onUpdateSubscription={handleUpdateSubscription}
          onSendMessage={handleSendMessage}
          onOpenCampaign={setSelectedCampaignId}
          selectedCampaignId={selectedCampaignId}
          onToggleCampaignStatus={handleToggleCampaignStatus}
          onDeleteCampaign={handleDeleteCampaign}
          onBatchToggleCampaignStatus={handleBatchToggleCampaignStatus}
          onBatchDeleteCampaigns={handleBatchDeleteCampaigns}
          onCreateCampaign={handleCreateCampaign}
          onUpdateVoiceFeedback={handleUpdateVoiceFeedback}
          onApproveDraft={handleApproveDraft}
          onApproveAllDrafts={handleApproveAllDrafts}
          onEditDraft={handleEditDraft}
          onRejectDraft={handleRejectDraft}
          onBatchApproveDrafts={handleBatchApproveDrafts}
          onBatchRejectDrafts={handleBatchRejectDrafts}
          onBatchDiscardDrafts={handleBatchDiscardDrafts}
          onAddSender={handleAddSender}
          onToggleSenderStatus={handleToggleSenderStatus}
          onRemoveSender={handleRemoveSender}
          onAddPersona={handleAddPersona}
          onEditPersona={handleEditPersona}
          onDeletePersona={handleDeletePersona}
          onSaveSettings={handleSaveSettings}
        />
      )}

      {/* 4. Terms and Privacy Pages */}
      {viewMode === 'terms' && <TermsPage onNavigate={setViewMode} />}
      {viewMode === 'privacy' && <PrivacyPage onNavigate={setViewMode} />}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        initialMode={authMode}
        initialPlan={authPlan}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* 5-Second Undo Toast Banner */}
      <UndoToast
        undoItem={undoItem}
        onUndo={handleUndoAction}
        onDismiss={() => setUndoItem(null)}
        durationSeconds={5}
      />
    </div>
  );
}
