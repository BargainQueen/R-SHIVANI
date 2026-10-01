import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  Baby,
  Utensils,
  ShieldCheck,
  Thermometer,
  TrendingUp,
  Clock,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Calendar,
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

export const BabyCareView: React.FC = () => {
  const { patientRecord, currentUser, refreshData } = useApp();

  const [babyTab, setBabyTab] = useState<'feeding' | 'vaccines' | 'health' | 'growth'>('feeding');

  // Feeding Form State
  const [feedType, setFeedType] = useState<'breast' | 'formula' | 'mixed'>('breast');
  const [breastSide, setBreastSide] = useState<'left' | 'right' | 'both'>('both');
  const [feedDuration, setFeedDuration] = useState('20');
  const [formulaAmount, setFormulaAmount] = useState('60');
  const [feedNotes, setFeedNotes] = useState('');
  const [feedSubmitting, setFeedSubmitting] = useState(false);

  // Health Form State
  const [tempF, setTempF] = useState('98.6');
  const [wetDiapers, setWetDiapers] = useState('5');
  const [dirtyDiapers, setDirtyDiapers] = useState('3');
  const [sleepHours, setSleepHours] = useState('14.5');
  const [jaundice, setJaundice] = useState<'none' | 'face_only' | 'chest_limbs'>('face_only');
  const [cordStatus, setCordStatus] = useState<'clean_dry' | 'slight_redness' | 'discharge_odor'>('clean_dry');
  const [parentObs, setParentObs] = useState('');
  const [healthSubmitting, setHealthSubmitting] = useState(false);
  const [healthAlertTriggered, setHealthAlertTriggered] = useState(false);

  // Growth Form State
  const [growthAgeWeeks, setGrowthAgeWeeks] = useState('1');
  const [growthWeightKg, setGrowthWeightKg] = useState('3.3');
  const [growthLengthCm, setGrowthLengthCm] = useState('51.0');
  const [growthHeadCircCm, setGrowthHeadCircCm] = useState('34.8');
  const [growthNotes, setGrowthNotes] = useState('');
  const [growthSubmitting, setGrowthSubmitting] = useState(false);

  // Add Vaccine Form State
  const [showAddVacModal, setShowAddVacModal] = useState(false);
  const [newVacName, setNewVacName] = useState('');
  const [newVacAge, setNewVacAge] = useState('');
  const [newVacDueDate, setNewVacDueDate] = useState('');

  if (!patientRecord) return null;

  const { profile, feedingLogs, vaccinations, newbornHealthLogs, growthRecords } = patientRecord;

  // Feeding Submit
  const handleFeedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setFeedSubmitting(true);
    try {
      await api.logFeeding({
        userId: currentUser.id,
        type: feedType,
        side: feedType === 'breast' ? breastSide : undefined,
        durationMinutes: feedDuration ? parseInt(feedDuration) : undefined,
        amountMl: feedType !== 'breast' ? parseInt(formulaAmount) : undefined,
        notes: feedNotes,
      });
      setFeedNotes('');
      refreshData();
    } catch (err) {
      console.error('Failed to log feed:', err);
    } finally {
      setFeedSubmitting(false);
    }
  };

  // Health Submit
  const handleHealthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setHealthSubmitting(true);
    try {
      const res = await api.logNewbornHealth({
        userId: currentUser.id,
        temperatureF: parseFloat(tempF),
        wetDiapers: parseInt(wetDiapers),
        dirtyDiapers: parseInt(dirtyDiapers),
        sleepHours: parseFloat(sleepHours),
        jaundiceObservation: jaundice,
        umbilicalCordStatus: cordStatus,
        parentObservations: parentObs,
      });
      setHealthAlertTriggered(res.urgentAlert);
      setParentObs('');
      refreshData();
    } catch (err) {
      console.error('Failed to log newborn health:', err);
    } finally {
      setHealthSubmitting(false);
    }
  };

  // Growth Submit
  const handleGrowthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !growthWeightKg) return;
    setGrowthSubmitting(true);
    try {
      await api.logGrowth({
        userId: currentUser.id,
        ageWeeks: parseFloat(growthAgeWeeks),
        weightKg: parseFloat(growthWeightKg),
        lengthCm: parseFloat(growthLengthCm),
        headCircumferenceCm: parseFloat(growthHeadCircCm),
        notes: growthNotes,
      });
      setGrowthNotes('');
      refreshData();
    } catch (err) {
      console.error('Failed to log growth:', err);
    } finally {
      setGrowthSubmitting(false);
    }
  };

  // Add Custom Vaccine
  const handleAddVaccine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newVacName) return;
    try {
      await api.recordVaccination({
        userId: currentUser.id,
        vaccineName: newVacName,
        targetAgeDescription: newVacAge || 'Configurable',
        dueDate: newVacDueDate || new Date().toISOString().split('T')[0],
        status: 'upcoming',
      });
      setShowAddVacModal(false);
      setNewVacName('');
      refreshData();
    } catch (err) {
      console.error('Failed to add vaccine:', err);
    }
  };

  // Growth chart data with WHO 50th percentile reference
  const growthChartData = growthRecords.map((r) => ({
    week: `Wk ${r.ageWeeks}`,
    weight: r.weightKg,
    length: r.lengthCm,
    whoReferenceWeight: 3.3 + r.ageWeeks * 0.18, // WHO infant approximate median curve
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold font-serif text-slate-900 tracking-tight">
              Baby Care: {profile.babyName}
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-sky-100 text-sky-800">
              {profile.babyGender === 'female' ? 'Baby Girl' : 'Baby Boy'} • {profile.postpartumDay} Days Old
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Track daily feeds, monitor hydration diapers, follow clinical vaccination schedules, and graph infant growth.
          </p>
        </div>

        {/* Baby care sub tabs */}
        <div className="flex bg-slate-100 p-1 rounded-2xl overflow-x-auto no-scrollbar">
          <button
            onClick={() => setBabyTab('feeding')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              babyTab === 'feeding' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Feeding Tracker
          </button>
          <button
            onClick={() => setBabyTab('vaccines')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              babyTab === 'vaccines' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Vaccinations
          </button>
          <button
            onClick={() => setBabyTab('health')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              babyTab === 'health' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Health & Diapers
          </button>
          <button
            onClick={() => setBabyTab('growth')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              babyTab === 'growth' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Growth Charts
          </button>
        </div>
      </div>

      {/* 1. Feeding Tracker */}
      {babyTab === 'feeding' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
              <Utensils className="w-5 h-5 text-teal-600" />
              <h2 className="font-bold text-slate-800 text-sm">Log Baby Feed</h2>
            </div>

            <form onSubmit={handleFeedSubmit} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Feeding Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['breast', 'formula', 'mixed'] as const).map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setFeedType(t)}
                      className={`p-2 rounded-xl text-xs font-bold capitalize border transition-all ${
                        feedType === t
                          ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {feedType === 'breast' && (
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Breast Side</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['left', 'right', 'both'] as const).map((side) => (
                      <button
                        type="button"
                        key={side}
                        onClick={() => setBreastSide(side)}
                        className={`p-2 rounded-xl text-xs font-medium capitalize border transition-all ${
                          breastSide === side
                            ? 'bg-teal-100 text-teal-900 border-teal-300 font-bold'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        {side}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={feedDuration}
                    onChange={(e) => setFeedDuration(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>

                {feedType !== 'breast' && (
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Formula Amount (mL)</label>
                    <input
                      type="number"
                      min="10"
                      max="300"
                      step="5"
                      value={formulaAmount}
                      onChange={(e) => setFormulaAmount(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Observations</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Latched smoothly, burped twice, fell asleep content..."
                  value={feedNotes}
                  onChange={(e) => setFeedNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>

              <button
                type="submit"
                disabled={feedSubmitting}
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs transition-colors"
              >
                {feedSubmitting ? 'Saving...' : 'Save Feeding Session'}
              </button>
            </form>
          </div>

          {/* Feed History Timeline */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-bold text-slate-800 text-sm">Feeding Timeline</h2>
              <span className="text-xs text-slate-500">{feedingLogs.length} Sessions Logged</span>
            </div>

            <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
              {feedingLogs.length === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center">No feeds recorded yet today.</p>
              ) : (
                feedingLogs.map((feed) => (
                  <div key={feed.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between text-xs">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 capitalize">
                          🍼 {feed.type} Feeding {feed.side ? `(${feed.side} breast)` : ''}
                        </span>
                        {feed.amountMl && (
                          <span className="px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 text-[10px] font-bold">
                            {feed.amountMl} mL
                          </span>
                        )}
                        {feed.durationMinutes && (
                          <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 text-[10px] font-bold">
                            {feed.durationMinutes} mins
                          </span>
                        )}
                      </div>
                      {feed.notes && <p className="text-slate-600 text-[11px] mt-1 italic">"{feed.notes}"</p>}
                    </div>
                    <span className="text-slate-400 text-[10px]">
                      {new Date(feed.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Vaccination Tracker */}
      {babyTab === 'vaccines' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div>
              <h2 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <span>Newborn Immunization Record & Schedule</span>
              </h2>
              <p className="text-xs text-slate-500">
                Recommended clinical schedule based on national maternal-child health guidelines.
              </p>
            </div>
            <button
              onClick={() => setShowAddVacModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Vaccine</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {vaccinations.map((vac) => {
              const isDone = vac.status === 'completed';
              return (
                <div key={vac.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-slate-900">{vac.vaccineName}</span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {vac.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Target Age: <strong className="text-slate-700">{vac.targetAgeDescription}</strong> • Due: {vac.dueDate}
                    </div>
                    {vac.providerLocation && (
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Administered at: {vac.providerLocation} {vac.batchNumber ? `(Batch: ${vac.batchNumber})` : ''}
                      </div>
                    )}
                  </div>

                  {!isDone && (
                    <button
                      onClick={async () => {
                        await api.recordVaccination({
                          id: vac.id,
                          userId: currentUser?.id || '',
                          vaccineName: vac.vaccineName,
                          status: 'completed',
                          givenDate: new Date().toISOString().split('T')[0],
                        });
                        refreshData();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold whitespace-nowrap self-start sm:self-center"
                    >
                      Mark as Completed
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add Vaccine Modal */}
          {showAddVacModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
                <h3 className="font-bold text-slate-800 text-sm mb-3">Add Vaccine Entry</h3>
                <form onSubmit={handleAddVaccine} className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Vaccine Name</label>
                    <input
                      type="text"
                      placeholder="e.g. BCG or Influenza"
                      value={newVacName}
                      onChange={(e) => setNewVacName(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Target Age Period</label>
                    <input
                      type="text"
                      placeholder="e.g. 6 Months"
                      value={newVacAge}
                      onChange={(e) => setNewVacAge(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Due Date</label>
                    <input
                      type="date"
                      value={newVacDueDate}
                      onChange={(e) => setNewVacDueDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddVacModal(false)}
                      className="px-3 py-1.5 rounded-xl text-xs text-slate-600 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-semibold"
                    >
                      Save Vaccine
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Newborn Health & Diapers */}
      {babyTab === 'health' && (
        <div className="space-y-6">
          {healthAlertTriggered && (
            <div className="p-4 rounded-3xl bg-rose-50 border border-rose-300 text-rose-950 flex items-start space-x-3 animate-urgent-pulse">
              <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <strong className="font-bold text-sm block">CLINICAL ALERT TRIGGERED</strong>
                <p className="mt-1 leading-relaxed">
                  Infant fever (≥ 100.4°F) or low diaper output (&lt;3 wet diapers in 24 hours) requires prompt clinical assessment. Contact your pediatrician or pediatric emergency department immediately.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
                <Thermometer className="w-5 h-5 text-sky-600" />
                <h2 className="font-bold text-slate-800 text-sm">Log Newborn Vitals</h2>
              </div>

              <form onSubmit={handleHealthSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Rectal / Axillary Temperature (°F)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="95"
                    max="106"
                    value={tempF}
                    onChange={(e) => setTempF(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Normal: 97.7°F – 99.5°F. ≥ 100.4°F is an infant fever emergency!
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Wet Diapers (24h)</label>
                    <input
                      type="number"
                      min="0"
                      max="15"
                      value={wetDiapers}
                      onChange={(e) => setWetDiapers(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Target: ≥ 5 daily after day 4</span>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Dirty Diapers (24h)</label>
                    <input
                      type="number"
                      min="0"
                      max="15"
                      value={dirtyDiapers}
                      onChange={(e) => setDirtyDiapers(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Mustard seedy stools</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Jaundice Skin Observation</label>
                  <select
                    value={jaundice}
                    onChange={(e) => setJaundice(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                  >
                    <option value="none">No yellow tint (Clear)</option>
                    <option value="face_only">Mild yellowing face / forehead only</option>
                    <option value="chest_limbs">Yellowing extending down chest, abdomen, or legs (Notify Doctor)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Umbilical Cord Stump</label>
                  <select
                    value={cordStatus}
                    onChange={(e) => setCordStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                  >
                    <option value="clean_dry">Clean, dry, and odorless</option>
                    <option value="slight_redness">Slight redness around base ring</option>
                    <option value="discharge_odor">Foul odor, active pus, or pronounced swelling (Urgent)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Parent Observations</label>
                  <textarea
                    rows={2}
                    placeholder="Alertness, cry strength, skin color..."
                    value={parentObs}
                    onChange={(e) => setParentObs(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={healthSubmitting}
                  className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs"
                >
                  {healthSubmitting ? 'Evaluating...' : 'Save Health Observation'}
                </button>
              </form>
            </div>

            {/* Health Logs History */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
              <h2 className="font-bold text-slate-800 text-sm pb-3 border-b border-slate-100">
                Newborn Health Observation History
              </h2>

              <div className="mt-4 space-y-3">
                {newbornHealthLogs.map((log) => (
                  <div key={log.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-800 text-sm">
                        🌡️ {log.temperatureF}°F • {log.wetDiapers} Wet / {log.dirtyDiapers} Dirty Diapers
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                      <div>
                        <strong>Jaundice:</strong> {log.jaundiceObservation.replace('_', ' ')}
                      </div>
                      <div>
                        <strong>Cord:</strong> {log.umbilicalCordStatus.replace('_', ' ')}
                      </div>
                    </div>

                    {log.parentObservations && (
                      <p className="mt-2 text-slate-600 text-[11px] italic">"{log.parentObservations}"</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Growth Tracker */}
      {babyTab === 'growth' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
                <TrendingUp className="w-5 h-5 text-teal-600" />
                <h2 className="font-bold text-slate-800 text-sm">Record Growth Metrics</h2>
              </div>

              <form onSubmit={handleGrowthSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Age in Weeks</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="52"
                    value={growthAgeWeeks}
                    onChange={(e) => setGrowthAgeWeeks(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max="20"
                    value={growthWeightKg}
                    onChange={(e) => setGrowthWeightKg(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 font-bold"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    (Approx {(parseFloat(growthWeightKg || '0') * 2.20462).toFixed(1)} lbs)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Length (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="35"
                      max="100"
                      value={growthLengthCm}
                      onChange={(e) => setGrowthLengthCm(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Head Circ (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="25"
                      max="60"
                      value={growthHeadCircCm}
                      onChange={(e) => setGrowthHeadCircCm(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Pediatrician clinic weigh-in"
                    value={growthNotes}
                    onChange={(e) => setGrowthNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={growthSubmitting}
                  className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs"
                >
                  {growthSubmitting ? 'Saving...' : 'Save Measurement'}
                </button>
              </form>
            </div>

            {/* Growth Curve Chart */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="font-bold text-slate-800 text-sm">Weight Progression Curve (kg)</h2>
                    <p className="text-[11px] text-slate-500">
                      Plotted against World Health Organization (WHO) Infant Growth Reference Standard
                    </p>
                  </div>
                  <div className="flex items-center space-x-3 text-xs">
                    <span className="flex items-center space-x-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block" />
                      <span>{profile.babyName}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
                      <span>WHO 50th %tile</span>
                    </span>
                  </div>
                </div>

                <div className="h-64 w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={growthChartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis domain={[2.0, 5.0]} tick={{ fontSize: 10, fill: '#64748b' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0',
                          fontSize: '11px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="whoReferenceWeight"
                        stroke="#94a3b8"
                        strokeDasharray="4 4"
                        strokeWidth={2}
                        dot={false}
                        name="WHO Standard (kg)"
                      />
                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="#0d9488"
                        strokeWidth={2.5}
                        dot={{ r: 5, fill: '#0d9488' }}
                        name={`${profile.babyName} Weight (kg)`}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Growth log list */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <h3 className="font-semibold text-xs text-slate-700 mb-2">Recorded Measurements:</h3>
                <div className="space-y-1.5 text-xs text-slate-600">
                  {growthRecords.map((r) => (
                    <div key={r.id} className="p-2 rounded-xl bg-slate-50 flex items-center justify-between">
                      <span className="font-bold text-slate-800">
                        Week {r.ageWeeks}: {r.weightKg} kg ({r.lengthCm} cm length, {r.headCircumferenceCm} cm head)
                      </span>
                      <span className="text-[10px] text-slate-400">{r.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
