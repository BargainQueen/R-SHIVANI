import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

import {
  users,
  motherProfiles,
  medications,
  bloodPressureLogs,
  symptomReports,
  wellbeingCheckins,
  nutritionHydrationLogs,
  feedingLogs,
  vaccinationRecords,
  newbornHealthLogs,
  growthRecords,
  appointments,
  careAlerts,
  followupTasks,
  clinicalCareNotes,
  inAppNotifications,
  auditLogs,
  evaluateBloodPressure,
  evaluateMaternalSymptoms,
  runMissedCheckinScan,
  getPostpartumDay,
  doctorAvailabilitySlots,
  getDoctorAvailability,
  toggleSlotAvailability,
  addDoctorSlot,
  triggerAbnormalHealthWorkflow,
} from './server/dataStore';

import { chatWithGemini, generateClinicalCareSummary } from './server/geminiService';
import { runMultiAgentAudit, processConversationalLog } from './server/agentService';
import { User, BloodPressureLog, SymptomReport, FollowupTask, CareAlert, DoctorAvailabilitySlot, AutoScheduleResult } from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // -------------------------------------------------------------
  // API Routes
  // -------------------------------------------------------------

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'Postpartum Care Connect API',
      timestamp: new Date().toISOString(),
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
    });
  });

  // GET Users (Demo Accounts)
  app.get('/api/users', (_req: Request, res: Response) => {
    res.json({ users });
  });

  // Auth: Login / Switch User
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, role, userId } = req.body;
    let foundUser: User | undefined;

    if (userId) {
      foundUser = users.find((u) => u.id === userId);
    } else if (email) {
      foundUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    } else if (role) {
      foundUser = users.find((u) => u.role === role);
    }

    if (!foundUser) {
      // Default to first user if not found
      foundUser = users[0];
    }

    auditLogs.push({
      id: `aud_${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorId: foundUser.id,
      actorName: foundUser.name,
      actorRole: foundUser.role,
      action: 'USER_LOGIN',
      targetPatientId: foundUser.role === 'mother' ? foundUser.id : 'ALL',
      details: `User logged in with role ${foundUser.role}`,
    });

    res.json({ user: foundUser });
  });

  // Auth: Register New User
  app.post('/api/auth/register', (req: Request, res: Response) => {
    const { name, email, role, phone, babyName, babyDob, deliveryType } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ error: 'Name, email, and role are required' });
    }

    const newUserId = `usr_${role}_${Date.now()}`;
    const newUser: User = {
      id: newUserId,
      name,
      email,
      role,
      phone: phone || '(555) 000-0000',
      assignedDoctorId: 'usr_doc_1',
      assignedNurseId: 'usr_nurse_1',
    };

    users.push(newUser);

    if (role === 'mother') {
      const newProf = {
        id: `prof_${newUserId}`,
        userId: newUserId,
        patientName: name,
        babyName: babyName || 'Baby',
        babyGender: 'male' as const,
        babyDob: babyDob || new Date().toISOString().split('T')[0],
        deliveryType: (deliveryType === 'Cesarean' ? 'Cesarean' : 'Vaginal') as 'Vaginal' | 'Cesarean',
        gestationalAgeWeeks: 39,
        birthWeightGrams: 3200,
        birthLengthCm: 50.0,
        bloodType: 'O+',
        emergencyContact: {
          name: 'Partner',
          relationship: 'Emergency Contact',
          phone: phone || '(555) 000-0000',
        },
        deliveryHospital: 'Community Maternity Center',
        dischargeDate: new Date().toISOString().split('T')[0],
        assignedDoctorName: 'Dr. Sarah Jenkins, MD',
        assignedNurseName: 'Carlos Mendoza, RN',
        allergies: [],
      };
      motherProfiles.push(newProf);
    }

    res.json({ user: newUser });
  });

  // GET Patients List (Role Based)
  app.get('/api/patients', (req: Request, res: Response) => {
    const userRole = (req.query.role as string) || 'doctor';
    const userId = (req.query.userId as string) || '';

    // If mother, only return herself
    let allowedProfiles = motherProfiles;
    if (userRole === 'mother' && userId) {
      allowedProfiles = motherProfiles.filter((p) => p.userId === userId);
    }

    const patientSummaries = allowedProfiles.map((prof) => {
      const postpartumDay = getPostpartumDay(prof.babyDob);
      const latestBp = bloodPressureLogs
        .filter((b) => b.userId === prof.userId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

      const patientAlerts = careAlerts.filter((a) => a.patientId === prof.userId && !a.reviewed);
      const pendingTasks = followupTasks.filter((t) => t.patientId === prof.userId && t.status !== 'completed');
      const recentCheckin = wellbeingCheckins
        .filter((w) => w.userId === prof.userId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

      // Calculate risk status
      let riskStatus: 'urgent' | 'warning' | 'stable' = 'stable';
      if (patientAlerts.some((a) => a.severity === 'urgent')) {
        riskStatus = 'urgent';
      } else if (patientAlerts.length > 0 || (latestBp && latestBp.status === 'stage1')) {
        riskStatus = 'warning';
      }

      return {
        ...prof,
        postpartumDay,
        latestBp,
        unreadAlertsCount: patientAlerts.length,
        pendingTasksCount: pendingTasks.length,
        riskStatus,
        recentMood: recentCheckin?.mood || 'normal',
      };
    });

    res.json({ patients: patientSummaries });
  });

  // GET Patient Full Clinical Record
  app.get('/api/patient/:id', (req: Request, res: Response) => {
    const patientId = req.params.id;
    const profile = motherProfiles.find((p) => p.userId === patientId);

    if (!profile) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    const patientBp = bloodPressureLogs
      .filter((b) => b.userId === patientId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const patientSymptoms = symptomReports
      .filter((s) => s.userId === patientId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const patientMeds = medications.filter((m) => m.userId === patientId);

    const patientWellbeing = wellbeingCheckins
      .filter((w) => w.userId === patientId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const patientNutrition = nutritionHydrationLogs
      .filter((n) => n.userId === patientId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const patientFeeds = feedingLogs
      .filter((f) => f.userId === patientId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const patientVaccines = vaccinationRecords.filter((v) => v.userId === patientId);

    const patientNewbornHealth = newbornHealthLogs
      .filter((n) => n.userId === patientId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const patientGrowth = growthRecords
      .filter((g) => g.userId === patientId)
      .sort((a, b) => a.ageWeeks - b.ageWeeks);

    const patientAppointments = appointments
      .filter((a) => a.patientId === patientId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const patientAlerts = careAlerts
      .filter((a) => a.patientId === patientId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const patientTasks = followupTasks
      .filter((t) => t.patientId === patientId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const patientNotes = clinicalCareNotes
      .filter((c) => c.patientId === patientId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    res.json({
      profile: {
        ...profile,
        postpartumDay: getPostpartumDay(profile.babyDob),
      },
      bloodPressureLogs: patientBp,
      symptoms: patientSymptoms,
      medications: patientMeds,
      wellbeingCheckins: patientWellbeing,
      nutritionLogs: patientNutrition,
      feedingLogs: patientFeeds,
      vaccinations: patientVaccines,
      newbornHealthLogs: patientNewbornHealth,
      growthRecords: patientGrowth,
      appointments: patientAppointments,
      alerts: patientAlerts,
      followupTasks: patientTasks,
      careNotes: patientNotes,
      doctorAvailability: getDoctorAvailability('usr_doc_1'),
    });
  });

  // Log Blood Pressure (Workflow 2: Rule evaluation & Alert triggering)
  app.post('/api/records/bp', (req: Request, res: Response) => {
    const { userId, systolic, diastolic, pulse, notes } = req.body;

    if (!userId || !systolic || !diastolic) {
      return res.status(400).json({ error: 'User ID, systolic, and diastolic are required' });
    }

    const evaluation = evaluateBloodPressure(Number(systolic), Number(diastolic));
    const timestamp = new Date().toISOString();

    const newLog: BloodPressureLog = {
      id: `bp_${Date.now()}`,
      userId,
      systolic: Number(systolic),
      diastolic: Number(diastolic),
      pulse: pulse ? Number(pulse) : undefined,
      timestamp,
      notes: notes || '',
      status: evaluation.status,
      alertTriggered: evaluation.alertTriggered,
    };

    bloodPressureLogs.push(newLog);

    const profile = motherProfiles.find((p) => p.userId === userId);
    const patientName = profile ? profile.patientName : 'Mother';

    let autoAppointment: AutoScheduleResult | undefined = undefined;

    // If alert triggered, create CareAlert and FollowupTask for care team
    if (evaluation.alertTriggered) {
      const alertSeverity = evaluation.severity || 'warning';
      const newAlert: CareAlert = {
        id: `alt_${Date.now()}`,
        patientId: userId,
        patientName,
        severity: alertSeverity,
        category: 'blood_pressure',
        title: `BP Alert: ${systolic}/${diastolic} mmHg`,
        description: `Patient logged blood pressure ${systolic}/${diastolic} mmHg (${evaluation.status.toUpperCase()}).`,
        guidanceProvided: evaluation.guidance,
        timestamp,
        reviewed: false,
        escalatedToDoctor: alertSeverity === 'urgent',
      };
      careAlerts.push(newAlert);

      // Auto-create task for Nurse
      const newTask: FollowupTask = {
        id: `task_${Date.now()}`,
        patientId: userId,
        patientName,
        assignedToRole: 'nurse',
        priority: alertSeverity === 'urgent' ? 'high' : 'medium',
        title: `Follow up on elevated BP (${systolic}/${diastolic})`,
        reason: `Patient logged elevated reading. Verify rest protocol and symptoms.`,
        dueDate: new Date().toISOString().split('T')[0],
        status: 'pending',
        attempts: [],
        escalatedToDoctor: alertSeverity === 'urgent',
        createdAt: timestamp,
      };
      followupTasks.push(newTask);

      // Automated Appointment Workflow for Abnormal Reading
      autoAppointment = triggerAbnormalHealthWorkflow({
        patientId: userId,
        sourceType: 'blood_pressure',
        readingSummary: `Blood Pressure ${systolic}/${diastolic} mmHg (${evaluation.status.toUpperCase()})`,
        severity: alertSeverity,
        guidance: evaluation.guidance,
        sourceLogId: newLog.id,
      });
    }

    res.json({
      log: newLog,
      evaluation,
      autoAppointment,
    });
  });

  // Report Symptoms (Workflow 2: Warning-sign evaluation)
  app.post('/api/records/symptom', (req: Request, res: Response) => {
    const { userId, type, symptoms, notes, severity } = req.body;

    if (!userId || !symptoms || !Array.isArray(symptoms)) {
      return res.status(400).json({ error: 'User ID and symptoms list are required' });
    }

    const evaluation = evaluateMaternalSymptoms(symptoms);
    const timestamp = new Date().toISOString();

    const report: SymptomReport = {
      id: `sym_${Date.now()}`,
      userId,
      type: type || 'maternal',
      symptoms,
      severity: evaluation.isUrgent ? 'urgent' : severity || 'mild',
      notes: notes || '',
      timestamp,
      isUrgentAlert: evaluation.isUrgent,
      guidanceGiven: evaluation.guidance,
      clinicianReviewed: false,
    };

    symptomReports.push(report);

    const profile = motherProfiles.find((p) => p.userId === userId);
    const patientName = profile ? profile.patientName : 'Mother';

    let autoAppointment: AutoScheduleResult | undefined = undefined;

    if (evaluation.isUrgent) {
      careAlerts.push({
        id: `alt_${Date.now()}`,
        patientId: userId,
        patientName,
        severity: 'urgent',
        category: type === 'newborn' ? 'newborn_warning' : 'maternal_symptom',
        title: `CRITICAL SYMPTOM ALERT: ${symptoms.slice(0, 2).join(', ')}`,
        description: `Urgent red flag symptoms reported: ${symptoms.join(', ')}. Immediate care requested.`,
        guidanceProvided: evaluation.guidance,
        timestamp,
        reviewed: false,
        escalatedToDoctor: true,
      });

      followupTasks.push({
        id: `task_${Date.now()}`,
        patientId: userId,
        patientName,
        assignedToRole: 'nurse',
        priority: 'high',
        title: `URGENT: Red flag symptoms reported (${symptoms[0]})`,
        reason: `Immediate contact required. Symptoms: ${symptoms.join(', ')}`,
        dueDate: new Date().toISOString().split('T')[0],
        status: 'pending',
        attempts: [],
        escalatedToDoctor: true,
        createdAt: timestamp,
      });

      // Automated Appointment Workflow for Abnormal/Urgent Symptoms
      autoAppointment = triggerAbnormalHealthWorkflow({
        patientId: userId,
        sourceType: type === 'newborn' ? 'newborn_warning' : 'maternal_symptom',
        readingSummary: `Critical Symptoms: ${symptoms.slice(0, 2).join(', ')}`,
        severity: 'urgent',
        guidance: evaluation.guidance,
        sourceLogId: report.id,
      });
    }

    res.json({
      report,
      evaluation,
      autoAppointment,
    });
  });

  // Daily Wellbeing Checkin
  app.post('/api/records/wellbeing', (req: Request, res: Response) => {
    const { userId, mood, moodScore, sleepHours, anxietyLevel, notes } = req.body;

    const needsSupport = mood === 'struggling' || mood === 'overwhelmed' || Number(anxietyLevel) >= 4;
    const today = new Date().toISOString().split('T')[0];

    const newCheckin = {
      id: `wb_${Date.now()}`,
      userId,
      date: today,
      timestamp: new Date().toISOString(),
      mood: mood || 'neutral',
      moodScore: Number(moodScore) || 3,
      sleepHours: Number(sleepHours) || 6,
      anxietyLevel: Number(anxietyLevel) || 2,
      notes: notes || '',
      supportResourcesShown: needsSupport,
    };

    wellbeingCheckins.push(newCheckin);

    if (needsSupport) {
      const profile = motherProfiles.find((p) => p.userId === userId);
      followupTasks.push({
        id: `task_wb_${Date.now()}`,
        patientId: userId,
        patientName: profile?.patientName || 'Mother',
        assignedToRole: 'nurse',
        priority: 'medium',
        title: `Emotional Wellbeing Check-in Support`,
        reason: `Mother reported feeling ${mood} with high stress/anxiety (${anxietyLevel}/5). Offer supportive conversation and resources.`,
        dueDate: today,
        status: 'pending',
        attempts: [],
        escalatedToDoctor: false,
        createdAt: new Date().toISOString(),
      });
    }

    res.json({ checkin: newCheckin });
  });

  // Nutrition & Hydration
  app.post('/api/records/nutrition', (req: Request, res: Response) => {
    const { userId, waterMl, mealItem, prenatalVitaminTaken } = req.body;
    const today = new Date().toISOString().split('T')[0];

    let log = nutritionHydrationLogs.find((n) => n.userId === userId && n.date === today);

    if (log) {
      if (typeof waterMl === 'number') {
        log.waterMl += waterMl;
      }
      if (mealItem) {
        log.mealsLogged.push(mealItem);
      }
      if (typeof prenatalVitaminTaken === 'boolean') {
        log.prenatalVitaminTaken = prenatalVitaminTaken;
      }
    } else {
      log = {
        id: `nh_${Date.now()}`,
        userId,
        date: today,
        waterMl: waterMl || 250,
        targetWaterMl: 2800,
        mealsLogged: mealItem ? [mealItem] : [],
        prenatalVitaminTaken: Boolean(prenatalVitaminTaken),
      };
      nutritionHydrationLogs.push(log);
    }

    res.json({ log });
  });

  // Baby Feeding Log
  app.post('/api/records/feeding', (req: Request, res: Response) => {
    const { userId, type, side, durationMinutes, amountMl, notes } = req.body;

    const newFeed = {
      id: `feed_${Date.now()}`,
      userId,
      timestamp: new Date().toISOString(),
      type: type || 'breast',
      side,
      durationMinutes: durationMinutes ? Number(durationMinutes) : undefined,
      amountMl: amountMl ? Number(amountMl) : undefined,
      notes: notes || '',
    };

    feedingLogs.push(newFeed);
    res.json({ feed: newFeed });
  });

  // Newborn Health Log
  app.post('/api/records/newborn-health', (req: Request, res: Response) => {
    const {
      userId,
      temperatureF,
      wetDiapers,
      dirtyDiapers,
      sleepHours,
      jaundiceObservation,
      umbilicalCordStatus,
      parentObservations,
    } = req.body;

    const temp = Number(temperatureF) || 98.6;
    const wet = Number(wetDiapers) || 0;
    const isFever = temp >= 100.4;
    const isDehydrationRisk = wet < 3;
    const urgentAlert = isFever || isDehydrationRisk;

    const newLog = {
      id: `nhl_${Date.now()}`,
      userId,
      timestamp: new Date().toISOString(),
      temperatureF: temp,
      wetDiapers: wet,
      dirtyDiapers: Number(dirtyDiapers) || 0,
      sleepHours: Number(sleepHours) || 0,
      jaundiceObservation: jaundiceObservation || 'none',
      umbilicalCordStatus: umbilicalCordStatus || 'clean_dry',
      parentObservations: parentObservations || '',
      urgentAlert,
    };

    newbornHealthLogs.push(newLog);

    let autoAppointment: AutoScheduleResult | undefined = undefined;

    if (urgentAlert) {
      const profile = motherProfiles.find((p) => p.userId === userId);
      const patientName = profile ? profile.patientName : 'Mother';

      careAlerts.push({
        id: `alt_${Date.now()}`,
        patientId: userId,
        patientName,
        severity: 'urgent',
        category: 'newborn_warning',
        title: isFever ? `NEONATAL FEVER (${temp}°F)` : `NEONATAL HYDRATION CONCERN (<3 Wet Diapers)`,
        description: isFever
          ? `Infant fever of ${temp}°F reported. Any fever ≥100.4°F in neonates under 3 months is an emergency.`
          : `Only ${wet} wet diapers reported in 24 hours. Immediate hydration assessment needed.`,
        guidanceProvided: isFever
          ? 'EMERGENCY: Contact your pediatrician or go to Pediatric Emergency immediately. Do NOT give infant fever reducers without clinical direction.'
          : 'URGENT: Call pediatrician for same-day weight & hydration assessment.',
        timestamp: new Date().toISOString(),
        reviewed: false,
        escalatedToDoctor: true,
      });

      // Automated Appointment Workflow for Abnormal Newborn Reading
      autoAppointment = triggerAbnormalHealthWorkflow({
        patientId: userId,
        sourceType: 'newborn_warning',
        readingSummary: isFever ? `Neonatal Fever (${temp}°F)` : `Low Wet Diapers (${wet} in 24h)`,
        severity: 'urgent',
        guidance: isFever ? 'Emergency pediatric evaluation required.' : 'Urgent pediatric hydration assessment.',
        sourceLogId: newLog.id,
      });
    }

    res.json({ log: newLog, urgentAlert, autoAppointment });
  });

  // Newborn Growth Record
  app.post('/api/records/growth', (req: Request, res: Response) => {
    const { userId, ageWeeks, weightKg, lengthCm, headCircumferenceCm, notes } = req.body;

    const record = {
      id: `gw_${Date.now()}`,
      userId,
      date: new Date().toISOString().split('T')[0],
      ageWeeks: Number(ageWeeks) || 1,
      weightKg: Number(weightKg),
      lengthCm: Number(lengthCm),
      headCircumferenceCm: Number(headCircumferenceCm),
      percentileApprox: 'WHO Growth Standards compliant',
      notes: notes || '',
    };

    growthRecords.push(record);
    res.json({ record });
  });

  // Mark Medication Dose Status
  app.post('/api/records/medication/status', (req: Request, res: Response) => {
    const { medicationId, status, date, time } = req.body;

    const med = medications.find((m) => m.id === medicationId);
    if (!med) {
      return res.status(404).json({ error: 'Medication not found' });
    }

    const today = date || new Date().toISOString().split('T')[0];
    const logTime = time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    med.logs.push({
      id: `log_${Date.now()}`,
      date: today,
      time: logTime,
      status: status || 'taken',
    });

    res.json({ medication: med });
  });

  // Add New Medication
  app.post('/api/records/medication/add', (req: Request, res: Response) => {
    const { userId, name, dose, frequency, instructions, startDate, endDate, reminderTimes } = req.body;

    if (!userId || !name || !dose) {
      return res.status(400).json({ error: 'User ID, name, and dose are required' });
    }

    const newMed = {
      id: `med_${Date.now()}`,
      userId,
      name,
      dose,
      frequency: frequency || 'Daily',
      instructions: instructions || 'Take as prescribed by clinician',
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || '',
      reminderTimes: reminderTimes || ['09:00'],
      logs: [],
    };

    medications.push(newMed);
    res.json({ medication: newMed });
  });

  // Record / Update Vaccination
  app.post('/api/records/vaccination', (req: Request, res: Response) => {
    const { id, userId, vaccineName, targetAgeDescription, dueDate, givenDate, status, providerLocation, batchNumber } =
      req.body;

    if (id) {
      const existing = vaccinationRecords.find((v) => v.id === id);
      if (existing) {
        existing.status = status || 'completed';
        existing.givenDate = givenDate || new Date().toISOString().split('T')[0];
        if (providerLocation) existing.providerLocation = providerLocation;
        if (batchNumber) existing.batchNumber = batchNumber;
        return res.json({ record: existing });
      }
    }

    const newRecord = {
      id: `vac_${Date.now()}`,
      userId,
      vaccineName,
      targetAgeDescription: targetAgeDescription || 'Configurable',
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      givenDate,
      status: status || 'completed',
      providerLocation,
      batchNumber,
    };

    vaccinationRecords.push(newRecord);
    res.json({ record: newRecord });
  });

  // Schedule Appointment
  app.post('/api/appointments/schedule', (req: Request, res: Response) => {
    const { patientId, doctorId, title, date, time, location, type, notes } = req.body;

    const patient = motherProfiles.find((p) => p.userId === patientId);
    const doctor = users.find((u) => u.id === doctorId) || users.find((u) => u.role === 'doctor');

    const newApt = {
      id: `apt_${Date.now()}`,
      patientId,
      patientName: patient?.patientName || 'Patient',
      doctorId: doctor?.id || 'usr_doc_1',
      doctorName: doctor?.name || 'Dr. Sarah Jenkins, MD',
      title: title || 'Postpartum Follow-up Visit',
      date,
      time,
      location: location || 'Suite 402, Women’s Health Clinic',
      type: type || 'in_person',
      status: 'scheduled' as const,
      notes,
    };

    appointments.push(newApt);

    inAppNotifications.push({
      id: `notif_${Date.now()}`,
      userId: patientId,
      title: `New Appointment Scheduled: ${newApt.title}`,
      message: `Date: ${date} at ${time}. Location: ${newApt.location}`,
      type: 'appointment',
      read: false,
      timestamp: new Date().toISOString(),
      linkSection: 'appointments',
    });

    res.json({ appointment: newApt });
  });

  // GET Doctor Availability
  app.get('/api/doctor/:id/availability', (req: Request, res: Response) => {
    const doctorId = req.params.id;
    const slots = getDoctorAvailability(doctorId);
    res.json({ slots });
  });

  // Toggle Doctor Slot Availability (Available <-> Unavailable)
  app.post('/api/doctor/availability/toggle', (req: Request, res: Response) => {
    const { slotId } = req.body;
    if (!slotId) {
      return res.status(400).json({ error: 'slotId is required' });
    }
    const slot = toggleSlotAvailability(slotId);
    if (!slot) {
      return res.status(404).json({ error: 'Slot not found' });
    }
    res.json({ slot });
  });

  // Add New Doctor Availability Slot
  app.post('/api/doctor/availability/add', (req: Request, res: Response) => {
    const { doctorId, date, time, notes } = req.body;
    if (!doctorId || !date || !time) {
      return res.status(400).json({ error: 'doctorId, date, and time are required' });
    }
    const newSlot = addDoctorSlot({
      doctorId,
      date,
      time,
      available: true,
      notes: notes || 'Open clinic slot',
    });
    res.json({ slot: newSlot });
  });

  // Get All Care Alerts (with auto-sorting and patient enrichment)
  app.get('/api/alerts', (req: Request, res: Response) => {
    const { patientId, status } = req.query;

    let alerts = [...careAlerts];
    if (patientId) {
      alerts = alerts.filter((a) => a.patientId === patientId);
    }
    if (status === 'active') {
      alerts = alerts.filter((a) => !a.reviewed);
    } else if (status === 'resolved') {
      alerts = alerts.filter((a) => a.reviewed);
    }

    // Enrich with patient metadata
    const enriched = alerts.map((alert) => {
      const profile = motherProfiles.find((p) => p.userId === alert.patientId);
      const postDay = profile ? getPostpartumDay(profile.babyDob) : 1;
      return {
        ...alert,
        postpartumDay: postDay,
        babyName: profile?.babyName,
        deliveryType: profile?.deliveryType,
        emergencyPhone: profile?.emergencyContact?.phone,
        assignedDoctorName: profile?.assignedDoctorName,
        assignedNurseName: profile?.assignedNurseName,
      };
    });

    // Auto-sort:
    // 1. Unreviewed (active) before reviewed (resolved)
    // 2. Severity: urgent (1) -> warning (2) -> info (3)
    // 3. Timestamp: descending (newest first)
    const severityRank: Record<string, number> = { urgent: 1, warning: 2, info: 3 };
    enriched.sort((a, b) => {
      if (a.reviewed !== b.reviewed) {
        return a.reviewed ? 1 : -1;
      }
      const rankA = severityRank[a.severity] || 4;
      const rankB = severityRank[b.severity] || 4;
      if (rankA !== rankB) {
        return rankA - rankB;
      }
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    res.json({ alerts: enriched });
  });

  // Review / Close Alert
  app.post('/api/alerts/:id/review', (req: Request, res: Response) => {
    const alertId = req.params.id;
    const { reviewedBy, outcomeNotes, actionTaken } = req.body;

    const alert = careAlerts.find((a) => a.id === alertId);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    const resolutionSummary = actionTaken
      ? `[Action: ${actionTaken}] ${outcomeNotes || 'Issue addressed by clinician.'}`
      : outcomeNotes || 'Reviewed and documented in patient record.';

    alert.reviewed = true;
    alert.reviewedBy = reviewedBy || 'Clinician';
    alert.reviewedAt = new Date().toISOString();
    alert.outcomeNotes = resolutionSummary;

    // Synchronize resolution with any matching symptom reports
    const matchedSymptoms = symptomReports.filter(
      (s) => s.userId === alert.patientId && !s.clinicianReviewed
    );
    for (const sym of matchedSymptoms) {
      sym.clinicianReviewed = true;
      sym.clinicianNotes = `Resolved via Care Alert: ${resolutionSummary} (Reviewed by ${alert.reviewedBy})`;
    }

    // Create Audit Log
    auditLogs.push({
      id: `aud_${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorId: 'clinician',
      actorName: alert.reviewedBy || 'Clinician',
      actorRole: alert.reviewedBy?.includes('RN') ? 'nurse' : 'doctor',
      action: 'REVIEW_ALERT',
      targetPatientId: alert.patientId,
      details: `Alert "${alert.title}" resolved: ${alert.outcomeNotes}`,
    });

    res.json({ alert });
  });

  // Record Follow-up Task Attempt (Nurse workflow)
  app.post('/api/tasks/:id/attempt', (req: Request, res: Response) => {
    const taskId = req.params.id;
    const { type, outcome, notes, loggedBy } = req.body;

    const task = followupTasks.find((t) => t.id === taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const newAttempt = {
      id: `att_${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: type || 'call',
      outcome: outcome || 'reached',
      notes: notes || '',
      loggedBy: loggedBy || 'Carlos Mendoza, RN',
    };

    task.attempts.push(newAttempt);
    task.status = outcome === 'resolved' ? 'completed' : 'in_progress';

    res.json({ task });
  });

  // Escalate Task to Doctor
  app.post('/api/tasks/:id/escalate', (req: Request, res: Response) => {
    const taskId = req.params.id;
    const { reason, clinicalNotes } = req.body;

    const task = followupTasks.find((t) => t.id === taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    task.escalatedToDoctor = true;
    task.assignedToRole = 'doctor';
    task.priority = 'high';
    task.clinicalNotes = `${task.clinicalNotes ? task.clinicalNotes + ' | ' : ''}Escalated: ${reason || clinicalNotes}`;

    res.json({ task });
  });

  // Complete Task
  app.post('/api/tasks/:id/complete', (req: Request, res: Response) => {
    const taskId = req.params.id;
    const { clinicalNotes } = req.body;

    const task = followupTasks.find((t) => t.id === taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    task.status = 'completed';
    if (clinicalNotes) task.clinicalNotes = clinicalNotes;

    res.json({ task });
  });

  // Add Clinical Care Note
  app.post('/api/care-notes/add', (req: Request, res: Response) => {
    const { patientId, authorId, authorName, authorRole, noteType, content, followUpDate } = req.body;

    if (!patientId || !content) {
      return res.status(400).json({ error: 'Patient ID and note content are required' });
    }

    const newNote = {
      id: `note_${Date.now()}`,
      patientId,
      authorId: authorId || 'usr_doc_1',
      authorName: authorName || 'Dr. Sarah Jenkins, MD',
      authorRole: authorRole || 'doctor',
      noteType: noteType || 'progress_note',
      content,
      followUpDate,
      timestamp: new Date().toISOString(),
    };

    clinicalCareNotes.push(newNote);
    res.json({ note: newNote });
  });

  // Notifications
  app.get('/api/notifications', (req: Request, res: Response) => {
    const userId = (req.query.userId as string) || '';
    const userNotifs = inAppNotifications.filter((n) => !userId || n.userId === userId);
    res.json({ notifications: userNotifs });
  });

  app.post('/api/notifications/mark-read', (req: Request, res: Response) => {
    const { id, userId } = req.body;
    if (id) {
      const notif = inAppNotifications.find((n) => n.id === id);
      if (notif) notif.read = true;
    } else if (userId) {
      inAppNotifications.filter((n) => n.userId === userId).forEach((n) => (n.read = true));
    }
    res.json({ success: true });
  });

  // Workflow 1: Trigger Missed Check-in Scan
  app.post('/api/workflows/missed-checkin-scan', (_req: Request, res: Response) => {
    const createdTasks = runMissedCheckinScan();
    res.json({
      success: true,
      tasksGenerated: createdTasks.length,
      tasks: createdTasks,
    });
  });

  // -------------------------------------------------------------
  // SECURE SERVER-SIDE GEMINI API ROUTES
  // Interacts with Google Gemini API using process.env.GEMINI_API_KEY
  // Frontend never receives or handles API secrets directly.
  // -------------------------------------------------------------

  // Secure Route: /api/gemini/chat
  app.post('/api/gemini/chat', async (req: Request, res: Response) => {
    const { messages, patientId, userRole } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Valid messages array is required' });
    }

    // Safely extract authorized patient context
    let patientContext = '';
    if (patientId) {
      const profile = motherProfiles.find((p) => p.userId === patientId);
      if (profile) {
        const bp = bloodPressureLogs.filter((b) => b.userId === patientId).slice(-2);
        const meds = medications.filter((m) => m.userId === patientId);
        patientContext = `Patient Name: ${profile.patientName}, Postpartum Day: ${getPostpartumDay(
          profile.babyDob
        )}, Delivery: ${profile.deliveryType}, Baby Name: ${profile.babyName}. Active Meds: ${meds
          .map((m) => m.name + ' ' + m.dose)
          .join(', ')}. Recent BP readings: ${bp.map((b) => `${b.systolic}/${b.diastolic}`).join(', ')}.`;
      }
    }

    try {
      const result = await chatWithGemini({ messages, patientContext });
      res.json({
        ...result,
        source: 'server-side-gemini-proxy',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({
        text: 'The secure AI service encountered an issue. Please contact your maternity nurse or physician directly for questions.',
        error: msg,
        isUrgentFlag: false,
      });
    }
  });

  // Secure Route: /api/gemini/generate
  app.post('/api/gemini/generate', async (req: Request, res: Response) => {
    const { prompt, patientId } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Valid prompt string is required' });
    }

    try {
      const result = await chatWithGemini({
        messages: [{ role: 'user', content: prompt }],
        patientContext: patientId ? `Patient ID: ${patientId}` : undefined,
      });
      res.json({
        text: result.text,
        isUrgentFlag: result.isUrgentFlag,
        source: 'server-side-gemini-proxy',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: msg });
    }
  });

  // Gemini AI Chat (Chatbot integration alias)
  app.post('/api/ai/chat', async (req: Request, res: Response) => {
    const { messages, patientId } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Prepare patient context safely
    let patientContext = '';
    if (patientId) {
      const profile = motherProfiles.find((p) => p.userId === patientId);
      if (profile) {
        const bp = bloodPressureLogs.filter((b) => b.userId === patientId).slice(-2);
        const meds = medications.filter((m) => m.userId === patientId);
        patientContext = `Patient Name: ${profile.patientName}, Postpartum Day: ${getPostpartumDay(
          profile.babyDob
        )}, Delivery: ${profile.deliveryType}, Baby Name: ${profile.babyName}. Active Meds: ${meds
          .map((m) => m.name + ' ' + m.dose)
          .join(', ')}. Recent BP readings: ${bp.map((b) => `${b.systolic}/${b.diastolic}`).join(', ')}.`;
      }
    }

    try {
      const result = await chatWithGemini({ messages, patientContext });
      res.json(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({
        text: 'Sorry, the AI service encountered an issue. Please contact your maternity nurse or physician directly for questions.',
        error: msg,
        isUrgentFlag: false,
      });
    }
  });

  // Workflow 3: AI Clinical Care Summary & Follow-up Prep
  app.post('/api/ai/summarize', async (req: Request, res: Response) => {
    const { patientId } = req.body;

    const profile = motherProfiles.find((p) => p.userId === patientId);
    if (!profile) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    const data = {
      patientProfile: {
        ...profile,
        postpartumDay: getPostpartumDay(profile.babyDob),
      },
      bpLogs: bloodPressureLogs.filter((b) => b.userId === patientId).slice(-5),
      symptoms: symptomReports.filter((s) => s.userId === patientId).slice(-5),
      wellbeing: wellbeingCheckins.filter((w) => w.userId === patientId).slice(-3),
      medications: medications.filter((m) => m.userId === patientId),
      feedingLogs: feedingLogs.filter((f) => f.userId === patientId).slice(-5),
      newbornHealthLogs: newbornHealthLogs.filter((n) => n.userId === patientId).slice(-3),
    };

    try {
      const summary = await generateClinicalCareSummary(data);

      auditLogs.push({
        id: `aud_${Date.now()}`,
        timestamp: new Date().toISOString(),
        actorId: 'clinician',
        actorName: 'Clinician User',
        actorRole: 'doctor',
        action: 'GENERATE_AI_CARE_SUMMARY',
        targetPatientId: patientId,
        details: 'Generated structured AI clinical summary for review',
      });

      res.json({ summary });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: msg });
    }
  });

  // -------------------------------------------------------------
  // AGENTIC AI CORE WORKFLOWS
  // -------------------------------------------------------------

  // Run Autonomous Multi-Agent Audit for a patient
  app.post('/api/agents/audit', async (req: Request, res: Response) => {
    const { patientId } = req.body;
    try {
      const auditResult = await runMultiAgentAudit(patientId || 'usr_mother_1');
      res.json(auditResult);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: msg });
    }
  });

  // Conversational NLP Logger (Agentic extraction of vitals, symptoms, feeds, and hydration)
  app.post('/api/agents/conversational-log', async (req: Request, res: Response) => {
    const { userId, transcript } = req.body;
    if (!transcript) {
      return res.status(400).json({ error: 'Transcript is required' });
    }
    try {
      const result = await processConversationalLog({
        userId: userId || 'usr_mother_1',
        transcript,
      });
      res.json(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: msg });
    }
  });

  // -------------------------------------------------------------
  // Vite Integration (Dev) vs Static Files (Prod)
  // -------------------------------------------------------------

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Postpartum Care Connect server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
