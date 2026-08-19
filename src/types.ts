export type ViewMode = 'landing' | 'onboarding' | 'dashboard' | 'login' | 'signup' | 'terms' | 'privacy';

export type DashboardTab =
  | 'home'
  | 'organizations'
  | 'job_posts'
  | 'people'
  | 'signals'
  | 'drafts'
  | 'queue'
  | 'assistant'
  | 'campaigns'
  | 'sent'
  | 'senders'
  | 'personas'
  | 'settings';

export type SignalType = 'hiring' | 'funding' | 'complaints' | 'tech_changes';

export interface Organization {
  id: string;
  name: string;
  domain: string;
  employees: number;
  peopleCount: number;
  teamsCount: number;
  jobsCount: number;
  lastPost: string;
  industries: string[];
  orgTags: string[];
  isStarred?: boolean;
  activeSignal?: string;
  signalType?: SignalType;
}

export interface JobPost {
  id: string;
  company: string;
  role: string;
  department: string;
  location: string;
  postedAt: string;
  matchedSignal: string;
  openingsCount: number;
}

export interface PersonLead {
  id: string;
  name: string;
  role: string;
  company: string;
  email: string;
  location: string;
  signalContext: string;
}

export interface SignalItem {
  id: string;
  type: SignalType;
  title: string;
  company: string;
  contactName: string;
  contactRole: string;
  contactEmail: string;
  detail: string;
  sourceUrl?: string;
  detectedAt: string;
  confidenceScore: number;
}

export interface CampaignSequenceStep {
  stepNumber: number;
  label: string;
  delayDays: number;
  sentCount: number;
  openRate: number;
  replyRate: number;
  templateSnippet: string;
}

export interface VoiceDraftSample {
  id: string;
  subject: string;
  snippet: string;
  isLiked?: boolean;
  isDisliked?: boolean;
}

export interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused';
  personaId: string;
  leadsCount: number;
  sentCount: number;
  repliedCount: number;
  bouncedCount: number;
  createdAt: string;
  signalKeywords: string[];
  signals: SignalItem[];
  sequence: CampaignSequenceStep[];
  voiceNotes: string;
  voiceDrafts: VoiceDraftSample[];
}

export interface DraftEmail {
  id: string;
  campaignId: string;
  campaignName: string;
  recipientName: string;
  recipientEmail: string;
  recipientCompany: string;
  recipientRole: string;
  subject: string;
  body: string;
  signalReason: string;
  signalType: SignalType;
  detectedDetail: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
}

export interface SentEmail {
  id: string;
  campaignId: string;
  campaignName: string;
  recipientName: string;
  recipientEmail: string;
  recipientCompany: string;
  subject: string;
  body: string;
  sentAt: string;
  status: 'sent' | 'opened' | 'replied' | 'bounced';
  senderMailbox: string;
  replyContent?: string;
  replyAt?: string;
}

export interface SenderMailbox {
  id: string;
  email: string;
  status: 'active' | 'paused' | 'warming';
  connectedDays: number;
  dailyCap: number;
  maxCap: number;
  sentToday: number;
  healthScore: number;
  addedAt: string;
}

export interface Persona {
  id: string;
  name: string;
  companyName: string;
  description: string;
  websiteUrl: string;
  activeCampaignsCount: number;
}

export interface AssistantMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actionTaken?: {
    type: 'drafts_created' | 'leads_found' | 'campaign_updated' | 'summary';
    count?: number;
    details?: string;
  };
}

export interface ChatThread {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: AssistantMessage[];
}

export interface OnboardingState {
  currentStep: number;
  mailboxEmail: string;
  mailboxPassword: string;
  isMailboxConnected: boolean;
  mailingAddress: string;
  personaName: string;
  personaDescription: string;
  personaWebsite: string;
  targetAudience: string;
  voiceSample: string;
  voiceTone: 'casual' | 'formal' | 'concise' | 'storytelling';
  isCompleted: boolean;
}

export interface UserSettings {
  mailingAddress: string;
  defaultFollowUpDays: number;
  dailyCapAcrossAll: number;
  timezone: string;
  apiKey: string;
  accountEmail: string;
}

export interface AppSettings {
  complianceAddress: string;
  senderName: string;
  accountEmail: string;
  dailySummaryEmail: boolean;
  weeklySummaryEmail: boolean;
  alertOnReplies: boolean;
  crmSyncHubspot: boolean;
  crmSyncSalesforce: boolean;
  webhookUrl: string;
}
