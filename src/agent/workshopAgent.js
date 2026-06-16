export function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function createL2Response(account) {
  return {
    title: 'Text-only CRM advice',
    body:
      `${account.name} needs a Q3 follow-up focused on renewal risk. ` +
      `Q3 revenue is ${formatCurrency(account.q3Revenue)}, down from ` +
      `${formatCurrency(account.q2Revenue)} in Q2. Lead with APAC usage, ` +
      `prepare the SSO evidence, and draft a finance-ready discount rationale.`,
  };
}

export function createL3Cards(account) {
  const revenueDelta = Math.round(
    ((account.q3Revenue - account.q2Revenue) / account.q2Revenue) * 100,
  );

  return [
    {
      type: 'accountBrief',
      title: 'Account brief',
      account: account.name,
      detail: `${account.segment} account owned by ${account.owner}`,
      status: account.health,
    },
    {
      type: 'dealRisk',
      title: 'Deal risk',
      status: account.health,
      risks: account.riskSignals,
    },
    {
      type: 'followUpEmail',
      title: 'Follow-up email',
      subject: `Q3 renewal follow-up for ${account.name}`,
      body: `Hi ${account.champion.split(',')[0]}, I pulled together the Q3 usage story and next steps before our renewal conversation.`,
    },
    {
      type: 'revenueDelta',
      title: 'Revenue delta',
      value: revenueDelta,
      label: `${formatCurrency(account.q3Revenue)} in Q3`,
    },
  ];
}

export function createL4Layout(account) {
  return {
    type: 'workspace',
    title: `${account.name} renewal workspace`,
    children: [
      {
        type: 'kpiRow',
        items: [
          { label: 'ARR', value: formatCurrency(account.arr), tone: 'neutral' },
          { label: 'Q3 revenue', value: formatCurrency(account.q3Revenue), tone: 'warning' },
          { label: 'Health', value: account.health, tone: 'danger' },
        ],
      },
      {
        type: 'insightPanel',
        title: 'What changed',
        body: 'Q3 revenue softened because APAC usage fell, but support escalations improved after the workflow cleanup.',
      },
      {
        type: 'regionChart',
        title: 'Revenue by region',
        regions: account.regions,
      },
      {
        type: 'taskTable',
        title: 'Recommended next actions',
        tasks: account.tasks,
      },
    ],
  };
}

export function createInitialAccountPlan(account) {
  return {
    account: account.name,
    status: account.health,
    lastChanged: 'Seeded from CRM context',
    items: account.tasks.map((task) => ({ ...task })),
    emailDraft:
      `Hi ${account.champion.split(',')[0]},\n\n` +
      'I reviewed Q3 usage and prepared the renewal next steps. The main change is APAC usage softness, while support escalations improved after the workflow cleanup.\n\n' +
      'I will send the usage summary, SSO evidence, and finance note before our renewal call.',
  };
}

export function completePlanItem(plan, itemId) {
  return {
    ...plan,
    lastChanged: `Completed ${itemId}`,
    items: plan.items.map((item) =>
      item.id === itemId ? { ...item, done: true } : item,
    ),
  };
}

export function summarizePlanChange(previousPlan, nextPlan) {
  const changedItem = nextPlan.items.find((item) => {
    const previousItem = previousPlan.items.find((candidate) => candidate.id === item.id);
    return previousItem && previousItem.done !== item.done;
  });

  if (!changedItem) {
    return 'No shared-state change detected yet.';
  }

  return `You marked "${changedItem.label}" as ${changedItem.done ? 'done' : 'open'}.`;
}
