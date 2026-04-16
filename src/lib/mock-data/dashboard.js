import { pipelineStages } from './pipeline.js'

export const kpiCards = [
  {
    id: 'total',
    title: 'Total applications',
    subtitle: 'This intake',
    value: '1,248',
    delta: '+12.4%',
    deltaPositive: true,
  },
  {
    id: 'pending',
    title: 'Pending review',
    subtitle: 'Awaiting officer',
    value: '86',
    delta: '-4.1%',
    deltaPositive: false,
  },
  {
    id: 'interviews',
    title: 'Interviews scheduled',
    subtitle: 'Next 30 days',
    value: '34',
    delta: '+8.0%',
    deltaPositive: true,
  },
  {
    id: 'offers',
    title: 'Offers sent',
    subtitle: 'This month',
    value: '52',
    delta: '+3.2%',
    deltaPositive: true,
  },
  {
    id: 'enrolled',
    title: 'Enrolled',
    subtitle: 'Confirmed seats',
    value: '127',
    delta: '+6.7%',
    deltaPositive: true,
  },
]

export const actionQueue = [
  {
    id: 'a1',
    applicationId: 'MUCM-2026-01402',
    name: 'Aisha Khan',
    action: 'Document verification overdue',
    daysWaiting: 5,
    stage: 'Validation',
  },
  {
    id: 'a2',
    applicationId: 'MUCM-2026-01388',
    name: 'James Osei',
    action: 'Fee confirmation pending',
    daysWaiting: 3,
    stage: 'Application Fee',
  },
  {
    id: 'a3',
    applicationId: 'MUCM-2026-01371',
    name: 'Maria Santos',
    action: 'Interview scheduling required',
    daysWaiting: 2,
    stage: 'Under Review',
  },
  {
    id: 'a4',
    applicationId: 'MUCM-2026-01355',
    name: 'Chen Wei',
    action: 'Incomplete — missing bank statement',
    daysWaiting: 9,
    stage: 'Incomplete',
  },
]

/** Funnel conversion mock (stage → next stage %) */
export function getFunnelData() {
  const stages = pipelineStages.filter((s) => s.key !== 'draft')
  return stages.map((s, i) => ({
    name: s.label,
    value: s.count,
    fill: `hsl(${160 + i * 12} 45% ${42 - i * 2}%)`,
  }))
}

export const revenueMock = {
  applicationFees: 184_200,
  registrationFees: 96_400,
  seatReservation: 42_100,
  target: 350_000,
}

export const documentCompletion = { complete: 78, incomplete: 22 }
