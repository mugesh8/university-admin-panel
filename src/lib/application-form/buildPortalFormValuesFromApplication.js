/**
 * Builds a sparse portal-shaped `formValues` object from admin mock application records
 * so the full step layout (applicationSteps) can render read-only like the student portal.
 */
function inferProgramTypeRadio(program) {
  if (!program) return ''
  const p = program.toLowerCase()
  if (p.includes('pre-med') || p.includes('pre med')) return '5year'
  return '4year'
}

export function buildPortalFormValuesFromApplication(app) {
  const merged = { ...(app.formValues ?? {}) }

  const nameParts = (app.name || '').trim().split(/\s+/)
  const firstName = nameParts[0] ?? ''
  const surname = nameParts.slice(1).join(' ') ?? ''

  const intakeParts = (app.intake || '').trim().split(/\s+/)
  const semester = intakeParts[0] ?? ''
  const year = intakeParts[1] ?? ''

  if (merged.firstName === undefined || merged.firstName === '') merged.firstName = firstName
  if (merged.surname === undefined || merged.surname === '') merged.surname = surname
  if (!merged.email) merged.email = app.email
  if (!merged.phoneMobile) merged.phoneMobile = app.phone
  if (!merged.citizenship) merged.citizenship = app.citizenship
  if (!merged.country) merged.country = app.country
  if (!merged.dateOfBirth) merged.dateOfBirth = app.personal?.dob
  if (!merged.title) merged.title = app.personal?.title
  if (!merged.passportNumber) merged.passportNumber = app.personal?.passport
  if (!merged.permanentAddress) merged.permanentAddress = app.personal?.address

  if (!merged.programType) merged.programType = inferProgramTypeRadio(app.program)
  if (!merged.semester && semester) merged.semester = semester
  if (!merged.year && year) merged.year = year

  if (app.academic?.personalStatement && !merged.personalStatement) {
    merged.personalStatement = app.academic.personalStatement
  }

  if (
    app.academic &&
    (!merged.educationEntries || !Array.isArray(merged.educationEntries) || merged.educationEntries.length === 0)
  ) {
    merged.educationEntries = [
      {
        institution: app.academic.institution || '—',
        degree: app.academic.qualification || '',
        fieldOfStudy: '',
        country: '',
        address: '',
        gpa: '',
        startDate: '',
        endDate: '',
      },
    ]
  }

  const fileViewUrls = { ...(merged._fileViewUrls ?? {}) }
  for (const d of app.documents ?? []) {
    if (d.formField && d.fileUrl) {
      fileViewUrls[d.formField] = d.fileUrl
    }
  }
  if (Object.keys(fileViewUrls).length > 0) {
    merged._fileViewUrls = fileViewUrls
  }

  return merged
}

/** Draft records already carry `formValues`; merge with inferred portal fields for admin display. */
export function buildPortalFormValuesFromDraft(draft) {
  return buildPortalFormValuesFromApplication({
    name: draft.applicantName,
    email: draft.email,
    phone: draft.phone,
    citizenship: draft.citizenship,
    country: draft.country,
    program: draft.program,
    intake: draft.intake,
    personal: {
      title: draft.formValues?.title,
      dob: draft.formValues?.dateOfBirth,
      passport: draft.formValues?.passportNumber,
      address: draft.formValues?.permanentAddress,
    },
    academic: {
      qualification: draft.formValues?.educationEntries?.[0]?.degree,
      institution: draft.formValues?.educationEntries?.[0]?.institution,
      personalStatement: draft.formValues?.personalStatement,
    },
    formValues: draft.formValues,
  })
}
