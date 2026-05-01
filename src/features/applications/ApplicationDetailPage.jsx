import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { User, Mail, History } from 'lucide-react'
import { usePageTitleContext } from '../../context/PageTitleContext.jsx'
import { PageHeader } from '../../components/ui/PageHeader.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { Card } from '../../components/ui/Card.jsx'
import { Tabs, TabList, TabPanel, TabTrigger } from '../../components/ui/Tabs.jsx'
import { buildPortalFormValuesFromApplication } from '../../lib/application-form/buildPortalFormValuesFromApplication.js'
import { portalFormSteps, portalStepTabValue } from '../../lib/application-form/portalFormSteps.js'
import { fetchApplicationByApplicationId } from '../../lib/api/applicationsApi.js'
import { useAuth } from '../auth/useAuth.js'
import { ApplicationFormStepPanel } from './ApplicationFormStepPanel.jsx'
import { ApplicationActionsPanel } from './ApplicationActionsPanel.jsx'

function firstRow(value) {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

function statusLabel(currentStatus, completedSteps) {
  const raw = String(currentStatus || '').trim().toLowerCase()
  if (!raw) return 'Draft'
  if (raw === 'draft') return Number(completedSteps || 0) > 0 ? 'Partial Draft' : 'Draft'
  return raw
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function mapBackendToDetailApp(row) {
  const personal = firstRow(row?.personal_details) || row?.personal_details || {}
  const emergency = firstRow(row?.emergency_contacts) || {}
  const parentGuardian = firstRow(row?.parent_guardian_info) || row?.parent_guardian_info || {}
  const admission = firstRow(row?.admission_sought) || row?.admission_sought || {}
  const english = firstRow(row?.english_proficiency) || row?.english_proficiency || {}
  const standardizedTest = firstRow(row?.standardized_tests) || {}
  const disclosure = firstRow(row?.disclosure) || row?.disclosure || {}
  const docs = firstRow(row?.document) || row?.document || {}
  const financial = firstRow(row?.financial_support) || row?.financial_support || {}
  const experiences = Array.isArray(row?.experiences) ? row.experiences : []
  const educationEntries = (Array.isArray(row?.academic_institutions) ? row.academic_institutions : []).map((entry) => ({
    institution: entry?.institution_details?.institution || '',
    address: entry?.institution_details?.address || '',
    country: entry?.institution_details?.country || '',
    startDate: entry?.institution_details?.startDate || '',
    endDate: entry?.institution_details?.endDate || '',
    degree: entry?.institution_details?.degree || '',
    fieldOfStudy: entry?.institution_details?.fieldOfStudy || '',
    gpa: entry?.institution_details?.gpa || '',
  }))
  const fullName = `${personal?.first_name || ''} ${personal?.surname || ''}`.trim() || row?.application_id || 'Applicant'
  const formValues = {
    title: personal?.title || '',
    firstName: personal?.first_name || '',
    middleName: personal?.middle_name || '',
    surname: personal?.surname || '',
    preferredName: personal?.preferred_name || '',
    pronouns: personal?.pronouns || '',
    dateOfBirth: personal?.date_of_birth || '',
    gender: personal?.gender || '',
    nameChanged: personal?.name_change || '',
    ethnicity: personal?.ethnicity_race || '',
    citizenship: personal?.nationality_citizenship || '',
    countryOfResidence: personal?.country_of_residence || '',
    passportNumber: personal?.passport_number || '',
    passportExpiry: personal?.passport_expiry_date || '',
    visaStatus: personal?.visa_immigration_status || '',
    email: personal?.email || '',
    phoneMobile: personal?.mobile_phone || '',
    phoneHome: personal?.home_phone || '',
    permanentAddress: personal?.street_address || '',
    city: personal?.city || '',
    stateProvince: personal?.state_province || '',
    postalCode: personal?.postal_code || '',
    country: personal?.country || '',
    sameAsPermanent: personal?.mailing_same_as_permanent ?? true,
    mailingAddress: personal?.mailing_street_address || '',
    mailingCity: personal?.mailing_city || '',
    mailingStateProvince: personal?.mailing_state_province || '',
    mailingPostalCode: personal?.mailing_postal_code || '',
    mailingCountry: personal?.mailing_country || '',
    contactName: emergency?.full_name || '',
    relationship: emergency?.relationship || '',
    contactPhone: emergency?.phone || '',
    contactEmail: emergency?.email || '',
    contactCountry: emergency?.country || '',
    contactAddress: emergency?.home_address || '',
    fatherName: parentGuardian?.father_name || '',
    fatherOccupation: parentGuardian?.father_occupation || '',
    fatherEmail: parentGuardian?.father_email || '',
    fatherPhone: parentGuardian?.father_phone || '',
    motherName: parentGuardian?.mother_name || '',
    motherOccupation: parentGuardian?.mother_occupation || '',
    motherEmail: parentGuardian?.mother_email || '',
    motherPhone: parentGuardian?.mother_phone || '',
    englishProficiency: english?.proficiency_level || '',
    otherLanguagesSpoken: english?.other_languages_spoken || '',
    englishTestType: english?.test_type || '',
    englishTestScore: english?.test_score || '',
    hasStandardizedTest:
      typeof standardizedTest?.is_taken === 'boolean'
        ? standardizedTest.is_taken
          ? 'Yes'
          : 'No'
        : '',
    standardizedTestType: standardizedTest?.test_type || '',
    standardizedTestScore: standardizedTest?.score || '',
    programType: admission?.program_type || '',
    subProgram: admission?.sub_program || '',
    transferCredits: Array.isArray(admission?.transfer_credits) ? admission.transfer_credits : [],
    semester: admission?.preferred_semester || '',
    year: admission?.preferred_year ? String(admission.preferred_year) : '',
    hasBeenDisciplined:
      typeof disclosure?.discipline_action === 'boolean' ? (disclosure.discipline_action ? 'Yes' : 'No') : '',
    disciplineActionExplanation: disclosure?.discipline_explanation || '',
    hasBeenConvicted:
      typeof disclosure?.criminal_conviction === 'boolean' ? (disclosure.criminal_conviction ? 'Yes' : 'No') : '',
    convictionExplanation: disclosure?.conviction_explanation || '',
    hasDisability: typeof disclosure?.disability === 'boolean' ? (disclosure.disability ? 'Yes' : 'No') : '',
    disabilityDetails: disclosure?.disability_details || '',
    requiresAccommodation:
      typeof disclosure?.special_accomadations === 'boolean' ? (disclosure.special_accomadations ? 'Yes' : 'No') : '',
    accommodationDetails: disclosure?.accommodation_details || '',
    howHeard: disclosure?.referral_source || '',
    howHeardOther: disclosure?.referral_source_other || '',
    referralDescription: disclosure?.referral_description || '',
    whyMedicine: row?.why_medicine || '',
    whyMUCM: row?.why_mucm || '',
    personalStatement: row?.personal_statement || '',
    applicationAgreement: Boolean(row?.application_agreement_accepted),
    passport: docs?.passport || '',
    bankStatement: docs?.bank_statement || '',
    preMedTranscript: docs?.premedical_Bachelor_ug_HSC_Certificate || '',
    grade11Transcript: docs?.Secondary_11grade || '',
    cv: docs?.cv_resume || '',
    passportPhoto: docs?.passport_photo || '',
    otherProfessionalTranscripts: docs?.other_professional_transcripts || '',
    examResults: docs?.exam_results_marksheet || '',
    sponsorSignedFinancialForm: docs?.sponsor_signed_financial_form || '',
    studentName: financial?.student_full_name || '',
    studentId: financial?.student_id || '',
    programOfStudy: financial?.program_of_study || '',
    expectedStartDate: financial?.expected_start_date || '',
    paymentOption: financial?.paymentOption || financial?.select_payment_option || '',
    selfFundedSource: financial?.selfFundedSource || financial?.source_of_funds || '',
    sponsorFullName: financial?.sponsor_full_name || '',
    sponsorRelationship: financial?.sponsorRelationship || financial?.relationship_to_student || '',
    sponsorOccupation: financial?.occupation || '',
    sponsorEmployer: financial?.sponsorEmployer || financial?.employer_business_name || '',
    sponsorAddress: financial?.sponsorAddress || financial?.sponsor_street_address || '',
    sponsorCity: financial?.sponsor_city || '',
    sponsorState: financial?.sponsor_state || '',
    sponsorPostalCode: financial?.sponsorPostalCode || financial?.sponsor_postalcode || '',
    sponsorCountry: financial?.sponsor_country || '',
    sponsorPhone: financial?.sponsor_phone || '',
    sponsorEmail: financial?.sponsor_email || '',
    orgName: financial?.orgName || financial?.organization_name || '',
    orgContactPerson: financial?.org_contact_person || '',
    orgContactTitle: financial?.orgContactTitle || financial?.org_contact_person_title || '',
    orgAddress: financial?.orgAddress || financial?.org_street_address || '',
    orgCity: financial?.org_city || '',
    orgState: financial?.org_state || '',
    orgPostalCode: financial?.orgPostalCode || financial?.org_postal_code || '',
    orgCountry: financial?.org_country || '',
    orgPhone: financial?.org_phone || '',
    orgEmail: financial?.org_email || '',
    hasBankStatement: Boolean(financial?.hasBankStatement ?? financial?.bank_checkbox),
    hasIncomeProof: Boolean(financial?.hasIncomeProof ?? financial?.proof_of_income_checkbox),
    hasSponsorLetter: Boolean(financial?.hasSponsorLetter ?? financial?.sponsor_letter_checkbox),
    hasScholarshipLetter: Boolean(financial?.hasScholarshipLetter ?? financial?.scholarship_checkbox),
    hasLoanApproval: Boolean(financial?.hasLoanApproval ?? financial?.student_loan_checkbox),
    certifyAccurate: Boolean(financial?.certifyAccurate ?? financial?.student_certificate_check1),
    certifyFinancialResponsibility: Boolean(
      financial?.certifyFinancialResponsibility ?? financial?.student_certificate_check2,
    ),
    certifyDate: financial?.certifyDate || financial?.student_date_certification || '',
    studentSignatureMethod: financial?.studentSignatureMethod || financial?.student_signature_method || '',
    studentSignatureUpload: financial?.studentSignatureUpload || financial?.student_signature_upload || '',
    studentSignatureTyped: financial?.studentSignatureTyped || financial?.student_signature_typed || '',
    sponsorCertifySupport: Boolean(financial?.sponsorCertifySupport ?? financial?.sponsor_org_certificate),
    sponsorCertifyDate: financial?.sponsorCertifyDate || financial?.sponsor_certification_date || '',
    experiences: experiences.map((exp) => ({
      type: exp?.experience_type || '',
      role: exp?.role_position || '',
      organization: exp?.organization || '',
      hoursPerWeek: exp?.hours_per_week || '',
      startDate: exp?.start_date || '',
      endDate: exp?.end_date || '',
      description: exp?.description || '',
    })),
    educationEntries,
  }

  return {
    id: String(row?.application_id || row?.id || ''),
    status: statusLabel(row?.current_status, row?.completed_steps),
    pipelineStageId: null,
    name: fullName,
    program: admission?.program_type || '-',
    intake: admission?.preferred_semester
      ? `${admission.preferred_semester}${admission.preferred_year ? ` ${admission.preferred_year}` : ''}`
      : '-',
    daysInStage: 0,
    assignedOfficer: '-',
    leadSource: row?.lead_source || '-',
    communications: [],
    timeline: [],
    formValues,
  }
}

export function ApplicationDetailPage() {
  const { id } = useParams()
  const { token } = useAuth()
  const [app, setApp] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const applicationsPrefixRef = useRef(import.meta.env.VITE_APPLICATIONS_PREFIX || '/api/v1/applications')
  const { setPageTitleOverride } = usePageTitleContext()
  const portalFormValues = useMemo(() => (app ? buildPortalFormValuesFromApplication(app) : {}), [app])

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!id) {
        setLoading(false)
        setError('Application not found.')
        return
      }
      setLoading(true)
      setError('')
      try {
        const response = await fetchApplicationByApplicationId(id, {
          token,
          preferredPrefix: applicationsPrefixRef.current,
          full: true,
        })
        applicationsPrefixRef.current = response.preferredPrefix
        if (cancelled) return
        if (!response.application) {
          setApp(null)
          setError('Application not found.')
          return
        }
        setApp(mapBackendToDetailApp(response.application))
      } catch (err) {
        if (cancelled) return
        setApp(null)
        setError(err?.message || 'Failed to load application.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [id, token])

  useEffect(() => {
    if (!app) {
      setPageTitleOverride('Application not found')
    } else {
      setPageTitleOverride(app.name)
    }
    return () => setPageTitleOverride(null)
  }, [app, setPageTitleOverride])

  if (loading) {
    return <p className="text-sm text-[var(--color-text-muted)]">Loading application...</p>
  }

  if (!app) {
    return (
      <div>
        <p className="mb-4 text-sm text-[var(--color-text-muted)]">{error || 'Application not found.'}</p>
        <Link to="/applications" className="text-[var(--color-primary)] hover:underline">
          Back to applications
        </Link>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        breadcrumbs={
          <>
            <Link to="/applications" className="hover:text-[var(--color-primary)]">
              Applications
            </Link>
            <span className="mx-1">/</span>
            <span>{app.id}</span>
          </>
        }
        actions={
          <>
            <Badge>{app.status}</Badge>
          </>
        }
      />

      <Card className="mb-6">
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-bg)] text-[var(--color-text-muted)]">
            <User className="h-10 w-10" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-2">
              <h2 className="text-lg font-semibold text-[var(--color-heading)]">{app.name}</h2>
              <Badge tone="info">{app.id}</Badge>
            </div>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              {app.program} · {app.intake} · {app.daysInStage} days in current stage
            </p>
            <p className="text-sm text-[var(--color-text-muted)]">
              Officer: <span className="text-[var(--color-heading)]">{app.assignedOfficer}</span> · Lead source:{' '}
              {app.leadSource}
            </p>
          </div>
        </div>
      </Card>

      <Tabs defaultValue={portalStepTabValue(portalFormSteps[0].id)}>
        <TabList>
          {portalFormSteps.map((step) => (
            <TabTrigger key={step.id} value={portalStepTabValue(step.id)}>
              {step.title}
            </TabTrigger>
          ))}
          <TabTrigger value="comms">Communication log</TabTrigger>
          <TabTrigger value="timeline">Activity timeline</TabTrigger>
          <TabTrigger value="actions">Actions</TabTrigger>
        </TabList>

        {portalFormSteps.map((step) => (
          <TabPanel key={step.id} value={portalStepTabValue(step.id)}>
            <ApplicationFormStepPanel step={step} formValues={portalFormValues} />
          </TabPanel>
        ))}

        <TabPanel value="comms">
          {app.communications.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)]">No messages in demo.</p>
          ) : (
            <ul className="space-y-2">
              {app.communications.map((c) => (
                <li key={c.id} className="flex items-start gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] p-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-text-muted)]" />
                  <div>
                    <p className="font-medium text-[var(--color-heading)]">{c.subject}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {c.at} · Status: {c.status}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </TabPanel>

        <TabPanel value="timeline">
          {app.timeline.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)]">No events.</p>
          ) : (
            <ul className="space-y-2">
              {app.timeline.map((t, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <History className="h-4 w-4 shrink-0 text-[var(--color-text-muted)]" />
                  <span>
                    <span className="font-medium text-[var(--color-heading)]">{t.actor}</span> — {t.action}{' '}
                    <span className="text-[var(--color-text-muted)]">({t.at})</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </TabPanel>

        <TabPanel value="actions">
          <ApplicationActionsPanel application={app} />
        </TabPanel>
      </Tabs>
    </div>
  )
}
