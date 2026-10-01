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
  AIChatMessage,
  DoctorAvailabilitySlot,
  AutoScheduleResult,
} from '../types';

export interface PatientDetailedRecord {
  profile: MotherProfile;
  bloodPressureLogs: BloodPressureLog[];
  symptoms: SymptomReport[];
  medications: Medication[];
  wellbeingCheckins: WellbeingCheckin[];
  nutritionLogs: NutritionHydrationLog[];
  feedingLogs: FeedingLog[];
  vaccinations: VaccinationRecord[];
  newbornHealthLogs: NewbornHealthLog[];
  growthRecords: GrowthRecord[];
  appointments: Appointment[];
  alerts: CareAlert[];
  followupTasks: FollowupTask[];
  careNotes: ClinicalCareNote[];
  doctorAvailability?: DoctorAvailabilitySlot[];
}

export interface PatientSummary extends MotherProfile {
  latestBp?: BloodPressureLog;
  unreadAlertsCount: number;
  pendingTasksCount: number;
  riskStatus: 'urgent' | 'warning' | 'stable';
  recentMood: string;
}

export const api = {
  async getUsers(): Promise<User[]> {
    const res = await fetch('/api/users');
    if (!res.ok) throw new Error('Failed to load users');
    const data = await res.json();
    return data.users;
  },

  async login(params: { email?: string; role?: string; userId?: string }): Promise<User> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Login failed');
    const data = await res.json();
    return data.user;
  },

  async register(params: {
    name: string;
    email: string;
    role: 'mother' | 'doctor' | 'nurse';
    phone?: string;
    babyName?: string;
    babyDob?: string;
    deliveryType?: string;
  }): Promise<User> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Registration failed');
    const data = await res.json();
    return data.user;
  },

  async getPatients(role: string, userId: string): Promise<PatientSummary[]> {
    const res = await fetch(`/api/patients?role=${role}&userId=${userId}`);
    if (!res.ok) throw new Error('Failed to fetch patients');
    const data = await res.json();
    return data.patients;
  },

  async getPatientRecord(patientId: string): Promise<PatientDetailedRecord> {
    const res = await fetch(`/api/patient/${patientId}`);
    if (!res.ok) throw new Error('Failed to fetch patient record');
    return await res.json();
  },

  async logBloodPressure(data: {
    userId: string;
    systolic: number;
    diastolic: number;
    pulse?: number;
    notes?: string;
  }) {
    const res = await fetch('/api/records/bp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to record blood pressure');
    return await res.json();
  },

  async reportSymptoms(data: {
    userId: string;
    type?: 'maternal' | 'newborn';
    symptoms: string[];
    notes?: string;
    severity?: string;
  }) {
    const res = await fetch('/api/records/symptom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to report symptoms');
    return await res.json();
  },

  async recordWellbeing(data: {
    userId: string;
    mood: string;
    moodScore: number;
    sleepHours: number;
    anxietyLevel: number;
    notes?: string;
  }) {
    const res = await fetch('/api/records/wellbeing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to record wellbeing');
    return await res.json();
  },

  async logNutrition(data: {
    userId: string;
    waterMl?: number;
    mealItem?: string;
    prenatalVitaminTaken?: boolean;
  }) {
    const res = await fetch('/api/records/nutrition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to log nutrition');
    return await res.json();
  },

  async logFeeding(data: {
    userId: string;
    type: 'breast' | 'formula' | 'mixed';
    side?: 'left' | 'right' | 'both';
    durationMinutes?: number;
    amountMl?: number;
    notes?: string;
  }) {
    const res = await fetch('/api/records/feeding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to log feeding');
    return await res.json();
  },

  async logNewbornHealth(data: {
    userId: string;
    temperatureF: number;
    wetDiapers: number;
    dirtyDiapers: number;
    sleepHours: number;
    jaundiceObservation: string;
    umbilicalCordStatus: string;
    parentObservations?: string;
  }) {
    const res = await fetch('/api/records/newborn-health', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to log newborn health');
    return await res.json();
  },

  async logGrowth(data: {
    userId: string;
    ageWeeks: number;
    weightKg: number;
    lengthCm: number;
    headCircumferenceCm: number;
    notes?: string;
  }) {
    const res = await fetch('/api/records/growth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to record growth measurement');
    return await res.json();
  },

  async updateMedicationStatus(data: {
    medicationId: string;
    status: 'taken' | 'missed';
    date?: string;
    time?: string;
  }) {
    const res = await fetch('/api/records/medication/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update medication');
    return await res.json();
  },

  async addMedication(data: {
    userId: string;
    name: string;
    dose: string;
    frequency: string;
    instructions: string;
    startDate?: string;
    endDate?: string;
    reminderTimes?: string[];
  }) {
    const res = await fetch('/api/records/medication/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to add medication');
    return await res.json();
  },

  async recordVaccination(data: {
    id?: string;
    userId: string;
    vaccineName: string;
    targetAgeDescription?: string;
    dueDate?: string;
    givenDate?: string;
    status?: 'completed' | 'upcoming';
    providerLocation?: string;
    batchNumber?: string;
  }) {
    const res = await fetch('/api/records/vaccination', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to record vaccination');
    return await res.json();
  },

  async scheduleAppointment(data: {
    patientId: string;
    doctorId?: string;
    title: string;
    date: string;
    time: string;
    location?: string;
    type?: 'in_person' | 'telehealth';
    notes?: string;
  }) {
    const res = await fetch('/api/appointments/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to schedule appointment');
    return await res.json();
  },

  async getDoctorAvailability(doctorId: string): Promise<DoctorAvailabilitySlot[]> {
    const res = await fetch(`/api/doctor/${doctorId}/availability`);
    if (!res.ok) throw new Error('Failed to fetch doctor availability');
    const data = await res.json();
    return data.slots;
  },

  async toggleDoctorAvailability(slotId: string): Promise<DoctorAvailabilitySlot> {
    const res = await fetch('/api/doctor/availability/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slotId }),
    });
    if (!res.ok) throw new Error('Failed to toggle availability');
    const data = await res.json();
    return data.slot;
  },

  async addDoctorAvailability(data: {
    doctorId: string;
    date: string;
    time: string;
    notes?: string;
  }): Promise<DoctorAvailabilitySlot> {
    const res = await fetch('/api/doctor/availability/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to add slot');
    const result = await res.json();
    return result.slot;
  },

  async getAlerts(params?: { patientId?: string; status?: 'active' | 'resolved' }): Promise<{ alerts: any[] }> {
    const query = new URLSearchParams();
    if (params?.patientId) query.set('patientId', params.patientId);
    if (params?.status) query.set('status', params.status);
    const url = `/api/alerts${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch alerts');
    return await res.json();
  },

  async reviewAlert(alertId: string, data: { reviewedBy: string; outcomeNotes?: string; actionTaken?: string }) {
    const res = await fetch(`/api/alerts/${alertId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to review alert');
    return await res.json();
  },

  async logTaskAttempt(taskId: string, data: {
    type: 'call' | 'message' | 'visit';
    outcome: 'reached' | 'left_voicemail' | 'no_answer' | 'resolved';
    notes: string;
    loggedBy: string;
  }) {
    const res = await fetch(`/api/tasks/${taskId}/attempt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to log task attempt');
    return await res.json();
  },

  async escalateTask(taskId: string, data: { reason: string; clinicalNotes?: string }) {
    const res = await fetch(`/api/tasks/${taskId}/escalate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to escalate task');
    return await res.json();
  },

  async completeTask(taskId: string, data: { clinicalNotes?: string }) {
    const res = await fetch(`/api/tasks/${taskId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to complete task');
    return await res.json();
  },

  async addCareNote(data: {
    patientId: string;
    authorId: string;
    authorName: string;
    authorRole: 'doctor' | 'nurse';
    noteType?: string;
    content: string;
    followUpDate?: string;
  }) {
    const res = await fetch('/api/care-notes/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to add care note');
    return await res.json();
  },

  async getNotifications(userId: string): Promise<InAppNotification[]> {
    const res = await fetch(`/api/notifications?userId=${userId}`);
    if (!res.ok) throw new Error('Failed to fetch notifications');
    const data = await res.json();
    return data.notifications;
  },

  async markNotificationRead(id?: string, userId?: string) {
    const res = await fetch('/api/notifications/mark-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, userId }),
    });
    return await res.json();
  },

  async runMissedCheckinScan() {
    const res = await fetch('/api/workflows/missed-checkin-scan', {
      method: 'POST',
    });
    return await res.json();
  },

  // Secure server-side Gemini endpoints
  async chatWithGemini(messages: Array<{ role: 'user' | 'model'; content: string }>, patientId?: string): Promise<{ text: string; isUrgentFlag: boolean }> {
    const res = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, patientId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to chat with AI');
    }
    return await res.json();
  },

  async generateWithGemini(prompt: string, patientId?: string): Promise<{ text: string; isUrgentFlag: boolean }> {
    const res = await fetch('/api/gemini/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, patientId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to generate content with AI');
    }
    return await res.json();
  },

  async generateAISummary(patientId: string): Promise<{ summary: string }> {
    const res = await fetch('/api/ai/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to generate summary');
    }
    return await res.json();
  },

  // Agentic AI Core Endpoints
  async runAgentAudit(patientId: string): Promise<{
    patientId: string;
    patientName: string;
    postpartumDay: number;
    overallRiskLevel: string;
    agentActions: Array<{
      agentName: string;
      step: string;
      thought: string;
      actionTaken: string;
      severity: string;
      timestamp: string;
    }>;
    generatedClinicalDirectives: string[];
    suggestedDoctorQuestions: string[];
    autoCreatedTask?: {
      id: string;
      title: string;
      priority: string;
      reason: string;
    };
    summaryReport: string;
  }> {
    const res = await fetch('/api/agents/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to execute multi-agent audit');
    }
    return await res.json();
  },

  async submitConversationalLog(userId: string, transcript: string): Promise<{
    extractedData: {
      bloodPressure?: { systolic: number; diastolic: number };
      symptoms?: string[];
      waterLoggedMl?: number;
      feedLogged?: { type: string; duration: number };
      mood?: string;
    };
    agentResponse: string;
    isUrgentFlag: boolean;
    actionsExecuted: string[];
  }> {
    const res = await fetch('/api/agents/conversational-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, transcript }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to process conversational log');
    }
    return await res.json();
  },
};
