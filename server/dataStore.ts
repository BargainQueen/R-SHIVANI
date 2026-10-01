import {
  User,
  MotherProfile,
  Medication,
  BloodPressureLog,
  SymptomReport,
  WellbeingCheckin,
  NutritionHydrationLog,
  FeedingLog,
  VaccinationRecord,
  NewbornHealthLog,
  GrowthRecord,
  Appointment,
  CareAlert,
  FollowupTask,
  ClinicalCareNote,
  InAppNotification,
  AuditLog,
  DoctorAvailabilitySlot,
  AutoScheduleResult,
} from '../src/types';

// Pre-seeded Demo Users
export const users: User[] = [
  {
    id: 'usr_mother_1',
    name: 'Maria Santos',
    email: 'maria@example.com',
    role: 'mother',
    phone: '(555) 234-5678',
    assignedDoctorId: 'usr_doc_1',
    assignedNurseId: 'usr_nurse_1',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'usr_mother_2',
    name: 'Aisha Patel',
    email: 'aisha@example.com',
    role: 'mother',
    phone: '(555) 345-6789',
    assignedDoctorId: 'usr_doc_1',
    assignedNurseId: 'usr_nurse_1',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'usr_mother_3',
    name: 'Elena Rostova',
    email: 'elena@example.com',
    role: 'mother',
    phone: '(555) 456-7890',
    assignedDoctorId: 'usr_doc_1',
    assignedNurseId: 'usr_nurse_1',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'usr_doc_1',
    name: 'Dr. Sarah Jenkins, MD',
    email: 'dr.jenkins@hospital.org',
    role: 'doctor',
    phone: '(555) 800-4321',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'usr_nurse_1',
    name: 'Carlos Mendoza, RN',
    email: 'carlos.rn@hospital.org',
    role: 'nurse',
    phone: '(555) 800-4322',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200',
  },
];

// Helper to compute postpartum day
export function getPostpartumDay(babyDob: string): number {
  const birth = new Date(babyDob);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - birth.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays + 1);
}

// Current reference dates (relative to today)
const todayStr = new Date().toISOString().split('T')[0];
const subDays = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
};

export const motherProfiles: MotherProfile[] = [
  {
    id: 'prof_mother_1',
    userId: 'usr_mother_1',
    patientName: 'Maria Santos',
    babyName: 'Mateo Santos',
    babyGender: 'male',
    babyDob: subDays(6), // 6 days postpartum
    deliveryType: 'Cesarean',
    gestationalAgeWeeks: 39,
    birthWeightGrams: 3350,
    birthLengthCm: 50.5,
    bloodType: 'O+',
    emergencyContact: {
      name: 'David Santos',
      relationship: 'Spouse',
      phone: '(555) 234-5679',
    },
    deliveryHospital: 'St. Mary Women & Children Memorial',
    dischargeDate: subDays(3),
    assignedDoctorName: 'Dr. Sarah Jenkins, MD',
    assignedNurseName: 'Carlos Mendoza, RN',
    allergies: ['Penicillin'],
  },
  {
    id: 'prof_mother_2',
    userId: 'usr_mother_2',
    patientName: 'Aisha Patel',
    babyName: 'Maya Patel',
    babyGender: 'female',
    babyDob: subDays(14), // 2 weeks postpartum
    deliveryType: 'Vaginal',
    gestationalAgeWeeks: 40,
    birthWeightGrams: 3120,
    birthLengthCm: 49.0,
    bloodType: 'A+',
    emergencyContact: {
      name: 'Raj Patel',
      relationship: 'Spouse',
      phone: '(555) 345-6780',
    },
    deliveryHospital: 'City General Maternity Center',
    dischargeDate: subDays(12),
    assignedDoctorName: 'Dr. Sarah Jenkins, MD',
    assignedNurseName: 'Carlos Mendoza, RN',
    allergies: ['None known'],
  },
  {
    id: 'prof_mother_3',
    userId: 'usr_mother_3',
    patientName: 'Elena Rostova',
    babyName: 'Liam Rostova',
    babyGender: 'male',
    babyDob: subDays(3), // 3 days postpartum
    deliveryType: 'Vaginal',
    gestationalAgeWeeks: 38,
    birthWeightGrams: 2850,
    birthLengthCm: 48.0,
    bloodType: 'B+',
    emergencyContact: {
      name: 'Alex Rostova',
      relationship: 'Partner',
      phone: '(555) 456-7891',
    },
    deliveryHospital: 'University Hospital Maternity',
    dischargeDate: subDays(1),
    assignedDoctorName: 'Dr. Sarah Jenkins, MD',
    assignedNurseName: 'Carlos Mendoza, RN',
    allergies: ['Sulfa drugs'],
  },
];

