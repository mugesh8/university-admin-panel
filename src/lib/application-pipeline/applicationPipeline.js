/**
 * Admissions pipeline: 20 stages with admin actions (ops spec).
 * Stages: order (1–20), id, display label, SLA (days, null = N/A),
 * nextIds for happy-path hints, discrete action buttons.
 */
export const APPLICATION_PIPELINE = [
  {
    order: 1,
    id: 'partial_draft',
    displayName: 'Partial Draft',
    slaDays: null,
    nextIds: ['submitted'],
    actions: [
      { id: 'send_reminder', label: 'Send reminder' },
      { id: 'mark_dropoff', label: 'Mark as drop-off' },
    ],
  },
  {
    order: 2,
    id: 'submitted',
    displayName: 'Submitted',
    slaDays: 1,
    nextIds: ['validation'],
    actions: [
      { id: 'begin_validation', label: 'Begin validation' },
      { id: 'add_note', label: 'Add note' },
    ],
  },
  {
    order: 3,
    id: 'validation',
    displayName: 'Validation',
    slaDays: 3,
    nextIds: ['incomplete', 'docs_complete'],
    actions: [
      { id: 'review_documents', label: 'Review documents' },
      { id: 'flag_incomplete', label: 'Flag as incomplete' },
      { id: 'mark_complete', label: 'Mark as complete' },
      { id: 'add_note', label: 'Add note' },
    ],
  },
  {
    order: 4,
    id: 'incomplete',
    displayName: 'Incomplete',
    slaDays: 7,
    nextIds: ['validation', 'docs_complete'],
    actions: [
      { id: 'view_missing', label: 'View missing items' },
      { id: 'send_reminder', label: 'Send reminder' },
      { id: 'upload_on_behalf', label: 'Upload on behalf' },
      { id: 'mark_complete', label: 'Mark as complete' },
    ],
  },
  {
    order: 5,
    id: 'docs_complete',
    displayName: 'Documents Complete',
    slaDays: 1,
    nextIds: ['app_fee_invoiced'],
    actions: [
      { id: 'gen_app_fee_invoice', label: 'Generate application fee invoice' },
      { id: 'invoice_sent', label: 'Invoice sent' },
      { id: 'add_note', label: 'Add note' },
    ],
  },
  {
    order: 6,
    id: 'app_fee_invoiced',
    displayName: 'App Fee — Invoice Sent',
    slaDays: 3,
    nextIds: ['app_fee_paid'],
    actions: [
      { id: 'paid', label: 'Paid' },
      { id: 'record_payment', label: 'Record payment' },
      { id: 'send_payment_reminder', label: 'Send payment reminder' },
      { id: 'add_note', label: 'Add note' },
    ],
  },
  {
    order: 7,
    id: 'app_fee_paid',
    displayName: 'App Fee — Paid',
    slaDays: null,
    nextIds: ['under_review'],
    actions: [
      { id: 'move_to_review', label: 'Move to review' },
      { id: 'assign_reviewer', label: 'Assign reviewer' },
      { id: 'add_note', label: 'Add note' },
    ],
  },
  {
    order: 8,
    id: 'under_review',
    displayName: 'Under Review',
    slaDays: 14,
    nextIds: ['interview_counselor'],
    actions: [
      { id: 'record_review_notes', label: 'Record review notes' },
      { id: 'request_additional_info', label: 'Request additional info' },
      { id: 'schedule_interview', label: 'Schedule interview' },
      { id: 'make_decision', label: 'Make decision' },
      { id: 'add_note', label: 'Add note' },
    ],
  },
  {
    order: 9,
    id: 'interview_counselor',
    displayName: 'Interview — Counselor',
    slaDays: 5,
    nextIds: ['pending_docs_post_interview', 'interview_dean'],
    actions: [
      { id: 'record_interview_notes', label: 'Record interview notes' },
      { id: 'record_recommendation', label: 'Record recommendation' },
      { id: 'schedule_dean_interview', label: 'Schedule Dean interview' },
      { id: 'request_additional_docs', label: 'Request additional docs' },
      { id: 'add_note', label: 'Add note' },
    ],
  },
  {
    order: 10,
    id: 'pending_docs_post_interview',
    displayName: 'Pending Final Docs',
    slaDays: 7,
    nextIds: ['interview_dean'],
    actions: [
      { id: 'view_missing', label: 'View missing items' },
      { id: 'send_reminder', label: 'Send reminder' },
      { id: 'upload_on_behalf', label: 'Upload on behalf' },
      { id: 'mark_complete', label: 'Mark as complete' },
    ],
  },
  {
    order: 11,
    id: 'interview_dean',
    displayName: 'Interview — Dean',
    slaDays: 5,
    nextIds: ['decision'],
    actions: [
      { id: 'record_interview_notes', label: 'Record interview notes' },
      { id: 'make_final_recommendation', label: 'Make final recommendation' },
      { id: 'add_note', label: 'Add note' },
    ],
  },
  {
    order: 12,
    id: 'decision',
    displayName: 'Decision Made',
    slaDays: 2,
    nextIds: ['offer_sent'],
    actions: [
      { id: 'sent', label: 'Sent' },
      { id: 'generate_offer_letter', label: 'Generate offer letter' },
      { id: 'generate_rejection_letter', label: 'Generate rejection letter' },
      { id: 'waitlist', label: 'Waitlist' },
      { id: 'defer', label: 'Defer' },
      { id: 'add_note', label: 'Add note' },
    ],
  },
  {
    order: 13,
    id: 'offer_sent',
    displayName: 'Offer Sent',
    slaDays: 7,
    nextIds: ['offer_accepted'],
    actions: [
      { id: 'offer_letter_accepted', label: 'Offer letter accepted' },
      { id: 'record_offer_response', label: 'Record offer response' },
      { id: 'send_reminder', label: 'Send reminder' },
      { id: 'extend_deadline', label: 'Extend deadline' },
      { id: 'withdraw_offer', label: 'Withdraw offer' },
      { id: 'add_note', label: 'Add note' },
    ],
  },
  {
    order: 14,
    id: 'offer_accepted',
    displayName: 'Offer Accepted',
    slaDays: 1,
    nextIds: ['reg_fee_invoiced'],
    actions: [
      { id: 'sent_invoice', label: 'Sent invoice' },
      { id: 'gen_reg_fee_invoice', label: 'Generate registration fee invoice' },
      { id: 'add_note', label: 'Add note' },
    ],
  },
  {
    order: 15,
    id: 'reg_fee_invoiced',
    displayName: 'Reg Fee — Invoice Sent',
    slaDays: 5,
    nextIds: ['reg_fee_paid'],
    actions: [
      { id: 'paid', label: 'Paid' },
      { id: 'record_payment', label: 'Record payment' },
      { id: 'send_reminder', label: 'Send reminder' },
      { id: 'add_note', label: 'Add note' },
    ],
  },
  {
    order: 16,
    id: 'reg_fee_paid',
    displayName: 'Reg Fee — Paid',
    slaDays: null,
    nextIds: ['visa_guidance'],
    actions: [
      { id: 'begin_visa_guidance', label: 'Begin visa guidance' },
      { id: 'reserve_seat', label: 'Reserve seat' },
      { id: 'add_note', label: 'Add note' },
    ],
  },
  {
    order: 17,
    id: 'visa_guidance',
    displayName: 'Visa Guidance',
    slaDays: 14,
    nextIds: ['tuition_invoiced'],
    actions: [
      { id: 'generate_tuition_fee', label: 'Generate tuition fee' },
      { id: 'sent_invoice', label: 'Sent invoice' },
      { id: 'update_visa_status', label: 'Update visa status' },
      { id: 'send_additional_guidance', label: 'Send additional guidance' },
      { id: 'add_note', label: 'Add note' },
    ],
  },
  {
    order: 18,
    id: 'tuition_invoiced',
    displayName: 'Tuition Fee — Invoice Sent',
    slaDays: 30,
    nextIds: ['tuition_paid'],
    actions: [
      { id: 'paid', label: 'Paid' },
      { id: 'record_payment', label: 'Record payment' },
      { id: 'send_reminder', label: 'Send reminder' },
      { id: 'add_note', label: 'Add note' },
    ],
  },
  {
    order: 19,
    id: 'tuition_paid',
    displayName: 'Tuition Fee — Paid',
    slaDays: null,
    nextIds: ['enrolled'],
    actions: [
      { id: 'create_student_credentials', label: 'Create student credentials' },
      { id: 'schedule_orientation', label: 'Schedule orientation' },
      { id: 'add_note', label: 'Add note' },
    ],
  },
  {
    order: 20,
    id: 'enrolled',
    displayName: 'Enrolled',
    slaDays: null,
    nextIds: [],
    actions: [
      { id: 'view_student_profile', label: 'View student profile' },
      { id: 'handoff_student_services', label: 'Handoff to Student Services' },
      { id: 'add_note', label: 'Add note' },
    ],
  },
]

