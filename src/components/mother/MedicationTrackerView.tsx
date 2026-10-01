import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Pill, Plus, CheckCircle2, XCircle, Clock, AlertCircle, Info, Calendar } from 'lucide-react';

export const MedicationTrackerView: React.FC = () => {
  const { patientRecord, currentUser, refreshData } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [medName, setMedName] = useState('');
  const [medDose, setMedDose] = useState('');
  const [medFreq, setMedFreq] = useState('Once daily');
  const [medInstructions, setMedInstructions] = useState('');
  const [medTime, setMedTime] = useState('08:00');
  const [medStartDate, setMedStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [medEndDate, setMedEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!patientRecord) return null;

  const { medications } = patientRecord;
  const todayStr = new Date().toISOString().split('T')[0];

  const handleStatusChange = async (medId: string, time: string, status: 'taken' | 'missed') => {
    try {
      await api.updateMedicationStatus({
        medicationId: medId,
        status,
        date: todayStr,
        time,
      });
      refreshData();
    } catch (err) {
      console.error('Failed to update med status:', err);
    }
  };

  const handleAddMed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !medName || !medDose) return;
    setSubmitting(true);
    try {
      await api.addMedication({
        userId: currentUser.id,
        name: medName,
        dose: medDose,
        frequency: medFreq,
        instructions: medInstructions,
        startDate: medStartDate,
        endDate: medEndDate,
        reminderTimes: [medTime],
      });
      setShowAddModal(false);
      setMedName('');
      setMedDose('');
      setMedInstructions('');
      refreshData();
    } catch (err) {
      console.error('Failed to add medication:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Compute adherence rate
  const allLogs = medications.flatMap((m) => m.logs || []);
  const takenCount = allLogs.filter((l) => l.status === 'taken').length;
  const totalCount = allLogs.length;
  const adherencePercent = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 100;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header & Adherence Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-slate-900 tracking-tight">Medication Tracker</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            View your post-discharge medication schedule, record doses taken, and track consistency.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs flex items-center space-x-1.5 self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add Prescribed Medication</span>
        </button>
      </div>

      {/* Clinical Disclaimer */}
      <div className="p-3.5 bg-purple-50 rounded-2xl border border-purple-200 text-xs text-purple-900 flex items-start space-x-2">
        <Info className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Important Clinical Guidance:</strong> This schedule reflects medications prescribed at your hospital discharge. Never stop, adjust doses, or start new over-the-counter medications without consulting Dr. Sarah Jenkins or your attending physician.
        </p>
      </div>

      {/* Adherence Overview Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Overall Adherence</span>
            <span className="text-3xl font-extrabold text-teal-800 font-serif">{adherencePercent}%</span>
            <span className="text-[11px] text-teal-600 block mt-0.5">High consistency protects recovery</span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-lg">
            💊
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Active Prescriptions</span>
            <span className="text-3xl font-extrabold text-slate-900 font-serif">{medications.length}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Monitored by care team</span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg">
            📋
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Doses Logged</span>
            <span className="text-3xl font-extrabold text-sky-900 font-serif">{takenCount}</span>
            <span className="text-[11px] text-sky-600 block mt-0.5">Documented in clinical record</span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-lg">
            ✅
          </div>
        </div>
      </div>

      {/* Today's Checklist & Scheduled Medications */}
      <div className="space-y-4">
        <h2 className="font-bold text-slate-800 text-sm">Today's Medication Schedule ({todayStr})</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {medications.map((med) => (
            <div key={med.id} className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-base text-slate-900">{med.name}</span>
                    <span className="text-xs font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full">
                      {med.dose}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{med.frequency}</p>
                </div>
                <Pill className="w-5 h-5 text-teal-600" />
              </div>

              {med.instructions && (
                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600">
                  <strong className="text-slate-700">Instructions: </strong> {med.instructions}
                </div>
              )}

              {/* Reminder times checklist for today */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-700 block">Scheduled Times:</span>
                {med.reminderTimes.map((time) => {
                  const log = med.logs?.find((l) => l.date === todayStr && l.time === time);
                  const status = log?.status || 'pending';

                  return (
                    <div
                      key={time}
                      className="p-3 rounded-2xl border border-slate-100 bg-slate-50/60 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-bold text-slate-800">{time}</span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            status === 'taken'
                              ? 'bg-emerald-100 text-emerald-800'
                              : status === 'missed'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {status.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleStatusChange(med.id, time, 'taken')}
                          className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-colors ${
                            status === 'taken'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Taken</span>
                        </button>
                        <button
                          onClick={() => handleStatusChange(med.id, time, 'missed')}
                          className={`px-2 py-1 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-colors ${
                            status === 'missed'
                              ? 'bg-rose-600 text-white'
                              : 'bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-800'
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-[10px] text-slate-400 pt-1">
                Prescribed from {med.startDate} {med.endDate ? `to ${med.endDate}` : ''}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Medication Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-slate-800 text-base mb-1">Add Prescribed Medication</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter medication information exactly as printed on your prescription label.
            </p>

            <form onSubmit={handleAddMed} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Medicine Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Labetalol or Iron"
                    value={medName}
                    onChange={(e) => setMedName(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Dosage</label>
                  <input
                    type="text"
                    placeholder="e.g. 100 mg or 1 tablet"
                    value={medDose}
                    onChange={(e) => setMedDose(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Frequency</label>
                  <input
                    type="text"
                    placeholder="e.g. Twice daily with meals"
                    value={medFreq}
                    onChange={(e) => setMedFreq(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Reminder Time</label>
                  <input
                    type="time"
                    value={medTime}
                    onChange={(e) => setMedTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Instructions / Food Rules</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Take with food or full glass of water. Measure BP first..."
                  value={medInstructions}
                  onChange={(e) => setMedInstructions(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs"
                >
                  {submitting ? 'Saving...' : 'Save Medication'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
