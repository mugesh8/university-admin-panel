/** Rows for scaffold / settings pages */

export const emailTemplates = [
  {
    id: 't1',
    name: 'Application received',
    category: 'Transactional',
    subject: 'We received your application — {{application_id}}',
    mergeFields: ['{{applicant_name}}', '{{application_id}}', '{{program}}', '{{intake}}', '{{status}}'],
    lastEdited: '2026-03-01',
    active: true,
    bodyPreview:
      'Dear {{applicant_name}},\n\nThank you for applying to MUCM. Your application ID is {{application_id}} for {{program}} ({{intake}}). Current status: {{status}}.\n\n— Admissions',
  },
  {
    id: 't2',
    name: 'Missing documents',
    category: 'Reminders',
    subject: 'Action required: missing documents — {{application_id}}',
    mergeFields: ['{{applicant_name}}', '{{application_id}}', '{{missing_docs_list}}', '{{upload_link}}'],
    lastEdited: '2026-03-15',
    active: true,
    bodyPreview:
      'Dear {{applicant_name}},\n\nWe still need: {{missing_docs_list}}. Upload here: {{upload_link}}\n\n— Admissions',
  },
  {
    id: 't3',
    name: 'Interview invitation',
    category: 'Interview',
    subject: 'Interview invitation — {{interview_datetime}}',
    mergeFields: ['{{applicant_name}}', '{{interview_datetime}}', '{{timezone}}', '{{format_location}}', '{{dean_names}}'],
    lastEdited: '2026-02-20',
    active: true,
    bodyPreview:
      'Dear {{applicant_name}},\n\nYour interview is scheduled for {{interview_datetime}} ({{timezone}}). Format: {{format_location}}. Panel: {{dean_names}}.\n\n— Admissions',
  },
  {
    id: 't4',
    name: 'Acceptance / Offer letter',
    category: 'Decisions',
    subject: 'Offer letter — {{program}} · {{intake}}',
    mergeFields: ['{{applicant_name}}', '{{program}}', '{{intake}}', '{{offer_deadline}}', '{{payment_link}}'],
    lastEdited: '2026-01-08',
    active: true,
    bodyPreview:
      'Dear {{applicant_name}},\n\nCongratulations on your offer for {{program}}, {{intake}}. Please respond by {{offer_deadline}}. Payment instructions: {{payment_link}}.\n\n— Admissions',
  },
  {
    id: 't5',
    name: 'Fee reminder',
    category: 'Fees',
    subject: 'Payment reminder — {{fee_type}}',
    mergeFields: ['{{applicant_name}}', '{{fee_type}}', '{{amount}}', '{{currency}}', '{{admin_contact}}', '{{deadline}}'],
    lastEdited: '2026-04-02',
    active: true,
    bodyPreview:
      'Dear {{applicant_name}},\n\nThis is a reminder for {{fee_type}} ({{amount}} {{currency}}) before {{deadline}}. Contact: {{admin_contact}}.\n\n— Finance',
  },
  {
    id: 't6',
    name: 'Waitlist notification',
    category: 'Decisions',
    subject: 'Update on your application — waitlist',
    mergeFields: ['{{applicant_name}}', '{{application_id}}', '{{program}}'],
    lastEdited: '2025-12-18',
    active: false,
    bodyPreview: 'Dear {{applicant_name}},\n\nYour application {{application_id}} remains on the waitlist for {{program}}…',
  },
]

/** Recent bulk sends — delivery stats per BRD §4.8.4 */
export const bulkMessageCampaigns = [
  {
    id: 'b1',
    label: 'September 2026 · Fee reminder',
    templateName: 'Fee reminder',
    filtersSummary: 'Status: Application Fee · Intake: September 2026',
    sentAt: '2026-04-10T14:05:00Z',
    recipients: 42,
    sent: 42,
    delivered: 41,
    opened: 28,
    bounced: 1,
    sender: 'Ms. Porter',
  },
  {
    id: 'b2',
    label: 'All intakes · Missing documents (7d+)',
    templateName: 'Missing documents',
    filtersSummary: 'Status: Incomplete · Age in stage: > 7 days',
    sentAt: '2026-04-08T09:40:00Z',
    recipients: 17,
    sent: 17,
    delivered: 16,
    opened: 12,
    bounced: 1,
    sender: 'Dr. Ellis',
  },
  {
    id: 'b3',
    label: 'May 2026 · Enrollment confirmation',
    templateName: 'Application received',
    filtersSummary: 'Status: Enrolled · Intake: May 2026',
    sentAt: '2026-03-20T11:12:00Z',
    recipients: 31,
    sent: 31,
    delivered: 31,
    opened: 24,
    bounced: 0,
    sender: 'Ms. Porter',
  },
]

