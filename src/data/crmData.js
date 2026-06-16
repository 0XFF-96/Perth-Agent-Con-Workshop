export const repeatedPrompt =
  'Prepare my Q3 follow-up for Acme Corp and show me what changed.';

export const acmeAccount = {
  name: 'Acme Corp',
  segment: 'Enterprise manufacturing',
  owner: 'Maya Chen',
  renewalDate: '2026-09-30',
  health: 'At risk',
  stage: 'Renewal negotiation',
  arr: 420000,
  q3Revenue: 128000,
  q2Revenue: 146000,
  champion: 'Priya Nair, VP Operations',
  riskSignals: [
    'Usage fell 12% in APAC plants during Q3',
    'Procurement asked for a 15% discount',
    'Security review is waiting on SSO evidence',
  ],
  opportunities: [
    { name: 'Core platform renewal', amount: 420000, stage: 'Negotiation' },
    { name: 'APAC workflow expansion', amount: 95000, stage: 'Discovery' },
    { name: 'Data residency add-on', amount: 48000, stage: 'Security review' },
  ],
  notes: [
    'Champion wants an executive-ready usage story before the renewal call.',
    'Finance needs a discount rationale by Friday.',
    'Support escalations dropped after the May workflow cleanup.',
  ],
  tasks: [
    { id: 'task-1', label: 'Send Q3 usage summary to Priya', owner: 'Maya', done: false },
    { id: 'task-2', label: 'Attach SSO evidence for security review', owner: 'Solutions', done: false },
    { id: 'task-3', label: 'Draft discount approval note for finance', owner: 'Maya', done: false },
  ],
  regions: [
    { name: 'North America', revenue: 62000, delta: 8 },
    { name: 'Europe', revenue: 41000, delta: 2 },
    { name: 'APAC', revenue: 25000, delta: -12 },
  ],
};