export const medications: Medication[] = [
  {
    id: 'med_1',
    userId: 'usr_mother_1',
    name: 'Ibuprofen',
    dose: '600 mg',
    frequency: 'Every 8 hours with food for incision discomfort',
    instructions: 'Take with food or a large glass of water. Do not exceed 2400mg per 24 hours.',
    startDate: subDays(6),
    endDate: subDays(-8),
    reminderTimes: ['08:00', '16:00', '22:00'],
    logs: [
      { id: 'log_m1', date: todayStr, time: '08:00', status: 'taken' },
      { id: 'log_m2', date: todayStr, time: '16:00', status: 'taken' },
      { id: 'log_m3', date: todayStr, time: '22:00', status: 'pending' },
      { id: 'log_m4', date: subDays(1), time: '08:00', status: 'taken' },
      { id: 'log_m5', date: subDays(1), time: '16:00', status: 'taken' },
      { id: 'log_m6', date: subDays(1), time: '22:00', status: 'taken' },
    ],
  },
  {
    id: 'med_2',
    userId: 'usr_mother_1',
    name: 'Labetalol',
    dose: '100 mg',
    frequency: 'Twice daily for postpartum blood pressure monitoring',
    instructions: 'Take 1 tablet morning and night. Measure BP prior to taking.',
    startDate: subDays(3),
    endDate: subDays(-11),
    reminderTimes: ['09:00', '21:00'],
    logs: [
      { id: 'log_m7', date: todayStr, time: '09:00', status: 'taken' },
      { id: 'log_m8', date: todayStr, time: '21:00', status: 'pending' },
      { id: 'log_m9', date: subDays(1), time: '09:00', status: 'taken' },
      { id: 'log_m10', date: subDays(1), time: '21:00', status: 'missed' },
    ],
  },
  {
    id: 'med_3',
    userId: 'usr_mother_1',
    name: 'Prenatal Multivitamin + Iron',
    dose: '1 capsule',
    frequency: 'Once daily with breakfast',
    instructions: 'Supports postpartum lactation and iron replenishment.',
    startDate: subDays(6),
    endDate: subDays(-30),
    reminderTimes: ['09:30'],
    logs: [
      { id: 'log_m11', date: todayStr, time: '09:30', status: 'taken' },
      { id: 'log_m12', date: subDays(1), time: '09:30', status: 'taken' },
    ],
  },
  {
    id: 'med_4',
    userId: 'usr_mother_2',
    name: 'Postnatal Wellness Vitamin',
    dose: '1 tablet',
    frequency: 'Once daily',
    instructions: 'Take with morning meal.',
    startDate: subDays(14),
    endDate: subDays(-45),
    reminderTimes: ['08:30'],
    logs: [
      { id: 'log_m13', date: todayStr, time: '08:30', status: 'taken' },
    ],
  },
];

export const bloodPressureLogs: BloodPressureLog[] = [
  {
    id: 'bp_1',
    userId: 'usr_mother_1',
    systolic: 142,
    diastolic: 92,
    pulse: 78,
    timestamp: `${todayStr}T08:15:00Z`,
    notes: 'Morning reading before breakfast. Mild headache.',
    status: 'stage1',
    alertTriggered: true,
  },
  {
    id: 'bp_2',
    userId: 'usr_mother_1',
    systolic: 138,
    diastolic: 88,
    pulse: 76,
    timestamp: `${subDays(1)}T20:30:00Z`,
    notes: 'Evening reading after resting on left side.',
    status: 'elevated',
    alertTriggered: false,
  },
  {
    id: 'bp_3',
    userId: 'usr_mother_1',
    systolic: 144,
    diastolic: 94,
    pulse: 82,
    timestamp: `${subDays(1)}T08:30:00Z`,
    notes: 'Morning reading. Followed up with nurse Carlos.',
    status: 'stage1',
    alertTriggered: true,
  },
  {
    id: 'bp_4',
    userId: 'usr_mother_1',
    systolic: 132,
    diastolic: 84,
    pulse: 74,
    timestamp: `${subDays(2)}T19:00:00Z`,
    notes: 'Good rest.',
    status: 'elevated',
    alertTriggered: false,
  },
  {
    id: 'bp_5',
    userId: 'usr_mother_1',
    systolic: 126,
    diastolic: 80,
    pulse: 72,
    timestamp: `${subDays(3)}T10:00:00Z`,
    notes: 'Discharge day reading.',
    status: 'normal',
    alertTriggered: false,
  },
  {
    id: 'bp_6',
    userId: 'usr_mother_2',
    systolic: 118,
    diastolic: 76,
    pulse: 70,
    timestamp: `${todayStr}T09:00:00Z`,
    notes: 'Normal routine check.',
    status: 'normal',
    alertTriggered: false,
  },
];

export const symptomReports: SymptomReport[] = [
  {
    id: 'sym_1',
    userId: 'usr_mother_1',
    type: 'maternal',
    symptoms: ['Mild headache', 'Incision site tightness/tenderness'],
    severity: 'moderate',
    notes: 'C-section incision is healing, some mild redness along lower edge. Headache improved slightly after water.',
    timestamp: `${todayStr}T08:20:00Z`,
    isUrgentAlert: false,
    guidanceGiven: 'Keep incision clean and dry. Rest in a dim quiet room. Report worsening vision or headache immediately.',
    clinicianReviewed: false,
  },
  {
    id: 'sym_2',
    userId: 'usr_mother_1',
    type: 'newborn',
    symptoms: ['Mild spitting up after feed'],
    severity: 'mild',
    notes: 'Spit up about 1 teaspoon after morning feeding. Baby was calm afterwards.',
    timestamp: `${subDays(1)}T14:00:00Z`,
    isUrgentAlert: false,
    guidanceGiven: 'Keep baby upright for 20-30 minutes after feeds and burp gently halfway through.',
    clinicianReviewed: true,
    clinicianNotes: 'Normal physiological posseting. Reassured mother.',
  },
  {
    id: 'sym_3',
    userId: 'usr_mother_3',
    type: 'newborn',
    symptoms: ['Fussy at breast', 'Only 2 wet diapers in last 24h'],
    severity: 'urgent',
    notes: 'Baby Liam seems sleepy during feeds and having difficulty maintaining latch.',
    timestamp: `${todayStr}T07:45:00Z`,
    isUrgentAlert: true,
    guidanceGiven: 'URGENT GUIDANCE: Fewer than 3 wet diapers after Day 3 warrants prompt clinical assessment for neonatal hydration. Contact your pediatrician or lactation nurse immediately.',
    clinicianReviewed: false,
  },
];

