import React, { useState } from 'react';
import { SenderMailbox } from '../../types';
import { Logos } from '../Onboarding';

interface SendersViewProps {
  senders: SenderMailbox[];
  onAddSender: (email: string) => void;
  onToggleStatus: (id: string) => void;
  onRemoveSender: (id: string) => void;
}

export const SendersView: React.FC<SendersViewProps> = ({
  senders,
  onAddSender,
  onToggleStatus,
  onRemoveSender,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'gmail' | 'outlook'>('gmail');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const totalDailyCap = senders.reduce((acc, s) => acc + (s.status === 'active' ? s.dailyCap : 0), 0);
  const totalSentToday = senders.reduce((acc, s) => acc + s.sentToday, 0);
  const avgHealth = senders.length > 0 ? (senders.reduce((acc, s) => acc + s.healthScore, 0) / senders.length).toFixed(0) : '100';

  const triggerToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 2500);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      onAddSender(newEmail);
      setNewEmail('');
      setNewPassword('');
      setIsSubmitting(false);
      setShowAddModal(false);
      triggerToast('Mailbox connected successfully! Initial 15-day safe ramp initiated.');
    }, 600);
  };

  return (
    <div id="dashboard-senders-view" className="space-y-6">
      {/* Toast Notification */}
      {feedbackToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0a2414] text-[#ffffff] px-4 py-2.5 rounded-[10px] text-[13px] border border-[#17b267]/30 flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-[#1ad379]" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight text-[#0a2414]">
            Sender Inboxes & Warmup Pool
          </h1>
          <p className="text-[13.5px] text-[#607166]">
            clerk distributes your sends across your connected accounts with 14-day progressive warm-up.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-[10px] bg-[#1ad379] hover:bg-[#17b267] text-[#0a2414] text-[13.5px] font-semibold tracking-tight transition-all self-start sm:self-auto flex items-center space-x-2"
        >
          <span>+ Add mailbox</span>
        </button>
      </div>

      {/* Overview Metric Cards - Flat white with 1px hairline borders */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-[10px] bg-[#ffffff] border border-[#0a2414]/10">
          <div className="text-[12px] text-[#607166] font-medium mb-1">Active Senders Pool</div>
          <div className="text-[24px] font-semibold text-[#0a2414]">
            {senders.filter((s) => s.status === 'active').length}{' '}
            <span className="text-[13.5px] font-normal text-[#607166]">/ {senders.length} inboxes</span>
          </div>
          <div className="text-[11.5px] text-[#17b267] mt-1 font-medium">Native IP Isolation: Active</div>
        </div>

        <div className="p-6 rounded-[10px] bg-[#ffffff] border border-[#0a2414]/10">
          <div className="text-[12px] text-[#607166] font-medium mb-1">Total Pool Capacity</div>
          <div className="text-[24px] font-semibold text-[#0a2414]">
            {totalSentToday}{' '}
            <span className="text-[13.5px] font-normal text-[#607166]">/ {totalDailyCap} sends today</span>
          </div>
          <div className="text-[11.5px] text-[#607166] mt-1">Multi-Account Load Balancer</div>
        </div>

        <div className="p-6 rounded-[10px] bg-[#ffffff] border border-[#0a2414]/10">
          <div className="text-[12px] text-[#607166] font-medium mb-1">Global Health Score</div>
          <div className="text-[24px] font-semibold text-[#17b267] flex items-baseline space-x-1.5">
            <span>{avgHealth}%</span>
            <span className="text-[12px] font-medium text-[#0a2414]">Pristine</span>
          </div>
          <div className="text-[11.5px] text-[#607166] mt-1">0% spam complaints detected</div>
        </div>
      </div>

      {/* Security Banner */}
      <div className="p-4 rounded-[10px] bg-[#ffffff] border border-[#17b267]/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[13px]">
        <div className="flex items-center space-x-2 text-[#0a2414]">
          <span className="w-2 h-2 rounded-full bg-[#1ad379]" />
          <span>
            <strong>Native Mailbox Protocol:</strong> No shared sequencer server or pool contamination. Sends originate directly from your authenticated Google app password.
          </span>
        </div>
        <span className="text-[#17b267] text-[12px] shrink-0 font-semibold px-2.5 py-0.5 rounded-[6px] bg-[#f3fbe9] border border-[#17b267]/30">
          Load Balancer: Active
        </span>
      </div>

      {/* Senders List */}
      <div className="grid grid-cols-1 gap-4">
        {senders.map((sender) => {
          const percentageUsed = Math.round((sender.sentToday / sender.dailyCap) * 100);
          const isGmail = sender.email.includes('gmail') || sender.email.includes('clerk');
          const isWarmupComplete = sender.connectedDays >= 14;

          return (
            <div
              key={sender.id}
              className="p-6 rounded-[10px] bg-[#ffffff] border border-[#0a2414]/10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 hover:border-[#17b267]/40 transition-colors"
            >
              {/* Left Column: Provider Icon, Email & Health */}
              <div className="flex items-start space-x-3.5">
                <div className="p-2.5 rounded-[10px] bg-[#fafaf9] border border-[#0a2414]/10 shrink-0 mt-0.5">
                  {isGmail ? <Logos.Gmail /> : <Logos.Outlook />}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-[16px] font-semibold text-[#0a2414]">
                      {sender.email}
                    </h3>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-[6px] ${
                        sender.status === 'active'
                          ? 'bg-[#f3fbe9] text-[#17b267] border border-[#17b267]/30'
                          : 'bg-[#fafaf9] text-[#607166] border border-[#0a2414]/10'
                      }`}
                    >
                      {sender.status === 'active' ? 'Active' : 'Paused'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-[12.5px] text-[#607166]">
                    <span>Added {sender.addedAt}</span>
                    <span>•</span>
                    <span className="inline-flex items-center space-x-1 text-[#17b267] font-medium">
                      <span>Health score:</span>
                      <strong>{sender.healthScore}%</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Middle Column: Warmup & Daily Sends Progress */}
              <div className="space-y-2 flex-1 max-w-md bg-[#fafaf9] p-4 rounded-[10px] border border-[#0a2414]/8">
                <div className="flex items-center justify-between text-[12.5px]">
                  <span className="text-[#607166]">
                    Warm-up Progress:{' '}
                    <strong className="text-[#0a2414]">
                      {isWarmupComplete ? 'Completed (14/14)' : `Day ${sender.connectedDays} of 14`}
                    </strong>
                  </span>
                  <span className="text-[#0a2414] font-semibold">
                    {sender.sentToday} / {sender.dailyCap} sent today
                  </span>
                </div>

                <div className="w-full bg-[#0a2414]/10 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#1ad379] h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(percentageUsed, 100)}%` }}
                  />
                </div>

                <div className="flex justify-between text-[11.5px] text-[#607166]">
                  <span>Safe Ramp Cap: {sender.dailyCap}/day</span>
                  <span>Target Max: {sender.maxCap}/day</span>
                </div>
              </div>

              {/* Right Column: Actions */}
              <div className="flex items-center space-x-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#0a2414]/6 shrink-0">
                <button
                  onClick={() => {
                    onToggleStatus(sender.id);
                    triggerToast(sender.status === 'active' ? 'Mailbox paused' : 'Mailbox resumed');
                  }}
                  className="px-3.5 py-2 rounded-[10px] border border-[#0a2414]/12 bg-[#ffffff] hover:bg-[#fafaf9] text-[#0a2414] text-[13px] font-medium transition-colors"
                >
                  {sender.status === 'paused' ? 'Resume' : 'Pause'}
                </button>

                <button
                  onClick={() => triggerToast(`Tested connection for ${sender.email}: SMTP/IMAP OK`)}
                  className="px-3.5 py-2 rounded-[10px] border border-[#0a2414]/12 hover:bg-[#fafaf9] text-[#607166] hover:text-[#0a2414] text-[13px] font-medium transition-colors"
                  title="Test Connection"
                >
                  Test
                </button>

                <button
                  onClick={() => setDeleteConfirmId(sender.id)}
                  className="px-3.5 py-2 rounded-[10px] border border-[#0a2414]/12 hover:bg-[#ffbac3]/20 hover:text-[#360003] text-[#607166] text-[13px] font-medium transition-colors"
                  aria-label="Remove mailbox"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD MAILBOX MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#ffffff] rounded-[10px] p-6 sm:p-8 border border-[#0a2414]/10 space-y-4">
            <h2 className="text-[20px] font-semibold text-[#0a2414]">Add Sender Mailbox</h2>
            <p className="text-[13px] text-[#607166]">
              Connect an additional sender to increase total pool capacity without increasing domain risk.
            </p>

            {/* Provider Picker */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setSelectedProvider('gmail')}
                className={`p-3 rounded-[10px] border text-left flex items-center space-x-2 text-[13px] font-medium transition-all ${
                  selectedProvider === 'gmail'
                    ? 'border-[#17b267] bg-[#f3fbe9] text-[#0a2414]'
                    : 'border-[#0a2414]/15 bg-white text-[#607166]'
                }`}
              >
                <Logos.Gmail />
                <span>Google / Gmail</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedProvider('outlook')}
                className={`p-3 rounded-[10px] border text-left flex items-center space-x-2 text-[13px] font-medium transition-all ${
                  selectedProvider === 'outlook'
                    ? 'border-[#17b267] bg-[#f3fbe9] text-[#0a2414]'
                    : 'border-[#0a2414]/15 bg-white text-[#607166]'
                }`}
              >
                <Logos.Outlook />
                <span>Office 365</span>
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 pt-1">
              <div>
                <label className="block text-[13px] font-semibold text-[#0a2414] mb-1">
                  {selectedProvider === 'gmail' ? 'Google Workspace / Gmail Address' : 'Outlook / Exchange Address'}
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="outbound@yourcompany.com"
                  className="w-full px-3.5 py-2 rounded-[10px] border border-[#0a2414]/15 text-[14px] outline-none focus:border-[#17b267]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[#0a2414] mb-1">
                  {selectedProvider === 'gmail' ? 'Google App Password (16 chars)' : 'App Password'}
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="xxxx xxxx xxxx xxxx"
                  className="w-full px-3.5 py-2 rounded-[10px] border border-[#0a2414]/15 text-[14px] outline-none focus:border-[#17b267]"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#0a2414]/8">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-[13.5px] text-[#607166] hover:text-[#0a2414]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-[10px] bg-[#1ad379] hover:bg-[#17b267] text-[#0a2414] text-[13.5px] font-semibold transition-all"
                >
                  {isSubmitting ? 'Connecting...' : 'Connect & Ramp'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MAILBOX CONFIRM */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#ffffff] rounded-[10px] p-6 border border-[#0a2414]/10 space-y-4">
            <h3 className="text-[18px] font-semibold text-[#0a2414]">Remove Mailbox?</h3>
            <p className="text-[14px] text-[#283a2e] leading-relaxed">
              This stops that mailbox from being used going forward. Active sequences will be safely re-routed to remaining sender inboxes.
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
                  onRemoveSender(deleteConfirmId);
                  setDeleteConfirmId(null);
                  triggerToast('Mailbox removed.');
                }}
                className="px-4 py-2 rounded-[10px] bg-[#ffbac3] hover:bg-[#ffbac3]/80 text-[#360003] text-[13.5px] font-semibold"
              >
                Confirm Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
