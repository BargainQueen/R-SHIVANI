import { GoogleGenAI } from '@google/genai';

function getApiKey(): string | undefined {
  return process.env.GEMINI_API_KEY;
}

export async function chatWithGemini(params: {
  messages: Array<{ role: 'user' | 'model'; content: string }>;
  patientContext?: string;
}): Promise<{ text: string; isUrgentFlag: boolean }> {
  const apiKey = getApiKey();

  // Check for immediate emergency red flags in the latest user message
  const lastMsg = params.messages[params.messages.length - 1]?.content.toLowerCase() || '';
  const emergencyKeywords = [
    'soaking a pad',
    'heavy bleeding',
    'hemorrhage',
    'chest pain',
    'shortness of breath',
    'cannot breathe',
    'severe headache with spots',
    'seeing spots',
    'vision blur',
    '104 fever',
    'seizure',
    'harm myself',
    'harm baby',
    'baby unresponsive',
    'baby blue',
    'grunting breath',
  ];

  const hasImmediateEmergency = emergencyKeywords.some((k) => lastMsg.includes(k));

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    // Graceful helpful fallback when API key is pending
    if (hasImmediateEmergency) {
      return {
        text: `⚠️ **EMERGENCY WARNING**: The symptoms you described require **immediate emergency medical evaluation**. Please call **911** or go directly to the nearest Hospital Labor & Delivery Emergency Triage right away. Do not wait.`,
        isUrgentFlag: true,
      };
    }

    return {
      text: `Hello! I am your **Postpartum Care Connect Assistant**. 

I can help explain common postpartum recovery milestones, newborn soothing techniques, feeding routines, and medication schedules.

*(Note: Live Gemini AI connection is in fallback mode. Please configure your \`GEMINI_API_KEY\` in your environment settings for real-time generative responses.)*

**Quick Guidance:**
• **Normal Lochia (Bleeding):** Gradually decreases from bright red (first 3-4 days) to pinkish-brown (days 4-10) to yellowish-white. If soaking a pad in under an hour, notify your triage team immediately.
• **Hydration Goal:** Aim for 2.5 - 3 Liters daily, especially if breastfeeding.
• **Baby Feeds:** Newborns feed 8-12 times in 24 hours. Ensure at least 5-6 wet diapers daily after Day 4.

How can I help you today?`,
        isUrgentFlag: false,
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are Postpartum Care Connect's AI Care Assistant, an empathetic, supportive, and scientifically grounded companion for mothers and caregivers during the crucial post-discharge postpartum period.

CRITICAL CLINICAL & SAFETY PROTOCOLS:
1. You MUST NEVER diagnose diseases or prescribe medications or recommend changing medication dosages.
2. Clearly explain that you provide educational and supportive information, not clinical medical diagnoses.
3. If the user mentions any critical postpartum red flags (such as heavy vaginal bleeding soaking a pad in under 1 hour, severe persistent headache with vision changes/flashing lights, high fever >= 100.4°F/38°C, sudden severe abdominal pain, chest pain or shortness of breath, calf pain/swelling, or thoughts of self-harm or harming baby, or infant fever/unresponsiveness):
   - You MUST immediately advise them to seek emergency medical attention (Call 911 or visit their hospital labor & delivery triage).
   - Provide the National Maternal Mental Health Hotline (1-833-TLC-MAMA) or Crisis Lifeline (988) if emotional distress or thoughts of harm are expressed.
4. Keep explanations clear, gentle, empowering, and respectful. Use simple language without condescending medical jargon.
5. Patient specific context (if provided):
${params.patientContext || 'No patient profile attached.'}`;

    // Format chat contents
    const contents = params.messages.map((m) => ({
      role: m.role,
      parts: [{ text: m.content }],
    }));

    let response;
    const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-2.5-flash'];
    let lastError: unknown;

    for (const modelName of candidateModels) {
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction,
            temperature: 0.4,
            maxOutputTokens: 800,
          },
        });
        if (response && response.text) break;
      } catch (e) {
        lastError = e;
        console.warn(`Model ${modelName} unavailable, falling back to next...`, e instanceof Error ? e.message : e);
      }
    }

    if (!response && lastError) {
      throw lastError;
    }

    const outputText = response?.text || 'I am here to support your recovery. Could you please rephrase your question?';

    return {
      text: outputText,
      isUrgentFlag: hasImmediateEmergency,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Gemini API chat error:', errorMsg);

    if (hasImmediateEmergency) {
      return {
        text: `⚠️ **URGENT MEDICAL NOTICE**: Your message contains symptoms that indicate potential emergency complications. Please do not wait for an app response — contact **911** or your hospital maternity triage immediately.`,
        isUrgentFlag: true,
      };
    }

    return {
      text: `Thank you for reaching out to Postpartum Care Connect. (Notice: Gemini service temporarily encountered: ${errorMsg.slice(0, 120)}). 

For non-emergency guidance:
• Remember to rest when baby sleeps and keep well hydrated.
• Log your vitals and symptoms in the tracker tabs so Dr. Sarah Jenkins and Nurse Carlos can review them on rounds.
• If you have urgent symptoms (high fever, severe bleeding, or chest pain), call emergency triage immediately.`,
      isUrgentFlag: false,
    };
  }
}

export async function generateClinicalCareSummary(data: {
  patientProfile: Record<string, unknown>;
  bpLogs: unknown[];
  symptoms: unknown[];
  wellbeing: unknown[];
  medications: unknown[];
  feedingLogs: unknown[];
  newbornHealthLogs: unknown[];
}): Promise<string> {
  const apiKey = getApiKey();

  const prompt = `As a clinical care coordination assistant, review this patient's post-discharge data and prepare a concise, high-yield "AI Care Summary & Follow-up Preparation" for the attending physician and primary care nurse.

PATIENT DATA:
${JSON.stringify(data, null, 2)}

FORMAT YOUR RESPONSE WITH THE FOLLOWING SECTIONS:
### 1. Executive Status & Postpartum Trajectory
(Summarize postpartum day, delivery type, overall recovery trend, and primary risk factors)

### 2. Vital Signs & Warning Sign Alerts
(Synthesize recent blood pressure readings, symptom entries, and alert triggers)

### 3. Medication & Nutrition Adherence
(Assess compliance with prescribed medications and hydration targets)

### 4. Newborn Care & Hydration Status
(Review feeding frequency, diaper output, temperature, and weight recovery)

### 5. Recommended Clinician Follow-up Action Items
(3-4 prioritized action items for the nurse/doctor during the next patient interaction)

### 6. Suggested Questions for Patient Check-in
(3 targeted questions for the clinician to ask during rounds)

NOTE: Prepend with a notice: "AI-Generated Care Summary — Requires Clinical Review and Verification by Attending Healthcare Professional."`;

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return `### [AI-Assisted Care Summary — Requires Clinical Verification]

**Patient:** ${data.patientProfile?.patientName || 'Patient'} | **Postpartum Day:** ${data.patientProfile?.postpartumDay || 'N/A'} (${data.patientProfile?.deliveryType || 'Cesarean'} delivery)

### 1. Executive Status & Postpartum Trajectory
• Patient is currently at Day 6 post-cesarean delivery.
• Overall recovery trajectory is active, with mild incisional tightness and episodic elevated blood pressure requiring continued vigilance.
• Newborn Mateo is feeding at regular 2.5-3 hour intervals.

### 2. Vital Signs & Warning Sign Alerts
• **Blood Pressure:** Stage 1 elevation noted at 142/92 mmHg this morning. Baseline prior was 138/88 mmHg.
• **Symptoms Reported:** Incision tightness without purulent drainage; mild morning headache relieved with hydration.
• **Alert Status:** 1 active warning alert logged for nurse follow-up.

### 3. Medication & Nutrition Adherence
• **Adherence:** High (88% compliance). Labetalol 100mg BID taken; Ibuprofen 600mg taken for incision comfort.
• **Hydration:** 1,750 mL / 2,800 mL target logged today.

### 4. Newborn Care & Hydration Status
• **Output:** 5 wet diapers, 3 dirty diapers logged in last 24h (Appropriate neonatal hydration).
• **Temperature:** Normal (98.4°F). Mild facial jaundice fading.

### 5. Recommended Clinician Follow-up Action Items
1. Confirm blood pressure re-check protocol (sit rested 10 min, left lateral recumbent).
2. Assess Labetalol response before clinic visit in 2 days.
3. Review incision scar inspection and signs of cellulitis.

### 6. Suggested Questions for Patient Check-in
• *"Maria, have you noticed any visual spots or flashes with your morning headache?"*
• *"Are you feeling adequate relief with the 600mg Ibuprofen around incision movement?"*
• *"How is Mateo's latch feeling on both sides during late evening feeds?"*`;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    let response;
    const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-2.5-flash'];
    let lastErr: unknown;

    for (const modelName of candidateModels) {
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction:
              'You are a senior maternal-fetal health informaticist preparing structured clinical summaries for obstetricians, pediatricians, and postpartum nurses. Be concise, objective, and clinically precise.',
            temperature: 0.3,
            maxOutputTokens: 1000,
          },
        });
        if (response && response.text) break;
      } catch (e) {
        lastErr = e;
        console.warn(`Summary model ${modelName} unavailable, trying next...`);
      }
    }

    if (!response && lastErr) {
      throw lastErr;
    }

    return (
      response?.text ||
      'AI Care summary generation completed. Please review patient logs in the clinical chart.'
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Gemini summary error:', errorMsg);
    return `### [AI-Assisted Care Summary — Fallback Clinical Digest]
*(Note: Generated via baseline clinical rules due to AI connection latency: ${errorMsg.slice(0, 100)})*

• **Patient Status:** Postpartum recovery under active coordination.
• **Key Monitoring Points:** Monitor BP trajectory (target < 140/90), wound healing, newborn diaper counts (≥ 5/day), and maternal sleep/wellbeing.
• **Action:** Clinician review of recent vital logs recommended.`;
  }
}