export const wellbeingCheckins: WellbeingCheckin[] = [
  {
    id: 'wb_1',
    userId: 'usr_mother_1',
    date: todayStr,
    timestamp: `${todayStr}T08:00:00Z`,
    mood: 'good',
    moodScore: 4,
    sleepHours: 5.5,
    anxietyLevel: 2,
    notes: 'Felt tired from night feeds but feeling emotionally supported by partner.',
    supportResourcesShown: false,
  },
  {
    id: 'wb_2',
    userId: 'usr_mother_1',
    date: subDays(1),
    timestamp: `${subDays(1)}T08:30:00Z`,
    mood: 'neutral',
    moodScore: 3,
    sleepHours: 4.5,
    anxietyLevel: 3,
    notes: 'Worried about blood pressure numbers, but Carlos called to reassure me.',
    supportResourcesShown: true,
  },
  {
    id: 'wb_3',
    userId: 'usr_mother_2',
    date: todayStr,
    timestamp: `${todayStr}T09:15:00Z`,
    mood: 'great',
    moodScore: 5,
    sleepHours: 7.0,
    anxietyLevel: 1,
    notes: 'Baby Maya slept 4 consecutive hours! Recovery feeling very smooth.',
    supportResourcesShown: false,
  },
];

export const nutritionHydrationLogs: NutritionHydrationLog[] = [
  {
    id: 'nh_1',
    userId: 'usr_mother_1',
    date: todayStr,
    waterMl: 1750,
    targetWaterMl: 2800,
    mealsLogged: ['Oatmeal with berries & flaxseed', 'Chicken soup with warm rice'],
    prenatalVitaminTaken: true,
    notes: 'Drinking electrolyte water between pump sessions.',
  },
  {
    id: 'nh_2',
    userId: 'usr_mother_1',
    date: subDays(1),
    waterMl: 2600,
    targetWaterMl: 2800,
    mealsLogged: ['Eggs and avocado toast', 'Lentil stew', 'Steamed salmon and quinoa'],
    prenatalVitaminTaken: true,
    notes: 'Good appetite.',
  },
];

export const feedingLogs: FeedingLog[] = [
  {
    id: 'feed_1',
    userId: 'usr_mother_1',
    timestamp: `${todayStr}T13:30:00Z`,
    type: 'breast',
    side: 'both',
    durationMinutes: 25,
    notes: '15 mins left, 10 mins right. Good latch, baby satisfied.',
  },
  {
    id: 'feed_2',
    userId: 'usr_mother_1',
    timestamp: `${todayStr}T10:15:00Z`,
    type: 'breast',
    side: 'left',
    durationMinutes: 20,
    notes: 'Strong suckling rhythm, burped once.',
  },
  {
    id: 'feed_3',
    userId: 'usr_mother_1',
    timestamp: `${todayStr}T06:45:00Z`,
    type: 'formula',
    amountMl: 60,
    durationMinutes: 15,
    notes: 'Supplemental bottle given by dad.',
  },
  {
    id: 'feed_4',
    userId: 'usr_mother_1',
    timestamp: `${subDays(1)}T23:00:00Z`,
    type: 'breast',
    side: 'right',
    durationMinutes: 20,
    notes: 'Night feed, fell asleep peacefully.',
  },
];

export const vaccinationRecords: VaccinationRecord[] = [
  {
    id: 'vac_1',
    userId: 'usr_mother_1',
    vaccineName: 'Hepatitis B (Dose 1)',
    targetAgeDescription: 'At birth (within 24 hours)',
    dueDate: subDays(6),
    givenDate: subDays(6),
    status: 'completed',
    providerLocation: 'St. Mary Labor & Delivery Ward',
    batchNumber: 'HEP-B-29481',
    notes: 'Administered right thigh, tolerated well.',
  },
  {
    id: 'vac_2',
    userId: 'usr_mother_1',
    vaccineName: 'Hepatitis B (Dose 2)',
    targetAgeDescription: '1 - 2 Months of age',
    dueDate: subDays(-24),
    status: 'upcoming',
    notes: 'Scheduled for 1-month well-child clinic visit.',
  },
  {
    id: 'vac_3',
    userId: 'usr_mother_1',
    vaccineName: 'DTaP, IPV, Hib, PCV15, Rotavirus (Combo 2-Month Series)',
    targetAgeDescription: '2 Months of age',
    dueDate: subDays(-54),
    status: 'upcoming',
    notes: 'Protects against Diphtheria, Tetanus, Pertussis, Polio, Pneumococcal.',
  },
  {
    id: 'vac_4',
    userId: 'usr_mother_2',
    vaccineName: 'Hepatitis B (Dose 1)',
    targetAgeDescription: 'At birth',
    dueDate: subDays(14),
    givenDate: subDays(14),
    status: 'completed',
    providerLocation: 'City General Maternity Center',
  },
];

