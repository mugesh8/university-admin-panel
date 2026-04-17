import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { usePageTitleContext } from '../../context/PageTitleContext.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { applicationSteps } from '../../lib/application-form/applicationSteps.js'
import { countries } from '../../lib/application-form/countries.js'
import { getSelectValues, isFieldVisible } from '../../lib/application-form/formVisibility.js'
import { usePersistentState } from '../../hooks/usePersistentState.js'
import { useAuth } from '../auth/useAuth.js'
import StepForm from './create-application/StepForm.jsx'

const ADMIN_FORM_STORAGE_KEY = 'mucm-admin-application-form'
const ADMIN_STEP_STORAGE_KEY = 'mucm-admin-current-step'
const ADMIN_SUBMISSIONS_KEY = 'mucm-admin-submitted-applications'

const initialForm = applicationSteps.reduce((accumulator, step) => {
  step.fields.forEach((field) => {
    if (field.type === 'checkbox') {
      accumulator[field.name] = field.defaultValue ?? false
    } else {
      accumulator[field.name] = field.defaultValue ?? ''
    }
  })
  return accumulator
}, {})

export function AdminCreateApplicationPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { setPageTitleOverride } = usePageTitleContext()
  const desktopScrollRef = useRef(null)
  const autoSaveTimerRef = useRef(null)
  const hasInitializedAutoSaveRef = useRef(false)

  const [currentStepIndex, setCurrentStepIndex] = usePersistentState(ADMIN_STEP_STORAGE_KEY, 0)
  const [formValues, setFormValues] = usePersistentState(ADMIN_FORM_STORAGE_KEY, initialForm)
  const [validationErrors, setValidationErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [draftNotice, setDraftNotice] = useState('')
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved')
  const [submitted, setSubmitted] = useState(false)
  const [lastSubmissionId, setLastSubmissionId] = useState('')

  useEffect(() => {
    setPageTitleOverride('New application')
    return () => setPageTitleOverride(null)
  }, [setPageTitleOverride])

  useEffect(() => {
    if (!draftNotice) return undefined
    const timeoutId = window.setTimeout(() => setDraftNotice(''), 4500)
    return () => window.clearTimeout(timeoutId)
  }, [draftNotice])

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    if (desktopScrollRef.current) {
      desktopScrollRef.current.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    }
  }, [currentStepIndex, submitted])

  useEffect(() => {
    if (submitted) return undefined
    if (!hasInitializedAutoSaveRef.current) {
      hasInitializedAutoSaveRef.current = true
      return undefined
    }
    setAutoSaveStatus('saving')
    if (autoSaveTimerRef.current) window.clearTimeout(autoSaveTimerRef.current)
    autoSaveTimerRef.current = window.setTimeout(() => setAutoSaveStatus('saved'), 450)
    return () => {
      if (autoSaveTimerRef.current) window.clearTimeout(autoSaveTimerRef.current)
    }
  }, [formValues, currentStepIndex, submitted])

  const currentStep = useMemo(
    () => applicationSteps[currentStepIndex] ?? applicationSteps[0],
    [currentStepIndex],
  )

  function validateField(field, value) {
    const stringValue = typeof value === 'string' ? value.trim() : value

    if (field.required) {
      if (field.type === 'checkbox' && !value) {
        return 'This field is required.'
      }
      if (field.type === 'repeatable') {
        if (!Array.isArray(value) || value.length === 0) {
          return 'This field is required.'
        }
      } else if (field.type !== 'checkbox' && !stringValue) {
        return 'This field is required.'
      }
    }

    if (field.type === 'repeatable') {
      return ''
    }

    if (!stringValue && !field.required) {
      return ''
    }

    if (field.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(String(stringValue))) {
        return 'Please enter a valid email address.'
      }
    }

    if (field.type === 'tel') {
      const digits = String(stringValue).replace(/\D/g, '')
      if (digits.length < 7) {
        return 'Please enter a valid phone number.'
      }
    }

    if (field.type === 'select' && field.options?.length > 0) {
      const allowed = getSelectValues(field.options)
      if (!allowed.includes(String(stringValue))) {
        return 'Please select a valid option.'
      }
    }

    if (field.type === 'country') {
      const exists = countries.some(
        (country) => country.toLowerCase() === String(stringValue).toLowerCase(),
      )
      if (!exists) {
        return 'Please select a valid country from the list.'
      }
    }

    if (field.type === 'date' && stringValue) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(String(stringValue))) {
        return 'Please enter a valid date as DD/MM/YYYY.'
      }
      const [y, mo, d] = String(stringValue).split('-').map(Number)
      const dt = new Date(y, mo - 1, d)
      if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) {
        return 'Please enter a valid date.'
      }
    }

    return ''
  }

  function validateStep(step, valuesToCheck) {
    const stepErrors = {}
    step.fields.forEach((field) => {
      if (!isFieldVisible(field, valuesToCheck)) {
        return
      }
      const message = validateField(field, valuesToCheck[field.name])
      if (message) {
        stepErrors[field.name] = message
      }
    })
    return stepErrors
  }

  function updateField(name, value) {
    setFormValues((previous) => {
      const next = { ...previous, [name]: value }
      if (name === 'hasBeenDisciplined' && value !== 'Yes') {
        next.disciplineActionExplanation = ''
      }
      if (name === 'hasBeenConvicted' && value !== 'Yes') {
        next.convictionExplanation = ''
      }
      if (name === 'hasDisability' && value !== 'Yes') {
        next.disabilityDetails = ''
      }
      if (name === 'requiresAccommodation' && value !== 'Yes') {
        next.accommodationDetails = ''
      }
      return next
    })

    setValidationErrors((previous) => {
      const nextErrors = { ...previous }
      if (name === 'hasBeenDisciplined') delete nextErrors.disciplineActionExplanation
      if (name === 'hasBeenConvicted') delete nextErrors.convictionExplanation
      if (name === 'hasDisability') delete nextErrors.disabilityDetails
      if (name === 'requiresAccommodation') delete nextErrors.accommodationDetails

      const activeField =
        applicationSteps.flatMap((step) => step.fields).find((field) => field.name === name) ?? null

      if (activeField) {
        const message = validateField(activeField, value)
        if (message) {
          nextErrors[name] = message
        } else {
          delete nextErrors[name]
        }
      }
      return nextErrors
    })
    setFormError('')
  }

  function handleNext() {
    const stepErrors = validateStep(currentStep, formValues)
    if (Object.keys(stepErrors).length > 0) {
      setValidationErrors((previous) => ({ ...previous, ...stepErrors }))
      setFormError('Please fix the highlighted fields before continuing.')
      return
    }
    setValidationErrors({})
    setFormError('')
    const nextStepIndex = Math.min(currentStepIndex + 1, applicationSteps.length - 1)
    try {
      window.localStorage.setItem(ADMIN_FORM_STORAGE_KEY, JSON.stringify(formValues))
      window.localStorage.setItem(ADMIN_STEP_STORAGE_KEY, JSON.stringify(nextStepIndex))
    } catch {
      // ignore
    }
    setCurrentStepIndex(nextStepIndex)
    setDraftNotice('Progress saved. Moving to next step.')
  }

  function handlePrevious() {
    setCurrentStepIndex((previous) => Math.max(previous - 1, 0))
  }

  function handleSaveDraft() {
    try {
      window.localStorage.setItem(ADMIN_FORM_STORAGE_KEY, JSON.stringify(formValues))
      window.localStorage.setItem(ADMIN_STEP_STORAGE_KEY, JSON.stringify(currentStepIndex))
    } catch {
      // ignore
    }
    setFormError('')
    setDraftNotice('Draft saved in this browser.')
  }

  function handleSubmit() {
    let firstInvalidStep = -1
    const allErrors = {}
    applicationSteps.forEach((step, stepIndex) => {
      const stepErrors = validateStep(step, formValues)
      if (Object.keys(stepErrors).length > 0 && firstInvalidStep === -1) {
        firstInvalidStep = stepIndex
      }
      Object.assign(allErrors, stepErrors)
    })

    if (Object.keys(allErrors).length > 0) {
      setValidationErrors(allErrors)
      setFormError('Please complete all required fields with valid values.')
      if (firstInvalidStep >= 0) {
        setCurrentStepIndex(firstInvalidStep)
      }
      return
    }

    setValidationErrors({})
    setFormError('')
    const documentFields =
      applicationSteps.find((step) => step.id === 'documents')?.fields.filter((f) => f.type === 'file') ?? []
    const applicationId = `MUCM-2026-${Date.now().toString().slice(-5)}`
    const submittedAt = new Date().toISOString()
    const snapshot =
      typeof structuredClone === 'function'
        ? structuredClone(formValues)
        : JSON.parse(JSON.stringify(formValues))
    const submittedRecord = {
      id: applicationId,
      submittedAt,
      createdBy: user?.email ?? 'admin',
      applicantName: `${formValues.firstName ?? ''} ${formValues.surname ?? ''}`.trim() || 'Applicant',
      formValues: snapshot,
      documents: documentFields.map((field) => ({
        name: field.name,
        label: field.label,
        required: Boolean(field.required),
        value: formValues[field.name] ?? '',
      })),
    }
    try {
      const existing = JSON.parse(window.localStorage.getItem(ADMIN_SUBMISSIONS_KEY) ?? '[]')
      const safeExisting = Array.isArray(existing) ? existing : []
      safeExisting.unshift(submittedRecord)
      window.localStorage.setItem(ADMIN_SUBMISSIONS_KEY, JSON.stringify(safeExisting))
    } catch {
      // ignore
    }
    setLastSubmissionId(applicationId)
    setSubmitted(true)
  }

  function handleDone() {
    setCurrentStepIndex(0)
    setFormValues(initialForm)
    setSubmitted(false)
    setLastSubmissionId('')
    try {
      window.localStorage.removeItem(ADMIN_FORM_STORAGE_KEY)
      window.localStorage.removeItem(ADMIN_STEP_STORAGE_KEY)
    } catch {
      // ignore
    }
    navigate('/applications')
  }

  function renderAutoSaveBadge() {
    const isSaving = autoSaveStatus === 'saving'
    return (
      <p
        className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] ${
          isSaving ? 'text-amber-700' : 'text-emerald-700'
        }`}
      >
        <span
          className={`inline-block h-2 w-2 rounded-full ${isSaving ? 'animate-pulse bg-amber-500' : 'bg-emerald-500'}`}
        />
        <span className="font-medium">{isSaving ? 'Saving…' : 'All changes saved'}</span>
      </p>
    )
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-700">
          ✓
        </div>
        <h2 className="text-xl font-semibold text-[var(--color-heading)]">Application created</h2>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          The application has been recorded for this demo session (stored in browser local storage).
        </p>
        {lastSubmissionId ? (
          <p className="mt-3 text-sm font-medium text-[var(--color-heading)]">Reference: {lastSubmissionId}</p>
        ) : null}
        <Button type="button" className="mt-6" onClick={handleDone}>
          Back to applications
        </Button>
      </div>
    )
  }

  return (
    <div ref={desktopScrollRef} className="min-h-0">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] pb-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to="/applications"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-primary)] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Applications
          </Link>
          <span className="text-[var(--color-text-muted)]">/</span>
          <h1 className="truncate text-lg font-semibold text-[var(--color-heading)]">New application</h1>
        </div>
        <div className="flex items-center gap-3">{renderAutoSaveBadge()}</div>
      </div>

      <p className="mb-4 text-sm text-[var(--color-text-muted)]">
        Complete each step as on the student portal. Progress is saved in this browser until you submit or clear site
        data.
      </p>

      <div className="[font-family:'Plus_Jakarta_Sans',system-ui,sans-serif]">
        <StepForm
          step={currentStep}
          stepNumber={currentStepIndex + 1}
          totalSteps={applicationSteps.length}
          steps={applicationSteps}
          currentIndex={currentStepIndex}
          onStepClick={setCurrentStepIndex}
          values={formValues}
          errors={validationErrors}
          formError={formError}
          draftNotice={draftNotice}
          onChange={updateField}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onSaveDraft={handleSaveDraft}
          canGoBack={currentStepIndex > 0}
          isLastStep={currentStepIndex === applicationSteps.length - 1}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  )
}
