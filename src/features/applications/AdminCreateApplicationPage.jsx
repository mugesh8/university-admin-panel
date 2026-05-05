import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { usePageTitleContext } from '../../context/PageTitleContext.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { applicationSteps } from '../../lib/application-form/applicationSteps.js'
import { countries } from '../../lib/application-form/countries.js'
import { getSelectValues, isFieldVisible } from '../../lib/application-form/formVisibility.js'
import {
  createApplication,
  fetchApplicationByApplicationId as fetchApplicationByApplicationIdApi,
  updateApplication,
} from '../../lib/api/applicationsApi.js'
import { usePersistentState } from '../../hooks/usePersistentState.js'
import { useAuth } from '../auth/useAuth.js'
import StepForm from './create-application/StepForm.jsx'

const ADMIN_FORM_STORAGE_KEY = 'mucm-admin-application-form'
const ADMIN_STEP_STORAGE_KEY = 'mucm-admin-current-step'
const ADMIN_SUBMISSIONS_KEY = 'mucm-admin-submitted-applications'
const ADMIN_ACTIVE_APPLICATION_KEY = 'mucm-admin-active-application'
const ADMIN_STORAGE_RESET_MARKER_KEY = 'mucm-admin-storage-reset-v1'

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
  const { user, token } = useAuth()
  const { setPageTitleOverride } = usePageTitleContext()
  const desktopScrollRef = useRef(null)
  const autoSaveTimerRef = useRef(null)
  const hasInitializedAutoSaveRef = useRef(false)
  const applicationsPrefixRef = useRef(import.meta.env.VITE_APPLICATIONS_PREFIX || '/api/v1/applications')

  const [currentStepIndex, setCurrentStepIndex] = usePersistentState(ADMIN_STEP_STORAGE_KEY, 0)
  const [formValues, setFormValues] = usePersistentState(ADMIN_FORM_STORAGE_KEY, initialForm)
  const [validationErrors, setValidationErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [draftNotice, setDraftNotice] = useState('')
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved')
  const [submitted, setSubmitted] = useState(false)
  const [lastSubmissionId, setLastSubmissionId] = useState('')
  const [activeApplication, setActiveApplication] = usePersistentState(ADMIN_ACTIVE_APPLICATION_KEY, {
    id: '',
    applicationId: '',
  })

  useEffect(() => {
    try {
      const hasResetMarker = window.localStorage.getItem(ADMIN_STORAGE_RESET_MARKER_KEY)
      if (hasResetMarker) return
      window.localStorage.removeItem(ADMIN_FORM_STORAGE_KEY)
      window.localStorage.removeItem(ADMIN_STEP_STORAGE_KEY)
      window.localStorage.removeItem(ADMIN_SUBMISSIONS_KEY)
      window.localStorage.removeItem(ADMIN_ACTIVE_APPLICATION_KEY)
      window.localStorage.setItem(ADMIN_STORAGE_RESET_MARKER_KEY, 'true')
      setCurrentStepIndex(0)
      setFormValues(initialForm)
      setActiveApplication({ id: '', applicationId: '' })
    } catch {
      // ignore storage reset issues
    }
  }, [setActiveApplication, setCurrentStepIndex, setFormValues])

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

  function getAuthHeader() {
    if (token && String(token).trim()) {
      return { Authorization: `Bearer ${token}` }
    }
    return {}
  }

  function buildApplicationsPaths() {
    const preferredPrefix = applicationsPrefixRef.current || '/api/v1/applications'
    const candidates = [preferredPrefix, '/api/v1/applications', '/api/applications', '/applications', '/application']
    const uniquePrefixes = [...new Set(candidates)]
    return uniquePrefixes.map((prefix) => prefix.replace(/\/+$/, '') || '/applications')
  }

  async function requestApplicationApi(method, path, payload) {
    let lastError = null
    const apiBase = String(import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
    if (!apiBase) {
      throw new Error('Set VITE_API_BASE_URL to your MUCM API (e.g. http://localhost:3000).')
    }

    for (const basePath of buildApplicationsPaths()) {
      const endpoint = `${apiBase}${basePath}${path}`
      let response
      let data = {}
      try {
        response = await fetch(endpoint, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
          body: payload === undefined ? undefined : JSON.stringify(payload),
        })
        data = await response.json().catch(() => ({}))
      } catch {
        throw new Error('API server is unreachable. Please verify backend server and API base URL.')
      }

      if (response.ok && data.success !== false) {
        applicationsPrefixRef.current = basePath
        return data
      }
      if (response.status === 404) {
        lastError = new Error(data.message || 'Application endpoint not found.')
        continue
      }
      throw new Error(data.message || `Failed API request for ${path}`)
    }
    throw lastError || new Error('Application endpoint not found.')
  }

  function normalizeText(value) {
    if (value === undefined || value === null) return null
    if (typeof value === 'string') {
      const trimmed = value.trim()
      return trimmed === '' ? null : trimmed
    }
    return value
  }

  function yesNoToBoolean(value) {
    if (value === 'Yes') return true
    if (value === 'No') return false
    return null
  }

  function monthToDateOnly(value) {
    const normalized = normalizeText(value)
    if (!normalized) return null
    return /^\d{4}-\d{2}$/.test(String(normalized)) ? `${normalized}-01` : normalized
  }

  function hasAnyValue(obj) {
    return Object.values(obj).some((value) => {
      if (value === undefined || value === null) return false
      if (typeof value === 'string') return value.trim() !== ''
      if (Array.isArray(value)) return value.length > 0
      if (typeof value === 'object') return Object.keys(value).length > 0
      return true
    })
  }

  function valuesEquivalent(a, b) {
    if (a === undefined || a === null || a === '') return b === undefined || b === null || b === ''
    if (b === undefined || b === null || b === '') return false
    if (typeof a === 'boolean' || typeof b === 'boolean') return Boolean(a) === Boolean(b)
    return String(a).trim() === String(b).trim()
  }

  function rowMatchesPayload(payload, row) {
    if (!row || typeof row !== 'object') return false
    return Object.entries(payload).every(([key, value]) => valuesEquivalent(value, row[key]))
  }

  async function fetchApplicationFullById(applicationRowId) {
    const data = await requestApplicationApi('GET', `/${applicationRowId}?full=true`)
    return data.data || {}
  }

  async function upsertSingletonSection(applicationRowId, pathSegment, payload, existingRow) {
    const rowId = existingRow?.id
    if (rowId) {
      await requestApplicationApi('PUT', `/${applicationRowId}/${pathSegment}/${rowId}`, payload)
      return
    }
    if (!hasAnyValue(payload)) return
    await requestApplicationApi('POST', `/${applicationRowId}/${pathSegment}`, payload)
  }

  async function upsertListSection(applicationRowId, pathSegment, items, existingRows = [], options = {}) {
    const createOnly = Boolean(options.createOnly)
    const list = Array.isArray(items) ? items : []
    const existing = Array.isArray(existingRows) ? existingRows : []

    for (let index = 0; index < list.length; index += 1) {
      const payload = list[index]
      const existingRow = existing[index]
      if (createOnly) {
        if (!hasAnyValue(payload)) continue
        if (rowMatchesPayload(payload, existingRow)) continue
        await requestApplicationApi('POST', `/${applicationRowId}/${pathSegment}`, payload)
        continue
      }
      if (existingRow?.id) {
        await requestApplicationApi('PUT', `/${applicationRowId}/${pathSegment}/${existingRow.id}`, payload)
      } else if (hasAnyValue(payload)) {
        await requestApplicationApi('POST', `/${applicationRowId}/${pathSegment}`, payload)
      }
    }

    if (createOnly) return
    for (let index = list.length; index < existing.length; index += 1) {
      const rowToDelete = existing[index]
      if (rowToDelete?.id) {
        await requestApplicationApi('DELETE', `/${applicationRowId}/${pathSegment}/${rowToDelete.id}`)
      }
    }
  }

  function buildSectionPayloads() {
    const emergencyPayload = {
      full_name: normalizeText(formValues.contactName),
      relationship: normalizeText(formValues.relationship),
      phone: normalizeText(formValues.contactPhone),
      email: normalizeText(formValues.contactEmail),
      country: normalizeText(formValues.contactCountry),
      home_address: normalizeText(formValues.contactAddress),
    }

    const academicInstitutionRows = (Array.isArray(formValues.educationEntries) ? formValues.educationEntries : [])
      .filter((row) => hasAnyValue(row || {}))
      .map((row) => ({
        institution_details: {
          institution: normalizeText(row?.institution),
          address: normalizeText(row?.address),
          country: normalizeText(row?.country),
          startDate: normalizeText(row?.startDate),
          endDate: normalizeText(row?.endDate),
          degree: normalizeText(row?.degree),
          fieldOfStudy: normalizeText(row?.fieldOfStudy),
          gpa: normalizeText(row?.gpa),
        },
      }))

    const essayWhyMedicine = normalizeText(formValues.whyMedicine)
    const essayWhyMUCM = normalizeText(formValues.whyMUCM)
    const essayPersonalStatement = normalizeText(formValues.personalStatement)

    let experienceRows = (Array.isArray(formValues.experiences) ? formValues.experiences : [])
      .filter((row) => hasAnyValue(row || {}))
      .map((row) => ({
        experience_type: normalizeText(row?.type),
        role_position: normalizeText(row?.role),
        organization: normalizeText(row?.organization),
        hours_per_week: normalizeText(row?.hoursPerWeek),
        start_date: monthToDateOnly(row?.startDate),
        end_date: monthToDateOnly(row?.endDate),
        is_current: !normalizeText(row?.endDate),
        description: normalizeText(row?.description),
        why_medicine: essayWhyMedicine,
        why_mucm: essayWhyMUCM,
        per_statement_essay: essayPersonalStatement,
      }))

    if (experienceRows.length === 0 && (essayWhyMedicine || essayWhyMUCM || essayPersonalStatement)) {
      experienceRows = [
        {
          why_medicine: essayWhyMedicine,
          why_mucm: essayWhyMUCM,
          per_statement_essay: essayPersonalStatement,
        },
      ]
    }

    return {
      personalDetails: {
        title: normalizeText(formValues.title),
        first_name: normalizeText(formValues.firstName),
        middle_name: normalizeText(formValues.middleName),
        surname: normalizeText(formValues.surname),
        preferred_name: normalizeText(formValues.preferredName),
        pronouns: normalizeText(formValues.pronouns),
        date_of_birth: normalizeText(formValues.dateOfBirth),
        gender: normalizeText(formValues.gender),
        name_change: normalizeText(formValues.nameChanged),
        ethnicity_race: normalizeText(formValues.ethnicity),
        nationality_citizenship: normalizeText(formValues.citizenship),
        country_of_residence: normalizeText(formValues.countryOfResidence),
        passport_number: normalizeText(formValues.passportNumber),
        passport_expiry_date: normalizeText(formValues.passportExpiry),
        visa_immigration_status: normalizeText(formValues.visaStatus),
        email: normalizeText(formValues.email),
        mobile_phone: normalizeText(formValues.phoneMobile),
        home_phone: normalizeText(formValues.phoneHome),
        street_address: normalizeText(formValues.permanentAddress),
        city: normalizeText(formValues.city),
        state_province: normalizeText(formValues.stateProvince),
        postal_code: normalizeText(formValues.postalCode),
        country: normalizeText(formValues.country),
        mailing_same_as_permanent: Boolean(formValues.sameAsPermanent),
        mailing_street_address: formValues.sameAsPermanent ? null : normalizeText(formValues.mailingAddress),
        mailing_city: formValues.sameAsPermanent ? null : normalizeText(formValues.mailingCity),
        mailing_state_province: formValues.sameAsPermanent
          ? null
          : normalizeText(formValues.mailingStateProvince),
        mailing_postal_code: formValues.sameAsPermanent ? null : normalizeText(formValues.mailingPostalCode),
        mailing_country: formValues.sameAsPermanent ? null : normalizeText(formValues.mailingCountry),
      },
      emergencyContacts: hasAnyValue(emergencyPayload) ? [emergencyPayload] : [],
      parentGuardian: {
        father_name: normalizeText(formValues.fatherName),
        father_occupation: normalizeText(formValues.fatherOccupation),
        father_email: normalizeText(formValues.fatherEmail),
        father_phone: normalizeText(formValues.fatherPhone),
        mother_name: normalizeText(formValues.motherName),
        mother_occupation: normalizeText(formValues.motherOccupation),
        mother_email: normalizeText(formValues.motherEmail),
        mother_phone: normalizeText(formValues.motherPhone),
      },
      academicInstitutions: academicInstitutionRows,
      englishProficiency: {
        proficiency_level: normalizeText(formValues.englishProficiency),
        other_languages_spoken: normalizeText(formValues.otherLanguagesSpoken),
        test_type: normalizeText(formValues.englishTestType),
        test_score: normalizeText(formValues.englishTestScore),
      },
      standardizedTests: [
        {
          is_taken: yesNoToBoolean(formValues.hasStandardizedTest),
          test_type: normalizeText(formValues.standardizedTestType),
          score: normalizeText(formValues.standardizedTestScore),
        },
      ],
      admissionSought: {
        program_type: normalizeText(formValues.programType),
        sub_program: normalizeText(formValues.subProgram),
        transfer_credits: (Array.isArray(formValues.transferCredits) ? formValues.transferCredits : []).filter((row) =>
          hasAnyValue(row || {}),
        ),
        preferred_semester: normalizeText(formValues.semester),
        preferred_year: formValues.year ? Number(formValues.year) : null,
      },
      disclosures: {
        discipline_action: yesNoToBoolean(formValues.hasBeenDisciplined),
        discipline_explanation: normalizeText(formValues.disciplineActionExplanation),
        criminal_conviction: yesNoToBoolean(formValues.hasBeenConvicted),
        conviction_explanation: normalizeText(formValues.convictionExplanation),
        disability: yesNoToBoolean(formValues.hasDisability),
        disability_details: normalizeText(formValues.disabilityDetails),
        special_accomadations: yesNoToBoolean(formValues.requiresAccommodation),
        accommodation_details: normalizeText(formValues.accommodationDetails),
        referral_source: normalizeText(formValues.howHeard),
        referral_source_other: normalizeText(formValues.howHeardOther),
        referral_description: normalizeText(formValues.referralDescription),
      },
      experiences: experienceRows,
      documents: {
        upload_progress: true,
        passport: normalizeText(formValues.passport),
        bank_statement: normalizeText(formValues.bankStatement),
        premedical_Bachelor_ug_HSC_Certificate: normalizeText(formValues.preMedTranscript),
        Secondary_11grade: normalizeText(formValues.grade11Transcript),
        cv_resume: normalizeText(formValues.cv),
        passport_photo: normalizeText(formValues.passportPhoto),
        other_professional_transcripts: normalizeText(formValues.otherProfessionalTranscripts),
        exam_results_marksheet: normalizeText(formValues.examResults),
        sponsor_signed_financial_form: normalizeText(formValues.sponsorSignedFinancialForm),
      },
      financialSupport: {
        student_full_name: normalizeText(formValues.studentName),
        student_id: normalizeText(formValues.studentId),
        program_of_study: normalizeText(formValues.programOfStudy),
        expected_start_date: normalizeText(formValues.expectedStartDate),
        paymentOption: normalizeText(formValues.paymentOption),
        selfFundedSource: normalizeText(formValues.selfFundedSource),
        sponsor_full_name: normalizeText(formValues.sponsorFullName),
        sponsorRelationship: normalizeText(formValues.sponsorRelationship),
        occupation: normalizeText(formValues.sponsorOccupation),
        sponsorEmployer: normalizeText(formValues.sponsorEmployer),
        sponsorAddress: normalizeText(formValues.sponsorAddress),
        sponsor_city: normalizeText(formValues.sponsorCity),
        sponsor_state: normalizeText(formValues.sponsorState),
        sponsorPostalCode: normalizeText(formValues.sponsorPostalCode),
        sponsor_country: normalizeText(formValues.sponsorCountry),
        sponsor_phone: normalizeText(formValues.sponsorPhone),
        sponsor_email: normalizeText(formValues.sponsorEmail),
        orgName: normalizeText(formValues.orgName),
        org_contact_person: normalizeText(formValues.orgContactPerson),
        orgContactTitle: normalizeText(formValues.orgContactTitle),
        orgAddress: normalizeText(formValues.orgAddress),
        org_city: normalizeText(formValues.orgCity),
        org_state: normalizeText(formValues.orgState),
        orgPostalCode: normalizeText(formValues.orgPostalCode),
        org_country: normalizeText(formValues.orgCountry),
        org_phone: normalizeText(formValues.orgPhone),
        org_email: normalizeText(formValues.orgEmail),
        hasBankStatement: Boolean(formValues.hasBankStatement),
        hasIncomeProof: Boolean(formValues.hasIncomeProof),
        hasSponsorLetter: Boolean(formValues.hasSponsorLetter),
        hasScholarshipLetter: Boolean(formValues.hasScholarshipLetter),
        hasLoanApproval: Boolean(formValues.hasLoanApproval),
        certifyAccurate: Boolean(formValues.certifyAccurate),
        certifyFinancialResponsibility: Boolean(formValues.certifyFinancialResponsibility),
        certifyDate: normalizeText(formValues.certifyDate),
        sponsorCertifySupport: Boolean(formValues.sponsorCertifySupport),
        sponsorCertifyDate: normalizeText(formValues.sponsorCertifyDate),
        studentSignatureMethod: normalizeText(formValues.studentSignatureMethod),
        studentSignatureTyped: normalizeText(formValues.studentSignatureTyped),
        studentSignatureUpload: normalizeText(formValues.studentSignatureUpload),
        sponsorSignedFinancialForm: normalizeText(formValues.sponsorSignedFinancialForm),
      },
    }
  }

  async function syncApplicationSections(applicationRowId) {
    if (!applicationRowId) throw new Error('Application ID is missing while syncing sections.')
    const fullApplication = await fetchApplicationFullById(applicationRowId)
    const payloads = buildSectionPayloads()

    await upsertSingletonSection(applicationRowId, 'personal-details', payloads.personalDetails, fullApplication.personal_details)
    await upsertListSection(applicationRowId, 'emergency-contacts', payloads.emergencyContacts, fullApplication.emergency_contacts)
    await upsertSingletonSection(applicationRowId, 'parent-guardian', payloads.parentGuardian, fullApplication.parent_guardian_info)
    await upsertListSection(
      applicationRowId,
      'academic-institutions',
      payloads.academicInstitutions,
      fullApplication.academic_institutions,
    )
    await upsertSingletonSection(
      applicationRowId,
      'english-proficiency',
      payloads.englishProficiency,
      fullApplication.english_proficiency,
    )
    await upsertListSection(applicationRowId, 'standardized-tests', payloads.standardizedTests, fullApplication.standardized_tests)
    await upsertSingletonSection(applicationRowId, 'admission-sought', payloads.admissionSought, fullApplication.admission_sought)
    await upsertSingletonSection(applicationRowId, 'disclosures', payloads.disclosures, fullApplication.disclosure)
    await upsertListSection(applicationRowId, 'experiences', payloads.experiences, fullApplication.experiences)
    await upsertSingletonSection(applicationRowId, 'document', payloads.documents, fullApplication.document)
    await upsertSingletonSection(applicationRowId, 'financial-support', payloads.financialSupport, fullApplication.financial_support)
  }

  function buildApplicationPayload({ stepIndex, isComplete }) {
    return {
      application_id: activeApplication.applicationId || `APP-${Date.now()}`,
      current_status: isComplete ? 'submitted' : 'draft',
      completed_steps: Math.max(1, stepIndex + 1),
      is_complete: isComplete,
      submitted_at: isComplete ? new Date().toISOString() : undefined,
      why_medicine: formValues.whyMedicine || undefined,
      why_mucm: formValues.whyMUCM || undefined,
      personal_statement: formValues.personalStatement || undefined,
      application_agreement_accepted: Boolean(formValues.applicationAgreement),
      application_agreement_at: formValues.applicationAgreement ? new Date().toISOString() : undefined,
    }
  }

  async function persistApplication({ stepIndex, isComplete }) {
    const payload = buildApplicationPayload({ stepIndex, isComplete })
    let existingId = activeApplication.id
    if (!existingId && activeApplication.applicationId) {
      const existing = await fetchApplicationByApplicationIdApi(activeApplication.applicationId, {
        token,
        preferredPrefix: applicationsPrefixRef.current,
      })
      applicationsPrefixRef.current = existing.preferredPrefix
      existingId = existing.application?.id || ''
      if (existingId) {
        setActiveApplication((previous) => ({ ...previous, id: String(existingId) }))
      }
    }

    if (!existingId) {
      const created = await createApplication(payload, {
        token,
        preferredPrefix: applicationsPrefixRef.current,
      })
      applicationsPrefixRef.current = created.preferredPrefix
      const data = created.data
      let createdId = data.id || data.data?.id || data.application?.id || ''
      const createdApplicationId = data.application_id || data.data?.application_id || payload.application_id
      if (!createdId && createdApplicationId) {
        const fetched = await fetchApplicationByApplicationIdApi(createdApplicationId, {
          token,
          preferredPrefix: applicationsPrefixRef.current,
        })
        applicationsPrefixRef.current = fetched.preferredPrefix
        createdId = fetched.application?.id || ''
      }
      if (!createdId) {
        throw new Error('Application created but could not resolve application row ID.')
      }
      setActiveApplication({
        id: String(createdId ?? ''),
        applicationId: String(createdApplicationId ?? payload.application_id),
      })
      return {
        id: String(createdId ?? ''),
        applicationId: String(createdApplicationId ?? payload.application_id),
      }
    }

    const updated = await updateApplication(existingId, payload, {
      token,
      preferredPrefix: applicationsPrefixRef.current,
    })
    applicationsPrefixRef.current = updated.preferredPrefix
    return { ...activeApplication, id: String(existingId) }
  }

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
      const phoneRaw = String(stringValue).trim()
      if (!field.required && /^\+\d{1,4}$/.test(phoneRaw)) {
        return ''
      }
      const digits = phoneRaw.replace(/\D/g, '')
      if (digits.length < 7) {
        return 'Please enter a valid phone number.'
      }
    }

    if ((field.type === 'select' || field.type === 'radioGroup') && field.options?.length > 0) {
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

  function validateRepeatableNested(field, rows, valuesToCheck) {
    const nested = {}
    const list =
      Array.isArray(rows) && rows.length > 0
        ? rows
        : [typeof field.defaultItem === 'object' && field.defaultItem !== null ? { ...field.defaultItem } : {}]
    list.forEach((row, rowIndex) => {
      for (const sub of field.itemFields ?? []) {
        if (!isFieldVisible(sub, valuesToCheck)) continue
        const message = validateField(sub, row?.[sub.name])
        if (message) {
          nested[`${field.name}__${rowIndex}__${sub.name}`] = message
        }
      }
    })
    return nested
  }

  function validateStep(step, valuesToCheck) {
    const stepErrors = {}
    step.fields.forEach((field) => {
      if (!isFieldVisible(field, valuesToCheck)) {
        return
      }
      if (field.type === 'repeatable') {
        Object.assign(stepErrors, validateRepeatableNested(field, valuesToCheck[field.name], valuesToCheck))
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
      if (name === 'studentSignatureMethod') {
        if (value === 'upload') {
          next.studentSignatureTyped = ''
        } else if (value === 'type') {
          next.studentSignatureUpload = ''
        }
      }
      if (name === 'reviewSignatureMethod') {
        if (value === 'upload') {
          next.reviewSignatureTyped = ''
        } else if (value === 'type') {
          next.reviewSignatureUpload = ''
        }
      }
      return next
    })

    setValidationErrors((previous) => {
      const nextErrors = { ...previous }
      if (name === 'hasBeenDisciplined') delete nextErrors.disciplineActionExplanation
      if (name === 'hasBeenConvicted') delete nextErrors.convictionExplanation
      if (name === 'hasDisability') delete nextErrors.disabilityDetails
      if (name === 'requiresAccommodation') delete nextErrors.accommodationDetails
      if (name === 'studentSignatureMethod') {
        delete nextErrors.studentSignatureUpload
        delete nextErrors.studentSignatureTyped
      }
      if (name === 'reviewSignatureMethod') {
        delete nextErrors.reviewSignatureUpload
        delete nextErrors.reviewSignatureTyped
      }

      const activeField =
        applicationSteps.flatMap((step) => step.fields).find((field) => field.name === name) ?? null

      const mergedValues = { ...formValues, [name]: value }
      if (activeField?.type === 'repeatable') {
        for (const k of Object.keys(nextErrors)) {
          if (k.startsWith(`${name}__`)) {
            delete nextErrors[k]
          }
        }
        Object.assign(nextErrors, validateRepeatableNested(activeField, value, mergedValues))
        return nextErrors
      }

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

  async function handleNext() {
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
    try {
      const meta = await persistApplication({ stepIndex: nextStepIndex, isComplete: false })
      await syncApplicationSections(meta.id)
      setCurrentStepIndex(nextStepIndex)
      setDraftNotice('Progress saved to server. Moving to next step.')
    } catch (error) {
      setFormError(error.message || 'Unable to save progress to server.')
    }
  }

  function handlePrevious() {
    setCurrentStepIndex((previous) => Math.max(previous - 1, 0))
  }

  function handleStepClick(targetIndex) {
    const safeTarget = Math.max(0, Math.min(targetIndex, applicationSteps.length - 1))
    if (safeTarget <= currentStepIndex) {
      setFormError('')
      setCurrentStepIndex(safeTarget)
      return
    }

    let firstInvalidStep = -1
    const accumulatedErrors = {}
    for (let stepIndex = 0; stepIndex < safeTarget; stepIndex += 1) {
      const stepErrors = validateStep(applicationSteps[stepIndex], formValues)
      if (Object.keys(stepErrors).length > 0) {
        if (firstInvalidStep === -1) firstInvalidStep = stepIndex
        Object.assign(accumulatedErrors, stepErrors)
      }
    }

    if (firstInvalidStep >= 0) {
      setValidationErrors((previous) => ({ ...previous, ...accumulatedErrors }))
      setFormError('Please complete required fields in earlier steps before moving ahead.')
      setCurrentStepIndex(firstInvalidStep)
      return
    }

    setValidationErrors({})
    setFormError('')
    setCurrentStepIndex(safeTarget)
  }

  async function handleSaveDraft() {
    try {
      window.localStorage.setItem(ADMIN_FORM_STORAGE_KEY, JSON.stringify(formValues))
      window.localStorage.setItem(ADMIN_STEP_STORAGE_KEY, JSON.stringify(currentStepIndex))
    } catch {
      // ignore
    }
    try {
      const meta = await persistApplication({ stepIndex: currentStepIndex, isComplete: false })
      await syncApplicationSections(meta.id)
      setFormError('')
      setDraftNotice('Draft saved to server successfully.')
    } catch (error) {
      setFormError(error.message || 'Unable to save draft to server.')
    }
  }

  async function handleSubmit() {
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
    let persistedApplicationMeta = activeApplication
    try {
      persistedApplicationMeta = await persistApplication({
        stepIndex: applicationSteps.length - 1,
        isComplete: true,
      })
      await syncApplicationSections(persistedApplicationMeta.id)
    } catch (error) {
      setFormError(error.message || 'Unable to submit application to server.')
      return
    }

    const documentFields =
      applicationSteps.find((step) => step.id === 'documents')?.fields.filter((f) => f.type === 'file') ?? []
    const applicationId = persistedApplicationMeta.applicationId || `APP-${Date.now()}`
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
    setActiveApplication({ id: '', applicationId: '' })
    try {
      window.localStorage.removeItem(ADMIN_FORM_STORAGE_KEY)
      window.localStorage.removeItem(ADMIN_STEP_STORAGE_KEY)
      window.localStorage.removeItem(ADMIN_ACTIVE_APPLICATION_KEY)
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
          onStepClick={handleStepClick}
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
