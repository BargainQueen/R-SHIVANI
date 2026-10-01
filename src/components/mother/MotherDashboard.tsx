import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  HeartPulse,
  Baby,
  Calendar,
  Pill,
  Droplets,
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  Smile,
  ShieldCheck,
  Plus,
} from 'lucide-react';

export const MotherDashboard: React.FC = () => {
  const { patientRecord, setCurrentTab, refreshData, currentUser } = useApp();
  const [quickCheckinOpen, setQuickCheckinOpen] = useState(false);
  const [selectedMood, setSelectedMood] = useState<'great' | 'good' | 'neutral' | 'struggling' | 'overwhelmed'>('good');
  const [sleepHours, setSleepHours] = useState(6);
  const [anxietyScore, setAnxietyScore] = useState(2);
  const [checkinSubmitting, setCheckinSubmitting] = useState(false);
  const [quickHydrationSuccess, setQuickHydrationSuccess] = useState(false);

  if (!patientRecord) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-600 text-sm">Loading your postpartum care dashboard...</p>
      </div>
    );
  }

  const { profile, bloodPressureLogs, medications, nutritionLogs, feedingLogs, vaccinations, appointments } =
    patientRecord;

  const postpartumDay = profile.postpartumDay || 1;
  const latestBp = bloodPressureLogs[bloodPressureLogs.length - 1];
  const todayNutrition = nutritionLogs[0] || { waterMl: 1250, targetWaterMl: 2800 };
  const waterProgress = Math.min(100, Math.round((todayNutrition.waterMl / todayNutrition.targetWaterMl) * 100));

  // Today's pending medications
  const todayStr = new Date().toISOString().split('T')[0];
  const allMedReminders = medications.flatMap((med) =>
    med.reminderTimes.map((time) => {
      const existingLog = med.logs?.find((l) => l.date === todayStr && l.time === time);
      return {
        medicationId: med.id,
        name: med.name,
        dose: med.dose,
        time,
        status: existingLog?.status || 'pending',
      };
    })
  );

  const handleMarkTaken = async (medId: string, time: string) => {
    try {
      await api.updateMedicationStatus({
        medicationId: medId,
        status: 'taken',
        date: todayStr,
        time,
      });
      refreshData();
    } catch (err) {
      console.error('Failed to mark taken:', err);
    }
  };

  const handleQuickAddWater = async (amount: number) => {
    if (!currentUser) return;
    try {
      await api.logNutrition({
        userId: currentUser.id,
        waterMl: amount,
      });
      setQuickHydrationSuccess(true);
      setTimeout(() => setQuickHydrationSuccess(false), 2000);
      refreshData();
    } catch (err) {
      console.error('Failed to log water:', err);
    }
  };

  const handleDailyCheckinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setCheckinSubmitting(true);
    try {
      const moodMap = { great: 5, good: 4, neutral: 3, struggling: 2, overwhelmed: 1 };
      await api.recordWellbeing({
        userId: currentUser.id,
        mood: selectedMood,
        moodScore: moodMap[selectedMood],
        sleepHours,
        anxietyLevel: anxietyScore,
      });
      setQuickCheckinOpen(false);
      refreshData();
    } catch (err) {
      console.error('Failed to record checkin:', err);
    } finally {
      setCheckinSubmitting(false);
    }
  };

  const nextAppointment = appointments.find((a) => a.status === 'scheduled');
  const nextVaccine = vaccinations.find((v) => v.status === 'upcoming');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Welcome & Postpartum Counter Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-600 via-teal-700 to-cyan-800 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Postpartum Day {postpartumDay} Recovery</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight">
              Welcome back, {profile.patientName.split(' ')[0]}
            </h1>
            <p className="mt-1 text-teal-100 text-xs sm:text-sm max-w-xl">
              Caring for baby <span className="font-semibold text-white">{profile.babyName}</span> ({profile.deliveryType} delivery on {profile.babyDob}).
              Here is your daily recovery and neonatal health summary.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setQuickCheckinOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white text-teal-800 hover:bg-teal-50 text-xs sm:text-sm font-semibold shadow-md transition-all flex items-center space-x-1.5"
            >
              <Smile className="w-4 h-4 text-teal-600" />
              <span>Daily Wellbeing Check-in</span>
            </button>
            <button
              onClick={() => setCurrentTab('ai-assistant')}
              className="px-4 py-2.5 rounded-xl bg-teal-500/40 hover:bg-teal-500/60 backdrop-blur-md text-white text-xs sm:text-sm font-semibold border border-white/30 transition-all flex items-center space-x-1.5"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>Ask Gemini AI</span>
            </button>
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      </div>

      {/* Quick Daily Check-in Modal */}
      {quickCheckinOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Smile className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-800 text-base">How are you feeling today?</h3>
              </div>
              <button onClick={() => setQuickCheckinOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleDailyCheckinSubmit} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-2">Overall Mood</label>
                <div className="grid grid-cols-5 gap-1.5 text-center">
                  {(['great', 'good', 'neutral', 'struggling', 'overwhelmed'] as const).map((m) => (
                    <button
                      type="button"
                      key={m}
                      onClick={() => setSelectedMood(m)}
                      className={`p-2 rounded-xl text-xs font-semibold capitalize border transition-all ${
                        selectedMood === m
                          ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {m === 'great' && '🌸'}
                      {m === 'good' && '✨'}
                      {m === 'neutral' && '🌱'}
                      {m === 'struggling' && '🌧️'}
                      {m === 'overwhelmed' && '⚡'}
                      <div className="mt-1 text-[10px]">{m}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 flex justify-between">
                  <span>Sleep Total (Past 24h)</span>
                  <span className="text-teal-600 font-bold">{sleepHours} hrs</span>
                </label>
                <input
                  type="range"
                  min="2"
                  max="12"
                  step="0.5"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                  className="w-full accent-teal-600 mt-1 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 flex justify-between">
                  <span>Stress / Anxiety Level</span>
                  <span className="text-teal-600 font-bold">{anxietyScore} / 5</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={anxietyScore}
                  onChange={(e) => setAnxietyScore(parseInt(e.target.value))}
                  className="w-full accent-teal-600 mt-1 cursor-pointer"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setQuickCheckinOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={checkinSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-sm"
                >
                  {checkinSubmitting ? 'Saving...' : 'Save Check-in'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid of Key Postpartum Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Maternal Recovery Summary */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <HeartPulse className="w-5 h-5" />
              </div>
              <h2 className="font-bold text-slate-800 text-sm">Maternal Recovery</h2>
            </div>
            <button
              onClick={() => setCurrentTab('recovery')}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center"
            >
              Details <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>

          <div className="mt-4 space-y-3.5">
            {/* Blood Pressure status */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500 block">Latest Blood Pressure</span>
                <span className="text-base font-bold text-slate-800">
                  {latestBp ? `${latestBp.systolic} / ${latestBp.diastolic} mmHg` : 'No reading yet'}
                </span>
              </div>
              {latestBp && (
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    latestBp.status === 'normal'
                      ? 'bg-emerald-100 text-emerald-800'
                      : latestBp.status === 'stage1'
                      ? 'bg-amber-100 text-amber-800 animate-pulse'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {latestBp.status.toUpperCase()}
                </span>
              )}
            </div>

            {/* Hydration tracker */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                <span className="flex items-center space-x-1 font-medium">
                  <Droplets className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Hydration Target</span>
                </span>
                <span className="font-semibold text-slate-800">
                  {todayNutrition.waterMl} / {todayNutrition.targetWaterMl} mL ({waterProgress}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${waterProgress}%` }}
                />
              </div>

              <div className="flex items-center justify-between mt-2">
                <button
                  onClick={() => handleQuickAddWater(250)}
                  className="text-[11px] font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-lg transition-colors flex items-center space-x-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>+250 mL Glass</span>
                </button>
                {quickHydrationSuccess && (
                  <span className="text-[10px] text-emerald-600 font-semibold animate-fade-in">Logged!</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Newborn Care Summary */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Baby className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-800 text-sm">Baby {profile.babyName.split(' ')[0]}</h2>
                <span className="text-[10px] text-slate-400">Day {postpartumDay} of life</span>
              </div>
            </div>
            <button
              onClick={() => setCurrentTab('baby')}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center"
            >
              Details <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <div className="p-3 bg-sky-50/60 rounded-2xl border border-sky-100 text-center">
              <span className="text-[10px] font-medium text-slate-500 block">Today's Feeds</span>
              <span className="text-xl font-bold text-sky-900">{feedingLogs.length}</span>
              <span className="text-[10px] text-sky-700 block mt-0.5">Nursing & Formula</span>
            </div>

            <div className="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-100 text-center">
              <span className="text-[10px] font-medium text-slate-500 block">Diapers Count</span>
              <span className="text-xl font-bold text-indigo-900">
                {patientRecord.newbornHealthLogs[0]?.wetDiapers || 5} Wet / {patientRecord.newbornHealthLogs[0]?.dirtyDiapers || 3} Dirty
              </span>
              <span className="text-[10px] text-indigo-700 block mt-0.5">Good Hydration</span>
            </div>
          </div>

          <div className="mt-3.5 p-2.5 bg-slate-50 rounded-xl text-xs text-slate-600 flex items-center justify-between">
            <span className="text-slate-500">Latest Temp:</span>
            <span className="font-bold text-slate-800">{patientRecord.newbornHealthLogs[0]?.temperatureF || 98.4}°F (Normal)</span>
          </div>
        </div>

        {/* Card 3: Today's Medication Schedule */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Pill className="w-5 h-5" />
              </div>
              <h2 className="font-bold text-slate-800 text-sm">Today's Medicines</h2>
            </div>
            <button
              onClick={() => setCurrentTab('medicines')}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center"
            >
              All Meds <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>

          <div className="mt-3 space-y-2 max-h-52 overflow-y-auto">
            {allMedReminders.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No scheduled medicines today.</p>
            ) : (
              allMedReminders.slice(0, 4).map((rem, idx) => (
                <div
                  key={`${rem.medicationId}-${idx}`}
                  className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-xs text-slate-800">{rem.name}</div>
                    <div className="text-[10px] text-slate-500">
                      {rem.dose} • {rem.time}
                    </div>
                  </div>

                  {rem.status === 'taken' ? (
                    <span className="inline-flex items-center text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Taken
                    </span>
                  ) : (
                    <button
                      onClick={() => handleMarkTaken(rem.medicationId, rem.time)}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
                    >
                      Take
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Care Coordination & Upcoming Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next Appointment & Care Team */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-teal-600" />
              <h2 className="font-bold text-slate-800 text-sm">Next Care Appointment</h2>
            </div>
            <button
              onClick={() => setCurrentTab('appointments')}
              className="text-xs text-teal-600 font-semibold hover:text-teal-700"
            >
              View Schedule
            </button>
          </div>

          {nextAppointment ? (
            <div className="mt-4 p-4 rounded-2xl bg-teal-50/50 border border-teal-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 px-2 py-0.5 bg-teal-100 rounded-md">
                    {nextAppointment.type === 'telehealth' ? 'Virtual Video Visit' : 'Clinic In-Person'}
                  </span>
                  {nextAppointment.isAutoScheduled && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 px-2 py-0.5 bg-rose-100 rounded-md border border-rose-200">
                      🚨 Auto-Scheduled (Urgent Alert)
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-slate-900 text-sm mt-1">{nextAppointment.title}</h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  With {nextAppointment.doctorName} • {nextAppointment.date} at {nextAppointment.time}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">{nextAppointment.location}</p>
              </div>
              <button
                onClick={() => setCurrentTab('appointments')}
                className="px-3.5 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 whitespace-nowrap shadow-xs"
              >
                Appointment Details
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-500 mt-4">No upcoming appointments scheduled.</p>
          )}

          {/* Assigned Care Team */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <div>
              <span className="text-slate-400 block text-[10px]">Attending Obstetrician:</span>
              <span className="font-semibold text-slate-800">{profile.assignedDoctorName}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[10px]">Primary Postpartum Nurse:</span>
              <span className="font-semibold text-slate-800">{profile.assignedNurseName}</span>
            </div>
          </div>
        </div>

        {/* Baby Upcoming Vaccination & Milestones */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <h2 className="font-bold text-slate-800 text-sm">Baby Vaccination Timeline</h2>
            </div>
            <button
              onClick={() => setCurrentTab('baby')}
              className="text-xs text-indigo-600 font-semibold hover:text-indigo-700"
            >
              Full Schedule
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {nextVaccine ? (
              <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 px-2 py-0.5 bg-indigo-100 rounded-md">
                    Upcoming Next
                  </span>
                  <div className="font-bold text-xs text-slate-900 mt-1">{nextVaccine.vaccineName}</div>
                  <div className="text-[11px] text-slate-500">
                    Recommended Target: {nextVaccine.targetAgeDescription} (Due: {nextVaccine.dueDate})
                  </div>
                </div>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  Upcoming
                </span>
              </div>
            ) : (
              <p className="text-xs text-slate-500">All current infant vaccinations are up-to-date!</p>
            )}

            <div className="p-3 rounded-xl bg-slate-50 text-[11px] text-slate-600 flex items-center justify-between">
              <span>Hepatitis B (Birth Dose):</span>
              <span className="text-emerald-700 font-bold flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Completed at Hospital
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