/** Merge-field hints for composer side panel */
export const emailMergeFieldGroups = [
  {
    title: 'Applicant',
    fields: ['{{applicant_name}}', '{{application_id}}', '{{status}}', '{{email}}'],
  },
  {
    title: 'Program & intake',
    fields: ['{{program}}', '{{intake}}', '{{offer_deadline}}'],
  },
  {
    title: 'Fees & links',
    fields: ['{{fee_type}}', '{{amount}}', '{{currency}}', '{{payment_link}}', '{{upload_link}}', '{{deadline}}'],
  },
  {
    title: 'Interview',
    fields: ['{{interview_datetime}}', '{{timezone}}', '{{format_location}}', '{{dean_names}}'],
  },
]

export const reportsCatalog = [
  { id: 'rep1', name: 'Admissions Funnel', exports: ['Excel', 'PDF'] },
  { id: 'rep2', name: 'Demographic Breakdown', exports: ['Excel', 'PDF'] },
  { id: 'rep3', name: 'Document Completion', exports: ['Excel'] },
  { id: 'rep4', name: 'Revenue Report', exports: ['Excel', 'PDF'] },
]

/** Admin panel users — `roleId` matches ids in `rbacRoles` (roles-permissions.js). */
export const adminUsers = [
  { id: 'u1', name: 'Dr. Ellis', roleId: 'admissions_officer', active: true, email: 'ellis@mucm.edu' },
  { id: 'u2', name: 'Ms. Porter', roleId: 'admissions_manager', active: true, email: 'porter@mucm.edu' },
  { id: 'u3', name: 'Finance Bot', roleId: 'finance', active: false, email: 'finance@mucm.edu' },
]

export const announcements = [
  { id: 'an1', title: 'Intake deadline extended', audience: 'September 2026 · All', active: true },
  { id: 'an2', title: 'Document upload maintenance', audience: 'All intakes', active: false },
]

export const faqItems = [
  {
    id: 'f1',
    category: 'Admissions',
    question: 'How do I submit transcripts?',
    answer:
      'Upload official transcripts as PDFs in the Documents step of your application. If your institution issues secure e-transcripts, you may submit the verification link in the notes field. Unofficial screenshots are not accepted.',
    active: true,
  },
  {
    id: 'f2',
    category: 'Fees',
    question: 'What payment methods are accepted?',
    answer:
      'We accept major credit and debit cards, bank transfer, and authorized third-party payers. Wire instructions appear on your fee invoice after you receive an offer.',
    active: true,
  },
]

export const supportTickets = [
  {
    id: 'tk1',
    applicant: 'demo@student.com',
    category: 'Documents',
    status: 'open',
    subject: 'Cannot upload PDF',
    updated: '2026-04-07',
    messages: [
      {
        id: 'm-tk1-1',
        from: 'applicant',
        body:
          'Hi — I keep getting an error when uploading my transcript PDF. The file is under 5MB. Can you help?',
        sentAt: '2026-04-07T10:15:00.000Z',
      },
    ],
  },
  {
    id: 'tk2',
    applicant: 'jane@email.com',
    category: 'Fees',
    status: 'resolved',
    subject: 'Wire transfer reference',
    updated: '2026-04-05',
    messages: [
      {
        id: 'm-tk2-1',
        from: 'applicant',
        body: 'I sent the wire yesterday — please confirm the reference number on file is correct.',
        sentAt: '2026-04-05T14:22:00.000Z',
      },
      {
        id: 'm-tk2-2',
        from: 'admin',
        body: 'Thanks — we’ve matched your payment. No further action needed.',
        sentAt: '2026-04-05T16:00:00.000Z',
      },
    ],
  },
]
