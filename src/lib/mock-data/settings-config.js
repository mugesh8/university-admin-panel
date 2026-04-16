/** Demo configuration rows aligned with BRD §4.8.6 / schema §6.1 */

export const programsConfig = [
    {
      id: 'p1',
      name: '4-Year MD Program',
      code: 'MD-4Y',
      durationYears: 4,
      level: 'MD',
      capacity: 120,
      active: true,
    },
    {
      id: 'p2',
      name: '5-Year MD Program',
      code: 'MD-5Y',
      durationYears: 5,
      level: 'MD',
      capacity: 80,
      active: true,
    },
    {
      id: 'p3',
      name: 'Pre-Medical Track',
      code: 'PRE-MD',
      durationYears: 1,
      level: 'Pre-MD',
      capacity: 40,
      active: false,
    },
  ]
  
  export const intakesConfig = [
    {
      id: 'i1',
      name: 'Fall 2026',
      startDate: '2026-09-01',
      applicationDeadline: '2026-08-15',
      capacity: 200,
      status: 'Open',
    },
    {
      id: 'i2',
      name: 'Spring 2027',
      startDate: '2027-01-15',
      applicationDeadline: '2026-12-01',
      capacity: 150,
      status: 'Planned',
    },
    {
      id: 'i3',
      name: 'Summer 2026',
      startDate: '2026-05-01',
      applicationDeadline: '2026-04-01',
      capacity: 60,
      status: 'Closed',
    },
  ]
  
  export const feeStructureConfig = [
    {
      id: 'f1',
      programCode: 'MD-4Y',
      intakeName: 'Fall 2026',
      feeType: 'Application Fee',
      amount: '150.00',
      currency: 'USD',
      refundPolicy: 'Non-refundable',
    },
    {
      id: 'f2',
      programCode: 'MD-4Y',
      intakeName: 'Fall 2026',
      feeType: 'Registration Fee',
      amount: '2,500.00',
      currency: 'USD',
      refundPolicy: 'Non-refundable after acceptance',
    },
    {
      id: 'f3',
      programCode: 'MD-4Y',
      intakeName: 'Fall 2026',
      feeType: 'Seat Reservation Fee',
      amount: '1,000.00',
      currency: 'USD',
      refundPolicy: 'Refundable before 2-week cutoff',
    },
    {
      id: 'f4',
      programCode: 'MD-5Y',
      intakeName: 'Fall 2026',
      feeType: 'Application Fee',
      amount: '150.00',
      currency: 'USD',
      refundPolicy: 'Non-refundable',
    },
  ]
  
  /** Step 8 BRD + financial docs */
  export const documentRequirementsConfig = [
    {
      id: 'd1',
      name: 'Passport (bio page)',
      required: true,
      acceptedTypes: 'PDF, JPG, PNG',
      maxSizeMb: 10,
    },
    {
      id: 'd2',
      name: 'Bank statement (min. 3 months)',
      required: true,
      acceptedTypes: 'PDF',
      maxSizeMb: 10,
    },
    {
      id: 'd3',
      name: 'Pre-medical / Bachelor / 12th Grade transcript',
      required: true,
      acceptedTypes: 'PDF',
      maxSizeMb: 10,
    },
    {
      id: 'd4',
      name: '11th Grade transcript / marksheet',
      required: true,
      acceptedTypes: 'PDF',
      maxSizeMb: 10,
    },
    {
      id: 'd5',
      name: 'CV / Resume',
      required: true,
      acceptedTypes: 'PDF, DOC',
      maxSizeMb: 5,
    },
    {
      id: 'd6',
      name: 'English proficiency test report',
      required: false,
      acceptedTypes: 'PDF',
      maxSizeMb: 5,
    },
    {
      id: 'd7',
      name: 'Letter of recommendation',
      required: false,
      acceptedTypes: 'PDF',
      maxSizeMb: 5,
    },
  ]
  
  export const pipelineStagesConfig = [
    { id: 's1', order: 1, stageKey: 'draft', displayName: 'Draft', slaDays: null, notificationTemplate: '—', active: true },
    { id: 's2', order: 2, stageKey: 'submitted', displayName: 'Submitted', slaDays: null, notificationTemplate: 'Application received', active: true },
    { id: 's3', order: 3, stageKey: 'validation', displayName: 'Validation', slaDays: 5, notificationTemplate: '—', active: true },
    { id: 's4', order: 4, stageKey: 'incomplete', displayName: 'Incomplete', slaDays: 7, notificationTemplate: 'Missing documents', active: true },
    { id: 's5', order: 5, stageKey: 'application_fee', displayName: 'Application Fee', slaDays: 3, notificationTemplate: 'Fee instructions', active: true },
    { id: 's6', order: 6, stageKey: 'under_review', displayName: 'Under Review', slaDays: 14, notificationTemplate: 'Status update', active: true },
    { id: 's7', order: 7, stageKey: 'interview_scheduled', displayName: 'Interview Scheduled', slaDays: null, notificationTemplate: 'Interview invite', active: true },
    { id: 's8', order: 8, stageKey: 'decision', displayName: 'Decision', slaDays: null, notificationTemplate: 'Offer / waitlist / reject', active: true },
    { id: 's9', order: 9, stageKey: 'enrolled', displayName: 'Enrolled', slaDays: null, notificationTemplate: 'Welcome', active: true },
  ]
  
  export const dropdownCategoriesConfig = [
    {
      id: 'dd1',
      category: 'Title',
      description: 'Applicant title (Step 1 — Personal Details)',
      options: ['Mr', 'Mrs', 'Ms', 'Dr', 'Prof', 'Other'],
    },
    {
      id: 'dd2',
      category: 'Relationship to applicant',
      description: 'Emergency contact & guardians (Step 2)',
      options: ['Parent', 'Spouse', 'Sibling', 'Guardian', 'Friend', 'Other'],
    },
    {
      id: 'dd3',
      category: 'Immigration / visa status',
      description: 'Personal details & disclosures',
      options: ['Citizen', 'Permanent Resident', 'Student Visa', 'Work Visa', 'Other'],
    },
    {
      id: 'dd4',
      category: 'English proficiency test',
      description: 'Educational background',
      options: ['TOEFL', 'IELTS', 'PTE', 'Duolingo', 'Native Speaker', 'N/A'],
    },
    {
      id: 'dd5',
      category: 'How did you hear about MUCM?',
      description: 'Step 5 — Motivation',
      options: [
        'Website',
        'Search Engine',
        'Social Media',
        'Friend/Family',
        'Education Agent',
        'University Fair',
        'YouTube',
        'WhatsApp',
        'Alumni Referral',
        'Other',
      ],
    },
  ]