export const newbornHealthLogs: NewbornHealthLog[] = [
  {
    id: 'nhl_1',
    userId: 'usr_mother_1',
    timestamp: `${todayStr}T09:00:00Z`,
    temperatureF: 98.4,
    wetDiapers: 5,
    dirtyDiapers: 3,
    sleepHours: 14.5,
    jaundiceObservation: 'face_only',
    umbilicalCordStatus: 'clean_dry',
    parentObservations: 'Cord stump is drying nicely without smell. Mild yellowish tint on forehead fading under daylight.',
    urgentAlert: false,
  },
  {
    id: 'nhl_2',
    userId: 'usr_mother_1',
    timestamp: `${subDays(1)}T09:00:00Z`,
    temperatureF: 98.6,
    wetDiapers: 6,
    dirtyDiapers: 4,
    sleepHours: 15.0,
    jaundiceObservation: 'face_only',
    umbilicalCordStatus: 'clean_dry',
    parentObservations: 'Alert and active during awake periods.',
    urgentAlert: false,
  },
  {
    id: 'nhl_3',
    userId: 'usr_mother_3',
    timestamp: `${todayStr}T08:00:00Z`,
    temperatureF: 99.1,
    wetDiapers: 2,
    dirtyDiapers: 1,
    sleepHours: 16.0,
    jaundiceObservation: 'chest_limbs',
    umbilicalCordStatus: 'clean_dry',
    parentObservations: 'Jaundice seems visible past chest to upper abdomen. Only 2 wet diapers.',
    urgentAlert: true,
  },
];

export const growthRecords: GrowthRecord[] = [
  {
    id: 'gw_1',
    userId: 'usr_mother_1',
    date: subDays(6),
    ageWeeks: 0,
    weightKg: 3.35,
    lengthCm: 50.5,
    headCircumferenceCm: 34.5,
    percentileApprox: '50th percentile (WHO Standard)',
    notes: 'Birth weight baseline.',
  },
  {
    id: 'gw_2',
    userId: 'usr_mother_1',
    date: subDays(3),
    ageWeeks: 0.4,
    weightKg: 3.18,
    lengthCm: 50.5,
    headCircumferenceCm: 34.5,
    percentileApprox: 'Normal expected physiological weight drop (5.1%)',
    notes: 'Discharge measurement at hospital.',
  },
  {
    id: 'gw_3',
    userId: 'usr_mother_1',
    date: todayStr,
    ageWeeks: 0.9,
    weightKg: 3.31,
    lengthCm: 51.0,
    headCircumferenceCm: 34.8,
    percentileApprox: 'Regaining toward birth weight appropriately',
    notes: 'Measured with infant home scale during morning feed.',
  },
  {
    id: 'gw_4',
    userId: 'usr_mother_2',
    date: subDays(14),
    ageWeeks: 0,
    weightKg: 3.12,
    lengthCm: 49.0,
    headCircumferenceCm: 34.0,
    percentileApprox: '45th percentile (WHO)',
  },
  {
    id: 'gw_5',
    userId: 'usr_mother_2',
    date: todayStr,
    ageWeeks: 2,
    weightKg: 3.45,
    lengthCm: 51.2,
    headCircumferenceCm: 35.1,
    percentileApprox: 'Exceeded birth weight by day 14 (Excellent)',
  },
];

export const appointments: Appointment[] = [
  {
    id: 'apt_1',
    patientId: 'usr_mother_1',
    patientName: 'Maria Santos',
    doctorId: 'usr_doc_1',
    doctorName: 'Dr. Sarah Jenkins, MD',
    title: 'Post-Cesarean Wound & Blood Pressure Check',
    date: subDays(-2), // 2 days in future
    time: '10:30 AM',
    location: 'Suite 402, Women’s Health Clinic',
    type: 'in_person',
    status: 'scheduled',
    notes: 'Evaluate incisional healing, review blood pressure trends, and check Labetalol dose.',
  },
  {
    id: 'apt_2',
    patientId: 'usr_mother_1',
    patientName: 'Maria Santos',
    doctorId: 'usr_doc_1',
    doctorName: 'Dr. Sarah Jenkins, MD',
    title: 'Comprehensive 6-Week Postpartum Visit',
    date: subDays(-36), // 36 days in future
    time: '02:00 PM',
    location: 'Suite 402, Women’s Health Clinic',
    type: 'in_person',
    status: 'scheduled',
    notes: 'Full physical exam, pelvic healing, mental health screening, contraception counseling.',
  },
  {
    id: 'apt_3',
    patientId: 'usr_mother_2',
    patientName: 'Aisha Patel',
    doctorId: 'usr_doc_1',
    doctorName: 'Dr. Sarah Jenkins, MD',
    title: '2-Week Newborn & Lactation Telehealth Follow-up',
    date: subDays(-1),
    time: '11:00 AM',
    location: 'Virtual Telehealth Video Suite',
    type: 'telehealth',
    status: 'scheduled',
    notes: 'Discuss nursing schedule and weight regain confirmation.',
  },
];

export const doctorAvailabilitySlots: DoctorAvailabilitySlot[] = [
  {
    id: 'slot_1',
    doctorId: 'usr_doc_1',
    date: subDays(-1), // Tomorrow
    time: '09:00 AM',
    available: true,
    notes: 'Morning priority triage slot',
  },
  {
    id: 'slot_2',
    doctorId: 'usr_doc_1',
    date: subDays(-1), // Tomorrow
    time: '11:30 AM',
    available: true,
    notes: 'Late morning priority slot',
  },
  {
    id: 'slot_3',
    doctorId: 'usr_doc_1',
    date: subDays(-1), // Tomorrow
    time: '02:00 PM',
    available: false,
    bookedAppointmentId: 'apt_3',
    notes: 'Reserved: Aisha Patel telehealth check',
  },
  {
    id: 'slot_4',
    doctorId: 'usr_doc_1',
    date: subDays(-1), // Tomorrow
    time: '04:00 PM',
    available: true,
    notes: 'Afternoon urgent follow-up slot',
  },
  {
    id: 'slot_5',
    doctorId: 'usr_doc_1',
    date: subDays(-2), // 2 days in future
    time: '09:30 AM',
    available: true,
    notes: 'Morning clinic slot',
  },
  {
    id: 'slot_6',
    doctorId: 'usr_doc_1',
    date: subDays(-2), // 2 days in future
    time: '10:30 AM',
    available: false,
    bookedAppointmentId: 'apt_1',
    notes: 'Reserved: Maria Santos Wound & BP Check',
  },
  {
    id: 'slot_7',
    doctorId: 'usr_doc_1',
    date: subDays(-2), // 2 days in future
    time: '02:30 PM',
    available: true,
    notes: 'Afternoon consultation slot',
  },
  {
    id: 'slot_8',
    doctorId: 'usr_doc_1',
    date: subDays(-3), // 3 days in future
    time: '10:00 AM',
    available: true,
    notes: 'Morning clinical slot',
  },
  {
    id: 'slot_9',
    doctorId: 'usr_doc_1',
    date: subDays(-3), // 3 days in future
    time: '03:00 PM',
    available: true,
    notes: 'Afternoon clinic slot',
  },
  {
    id: 'slot_10',
    doctorId: 'usr_doc_1',
    date: subDays(-4), // 4 days in future
    time: '11:00 AM',
    available: true,
    notes: 'Midday clinic slot',
  },
];

