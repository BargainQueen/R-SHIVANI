import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { AutoScheduleResult } from '../../types';
import {
  HeartPulse,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Droplets,
  Smile,
  ShieldAlert,
  Plus,
  Clock,
  Calendar,
  Info,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

export const MaternalRecoveryView: React.FC = () => {
  const { patientRecord, currentUser, refreshData, setCurrentTab } = useApp();

  // Active sub-tab
  const [subTab, setSubTab] = useState<'bp' | 'symptoms' | 'wellbeing' | 'nutrition'>('bp');

  // Blood Pressure Form State
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [pulse, setPulse] = useState('');
  const [bpNotes, setBpNotes] = useState('');
  const [bpSubmitting, setBpSubmitting] = useState(false);
  const [lastBpEvaluation, setLastBpEvaluation] = useState<{
    status: string;
    alertTriggered: boolean;
    guidance: string;
  } | null>(null);
  const [bpAutoAppointment, setBpAutoAppointment] = useState<AutoScheduleResult | null>(null);

  // Symptoms Form State
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [symptomNotes, setSymptomNotes] = useState('');
  const [symptomSubmitting, setSymptomSubmitting] = useState(false);
  const [symptomResult, setSymptomResult] = useState<{
    isUrgent: boolean;
    guidance: string;
  } | null>(null);
  const [symptomAutoAppointment, setSymptomAutoAppointment] = useState<AutoScheduleResult | null>(null);

  // Wellbeing Form State
  const [mood, setMood] = useState<'great' | 'good' | 'neutral' | 'struggling' | 'overwhelmed'>('good');
  const [moodScore, setMoodScore] = useState(4);
  const [sleepHours, setSleepHours] = useState(6);
  const [anxietyLevel, setAnxietyLevel] = useState(2);
  const [wellbeingNotes, setWellbeingNotes] = useState('');
  const [wellbeingSubmitting, setWellbeingSubmitting] = useState(false);

  // Hydration Form State
  const [customWater, setCustomWater] = useState('250');
  const [mealText, setMealText] = useState('');

  if (!patientRecord) return null;

  const { bloodPressureLogs, symptoms, wellbeingCheckins, nutritionLogs } = patientRecord;

  // Chart data formatting for BP
  const bpChartData = bloodPressureLogs.map((log) => {
    const d = new Date(log.timestamp);
    const dateFormatted = `${d.getMonth() + 1}/${d.getDate()} ${d.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
    return {
      date: dateFormatted,
      systolic: log.systolic,
      diastolic: log.diastolic,
      pulse: log.pulse,
      status: log.status,
    };
  });

  const handleBpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !systolic || !diastolic) return;
    setBpSubmitting(true);
    try {
      const res = await api.logBloodPressure({
        userId: currentUser.id,
        systolic: parseInt(systolic),
        diastolic: parseInt(diastolic),
        pulse: pulse ? parseInt(pulse) : undefined,
        notes: bpNotes,
      });
      setLastBpEvaluation(res.evaluation);
      if (res.autoAppointment) {
        setBpAutoAppointment(res.autoAppointment);
      } else {
        setBpAutoAppointment(null);
      }
      setSystolic('');
      setDiastolic('');
      setPulse('');
      setBpNotes('');
      refreshData();
    } catch (err) {
      console.error('Failed to log BP:', err);
    } finally {
      setBpSubmitting(false);
    }
  };

  const commonSymptomOptions = [
    { label: 'Heavy bleeding soaking a pad in under 1 hour', urgent: true },
    { label: 'Severe persistent headache not relieved by medication', urgent: true },
    { label: 'Vision changes, blurring, or seeing flashing spots', urgent: true },
    { label: 'High fever (100.4°F / 38°C or higher) with chills', urgent: true },
    { label: 'Chest pain, shortness of breath, or rapid breathing', urgent: true },
    { label: 'Severe, sharp lower abdominal pain', urgent: true },
    { label: 'Swollen, red, tender, or painful calf / leg', urgent: true },
    { label: 'Incision site redness, discharge, or separation', urgent: false },
    { label: 'Pain or burning during urination', urgent: false },
    { label: 'Breast engorgement, cracked nipples, or pain', urgent: false },
    { label: 'Extreme fatigue or dizziness upon standing', urgent: false },
    { label: 'Perineal tenderness or swelling', urgent: false },
  ];

  const toggleSymptom = (label: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]
    );
  };

  const handleSymptomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || (selectedSymptoms.length === 0 && !symptomNotes)) return;
    setSymptomSubmitting(true);
    try {
      const allSymptoms = [...selectedSymptoms];
      if (symptomNotes.trim()) allSymptoms.push(symptomNotes.trim());

      const res = await api.reportSymptoms({
        userId: currentUser.id,
        type: 'maternal',
        symptoms: allSymptoms,
        notes: symptomNotes,
      });

      setSymptomResult(res.evaluation);
      if (res.autoAppointment) {
        setSymptomAutoAppointment(res.autoAppointment);
      } else {
        setSymptomAutoAppointment(null);
      }
      setSelectedSymptoms([]);
      setSymptomNotes('');
      refreshData();
    } catch (err) {
      console.error('Failed to report symptoms:', err);
    } finally {
      setSymptomSubmitting(false);
    }
  };

  const handleWellbeingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setWellbeingSubmitting(true);
    try {
      await api.recordWellbeing({
        userId: currentUser.id,
        mood,
        moodScore,
        sleepHours,
        anxietyLevel,
        notes: wellbeingNotes,
      });
      setWellbeingNotes('');
      refreshData();
    } catch (err) {
      console.error('Failed to submit wellbeing:', err);
    } finally {
      setWellbeingSubmitting(false);
    }
  };

  const handleAddWater = async (amount: number) => {
    if (!currentUser) return;
    try {
      await api.logNutrition({
        userId: currentUser.id,
        waterMl: amount,
      });
      refreshData();
    } catch (err) {
      console.error('Failed to log water:', err);
    }
  };

  const handleAddMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !mealText.trim()) return;
    try {
      await api.logNutrition({
        userId: currentUser.id,
        mealItem: mealText.trim(),
      });
      setMealText('');
      refreshData();
    } catch (err) {
      console.error('Failed to log meal:', err);
    }
  };

  const todayNutrition = nutritionLogs[0] || { waterMl: 1750, targetWaterMl: 2800, mealsLogged: [] };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-slate-900 tracking-tight">Maternal Recovery Tracker</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Monitor your vital signs, track warning symptoms, check in on your emotional health, and maintain optimal hydration.
          </p>
        </div>

        {/* Sub-tab pills */}
        <div className="flex bg-slate-100 p-1 rounded-2xl overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSubTab('bp')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              subTab === 'bp' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Blood Pressure
          </button>
          <button
            onClick={() => setSubTab('symptoms')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              subTab === 'symptoms' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Symptom Reports
          </button>
          <button
            onClick={() => setSubTab('wellbeing')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              subTab === 'wellbeing' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mental Wellbeing
          </button>
          <button
            onClick={() => setSubTab('nutrition')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              subTab === 'nutrition' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Nutrition & Hydration
          </button>
        </div>
      </div>

      {/* Subtab 1: Blood Pressure Tracker */}
      {subTab === 'bp' && (
        <div className="space-y-6">
          {/* BP Alert Guidance banner if triggered */}
          {lastBpEvaluation && (
            <div
              className={`p-4 rounded-3xl border flex items-start space-x-3 ${
                lastBpEvaluation.status === 'urgent_crisis'
                  ? 'bg-rose-50 border-rose-200 text-rose-900 animate-urgent-pulse'
                  : lastBpEvaluation.alertTriggered
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}
            >
              {lastBpEvaluation.alertTriggered ? (
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              )}
              <div className="text-xs">
                <div className="font-bold">
                  {lastBpEvaluation.alertTriggered ? 'Clinician Alert Triggered' : 'Normal Reading Recorded'}
                </div>
                <p className="mt-0.5 leading-relaxed">{lastBpEvaluation.guidance}</p>
              </div>
            </div>
          )}

          {/* Automated Appointment Notification Card */}
          {bpAutoAppointment && (
            <div
              className={`p-4 rounded-3xl border shadow-xs transition-all ${
                bpAutoAppointment.scheduled
                  ? 'bg-gradient-to-r from-teal-50 via-cyan-50 to-emerald-50 border-teal-300 text-teal-950'
                  : 'bg-amber-50 border-amber-300 text-amber-950'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start space-x-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                    bpAutoAppointment.scheduled ? 'bg-teal-600 text-white' : 'bg-amber-600 text-white'
                  }`}>
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-white/80 border border-teal-200 text-teal-800 text-[10px] font-bold uppercase tracking-wider mb-1">
                      <span>Automated Care Coordination</span>
                      <span>•</span>
                      <span>{bpAutoAppointment.scheduled ? 'Appointment Reserved' : 'Doctor Alerted'}</span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">
                      {bpAutoAppointment.scheduled
                        ? `Urgent Follow-up Auto-Scheduled: ${bpAutoAppointment.appointment?.title}`
                        : 'Doctor Alerted — Priority Manual Triage'}
                    </h4>
                    <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                      {bpAutoAppointment.message}
                    </p>
                    {bpAutoAppointment.appointment && (
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-semibold text-slate-800">
                        <span className="flex items-center space-x-1 text-teal-700">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{bpAutoAppointment.appointment.date}</span>
                        </span>
                        <span className="flex items-center space-x-1 text-teal-700">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{bpAutoAppointment.appointment.time}</span>
                        </span>
                        <span className="text-slate-500 font-normal">
                          {bpAutoAppointment.appointment.location}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {bpAutoAppointment.appointment && (
                  <button
                    onClick={() => setCurrentTab('appointments')}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold whitespace-nowrap shadow-xs flex items-center space-x-1 self-start sm:self-center"
                  >
                    <span>View in Appointments</span>
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Form Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
                <Activity className="w-5 h-5 text-teal-600" />
                <h2 className="font-bold text-slate-800 text-sm">Log Blood Pressure</h2>
              </div>

              <form onSubmit={handleBpSubmit} className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Systolic (Top)</label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="120"
                        min="70"
                        max="240"
                        value={systolic}
                        onChange={(e) => setSystolic(e.target.value)}
                        required
                        className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 font-bold"
                      />
                      <span className="absolute right-3 top-2.5 text-[10px] text-slate-400">mmHg</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Diastolic (Bottom)</label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="80"
                        min="40"
                        max="140"
                        value={diastolic}
                        onChange={(e) => setDiastolic(e.target.value)}
                        required
                        className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 font-bold"
                      />
                      <span className="absolute right-3 top-2.5 text-[10px] text-slate-400">mmHg</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Pulse / Heart Rate (Optional)</label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="72"
                      min="40"
                      max="180"
                      value={pulse}
                      onChange={(e) => setPulse(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                    />
                    <span className="absolute right-3 top-2.5 text-[10px] text-slate-400">bpm</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Notes / Feelings</label>
                  <textarea
                    rows={2}
                    placeholder="e.g., rested 10 min, felt slight dizziness upon standing..."
                    value={bpNotes}
                    onChange={(e) => setBpNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* Medical threshold guide */}
                <div className="p-3 bg-slate-50 rounded-xl text-[10px] text-slate-500 space-y-1">
                  <div className="font-semibold text-slate-700">Clinical Alert Thresholds:</div>
                  <div className="flex justify-between">
                    <span>Normal:</span> <span className="font-medium text-emerald-700">&lt; 120 / 80 mmHg</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Elevated / Stage 1:</span> <span className="font-medium text-amber-700">≥ 140 / 90 mmHg (Notifies Nurse)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Severe Crisis:</span> <span className="font-bold text-rose-700">≥ 160 / 110 mmHg (Emergency Alert)</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={bpSubmitting}
                  className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs transition-colors"
                >
                  {bpSubmitting ? 'Evaluating reading...' : 'Save Blood Pressure'}
                </button>
              </form>
            </div>

            {/* Historical BP Trend Chart */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="font-bold text-slate-800 text-sm">Blood Pressure Trend (mmHg)</h2>
                    <p className="text-[11px] text-slate-500">Target zone below 140/90 mmHg</p>
                  </div>
                  <div className="flex items-center space-x-3 text-xs">
                    <span className="flex items-center space-x-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block" />
                      <span>Systolic</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" />
                      <span>Diastolic</span>
                    </span>
                  </div>
                </div>

                <div className="h-64 w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={bpChartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis domain={[50, 180]} tick={{ fontSize: 10, fill: '#64748b' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0',
                          fontSize: '11px',
                        }}
                      />
                      {/* Clinical Warning threshold lines */}
                      <ReferenceLine y={140} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Stage 1 (140)', fill: '#d97706', fontSize: 10 }} />
                      <ReferenceLine y={90} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Diastolic (90)', fill: '#d97706', fontSize: 10 }} />
                      <ReferenceLine y={160} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Crisis (160)', fill: '#ef4444', fontSize: 10 }} />
                      <Line
                        type="monotone"
                        dataKey="systolic"
                        stroke="#0d9488"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: '#0d9488' }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="diastolic"
                        stroke="#0284c7"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: '#0284c7' }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* History Table */}
              <div className="mt-4 pt-4 border-t border-slate-100 max-h-40 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 font-semibold border-b border-slate-100">
                      <th className="pb-1">Timestamp</th>
                      <th className="pb-1">Reading</th>
                      <th className="pb-1">Pulse</th>
                      <th className="pb-1">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bloodPressureLogs.map((log) => (
                      <tr key={log.id} className="text-slate-700">
                        <td className="py-1.5">{new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                        <td className="py-1.5 font-bold">{log.systolic}/{log.diastolic} mmHg</td>
                        <td className="py-1.5">{log.pulse || '—'} bpm</td>
                        <td className="py-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              log.status === 'normal'
                                ? 'bg-emerald-100 text-emerald-800'
                                : log.status === 'stage1'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 2: Symptom Tracker */}
      {subTab === 'symptoms' && (
        <div className="space-y-6">
          {symptomResult && (
            <div
              className={`p-4 rounded-3xl border flex items-start space-x-3 ${
                symptomResult.isUrgent
                  ? 'bg-rose-50 border-rose-300 text-rose-950 animate-urgent-pulse'
                  : 'bg-teal-50 border-teal-200 text-teal-900'
              }`}
            >
              {symptomResult.isUrgent ? (
                <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
              )}
              <div className="text-xs">
                <div className="font-bold text-sm">
                  {symptomResult.isUrgent ? 'URGENT MEDICAL GUIDANCE TRIGGERED' : 'Symptom Report Recorded'}
                </div>
                <p className="mt-1 leading-relaxed font-medium">{symptomResult.guidance}</p>
              </div>
            </div>
          )}

          {/* Automated Appointment Notification Card for Symptoms */}
          {symptomAutoAppointment && (
            <div
              className={`p-4 rounded-3xl border shadow-xs transition-all ${
                symptomAutoAppointment.scheduled
                  ? 'bg-gradient-to-r from-teal-50 via-cyan-50 to-emerald-50 border-teal-300 text-teal-950'
                  : 'bg-amber-50 border-amber-300 text-amber-950'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start space-x-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                    symptomAutoAppointment.scheduled ? 'bg-teal-600 text-white' : 'bg-amber-600 text-white'
                  }`}>
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-white/80 border border-teal-200 text-teal-800 text-[10px] font-bold uppercase tracking-wider mb-1">
                      <span>Automated Care Coordination</span>
                      <span>•</span>
                      <span>{symptomAutoAppointment.scheduled ? 'Appointment Reserved' : 'Doctor Alerted'}</span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">
                      {symptomAutoAppointment.scheduled
                        ? `Urgent Follow-up Auto-Scheduled: ${symptomAutoAppointment.appointment?.title}`
                        : 'Doctor Alerted — Priority Manual Triage'}
                    </h4>
                    <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                      {symptomAutoAppointment.message}
                    </p>
                    {symptomAutoAppointment.appointment && (
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-semibold text-slate-800">
                        <span className="flex items-center space-x-1 text-teal-700">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{symptomAutoAppointment.appointment.date}</span>
                        </span>
                        <span className="flex items-center space-x-1 text-teal-700">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{symptomAutoAppointment.appointment.time}</span>
                        </span>
                        <span className="text-slate-500 font-normal">
                          {symptomAutoAppointment.appointment.location}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {symptomAutoAppointment.appointment && (
                  <button
                    onClick={() => setCurrentTab('appointments')}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold whitespace-nowrap shadow-xs flex items-center space-x-1 self-start sm:self-center"
                  >
                    <span>View in Appointments</span>
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Symptom Checklist Form */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <div>
                  <h2 className="font-bold text-slate-800 text-sm">Report Symptoms or Concerns</h2>
                  <p className="text-[11px] text-slate-500">
                    Checked items are evaluated instantly against clinician warning criteria.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSymptomSubmit} className="mt-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {commonSymptomOptions.map((opt) => {
                    const isChecked = selectedSymptoms.includes(opt.label);
                    return (
                      <label
                        key={opt.label}
                        onClick={() => toggleSymptom(opt.label)}
                        className={`flex items-start space-x-2.5 p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                          isChecked
                            ? opt.urgent
                              ? 'bg-rose-50 border-rose-300 text-rose-900 font-semibold'
                              : 'bg-teal-50 border-teal-300 text-teal-900 font-semibold'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="mt-0.5 accent-teal-600 rounded"
                        />
                        <span className="leading-snug">{opt.label}</span>
                      </label>
                    );
                  })}
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Other Symptoms / Detailed Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe any other bodily feelings, incision appearance, or questions..."
                    value={symptomNotes}
                    onChange={(e) => setSymptomNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-slate-400">
                    Reports are logged in your chart for Dr. Jenkins and Nurse Carlos.
                  </span>
                  <button
                    type="submit"
                    disabled={symptomSubmitting || (selectedSymptoms.length === 0 && !symptomNotes)}
                    className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs transition-colors"
                  >
                    {symptomSubmitting ? 'Evaluating...' : 'Submit Symptom Report'}
                  </button>
                </div>
              </form>
            </div>

            {/* Symptom History */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
              <h2 className="font-bold text-slate-800 text-sm pb-3 border-b border-slate-100">
                Recent Symptom Reports
              </h2>

              <div className="mt-3 space-y-3 max-h-96 overflow-y-auto">
                {symptoms.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No reported symptoms yet.</p>
                ) : (
                  symptoms.map((s) => (
                    <div
                      key={s.id}
                      className={`p-3 rounded-2xl border text-xs ${
                        s.isUrgentAlert ? 'bg-rose-50/70 border-rose-200' : 'bg-slate-50 border-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">
                          {new Date(s.timestamp).toLocaleDateString()} {new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            s.isUrgentAlert ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {s.severity.toUpperCase()}
                        </span>
                      </div>
                      <div className="font-semibold text-slate-800 mt-1">{s.symptoms.join(', ')}</div>
                      {s.notes && <p className="text-slate-600 text-[11px] mt-1 italic">"{s.notes}"</p>}
                      {s.clinicianNotes && (
                        <div className="mt-2 p-2 bg-white rounded-xl border border-slate-200 text-[10px] text-teal-800">
                          <strong className="block font-semibold">Clinician Follow-up Note:</strong>
                          {s.clinicianNotes}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 3: Mental Wellbeing Check-in */}
      {subTab === 'wellbeing' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-5">
            <div className="pb-3 border-b border-slate-100">
              <h2 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
                <Smile className="w-5 h-5 text-teal-600" />
                <span>Daily Emotional Wellbeing Check-in</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Postpartum recovery involves both physical and emotional healing. You are not alone, and honest reflection helps your care team support you.
              </p>
            </div>

            <form onSubmit={handleWellbeingSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-2">How are you feeling today?</label>
                <div className="grid grid-cols-5 gap-2">
                  {(['great', 'good', 'neutral', 'struggling', 'overwhelmed'] as const).map((m) => (
                    <button
                      type="button"
                      key={m}
                      onClick={() => {
                        setMood(m);
                        const map = { great: 5, good: 4, neutral: 3, struggling: 2, overwhelmed: 1 };
                        setMoodScore(map[m]);
                      }}
                      className={`p-3 rounded-2xl text-xs font-semibold text-center border transition-all ${
                        mood === m
                          ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-lg">
                        {m === 'great' && '🌸'}
                        {m === 'good' && '☀️'}
                        {m === 'neutral' && '🍃'}
                        {m === 'struggling' && '🌧️'}
                        {m === 'overwhelmed' && '⚡'}
                      </div>
                      <div className="mt-1 capitalize">{m}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 flex justify-between">
                    <span>Sleep Hours (Total in 24h)</span>
                    <span className="text-teal-600 font-bold">{sleepHours} hrs</span>
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="12"
                    step="0.5"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                    className="w-full accent-teal-600 mt-2"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 flex justify-between">
                    <span>Stress & Worry Level</span>
                    <span className="text-teal-600 font-bold">{anxietyLevel} / 5</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={anxietyLevel}
                    onChange={(e) => setAnxietyLevel(parseInt(e.target.value))}
                    className="w-full accent-teal-600 mt-2"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Journal / Reflections for your Nurse & Doctor
                </label>
                <textarea
                  rows={3}
                  placeholder="Share how bonding is going, changes in mood, support at home, or worries..."
                  value={wellbeingNotes}
                  onChange={(e) => setWellbeingNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={wellbeingSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs transition-colors"
                >
                  {wellbeingSubmitting ? 'Saving...' : 'Log Wellbeing Check-in'}
                </button>
              </div>
            </form>

            {/* Wellbeing History list */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="font-semibold text-xs text-slate-700 mb-2">Previous Check-ins</h3>
              <div className="space-y-2">
                {wellbeingCheckins.map((w) => (
                  <div key={w.id} className="p-3 bg-slate-50 rounded-xl text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 capitalize">
                        {w.mood} ({w.moodScore}/5)
                      </span>
                      <span className="text-slate-400 text-[10px] ml-2">{w.date}</span>
                      {w.notes && <p className="text-[11px] text-slate-600 mt-0.5 italic">"{w.notes}"</p>}
                    </div>
                    <span className="text-[11px] text-slate-500">{w.sleepHours} hrs sleep</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Educational Resources & Disclaimer */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
              <h3 className="font-bold text-slate-800 text-sm mb-2">Understanding "Baby Blues" vs PPD</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Up to 80% of mothers experience the <strong>"Baby Blues"</strong> (mood swings, weeping, irritability) in the first 1-2 weeks due to massive hormonal shifts and sleep deprivation.
              </p>
              <p className="text-xs text-slate-600 leading-relaxed mt-2">
                If sadness, severe anxiety, numbness, or thoughts of helplessness persist past 2 weeks, it may be <strong>Postpartum Depression (PPD)</strong>, which is common and highly treatable.
              </p>

              <div className="mt-4 p-3 bg-teal-50 rounded-2xl border border-teal-100 text-[11px] text-teal-900">
                <strong className="block font-semibold">24/7 Free Maternal Mental Health Support:</strong>
                <p className="mt-1">
                  Call or text <strong>1-833-TLC-MAMA</strong> (1-833-852-6262) anytime for confidential peer support and clinical resources.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-100 rounded-3xl text-[11px] text-slate-500 leading-relaxed">
              <Info className="w-4 h-4 text-slate-400 inline mr-1" />
              <strong>Clinical Notice:</strong> This wellbeing tool is an observational check-in for care coordination and does not constitute a diagnostic psychological evaluation. Always talk to your clinician.
            </div>
          </div>
        </div>
      )}

      {/* Subtab 4: Nutrition & Hydration */}
      {subTab === 'nutrition' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h2 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
                <Droplets className="w-5 h-5 text-cyan-500" />
                <span>Daily Hydration Tracker</span>
              </h2>
              <p className="text-[11px] text-slate-500">
                Adequate fluid intake (2,500 - 3,000 mL) is vital for healing, bowel regularity, and breast milk volume.
              </p>
            </div>

            <div className="p-4 bg-cyan-50/60 rounded-2xl border border-cyan-100 text-center">
              <span className="text-xs text-slate-500 block">Total Water Logged Today</span>
              <span className="text-3xl font-extrabold text-cyan-900 font-serif">
                {todayNutrition.waterMl} <span className="text-sm font-sans font-normal text-cyan-700">/ {todayNutrition.targetWaterMl} mL</span>
              </span>
              <div className="w-full bg-cyan-200/60 h-3 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-cyan-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.round((todayNutrition.waterMl / todayNutrition.targetWaterMl) * 100))}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">Quick Add Water</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleAddWater(250)}
                  className="p-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs transition-colors"
                >
                  +250 mL (1 cup)
                </button>
                <button
                  onClick={() => handleAddWater(500)}
                  className="p-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs transition-colors"
                >
                  +500 mL (Bottle)
                </button>
                <button
                  onClick={() => handleAddWater(750)}
                  className="p-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs transition-colors"
                >
                  +750 mL (Large)
                </button>
              </div>
            </div>

            <form onSubmit={handleAddMeal} className="pt-3 border-t border-slate-100 space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">Log Nourishing Meal or Snack</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="e.g. Lentil soup, oats, salmon..."
                  value={mealText}
                  onChange={(e) => setMealText(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-teal-600 text-white rounded-xl text-xs font-semibold hover:bg-teal-700"
                >
                  Add
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-sm pb-2 border-b border-slate-100">
              Postpartum Healing & Lactation Nutrition Guide
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <strong className="block text-teal-800 font-semibold mb-1">🥩 Iron & Protein for Tissue Repair</strong>
                <p>Lean meats, eggs, beans, spinach, and bone broth replenish lost iron stores and support cesarean or perineal healing.</p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <strong className="block text-teal-800 font-semibold mb-1">🌾 Fiber & Digestive Health</strong>
                <p>Oatmeal, chia seeds, prunes, and warm soups prevent constipation, reducing strain on healing pelvic muscles.</p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <strong className="block text-teal-800 font-semibold mb-1">🥛 Calcium & Healthy Fats</strong>
                <p>Yogurt, pasteurized cheese, avocados, and salmon deliver omega-3 DHA into breast milk for newborn brain development.</p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <strong className="block text-teal-800 font-semibold mb-1">💧 Electrolyte Replenishment</strong>
                <p>Keep a reusable bottle beside your nursing chair. Drinking a glass of water during each feed maintains milk supply.</p>
              </div>
            </div>

            {/* Meals logged today */}
            <div className="pt-3 border-t border-slate-100">
              <h4 className="font-semibold text-xs text-slate-700 mb-2">Meals Logged Today:</h4>
              {todayNutrition.mealsLogged?.length === 0 ? (
                <p className="text-xs text-slate-400">No meals logged yet today.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {todayNutrition.mealsLogged?.map((meal, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-xl bg-teal-50 text-teal-800 text-xs font-medium border border-teal-100">
                      🍲 {meal}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
