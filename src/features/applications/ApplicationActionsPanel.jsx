import { useEffect, useState } from 'react'
import { Check, Circle, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { Card } from '../../components/ui/Card.jsx'
import {
  APPLICATION_DISPOSITIONS,
  APPLICATION_PIPELINE_STAGES,
  getCurrentPipelineStage,
  getNextPipelineStageForAction,
  getPipelineStageMeta,
  getPipelineStageById,
  UNIVERSAL_STAGE_ACTIONS,
} from '../../lib/application-pipeline/applicationPipeline.js'
import {
  markApplicationStageCompleted,
  setApplicationDisposition,
  setApplicationPipelineStage,
} from '../../lib/mock-data/applications.js'

export function ApplicationActionsPanel({ application }) {
  const navigate = useNavigate()
  const [currentStageId, setCurrentStageId] = useState(() => getCurrentPipelineStage(application).id)
  const [lastAction, setLastAction] = useState(null)
  const current = getPipelineStageById(currentStageId) ?? getCurrentPipelineStage(application)
  const manuallyCompletedStageIds = new Set(application.completedStageIds ?? [])

  useEffect(() => {
    setCurrentStageId(getCurrentPipelineStage(application).id)
  }, [application.id, application.status, application.pipelineStageId])

  function runAction(stageId, actionId, label) {
    setLastAction({ key: `${stageId}:${actionId}`, label, at: new Date() })
  }

  function handleStageAction(stage, action) {
    const routeByAction = {
      review_documents: '/applications/documents',
      view_missing: '/applications/documents',
      upload_on_behalf: '/applications/documents',
      record_payment: '/applications/payments',
      send_payment_reminder: '/applications/payments',
      gen_app_fee_invoice: '/applications/payments',
      gen_reg_fee_invoice: '/applications/payments',
      record_interview_notes: '/applications/interviews',
      record_recommendation: '/applications/interviews',
      send_reminder: '/communications',
      request_additional_info: '/communications',
      add_note: '/communications',
    }

    const nextStageId = getNextPipelineStageForAction(stage.id, action.id)
    if (nextStageId) {
      const moved = setApplicationPipelineStage(application.id, nextStageId)
      if (moved) setCurrentStageId(nextStageId)
      const nextStage = getPipelineStageById(nextStageId)
      runAction(
        stage.id,
        action.id,
        moved
          ? `${action.label} → moved to ${nextStage?.displayName ?? 'next stage'}`
          : `${action.label} → unable to update stage`,
      )
      return
    }

    const targetRoute = routeByAction[action.id]
    if (targetRoute) {
      runAction(stage.id, action.id, `${action.label} → opened ${targetRoute}`)
      navigate(targetRoute)
      return
    }

    if (action.id === 'waitlist') {
      setApplicationDisposition(application.id, 'Waitlisted')
      runAction(stage.id, action.id, 'Applied disposition: Waitlisted')
      return
    }
    if (action.id === 'defer') {
      setApplicationDisposition(application.id, 'Deferred to Next Semester')
      runAction(stage.id, action.id, 'Applied disposition: Deferred')
      return
    }
    if (action.id === 'generate_rejection_letter') {
      setApplicationDisposition(application.id, 'Rejected')
      runAction(stage.id, action.id, 'Applied disposition: Rejected (letter generated)')
      return
    }
    if (action.id === 'handoff_student_services') {
      const completed = markApplicationStageCompleted(application.id, stage.id)
      runAction(
        stage.id,
        action.id,
        completed ? `${stage.displayName} marked as completed` : `Unable to complete ${stage.displayName}`,
      )
      return
    }

    runAction(stage.id, action.id, action.label)
  }

  return (
    <div className="space-y-4" key={application.id}>
      {lastAction && (
        <div className="flex items-center justify-between rounded-[var(--radius-md)] border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
          <span>
            <span className="font-semibold">Last action:</span> {lastAction.label}
          </span>
          <span className="text-[10px] text-emerald-700">
            {lastAction.at.toLocaleTimeString()}
          </span>
        </div>
      )}

      <div className="divide-y divide-[var(--color-border)] rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)]">
        {APPLICATION_PIPELINE_STAGES.map((stage) => {
          const isManuallyCompleted = manuallyCompletedStageIds.has(stage.id)
          const isCurrent = stage.id === current.id && !isManuallyCompleted
          const isCompleted = isManuallyCompleted || stage.order < current.order
          const isUpcoming = stage.order > current.order
          const meta = getPipelineStageMeta(stage.id)

          const bgClass = isCurrent
            ? 'bg-emerald-50'
            : isCompleted
            ? 'bg-emerald-50/40'
            : 'bg-white'
          const accentText = isCurrent || isCompleted ? 'text-emerald-700' : 'text-[var(--color-text-muted)]'
          const titleColor = isCurrent || isCompleted ? 'text-emerald-800' : 'text-[var(--color-heading)]'

          return (
            <div
              key={stage.id}
              className={`flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:gap-4 ${bgClass} ${isUpcoming ? 'opacity-80' : ''}`}
            >
              <div className="flex shrink-0 items-baseline gap-2 sm:w-52 sm:flex-col sm:gap-1 md:w-64">
                <div className="flex items-center gap-2">
                  {isCompleted && <Check className="h-4 w-4 shrink-0 text-emerald-600" />}
                  {isCurrent && <Clock className="h-4 w-4 shrink-0 text-emerald-700" />}
                  {isUpcoming && <Circle className="h-4 w-4 shrink-0 text-[var(--color-text-muted)]" />}
                  <span className={`tabular-nums text-xs font-medium ${accentText}`}>
                    {String(stage.order).padStart(2, '0')}
                  </span>
                  <h3 className={`text-sm font-semibold ${titleColor}`}>
                    {stage.displayName}
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {isCurrent && (
                    <Badge tone="success" className="text-[10px] leading-tight">Current</Badge>
                  )}
                  {isCompleted && (
                    <Badge tone="success" className="text-[10px] leading-tight">Completed</Badge>
                  )}
                  {isUpcoming && (
                    <Badge tone="neutral" className="text-[10px] leading-tight">Upcoming</Badge>
                  )}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap gap-2">
                  {stage.actions.map((a) => {
                    const shouldUsePrimary =
                      isCurrent &&
                      ((stage.id === 'submitted' && a.id === 'begin_validation') ||
                        (stage.id === 'app_fee_invoiced' && a.id === 'paid') ||
                        (stage.id === 'app_fee_paid' && a.id === 'move_to_review') ||
                        (stage.id === 'under_review' && a.id === 'schedule_interview') ||
                        (stage.id === 'interview_counselor' && a.id === 'request_additional_docs') ||
                        (stage.id === 'pending_docs_post_interview' && a.id === 'mark_complete') ||
                        (stage.id === 'interview_dean' && a.id === 'make_final_recommendation') ||
                        (stage.id === 'decision' && a.id === 'sent') ||
                        (stage.id === 'offer_sent' && a.id === 'offer_letter_accepted') ||
                        (stage.id === 'offer_accepted' && a.id === 'sent_invoice') ||
                        (stage.id === 'reg_fee_invoiced' && a.id === 'paid') ||
                        (stage.id === 'reg_fee_paid' && a.id === 'begin_visa_guidance') ||
                        (stage.id === 'visa_guidance' && a.id === 'sent_invoice') ||
                        (stage.id === 'tuition_invoiced' && a.id === 'paid') ||
                        (stage.id === 'tuition_paid' && a.id === 'create_student_credentials') ||
                        (stage.id === 'enrolled' && a.id === 'handoff_student_services') ||
                        (stage.id === 'validation' && a.id === 'flag_incomplete') ||
                        (stage.id === 'incomplete' && a.id === 'mark_complete') ||
                        (stage.id === 'docs_complete' && a.id === 'invoice_sent'))

                    return (
                      <Button
                        key={a.id}
                        type="button"
                        variant={shouldUsePrimary ? 'primary' : 'secondary'}
                        disabled={isUpcoming}
                        className={`py-2 text-xs hover:translate-y-0 ${
                          !isCurrent && !isCompleted
                            ? ''
                            : isCurrent && !shouldUsePrimary
                            ? '!border-[#D4A843]/50 !bg-white !bg-none !text-[#0A1628] hover:!border-[#D4A843] hover:!bg-[#F9F5EA]'
                            : ''
                        } ${
                          isCompleted && !isUpcoming
                            ? '!border-[#E7DDB8] !bg-[#F9F5EA] !text-[#6F5A1E] hover:!border-[#D9CB96] hover:!bg-[#F9F5EA]'
                            : ''
                        }`}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleStageAction(stage, a)
                        }}
                      >
                        {a.label}
                      </Button>
                    )
                  })}
                </div>
                <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                  Automated actions:{' '}
                  <span className="font-medium text-[var(--color-heading)]">
                    {meta.automatedActions.join(' | ')}
                  </span>
                </p>
              </div>
            </div>
          )
        })}
      </div>

      <Card className="p-4">
        <h3 className="text-sm font-semibold text-[var(--color-heading)]">Disposition statuses (non-linear outcomes)</h3>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
          Apply at any stage. Reversible dispositions can be removed; non-reversible exit the pipeline.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {APPLICATION_DISPOSITIONS.map((d) => (
            <Button
              key={d.id}
              type="button"
              variant="ghost"
              className="border border-[var(--color-border)] py-2 text-xs hover:translate-y-0"
              onClick={() => {
                setApplicationDisposition(application.id, d.label)
                runAction('disposition', d.id, `Apply disposition: ${d.label}`)
              }}
            >
              {d.label}
              <span className="ml-1 text-[10px] text-[var(--color-text-muted)]">
                {d.reversible ? '(Reversible)' : '(Final)'}
              </span>
            </Button>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-sm font-semibold text-[var(--color-heading)]">Universal actions (all stages)</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {UNIVERSAL_STAGE_ACTIONS.map((action) => (
            <Button
              key={action}
              type="button"
              variant="secondary"
              className="py-2 text-xs hover:translate-y-0"
              onClick={() => runAction('universal', action, action)}
            >
              {action}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  )
}
