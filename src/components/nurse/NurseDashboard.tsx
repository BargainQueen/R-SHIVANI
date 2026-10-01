import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  Activity,
  PhoneCall,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  UserCheck,
  Search,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  ArrowUpRight,
  RotateCw,
  X,
  Cpu,
  ListTodo,
} from 'lucide-react';
import { CareAlertsPanel } from '../common/CareAlertsPanel';

export const NurseDashboard: React.FC = () => {
  const { patientList, patientRecord, selectedPatientId, setSelectedPatientId, refreshData, setCurrentTab } = useApp();

  const [nurseTab, setNurseTab] = useState<'tasks' | 'alerts'>('tasks');
  const [activeTaskModal, setActiveTaskModal] = useState<string | null>(null);
  const [attemptType, setAttemptType] = useState<'call' | 'message' | 'visit'>('call');
  const [attemptOutcome, setAttemptOutcome] = useState<'reached' | 'left_voicemail' | 'no_answer' | 'resolved'>('reached');
  const [attemptNotes, setAttemptNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Escalate modal state
  const [escalateModalTaskId, setEscalateModalTaskId] = useState<string | null>(null);
  const [escalateReason, setEscalateReason] = useState('');

  // Scanning state
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  if (!patientRecord) return null;

  const { followupTasks, alerts } = patientRecord;

  // Run Workflow 1: Missed check-in scan
  const handleTriggerMissedCheckinScan = async () => {
    setIsScanning(true);
    setScanResult(null);
    try {
      const res = await api.runMissedCheckinScan();
      setScanResult(`Scan complete: ${res.tasksGenerated} missed check-in task(s) identified & queued.`);
      refreshData();
    } catch (err) {
      console.error('Scan error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleRecordAttempt = async (taskId: string) => {
    if (!attemptNotes.trim()) return;
    setIsSubmitting(true);
    try {
      await api.logTaskAttempt(taskId, {
        type: attemptType,
        outcome: attemptOutcome,
        notes: attemptNotes.trim(),
        loggedBy: 'Carlos Mendoza, RN',
      });
      setActiveTaskModal(null);
      setAttemptNotes('');
      refreshData();
    } catch (err) {
      console.error('Failed to log attempt:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEscalateToDoctor = async (taskId: string) => {
    if (!escalateReason.trim()) return;
    setIsSubmitting(true);
    try {
      await api.escalateTask(taskId, {
        reason: escalateReason.trim(),
        clinicalNotes: `Escalated by Nurse Carlos: ${escalateReason.trim()}`,
      });
      setEscalateModalTaskId(null);
      setEscalateReason('');
      refreshData();
    } catch (err) {
      console.error('Failed to escalate:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await api.completeTask(taskId, { clinicalNotes: 'Completed by Carlos Mendoza, RN' });
      refreshData();
    } catch (err) {
      console.error('Failed to complete task:', err);
    }
  };

  const pendingTasks = followupTasks.filter((t) => t.status !== 'completed');
  const completedTasks = followupTasks.filter((t) => t.status === 'completed');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-50 text-sky-800 text-xs font-semibold mb-1 border border-sky-200">
            <Activity className="w-3.5 h-3.5 text-sky-600" />
            <span>Maternal-Child Health Nurse Portal</span>
          </div>
          <h1 className="text-2xl font-bold font-serif text-slate-900 tracking-tight">
            Nurse Care Coordination & Task Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Active patient outreach, follow-up attempts, missed check-in management, and clinical escalation to Dr. Jenkins.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
          <button
            onClick={() => setCurrentTab('agentic')}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-teal-300 font-semibold text-xs shadow-md transition-all flex items-center space-x-1.5 border border-teal-500/40"
          >
            <Cpu className="w-4 h-4 text-teal-400" />
            <span>Agentic Multi-Agent Hub</span>
          </button>

          {/* Workflow 1: Trigger Scan */}
          <button
            onClick={handleTriggerMissedCheckinScan}
            disabled={isScanning}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-md transition-all flex items-center space-x-1.5"
          >
            <RotateCw className={`w-4 h-4 text-white ${isScanning ? 'animate-spin' : ''}`} />
            <span>Scan for Missed Check-ins</span>
          </button>
        </div>
      </div>

      {scanResult && (
        <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-2xl text-xs text-teal-900 flex items-center justify-between animate-fade-in">
          <span>{scanResult}</span>
          <button onClick={() => setScanResult(null)} className="text-teal-700 font-bold ml-2">
            ✕
          </button>
        </div>
      )}

      {/* Nurse Sub-Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setNurseTab('tasks')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            nurseTab === 'tasks'
              ? 'bg-sky-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ListTodo className="w-4 h-4" />
          <span>Outreach Tasks & Queue ({pendingTasks.length} Active)</span>
        </button>

        <button
          onClick={() => setNurseTab('alerts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            nurseTab === 'alerts'
              ? 'bg-rose-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ShieldAlert className={`w-4 h-4 ${nurseTab === 'alerts' ? 'text-white' : 'text-rose-500'}`} />
          <span>Active Care Alerts & Symptom Triage</span>
        </button>
      </div>

      {nurseTab === 'alerts' ? (
        <CareAlertsPanel
          clinicianRole="nurse"
          clinicianName="Carlos Mendoza, RN"
          onSelectPatient={(id) => {
            setSelectedPatientId(id);
            setNurseTab('tasks');
          }}
        />
      ) : (
        <>
          {/* Patient Selector Strip */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs flex items-center space-x-3 overflow-x-auto no-scrollbar">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-2 whitespace-nowrap">
          Select Patient:
        </span>
        {patientList.map((p) => {
          const isSelected = p.userId === selectedPatientId;
          return (
            <button
              key={p.userId}
              onClick={() => setSelectedPatientId(p.userId)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap border ${
                isSelected
                  ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>{p.patientName}</span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-teal-800 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                Day {p.postpartumDay}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Pending Tasks vs Outreach Attempts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Follow-up Tasks (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
              <Clock className="w-4 h-4 text-sky-600" />
              <span>Pending Follow-up Tasks ({pendingTasks.length})</span>
            </h2>
            <span className="text-[11px] text-slate-500">For {patientRecord.profile.patientName}</span>
          </div>

          <div className="space-y-3">
            {pendingTasks.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">
                All follow-up tasks for this patient have been resolved!
              </p>
            ) : (
              pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-4 rounded-2xl border text-xs space-y-3 ${
                    task.priority === 'high' ? 'bg-rose-50/50 border-rose-200' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-slate-900">{task.title}</span>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            task.priority === 'high' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {task.priority} Priority
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1">{task.reason}</p>
                    </div>

                    {task.escalatedToDoctor && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold text-[9px] uppercase tracking-wider">
                        Escalated to MD
                      </span>
                    )}
                  </div>

                  {/* Actions for Nurse */}
                  <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400">
                      {task.attempts.length} Outreach Attempt{task.attempts.length !== 1 ? 's' : ''} logged
                    </span>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setActiveTaskModal(task.id)}
                        className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs transition-colors flex items-center space-x-1"
                      >
                        <PhoneCall className="w-3 h-3" />
                        <span>Log Attempt</span>
                      </button>

                      {!task.escalatedToDoctor && (
                        <button
                          onClick={() => setEscalateModalTaskId(task.id)}
                          className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 font-semibold text-xs transition-colors"
                        >
                          Escalate to MD
                        </button>
                      )}

                      <button
                        onClick={() => handleCompleteTask(task.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold text-xs transition-colors"
                      >
                        Mark Done
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Outreach Attempts & Contact Log (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
              <PhoneCall className="w-4 h-4 text-teal-600" />
              <span>Contact History & Outcomes</span>
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Structured log of phone calls, in-app messages, and nurse home visits.
            </p>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {followupTasks.flatMap((t) => t.attempts).length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No contact attempts logged yet.</p>
            ) : (
              followupTasks
                .flatMap((t) => t.attempts.map((att) => ({ ...att, taskTitle: t.title })))
                .map((att) => (
                  <div key={att.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 capitalize">
                        {att.type === 'call' ? '📞 Phone Call' : att.type === 'message' ? '💬 Message' : '🏠 Home Visit'}
                      </span>
                      <span className="text-[9px] font-semibold uppercase px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                        {att.outcome.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px]">"{att.notes}"</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span>Logged by: {att.loggedBy}</span>
                      <span>{new Date(att.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
      </>
      )}

      {/* Log Attempt Modal */}
      {activeTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-slate-800 text-base mb-1">Record Patient Contact Attempt</h3>
            <p className="text-xs text-slate-500 mb-4">Document follow-up call, voicemail, or in-app consultation.</p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Channel</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['call', 'message', 'visit'] as const).map((ch) => (
                    <button
                      type="button"
                      key={ch}
                      onClick={() => setAttemptType(ch)}
                      className={`p-2 rounded-xl text-xs font-bold capitalize border transition-all ${
                        attemptType === ch
                          ? 'bg-sky-600 text-white border-sky-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Outcome</label>
                <select
                  value={attemptOutcome}
                  onChange={(e) => setAttemptOutcome(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                >
                  <option value="reached">Reached & Spoke with Mother</option>
                  <option value="left_voicemail">Left Voicemail with Instructions</option>
                  <option value="no_answer">No Answer / Call Failed</option>
                  <option value="resolved">Issue Resolved Completely</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Structured Clinical Notes</label>
                <textarea
                  rows={3}
                  placeholder="Detail mother's response, reported symptoms, advice provided, and next steps..."
                  value={attemptNotes}
                  onChange={(e) => setAttemptNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTaskModal(null)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmitting || !attemptNotes.trim()}
                  onClick={() => handleRecordAttempt(activeTaskModal)}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-xs"
                >
                  {isSubmitting ? 'Saving...' : 'Save Outreach Attempt'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Escalate to Doctor Modal */}
      {escalateModalTaskId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-purple-200">
            <h3 className="font-bold text-slate-800 text-base mb-1">Escalate Concern to Attending Physician</h3>
            <p className="text-xs text-slate-500 mb-4">
              Escalates priority and surfaces immediately on Dr. Sarah Jenkins' urgent queue.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Reason for Clinical Escalation</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Blood pressure remains elevated after 15 min rest, or severe incisional tenderness reported..."
                  value={escalateReason}
                  onChange={(e) => setEscalateReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEscalateModalTaskId(null)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmitting || !escalateReason.trim()}
                  onClick={() => handleEscalateToDoctor(escalateModalTaskId)}
                  className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs shadow-xs"
                >
                  {isSubmitting ? 'Escalating...' : 'Confirm Escalation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
