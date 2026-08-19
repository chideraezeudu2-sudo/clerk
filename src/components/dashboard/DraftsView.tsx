import React, { useState } from 'react';
import { DraftEmail, Campaign } from '../../types';

interface DraftsViewProps {
  drafts: DraftEmail[];
  campaigns: Campaign[];
  onApproveDraft: (id: string) => void;
  onApproveAll: () => void;
  onEditDraft: (id: string, updatedSubject: string, updatedBody: string) => void;
  onRejectDraft: (id: string, reason: string) => void;
}

export const DraftsView: React.FC<DraftsViewProps> = ({
  drafts,
  campaigns,
  onApproveDraft,
  onApproveAll,
  onEditDraft,
  onRejectDraft,
}) => {
  const [selectedDraftIndex, setSelectedDraftIndex] = useState<number>(0);
  const [isEditing, setIsEditing] = useState(false);

  const pendingDrafts = drafts.filter((d) => d.status === 'pending');
  const currentDraft = pendingDrafts[selectedDraftIndex] || pendingDrafts[0];

  const [editSubject, setEditSubject] = useState(currentDraft?.subject || '');
  const [editBody, setEditBody] = useState(currentDraft?.body || '');
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('Too generic / does not sound like me');

  // Update edit buffer when current draft changes
  React.useEffect(() => {
    if (currentDraft) {
      setEditSubject(currentDraft.subject);
      setEditBody(currentDraft.body);
    }
  }, [currentDraft?.id]);

  const handleSaveEdit = () => {
    if (currentDraft) {
      onEditDraft(currentDraft.id, editSubject, editBody);
      setIsEditing(false);
    }
  };

  const handleApprove = () => {
    if (currentDraft) {
      onApproveDraft(currentDraft.id);
      if (selectedDraftIndex >= pendingDrafts.length - 1) {
        setSelectedDraftIndex(Math.max(0, pendingDrafts.length - 2));
      }
    }
  };

  const handleRejectConfirm = () => {
    if (currentDraft) {
      onRejectDraft(currentDraft.id, rejectReason);
      setRejecting(false);
      if (selectedDraftIndex >= pendingDrafts.length - 1) {
        setSelectedDraftIndex(Math.max(0, pendingDrafts.length - 2));
      }
    }
  };

  if (pendingDrafts.length === 0) {
    return (
      <div id="dashboard-drafts-empty" className="space-y-6">
        <div className="bg-[#ffffff] rounded-[10px] border border-[#0a2414]/10 p-12 text-center space-y-3">
          <span className="text-[13px] uppercase tracking-wider text-[#17b267] font-semibold block">
            Queue Status
          </span>
          <h2 className="text-[24px] font-semibold text-[#0a2414]">All drafts reviewed and approved</h2>
          <p className="text-[14px] text-[#607166] max-w-[500px] mx-auto">
            clerk is actively monitoring target companies for series-a-hiring signals. New drafts will arrive here for your explicit authorization.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div id="dashboard-drafts-view" className="space-y-6">
      {/* Top Application Breadcrumb and Watching Caps */}
      <div className="bg-[#ffffff] rounded-[10px] border border-[#0a2414]/10 p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="flex space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0a2414]/20"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#0a2414]/20"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#0a2414]/20"></span>
          </div>
          <span className="text-[14px] font-medium text-[#0a2414] pl-3 border-l border-[#0a2414]/10">
            clerk / queue / series-a-hiring
          </span>
        </div>

        <div className="flex items-center space-x-3 text-[13px]">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-[10px] bg-[#f3fbe9] border border-[#17b267]/30 text-[#0a2414] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1ad379]"></span>
            <span>Watching 64 companies</span>
          </span>
          <span className="px-3 py-1.5 rounded-[10px] bg-[#ffffff] border border-[#0a2414]/10 text-[#607166]">
            Daily Pacing: 18/35 sent
          </span>
          {pendingDrafts.length > 1 && (
            <button
              onClick={onApproveAll}
              className="px-4 py-1.5 rounded-[10px] bg-[#0a2414] text-[#ffffff] font-medium hover:bg-[#17b267] hover:text-[#0a2414] transition-colors"
            >
              Approve All ({pendingDrafts.length})
            </button>
          )}
        </div>
      </div>

      {/* Main Review Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Center Draft View */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-[#ffffff] rounded-[10px] border border-[#0a2414]/10 overflow-hidden">
            {/* Draft Header Tabs */}
            <div className="bg-[#fafaf9] px-6 py-3 border-b border-[#0a2414]/8 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 rounded-[6px] bg-[#ffffff] border border-[#0a2414]/10 text-[13px] font-semibold text-[#0a2414]">
                  Pending Review ({pendingDrafts.length})
                </span>
                {pendingDrafts.length > 1 && (
                  <div className="flex items-center space-x-1.5 pl-2">
                    {pendingDrafts.map((d, idx) => (
                      <button
                        key={d.id}
                        onClick={() => {
                          setSelectedDraftIndex(idx);
                          setIsEditing(false);
                        }}
                        className={`w-6 h-6 rounded-[6px] text-[12px] font-semibold transition-colors ${
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

              <span className="text-[12.5px] text-[#17b267] font-semibold">
                Verified Hiring Trigger
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
                <>
                  <p>Hi Marcus,</p>
                  <p className="bg-[#f3fbe9] p-3 rounded-[6px] border-l-2 border-[#1ad379] text-[#0a2414]">
                    Saw you posted 3 backend roles this week to scale your data pipelines and outbound integrations at Veloce.
                  </p>
                  <p className="text-[#283a2e]">
                    Typically when engineering teams ramp GTM data infrastructure, maintaining clean email deliverability and coordinating multi-inbox limits becomes an unnecessary dev distraction.
                  </p>
                  <p className="text-[#283a2e]">
                    We built clerk to run intent-triggered outreach directly from your own Gmail mailboxes with zero shared-pool contamination and automatic warm-up pacing.
                  </p>
                  <p>Open to seeing a 2-minute walkthrough of how it monitors engineering signals?</p>
                  <div className="pt-4 text-[13px] text-[#607166] border-t border-[#0a2414]/6">
                    Best,<br />Chidera • Sent via clerk (native Gmail app pass)
                  </div>
                </>
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
                  onClick={() => setRejecting(true)}
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
                  onClick={handleApprove}
                  className="px-5 py-2 text-[13px] rounded-[10px] bg-[#1ad379] hover:bg-[#17b267] text-[#0a2414] font-semibold transition-all"
                >
                  Approve Draft
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Signal Reasoning & Proof */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#ffffff] rounded-[10px] border border-[#17b267]/30 p-6 space-y-4">
            <div className="border-b border-[#0a2414]/8 pb-2.5">
              <span className="text-[14px] font-semibold text-[#0a2414] block">
                Signal Reasoning & Proof
              </span>
            </div>

            <div className="space-y-3 text-[13px]">
              <div className="p-4 bg-[#f3fbe9]/50 rounded-[8px] border border-[#17b267]/20 space-y-1.5">
                <span className="text-[11px] uppercase tracking-wider text-[#17b267] font-semibold block">
                  Hiring Intent Verified
                </span>
                <p className="font-medium text-[#0a2414] text-[13.5px]">
                  Senior Infrastructure Engineer (Outbound & API Integrations)
                </p>
                <p className="text-[12px] text-[#607166] pt-1">
                  Detected on company careers page & LinkedIn Jobs 2 hours ago.
                </p>
              </div>
            </div>
          </div>

          {/* Sender Configuration Box */}
          <div className="bg-[#ffffff] rounded-[10px] border border-[#0a2414]/10 p-6 space-y-3 text-[13px]">
            <span className="text-[11px] uppercase tracking-wider text-[#607166] font-semibold block">
              Sender Configuration
            </span>
            <div className="flex items-center justify-between text-[#0a2414]">
              <span className="text-[13.5px] font-medium">chidera@clerk.so</span>
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

      {/* Reject Modal */}
      {rejecting && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#ffffff] rounded-[10px] p-6 border border-[#0a2414]/10 space-y-4">
            <h3 className="text-[18px] font-semibold text-[#0a2414]">Reject Draft & Feed Back</h3>
            <p className="text-[13px] text-[#607166]">
              Select why this draft was rejected so clerk can adapt future intent filtering.
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
                onClick={() => setRejecting(false)}
                className="px-4 py-2 text-[13px] text-[#607166]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectConfirm}
                className="px-4 py-2 rounded-[10px] bg-[#ffbac3] text-[#360003] text-[13px] font-medium"
              >
                Reject Draft
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
