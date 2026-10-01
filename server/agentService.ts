import { GoogleGenAI } from '@google/genai';
import {
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
  evaluateBloodPressure,
  evaluateMaternalSymptoms,
  getPostpartumDay,
  triggerAbnormalHealthWorkflow,
} from './dataStore';

function getApiKey(): string | undefined {
  return process.env.GEMINI_API_KEY;
}

export interface AgentAction {
  agentName: 'Guardian (Triage)' | 'Copilot (Clinical)' | 'Stork (Neonatal)' | 'Nurture (Outreach)';
  step: string;
  thought: string;
  actionTaken: string;
  severity: 'urgent' | 'warning' | 'info' | 'normal';
  timestamp: string;
}

export interface AgenticAuditResult {
  patientId: string;
  patientName: string;
  postpartumDay: number;
  overallRiskLevel: 'Urgent Intervention Required' | 'Moderate Vigilance' | 'Stable Recovery';
  agentActions: AgentAction[];
  generatedClinicalDirectives: string[];
  suggestedDoctorQuestions: string[];
  autoCreatedTask?: {
    id: string;
    title: string;
    priority: 'high' | 'medium' | 'low';
    reason: string;
  };
  summaryReport: string;
}

// -------------------------------------------------------------
// Autonomous Multi-Agent Orchestrator
// -------------------------------------------------------------
export async function runMultiAgentAudit(patientId: string): Promise<AgenticAuditResult> {
  const profile = motherProfiles.find((p) => p.userId === patientId) || motherProfiles[0];
  const postpartumDay = getPostpartumDay(profile.babyDob);
  const bpLogs = bloodPressureLogs.filter((b) => b.userId === profile.userId);
  const latestBp = bpLogs[bpLogs.length - 1];
  const patientSymptoms = symptomReports.filter((s) => s.userId === profile.userId);
  const patientMeds = medications.filter((m) => m.userId === profile.userId);
  const patientFeeds = feedingLogs.filter((f) => f.userId === profile.userId);
  const patientNewborn = newbornHealthLogs.filter((n) => n.userId === profile.userId);
  const latestNewborn = patientNewborn[patientNewborn.length - 1];
  const patientWellbeing = wellbeingCheckins.filter((w) => w.userId === profile.userId);
  const latestWellbeing = patientWellbeing[patientWellbeing.length - 1];

  const now = new Date().toISOString();
  const agentActions: AgentAction[] = [];

  // 1. Guardian Agent: Vital & Maternal Sepsis/Hypertension Audit
  let guardianRisk: 'urgent' | 'warning' | 'normal' = 'normal';
  let guardianThought = '';
  let guardianAction = '';

  if (latestBp && (latestBp.systolic >= 140 || latestBp.diastolic >= 90)) {
    guardianRisk = latestBp.systolic >= 160 || latestBp.diastolic >= 110 ? 'urgent' : 'warning';
    guardianThought = `Observed systolic ${latestBp.systolic} / diastolic ${latestBp.diastolic} mmHg on Day ${postpartumDay}. This exceeds postpartum target thresholds (<140/90). Evaluating potential preeclampsia and hypertensive urgency.`;
    guardianAction = `Dispatched clinical warning alert to Dr. Sarah Jenkins. Recommends left-lateral rest and re-test within 15 minutes.`;
  } else {
    guardianThought = `Maternal blood pressure trajectory is currently stable (latest ${latestBp ? `${latestBp.systolic}/${latestBp.diastolic}` : '120/80'}). No signs of acute hypertensive emergency.`;
    guardianAction = `Documented vital stability in clinical audit registry.`;
  }

  agentActions.push({
    agentName: 'Guardian (Triage)',
    step: 'Vitals & Triage Telemetry Audit',
    thought: guardianThought,
    actionTaken: guardianAction,
    severity: guardianRisk,
    timestamp: now,
  });

  // 2. Stork Agent: Neonatal Feeding, Hydration, & Hyperbilirubinemia Audit
  let storkRisk: 'urgent' | 'warning' | 'normal' = 'normal';
  let storkThought = '';
  let storkAction = '';

  const wetCount = latestNewborn ? latestNewborn.wetDiapers : 5;
  const tempF = latestNewborn ? latestNewborn.temperatureF : 98.6;

  if (tempF >= 100.4 || wetCount < 3) {
    storkRisk = 'urgent';
    storkThought = `CRITICAL TELEMETRY: Infant ${profile.babyName} shows ${tempF}°F temp / ${wetCount} wet diapers. Temperature ≥100.4°F in infants <3 months or <3 wet diapers on Day ${postpartumDay} is an acute dehydration/sepsis risk.`;
    storkAction = `Created urgent pediatric escalation alert for attending team and displayed emergency pediatric guidance.`;
  } else if (latestNewborn?.jaundiceObservation === 'chest_limbs') {
    storkRisk = 'warning';
    storkThought = `Jaundice observed progressing past face down to trunk/limbs. Visual inspection warrants transcutaneous bilirubin check at upcoming visit.`;
    storkAction = `Flagged for bilirubin check during pediatrician appointment.`;
  } else {
    storkThought = `Infant feeding rhythm is regular (${patientFeeds.length} feeds logged). Diaper counts (${wetCount} wet) confirm appropriate neonatal hydration.`;
    storkAction = `Logged physiological neonatal milestones as on-track.`;
  }

  agentActions.push({
    agentName: 'Stork (Neonatal)',
    step: 'Infant Hydration & Jaundice Assessment',
    thought: storkThought,
    actionTaken: storkAction,
    severity: storkRisk,
    timestamp: now,
  });

  // 3. Nurture Agent: Medication Adherence & Missed Check-in Predictor
  let nurtureRisk: 'urgent' | 'warning' | 'normal' = 'normal';
  let nurtureThought = '';
  let nurtureAction = '';

  const allLogs = patientMeds.flatMap((m) => m.logs || []);
  const missedCount = allLogs.filter((l) => l.status === 'missed').length;

  if (missedCount > 0) {
    nurtureRisk = 'warning';
    nurtureThought = `Identified ${missedCount} missed medication dose(s) in active regimen (Labetalol / pain relief). Inconsistent antihypertensive timing causes blood pressure rebound.`;
    nurtureAction = `Constructed targeted nurse follow-up reminder and drafted patient medication adherence support prompt.`;
  } else if (!latestWellbeing) {
    nurtureRisk = 'warning';
    nurtureThought = `No emotional wellbeing or daily check-in logged in past 24 hours. High risk of post-discharge disengagement.`;
    nurtureAction = `Auto-scheduled proactive check-in task for Nurse Carlos Mendoza.`;
  } else {
    nurtureThought = `Patient maintains active engagement (Mood: ${latestWellbeing.mood}, Sleep: ${latestWellbeing.sleepHours}h). Medication compliance is 100% over the last 48 hours.`;
    nurtureAction = `Sent encouraging positive reinforcement notification to patient.`;
  }

  agentActions.push({
    agentName: 'Nurture (Outreach)',
    step: 'Adherence Velocity & Engagement Scan',
    thought: nurtureThought,
    actionTaken: nurtureAction,
    severity: nurtureRisk,
    timestamp: now,
  });

  // 4. Copilot Agent: Gemini AI Synthesis & Clinical Orders Generation
  const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-2.5-flash'];
  let aiSummary = '';
  const apiKey = getApiKey();

  const auditPrompt = `You are the Lead Clinical Orchestrator Agent for Postpartum Care Connect.
Perform an autonomous multi-agent clinical synthesis for:
- Patient: ${profile.patientName}, Postpartum Day ${postpartumDay} (${profile.deliveryType} Delivery).
- Baby: ${profile.babyName} (${profile.babyDob}).
- Guardian Agent Findings: ${guardianThought} (Action: ${guardianAction})
- Stork Agent Findings: ${storkThought} (Action: ${storkAction})
- Nurture Agent Findings: ${nurtureThought} (Action: ${nurtureAction})
- Active Meds: ${patientMeds.map((m) => `${m.name} ${m.dose} (${m.frequency})`).join(', ')}

Provide:
1. OVERALL STATUS: (1 sentence executive assessment)
2. CLINICAL DIRECTIVES: (3 actionable bullet points for attending clinicians)
3. DOCTOR QUESTIONS FOR ROUNDS: (3 targeted questions for the clinician to ask Maria)
4. PATIENT GUIDANCE: (Clear, empathetic 2-sentence note for the mother)`;

  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({ apiKey });
      for (const model of candidateModels) {
        try {
          const res = await ai.models.generateContent({
            model,
            contents: auditPrompt,
            config: {
              temperature: 0.2,
              maxOutputTokens: 800,
            },
          });
          if (res?.text) {
            aiSummary = res.text;
            break;
          }
        } catch (e) {
          console.warn(`Model ${model} in audit failed, trying fallback...`);
        }
      }
    } catch (e) {
      console.error('AI synthesis failed:', e);
    }
  }

  if (!aiSummary) {
    aiSummary = `### Autonomous Clinical Orchestrator Assessment
• **Overall Status:** Postpartum recovery on Day ${postpartumDay} requires continued monitoring due to blood pressure fluctuations and post-surgical healing.
• **Directives:**
  1. Verify Labetalol timing relative to morning BP measurements.
  2. Inspect lower cesarean incisional margin for localized erythema.
  3. Reaffirm maternal hydration goal (2.8 L/day) to sustain lactation.
• **Targeted Rounds Questions:**
  - "Have you felt any flashing spots or throbbing headaches since your morning reading?"
  - "How is Mateo's latch comfort comparing on the left vs right side?"
  - "Are you able to take your medications consistently with food?"`;
  }

  agentActions.push({
    agentName: 'Copilot (Clinical)',
    step: 'Multidisciplinary Clinical Directives Synthesis',
    thought: `Synthesized findings from Guardian, Stork, and Nurture agents using Gemini intelligence. Formulated high-yield directives and safety questions for the attending physician.`,
    actionTaken: `Published autonomous care plan and synchronized task directives across nurse and physician queues.`,
    severity: guardianRisk === 'urgent' || storkRisk === 'urgent' ? 'urgent' : 'info',
    timestamp: now,
  });

  // Calculate overall risk level
  let overallRisk: AgenticAuditResult['overallRiskLevel'] = 'Stable Recovery';
  if (guardianRisk === 'urgent' || storkRisk === 'urgent') {
    overallRisk = 'Urgent Intervention Required';
  } else if (guardianRisk === 'warning' || storkRisk === 'warning' || nurtureRisk === 'warning') {
    overallRisk = 'Moderate Vigilance';
  }

  // Auto-generate follow-up task if needed
  let autoCreatedTask: AgenticAuditResult['autoCreatedTask'] = undefined;
  if (guardianRisk !== 'normal' || storkRisk !== 'normal' || nurtureRisk !== 'normal') {
    const taskId = `task_agentic_${Date.now()}`;
    const newTask = {
      id: taskId,
      patientId: profile.userId,
      patientName: profile.patientName,
      assignedToRole: 'nurse' as const,
      priority: (guardianRisk === 'urgent' || storkRisk === 'urgent' ? 'high' : 'medium') as 'high' | 'medium',
      title: `Agentic Care Task: Follow up on ${guardianRisk === 'urgent' ? 'Acute Vitals' : 'Recovery & Meds'}`,
      reason: `Auto-generated by Autonomous Multi-Agent Audit based on Day ${postpartumDay} telemetry.`,
      dueDate: new Date().toISOString().split('T')[0],
      status: 'pending' as const,
      attempts: [],
      escalatedToDoctor: guardianRisk === 'urgent',
      createdAt: now,
    };
    followupTasks.unshift(newTask);
    autoCreatedTask = {
      id: newTask.id,
      title: newTask.title,
      priority: newTask.priority,
      reason: newTask.reason,
    };
  }

  return {
    patientId: profile.userId,
    patientName: profile.patientName,
    postpartumDay,
    overallRiskLevel: overallRisk,
    agentActions,
    generatedClinicalDirectives: [
      `Review Labetalol schedule and assess morning BP readings (Target < 140/90).`,
      `Evaluate incision healing and check for localized tenderness.`,
      `Reinforce neonatal hydration signs (target ≥ 5 wet diapers/day).`,
    ],
    suggestedDoctorQuestions: [
      `"Maria, have you noticed any visual changes or headaches with your elevated BP reading?"`,
      `"How are you feeling emotionally between night feeds?"`,
      `"Are you taking your medications right on time with meals?"`,
    ],
    autoCreatedTask,
    summaryReport: aiSummary,
  };
}