const byId = new Map(APPLICATION_PIPELINE.map((s) => [s.id, s]))

/** All 20 stages for the Actions UI. */
export const APPLICATION_PIPELINE_STAGES = APPLICATION_PIPELINE

/** @deprecated Use APPLICATION_PIPELINE_STAGES; kept for any imports expecting post-submit-only tabs. */
export const APPLICATION_PIPELINE_TABS = APPLICATION_PIPELINE.filter((s) => s.order >= 2)

export function getPipelineStageById(id) {
  return byId.get(id) ?? null
}

/** Map list-view status labels to pipeline stage id (mock data). */
const STATUS_TO_PIPELINE_ID = {
  'Partial Draft': 'partial_draft',
  'partial draft': 'partial_draft',
  Submitted: 'submitted',
  submitted: 'submitted',
  Validation: 'validation',
  'Application Fee': 'app_fee_invoiced',
  'Under Review': 'under_review',
  'Interview Scheduled': 'interview_counselor',
  'Interview Complete': 'decision',
  Enrolled: 'enrolled',
  'Seat Reserved': 'reg_fee_paid',
}

/**
 * @param {{ status: string, daysInStage?: number | null, pipelineStageId?: string }} app
 */
export function getCurrentPipelineStage(app) {
  const id = app.pipelineStageId ?? STATUS_TO_PIPELINE_ID[app.status] ?? 'validation'
  return getPipelineStageById(id) ?? APPLICATION_PIPELINE[2]
}

