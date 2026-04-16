/** Pipeline stages for charts and application status */
export const pipelineStages = [
  { key: 'draft', label: 'Draft', count: 42 },
  { key: 'submitted', label: 'Submitted', count: 128 },
  { key: 'validation', label: 'Validation', count: 18 },
  { key: 'incomplete', label: 'Incomplete', count: 24 },
  { key: 'under_review', label: 'Under Review', count: 56 },
  { key: 'interview', label: 'Interview', count: 12 },
  { key: 'decision', label: 'Decision', count: 8 },
  { key: 'accepted', label: 'Accepted', count: 34 },
]

export const weeklyTrend = [
  { week: 'W1', applications: 22 },
  { week: 'W2', applications: 28 },
  { week: 'W3', applications: 19 },
  { week: 'W4', applications: 35 },
  { week: 'W5', applications: 31 },
  { week: 'W6', applications: 40 },
  { week: 'W7', applications: 27 },
  { week: 'W8', applications: 33 },
]

export const programBreakdown = [
  { program: 'MD Program', enrolled: 48, capacity: 60 },
  { program: 'Pre-Med', enrolled: 22, capacity: 30 },
  { program: 'Foundation', enrolled: 15, capacity: 25 },
]

export const genderBreakdown = [
  { name: 'Female', value: 58, fill: '#0f766e' },
  { name: 'Male', value: 38, fill: '#0e7490' },
  { name: 'Other', value: 4, fill: '#64748b' },
]