export const careAlerts: CareAlert[] = [
  {
    id: 'alt_1',
    patientId: 'usr_mother_1',
    patientName: 'Maria Santos',
    severity: 'warning',
    category: 'blood_pressure',
    title: 'Elevated Blood Pressure: 142/92 mmHg',
    description: 'Patient logged systolic 142 and diastolic 92 with mild morning headache. Meets Stage 1 threshold.',
    guidanceProvided: 'Instructed to rest quietly on left side for 10 minutes, re-check, and maintain hydration. Advised on red flag headache/vision symptoms.',
    timestamp: `${todayStr}T08:15:00Z`,
    reviewed: false,
    escalatedToDoctor: true,
  },
  {
    id: 'alt_2',
    patientId: 'usr_mother_3',
    patientName: 'Elena Rostova',
    severity: 'urgent',
    category: 'newborn_warning',
    title: 'Newborn Hydration Concern: Low Diaper Count (2 in 24h)',
    description: 'Patient logged only 2 wet diapers in 24 hours on Day 3 with advancing jaundice down to chest/limbs.',
    guidanceProvided: 'Urgent notice displayed to seek prompt pediatric assessment for neonatal dehydration risk.',
    timestamp: `${todayStr}T08:00:00Z`,
    reviewed: false,
    escalatedToDoctor: true,
  },
  {
    id: 'alt_3',
    patientId: 'usr_mother_1',
    patientName: 'Maria Santos',
    severity: 'info',
    category: 'blood_pressure',
    title: 'Borderline Evening BP: 138/88 mmHg',
    description: 'Reading slightly elevated but stable.',
    guidanceProvided: 'Routine care plan followed.',
    timestamp: `${subDays(1)}T20:30:00Z`,
    reviewed: true,
    reviewedBy: 'Carlos Mendoza, RN',
    reviewedAt: `${subDays(1)}T21:00:00Z`,
    outcomeNotes: 'Called patient via phone. Reassured patient, instructed to take morning BP before food.',
  },
];

export const followupTasks: FollowupTask[] = [
  {
    id: 'task_1',
    patientId: 'usr_mother_1',
    patientName: 'Maria Santos',
    assignedToRole: 'nurse',
    priority: 'high',
    title: 'Assess Morning Blood Pressure Elevation (142/92)',
    reason: 'Stage 1 BP alert triggered on Day 6 post C-section. Ensure patient is taking Labetalol as prescribed.',
    dueDate: todayStr,
    status: 'pending',
    attempts: [
      {
        id: 'att_1',
        timestamp: `${todayStr}T09:30:00Z`,
        type: 'message',
        outcome: 'reached',
        notes: 'Sent in-app message reminding to take second BP reading after 15 minutes of rest.',
        loggedBy: 'Carlos Mendoza, RN',
      },
    ],
    escalatedToDoctor: true,
    createdAt: `${todayStr}T08:16:00Z`,
  },
  {
    id: 'task_2',
    patientId: 'usr_mother_3',
    patientName: 'Elena Rostova',
    assignedToRole: 'nurse',
    priority: 'high',
    title: 'Urgent Newborn Hydration & Feeding Follow-up',
    reason: 'Only 2 wet diapers in 24 hours on Day 3. High risk of dehydration and escalating hyperbilirubinemia.',
    dueDate: todayStr,
    status: 'in_progress',
    attempts: [],
    escalatedToDoctor: true,
    createdAt: `${todayStr}T08:05:00Z`,
  },
  {
    id: 'task_3',
    patientId: 'usr_mother_2',
    patientName: 'Aisha Patel',
    assignedToRole: 'nurse',
    priority: 'medium',
    title: 'Routine 2-Week Postpartum Phone Check',
    reason: 'Verify recovery progression, emotional wellbeing score, and prepare for upcoming telehealth check.',
    dueDate: todayStr,
    status: 'completed',
    attempts: [
      {
        id: 'att_2',
        timestamp: `${todayStr}T10:00:00Z`,
        type: 'call',
        outcome: 'resolved',
        notes: 'Spoke with Aisha for 12 minutes. Excellent recovery, baby sleeping well, breastfeeding established.',
        loggedBy: 'Carlos Mendoza, RN',
      },
    ],
    clinicalNotes: 'Patient cleared for normal light activity. Telehealth link verified for tomorrow.',
    escalatedToDoctor: false,
    createdAt: `${subDays(1)}T09:00:00Z`,
  },
];

