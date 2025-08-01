import { ProfessionalExamType, USState } from '../types';

export const PROFESSIONAL_EXAMS: ProfessionalExamType[] = [
  // Medical
  {
    id: 'usmle-step1',
    name: 'USMLE Step 1',
    description: 'United States Medical Licensing Examination Step 1',
    category: 'medical',
    timeLimit: 480, // 8 hours
    passingScore: 194,
    questionCount: 280,
  },
  {
    id: 'usmle-step2',
    name: 'USMLE Step 2 CK',
    description: 'United States Medical Licensing Examination Step 2 Clinical Knowledge',
    category: 'medical',
    timeLimit: 540, // 9 hours
    passingScore: 209,
    questionCount: 318,
  },
  {
    id: 'nclex-rn',
    name: 'NCLEX-RN',
    description: 'National Council Licensure Examination for Registered Nurses',
    category: 'nursing',
    timeLimit: 300, // 5 hours
    passingScore: 75,
    questionCount: 150,
  },
  {
    id: 'nclex-pn',
    name: 'NCLEX-PN',
    description: 'National Council Licensure Examination for Practical Nurses',
    category: 'nursing',
    timeLimit: 300, // 5 hours
    passingScore: 75,
    questionCount: 150,
  },
  
  // Legal
  {
    id: 'bar-exam',
    name: 'Bar Examination',
    description: 'State Bar Examination for Attorney Licensing',
    category: 'legal',
    timeLimit: 720, // 12 hours (2 days)
    passingScore: 70,
    questionCount: 200,
  },
  {
    id: 'mpre',
    name: 'MPRE',
    description: 'Multistate Professional Responsibility Examination',
    category: 'legal',
    timeLimit: 120, // 2 hours
    passingScore: 75,
    questionCount: 60,
  },
  
  // Engineering
  {
    id: 'fe-exam',
    name: 'FE Exam',
    description: 'Fundamentals of Engineering Examination',
    category: 'engineering',
    timeLimit: 360, // 6 hours
    passingScore: 70,
    questionCount: 110,
  },
  {
    id: 'pe-exam',
    name: 'PE Exam',
    description: 'Principles and Practice of Engineering Examination',
    category: 'engineering',
    timeLimit: 480, // 8 hours
    passingScore: 70,
    questionCount: 80,
  },
  
  // Accounting
  {
    id: 'cpa-aud',
    name: 'CPA - Auditing',
    description: 'Certified Public Accountant - Auditing and Attestation',
    category: 'accounting',
    timeLimit: 240, // 4 hours
    passingScore: 75,
    questionCount: 72,
  },
  {
    id: 'cpa-far',
    name: 'CPA - Financial',
    description: 'Certified Public Accountant - Financial Accounting and Reporting',
    category: 'accounting',
    timeLimit: 240, // 4 hours
    passingScore: 75,
    questionCount: 66,
  },
  {
    id: 'cpa-reg',
    name: 'CPA - Regulation',
    description: 'Certified Public Accountant - Regulation',
    category: 'accounting',
    timeLimit: 240, // 4 hours
    passingScore: 75,
    questionCount: 76,
  },
  {
    id: 'cpa-bec',
    name: 'CPA - Business',
    description: 'Certified Public Accountant - Business Environment and Concepts',
    category: 'accounting',
    timeLimit: 240, // 4 hours
    passingScore: 75,
    questionCount: 62,
  },
  
  // Real Estate
  {
    id: 'real-estate-license',
    name: 'Real Estate License',
    description: 'State Real Estate Licensing Examination',
    category: 'real-estate',
    timeLimit: 180, // 3 hours
    passingScore: 70,
    questionCount: 100,
  },
  
  // Pharmacy
  {
    id: 'naplex',
    name: 'NAPLEX',
    description: 'North American Pharmacist Licensure Examination',
    category: 'pharmacy',
    timeLimit: 285, // 4 hours 45 minutes
    passingScore: 75,
    questionCount: 250,
  },
  
  // Architecture
  {
    id: 'are-5',
    name: 'ARE 5.0',
    description: 'Architect Registration Examination',
    category: 'architecture',
    timeLimit: 480, // 8 hours (varies by division)
    passingScore: 70,
    questionCount: 95,
  },
  
  // Education
  {
    id: 'praxis-core',
    name: 'Praxis Core',
    description: 'Praxis Core Academic Skills for Educators',
    category: 'education',
    timeLimit: 300, // 5 hours
    passingScore: 70,
    questionCount: 150,
  },
  
  // Finance
  {
    id: 'series-7',
    name: 'Series 7',
    description: 'General Securities Representative Examination',
    category: 'finance',
    timeLimit: 225, // 3 hours 45 minutes
    passingScore: 72,
    questionCount: 125,
  },
  {
    id: 'series-66',
    name: 'Series 66',
    description: 'Uniform Combined State Law Examination',
    category: 'finance',
    timeLimit: 150, // 2 hours 30 minutes
    passingScore: 73,
    questionCount: 100,
  },
];

export const US_STATES: USState[] = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
  { code: 'DC', name: 'District of Columbia' },
];