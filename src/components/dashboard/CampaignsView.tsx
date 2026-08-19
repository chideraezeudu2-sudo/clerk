import React, { useState } from 'react';
import { Campaign, Persona } from '../../types';

interface CampaignsViewProps {
  campaigns: Campaign[];
  personas: Persona[];
  selectedCampaignId: string | null;
  onSelectCampaign: (id: string | null) => void;
  onToggleStatus: (id: string) => void;
  onDeleteCampaign: (id: string) => void;
  onCreateCampaign: (newCamp: Partial<Campaign>) => void;
  onUpdateVoiceFeedback: (campaignId: string, draftId: string, isLiked: boolean) => void;
}

export const CampaignsView: React.FC<CampaignsViewProps> = ({
  campaigns,
  personas,
  selectedCampaignId,
  onSelectCampaign,
  onToggleStatus,
  onDeleteCampaign,
  onCreateCampaign,
  onUpdateVoiceFeedback,
}) => {
  const [subTab, setSubTab] = useState<'signals' | 'sequence' | 'voice'>('signals');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paused'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // New Campaign Form State
  const [newTitle, setNewTitle] = useState('');
  const [newPersonaId, setNewPersonaId] = useState(personas[0]?.id || '');
  const [newSignalsText, setNewSignalsText] = useState('Hiring VP Eng, Raised $8M+, Apollo Migration');
  const [newVoiceNote, setNewVoiceNote] = useState('Concise, peer-to-peer, under 85 words');

  const triggerToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 2500);
  };

  const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId);

  // Aggregate stats
  const totalLeads = campaigns.reduce((acc, c) => acc + c.leadsCount, 0);
  const totalSent = campaigns.reduce((acc, c) => acc + c.sentCount, 0);
  const totalReplies = campaigns.reduce((acc, c) => acc + c.repliedCount, 0);
  const avgReplyRate = totalSent > 0 ? ((totalReplies / totalSent) * 100).toFixed(1) : '0.0';
  const activeCount = campaigns.filter((c) => c.status === 'active').length;

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'active' && c.status === 'active') ||
      (filterStatus === 'paused' && c.status === 'paused');

    const matchesSearch =
      !searchQuery.trim() ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.signalKeywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onCreateCampaign({
      name: newTitle,
      personaId: newPersonaId,
      signalKeywords: newSignalsText.split(',').map((s) => s.trim()).filter(Boolean),
      voiceNotes: newVoiceNote,
    });

    setNewTitle('');
    setShowCreateModal(false);
    triggerToast(`Campaign "${newTitle}" created and crawler activated.`);
  };

  return (
    <div id="dashboard-campaigns-view" className="space-y-6">
      {/* Toast Notification */}
      {feedbackToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0a2414] text-[#ffffff] px-4 py-2.5 rounded-[10px] text-[13px] border border-[#17b267]/30 flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-[#1ad379]" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* If viewing Campaign Details */}
      {selectedCampaign ? (
        <div className="space-y-6">
          {/* Top Detail Navigation Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#0a2414]/10">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => onSelectCampaign(null)}
                className="px-3.5 py-2 rounded-[10px] border border-[#0a2414]/12 bg-[#ffffff] hover:bg-[#fafaf9] text-[#0a2414] text-[13px] font-medium transition-colors flex items-center space-x-1.5"
                aria-label="Back to campaigns list"
              >
                <span>←</span>
                <span>All Campaigns</span>
              </button>
              <div>
                <div className="flex items-center space-x-2.5">
                  <h1 className="text-[22px] font-semibold text-[#0a2414] tracking-tight">
                    {selectedCampaign.name}
                  </h1>
                  <span
                    className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-[6px] text-[11.5px] font-semibold tracking-tight ${
                      selectedCampaign.status === 'active'
                        ? 'bg-[#f3fbe9] text-[#17b267] border border-[#17b267]/30'
                        : 'bg-[#fafaf9] text-[#607166] border border-[#0a2414]/10'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        selectedCampaign.status === 'active' ? 'bg-[#1ad379]' : 'bg-[#607166]'
                      }`}
                    />
                    <span className="capitalize">{selectedCampaign.status}</span>
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-[12.5px] text-[#607166] mt-0.5">
                  <span>{selectedCampaign.leadsCount} leads found</span>
                  <span>•</span>
                  <span>{selectedCampaign.sentCount} sent</span>
                  <span>•</span>
                  <span className="text-[#17b267] font-semibold">
                    {selectedCampaign.repliedCount} replies (
                    {selectedCampaign.sentCount > 0
                      ? ((selectedCampaign.repliedCount / selectedCampaign.sentCount) * 100).toFixed(1)
                      : 0}
                    %)
                  </span>
                </div>
              </div>
            </div>

            {/* Campaign Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  onToggleStatus(selectedCampaign.id);
                  triggerToast(
                    selectedCampaign.status === 'active' ? 'Campaign paused' : 'Campaign resumed'
                  );
                }}
                className="px-3.5 py-2 rounded-[10px] border border-[#0a2414]/12 bg-[#ffffff] hover:bg-[#fafaf9] text-[#0a2414] text-[13px] font-medium transition-colors"
              >
                {selectedCampaign.status === 'active' ? 'Pause Campaign' : 'Resume Campaign'}
              </button>

              <button
                onClick={() => setDeleteConfirmId(selectedCampaign.id)}
                className="px-3.5 py-2 rounded-[10px] border border-[#0a2414]/12 hover:bg-[#ffbac3]/20 hover:text-[#360003] text-[#607166] text-[13px] font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>

          {/* Sub-Tabs: Signals / Sequence / Voice */}
          <div className="flex border-b border-[#0a2414]/10 space-x-6">
            <button
              onClick={() => setSubTab('signals')}
              className={`pb-3 text-[14px] font-medium transition-colors relative ${
                subTab === 'signals'
                  ? 'text-[#0a2414] border-b-2 border-[#1ad379]'
                  : 'text-[#607166] hover:text-[#0a2414]'
              }`}
            >
              Live Signals ({selectedCampaign.signals.length})
            </button>
            <button
              onClick={() => setSubTab('sequence')}
              className={`pb-3 text-[14px] font-medium transition-colors relative ${
                subTab === 'sequence'
                  ? 'text-[#0a2414] border-b-2 border-[#1ad379]'
                  : 'text-[#607166] hover:text-[#0a2414]'
              }`}
            >
              Sequence Steps ({selectedCampaign.sequence.length})
            </button>
            <button
              onClick={() => setSubTab('voice')}
              className={`pb-3 text-[14px] font-medium transition-colors relative ${
                subTab === 'voice'
                  ? 'text-[#0a2414] border-b-2 border-[#1ad379]'
                  : 'text-[#607166] hover:text-[#0a2414]'
              }`}
            >
              Voice Feedback Tuning
            </button>
          </div>

          {/* 1. SIGNALS SUB-TAB */}
          {subTab === 'signals' && (
            <div className="space-y-4">
              <div className="p-4 rounded-[10px] bg-[#ffffff] border border-[#17b267]/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[13px]">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#1ad379] animate-pulse" />
                  <div>
                    <span className="font-semibold text-[#0a2414]">Active Intent Triggers:</span>{' '}
                    <span className="text-[#283a2e]">
                      {selectedCampaign.signalKeywords.join(' • ')}
                    </span>
                  </div>
                </div>
                <span className="text-[#17b267] font-semibold px-2.5 py-0.5 rounded-[6px] bg-[#f3fbe9] border border-[#17b267]/30 text-[12px]">
                  Autonomous Crawler Active
                </span>
              </div>

              {selectedCampaign.signals.length === 0 ? (
                <div className="p-12 text-center bg-[#ffffff] rounded-[10px] border border-[#0a2414]/10 space-y-2">
                  <p className="text-[#0a2414] font-medium">No signals detected for this campaign yet.</p>
                  <p className="text-[13px] text-[#607166]">
                    clerk crawls job boards, press releases, and feeds continuously. New verified leads will surface here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {selectedCampaign.signals.map((sig) => (
                    <div
                      key={sig.id}
                      className="p-6 rounded-[10px] bg-[#ffffff] border border-[#0a2414]/10 space-y-3 hover:border-[#17b267]/40 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <span className="text-[11px] px-2 py-0.5 rounded-[6px] bg-[#f3fbe9] border border-[#17b267]/30 text-[#17b267] font-semibold uppercase tracking-wider">
                            {sig.type}
                          </span>
                          <span className="text-[15px] font-semibold text-[#0a2414]">
                            {sig.company}
                          </span>
                          <span className="text-[13px] text-[#607166]">
                            • {sig.contactName} ({sig.contactRole})
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-[12px] text-[#607166]">
                          <span className="px-2 py-0.5 rounded-[6px] bg-[#f3fbe9] border border-[#17b267]/30 text-[#17b267] font-semibold">
                            {sig.confidenceScore}% Confidence
                          </span>
                          <span>{sig.detectedAt}</span>
                        </div>
                      </div>

                      <div className="text-[14px] font-medium text-[#0a2414]">
                        {sig.title}
                      </div>

                      <p className="text-[13px] leading-relaxed text-[#283a2e] bg-[#fafaf9] p-3.5 rounded-[8px] border border-[#0a2414]/6">
                        {sig.detail}
                      </p>

                      {sig.sourceUrl && (
                        <div className="text-[12px] text-[#17b267] font-medium flex items-center space-x-1">
                          <span>Verified Source:</span>
                          <span className="underline">{sig.sourceUrl}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. SEQUENCE SUB-TAB */}
          {subTab === 'sequence' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-[#fafaf9] rounded-[10px] border border-[#0a2414]/8 text-[13px] text-[#607166]">
                Sequence cadence pauses automatically upon recipient reply, calendar booking, or out-of-office response.
              </div>

              <div className="space-y-4">
                {selectedCampaign.sequence.map((step) => (
                  <div
                    key={step.stepNumber}
                    className="p-6 rounded-[10px] bg-[#ffffff] border border-[#0a2414]/10 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#0a2414]/6 pb-3">
                      <div className="flex items-center space-x-2.5">
                        <span className="w-6 h-6 rounded-[6px] bg-[#0a2414] text-[#ffffff] text-[12px] flex items-center justify-center font-bold">
                          {step.stepNumber}
                        </span>
                        <span className="font-semibold text-[#0a2414] text-[15px]">
                          {step.label}
                        </span>
                      </div>

                      <div className="flex items-center space-x-4 text-[12.5px] text-[#607166]">
                        <span>
                          Delay:{' '}
                          <strong className="text-[#0a2414]">
                            {step.delayDays === 0 ? 'Immediate' : `${step.delayDays} days later`}
                          </strong>
                        </span>
                        <span>
                          Open Rate:{' '}
                          <strong className="text-[#0a2414]">{step.openRate}%</strong>
                        </span>
                        <span>
                          Reply Rate:{' '}
                          <strong className="text-[#17b267] font-semibold">{step.replyRate}%</strong>
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 bg-[#fafaf9] rounded-[8px] text-[13px] text-[#283a2e] leading-relaxed border border-[#0a2414]/6 font-sans">
                      {step.templateSnippet}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. VOICE SUB-TAB */}
          {subTab === 'voice' && (
            <div className="space-y-6">
              <div className="p-4 rounded-[10px] bg-[#ffffff] border border-[#17b267]/30 text-[13px] text-[#283a2e] space-y-1">
                <span className="font-semibold text-[#0a2414] block">Current Campaign Voice Directive:</span>
                <p>{selectedCampaign.voiceNotes}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-[16px] font-semibold text-[#0a2414]">
                    Recent Drafts Feedback for Voice Shaping
                  </h3>
                  <p className="text-[13px] text-[#607166]">
                    Mark which samples sound like you and which don't. Your feedback shapes future drafts for this campaign specifically.
                  </p>
                </div>

                {selectedCampaign.voiceDrafts.map((vd) => (
                  <div
                    key={vd.id}
                    className="p-6 rounded-[10px] bg-[#ffffff] border border-[#0a2414]/10 space-y-3"
                  >
                    <div className="font-semibold text-[14px] text-[#0a2414]">
                      Subject: {vd.subject}
                    </div>
                    <div className="p-3.5 bg-[#fafaf9] rounded-[8px] text-[13px] leading-relaxed text-[#283a2e] border border-[#0a2414]/6 italic">
                      "{vd.snippet}"
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#0a2414]/6">
                      <span className="text-[12px] text-[#607166]">
                        Does this sound like how you write?
                      </span>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            onUpdateVoiceFeedback(selectedCampaign.id, vd.id, true);
                            triggerToast('Positive voice feedback recorded.');
                          }}
                          className={`px-3 py-1.5 rounded-[8px] border text-[12px] font-medium transition-colors ${
                            vd.isLiked
                              ? 'bg-[#f3fbe9] border-[#17b267] text-[#17b267] font-semibold'
                              : 'bg-white border-[#0a2414]/15 text-[#607166] hover:text-[#0a2414]'
                          }`}
                        >
                          ✓ Sounds like me
                        </button>

                        <button
                          onClick={() => {
                            onUpdateVoiceFeedback(selectedCampaign.id, vd.id, false);
                            triggerToast('Negative voice feedback recorded for retraining.');
                          }}
                          className={`px-3 py-1.5 rounded-[8px] border text-[12px] font-medium transition-colors ${
                            vd.isDisliked
                              ? 'bg-[#ffbac3]/20 border-[#ffbac3] text-[#360003] font-semibold'
                              : 'bg-white border-[#0a2414]/15 text-[#607166] hover:text-[#0a2414]'
                          }`}
                        >
                          ✕ Too generic
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Campaign List View */
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-[24px] font-semibold tracking-tight text-[#0a2414]">
                Campaigns
              </h1>
              <p className="text-[13.5px] text-[#607166]">
                Targeted intent watchers running across your connected inbox pool.
              </p>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 rounded-[10px] bg-[#1ad379] hover:bg-[#17b267] text-[#0a2414] text-[13.5px] font-semibold tracking-tight transition-all self-start sm:self-auto flex items-center space-x-2"
            >
              <span>+ New campaign</span>
            </button>
          </div>

          {/* Overview Metrics Strip - Flat white with 1px borders */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <div className="p-6 rounded-[10px] bg-[#ffffff] border border-[#0a2414]/10">
              <div className="text-[12px] text-[#607166] font-medium mb-1">Active Watchers</div>
              <div className="text-[24px] font-semibold text-[#0a2414]">
                {activeCount}{' '}
                <span className="text-[13.5px] font-normal text-[#607166]">/ {campaigns.length} total</span>
              </div>
              <div className="text-[11.5px] text-[#17b267] mt-1 font-medium">Real-time crawling active</div>
            </div>

            <div className="p-6 rounded-[10px] bg-[#ffffff] border border-[#0a2414]/10">
              <div className="text-[12px] text-[#607166] font-medium mb-1">Total Leads Detected</div>
              <div className="text-[24px] font-semibold text-[#0a2414]">{totalLeads}</div>
              <div className="text-[11.5px] text-[#607166] mt-1">100% verified work emails</div>
            </div>

            <div className="p-6 rounded-[10px] bg-[#ffffff] border border-[#0a2414]/10">
              <div className="text-[12px] text-[#607166] font-medium mb-1">Emails Dispatched</div>
              <div className="text-[24px] font-semibold text-[#0a2414]">{totalSent}</div>
              <div className="text-[11.5px] text-[#607166] mt-1">Load-balanced across pool</div>
            </div>

            <div className="p-6 rounded-[10px] bg-[#ffffff] border border-[#0a2414]/10">
              <div className="text-[12px] text-[#607166] font-medium mb-1">Reply Conversion</div>
              <div className="text-[24px] font-semibold text-[#17b267] flex items-baseline space-x-1.5">
                <span>{avgReplyRate}%</span>
                <span className="text-[13px] font-medium text-[#0a2414]">({totalReplies} replies)</span>
              </div>
              <div className="text-[11.5px] text-[#607166] mt-1">3.8x industry average</div>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center space-x-1.5 p-1.5 bg-[#ffffff] rounded-[10px] border border-[#0a2414]/10 self-start">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1 text-[12.5px] rounded-[6px] font-medium transition-all ${
                  filterStatus === 'all'
                    ? 'bg-[#ffffff] text-[#0a2414] border border-[#0a2414]/15'
                    : 'text-[#607166] hover:text-[#0a2414]'
                }`}
              >
                All ({campaigns.length})
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={`px-3 py-1 text-[12.5px] rounded-[6px] font-medium transition-all ${
                  filterStatus === 'active'
                    ? 'bg-[#ffffff] text-[#0a2414] border border-[#0a2414]/15'
                    : 'text-[#607166] hover:text-[#0a2414]'
                }`}
              >
                Active ({activeCount})
              </button>
              <button
                onClick={() => setFilterStatus('paused')}
                className={`px-3 py-1 text-[12.5px] rounded-[6px] font-medium transition-all ${
                  filterStatus === 'paused'
                    ? 'bg-[#ffffff] text-[#0a2414] border border-[#0a2414]/15'
                    : 'text-[#607166] hover:text-[#0a2414]'
                }`}
              >
                Paused ({campaigns.length - activeCount})
              </button>
            </div>

            <div className="relative max-w-xs w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search campaigns or triggers..."
                className="w-full px-3.5 py-2 pl-8 rounded-[10px] border border-[#0a2414]/12 bg-white text-[13px] text-[#0a2414] outline-none focus:border-[#17b267]"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#607166] text-[12px]">
                🔍
              </span>
            </div>
          </div>

          {/* List of campaigns */}
          <div className="grid grid-cols-1 gap-4">
            {filteredCampaigns.map((camp) => {
              const campPersona = personas.find((p) => p.id === camp.personaId);
              const replyPercent =
                camp.sentCount > 0 ? Math.round((camp.repliedCount / camp.sentCount) * 100) : 0;

              return (
                <div
                  key={camp.id}
                  className="p-6 rounded-[10px] bg-[#ffffff] border border-[#0a2414]/10 hover:border-[#17b267]/40 transition-all group flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
                >
                  {/* Left info column */}
                  <div className="space-y-2.5 flex-1 min-w-0">
                    <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                      <h3
                        onClick={() => onSelectCampaign(camp.id)}
                        className="text-[16px] font-semibold text-[#0a2414] group-hover:text-[#17b267] transition-colors cursor-pointer"
                      >
                        {camp.name}
                      </h3>

                      <span
                        className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-[6px] text-[11.5px] font-semibold ${
                          camp.status === 'active'
                            ? 'bg-[#f3fbe9] text-[#17b267] border border-[#17b267]/30'
                            : 'bg-[#fafaf9] text-[#607166] border border-[#0a2414]/10'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            camp.status === 'active' ? 'bg-[#1ad379]' : 'bg-[#607166]'
                          }`}
                        />
                        <span className="capitalize">{camp.status}</span>
                      </span>

                      {campPersona && (
                        <span className="text-[12px] text-[#607166] px-2.5 py-0.5 rounded-[6px] bg-[#fafaf9] border border-[#0a2414]/8">
                          Voice: {campPersona.name}
                        </span>
                      )}
                    </div>

                    {/* Trigger Badges */}
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1.5 text-[12px]">
                      <span className="text-[#607166] font-medium text-[11.5px] uppercase tracking-wider">
                        Watching:
                      </span>
                      {camp.signalKeywords.map((kw, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 rounded-[6px] bg-[#fafaf9] text-[#283a2e] border border-[#0a2414]/8 font-medium flex items-center space-x-1"
                        >
                          <span className="text-[#17b267] font-bold">•</span>
                          <span>{kw}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Middle stats & conversion */}
                  <div className="flex items-center space-x-5 sm:space-x-7 text-[13px] bg-[#fafaf9] p-4 rounded-[10px] border border-[#0a2414]/8 shrink-0">
                    <div>
                      <span className="text-[#607166] block text-[11px] font-medium">Leads</span>
                      <strong className="text-[17px] font-semibold text-[#0a2414]">
                        {camp.leadsCount}
                      </strong>
                    </div>
                    <div className="w-[1px] h-7 bg-[#0a2414]/10" />
                    <div>
                      <span className="text-[#607166] block text-[11px] font-medium">Sent</span>
                      <strong className="text-[17px] font-semibold text-[#0a2414]">
                        {camp.sentCount}
                      </strong>
                    </div>
                    <div className="w-[1px] h-7 bg-[#0a2414]/10" />
                    <div>
                      <span className="text-[#607166] block text-[11px] font-medium">Replies</span>
                      <div className="flex items-baseline space-x-1">
                        <strong className="text-[17px] font-semibold text-[#17b267]">
                          {camp.repliedCount}
                        </strong>
                        <span className="text-[11.5px] font-medium text-[#17b267]">
                          ({replyPercent}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right actions */}
                  <div className="flex items-center space-x-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#0a2414]/6 shrink-0">
                    <button
                      onClick={() => {
                        onToggleStatus(camp.id);
                        triggerToast(camp.status === 'active' ? 'Campaign paused' : 'Campaign resumed');
                      }}
                      className="px-3.5 py-2 rounded-[10px] border border-[#0a2414]/12 bg-[#ffffff] hover:bg-[#fafaf9] text-[#0a2414] text-[13px] font-medium transition-colors"
                    >
                      {camp.status === 'active' ? 'Pause' : 'Resume'}
                    </button>

                    <button
                      onClick={() => onSelectCampaign(camp.id)}
                      className="px-4 py-2 rounded-[10px] bg-[#1ad379] hover:bg-[#17b267] text-[#0a2414] text-[13px] font-semibold transition-all flex items-center space-x-1"
                    >
                      <span>Manage</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CREATE CAMPAIGN MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#ffffff] rounded-[10px] p-6 sm:p-8 border border-[#0a2414]/10 space-y-5">
            <div>
              <h2 className="text-[20px] font-semibold text-[#0a2414]">Create New Intent Campaign</h2>
              <p className="text-[13px] text-[#607166]">
                Set up automated signal monitoring to draft contextual peer-to-peer outreach.
              </p>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-[#0a2414] mb-1">
                  Campaign Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Series A HealthTech & Apollo Migrations"
                  className="w-full px-3.5 py-2 rounded-[10px] border border-[#0a2414]/15 text-[14px] outline-none focus:border-[#17b267]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[#0a2414] mb-1">
                  Sending Persona & Brand Voice
                </label>
                <select
                  value={newPersonaId}
                  onChange={(e) => setNewPersonaId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-[10px] border border-[#0a2414]/15 text-[14px] outline-none bg-white"
                >
                  {personas.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.companyName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[#0a2414] mb-1">
                  Intent Signals to Watch (comma separated)
                </label>
                <input
                  type="text"
                  value={newSignalsText}
                  onChange={(e) => setNewSignalsText(e.target.value)}
                  placeholder="e.g. Hiring VP Eng, Raised $8M+, G2 negative review, Apollo Migration"
                  className="w-full px-3.5 py-2 rounded-[10px] border border-[#0a2414]/15 text-[14px] outline-none focus:border-[#17b267]"
                />
                <span className="text-[11.5px] text-[#607166] mt-1 block">
                  clerk crawls job postings, news releases, funding events, and forums for these triggers.
                </span>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[#0a2414] mb-1">
                  Draft Voice Guidance
                </label>
                <textarea
                  rows={2}
                  value={newVoiceNote}
                  onChange={(e) => setNewVoiceNote(e.target.value)}
                  placeholder="e.g. Peer to peer, concise, reference the trigger in line 1, under 85 words..."
                  className="w-full px-3.5 py-2 rounded-[10px] border border-[#0a2414]/15 text-[14px] outline-none focus:border-[#17b267]"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#0a2414]/8">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-[13.5px] font-medium text-[#607166] hover:text-[#0a2414]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-[10px] bg-[#1ad379] hover:bg-[#17b267] text-[#0a2414] text-[13.5px] font-semibold transition-all"
                >
                  Create & Launch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#ffffff] rounded-[10px] p-6 border border-[#0a2414]/10 space-y-4">
            <h3 className="text-[18px] font-semibold text-[#0a2414]">Delete Campaign?</h3>
            <p className="text-[14px] text-[#283a2e] leading-relaxed">
              This will stop all signal monitoring and remove scheduled sequence follow-ups. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-[13.5px] font-medium text-[#607166]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteCampaign(deleteConfirmId);
                  setDeleteConfirmId(null);
                  onSelectCampaign(null);
                  triggerToast('Campaign deleted.');
                }}
                className="px-4 py-2 rounded-[10px] bg-[#ffbac3] hover:bg-[#ffbac3]/80 text-[#360003] text-[13.5px] font-semibold"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