export const clinicalCareNotes: ClinicalCareNote[] = [
  {
    id: 'note_1',
    patientId: 'usr_mother_1',
    authorId: 'usr_doc_1',
    authorName: 'Dr. Sarah Jenkins, MD',
    authorRole: 'doctor',
    noteType: 'progress_note',
    content: 'Reviewed patient blood pressure log. Systolic hovering 138-144 range. Incision reported healing without purulent drainage. Will keep Labetalol 100mg BID until clinic visit in 2 days. Instructed patient on strict preeclampsia precautions.',
    followUpDate: subDays(-2),
    timestamp: `${todayStr}T09:15:00Z`,
  },
  {
    id: 'note_2',
    patientId: 'usr_mother_1',
    authorId: 'usr_nurse_1',
    authorName: 'Carlos Mendoza, RN',
    authorRole: 'nurse',
    noteType: 'discharge_followup',
    content: 'Day 3 phone follow-up completed. Maria voiced good pain management with Ibuprofen. Encouraged adequate hydration (2.5L daily) to aid lactation and healing.',
    timestamp: `${subDays(3)}T15:30:00Z`,
  },
  {
    id: 'note_3',
    patientId: 'usr_mother_2',
    authorId: 'usr_doc_1',
    authorName: 'Dr. Sarah Jenkins, MD',
    authorRole: 'doctor',
    noteType: 'progress_note',
    content: 'Patient thriving at 2 weeks postpartum. Perineal discomfort resolved. Mood stable, bonding with newborn Maya well.',
    timestamp: `${subDays(2)}T11:00:00Z`,
  },
];

export const inAppNotifications: InAppNotification[] = [
  {
    id: 'notif_1',
    userId: 'usr_mother_1',
    title: 'Medication Reminder: Ibuprofen 600mg',
    message: 'Time for your scheduled midday dose with a full glass of water.',
    type: 'medication',
    read: false,
    timestamp: `${todayStr}T16:00:00Z`,
    linkSection: 'medications',
  },
  {
    id: 'notif_2',
    userId: 'usr_mother_1',
    title: 'Hydration Check-in',
    message: 'You have logged 1,750 ml of water today. Reach your 2,800 ml goal for optimal recovery and nursing!',
    type: 'feeding',
    read: false,
    timestamp: `${todayStr}T14:00:00Z`,
    linkSection: 'recovery',
  },
  {
    id: 'notif_3',
    userId: 'usr_mother_1',
    title: 'Upcoming Appointment in 2 Days',
    message: 'Post-Cesarean Wound & Blood Pressure Check with Dr. Sarah Jenkins on Thursday at 10:30 AM.',
    type: 'appointment',
    read: true,
    timestamp: `${subDays(1)}T10:00:00Z`,
    linkSection: 'appointments',
  },
];

export const auditLogs: AuditLog[] = [
  {
    id: 'aud_1',
    timestamp: `${todayStr}T08:15:00Z`,
    actorId: 'usr_mother_1',
    actorName: 'Maria Santos',
    actorRole: 'mother',
    action: 'LOG_BLOOD_PRESSURE',
    targetPatientId: 'usr_mother_1',
    details: 'Logged BP 142/92 mmHg (Stage 1 alert triggered)',
  },
  {
    id: 'aud_2',
    timestamp: `${todayStr}T09:15:00Z`,
    actorId: 'usr_doc_1',
    actorName: 'Dr. Sarah Jenkins, MD',
    actorRole: 'doctor',
    action: 'ADD_CLINICAL_NOTE',
    targetPatientId: 'usr_mother_1',
    details: 'Added progress note regarding Labetalol continuation and preeclampsia safeguards',
  },
];

// Clinician warning rules evaluation helper
export function evaluateBloodPressure(systolic: number, diastolic: number): {
  status: BloodPressureLog['status'];
  alertTriggered: boolean;
  severity?: CareAlert['severity'];
  guidance: string;
} {
  if (systolic >= 160 || diastolic >= 110) {
    return {
      status: 'urgent_crisis',
      alertTriggered: true,
      severity: 'urgent',
      guidance:
        'CRITICAL WARNING: Your reading (≥160/110 mmHg) indicates severe postpartum hypertension/preeclampsia risk. Please immediately call 911 or go to the nearest Hospital Labor & Delivery Emergency Triage. Do NOT drive yourself.',
    };
  }

  if (systolic >= 140 || diastolic >= 90) {
    return {
      status: 'stage1',
      alertTriggered: true,
      severity: 'warning',
      guidance:
        'ELEVATED WARNING: Your blood pressure is elevated (≥140/90 mmHg). Sit in a quiet room, rest your back supported for 10 minutes, and re-test. If you experience severe headache, visual spots/flashes, or chest pain, seek immediate emergency care. Your care team has been alerted.',
    };
  }

  if (systolic >= 130 || diastolic >= 85) {
    return {
      status: 'elevated',
      alertTriggered: false,
      guidance:
        'Pre-hypertension / slightly elevated. Continue resting, stay hydrated, and follow your prescribed medication routine.',
    };
  }

  return {
    status: 'normal',
    alertTriggered: false,
    guidance: 'Your blood pressure is within normal postpartum target range.',
  };
}

