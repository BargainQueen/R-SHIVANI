import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  Sparkles,
  ShieldAlert,
  Activity,
  HeartPulse,
  Baby,
  Cpu,
  Play,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BotMessageSquare,
  FileText,
  UserCheck,
  Stethoscope,
  PhoneCall,
  Loader2,
  Terminal,
  Send,
} from 'lucide-react';

export const AgenticCommandCenter: React.FC = () => {
  const { patientRecord, currentUser, selectedPatientId, patientList, setSelectedPatientId, refreshData } = useApp();

  const [isRunningAudit, setIsRunningAudit] = useState(false);
  const [auditStep, setAuditStep] = useState<number>(0);
  const [auditResult, setAuditResult] = useState<any | null>(null);

  // Conversational Natural Language Logger State
  const [conversationalInput, setConversationalInput] = useState('');
  const [isProcessingLog, setIsProcessingLog] = useState(false);
  const [nlpResult, setNlpResult] = useState<any | null>(null);

  const sampleConversations = [
    'My blood pressure was 142/92 this morning, I drank 500ml water, and Mateo nursed for 20 mins, but my incision feels tight.',
    'I took my 100mg Labetalol, baby drank 60ml formula, and we had 5 wet diapers today. Feeling good!',
    'Felt dizzy upon standing, Mateo only had 2 wet diapers in 24 hours, and I have a throbbing headache.',
  ];

  const handleRunAutonomousAudit = async () => {
    setIsRunningAudit(true);
    setAuditStep(1);
    setAuditResult(null);

    // Simulate real-time agent progression
    setTimeout(() => setAuditStep(2), 700);
    setTimeout(() => setAuditStep(3), 1400);
    setTimeout(() => setAuditStep(4), 2100);

    try {
      const res = await api.runAgentAudit(selectedPatientId || 'usr_mother_1');
      setTimeout(() => {
        setAuditResult(res);
        setAuditStep(5);
        setIsRunningAudit(false);
        refreshData();
      }, 2600);
    } catch (err) {
      console.error('Audit failed:', err);
      setIsRunningAudit(false);
    }
  };

  const handleConversationalSubmit = async (textToSubmit?: string) => {
    const text = textToSubmit || conversationalInput;
    if (!text.trim() || isProcessingLog) return;

    setIsProcessingLog(true);
    setNlpResult(null);
    try {
      const res = await api.submitConversationalLog(
        currentUser?.role === 'mother' ? currentUser.id : selectedPatientId || 'usr_mother_1',
        text.trim()
      );
      setNlpResult(res);
      setConversationalInput('');
      refreshData();
    } catch (err) {
      console.error('Failed conversational log:', err);
    } finally {
      setIsProcessingLog(false);
    }
  };

  const targetName = patientRecord?.profile?.patientName || 'Maria Santos';
  const targetDay = patientRecord?.profile?.postpartumDay || 6;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-teal-500/30">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/40">
              <Cpu className="w-3.5 h-3.5 text-teal-400 animate-spin" />
              <span>Agentic AI Multi-Agent System Core</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-serif tracking-tight text-white">
              Autonomous Clinical Orchestration Engine
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Four specialized AI agents collaborate continuously to audit maternal hemodynamics, monitor neonatal hydration, enforce medication velocity, and draft clinical directives with Google Gemini intelligence.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleRunAutonomousAudit}
              disabled={isRunningAudit}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-teal-500/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isRunningAudit ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Orchestrating Agents...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-slate-950 text-slate-950" />
                  <span>Run Multi-Agent Care Audit</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 4 Agent Status Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Agent 1: Guardian */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs hover:border-teal-300 transition-all">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span className="flex items-center space-x-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>ACTIVE</span>
            </span>
          </div>
          <h3 className="font-bold text-slate-900 text-sm mt-3">Guardian Agent</h3>
          <span className="text-[11px] text-rose-600 font-semibold block">Maternal Risk & Triage</span>
          <p className="text-xs text-slate-500 mt-2 leading-snug">
            Continuously audits blood pressure telemetry (<span className="font-semibold text-slate-700">&lt;140/90 target</span>), severe headaches, and preeclampsia red flags.
          </p>
        </div>

        {/* Agent 2: Stork */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs hover:border-teal-300 transition-all">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Baby className="w-5 h-5" />
            </div>
            <span className="flex items-center space-x-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>ACTIVE</span>
            </span>
          </div>
          <h3 className="font-bold text-slate-900 text-sm mt-3">Stork Agent</h3>
          <span className="text-[11px] text-sky-600 font-semibold block">Neonatal Feeding & Growth</span>
          <p className="text-xs text-slate-500 mt-2 leading-snug">
            Monitors feeding intervals, diaper counts (dehydration threshold <span className="font-semibold text-slate-700">&lt;3 wet/24h</span>), jaundice skin depth, and WHO curves.
          </p>
        </div>

        {/* Agent 3: Nurture */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs hover:border-teal-300 transition-all">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <PhoneCall className="w-5 h-5" />
            </div>
            <span className="flex items-center space-x-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>ACTIVE</span>
            </span>
          </div>
          <h3 className="font-bold text-slate-900 text-sm mt-3">Nurture Agent</h3>
          <span className="text-[11px] text-purple-600 font-semibold block">Adherence & Outreach</span>
          <p className="text-xs text-slate-500 mt-2 leading-snug">
            Calculates antihypertensive medication adherence velocity, detects missed daily check-ins, and auto-schedules nurse tasks.
          </p>
        </div>

        {/* Agent 4: Copilot */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs hover:border-teal-300 transition-all">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
            <span className="flex items-center space-x-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>ACTIVE</span>
            </span>
          </div>
          <h3 className="font-bold text-slate-900 text-sm mt-3">Copilot Agent</h3>
          <span className="text-[11px] text-teal-600 font-semibold block">Clinical Synthesis & Orders</span>
          <p className="text-xs text-slate-500 mt-2 leading-snug">
            Multidisciplinary synthesis powered by Gemini, producing executive risk summaries, patient care directives, and rounds questions.
          </p>
        </div>
      </div>

      {/* Live Agentic Execution Stream or Results */}
      {isRunningAudit && (
        <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-teal-500/40 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-teal-400" />
              <span className="text-xs font-mono font-bold text-teal-300">
                LIVE MULTI-AGENT EXECUTION TRACE • TARGET: {targetName.toUpperCase()} (DAY {targetDay})
              </span>
            </div>
            <span className="text-xs text-slate-400">Step {auditStep} of 4</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className={`p-3 rounded-xl border transition-all ${auditStep >= 1 ? 'bg-slate-900/90 border-teal-500 text-teal-200' : 'opacity-40 border-slate-800 text-slate-500'}`}>
              <span className="text-teal-400 font-bold">[1/4] Guardian Agent:</span> Scanning blood pressure history, lochia flow, and incisional integrity...
            </div>
            <div className={`p-3 rounded-xl border transition-all ${auditStep >= 2 ? 'bg-slate-900/90 border-sky-500 text-sky-200' : 'opacity-40 border-slate-800 text-slate-500'}`}>
              <span className="text-sky-400 font-bold">[2/4] Stork Agent:</span> Auditing neonatal feeding intervals, 24h diaper volume, and jaundice dermal gradient...
            </div>
            <div className={`p-3 rounded-xl border transition-all ${auditStep >= 3 ? 'bg-slate-900/90 border-purple-500 text-purple-200' : 'opacity-40 border-slate-800 text-slate-500'}`}>
              <span className="text-purple-400 font-bold">[3/4] Nurture Agent:</span> Analyzing Labetalol timing adherence, missed daily check-in risk score, and hydration velocity...
            </div>
            <div className={`p-3 rounded-xl border transition-all ${auditStep >= 4 ? 'bg-slate-900/90 border-emerald-500 text-emerald-200' : 'opacity-40 border-slate-800 text-slate-500'}`}>
              <span className="text-emerald-400 font-bold">[4/4] Copilot Agent:</span> Synthesizing findings with Gemini AI, generating doctor interview questions, and dispatching care tasks...
            </div>
          </div>
        </div>
      )}

      {/* Multi-Agent Audit Results View */}
      {auditResult && !isRunningAudit && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-xl font-bold font-serif text-slate-900">
                  Autonomous Multi-Agent Audit Report: {auditResult.patientName}
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluation completed across 4 collaborating agents • Day {auditResult.postpartumDay} Postpartum
              </p>
            </div>

            <span
              className={`text-xs font-bold px-3 py-1.5 rounded-xl uppercase tracking-wider ${
                auditResult.overallRiskLevel === 'Urgent Intervention Required'
                  ? 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse'
                  : auditResult.overallRiskLevel === 'Moderate Vigilance'
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}
            >
              {auditResult.overallRiskLevel}
            </span>
          </div>

          {/* Reasoning Trace Steps */}
          <div className="space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Autonomous Agent Actions & Reasoning Traces:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {auditResult.agentActions.map((action: any, idx: number) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border text-xs space-y-2 ${
                    action.severity === 'urgent'
                      ? 'bg-rose-50/70 border-rose-200'
                      : action.severity === 'warning'
                      ? 'bg-amber-50/70 border-amber-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{action.agentName}</span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        action.severity === 'urgent'
                          ? 'bg-rose-200 text-rose-900'
                          : action.severity === 'warning'
                          ? 'bg-amber-200 text-amber-900'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {action.step}
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed font-mono text-[11px]">
                    <strong className="text-slate-900 font-sans block mb-0.5">🧠 Agent Reasoning:</strong>
                    {action.thought}
                  </p>
                  <div className="pt-2 border-t border-slate-200/60 text-[11px] text-teal-800 font-semibold">
                    ⚡ <strong>Action Taken:</strong> {action.actionTaken}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Directives & Questions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-teal-50/70 rounded-2xl border border-teal-200 space-y-2 text-xs">
              <span className="font-bold text-teal-900 block flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>Generated Clinical Directives:</span>
              </span>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                {auditResult.generatedClinicalDirectives.map((d: string, i: number) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-200 space-y-2 text-xs">
              <span className="font-bold text-purple-900 block flex items-center space-x-1">
                <Stethoscope className="w-4 h-4 text-purple-600" />
                <span>Suggested Questions for Doctor Rounds:</span>
              </span>
              <ul className="list-disc list-inside space-y-1 text-slate-700 italic">
                {auditResult.suggestedDoctorQuestions.map((q: string, i: number) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>
          </div>

          {auditResult.autoCreatedTask && (
            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Autonomous Task Created:</strong> "{auditResult.autoCreatedTask.title}" has been assigned to Nurse Carlos Mendoza's queue.
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Conversational Natural Language Logger (Agentic Parser) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-5">
        <div className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-teal-600" />
              <h2 className="font-bold text-slate-900 text-base">Conversational Agentic Logger</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Talk or write naturally. Our agents automatically parse vitals, symptoms, feeds, and hydration, mutating your chart and responding with safety evaluations.
            </p>
          </div>
          <span className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-teal-100 text-teal-800 self-start sm:self-center">
            Zero-Form Clinical Telemetry
          </span>
        </div>

        {/* Sample chips */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-400">Click a sample scenario or type below:</span>
          <div className="flex flex-wrap gap-2">
            {sampleConversations.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => handleConversationalSubmit(sample)}
                disabled={isProcessingLog}
                className="text-left p-2.5 rounded-xl bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-900 text-xs border border-slate-200 transition-colors"
              >
                "{sample}"
              </button>
            ))}
          </div>
        </div>

        {/* Input box */}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="e.g. Logged BP 138/88, drank 750ml water, Mateo nursed for 15 minutes..."
            value={conversationalInput}
            onChange={(e) => setConversationalInput(e.target.value)}
            disabled={isProcessingLog}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleConversationalSubmit();
            }}
            className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-teal-500 text-xs sm:text-sm bg-slate-50/50"
          />
          <button
            onClick={() => handleConversationalSubmit()}
            disabled={isProcessingLog || !conversationalInput.trim()}
            className="px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-colors flex items-center space-x-1.5"
          >
            {isProcessingLog ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span className="hidden sm:inline">Process Update</span>
          </button>
        </div>

        {/* Result of Conversational Logging */}
        {nlpResult && (
          <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-3 animate-in fade-in duration-200 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-teal-200">
              <span className="font-bold text-teal-950 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>Autonomous Actions Executed in Clinical Chart:</span>
              </span>
              <span className="text-[10px] text-teal-800 font-semibold">Real-Time Sync</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {nlpResult.actionsExecuted.map((action: string, i: number) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-white border border-teal-300 text-teal-900 font-medium">
                  ✓ {action}
                </span>
              ))}
            </div>

            <div className="pt-2 border-t border-teal-200">
              <strong className="block text-slate-800 mb-1">🤖 Agent Response to Mother:</strong>
              <p className="text-slate-700 leading-relaxed whitespace-pre-line">{nlpResult.agentResponse}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