/** Additional metadata from client pipeline document. */
export const PIPELINE_STAGE_METADATA = {
  partial_draft: {
    primaryAction: 'Send reminder email',
    automatedActions: ['Auto-reminder at 48h, 7d, 14d', 'Auto-drop-off at 30d'],
    entryTrigger: 'Applicant starts form but does not submit',
  },
  submitted: {
    primaryAction: 'Assign officer',
    automatedActions: ['Auto-assign based on round-robin or country/program rules'],
    entryTrigger: 'Applicant clicks "Submit Application"',
  },
  validation: {
    primaryAction: 'Review each document (Approve/Reject per document)',
    automatedActions: ['—'],
    entryTrigger: 'Auto after submission',
  },
  incomplete: {
    primaryAction: 'Send "missing documents" email with specific checklist',
    automatedActions: ['Auto-reminder at 3d, 5d'],
    entryTrigger: 'Admin flags missing or invalid items',
  },
  docs_complete: {
    primaryAction: 'Generate and send invoice',
    automatedActions: ['—'],
    entryTrigger: 'All required documents verified by admin',
  },
  app_fee_invoiced: {
    primaryAction: 'Record payment received',
    automatedActions: ['Auto-reminder at 2d'],
    entryTrigger: 'Admin sends invoice via system',
  },
  app_fee_paid: {
    primaryAction: 'Move to Under Review',
    automatedActions: ['—'],
    entryTrigger: 'Payment confirmed',
  },
  under_review: {
    primaryAction: 'Schedule counselor interview',
    automatedActions: ['—'],
    entryTrigger: 'After fee payment confirmed',
  },
  interview_counselor: {
    primaryAction: 'Record notes and recommendation',
    automatedActions: ['Send interview confirmation/reminder'],
    entryTrigger: 'Admin schedules first interview',
  },
  pending_docs_post_interview: {
    primaryAction: 'Send reminder',
    automatedActions: ['Auto-reminder at 3d, 5d'],
    entryTrigger: 'After counselor interview (if additional docs needed)',
  },
  interview_dean: {
    primaryAction: 'Record notes and recommendation',
    automatedActions: ['Send interview confirmation/reminder'],
    entryTrigger: 'After counselor recommendation + docs complete',
  },
  decision: {
    primaryAction: 'Generate appropriate letter based on decision',
    automatedActions: ['—'],
    entryTrigger: 'Dean/committee makes final decision',
  },
  offer_sent: {
    primaryAction: 'Record acceptance',
    automatedActions: ['Auto-reminder at 3d before deadline'],
    entryTrigger: 'Decision = Accept; admin sends offer letter',
  },
  offer_accepted: {
    primaryAction: 'Generate and send invoice',
    automatedActions: ['—'],
    entryTrigger: 'Applicant signs and returns offer letter',
  },
  reg_fee_invoiced: {
    primaryAction: 'Record payment received',
    automatedActions: ['Auto-reminder at 3d'],
    entryTrigger: 'After offer accepted',
  },
  reg_fee_paid: {
    primaryAction: 'Send visa guidance package',
    automatedActions: ['Auto-update seat capacity'],
    entryTrigger: 'Registration fee payment confirmed',
  },
  visa_guidance: {
    primaryAction: 'Update visa application status',
    automatedActions: ['—'],
    entryTrigger: 'After registration fee paid',
  },
  tuition_invoiced: {
    primaryAction: 'Record payment received',
    automatedActions: ['Auto-reminder at 7d, 14d'],
    entryTrigger: 'Before semester start (configurable timing)',
  },
  tuition_paid: {
    primaryAction: 'Trigger credential creation (Portal + SSO + Moodle + Lectorio)',
    automatedActions: ['Auto-create credentials via API'],
    entryTrigger: 'Tuition payment confirmed',
  },
  enrolled: {
    primaryAction: 'Close admissions file',
    automatedActions: ['—'],
    entryTrigger: 'All credentials created and orientation scheduled',
  },
}