// Symptom clinician warning evaluation
export function evaluateMaternalSymptoms(symptoms: string[]): {
  isUrgent: boolean;
  guidance: string;
} {
  const urgentRedFlags = [
    'heavy bleeding soaking a pad in under 1 hour',
    'severe persistent headache not relieved by medication',
    'vision changes, blurring, or seeing flashing spots',
    'high fever (100.4°F / 38°C or higher) with chills',
    'chest pain, shortness of breath, or rapid breathing',
    'severe, sharp lower abdominal pain',
    'swollen, red, tender, or painful calf / leg',
    'thoughts of harming yourself or baby',
  ];

  const matched = symptoms.filter((sym) =>
    urgentRedFlags.some((flag) => sym.toLowerCase().includes(flag.toLowerCase()))
  );

  if (matched.length > 0) {
    return {
      isUrgent: true,
      guidance: `IMMEDIATE MEDICAL ATTENTION REQUIRED: One or more reported symptoms (${matched.join(
        ', '
      )}) match critical post-discharge warning criteria. Please call Emergency Services (911) or your hospital maternity triage immediately. Do not delay.`,
    };
  }

  return {
    isUrgent: false,
    guidance:
      'Symptoms recorded in your chart. Rest comfortably, maintain gentle hydration, and observe for any changes. Your care team can review these notes during rounds.',
  };
}

// Automatic check for missed daily check-in (Workflow 1)
export function runMissedCheckinScan(): FollowupTask[] {
  const newTasks: FollowupTask[] = [];
  const yesterdayStr = subDays(1);

  motherProfiles.forEach((prof) => {
    const hasRecentCheckin = wellbeingCheckins.some(
      (wb) => wb.userId === prof.userId && (wb.date === todayStr || wb.date === yesterdayStr)
    );

    if (!hasRecentCheckin) {
      // Check if task already exists
      const existing = followupTasks.find(
        (t) => t.patientId === prof.userId && t.title.includes('Missed Daily Check-in') && t.status !== 'completed'
      );

      if (!existing) {
        const newTask: FollowupTask = {
          id: `task_missed_${Date.now()}_${prof.userId}`,
          patientId: prof.userId,
          patientName: prof.patientName,
          assignedToRole: 'nurse',
          priority: 'medium',
          title: `Missed Daily Check-in: ${prof.patientName}`,
          reason: `No maternal wellbeing or vitals recorded in the last 24 hours. Postpartum day ${getPostpartumDay(
            prof.babyDob
          )}.`,
          dueDate: todayStr,
          status: 'pending',
          attempts: [],
          escalatedToDoctor: false,
          createdAt: new Date().toISOString(),
        };
        followupTasks.push(newTask);
        newTasks.push(newTask);
      }
    }
  });

  return newTasks;
}

// -------------------------------------------------------------
// Doctor Availability & Automated Appointment Scheduling Workflow
// -------------------------------------------------------------

export function getDoctorAvailability(doctorId: string): DoctorAvailabilitySlot[] {
  return doctorAvailabilitySlots.filter((slot) => slot.doctorId === doctorId);
}

export function toggleSlotAvailability(slotId: string): DoctorAvailabilitySlot | null {
  const slot = doctorAvailabilitySlots.find((s) => s.id === slotId);
  if (!slot) return null;
  slot.available = !slot.available;
  if (slot.available) {
    slot.bookedAppointmentId = undefined;
  }
  return slot;
}