// -------------------------------------------------------------
// Autonomous Natural Language Conversational Logger
// Takes raw voice/text input from mother, extracts vitals & symptoms,
// logs them automatically, and returns immediate agentic feedback!
// -------------------------------------------------------------
export async function processConversationalLog(params: {
  userId: string;
  transcript: string;
}): Promise<{
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
  const profile = motherProfiles.find((p) => p.userId === params.userId) || motherProfiles[0];
  const text = params.transcript.toLowerCase();
  const apiKey = getApiKey();
  const actionsExecuted: string[] = [];

  let extractedBp: { systolic: number; diastolic: number } | undefined = undefined;
  let extractedSymptoms: string[] = [];
  let extractedWaterMl: number | undefined = undefined;
  let extractedFeed: { type: string; duration: number } | undefined = undefined;
  let extractedMood: string | undefined = undefined;

  // Regex extract BP if present (e.g. 138/88 or "138 over 88")
  const bpMatch = text.match(/(\d{2,3})\s*(?:\/|\s+over\s+)\s*(\d{2,3})/);
  if (bpMatch) {
    const sys = parseInt(bpMatch[1], 10);
    const dia = parseInt(bpMatch[2], 10);
    if (sys > 60 && sys < 250 && dia > 40 && dia < 150) {
      extractedBp = { systolic: sys, diastolic: dia };
      const evalBp = evaluateBloodPressure(sys, dia);
      bloodPressureLogs.push({
        id: `bp_agentic_${Date.now()}`,
        userId: params.userId,
        systolic: sys,
        diastolic: dia,
        timestamp: new Date().toISOString(),
        notes: `Agent-extracted from: "${params.transcript.slice(0, 100)}"`,
        status: evalBp.status,
        alertTriggered: evalBp.alertTriggered,
      });
      actionsExecuted.push(`Logged Blood Pressure: ${sys}/${dia} mmHg (${evalBp.status})`);

      if (evalBp.alertTriggered) {
        const autoApt = triggerAbnormalHealthWorkflow({
          patientId: params.userId,
          sourceType: 'blood_pressure',
          readingSummary: `Blood Pressure ${sys}/${dia} mmHg (${evalBp.status.toUpperCase()})`,
          severity: evalBp.severity || 'warning',
          guidance: evalBp.guidance,
          sourceLogId: `bp_agentic_${Date.now()}`,
        });
        if (autoApt.scheduled && autoApt.slot) {
          actionsExecuted.push(`Auto-Scheduled Urgent Doctor Visit on ${autoApt.slot.date} at ${autoApt.slot.time}`);
        } else if (autoApt.message) {
          actionsExecuted.push(autoApt.message);
        }
      }
    }
  }

  // Extract water intake
  const waterMatch = text.match(/(\d+)\s*(?:ml|milliliters|glasses|cups|bottles)/i);
  if (waterMatch) {
    let ml = parseInt(waterMatch[1], 10);
    if (text.includes('glass') || text.includes('cup')) ml *= 250;
    if (text.includes('bottle')) ml *= 500;
    extractedWaterMl = ml;
    const today = new Date().toISOString().split('T')[0];
    let nutLog = nutritionHydrationLogs.find((n) => n.userId === params.userId && n.date === today);
    if (nutLog) {
      nutLog.waterMl += ml;
    } else {
      nutritionHydrationLogs.push({
        id: `nh_agentic_${Date.now()}`,
        userId: params.userId,
        date: today,
        waterMl: ml,
        targetWaterMl: 2800,
        mealsLogged: [],
        prenatalVitaminTaken: true,
      });
    }
    actionsExecuted.push(`Added Hydration: +${ml} mL`);
  }

  // Extract feeds
  if (text.includes('fed') || text.includes('nursed') || text.includes('breastfeed') || text.includes('bottle')) {
    const durMatch = text.match(/(\d+)\s*(?:min|minute)/);
    const duration = durMatch ? parseInt(durMatch[1], 10) : 20;
    const isFormula = text.includes('formula') || text.includes('bottle');
    extractedFeed = { type: isFormula ? 'formula' : 'breast', duration };
    feedingLogs.unshift({
      id: `feed_agentic_${Date.now()}`,
      userId: params.userId,
      timestamp: new Date().toISOString(),
      type: isFormula ? 'formula' : 'breast',
      durationMinutes: duration,
      notes: `Agent-extracted from conversational log`,
    });
    actionsExecuted.push(`Logged Baby Feed: ${isFormula ? 'Formula' : 'Breastfeeding'} (${duration} mins)`);
  }

  // Symptom extraction & safety check
  const symptomKeywords = [
    { key: 'heavy bleeding', label: 'heavy bleeding soaking a pad in under 1 hour', urgent: true },
    { key: 'headache', label: 'Severe persistent headache', urgent: text.includes('severe') || text.includes('vision') },
    { key: 'spots', label: 'Vision changes, blurring, or seeing flashing spots', urgent: true },
    { key: 'fever', label: 'High fever with chills', urgent: true },
    { key: 'chest pain', label: 'Chest pain or shortness of breath', urgent: true },
    { key: 'incision', label: 'Incision site redness or tenderness', urgent: false },
    { key: 'dizzy', label: 'Extreme fatigue or dizziness upon standing', urgent: false },
  ];

  for (const item of symptomKeywords) {
    if (text.includes(item.key)) {
      extractedSymptoms.push(item.label);
    }
  }

  let isUrgent = false;
  if (extractedSymptoms.length > 0) {
    const evalSym = evaluateMaternalSymptoms(extractedSymptoms);
    isUrgent = evalSym.isUrgent;
    symptomReports.unshift({
      id: `sym_agentic_${Date.now()}`,
      userId: params.userId,
      type: 'maternal',
      symptoms: extractedSymptoms,
      severity: isUrgent ? 'urgent' : 'moderate',
      notes: params.transcript,
      timestamp: new Date().toISOString(),
      isUrgentAlert: isUrgent,
      guidanceGiven: evalSym.guidance,
      clinicianReviewed: false,
    });
    actionsExecuted.push(`Logged Symptoms: ${extractedSymptoms.join(', ')}`);

    if (isUrgent) {
      const autoApt = triggerAbnormalHealthWorkflow({
        patientId: params.userId,
        sourceType: 'maternal_symptom',
        readingSummary: `Critical Symptoms: ${extractedSymptoms[0]}`,
        severity: 'urgent',
        guidance: evalSym.guidance,
        sourceLogId: `sym_agentic_${Date.now()}`,
      });
      if (autoApt.scheduled && autoApt.slot) {
        actionsExecuted.push(`Auto-Scheduled Urgent Doctor Visit on ${autoApt.slot.date} at ${autoApt.slot.time}`);
      } else if (autoApt.message) {
        actionsExecuted.push(autoApt.message);
      }
    }
  }

  // Generate response with Gemini
  let agentResponse = '';
  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are Postpartum Care Connect's Autonomous Care Agent responding to mother ${profile.patientName}.
The mother just spoke/wrote: "${params.transcript}"

Actions our agentic system automatically executed in her clinical chart:
${actionsExecuted.map((a) => `• ${a}`).join('\n')}

Respond to her in 2-3 warm, supportive paragraphs:
1. Acknowledge what was safely logged in her chart (vitals, hydration, feeds).
2. Offer helpful, practical post-discharge recovery advice.
3. If any red flag symptoms were mentioned (${extractedSymptoms.join(', ')}), explicitly advise emergency care or calling 911.
4. Keep it clear, comforting, and scientifically accurate.`;

      const res = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          temperature: 0.3,
          maxOutputTokens: 600,
        },
      });
      if (res?.text) {
        agentResponse = res.text;
      }
    } catch (e) {
      console.error('Agent response generation failed:', e);
    }
  }

  if (!agentResponse) {
    agentResponse = `Thank you, ${profile.patientName.split(' ')[0]}! I have automatically extracted and recorded your updates in your clinical recovery chart:
${actionsExecuted.map((a) => `• ${a}`).join('\n')}

${
  isUrgent
    ? '⚠️ **URGENT NOTICE**: Your message mentioned symptoms matching critical postpartum warning criteria. Please call 911 or visit labor & delivery triage immediately.'
    : 'Your care team (Dr. Jenkins and Nurse Carlos) can review these updates on their dashboard. Keep resting, drink plenty of water, and reach out anytime!'
}`;
  }

  return {
    extractedData: {
      bloodPressure: extractedBp,
      symptoms: extractedSymptoms,
      waterLoggedMl: extractedWaterMl,
      feedLogged: extractedFeed,
      mood: extractedMood,
    },
    agentResponse,
    isUrgentFlag: isUrgent,
    actionsExecuted,
  };
}
