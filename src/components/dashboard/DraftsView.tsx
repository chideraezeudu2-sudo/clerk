import React, { useState } from 'react';
import { DraftEmail, Campaign, UserSubscription } from '../../types';
import { EmptyState } from '../EmptyState';
import { PLANS } from '../../data/plansData';

interface DraftsViewProps {
  drafts: DraftEmail[];
  campaigns: Campaign[];
  organizationCount?: number;
  onApproveDraft: (id: string) => void;
  onApproveAll: () => void;
  onBatchApproveDrafts?: (ids: string[]) => void;
  onBatchRejectDrafts?: (ids: string[], reason: string) => void;
  onBatchDeleteDrafts?: (ids: string[]) => void;
  onEditDraft: (id: string, updatedSubject: string, updatedBody: string) => void;
  onRejectDraft: (id: string, reason: string) => void;
  onDeleteDraft?: (id: string) => void;
  subscription?: UserSubscription;
  onOpenUpgradeModal?: () => void;
}

export const DraftsView: React.FC<DraftsViewProps> = ({
  drafts,
  campaigns,
  organizationCount,
  onApproveDraft,
  onApproveAll,
  onBatchApproveDrafts,
  onBatchRejectDrafts,
  onBatchDeleteDrafts,
  onEditDraft,
  onRejectDraft,
  onDeleteDraft,
  subscription,
  onOpenUpgradeModal,
}) => {
  const [viewMode, setViewMode] = useState<'inspector' | 'list'>('inspector');
  const [selectedDraftIndex, setSelectedDraftIndex] = useState<number>(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  const pendingDrafts = drafts.filter((d) => d.status === 'pending');
  const currentDraft = pendingDrafts[selectedDraftIndex] || pendingDrafts[0];

  const [editSubject, setEditSubject] = useState(currentDraft?.subject || '');
  const [editBody, setEditBody] = useState(currentDraft?.body || '');
  const [rejectingSingle, setRejectingSingle] = useState(false);
  const [rejectingBatch, setRejectingBatch] = useState(false);
  const [rejectReason, setRejectReason] = useState('Too generic / does not sound like me');

  const currentPlan = subscription ? PLANS[subscription.plan] : PLANS.growth;
  const isLeadCapHit = subscription
    ? subscription.monthlyLeadsUsed >= currentPlan.maxMonthlyLeads
    : false;

  // Update edit buffer when current draft changes
  React.useEffect(() => {
    if (currentDraft) {
      setEditSubject(currentDraft.subject);
      setEditBody(currentDraft.body);
    }
  }, [currentDraft?.id]);

  // Handle master selection checkbox
  const isAllSelected =
    pendingDrafts.length > 0 && selectedIds.length === pendingDrafts.length;
  const isSomeSelected =
    selectedIds.length > 0 && selectedIds.length < pendingDrafts.length;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendingDrafts.map((d) => d.id));
    }
  };

  const handleToggleSelectOne = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSaveEdit = () => {
    if (currentDraft) {
      onEditDraft(currentDraft.id, editSubject, editBody);
      setIsEditing(false);
    }
  };

  const handleApproveCurrent = () => {
    if (currentDraft) {
      onApproveDraft(currentDraft.id);
      setSelectedIds((prev) => prev.filter((id) => id !== currentDraft.id));
      if (selectedDraftIndex >= pendingDrafts.length - 1) {
        setSelectedDraftIndex(Math.max(0, pendingDrafts.length - 2));
      }
    }
  };

  const handleRejectCurrentConfirm = () => {
    if (currentDraft) {
      onRejectDraft(currentDraft.id, rejectReason);
      setRejectingSingle(false);
      setSelectedIds((prev) => prev.filter((id) => id !== currentDraft.id));
      if (selectedDraftIndex >= pendingDrafts.length - 1) {
        setSelectedDraftIndex(Math.max(0, pendingDrafts.length - 2));
      }
    }
  };

  // Batch actions
  const handleBatchApprove = () => {
    if (selectedIds.length === 0) return;
    if (onBatchApproveDrafts) {
      onBatchApproveDrafts(selectedIds);
    } else {
      selectedIds.forEach((id) => onApproveDraft(id));
    }
    setSelectedIds([]);
    setSelectedDraftIndex(0);
  };

  const handleBatchRejectConfirm = () => {
    if (selectedIds.length === 0) return;
    if (onBatchRejectDrafts) {
      onBatchRejectDrafts(selectedIds, rejectReason);
    } else {
      selectedIds.forEach((id) => onRejectDraft(id, rejectReason));
    }
    setRejectingBatch(false);
    setSelectedIds([]);
    setSelectedDraftIndex(0);
  };

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) return;
    if (onBatchDeleteDrafts) {
      onBatchDeleteDrafts(selectedIds);
    } else if (onDeleteDraft) {
      selectedIds.forEach((id) => onDeleteDraft(id));
    }
    setSelectedIds([]);
    setSelectedDraftIndex(0);
  };

  if (pendingDrafts.length === 0) {
    return (
      <div id="dashboard-drafts-empty" className="space-y-6">
        <EmptyState
          type="drafts"
          title="Review queue is clear"
          description="All personalized drafts have been approved or dispatched. When Klerk detects new buying triggers across your campaigns, generated emails will appear here for 1-click review."
          secondaryAction={{
            label: 'View Sent Emails History',
            onClick: () => {
              const sentBtn = document.querySelector('[data-tab="sent"]') as HTMLElement;
              if (sentBtn) sentBtn.click();
            },
          }}
        />
      </div>
    );
  }

  return (
    <div id="dashboard-drafts-view" className="space-y-6">
      {/* Monthly Lead Cap Limit Banner (if hit) */}
      {isLeadCapHit && (
        <div className="p-4 rounded-[10px] bg-[#f3fbe9] border-2 border-[#17b267] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[13.5px]">
          <div className="flex items-start space-x-3">
            <span className="text-[18px]">⚠️</span>
            <div>
              <p className="font-semibold text-[#0a2414]">
                Monthly lead limit reached ({subscription?.monthlyLeadsUsed} / {currentPlan.maxMonthlyLeads} leads on {currentPlan.name})
              </p>
              <p className="text-[12.5px] text-[#607166]">
                Existing drafts can still be reviewed and sent. New lead scouting is paused until your next billing cycle.
              </p>
            </div>
          </div>
          {onOpenUpgradeModal && (
            <button
              onClick={onOpenUpgradeModal}
              className="px-4 py-2 rounded-[8px] bg-[#1ad379] hover:bg-[#17b267] text-[#0a2414] font-semibold text-[13px] tracking-tight shrink-0 shadow-sm transition-all"
            >
              Upgrade plan for higher cap →
            </button>
          )}
        </div>
      )}

      {/* Top Application Breadcrumb and Watching Caps */}
      <div className="bg-[#ffffff] rounded-[10px] border border-[#0a2414]/10 p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="flex space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0a2414]/20"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#0a2414]/20"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#0a2414]/20"></span>
          </div>
          <span className="text-[14px] font-medium text-[#0a2414] pl-3 border-l border-[#0a2414]/10">
            Klerk / queue / pending-review
          </span>
        </div>

        <div className="flex items-center space-x-3 text-[13px]">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-[8px] bg-[#fafaf9] border border-[#0a2414]/10 text-[12.5px]">
            <button
              onClick={() => setViewMode('inspector')}
              className={`px-3 py-1 rounded-[6px] font-medium transition-all ${
                viewMode === 'inspector'
                  ? 'bg-[#ffffff] text-[#0a2414] shadow-xs'
                  : 'text-[#607166] hover:text-[#0a2414]'
              }`}
            >
              Inspector View
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-[6px] font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-[#ffffff] text-[#0a2414] shadow-xs'
                  : 'text-[#607166] hover:text-[#0a2414]'
              }`}
            >
              Queue List View
            </button>
          </div>

          {typeof organizationCount === 'number' && (
            <span className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-[10px] bg-[#f3fbe9] border border-[#17b267]/30 text-[#0a2414] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1ad379]"></span>
              <span>Watching {organizationCount} {organizationCount === 1 ? 'company' : 'companies'}</span>
            </span>
          )}

          {pendingDrafts.length > 1 && (
            <button
              onClick={onApproveAll}
              className="px-4 py-1.5 rounded-[8px] bg-[#0a2414] text-[#ffffff] font-medium hover:bg-[#17b267] hover:text-[#0a2414] transition-colors"
            >
              Approve All ({pendingDrafts.length})
            </button>
          )}
        </div>
      </div>

      {/* BATCH ACTION BAR (Shown whenever items are selected) */}
      {selectedIds.length > 0 && (
        <div className="p-4 rounded-[10px] bg-[#0a2414] text-[#ffffff] border border-[#17b267]/30 flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-150 shadow-lg">
          <div className="flex items-center space-x-3">
            <span className="w-2 h-2 rounded-full bg-[#1ad379]" />
            <span className="text-[13.5px] font-semibold">
              {selectedIds.length} of {pendingDrafts.length} draft{selectedIds.length > 1 ? 's' : ''} selected
            </span>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={handleBatchApprove}
              className="px-4 py-1.5 rounded-[6px] bg-[#1ad379] hover:bg-[#17b267] text-[#0a2414] text-[13px] font-semibold transition-all active:scale-[0.98]"
            >
              Approve Selected ({selectedIds.length})
            </button>
            <button
              type="button"
              onClick={() => setRejectingBatch(true)}
              className="px-3.5 py-1.5 rounded-[6px] bg-[#ffffff]/10 hover:bg-[#ffffff]/20 text-[#ffffff] text-[13px] font-medium transition-colors"
            >
              Reject Selected
            </button>
            <button
              type="button"
              onClick={handleBatchDelete}
              className="px-3.5 py-1.5 rounded-[6px] bg-[#ffbac3]/20 hover:bg-[#ffbac3]/30 text-[#ffbac3] text-[13px] font-medium transition-colors"
            >
              Discard ({selectedIds.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="px-2.5 py-1.5 text-[12.5px] text-[#ffffff]/60 hover:text-[#ffffff] transition-colors"
            >
              Deselect
            </button>
          </div>
        </div>
      )}

      {/* VIEW MODE 1: QUEUE LIST VIEW WITH BULK CHECKBOXES */}
      {viewMode === 'list' && (
        <div className="rounded-[10px] bg-[#ffffff] border border-[#0a2414]/10 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#0a2414]/8 bg-[#fafaf9] text-[11.5px] uppercase text-[#607166] font-semibold">
                  <th className="py-3.5 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(input) => {
                        if (input) input.indeterminate = isSomeSelected;
                      }}
                      onChange={handleToggleSelectAll}
                      className="rounded text-[#17b267] focus:ring-[#17b267] w-4 h-4 cursor-pointer"
                      aria-label="Select all drafts"
                    />
                  </th>
                  <th className="py-3 px-3">Recipient & Company</th>
                  <th className="py-3 px-4">Subject Preview</th>
                  <th className="py-3 px-4">Trigger Grounding</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0a2414]/6 text-[13.5px]">
                {pendingDrafts.map((draft, idx) => {
                  const isChecked = selectedIds.includes(draft.id);

                  return (
                    <tr
                      key={draft.id}
                      className={`hover:bg-[#fafaf9] transition-colors group ${
                        isChecked ? 'bg-[#f3fbe9]/30' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleToggleSelectOne(draft.id, e as unknown as React.MouseEvent)}
                          className="rounded text-[#17b267] focus:ring-[#17b267] w-4 h-4 cursor-pointer"
                          aria-label={`Select draft for ${draft.recipientName}`}
                        />
                      </td>

                      <td
                        className="py-3.5 px-3 cursor-pointer"
                        onClick={() => {
                          setSelectedDraftIndex(idx);
                          setViewMode('inspector');
                        }}
                      >
                        <div className="font-semibold text-[#0a2414] group-hover:text-[#17b267] transition-colors">
                          {draft.recipientName}
                        </div>
                        <div className="text-[12px] text-[#607166]">
                          {draft.recipientRole} @ {draft.recipientCompany}
                        </div>
                      </td>

                      <td
                        className="py-3.5 px-4 max-w-[300px] truncate text-[#283a2e] cursor-pointer"
                        onClick={() => {
                          setSelectedDraftIndex(idx);
                          setViewMode('inspector');
                        }}
                      >
                        <div className="font-medium text-[#0a2414] truncate">{draft.subject}</div>
                        <div className="text-[12px] text-[#607166] truncate">{draft.body.substring(0, 70)}...</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-[6px] bg-[#f3fbe9] border border-[#17b267]/30 text-[#17b267] text-[11.5px] font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#1ad379]" />
                          <span>{draft.signalReason || 'Verified Intent'}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setSelectedDraftIndex(idx);
                            setViewMode('inspector');
                          }}
                          className="px-3 py-1 rounded-[6px] border border-[#0a2414]/12 bg-[#ffffff] hover:bg-[#fafaf9] text-[#0a2414] text-[12.5px] font-medium transition-colors"
                        >
                          Inspect
                        </button>
                        <button
                          onClick={() => onApproveDraft(draft.id)}
                          className="px-3 py-1 rounded-[6px] bg-[#1ad379] hover:bg-[#17b267] text-[#0a2414] text-[12.5px] font-semibold transition-all shadow-xs"
                        >
                          Approve
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: INSPECTOR REVIEW SECTION */}
      {viewMode === 'inspector' && currentDraft && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left / Center Draft View */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-[#ffffff] rounded-[10px] border border-[#0a2414]/10 overflow-hidden shadow-xs">
              {/* Draft Header Tabs & Batch Selector */}
              <div className="bg-[#fafaf9] px-6 py-3 border-b border-[#0a2414]/8 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <label className="flex items-center space-x-2 cursor-pointer text-[13px] font-medium text-[#0a2414]">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(currentDraft.id)}
                      onChange={() => handleToggleSelectOne(currentDraft.id)}
                      className="rounded text-[#17b267] focus:ring-[#17b267] w-4 h-4 cursor-pointer"
                    />
                    <span className="text-[12px] text-[#607166]">Select for batch</span>
                  </label>

                  <span className="px-3 py-1 rounded-[6px] bg-[#ffffff] border border-[#0a2414]/10 text-[13px] font-semibold text-[#0a2414]">
                    Reviewing #{selectedDraftIndex + 1} of {pendingDrafts.length}
                  </span>

                  {pendingDrafts.length > 1 && (
                    <div className="flex items-center space-x-1.5 pl-2 overflow-x-auto max-w-[240px] sm:max-w-none">
                      {pendingDrafts.map((d, idx) => (
                        <button
                          key={d.id}
                          onClick={() => {
                            setSelectedDraftIndex(idx);
                            setIsEditing(false);
                          }}
                          className={`w-6 h-6 rounded-[6px] text-[12px] font-semibold transition-colors shrink-0 ${
                            selectedDraftIndex === idx
                              ? 'bg-[#0a2414] text-[#ffffff]'
                              : 'bg-[#ffffff] border border-[#0a2414]/10 text-[#607166] hover:text-[#0a2414]'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <span className="text-[12.5px] text-[#17b267] font-semibold flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1ad379]" />
                  <span>Verified Buying Intent</span>
                </span>
              </div>

              {/* Recipient & Subject Header Card */}
              <div className="p-6 border-b border-[#0a2414]/8 space-y-2.5 bg-[#ffffff]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[14px] gap-1">
                  <span className="text-[#607166] w-20">To:</span>
                  <span className="font-semibold text-[#0a2414] flex-1">
                    {currentDraft.recipientName} &lt;{currentDraft.recipientEmail}&gt;
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[14px] gap-1">
                  <span className="text-[#607166] w-20">Role:</span>
                  <span className="text-[#0a2414] flex-1">
                    {currentDraft.recipientRole} @ {currentDraft.recipientCompany}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[14px] pt-3 border-t border-[#0a2414]/6 gap-1">
                  <span className="text-[#607166] w-20">Subject:</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editSubject}
                      onChange={(e) => setEditSubject(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-[6px] border border-[#0a2414]/20 text-[#0a2414] font-medium text-[14px] outline-none focus:border-[#17b267]"
                    />
                  ) : (
                    <span className="font-semibold text-[#0a2414] flex-1">
                      {currentDraft.subject}
                    </span>
                  )}
                </div>
              </div>

              {/* Email Body */}
              <div className="p-6 space-y-4 text-[14.5px] leading-relaxed text-[#0a2414] bg-[#ffffff]">
                {isEditing ? (
                  <div className="space-y-3">
                    <textarea
                      rows={12}
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      className="w-full p-4 rounded-[10px] border border-[#0a2414]/20 text-[14px] text-[#0a2414] outline-none focus:border-[#17b267] leading-relaxed"
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-1.5 rounded-[10px] border border-[#0a2414]/15 text-[13px] text-[#607166]"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        className="px-4 py-1.5 rounded-[10px] bg-[#0a2414] text-[#ffffff] text-[13px] font-medium"
                      >
                        Save Body
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(currentDraft.body || '').split(/\n+/).filter(Boolean).map((line, i) => (
                      <p key={i} className="text-[#283a2e]">{line}</p>
                    ))}
                    {!currentDraft.body && (
                      <p className="text-[#607166] italic">No body content — this draft failed to compose.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Dispatch Bar & Controls */}
              <div className="bg-[#fafaf9] px-6 py-4 border-t border-[#0a2414]/8 flex flex-wrap items-center justify-between gap-3">
                <div className="text-[13px] text-[#607166]">
                  Next queue dispatch: 14:00 (in 32m)
                </div>

                <div className="flex items-center space-x-2.5">
                  <button
                    type="button"
                    onClick={() => setRejectingSingle(true)}
                    className="px-4 py-2 text-[13px] rounded-[10px] border border-[#0a2414]/15 text-[#607166] hover:bg-[#ffbac3]/20 hover:text-[#360003] transition-colors"
                  >
                    Reject Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-4 py-2 text-[13px] rounded-[10px] border border-[#0a2414]/15 bg-[#ffffff] text-[#0a2414] hover:bg-[#fafaf9] transition-colors font-medium"
                  >
                    {isEditing ? 'Cancel Edit' : 'Edit Body'}
                  </button>
                  <button
                    type="button"
                    onClick={handleApproveCurrent}
                    className="px-5 py-2 text-[13px] rounded-[10px] bg-[#1ad379] hover:bg-[#17b267] text-[#0a2414] font-semibold transition-all shadow-sm"
                  >
                    Approve Draft
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Signal Reasoning & Proof */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#ffffff] rounded-[10px] border border-[#17b267]/30 p-6 space-y-4 shadow-xs">
              <div className="border-b border-[#0a2414]/8 pb-2.5">
                <span className="text-[14px] font-semibold text-[#0a2414] block">
                  Signal Reasoning & Proof
                </span>
              </div>

              <div className="space-y-3 text-[13px]">
                <div className="p-4 bg-[#f3fbe9]/50 rounded-[8px] border border-[#17b267]/20 space-y-1.5">
                  <span className="text-[11px] uppercase tracking-wider text-[#17b267] font-semibold block">
                    {currentDraft.signalType ? `${currentDraft.signalType.toUpperCase()} INTENT` : 'HIRING INTENT VERIFIED'}
                  </span>
                  <p className="font-medium text-[#0a2414] text-[13.5px]">
                    {currentDraft.signalReason || 'Senior Infrastructure Engineer (Outbound & API Integrations)'}
                  </p>
                  <p className="text-[12px] text-[#607166] pt-1">
                    Detected on company careers page & LinkedIn Jobs 2 hours ago.
                  </p>
                </div>
              </div>
            </div>

            {/* Sender Configuration Box */}
            <div className="bg-[#ffffff] rounded-[10px] border border-[#0a2414]/10 p-6 space-y-3 text-[13px] shadow-xs">
              <span className="text-[11px] uppercase tracking-wider text-[#607166] font-semibold block">
                Sender Configuration
              </span>
              <div className="flex items-center justify-between text-[#0a2414]">
                <span className="text-[13.5px] font-medium">chidera@Klerk.so</span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-[6px] bg-[#f3fbe9] border border-[#17b267]/30 text-[#17b267] font-semibold">
                  Warm-up: Day 9 of 14
                </span>
              </div>
              <p className="text-[13px] text-[#607166] leading-relaxed">
                Safe ramp rate active (Max 35/day). Includes physical compliance footer automatically.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal (Single Draft) */}
      {rejectingSingle && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#ffffff] rounded-[10px] p-6 border border-[#0a2414]/10 space-y-4 shadow-xl">
            <h3 className="text-[18px] font-semibold text-[#0a2414]">Reject Draft & Feed Back</h3>
            <p className="text-[13px] text-[#607166]">
              Select why this draft was rejected so Klerk can adapt future intent filtering.
            </p>

            <div className="space-y-2">
              {[
                'Too generic / does not sound like me',
                'Wrong signal interpretation',
                'Prospect not a decision maker',
                'Company already out of market',
              ].map((reason) => (
                <label
                  key={reason}
                  className="flex items-center space-x-2.5 p-3 rounded-[8px] border border-[#0a2414]/10 hover:bg-[#fafaf9] cursor-pointer text-[13px] text-[#0a2414]"
                >
                  <input
                    type="radio"
                    name="rejectReason"
                    checked={rejectReason === reason}
                    onChange={() => setRejectReason(reason)}
                    className="text-[#17b267] focus:ring-[#17b267]"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectingSingle(false)}
                className="px-4 py-2 text-[13px] text-[#607166]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectCurrentConfirm}
                className="px-4 py-2 rounded-[10px] bg-[#ffbac3] text-[#360003] text-[13px] font-medium"
              >
                Reject Draft
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal (Batch Drafts) */}
      {rejectingBatch && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#ffffff] rounded-[10px] p-6 border border-[#0a2414]/10 space-y-4 shadow-xl">
            <h3 className="text-[18px] font-semibold text-[#0a2414]">
              Reject {selectedIds.length} Selected Drafts
            </h3>
            <p className="text-[13px] text-[#607166]">
              Select why these drafts are being rejected to tune crawler filters across your campaigns.
            </p>

            <div className="space-y-2">
              {[
                'Too generic / does not sound like me',
                'Wrong signal interpretation',
                'Prospect not a decision maker',
                'Company already out of market',
              ].map((reason) => (
                <label
                  key={reason}
                  className="flex items-center space-x-2.5 p-3 rounded-[8px] border border-[#0a2414]/10 hover:bg-[#fafaf9] cursor-pointer text-[13px] text-[#0a2414]"
                >
                  <input
                    type="radio"
                    name="batchRejectReason"
                    checked={rejectReason === reason}
                    onChange={() => setRejectReason(reason)}
                    className="text-[#17b267] focus:ring-[#17b267]"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectingBatch(false)}
                className="px-4 py-2 text-[13px] text-[#607166]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBatchRejectConfirm}
                className="px-4 py-2 rounded-[10px] bg-[#ffbac3] text-[#360003] text-[13px] font-semibold"
              >
                Reject ({selectedIds.length}) Drafts
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
