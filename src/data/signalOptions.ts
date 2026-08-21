export interface SignalOption {
  id: string;
  title: string;
  desc: string;
}

export const SIGNAL_OPTIONS: SignalOption[] = [
  {
    id: 'hiring_surges',
    title: 'Hiring Surges',
    desc: 'Engineering, Sales Ops & GTM roles posted on job boards',
  },
  {
    id: 'funding_series_a',
    title: 'Funding Filings',
    desc: 'Series Seed/A/B round announcements & SEC disclosures',
  },
  {
    id: 'competitor_discontent',
    title: 'Competitor Discontent',
    desc: 'Deliverability complaints & legacy sequencer migrations',
  },
  {
    id: 'tech_changes',
    title: 'Tech Stack Migrations',
    desc: 'Replatforming to Postgres, AWS, or modern developer APIs',
  },
];
