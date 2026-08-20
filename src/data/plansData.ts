import { PlanInfo, PlanTier, UserSubscription } from '../types';

export const PLANS: Record<PlanTier, PlanInfo> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 29,
    description: 'For someone testing this out on one product.',
    maxMailboxes: 1,
    maxCampaigns: 1,
    maxMonthlyLeads: 100,
    maxLeadsPerMonth: 100,
    features: [
      '1 connected mailbox',
      '1 campaign',
      'Up to 100 signal-matched leads a month',
      'AI-drafted outreach and follow-ups',
      'Reply and bounce tracking',
    ],
  },
  growth: {
    id: 'growth',
    name: 'Growth',
    price: 99,
    description: 'For someone running this seriously across a couple of things.',
    maxMailboxes: 3,
    maxCampaigns: 5,
    maxMonthlyLeads: 500,
    maxLeadsPerMonth: 500,
    isPopular: true,
    features: [
      'Up to 3 connected mailboxes',
      'Up to 5 campaigns',
      'Up to 500 signal-matched leads a month',
      'Everything in Starter',
      'Faster signal scanning (checks for new signals more often)',
    ],
  },
  scale: {
    id: 'scale',
    name: 'Scale',
    price: 299,
    description: 'For someone running several products or a heavier volume.',
    maxMailboxes: 9999, // Unlimited
    maxCampaigns: 9999, // Unlimited
    maxMonthlyLeads: 2000,
    maxLeadsPerMonth: 2000,
    features: [
      'Unlimited mailboxes',
      'Unlimited campaigns',
      'Up to 2,000 signal-matched leads a month',
      'Everything in Growth',
      'A 30-minute setup call with you, personally',
    ],
  },
};

export const initialSubscription: UserSubscription = {
  plan: 'starter',
  status: 'trial',
  isTrial: true,
  trialDaysRemaining: 7,
  trialExpiresAt: 'in 7 days',
  trialEndsAt: 'Aug 26, 2026',
  currentPeriodStart: 'Aug 19, 2026',
  currentPeriodEnd: 'Aug 26, 2026',
  monthlyLeadsUsed: 38,
  leadsUsedThisMonth: 38,
  maxLeads: 100,
  cancelAtPeriodEnd: false,
  canceledAt: null,
};
