import { Campaign, Persona } from '../types';

/**
 * Exports all campaigns with performance metrics to a well-formatted CSV file.
 */
export function exportCampaignsToCSV(campaigns: Campaign[], personas: Persona[] = []) {
  if (!campaigns || campaigns.length === 0) {
    alert('No campaign data available to export.');
    return false;
  }

  const headers = [
    'Campaign ID',
    'Campaign Name',
    'Status',
    'Sending Persona Voice',
    'Leads Detected',
    'Emails Dispatched',
    'Replies Received',
    'Reply Conversion Rate (%)',
    'Bounces',
    'Created At',
    'Signal Triggers Monitored',
    'Sequence Steps Count',
    'Draft Voice Instructions',
  ];

  const escapeCSV = (str: string | number | undefined | null) => {
    if (str === undefined || str === null) return '""';
    const cleanStr = String(str).replace(/"/g, '""');
    return `"${cleanStr}"`;
  };

  const rows = campaigns.map((camp) => {
    const persona = personas.find((p) => p.id === camp.personaId);
    const replyRate =
      camp.sentCount > 0 ? ((camp.repliedCount / camp.sentCount) * 100).toFixed(1) : '0.0';

    return [
      escapeCSV(camp.id),
      escapeCSV(camp.name),
      escapeCSV(camp.status),
      escapeCSV(persona ? `${persona.name} (${persona.companyName})` : 'Default Voice'),
      camp.leadsCount,
      camp.sentCount,
      camp.repliedCount,
      `${replyRate}%`,
      camp.bouncedCount,
      escapeCSV(camp.createdAt),
      escapeCSV(camp.signalKeywords?.join('; ') || 'N/A'),
      camp.sequence?.length || 0,
      escapeCSV(camp.voiceNotes || 'N/A'),
    ];
  });

  const csvRows = [headers.join(','), ...rows.map((r) => r.join(','))];
  const csvString = '\uFEFF' + csvRows.join('\r\n'); // Add BOM for Excel UTF-8 compatibility

  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);

  const dateStamp = new Date().toISOString().split('T')[0];
  link.setAttribute('download', `clerk-campaign-performance-${dateStamp}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return true;
}

/**
 * Exports a single campaign's detailed signal leads and sequence breakdown to CSV.
 */
export function exportSingleCampaignDetailsToCSV(campaign: Campaign, persona?: Persona) {
  if (!campaign) return false;

  const escapeCSV = (str: string | number | undefined | null) => {
    if (str === undefined || str === null) return '""';
    const cleanStr = String(str).replace(/"/g, '""');
    return `"${cleanStr}"`;
  };

  const lines: string[] = [];

  // Summary header
  lines.push('--- CAMPAIGN SUMMARY ---');
  lines.push(`Campaign Name,${escapeCSV(campaign.name)}`);
  lines.push(`Status,${escapeCSV(campaign.status)}`);
  lines.push(`Persona,${escapeCSV(persona?.name || 'Default')}`);
  lines.push(`Leads Count,${campaign.leadsCount}`);
  lines.push(`Sent Count,${campaign.sentCount}`);
  lines.push(`Replied Count,${campaign.repliedCount}`);
  lines.push(
    `Reply Rate,${
      campaign.sentCount > 0
        ? ((campaign.repliedCount / campaign.sentCount) * 100).toFixed(1) + '%'
        : '0%'
    }`
  );
  lines.push(`Created At,${escapeCSV(campaign.createdAt)}`);
  lines.push('');

  // Signals table
  lines.push('--- DETECTED SIGNALS & LEADS ---');
  lines.push('Signal ID,Type,Company,Contact Name,Role,Email,Confidence Score,Detected At,Signal Detail');
  if (campaign.signals && campaign.signals.length > 0) {
    campaign.signals.forEach((sig) => {
      lines.push(
        [
          escapeCSV(sig.id),
          escapeCSV(sig.type),
          escapeCSV(sig.company),
          escapeCSV(sig.contactName),
          escapeCSV(sig.contactRole),
          escapeCSV(sig.contactEmail),
          sig.confidenceScore,
          escapeCSV(sig.detectedAt),
          escapeCSV(sig.detail),
        ].join(',')
      );
    });
  } else {
    lines.push('No signals detected yet.');
  }
  lines.push('');

  // Sequence table
  lines.push('--- SEQUENCE STEPS ---');
  lines.push('Step Number,Step Label,Delay (Days),Sent Count,Open Rate (%),Reply Rate (%),Template Snippet');
  if (campaign.sequence && campaign.sequence.length > 0) {
    campaign.sequence.forEach((seq) => {
      lines.push(
        [
          seq.stepNumber,
          escapeCSV(seq.label),
          seq.delayDays,
          seq.sentCount,
          `${seq.openRate}%`,
          `${seq.replyRate}%`,
          escapeCSV(seq.templateSnippet),
        ].join(',')
      );
    });
  }

  const csvString = '\uFEFF' + lines.join('\r\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);

  const cleanName = campaign.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  link.setAttribute('download', `campaign-${cleanName}-report.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return true;
}