export function addDoctorSlot(slot: Omit<DoctorAvailabilitySlot, 'id'>): DoctorAvailabilitySlot {
  const newSlot: DoctorAvailabilitySlot = {
    ...slot,
    id: `slot_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
  };
  doctorAvailabilitySlots.push(newSlot);
  return newSlot;
}

export function triggerAbnormalHealthWorkflow(params: {
  patientId: string;
  sourceType: 'blood_pressure' | 'maternal_symptom' | 'newborn_warning' | 'conversational_audit';
  readingSummary: string;
  severity: 'urgent' | 'warning' | 'info';
  guidance: string;
  sourceLogId?: string;
}): AutoScheduleResult {
  const profile = motherProfiles.find((p) => p.userId === params.patientId);
  const patientUser = users.find((u) => u.id === params.patientId);
  const patientName = profile?.patientName || patientUser?.name || 'Mother';

  // 1. Identify the mother's assigned doctor
  const doctorId = patientUser?.assignedDoctorId || 'usr_doc_1';
  const doctorUser = users.find((u) => u.id === doctorId) || users.find((u) => u.role === 'doctor') || users[3];
  const doctorName = doctorUser ? doctorUser.name : 'Dr. Sarah Jenkins, MD';

  const today = new Date().toISOString().split('T')[0];
  const timestamp = new Date().toISOString();

  // 2. Prevent duplicate appointment creation if the same abnormal reading is processed more than once
  // Check if an auto-scheduled appointment with the exact sourceLogId or matching reading summary already exists
  if (params.sourceLogId) {
    const existingByLogId = appointments.find(
      (a) =>
        a.patientId === params.patientId &&
        a.isAutoScheduled &&
        a.status === 'scheduled' &&
        a.notes?.includes(params.sourceLogId!)
    );

    if (existingByLogId) {
      return {
        scheduled: false,
        appointment: existingByLogId,
        isDuplicatePrevented: true,
        message: `Duplicate appointment prevented: An urgent appointment is already scheduled for this log on ${existingByLogId.date} at ${existingByLogId.time}.`,
      };
    }
  }

  // Also check if an active auto-scheduled appointment was scheduled on the same date with identical trigger reason
  const existingActiveAutoApt = appointments.find(
    (a) =>
      a.patientId === params.patientId &&
      a.isAutoScheduled &&
      a.status === 'scheduled' &&
      a.date >= today &&
      a.triggerReason === params.readingSummary
  );

  if (existingActiveAutoApt) {
    return {
      scheduled: false,
      appointment: existingActiveAutoApt,
      isDuplicatePrevented: true,
      message: `Duplicate appointment prevented: An urgent follow-up is already active on ${existingActiveAutoApt.date} at ${existingActiveAutoApt.time} for "${params.readingSummary}".`,
    };
  }

  // 3. Check the assigned doctor's available slots (chronologically sorted by date and time)
  const availableSlots = doctorAvailabilitySlots
    .filter((s) => s.doctorId === doctorId && s.available === true && s.date >= today)
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      // Sort times (e.g. "09:00 AM" vs "02:00 PM")
      const timeToMinutes = (t: string) => {
        const parts = t.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!parts) return 0;
        let hrs = parseInt(parts[1], 10);
        const mins = parseInt(parts[2], 10);
        const ampm = parts[3].toUpperCase();
        if (ampm === 'PM' && hrs < 12) hrs += 12;
        if (ampm === 'AM' && hrs === 12) hrs = 0;
        return hrs * 60 + mins;
      };
      return timeToMinutes(a.time) - timeToMinutes(b.time);
    });

  // 4. If an available slot exists:
  if (availableSlots.length > 0) {
    const selectedSlot = availableSlots[0];
    const newAppointmentId = `apt_auto_${Date.now()}`;

    const newAppointment: Appointment = {
      id: newAppointmentId,
      patientId: params.patientId,
      patientName,
      doctorId,
      doctorName,
      title: `Urgent Clinical Follow-up (${params.readingSummary})`,
      date: selectedSlot.date,
      time: selectedSlot.time,
      location: 'Suite 402, Women’s Health Clinic (Priority Triage)',
      type: 'in_person',
      status: 'scheduled',
      isAutoScheduled: true,
      triggerReason: params.readingSummary,
      slotId: selectedSlot.id,
      notes: `Automated urgent appointment triggered by abnormal reading: ${params.readingSummary}. Guidance: ${params.guidance}${params.sourceLogId ? ` [Ref: ${params.sourceLogId}]` : ''}`,
    };

    // 5. Mark that appointment slot as unavailable so it cannot be booked again
    selectedSlot.available = false;
    selectedSlot.bookedAppointmentId = newAppointmentId;

    // Add to appointments collection
    appointments.push(newAppointment);

    // 6. Notify the mother about the scheduled appointment
    inAppNotifications.push({
      id: `notif_mother_${Date.now()}`,
      userId: params.patientId,
      title: `🚨 Urgent Appointment Auto-Scheduled with ${doctorName}`,
      message: `An abnormal reading was detected (${params.readingSummary}). An urgent clinical follow-up appointment was automatically reserved for ${selectedSlot.date} at ${selectedSlot.time}.`,
      type: 'appointment',
      read: false,
      timestamp,
      linkSection: 'appointments',
    });

    // 7. Notify the doctor about the appointment
    inAppNotifications.push({
      id: `notif_doc_${Date.now()}`,
      userId: doctorId,
      title: `🚨 Urgent Appointment Auto-Booked: ${patientName}`,
      message: `Patient logged abnormal health data (${params.readingSummary}). Auto-scheduled into your next open slot on ${selectedSlot.date} at ${selectedSlot.time}.`,
      type: 'appointment',
      read: false,
      timestamp,
      linkSection: 'patients',
    });

    // Log in audit trail
    auditLogs.push({
      id: `aud_auto_apt_${Date.now()}`,
      timestamp,
      actorId: 'system_auto_scheduler',
      actorName: 'Automated Care Scheduler',
      actorRole: 'doctor',
      action: 'AUTO_SCHEDULE_APPOINTMENT',
      targetPatientId: params.patientId,
      details: `Auto-scheduled appointment for ${patientName} with ${doctorName} on ${selectedSlot.date} at ${selectedSlot.time} due to abnormal reading: ${params.readingSummary}`,
    });

    return {
      scheduled: true,
      appointment: newAppointment,
      slot: selectedSlot,
      message: `Urgent appointment successfully auto-scheduled with ${doctorName} for ${selectedSlot.date} at ${selectedSlot.time}. Slot reserved and doctor notified.`,
    };
  }

  // 8. If NO slot is available:
  // Notify the mother that an appointment could not yet be automatically scheduled
  inAppNotifications.push({
    id: `notif_mother_noslot_${Date.now()}`,
    userId: params.patientId,
    title: `⚠️ Health Alert Sent - Doctor Notified`,
    message: `Your reading (${params.readingSummary}) was flagged as abnormal and sent to ${doctorName}. All regular slots are currently full; our clinical team will contact you directly for priority scheduling.`,
    type: 'alert',
    read: false,
    timestamp,
    linkSection: 'recovery',
  });

  // Notify the doctor that an urgent abnormality was detected but no slots are available
  inAppNotifications.push({
    id: `notif_doc_noslot_${Date.now()}`,
    userId: doctorId,
    title: `🚨 CRITICAL: Abnormal Reading - No Open Slots Available for ${patientName}`,
    message: `Patient reported abnormal health data (${params.readingSummary}), but NO available appointment slots remain in your schedule. Immediate manual contact/triage required.`,
    type: 'alert',
    read: false,
    timestamp,
    linkSection: 'patients',
  });

  auditLogs.push({
    id: `aud_no_slot_${Date.now()}`,
    timestamp,
    actorId: 'system_auto_scheduler',
    actorName: 'Automated Care Scheduler',
    actorRole: 'doctor',
    action: 'AUTO_SCHEDULE_FAILED_NO_SLOTS',
    targetPatientId: params.patientId,
    details: `No open slots for ${doctorName} to auto-schedule abnormal reading (${params.readingSummary}) for ${patientName}. Emergency doctor notification sent.`,
  });

  return {
    scheduled: false,
    message: `Abnormality detected. Assigned doctor ${doctorName} was alerted, but no open appointment slots were available. Priority manual triage notification dispatched.`,
  };
}