/**
 * Stage-aware transitions for actions that should move an application
 * to a specific next stage in the pipeline.
 */
export const PIPELINE_ACTION_STAGE_TRANSITIONS = {
  submitted: {
    begin_validation: 'validation',
  },
  validation: {
    mark_complete: 'docs_complete',
    flag_incomplete: 'incomplete',
  },
  incomplete: {
    mark_complete: 'docs_complete',
  },
  docs_complete: {
    gen_app_fee_invoice: 'app_fee_invoiced',
    invoice_sent: 'app_fee_invoiced',
  },
  app_fee_invoiced: {
    paid: 'app_fee_paid',
    record_payment: 'app_fee_paid',
  },
  app_fee_paid: {
    move_to_review: 'under_review',
  },
  under_review: {
    schedule_interview: 'interview_counselor',
    make_decision: 'decision',
  },
  interview_counselor: {
    schedule_dean_interview: 'interview_dean',
    request_additional_docs: 'pending_docs_post_interview',
  },
  pending_docs_post_interview: {
    mark_complete: 'interview_dean',
  },
  interview_dean: {
    make_final_recommendation: 'decision',
  },
  decision: {
    sent: 'offer_sent',
    generate_offer_letter: 'offer_sent',
  },
  offer_sent: {
    offer_letter_accepted: 'offer_accepted',
    record_offer_response: 'offer_accepted',
  },
  offer_accepted: {
    sent_invoice: 'reg_fee_invoiced',
    gen_reg_fee_invoice: 'reg_fee_invoiced',
  },
  reg_fee_invoiced: {
    paid: 'reg_fee_paid',
    record_payment: 'reg_fee_paid',
  },
  reg_fee_paid: {
    begin_visa_guidance: 'visa_guidance',
  },
  visa_guidance: {
    sent_invoice: 'tuition_invoiced',
    update_visa_status: 'tuition_invoiced',
  },
  tuition_invoiced: {
    paid: 'tuition_paid',
    record_payment: 'tuition_paid',
  },
  tuition_paid: {
    create_student_credentials: 'enrolled',
  },
}

export function getNextPipelineStageForAction(stageId, actionId) {
  return PIPELINE_ACTION_STAGE_TRANSITIONS[stageId]?.[actionId] ?? null
}

export const DECISION_SUBTYPES = [
  { id: 'accepted', label: 'Accepted', nextStage: 'Offer Sent', letter: 'Admission Offer Letter' },
  {
    id: 'conditionally_accepted',
    label: 'Conditionally Accepted',
    nextStage: 'Offer Sent (with conditions)',
    letter: 'Conditional Offer Letter',
  },
  { id: 'waitlisted', label: 'Waitlisted', nextStage: 'Disposition: Waitlisted', letter: 'Waitlist Notification' },
  { id: 'deferred', label: 'Deferred', nextStage: 'Disposition: Deferred', letter: 'Deferral Notification' },
  { id: 'rejected', label: 'Rejected', nextStage: 'Disposition: Rejected', letter: 'Rejection Letter' },
]

export const APPLICATION_DISPOSITIONS = [
  { id: 'deferred', label: 'Deferred to Next Semester', reversible: true },
  { id: 'waitlisted', label: 'Waitlisted', reversible: true },
  { id: 'rejected', label: 'Rejected', reversible: false },
  { id: 'withdrawn_applicant', label: 'Withdrawn by Applicant', reversible: false },
  { id: 'withdrawn_admin', label: 'Withdrawn by University', reversible: false },
  { id: 'drop_off', label: 'Drop-off / Abandoned', reversible: true },
  { id: 'on_hold', label: 'On Hold', reversible: true },
  { id: 'cancelled', label: 'Cancelled Post-Acceptance', reversible: false },
]

export const UNIVERSAL_STAGE_ACTIONS = [
  'Change status (valid-next-stage enforcement)',
  'Assign/reassign officer',
  'Send templated email',
  'Send custom email',
  'Add internal note',
  'Apply disposition (Defer, Withdraw, Hold, Cancel)',
  'View activity timeline',
  'Download application as PDF/ZIP',
]

export function getPipelineStageMeta(stageId) {
  return (
    PIPELINE_STAGE_METADATA[stageId] ?? {
      primaryAction: '—',
      automatedActions: ['—'],
      entryTrigger: '—',
    }
  )
}

export function formatSla(slaDays) {
  if (slaDays == null) return '—'
  return `${slaDays} day${slaDays === 1 ? '' : 's'}`
}

export function isOverSla(slaDays, daysInStage) {
  if (slaDays == null || daysInStage == null) return false
  return daysInStage > slaDays
}
