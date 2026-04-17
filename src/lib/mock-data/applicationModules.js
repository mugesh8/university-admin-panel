import { applications } from './applications.js'

function applicationsWithInterviews() {
  return applications.filter((a) => a.interview)
}

export function getInterviewTableRows() {
  return applicationsWithInterviews().map((a) => ({
    rowKey: a.id,
    applicationId: a.id,
    applicantName: a.name,
    email: a.email,
    program: a.program,
    intake: a.intake,
    pipelineStatus: a.status,
    interviewStatus: a.interview.status,
    scheduledAt: a.interview.scheduledAt,
    timezone: a.interview.timezone,
    mode: a.interview.mode,
    location: a.interview.location,
    interviewers: a.interview.interviewers,
    inviteSentAt: a.interview.inviteSentAt,
    evaluation: a.interview.evaluation ?? null,
  }))
}

export function getPaymentTransactionRows() {
  const rows = []
  for (const a of applications) {
    for (const p of a.financial?.payments ?? []) {
      const id = p.id ?? `${a.id}-${p.type}`
      rows.push({
        rowKey: id,
        applicationId: a.id,
        applicantName: a.name,
        program: a.program,
        intake: a.intake,
        feeType: p.type,
        amount: p.amount,
        currency: p.currency ?? 'USD',
        status: p.status,
        reference: p.ref,
        method: p.method ?? '—',
        recordedAt: p.recordedAt ?? null,
        instructionsSentAt: p.instructionsSentAt ?? null,
      })
    }
  }
  return rows
}

export function getEnrolledStudentRows() {
  return applications
    .filter((a) => a.enrollment)
    .map((a) => ({
      rowKey: a.id,
      applicationId: a.id,
      studentId: a.enrollment.studentId,
      applicantName: a.name,
      email: a.email,
      program: a.program,
      intake: a.intake,
      enrolledAt: a.enrollment.enrolledAt,
      confirmedBy: a.enrollment.confirmedBy,
      notes: a.enrollment.notes ?? '',
    }))
}

export function getDocumentVerificationRows() {
  const rows = []
  for (const a of applications) {
    for (const d of a.documents ?? []) {
      rows.push({
        rowKey: `${a.id}-${d.id}`,
        applicationId: a.id,
        applicantName: a.name,
        program: a.program,
        intake: a.intake,
        documentType: d.name,
        verificationStatus: d.status,
        virusScan: d.virusScan ?? 'pending',
        stale: Boolean(d.stale),
        uploadedAt: d.uploadedAt ?? d.at,
        officer: d.officer,
        verifiedAt: d.at,
        fileUrl: d.fileUrl ?? null,
      })
    }
  }
  return rows
}
