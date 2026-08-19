import React, { useState } from 'react';
import { Organization } from '../../types';
import { initialOrganizations } from '../../data/mockData';

interface OrganizationsViewProps {
  onAddOrgToCampaign?: (org: Organization) => void;
}

export const OrganizationsView: React.FC<OrganizationsViewProps> = ({ onAddOrgToCampaign }) => {
  const [organizations, setOrganizations] = useState<Organization[]>(initialOrganizations);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedSignalFilter, setSelectedSignalFilter] = useState<string>('all');
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);

  const filteredOrgs = organizations.filter((org) => {
    const matchesSearch =
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.industries.some((i) => i.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTag = selectedTag === 'all' || org.orgTags.includes(selectedTag);
    const matchesSignal =
      selectedSignalFilter === 'all' ||
      (selectedSignalFilter === 'active' && org.activeSignal) ||
      (selectedSignalFilter === org.signalType);

    return matchesSearch && matchesTag && matchesSignal;
  });

  const toggleStar = (orgId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOrganizations((prev) =>
      prev.map((o) => (o.id === orgId ? { ...o, isStarred: !o.isStarred } : o))
    );
  };

  return (
    <div id="dashboard-organizations-view" className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-[24px] font-semibold tracking-tight text-[#0a2414]">
              Organizations
            </h1>
            <span className="px-2.5 py-0.5 rounded-[6px] bg-[#f3fbe9] border border-[#17b267]/30 text-[#0a2414] text-[12px] font-semibold">
              1,742,828 matching orgs
            </span>
          </div>
          <p className="text-[13.5px] text-[#607166]">
            Target accounts ranked by hiring momentum, tech stack changes, and funding events.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelectedSignalFilter(selectedSignalFilter === 'active' ? 'all' : 'active')}
            className={`px-3.5 py-2 rounded-[10px] text-[13px] font-semibold transition-all ${
              selectedSignalFilter === 'active'
                ? 'bg-[#0a2414] text-[#ffffff]'
                : 'bg-[#ffffff] border border-[#0a2414]/12 text-[#0a2414] hover:bg-[#fafaf9]'
            }`}
          >
            {selectedSignalFilter === 'active' ? 'Showing Active Signals Only' : 'Filter by Live Signals'}
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 bg-[#ffffff] rounded-[10px] border border-[#0a2414]/10">
        <div className="flex items-center space-x-2 flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by company name, domain, industry..."
            className="w-full text-[13.5px] text-[#0a2414] outline-none placeholder-[#607166] px-1 bg-transparent"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t md:border-t-0 md:border-l border-[#0a2414]/10 pt-2 md:pt-0 md:pl-4">
          <span className="text-[12px] text-[#607166] font-medium">Tag:</span>
          {['all', 'series-a', 'high-growth', 'b2b-saas', 'enterprise'].map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1 rounded-[6px] text-[12px] capitalize transition-colors ${
                selectedTag === tag
                  ? 'bg-[#0a2414] text-[#ffffff] font-semibold'
                  : 'bg-[#fafaf9] text-[#607166] hover:text-[#0a2414] border border-[#0a2414]/8'
              }`}
            >
              {tag.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-[10px] bg-[#ffffff] border border-[#0a2414]/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#0a2414]/8 bg-[#fafaf9] text-[11.5px] uppercase tracking-wider text-[#607166] font-semibold">
                <th className="py-3 px-5 w-10"></th>
                <th className="py-3 px-4">Organization</th>
                <th className="py-3 px-4">Headcount</th>
                <th className="py-3 px-4">Open Jobs</th>
                <th className="py-3 px-4">Active Signal</th>
                <th className="py-3 px-4">Tags</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0a2414]/6 text-[13.5px]">
              {filteredOrgs.map((org) => (
                <tr
                  key={org.id}
                  onClick={() => setSelectedOrg(org)}
                  className="hover:bg-[#f3fbe9]/40 transition-colors cursor-pointer group"
                >
                  <td className="py-4 px-5">
                    <button
                      onClick={(e) => toggleStar(org.id, e)}
                      className={`text-[12.5px] font-semibold transition-colors ${
                        org.isStarred ? 'text-[#17b267]' : 'text-[#607166]/40 hover:text-[#0a2414]'
                      }`}
                    >
                      {org.isStarred ? '★ Saved' : '☆ Save'}
                    </button>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-semibold text-[#0a2414] group-hover:text-[#17b267] transition-colors">
                      {org.name}
                    </div>
                    <div className="text-[12px] text-[#607166]">{org.domain}</div>
                  </td>
                  <td className="py-4 px-4 text-[#0a2414] font-medium">{org.employees}</td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-0.5 rounded-[6px] bg-[#fafaf9] border border-[#0a2414]/8 text-[#0a2414] text-[12px] font-medium">
                      {org.jobsCount} open roles
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    {org.activeSignal ? (
                      <div className="max-w-[280px]">
                        <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-[6px] bg-[#f3fbe9] text-[#0a2414] text-[11px] font-semibold border border-[#17b267]/30 mb-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#1ad379]"></span>
                          <span className="capitalize">{org.signalType} Signal</span>
                        </span>
                        <div className="text-[12px] text-[#283a2e] truncate">{org.activeSignal}</div>
                      </div>
                    ) : (
                      <span className="text-[12px] text-[#607166]">No active signal</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-1">
                      {org.orgTags.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded-[4px] bg-[#fafaf9] border border-[#0a2414]/8 text-[#607166] text-[11px] font-medium"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onAddOrgToCampaign) onAddOrgToCampaign(org);
                      }}
                      className="px-3 py-1.5 rounded-[10px] bg-[#ffffff] border border-[#0a2414]/12 hover:bg-[#0a2414] hover:text-[#ffffff] text-[#0a2414] text-[12px] font-semibold transition-all"
                    >
                      Track Intent
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Org Detail Modal */}
      {selectedOrg && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#ffffff] rounded-[10px] p-6 border border-[#0a2414]/10 space-y-4">
            <div className="flex items-start justify-between border-b border-[#0a2414]/8 pb-3">
              <div>
                <h3 className="text-[20px] font-semibold text-[#0a2414]">{selectedOrg.name}</h3>
                <span className="text-[13px] text-[#607166]">{selectedOrg.domain}</span>
              </div>
              <button
                onClick={() => setSelectedOrg(null)}
                className="text-[13px] text-[#607166] hover:text-[#0a2414] font-medium"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[13px]">
              <div className="p-3.5 bg-[#fafaf9] rounded-[10px] border border-[#0a2414]/6">
                <span className="text-[11px] text-[#607166] block font-medium">Headcount</span>
                <span className="font-semibold text-[#0a2414] text-[15px]">{selectedOrg.employees}</span>
              </div>
              <div className="p-3.5 bg-[#fafaf9] rounded-[10px] border border-[#0a2414]/6">
                <span className="text-[11px] text-[#607166] block font-medium">Open Postings</span>
                <span className="font-semibold text-[#0a2414] text-[15px]">{selectedOrg.jobsCount}</span>
              </div>
            </div>

            {selectedOrg.activeSignal && (
              <div className="p-4 bg-[#f3fbe9] rounded-[10px] border border-[#17b267]/30 space-y-1.5">
                <span className="text-[11px] uppercase tracking-wider text-[#17b267] font-semibold block">
                  Detected Signal Reason
                </span>
                <p className="text-[13px] text-[#0a2414] leading-relaxed">
                  {selectedOrg.activeSignal}
                </p>
              </div>
            )}

            <div className="space-y-1">
              <span className="text-[12px] text-[#607166] block font-medium">Industries</span>
              <div className="flex flex-wrap gap-1">
                {selectedOrg.industries.map((ind) => (
                  <span
                    key={ind}
                    className="px-2.5 py-0.5 rounded-[6px] bg-[#fafaf9] border border-[#0a2414]/8 text-[#0a2414] text-[12px]"
                  >
                    {ind}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#0a2414]/8 flex items-center justify-end space-x-2">
              <button
                onClick={() => setSelectedOrg(null)}
                className="px-4 py-2 rounded-[10px] border border-[#0a2414]/12 text-[13px] font-medium text-[#607166]"
              >
                Dismiss
              </button>
              <button
                onClick={() => {
                  if (onAddOrgToCampaign) onAddOrgToCampaign(selectedOrg);
                  setSelectedOrg(null);
                }}
                className="px-4 py-2 rounded-[10px] bg-[#1ad379] hover:bg-[#17b267] text-[#0a2414] text-[13px] font-semibold"
              >
                Add to Watchlist
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
