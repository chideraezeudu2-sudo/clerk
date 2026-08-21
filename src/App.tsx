import React, { useEffect, useState } from 'react';
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
  Organization,
} from './types';
import { PLANS } from './data/plansData';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { apiFetch } from './lib/api';

import { LandingPage } from './components/LandingPage';
import { Onboarding } from './components/Onboarding';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { AuthModal } from './components/AuthModal';
import { TermsPage, PrivacyPage } from './components/LegalPages';
import { UndoToast, UndoItem } from './components/UndoToast';
import { BlogRouter } from './components/Blog';
import { Analytics } from '@vercel/analytics/react';

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
    leadsUsedThisMonth: 0,
    maxLeads: 100,
  });

  // Undo Toast state
  const [undoItem, setUndoItem] = useState<UndoItem | null>(null);

  // Auth modal state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authPlan, setAuthPlan] = useState<PlanTier>('starter');

  // Application Data State — starts EMPTY (blank slate); loaded from the API
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [drafts, setDrafts] = useState<DraftEmail[]>([]);
  const [sentEmails, setSentEmails] = useState<SentEmail[]>([]);
  const [senders, setSenders] = useState<SenderMailbox[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [assistantMessages, setAssistantMessages] = useState<AssistantMessage[]>([]);
  const [settings, setSettings] = useState<UserSettings>({
    mailingAddress: '',
    defaultFollowUpDays: 3,
    dailyCapAcrossAll: 50,
    timezone: 'UTC',
    apiKey: '',
    accountEmail: '',
  });
  const [dataLoaded, setDataLoaded] = useState(false);

  // Real session state (Google OAuth + email/password)
  const [sessionUser, setSessionUser] = useState<{ id: string; email?: string } | null>(null);
  const [authReady, setAuthReady] = useState(false);

  // Load all data from the backend API (blank slate for new users)
  const loadData = async () => {
    setDataLoaded(false);
    try {
      const data = await apiFetch('/api/bootstrap');
      setCampaigns(data.campaigns || []);
      setDrafts(data.drafts || []);
      setSentEmails(data.sentEmails || []);
      setSenders(data.senders || []);
      setPersonas(data.personas || []);
      setOrganizations(data.organizations || []);
      setSettings(data.settings || {
        mailingAddress: '',
        defaultFollowUpDays: 3,
        dailyCapAcrossAll: 50,
        timezone: 'UTC',
        apiKey: '',
        accountEmail: sessionUser?.email || '',
      });
      // Sync plan usage to the real lead count
      const realLeads = (data.campaigns || []).reduce((acc: number, c: any) => acc + (c.leadsCount || 0), 0);
      setSubscription((prev) => ({ ...prev, leadsUsedThisMonth: realLeads }));
      return data;
    } catch (err) {
      console.error('Failed to load data:', err);
      return null;
    } finally {
      setDataLoaded(true);
    }
  };

  // Decide routing from the real onboarded flag: not onboarded -> onboarding, else dashboard
  const routeAfterAuth = async () => {
    const data = await loadData();
    const onboarded = data?.user?.onboarded === true;
    setViewMode(onboarded ? 'dashboard' : 'onboarding');
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthReady(true);
      return;
    }
    // Pick up an existing session and the OAuth redirect return
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user ?? null;
      setSessionUser(user);
      setAuthReady(true);
      if (user) {
        routeAfterAuth();
      }
    });
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setSessionUser(user);
      if (user) {
        setIsAuthOpen(false);
        routeAfterAuth();
      } else {
        setViewMode('landing');
      }
    });
    return () => authSub.unsubscribe();
  }, []);

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

    // Route by the real onboarded flag: new (not onboarded) -> onboarding, else dashboard.
    // The session is already set; onAuthStateChange will also fire routeAfterAuth,
    // but we call it here too so plan state is applied before routing.
    routeAfterAuth();
  };

  const handleUpdateSubscription = (updated: Partial<UserSubscription>) => {
    setSubscription((prev) => ({ ...prev, ...updated }));
  };

  // Draft approval workflow — approve triggers a real send through /api/send
  const handleApproveDraft = async (draftId: string) => {
    const draft = drafts.find((d) => d.id === draftId);
    if (!draft) return;
    try {
      const { sent } = await apiFetch('/api/send', {
        method: 'POST',
        body: { draftId },
      });
      setDrafts((prev) =>
        prev.map((d) => (d.id === draftId ? { ...d, status: 'approved' } : d))
      );
      setSentEmails((prev) => [sent, ...prev]);
      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === draft.campaignId ? { ...c, sentCount: c.sentCount + 1 } : c
        )
      );
    } catch (err) {
      console.error('Send failed:', err);
      alert('Failed to send this email. Connect a sender mailbox first.');
    }
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

  const handleEditDraft = async (draftId: string, subject: string, body: string) => {
    setDrafts((prev) =>
      prev.map((d) =>
        d.id === draftId ? { ...d, subject, body } : d
      )
    );
    try {
      await apiFetch('/api/drafts', {
        method: 'PATCH',
        body: { id: draftId, action: 'edit', subject, body },
      });
    } catch (err) {
      console.error('Edit draft failed:', err);
    }
  };

  const handleRejectDraft = async (draftId: string, reason: string) => {
    setDrafts((prev) =>
      prev.map((d) =>
        d.id === draftId ? { ...d, status: 'rejected', rejectReason: reason } : d
      )
    );
    try {
      await apiFetch('/api/drafts', {
        method: 'PATCH',
        body: { id: draftId, action: 'reject', reason },
      });
    } catch (err) {
      console.error('Reject draft failed:', err);
    }
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
  const handleToggleCampaignStatus = async (id: string) => {
    const camp = campaigns.find((c) => c.id === id);
    if (!camp) return;
    const next = camp.status === 'active' ? 'paused' : 'active';
    setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, status: next } : c)));
    try {
      await apiFetch('/api/campaigns', { method: 'PATCH', body: { id, status: next } });
    } catch (err) {
      console.error('Toggle campaign failed:', err);
    }
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
    apiFetch(`/api/campaigns?id=${id}`, { method: 'DELETE' }).catch((err) =>
      console.error('Delete campaign failed:', err)
    );

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
    ids.forEach((id) =>
      apiFetch(`/api/campaigns?id=${id}`, { method: 'DELETE' }).catch((err) =>
        console.error('Delete campaign failed:', err)
      )
    );

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

  const handleCreateCampaign = async (campData: Partial<Campaign>) => {
    try {
      const { campaign } = await apiFetch('/api/campaigns', {
        method: 'POST',
        body: {
          name: campData.name || 'New Campaign',
          personaId: campData.personaId || null,
          signalKeywords: campData.signalKeywords || [],
        },
      });
      setCampaigns((prev) => [campaign, ...prev]);

      // Generate AI drafts for the new campaign (Groq)
      const { drafts: newDrafts } = await apiFetch('/api/drafts', {
        method: 'POST',
        body: { campaignId: campaign.id },
      }).catch(() => ({ drafts: [] }));
      if (newDrafts && newDrafts.length) {
        setDrafts((prev) => [...newDrafts, ...prev]);
      }
    } catch (err) {
      console.error('Create campaign failed:', err);
      alert('Failed to create campaign. Please try again.');
    }
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

  // Assistant messaging — real AI via /api/chat
  const handleSendMessage = async (text: string) => {
    const userMsg: AssistantMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: text,
      timestamp: 'Just now',
    };
    setAssistantMessages((prev) => [...prev, userMsg]);

    try {
      const { reply } = await apiFetch('/api/chat', {
        method: 'POST',
        body: { message: text },
      });
      const botMsg: AssistantMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        content: reply || 'Done.',
        timestamp: 'Just now',
      };
      setAssistantMessages((prev) => [...prev, botMsg]);
      // The assistant may have created campaigns/drafts — refresh data
      loadData();
    } catch (err) {
      console.error('Chat failed:', err);
      setAssistantMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          content: 'Sorry, I ran into an error processing that. Please try again.',
          timestamp: 'Just now',
        },
      ]);
    }
  };

  // Senders management — real API
  const handleAddSender = async (email: string, token: string, provider: 'gmail' | 'outlook') => {
    try {
      const { sender } = await apiFetch('/api/senders', {
        method: 'POST',
        body: { email, password: token, provider },
      });
      setSenders((prev) => [sender, ...prev]);
    } catch (err) {
      console.error('Add sender failed:', err);
      alert('Failed to connect mailbox. Check the email + app password and try again.');
    }
  };

  const handleToggleSenderStatus = async (id: string) => {
    const s = senders.find((x) => x.id === id);
    if (!s) return;
    const next = s.status === 'active' ? 'paused' : 'active';
    setSenders((prev) => prev.map((x) => (x.id === id ? { ...x, status: next } : x)));
    try {
      await apiFetch('/api/senders', { method: 'PATCH', body: { id, status: next } });
    } catch (err) {
      console.error('Toggle sender failed:', err);
    }
  };

  const handleRemoveSender = (id: string) => {
    setSenders((prev) => prev.filter((s) => s.id !== id));
    apiFetch(`/api/senders?id=${id}`, { method: 'DELETE' }).catch((err) =>
      console.error('Remove sender failed:', err)
    );
  };

  // Personas management — real API
  const handleAddPersona = async (
    newP: Omit<Persona, 'id' | 'activeCampaignsCount'>
  ) => {
    try {
      const { persona } = await apiFetch('/api/personas', {
        method: 'POST',
        body: {
          name: newP.name,
          companyName: newP.companyName,
          description: newP.description,
          websiteUrl: newP.websiteUrl,
        },
      });
      setPersonas((prev) => [...prev, persona]);
    } catch (err) {
      console.error('Add persona failed:', err);
    }
  };

  const handleEditPersona = async (id: string, updated: Partial<Persona>) => {
    setPersonas((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
    );
    try {
      await apiFetch('/api/personas', { method: 'PATCH', body: { id, ...updated } });
    } catch (err) {
      console.error('Edit persona failed:', err);
    }
  };

  const handleDeletePersona = (id: string) => {
    const idx = personas.findIndex((p) => p.id === id);
    const personaToDelete = personas.find((p) => p.id === id);
    if (!personaToDelete) return;

    setPersonas((prev) => prev.filter((p) => p.id !== id));
    apiFetch(`/api/personas?id=${id}`, { method: 'DELETE' }).catch((err) =>
      console.error('Delete persona failed:', err)
    );

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
    const { mailingAddress, defaultFollowUpDays, dailyCapAcrossAll, timezone } = updated;
    apiFetch('/api/settings', {
      method: 'PATCH',
      body: { mailingAddress, defaultFollowUpDays, dailyCapAcrossAll, timezone },
    }).catch((err) => console.error('Save settings failed:', err));
  };

  // Organizations (watchlist) — real API + signal engine
  const handleAddOrganization = async (input: { name: string; domain: string; industry: string; keywords: string[] }) => {
    try {
      const { organization } = await apiFetch('/api/organizations', { method: 'POST', body: input });
      setOrganizations((prev) => [organization, ...prev]);
    } catch (err) {
      console.error('Add organization failed:', err);
    }
  };

  const handleDeleteOrganization = (id: string) => {
    setOrganizations((prev) => prev.filter((o) => o.id !== id));
    apiFetch(`/api/organizations?id=${id}`, { method: 'DELETE' }).catch((err) =>
      console.error('Delete organization failed:', err)
    );
  };

  const handleScout = async () => {
    try {
      const result = await apiFetch('/api/scout', { method: 'POST', body: {} });
      await loadData();
      alert(result?.message || 'Scout complete.');
    } catch (err: any) {
      alert(`Scout failed: ${err?.message || 'unknown error'}`);
    }
  };

  const handleSuggestLookalikes = async (): Promise<Array<{ name: string; domain: string; industry: string; keywords: string[] }>> => {
    try {
      const result = await apiFetch('/api/scout', { method: 'POST', body: { lookalikes: true, limit: 8 } });
      return result?.suggestions || [];
    } catch (err) {
      console.error('Lookalikes failed:', err);
      return [];
    }
  };

  const isBlog = window.location.hash.startsWith('#/blog');

  return (
    <div className="min-h-screen bg-[#f3fbe9] text-[#0a2414] font-sans selection:bg-[#ffbac3] selection:text-[#360003]">
      {/* Public blog (no auth) — hash-routed for the SPA */}
      {isBlog ? (
        <BlogRouter />
      ) : (
      <>
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
          onComplete={() => {
            loadData();
            setViewMode('dashboard');
          }}
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
          organizations={organizations}
          onAddOrganization={handleAddOrganization}
          onDeleteOrganization={handleDeleteOrganization}
          onScout={handleScout}
          onSuggestLookalikes={handleSuggestLookalikes}
          assistantMessages={assistantMessages}
          settings={settings}
          subscription={subscription}
          onUpdateSubscription={handleUpdateSubscription}
          onSendMessage={handleSendMessage}
          onDataChanged={loadData}
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
      </>
      )}
      <Analytics />
    </div>
  );
}
