import React, { useState } from 'react';
import { SentEmail, Campaign } from '../../types';

interface SentViewProps {
  sentEmails: SentEmail[];
  campaigns: Campaign[];
}

export const SentView: React.FC<SentViewProps> = ({ sentEmails, campaigns }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeThreadEmail, setActiveThreadEmail] = useState<SentEmail | null>(null);

  const filteredEmails = sentEmails.filter((item) => {
    const matchSearch =
      item.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.recipientCompany.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.recipientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchQuery.toLowerCase());

    const matchCampaign =
      selectedCampaign === 'all' || item.campaignId === selectedCampaign;

    const matchStatus =
      selectedStatus === 'all' || item.status === selectedStatus;

    return matchSearch && matchCampaign && matchStatus;
  });

  const getStatusBadge = (status: SentEmail['status']) => {
    switch (status) {
      case 'replied':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-[4px] bg-[#f3fbe9] border border-[#17b267]/30 text-[12px] text-[#17b267] font-semibold">
            <span>Replied</span>
          </span>
        );
      case 'opened':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-[4px] bg-[#f9f6f1] border border-[#0a2414]/10 text-[12px] text-[#0a2414]">
            <span>Opened</span>
          </span>
        );
      case 'sent':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-[4px] bg-[#ffffff] border border-[#0a2414]/10 text-[12px] text-[#607166]">
            <span>Delivered</span>
          </span>
        );
      case 'bounced':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-[4px] bg-[#ffbac3]/20 border border-[#ffbac3] text-[12px] text-[#360003]">
            <span>Bounced</span>
          </span>
        );
    }
  };

  return (
    <div id="dashboard-sent-view" className="space-y-6">
      <div>
        <h1 className="text-[26px] font-medium tracking-tight text-[#0a2414]">
          Sent Outbox & Threads
        </h1>
        <p className="text-[14px] text-[#607166]">
          Complete delivery audit trail and automatic incoming reply matching.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-[#ffffff] rounded-[10px] border border-[#0a2414]/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by recipient or company..."
            className="w-full text-[14px] text-[#0a2414] outline-none placeholder-[#607166] px-1 bg-transparent"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2 md:pt-0 border-t md:border-t-0 md:border-l border-[#0a2414]/10 md:pl-3">
          <div className="flex items-center space-x-1 text-[13px]">
            <span className="text-[#607166]">Campaign:</span>
            <select
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
              className="bg-transparent outline-none text-[#0a2414] font-medium"
            >
              <option value="all">All</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1 text-[13px]">
            <span className="text-[#607166]">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent outline-none text-[#0a2414] font-medium"
            >
              <option value="all">All</option>
              <option value="replied">Replied</option>
              <option value="opened">Opened</option>
              <option value="sent">Delivered</option>
              <option value="bounced">Bounced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-[10px] bg-[#ffffff] border border-[#0a2414]/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#0a2414]/8 bg-[#fafaf9] text-[11.5px] uppercase text-[#607166] font-semibold">
                <th className="py-3 px-5">Recipient</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Campaign</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Sent At</th>
                <th className="py-3 px-4 text-right">Thread</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0a2414]/6 text-[13.5px]">
              {filteredEmails.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => setActiveThreadEmail(item)}
                  className="hover:bg-[#fafaf9] transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-5">
                    <div className="font-medium text-[#0a2414]">
                      {item.recipientName}
                    </div>
                    <div className="text-[12px] text-[#607166]">
                      {item.recipientCompany} • {item.recipientEmail}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-[#283a2e] max-w-[260px] truncate">
                    {item.subject}
                  </td>
                  <td className="py-3.5 px-4 text-[13px] text-[#607166] max-w-[180px] truncate">
                    {item.campaignName}
                  </td>
                  <td className="py-3.5 px-4">{getStatusBadge(item.status)}</td>
                  <td className="py-3.5 px-4 text-[12px] text-[#607166]">
                    {item.sentAt}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="text-[#607166] group-hover:text-[#0a2414] inline-flex items-center space-x-1 text-[13px] font-medium">
                      <span>Inspect</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* THREAD DRAWER / MODAL */}
      {activeThreadEmail && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#ffffff] rounded-[10px] p-6 sm:p-8 border border-[#0a2414]/10 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#0a2414]/10 pb-4">
              <div>
                <span className="text-[12px] uppercase text-[#607166] block">
                  Campaign: {activeThreadEmail.campaignName}
                </span>
                <h2 className="text-[18px] font-semibold text-[#0a2414]">
                  {activeThreadEmail.subject}
                </h2>
              </div>
              <button
                onClick={() => setActiveThreadEmail(null)}
                className="px-2.5 py-1 text-[13px] rounded-[10px] hover:bg-[#fafaf9] text-[#607166]"
              >
                Close
              </button>
            </div>

            {/* Sent message */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[12px] text-[#607166]">
                <span>Sent from: {activeThreadEmail.senderMailbox}</span>
                <span>{activeThreadEmail.sentAt}</span>
              </div>
              <div className="p-4 rounded-[10px] bg-[#fafaf9] border border-[#0a2414]/8 text-[14px] leading-relaxed text-[#283a2e]">
                {activeThreadEmail.body}
              </div>
            </div>

            {/* Inbound reply if exists */}
            {activeThreadEmail.replyContent ? (
              <div className="space-y-2 pt-3 border-t border-[#0a2414]/10">
                <div className="flex items-center justify-between text-[12px] text-[#17b267]">
                  <span className="font-semibold">
                    Incoming Reply from {activeThreadEmail.recipientName}
                  </span>
                  <span>{activeThreadEmail.replyAt}</span>
                </div>
                <div className="p-4 rounded-[10px] bg-[#f3fbe9] border border-[#17b267]/30 text-[14px] leading-relaxed text-[#0a2414] font-medium">
                  {activeThreadEmail.replyContent}
                </div>
                <p className="text-[12px] text-[#607166]">
                  * Sequence follow-ups automatically paused upon receiving this reply.
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-[10px] bg-[#fafaf9] text-[13px] text-[#607166] text-center">
                No incoming replies received yet. Automatic reply tracking active.
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveThreadEmail(null)}
                className="px-5 py-2 rounded-[10px] bg-[#0a2414] text-[#ffffff] text-[14px] font-medium"
              >
                Close Thread
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
