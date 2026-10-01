export type UserRole = 'mother' | 'doctor' | 'nurse';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  assignedDoctorId?: string;
  assignedNurseId?: string;
}

export interface MotherProfile {
  id: string;
  userId: string;
  patientName: string;
  babyName: string;
  babyGender: 'male' | 'female' | 'other';
  babyDob: string; // ISO date string: YYYY-MM-DD
  deliveryType: 'Vaginal' | 'Cesarean';
  gestationalAgeWeeks: number;
  birthWeightGrams: number;
  birthLengthCm: number;
  bloodType: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  deliveryHospital: string;
  dischargeDate: string;
  assignedDoctorName: string;
  assignedNurseName: string;
  allergies?: string[];
  postpartumDay?: number;
}

export interface Medication {
  id: string;
  userId: string;
  name: string;
  dose: string;
  frequency: string;
  instructions: string;
  startDate: string;
  endDate: string;
  reminderTimes: string[]; // e.g. ["08:00", "20:00"]
  logs: {
    id: string;
    date: string; // YYYY-MM-DD
    time: string;
    status: 'taken' | 'missed' | 'pending';
  }[];
}

export interface BloodPressureLog {
  id: string;
  userId: string;
  systolic: number;
  diastolic: number;
  pulse?: number;
  timestamp: string; // ISO string
  notes?: string;
  status: 'normal' | 'elevated' | 'stage1' | 'stage2' | 'urgent_crisis';
  alertTriggered: boolean;
}

export interface SymptomReport {
  id: string;
  userId: string;
  type: 'maternal' | 'newborn';
  symptoms: string[];
  severity: 'mild' | 'moderate' | 'urgent';
  notes: string;
  timestamp: string;
  isUrgentAlert: boolean;
  guidanceGiven: string;
  clinicianReviewed: boolean;
  clinicianNotes?: string;
}

export interface WellbeingCheckin {
  id: string;
  userId: string;
  date: string;
  timestamp: string;
  mood: 'great' | 'good' | 'neutral' | 'struggling' | 'overwhelmed';
  moodScore: number; // 1-5
  sleepHours: number;
  anxietyLevel: number; // 1-5
  notes?: string;
  supportResourcesShown: boolean;
}

export interface NutritionHydrationLog {
  id: string;
  userId: string;
  date: string;
  waterMl: number;
  targetWaterMl: number;
  mealsLogged: string[];
  prenatalVitaminTaken: boolean;
  notes?: string;
}

export interface FeedingLog {
  id: string;
  userId: string;
  timestamp: string;
  type: 'breast' | 'formula' | 'mixed';
  side?: 'left' | 'right' | 'both';
  durationMinutes?: number;
  amountMl?: number;
  notes?: string;
}

export interface VaccinationRecord {
  id: string;
  userId: string;
  vaccineName: string;
  targetAgeDescription: string;
  dueDate: string;
  givenDate?: string;
  status: 'completed' | 'upcoming' | 'overdue';
  providerLocation?: string;
  batchNumber?: string;
  notes?: string;
}

export interface NewbornHealthLog {
  id: string;
  userId: string;
  timestamp: string;
  temperatureF: number;
  wetDiapers: number;
  dirtyDiapers: number;
  sleepHours: number;
  jaundiceObservation: 'none' | 'face_only' | 'chest_limbs';
  umbilicalCordStatus: 'clean_dry' | 'slight_redness' | 'discharge_odor';
  parentObservations?: string;
  urgentAlert: boolean;
}

export interface GrowthRecord {
  id: string;
  userId: string;
  date: string;
  ageWeeks: number;
  weightKg: number;
  lengthCm: number;
  headCircumferenceCm: number;
  notes?: string;
  percentileApprox?: string;
}

export interface DoctorAvailabilitySlot {
  id: string;
  doctorId: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "09:30 AM"
  available: boolean; // available status
  bookedAppointmentId?: string;
  notes?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: 'in_person' | 'telehealth';
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  isAutoScheduled?: boolean;
  triggerReason?: string;
  slotId?: string;
}

export interface CareAlert {
  id: string;
  patientId: string;
  patientName: string;
  severity: 'urgent' | 'warning' | 'info';
  category: 'blood_pressure' | 'maternal_symptom' | 'newborn_warning' | 'missed_checkin';
  title: string;
  description: string;
  guidanceProvided: string;
  timestamp: string;
  reviewed: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
  outcomeNotes?: string;
  escalatedToDoctor?: boolean;
}

export interface FollowupAttempt {
  id: string;
  timestamp: string;
  type: 'call' | 'message' | 'visit';
  outcome: 'reached' | 'left_voicemail' | 'no_answer' | 'resolved';
  notes: string;
  loggedBy: string;
}

export interface FollowupTask {
  id: string;
  patientId: string;
  patientName: string;
  assignedToRole: 'nurse' | 'doctor';
  priority: 'high' | 'medium' | 'low';
  title: string;
  reason: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  attempts: FollowupAttempt[];
  clinicalNotes?: string;
  escalatedToDoctor: boolean;
  createdAt: string;
}

export interface ClinicalCareNote {
  id: string;
  patientId: string;
  authorId: string;
  authorName: string;
  authorRole: 'doctor' | 'nurse';
  noteType: 'progress_note' | 'care_plan' | 'discharge_followup' | 'escalation_response';
  content: string;
  followUpDate?: string;
  timestamp: string;
}

export interface InAppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'medication' | 'feeding' | 'vaccination' | 'appointment' | 'alert' | 'task';
  read: boolean;
  timestamp: string;
  linkSection?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  targetPatientId: string;
  details: string;
}

export interface AutoScheduleResult {
  scheduled: boolean;
  appointment?: Appointment;
  slot?: DoctorAvailabilitySlot;
  message: string;
  isDuplicatePrevented?: boolean;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  isUrgentFlag?: boolean;
}
