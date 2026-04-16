/** Download filtered applications as CSV (opens cleanly in Excel). */

function escapeCsvCell(value) {
  const s = value == null ? '' : String(value)
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export function exportApplicationsToCsv(rows, filename = 'applications-report') {
  const headers = [
    'Application ID',
    'Name',
    'Citizenship',
    'Status',
    'Submitted',
    'Officer',
    'Days in stage',
    'Program',
    'Intake',
    'Country',
    'Email',
    'Referred by',
  ]
  const lines = [
    headers.join(','),
    ...rows.map((r) =>
      [
        r.id,
        r.name,
        r.citizenship,
        r.status,
        r.submittedAt,
        r.assignedOfficer,
        r.daysInStage,
        r.program,
        r.intake,
        r.country,
        r.email,
        r.referredBy,
      ]
        .map(escapeCsvCell)
        .join(','),
    ),
  ]
  const blob = new Blob(['\ufeff', lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const safe = `${filename}-${new Date().toISOString().slice(0, 10)}`
  a.href = url
  a.download = `${safe}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
