import React, { useState } from 'react';
import { SenderMailbox, UserSubscription } from '../../types';
import { Logos } from '../Onboarding';
import { PLANS } from '../../data/plansData';

interface SendersViewProps {
  senders: SenderMailbox[];
  onAddSender: (email: string) => void;
  onToggleStatus: (id: string) => void;
  onRemoveSender: (id: string) => void;
  subscription?: UserSubscription;
  onOpenUpgradeModal?: (reason?: string) => void;
}

export const SendersView: React.FC<SendersViewProps> = ({
  senders,
  onAddSender,
  onToggleStatus,
  onRemoveSender,
  subscription,
  onOpenUpgradeModal,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'gmail' | 'outlook'>('gmail');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const currentPlan = subscription ? PLANS[subscription.plan] : PLANS.growth;
  const isMailboxCapHit = subscription ? senders.length >= currentPlan.maxMailboxes : false;

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

    if (isMailboxCapHit) {
      setShowAddModal(false);
      onOpenUpgradeModal?.(
        `You have reached the maximum limit of ${currentPlan.maxMailboxes} connected mailboxes on the ${currentPlan.name} plan.`
      );
      return;
    }

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
        <div className="fixed bottom-6 right-6 z-50 bg-[#0a2414] text-[#ffffff] px-4 py-2.5 rounded-[10px] text-[13px] border border-[#17b267]/30 flex items-center space-x-2 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-[#1ad379]" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-[24px] font-semibold tracking-tight text-[#0a2414]">
              Sender Inboxes & Warmup Pool
            </h1>
            {subscription && (
              <span className="text-[12px] px-2.5 py-0.5 rounded-[6px] bg-[#f3fbe9] border border-[#17b267]/30 text-[#17b267] font-semibold">
                {senders.length} / {currentPlan.maxMailboxes} ({currentPlan.name})
              </span>
            )}
          </div>
          <p className="text-[13.5px] text-[#607166]">
            clerk distributes your sends across your connected accounts with 14-day progressive warm-up.
          </p>
        </div>

        {isMailboxCapHit ? (
          <button
            type="button"
            onClick={() =>
              onOpenUpgradeModal?.(
                `You have reached the maximum limit of ${currentPlan.maxMailboxes} connected mailboxes on the ${currentPlan.name} plan.`
              )
            }
            className="px-4 py-2.5 rounded-[10px] bg-[#f3fbe9] hover:bg-[#1ad379] border border-[#17b267] text-[#0a2414] text-[13.5px] font-semibold tracking-tight transition-all self-start sm:self-auto flex items-center space-x-1.5 shadow-sm"
          >
            <span>Upgrade for more mailboxes →</span>
          </button>
        ) : (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-[10px] bg-[#1ad379] hover:bg-[#17b267] text-[#0a2414] text-[13.5px] font-semibold tracking-tight transition-all self-start sm:self-auto flex items-center space-x-2 shadow-sm"
          >
            <span>+ Add mailbox</span>
          </button>
        )}
      </div>

      {/* Overview Metric Cards - Flat white with 1px hairline borders */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-[10px] bg-[#ffffff] border border-[#0a2414]/10 shadow-xs">
          <div className="text-[12px] text-[#607166] font-medium mb-1">Active Senders Pool</div>
          <div className="text-[24px] font-semibold text-[#0a2414]">
            {senders.filter((s) => s.status === 'active').length}{' '}
            <span className="text-[13.5px] font-normal text-[#607166]">/ {senders.length} inboxes</span>
          </div>
          <div className="text-[11.5px] text-[#17b267] mt-1 font-medium">Native IP Isolation: Active</div>
        </div>

        <div className="p-6 rounded-[10px] bg-[#ffffff] border border-[#0a2414]/10 shadow-xs">
          <div className="text-[12px] text-[#607166] font-medium mb-1">Total Pool Capacity</div>
          <div className="text-[24px] font-semibold text-[#0a2414]">
            {totalSentToday}{' '}
            <span className="text-[13.5px] font-normal text-[#607166]">/ {totalDailyCap} sends today</span>
          </div>
          <div className="text-[11.5px] text-[#607166] mt-1">Multi-Account Load Balancer</div>
        </div>

        <div className="p-6 rounded-[10px] bg-[#ffffff] border border-[#0a2414]/10 shadow-xs">
          <div className="text-[12px] text-[#607166] font-medium mb-1">Global Health Score</div>
          <div className="text-[24px] font-semibold text-[#17b267] flex items-baseline space-x-1.5">
            <span>{avgHealth}%</span>
            <span className="text-[12px] font-medium text-[#0a2414]">Pristine</span>
          </div>
          <div className="text-[11.5px] text-[#607166] mt-1">0% spam complaints detected</div>
        </div>
      </div>

      {/* Security Banner */}
      <div className="p-4 rounded-[10px] bg-[#ffffff] border border-[#17b267]/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[13px] shadow-xs">
        <div className="flex items-center space-x-2 text-[#0a2414]">
          <span className="w-2 h-2 rounded-full bg-[#1ad379]" />
          <span>
            Connected via native OAuth 2.0. clerk never stores your master passwords or reads your personal inbound messages.
          </span>
        </div>
        <span className="text-[#17b267] font-semibold shrink-0">Google CASA Tier 2 Certified</span>
      </div>

      {/* Senders Table / List */}
      <div className="bg-[#ffffff] rounded-[10px] border border-[#0a2414]/10 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-[#0a2414]/10 flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-[#0a2414]">Connected Sending Accounts</h2>
          <span className="text-[12.5px] text-[#607166]">
            {senders.length} account{senders.length === 1 ? '' : 's'} linked
          </span>
        </div>

        <div className="divide-y divide-[#0a2414]/6">
          {senders.map((s) => (
            <div
              key={s.id}
              className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-[#fafaf9] transition-colors"
            >
              <div className="flex items-start sm:items-center space-x-4">
                <div className="w-10 h-10 rounded-[8px] bg-[#fafaf9] border border-[#0a2414]/8 flex items-center justify-center text-[18px] shrink-0">
                  {s.email.includes('gmail') ? (
                    <Logos.Google className="w-5 h-5" />
                  ) : (
                    <Logos.Microsoft className="w-5 h-5" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                    <span className="font-semibold text-[15px] text-[#0a2414]">{s.email}</span>
                    <span
                      className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-[6px] text-[11.5px] font-semibold ${
                        s.status === 'active'
                          ? 'bg-[#f3fbe9] text-[#17b267] border border-[#17b267]/30'
                          : s.status === 'warming'
                          ? 'bg-[#fff4e5] text-[#b54708] border border-[#b54708]/30'
                          : 'bg-[#fafaf9] text-[#607166] border border-[#0a2414]/10'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          s.status === 'active'
                            ? 'bg-[#1ad379]'
                            : s.status === 'warming'
                            ? 'bg-[#f79009]'
                            : 'bg-[#607166]'
                        }`}
                      />
                      <span className="capitalize">{s.status}</span>
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 text-[12px] text-[#607166]">
                    <span>
                      Ramp Day: <strong className="text-[#0a2414]">{s.connectedDays}/14</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Daily Cap: <strong className="text-[#0a2414]">{s.dailyCap} sends/day</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Dispatched Today:{' '}
                      <strong className="text-[#0a2414]">{s.sentToday}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions & Health */}
              <div className="flex items-center space-x-3 self-end sm:self-center">
                <div className="text-right mr-2 hidden md:block">
                  <div className="text-[12px] text-[#607166]">Inbox Health</div>
                  <div className="text-[14px] font-semibold text-[#17b267]">
                    {s.healthScore}% Deliverability
                  </div>
                </div>

                <button
                  onClick={() => {
                    onToggleStatus(s.id);
                    triggerToast(s.status === 'paused' ? 'Sender resumed' : 'Sender paused');
                  }}
                  className="px-3 py-1.5 rounded-[8px] border border-[#0a2414]/12 bg-[#ffffff] hover:bg-[#fafaf9] text-[#0a2414] text-[12.5px] font-medium transition-colors"
                >
                  {s.status === 'paused' ? 'Resume' : 'Pause'}
                </button>

                {deleteConfirmId === s.id ? (
                  <div className="flex items-center space-x-1.5 bg-[#ffbac3]/20 p-1 rounded-[8px] border border-[#ffbac3]/40">
                    <button
                      onClick={() => {
                        onRemoveSender(s.id);
                        setDeleteConfirmId(null);
                        triggerToast('Mailbox disconnected.');
                      }}
                      className="px-2 py-1 rounded-[6px] bg-[#ffbac3] text-[#360003] text-[11.5px] font-semibold"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-1.5 py-1 text-[#607166] text-[11.5px]"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirmId(s.id)}
                    className="p-1.5 rounded-[8px] border border-[#0a2414]/10 hover:bg-[#ffbac3]/20 text-[#607166] hover:text-[#360003] text-[12.5px] transition-colors"
                    title="Disconnect mailbox"
                  >
                    🗑
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ADD MAILBOX MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#ffffff] rounded-[10px] p-6 sm:p-8 border border-[#0a2414]/10 space-y-5 shadow-2xl">
            <div>
              <h2 className="text-[20px] font-semibold text-[#0a2414]">Connect Sender Mailbox</h2>
              <p className="text-[13px] text-[#607166]">
                Connect your Google Workspace or Microsoft 365 inbox for autonomous peer-to-peer delivery.
              </p>
            </div>

            {/* Provider Selector */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedProvider('gmail')}
                className={`p-3 rounded-[10px] border flex items-center justify-center space-x-2 text-[13px] font-medium transition-all ${
                  selectedProvider === 'gmail'
                    ? 'border-[#17b267] bg-[#f3fbe9] text-[#0a2414] font-semibold shadow-xs'
                    : 'border-[#0a2414]/12 bg-[#ffffff] text-[#607166] hover:text-[#0a2414]'
                }`}
              >
                <Logos.Google className="w-4 h-4" />
                <span>Google Workspace</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedProvider('outlook')}
                className={`p-3 rounded-[10px] border flex items-center justify-center space-x-2 text-[13px] font-medium transition-all ${
                  selectedProvider === 'outlook'
                    ? 'border-[#17b267] bg-[#f3fbe9] text-[#0a2414] font-semibold shadow-xs'
                    : 'border-[#0a2414]/12 bg-[#ffffff] text-[#607166] hover:text-[#0a2414]'
                }`}
              >
                <Logos.Microsoft className="w-4 h-4" />
                <span>Microsoft 365</span>
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-[#0a2414] mb-1">
                  Work Email Address
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="chidera@clerk.so"
                  className="w-full px-3.5 py-2 rounded-[10px] border border-[#0a2414]/15 text-[14px] outline-none focus:border-[#17b267]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[#0a2414] mb-1">
                  OAuth Authorization / App Token
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••••••"
                  className="w-full px-3.5 py-2 rounded-[10px] border border-[#0a2414]/15 text-[14px] outline-none focus:border-[#17b267]"
                />
                <span className="text-[11.5px] text-[#607166] mt-1 block">
                  Encrypted using AES-256 GCM hardware security keys.
                </span>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#0a2414]/8">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-[13px] text-[#607166] hover:text-[#0a2414]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-[10px] bg-[#1ad379] hover:bg-[#17b267] text-[#0a2414] text-[13px] font-semibold transition-all shadow-xs"
                >
                  {isSubmitting ? 'Verifying OAuth...' : 'Connect & Authorize'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
