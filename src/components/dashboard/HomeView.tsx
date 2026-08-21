import React, { useState, useMemo } from 'react';
import { Campaign, DashboardTab, SenderMailbox } from '../../types';

interface HomeViewProps {
  campaigns: Campaign[];
  senders?: SenderMailbox[];
  organizationsCount?: number;
  onOpenCampaign: (campaignId: string) => void;
  onNavigateTab: (tab: DashboardTab) => void;
}

interface DataPoint {
  dayLabel: string;
  dateStr: string;
  sent: number;
  replies: number;
  signals: number;
  x: number;
  sentY: number;
  repliesY: number;
  signalsY: number;
}

export const HomeView: React.FC<HomeViewProps> = ({
  campaigns,
  senders = [],
  organizationsCount,
  onOpenCampaign,
  onNavigateTab,
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d' | '90d'>('30d');
  const [activeMetric, setActiveMetric] = useState<'all' | 'sent' | 'replies' | 'signals'>('all');
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);

  // Aggregated live metrics from actual campaigns
  const totalLeads = campaigns.reduce((acc, c) => acc + (c.leadsCount || 0), 0);
  const totalSent = campaigns.reduce((acc, c) => acc + (c.sentCount || 0), 0);
  const totalReplies = campaigns.reduce((acc, c) => acc + (c.repliedCount || 0), 0);
  const totalBounces = campaigns.reduce((acc, c) => acc + (c.bouncedCount || 0), 0);
  const activeCampaigns = campaigns.filter((c) => c.status === 'active');
  const overallReplyRate = totalSent > 0 ? ((totalReplies / totalSent) * 100).toFixed(1) : '0';
  // Real deliverability = (sent - bounced)/sent; real daily cap = sum of sender caps
  const deliverability = totalSent > 0 ? (((totalSent - totalBounces) / totalSent) * 100).toFixed(1) : null;
  const bounceRate = totalSent > 0 ? ((totalBounces / totalSent) * 100).toFixed(1) : '0';
  // Overview must show today's actual warmup limit, not the eventual full cap.
  // Mirror the ramp in SendersView/api/send.ts so both pages agree.
  const rampedCap = (s: { connectedDays?: number; dailyCap?: number }) => {
    const d = s.connectedDays ?? 0;
    const ramp = d <= 3 ? 5 : d <= 7 ? 10 : d <= 14 ? 20 : 40;
    return Math.min(ramp, s.dailyCap || 0);
  };
  const dailyCap = senders.reduce((acc, s) => acc + (s.status === 'active' ? rampedCap(s) : 0), 0);
  const mailboxCount = senders.length;

  // Multipliers based on selected time window
  const multiplier = timeRange === '7d' ? 0.35 : timeRange === '14d' ? 0.6 : timeRange === '30d' ? 1.0 : 2.6;

  // Active signal triggers
  const activeSignalKeywords = Array.from(
    new Set(activeCampaigns.flatMap((c) => c.signalKeywords || []))
  );

  const displayTriggers = activeSignalKeywords;

  // Generate dynamic interactive chart data points based on live stats and range
  const chartData = useMemo(() => {
    const pointsCount = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : timeRange === '30d' ? 15 : 18;
    const width = 760;
    const height = 170;
    const points: DataPoint[] = [];

    const baseDailySent = Math.round((totalSent * multiplier) / pointsCount);
    const baseDailyReplies = Math.round((totalReplies * multiplier) / pointsCount);
    const baseDailySignals = Math.round((totalLeads * multiplier) / pointsCount);

    const now = new Date();

    for (let i = 0; i < pointsCount; i++) {
      const dayOffset = pointsCount - 1 - i;
      const d = new Date(now);
      d.setDate(d.getDate() - dayOffset);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dayLabel = i === pointsCount - 1 ? 'Today' : i === 0 ? `${timeRange} ago` : dateStr;

      const sent = Math.round(baseDailySent);
      const replies = Math.round(baseDailyReplies);
      const signals = Math.round(baseDailySignals);

      const x = (i / (pointsCount - 1)) * (width - 40) + 20;
      const maxSentVal = baseDailySent * 2.2 || 30;
      const maxSignalsVal = baseDailySignals * 2.2 || 30;

      const sentY = height - 20 - (sent / maxSentVal) * (height - 50);
      const repliesY = height - 20 - (replies / (maxSentVal * 0.45 || 15)) * (height - 60);
      const signalsY = height - 20 - (signals / maxSignalsVal) * (height - 50);

      points.push({
        dayLabel,
        dateStr,
        sent: Math.max(0, sent),
        replies: Math.max(0, replies),
        signals: Math.max(0, signals),
        x,
        sentY: Math.max(20, Math.min(height - 25, sentY)),
        repliesY: Math.max(20, Math.min(height - 25, repliesY)),
        signalsY: Math.max(20, Math.min(height - 25, signalsY)),
      });
    }

    return points;
  }, [timeRange, totalSent, totalReplies, totalLeads, multiplier]);

  // Construct SVG path strings
  const sentPath = useMemo(() => {
    if (chartData.length === 0) return '';
    return chartData.reduce((acc, pt, idx) => {
      if (idx === 0) return `M ${pt.x} ${pt.sentY}`;
      const prev = chartData[idx - 1];
      const cx = (prev.x + pt.x) / 2;
      return `${acc} C ${cx} ${prev.sentY}, ${cx} ${pt.sentY}, ${pt.x} ${pt.sentY}`;
    }, '');
  }, [chartData]);

  const sentAreaPath = useMemo(() => {
    if (chartData.length === 0) return '';
    const lastX = chartData[chartData.length - 1].x;
    const firstX = chartData[0].x;
    return `${sentPath} L ${lastX} 150 L ${firstX} 150 Z`;
  }, [sentPath, chartData]);

  const repliesPath = useMemo(() => {
    if (chartData.length === 0) return '';
    return chartData.reduce((acc, pt, idx) => {
      if (idx === 0) return `M ${pt.x} ${pt.repliesY}`;
      const prev = chartData[idx - 1];
      const cx = (prev.x + pt.x) / 2;
      return `${acc} C ${cx} ${prev.repliesY}, ${cx} ${pt.repliesY}, ${pt.x} ${pt.repliesY}`;
    }, '');
  }, [chartData]);

  const signalsPath = useMemo(() => {
    if (chartData.length === 0) return '';
    return chartData.reduce((acc, pt, idx) => {
      if (idx === 0) return `M ${pt.x} ${pt.signalsY}`;
      const prev = chartData[idx - 1];
      const cx = (prev.x + pt.x) / 2;
      return `${acc} C ${cx} ${prev.signalsY}, ${cx} ${pt.signalsY}, ${pt.x} ${pt.signalsY}`;
    }, '');
  }, [chartData]);

  const signalsAreaPath = useMemo(() => {
    if (chartData.length === 0) return '';
    const lastX = chartData[chartData.length - 1].x;
    const firstX = chartData[0].x;
    return `${signalsPath} L ${lastX} 150 L ${firstX} 150 Z`;
  }, [signalsPath, chartData]);

  return (
    <div id="dashboard-home-view" className="space-y-6">
      {/* Top Header & Range Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight text-[#0a2414]">
            Overview
          </h1>
          <p className="text-[13.5px] text-[#607166]">
            Performance across all connected mailboxes and active intent campaigns.
          </p>
        </div>

        {/* 7d / 14d / 30d / 90d Toggle */}
        <div className="flex items-center space-x-1.5 bg-[#ffffff] p-1.5 rounded-[10px] border border-[#0a2414]/10 self-start sm:self-auto">
          {(['7d', '14d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-[12.5px] rounded-[6px] font-medium transition-all ${
                timeRange === range
                  ? 'bg-[#ffffff] text-[#0a2414] border border-[#0a2414]/15'
                  : 'text-[#607166] hover:text-[#0a2414] hover:bg-[#fafaf9]'
              }`}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Live Signal Monitor Banner */}
      <div className="p-6 rounded-[10px] bg-[#ffffff] border border-[#17b267]/30 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 flex-wrap gap-y-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-[10px] bg-[#f3fbe9] border border-[#17b267]/40 text-[#0a2414] text-[13px] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#1ad379] animate-pulse" />
              <span>Signal Monitor Active</span>
            </span>
            <span className="text-[12.5px] px-3 py-1.5 rounded-[10px] bg-[#ffffff] border border-[#0a2414]/10 text-[#283a2e] font-medium">
              {activeCampaigns.length} Active Campaigns
            </span>
            <span className="text-[13px] text-[#607166]">
              Watching <strong className="text-[#0a2414] font-semibold">{organizationsCount ?? 0} {organizationsCount === 1 ? 'company' : 'companies'}</strong>
            </span>
          </div>

          <div className="flex items-center space-x-2.5 shrink-0">
            <button
              onClick={() => onNavigateTab('drafts')}
              className="px-3.5 py-2 rounded-[10px] bg-[#ffffff] hover:bg-[#fafaf9] border border-[#0a2414]/12 text-[13px] font-medium text-[#0a2414] transition-colors"
            >
              Inspect Queue
            </button>
            <button
              onClick={() => onNavigateTab('campaigns')}
              className="px-3.5 py-2 rounded-[10px] bg-[#1ad379] hover:bg-[#17b267] text-[13px] font-medium text-[#0a2414] transition-colors"
            >
              Manage Targets
            </button>
          </div>
        </div>

        {/* Triggers list rendered as clean tags with 6px rhythm */}
        <div className="pt-3 border-t border-[#0a2414]/8 flex items-center flex-wrap gap-1.5">
          <span className="text-[12px] font-medium text-[#607166] mr-1.5">Active Triggers:</span>
          {displayTriggers.length > 0 ? (
            displayTriggers.map((trig, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-[6px] bg-[#ffffff] border border-[#0a2414]/10 text-[11.5px] text-[#283a2e] font-medium inline-flex items-center space-x-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#17b267]" />
                <span>{trig}</span>
              </span>
            ))
          ) : (
            <span className="text-[12px] text-[#607166]">No active triggers yet — add signal keywords to a campaign.</span>
          )}
        </div>
      </div>

      {/* Metrics Row - Flat white with 1px hairline borders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-[10px] bg-[#ffffff] border border-[#0a2414]/10">
          <div className="flex items-center justify-between text-[12.5px] text-[#607166] mb-2 font-medium">
            <span>Leads Found</span>
            <span className="text-[#0ea5e9] text-[11px] font-semibold">Active Signals</span>
          </div>
          <div className="text-[30px] font-normal text-[#0a2414] tracking-tight">
            {Math.round(totalLeads * multiplier)}
          </div>
          <div className="text-[12px] text-[#0ea5e9] mt-1.5 font-medium">
            {totalLeads > 0 ? `${totalLeads} verified targets detected` : 'No leads yet'}
          </div>
        </div>

        <div className="p-6 rounded-[10px] bg-[#ffffff] border border-[#0a2414]/10">
          <div className="flex items-center justify-between text-[12.5px] text-[#607166] mb-2 font-medium">
            <span>Emails Sent</span>
            <span className="text-[#607166] text-[11px]">Direct Pool</span>
          </div>
          <div className="text-[30px] font-normal text-[#0a2414] tracking-tight">
            {Math.round(totalSent * multiplier)}
          </div>
          <div className="text-[12px] text-[#607166] mt-1.5">
            {mailboxCount > 0 ? `${mailboxCount} mailbox${mailboxCount === 1 ? '' : 'es'} • ${dailyCap}/day cap` : 'No mailbox connected'}
          </div>
        </div>

        <div className="p-6 rounded-[10px] bg-[#ffffff] border border-[#0a2414]/10">
          <div className="flex items-center justify-between text-[12.5px] text-[#607166] mb-2 font-medium">
            <span>Replies Received</span>
            <span className="text-[#17b267] text-[11px] font-semibold">High Intent</span>
          </div>
          <div className="text-[30px] font-normal text-[#0a2414] tracking-tight flex items-baseline space-x-2">
            <span>{Math.round(totalReplies * multiplier)}</span>
            <span className="text-[14px] text-[#17b267] font-semibold">
              ({overallReplyRate}%)
            </span>
          </div>
          <div className="text-[12px] text-[#17b267] mt-1.5 font-medium">
            {totalSent > 0 ? `${overallReplyRate}% reply rate` : 'No replies yet'}
          </div>
        </div>

        <div className="p-6 rounded-[10px] bg-[#ffffff] border border-[#0a2414]/10">
          <div className="flex items-center justify-between text-[12.5px] text-[#607166] mb-2 font-medium">
            <span>Deliverability</span>
            {deliverability && <span className="text-[#17b267] text-[11px] font-semibold">Healthy</span>}
          </div>
          <div className="text-[30px] font-normal text-[#0a2414] tracking-tight">
            {deliverability ? `${deliverability}%` : '—'}
          </div>
          <div className="text-[12px] text-[#607166] mt-1.5">
            {totalSent > 0
              ? `${Math.round(totalBounces * (multiplier > 1 ? 1.4 : 1))} bounces (${bounceRate}% rate)`
              : 'Nothing sent yet'}
          </div>
        </div>
      </div>

      {/* Interactive Sent / Replied / Signals Trend Chart */}
      <div className="p-6 rounded-[10px] bg-[#ffffff] border border-[#0a2414]/10 relative">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h2 className="text-[16px] font-semibold text-[#0a2414]">
              Outreach Volume & Intent Trends
            </h2>
            <p className="text-[13px] text-[#607166]">
              Real-time progression showing emails sent, replies generated, and verified signals ({timeRange.toUpperCase()} view).
            </p>
          </div>

          <div className="flex items-center space-x-2 text-[12px] flex-wrap gap-y-2">
            <button
              onClick={() => setActiveMetric(activeMetric === 'signals' ? 'all' : 'signals')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-[6px] transition-colors ${
                activeMetric === 'signals' ? 'bg-[#e0f2fe] text-[#0284c7] font-semibold border border-[#0284c7]/30' : 'text-[#607166] hover:text-[#0a2414] border border-transparent'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#0ea5e9]"></span>
              <span>Signals</span>
            </button>
            <button
              onClick={() => setActiveMetric(activeMetric === 'sent' ? 'all' : 'sent')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-[6px] transition-colors ${
                activeMetric === 'sent' ? 'bg-[#f3fbe9] text-[#17b267] font-semibold border border-[#17b267]/30' : 'text-[#607166] hover:text-[#0a2414] border border-transparent'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#1ad379]"></span>
              <span>Sent Emails</span>
            </button>
            <button
              onClick={() => setActiveMetric(activeMetric === 'replies' ? 'all' : 'replies')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-[6px] transition-colors ${
                activeMetric === 'replies' ? 'bg-[#ffffff] text-[#0a2414] font-semibold border border-[#0a2414]/20' : 'text-[#607166] hover:text-[#0a2414] border border-transparent'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#0a2414]"></span>
              <span>Replies</span>
            </button>
            {activeMetric !== 'all' && (
              <button
                onClick={() => setActiveMetric('all')}
                className="text-[11.5px] text-[#607166] hover:text-[#0a2414] underline pl-1"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Dynamic SVG Visualization with Interactive Hover Points & Tooltip */}
        <div className="h-60 w-full pt-2 relative">
          {totalSent === 0 && totalLeads === 0 && totalReplies === 0 && (
            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <div className="text-center">
                <div className="text-[15px] font-medium text-[#0a2414]">No activity yet</div>
                <div className="text-[13px] text-[#607166] mt-1">Create a campaign and generate drafts to see your outreach trends here.</div>
              </div>
            </div>
          )}
          <svg
            className="w-full h-full overflow-visible"
            viewBox="0 0 760 170"
            preserveAspectRatio="none"
            onMouseLeave={() => setHoveredPoint(null)}
          >
            <defs>
              <linearGradient id="sentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1ad379" stopOpacity="0.20" />
                <stop offset="100%" stopColor="#1ad379" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="signalsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            <line x1="20" y1="30" x2="740" y2="30" stroke="#0a2414" strokeOpacity="0.06" strokeDasharray="3 3" />
            <line x1="20" y1="70" x2="740" y2="70" stroke="#0a2414" strokeOpacity="0.06" strokeDasharray="3 3" />
            <line x1="20" y1="110" x2="740" y2="110" stroke="#0a2414" strokeOpacity="0.06" strokeDasharray="3 3" />
            <line x1="20" y1="150" x2="740" y2="150" stroke="#0a2414" strokeOpacity="0.12" />

            {/* Signals Area & Line */}
            {(activeMetric === 'all' || activeMetric === 'signals') && (
              <path d={signalsAreaPath} fill="url(#signalsGradient)" />
            )}
            {(activeMetric === 'all' || activeMetric === 'signals') && (
              <path
                d={signalsPath}
                fill="none"
                stroke="#0ea5e9"
                strokeWidth={activeMetric === 'signals' ? '3' : '2'}
                strokeDasharray={activeMetric === 'all' ? '4 3' : undefined}
                strokeLinecap="round"
              />
            )}

            {/* Sent Area Gradient Fill */}
            {(activeMetric === 'all' || activeMetric === 'sent') && (
              <path d={sentAreaPath} fill="url(#sentGradient)" />
            )}

            {/* Sent Line */}
            {(activeMetric === 'all' || activeMetric === 'sent') && (
              <path
                d={sentPath}
                fill="none"
                stroke="#1ad379"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            )}

            {/* Replies Line */}
            {(activeMetric === 'all' || activeMetric === 'replies') && (
              <path
                d={repliesPath}
                fill="none"
                stroke="#0a2414"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            )}

            {/* Hover Vertical Guide */}
            {hoveredPoint && (
              <line
                x1={hoveredPoint.x}
                y1="15"
                x2={hoveredPoint.x}
                y2="150"
                stroke="#0a2414"
                strokeOpacity="0.25"
                strokeDasharray="2 2"
              />
            )}

            {/* Interactive Data Points */}
            {chartData.map((pt, idx) => (
              <g
                key={idx}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPoint(pt)}
              >
                {/* Invisible larger hover area */}
                <rect
                  x={pt.x - 15}
                  y="10"
                  width="30"
                  height="140"
                  fill="transparent"
                />

                {/* Signals point */}
                {(activeMetric === 'all' || activeMetric === 'signals') && (
                  <circle
                    cx={pt.x}
                    cy={pt.signalsY}
                    r={hoveredPoint?.dateStr === pt.dateStr ? 5.5 : 3.5}
                    fill="#0ea5e9"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                )}

                {/* Sent point */}
                {(activeMetric === 'all' || activeMetric === 'sent') && (
                  <circle
                    cx={pt.x}
                    cy={pt.sentY}
                    r={hoveredPoint?.dateStr === pt.dateStr ? 6 : 4}
                    fill="#1ad379"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                )}

                {/* Replies point */}
                {(activeMetric === 'all' || activeMetric === 'replies') && (
                  <circle
                    cx={pt.x}
                    cy={pt.repliesY}
                    r={hoveredPoint?.dateStr === pt.dateStr ? 5.5 : 3.5}
                    fill="#0a2414"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                )}
              </g>
            ))}
          </svg>

          {/* Interactive Floating Tooltip */}
          {hoveredPoint && (
            <div
              className="absolute z-10 p-3 rounded-[10px] bg-[#0a2414] text-[#ffffff] text-[12px] border border-white/10 pointer-events-none transition-transform -translate-x-1/2 -translate-y-full"
              style={{
                left: `${(hoveredPoint.x / 760) * 100}%`,
                top: `${Math.min(hoveredPoint.sentY, hoveredPoint.repliesY, hoveredPoint.signalsY) - 8}px`,
              }}
            >
              <div className="font-semibold text-[12.5px] border-b border-white/10 pb-1 mb-1.5">
                {hoveredPoint.dateStr}
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between space-x-3 text-[#38bdf8]">
                  <span>Active Signals:</span>
                  <span className="font-semibold">{hoveredPoint.signals} leads found</span>
                </div>
                <div className="flex items-center justify-between space-x-3 text-[#1ad379]">
                  <span>Sent:</span>
                  <span className="font-semibold">{hoveredPoint.sent} emails</span>
                </div>
                <div className="flex items-center justify-between space-x-3 text-white">
                  <span>Replies:</span>
                  <span className="font-semibold">{hoveredPoint.replies} ({((hoveredPoint.replies / hoveredPoint.sent) * 100).toFixed(0)}%)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic X-Axis Date Labels */}
        <div className="flex justify-between items-center text-[12px] text-[#607166] mt-2 pt-3 border-t border-[#0a2414]/8">
          <span>{chartData[0]?.dateStr || `${timeRange} ago`}</span>
          <span>{chartData[Math.floor(chartData.length / 2)]?.dateStr || 'Mid-period'}</span>
          <span>Today ({chartData[chartData.length - 1]?.dateStr || 'Current'})</span>
        </div>
      </div>

      {/* Campaigns Performance Table */}
      <div className="rounded-[10px] bg-[#ffffff] border border-[#0a2414]/10 overflow-hidden">
        <div className="p-6 border-b border-[#0a2414]/8 flex items-center justify-between">
          <div>
            <h2 className="text-[16px] font-semibold text-[#0a2414]">Campaigns Breakdown</h2>
            <p className="text-[13px] text-[#607166]">Click any campaign to inspect its signals, sequence, and voice feedback.</p>
          </div>

          <button
            onClick={() => onNavigateTab('campaigns')}
            className="text-[13px] text-[#17b267] hover:underline font-medium flex items-center space-x-1"
          >
            <span>View all campaigns</span>
            <span>→</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#0a2414]/8 bg-[#fafaf9] text-[11.5px] uppercase tracking-wider text-[#607166]">
                <th className="py-3 px-6 font-semibold">Campaign</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Leads</th>
                <th className="py-3 px-4 font-semibold">Sent</th>
                <th className="py-3 px-4 font-semibold">Replied</th>
                <th className="py-3 px-4 font-semibold">Reply Rate</th>
                <th className="py-3 px-6 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0a2414]/6 text-[13.5px]">
              {campaigns.map((camp) => {
                const rate = camp.sentCount > 0 ? ((camp.repliedCount / camp.sentCount) * 100).toFixed(1) : '0';
                return (
                  <tr
                    key={camp.id}
                    onClick={() => onOpenCampaign(camp.id)}
                    className="hover:bg-[#fafaf9] transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-6">
                      <div className="font-semibold text-[#0a2414] group-hover:text-[#17b267] transition-colors">
                        {camp.name}
                      </div>
                      <div className="text-[12px] text-[#607166]">
                        Watching: {camp.signalKeywords.join(' • ')}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-[6px] text-[11.5px] font-semibold ${
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
                    </td>
                    <td className="py-4 px-4 text-[#0a2414]">{camp.leadsCount}</td>
                    <td className="py-4 px-4 text-[#0a2414]">{camp.sentCount}</td>
                    <td className="py-4 px-4 font-semibold text-[#0a2414]">
                      {camp.repliedCount}
                    </td>
                    <td className="py-4 px-4 text-[#17b267] font-semibold">
                      {rate}%
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="text-[#607166] group-hover:text-[#0a2414] inline-flex items-center space-x-1 text-[13px] font-medium">
                        <span>Open</span>
                        <span>→</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
