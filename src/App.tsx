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
} from './types';
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

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('landing');
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>('home');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

  // Auth modal state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

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
  const handleOpenAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleAuthSuccess = () => {
    setIsAuthOpen(false);
    // If signup, route to onboarding; if login, route directly to dashboard
    if (authMode === 'signup') {
      setViewMode('onboarding');
    } else {
      setViewMode('dashboard');
    }
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

  const handleDeleteCampaign = (id: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
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
      ],
      voiceNotes: campData.voiceNotes || 'Short, peer to peer, under 90 words',
      voiceDrafts: [],
    };

    setCampaigns((prev) => [newCamp, ...prev]);
  };

  const handleUpdateVoiceFeedback = (
    campaignId: string,
    draftId: string,
    isLiked: boolean
  ) => {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id !== campaignId) return c;
        return {
          ...c,
          voiceDrafts: c.voiceDrafts.map((vd) =>
            vd.id === draftId
              ? {
                  ...vd,
                  isLiked: isLiked,
                  isDisliked: !isLiked,
                }
              : vd
          ),
        };
      })
    );
  };

  // Assistant messaging with intelligent response simulation
  const handleSendMessage = (text: string) => {
    const userMsg: AssistantMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: 'Just now',
    };

    setAssistantMessages((prev) => [...prev, userMsg]);

    setTimeout(() => {
      let replyText = '';
      let actionTaken = undefined;

      const lower = text.toLowerCase();
      if (lower.includes('lead') || lower.includes('find') || lower.includes('search')) {
        // Generate a new draft
        const newDraft: DraftEmail = {
          id: `draft-${Date.now()}`,
          campaignId: campaigns[0]?.id || 'camp-1',
          campaignName: campaigns[0]?.name || 'Series A-B Hiring',
          recipientName: 'David Chen',
          recipientRole: 'Head of Sales Operations',
          recipientCompany: 'VectorPath Labs',
          recipientEmail: 'dchen@vectorpath.io',
          subject: 'Quick question regarding VectorPath’s new outbound team',
          body: `Hi David,\n\nSaw VectorPath just opened three AE roles in SF this week. Typically when outbound teams scale that fast, domain reputation bottlenecks hit hard.\n\nWe built clerk to run hyper-targeted signal-based outreach natively through your own Gmail inboxes so you never land in spam.\n\nWorth a 5-min look before you ramp the new hires?\n\nChidera\nFounder, clerk`,
          signalReason: 'Detected 3 Senior Account Executive job postings published within last 24h on Greenhouse.',
          signalType: 'hiring',
          detectedDetail: 'Greenhouse job board: 3x Senior Account Executive listings opened Aug 19, 2026',
          createdAt: 'Just now',
          status: 'pending',
        };

        setDrafts((prev) => [newDraft, ...prev]);

        replyText = `I crawled the latest Greenhouse postings and discovered David Chen (Head of Sales Ops at VectorPath Labs). They just posted 3 AE roles.\n\nI generated a personalized draft grounded directly in this hiring signal. As always, nothing sends until you approve it in Drafts.`;
        actionTaken = { type: 'created_drafts', count: 1 };
      } else if (lower.includes('pending') || lower.includes('review') || lower.includes('draft')) {
        const pendingCount = drafts.filter((d) => d.status === 'pending').length;
        replyText = `You currently have ${pendingCount} draft email${pendingCount === 1 ? '' : 's'} waiting in your review queue. Every draft has a verified signal justification attached.`;
      } else if (lower.includes('summarize') || lower.includes('week') || lower.includes('performance')) {
        replyText = `Weekly Performance Summary:\n• Sent: 84 verified emails across 3 campaigns.\n• Replies: 19 high-intent responses (22.6% reply rate).\n• Spam/Bounce Rate: 0.8% (fully healthy).\n• Top Campaign: Series A-B Hiring Triggers.`;
      } else {
        replyText = `Understood. I have updated the signal filter parameters across your active campaigns. When new verified triggers match your criteria, fresh drafts will appear in your queue.`;
      }

      const agentMsg: AssistantMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: replyText,
        timestamp: 'Just now',
        actionTaken,
      };

      setAssistantMessages((prev) => [...prev, agentMsg]);
    }, 800);
  };

  // Senders & Personas
  const handleAddSender = (email: string) => {
    const newSender: SenderMailbox = {
      id: `sender-${Date.now()}`,
      email,
      status: 'warming',
      dailyCap: 15,
      maxCap: 50,
      sentToday: 0,
      connectedDays: 1,
      healthScore: 100,
      addedAt: 'Today',
    };
    setSenders((prev) => [...prev, newSender]);
  };

  const handleToggleSenderStatus = (id: string) => {
    setSenders((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: s.status === 'paused' ? 'warming' : 'paused' }
          : s
      )
    );
  };

  const handleRemoveSender = (id: string) => {
    setSenders((prev) => prev.filter((s) => s.id !== id));
  };

  const handleAddPersona = (pData: Omit<Persona, 'id' | 'activeCampaignsCount'>) => {
    const newP: Persona = {
      id: `pers-${Date.now()}`,
      name: pData.name,
      companyName: pData.companyName,
      description: pData.description,
      websiteUrl: pData.websiteUrl,
      activeCampaignsCount: 0,
    };
    setPersonas((prev) => [...prev, newP]);
  };

  const handleEditPersona = (id: string, updated: Partial<Persona>) => {
    setPersonas((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
    );
  };

  const handleDeletePersona = (id: string) => {
    setPersonas((prev) => prev.filter((p) => p.id !== id));
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
          onSendMessage={handleSendMessage}
          onOpenCampaign={setSelectedCampaignId}
          selectedCampaignId={selectedCampaignId}
          onToggleCampaignStatus={handleToggleCampaignStatus}
          onDeleteCampaign={handleDeleteCampaign}
          onCreateCampaign={handleCreateCampaign}
          onUpdateVoiceFeedback={handleUpdateVoiceFeedback}
          onApproveDraft={handleApproveDraft}
          onApproveAllDrafts={handleApproveAllDrafts}
          onEditDraft={handleEditDraft}
          onRejectDraft={handleRejectDraft}
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
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
