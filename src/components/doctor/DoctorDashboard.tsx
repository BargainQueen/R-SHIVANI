import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api, PatientDetailedRecord } from '../../services/api';
import { DoctorAvailabilitySlot } from '../../types';
import {
  Stethoscope,
  Users,
  AlertTriangle,
  Calendar,
  Sparkles,
  Search,
  Filter,
  ChevronRight,
  Activity,
  HeartPulse,
  Baby,
  Pill,
  FileText,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Plus,
  Loader2,
  ShieldAlert,
  Cpu,
  Check,
  X,
  RefreshCw,
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
import { CareAlertsPanel } from '../common/CareAlertsPanel';

export const DoctorDashboard: React.FC = () => {
  const { patientList, refreshData, setCurrentTab } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<'all' | 'urgent' | 'warning' | 'stable'>('all');
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patientList[0]?.userId || 'usr_mother_1');
  const [detailedRecord, setDetailedRecord] = useState<PatientDetailedRecord | null>(null);
  const [loadingRecord, setLoadingRecord] = useState(false);

  // Clinical Note Modal
  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState('progress_note');
  const [noteSubmitting, setNoteSubmitting] = useState(false);
  const [noteSuccess, setNoteSuccess] = useState(false);

  // AI Care Summary Workflow
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  // View Tab: Patients Panels vs Alerts Panel vs Schedule
  const [doctorViewTab, setDoctorViewTab] = useState<'patients' | 'alerts' | 'schedule'>('patients');

  // Doctor Availability Slots State
  const [slots, setSlots] = useState<DoctorAvailabilitySlot[]>([]);
  const [newSlotDate, setNewSlotDate] = useState('');
  const [newSlotTime, setNewSlotTime] = useState('09:30 AM');
  const [newSlotNotes, setNewSlotNotes] = useState('');
  const [addingSlot, setAddingSlot] = useState(false);
  const [togglingSlotId, setTogglingSlotId] = useState<string | null>(null);

  // Load Doctor Slots
  const loadSlots = async () => {
    try {
      const data = await api.getDoctorAvailability('usr_doc_1');
      setSlots(data);
    } catch (err) {
      console.error('Failed to load doctor availability slots:', err);
    }
  };

  useEffect(() => {
    loadSlots();
  }, []);

  const handleToggleSlot = async (slotId: string) => {
    setTogglingSlotId(slotId);
    try {
      const updated = await api.toggleDoctorAvailability(slotId);
      setSlots((prev) => prev.map((s) => (s.id === slotId ? updated : s)));
      refreshData();
    } catch (err) {
      console.error('Failed to toggle slot:', err);
    } finally {
      setTogglingSlotId(null);
    }
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlotDate || !newSlotTime) return;
    setAddingSlot(true);
    try {
      const newSlot = await api.addDoctorAvailability({
        doctorId: 'usr_doc_1',
        date: newSlotDate,
        time: newSlotTime,
        notes: newSlotNotes,
      });
      setSlots((prev) => [...prev, newSlot]);
      setNewSlotDate('');
      setNewSlotNotes('');
      refreshData();
    } catch (err) {
      console.error('Failed to add slot:', err);
    } finally {
      setAddingSlot(false);
    }
  };

  // Load selected patient record
  useEffect(() => {
    if (!selectedPatientId) return;
    async function loadRecord() {
      setLoadingRecord(true);
      try {
        const record = await api.getPatientRecord(selectedPatientId);
        setDetailedRecord(record);
      } catch (err) {
        console.error('Error loading patient detail:', err);
      } finally {
        setLoadingRecord(false);
      }
    }
    loadRecord();
  }, [selectedPatientId]);

  // Filter patients
  const filteredPatients = patientList.filter((p) => {
    const matchesSearch =
      p.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.babyName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = riskFilter === 'all' || p.riskStatus === riskFilter;
    return matchesSearch && matchesRisk;
  });

  const totalPatients = patientList.length;
  const totalUrgent = patientList.filter((p) => p.riskStatus === 'urgent').length;
  const totalWarning = patientList.filter((p) => p.riskStatus === 'warning').length;
  const totalPendingAlerts = patientList.reduce((acc, p) => acc + p.unreadAlertsCount, 0);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !noteContent.trim()) return;
    setNoteSubmitting(true);
    try {
      await api.addCareNote({
        patientId: selectedPatientId,
        authorId: 'usr_doc_1',
        authorName: 'Dr. Sarah Jenkins, MD',
        authorRole: 'doctor',
        noteType,
        content: noteContent.trim(),
      });
      setNoteContent('');
      setNoteSuccess(true);
      setTimeout(() => setNoteSuccess(false), 2000);
      refreshData();
      const updated = await api.getPatientRecord(selectedPatientId);
      setDetailedRecord(updated);
    } catch (err) {
      console.error('Failed to add note:', err);
    } finally {
      setNoteSubmitting(false);
    }
  };

  const handleGenerateAISummary = async () => {
    if (!selectedPatientId) return;
    setGeneratingSummary(true);
    try {
      const res = await api.generateAISummary(selectedPatientId);
      setAiSummary(res.summary);
    } catch (err) {
      console.error('Failed to generate summary:', err);
    } finally {
      setGeneratingSummary(false);
    }
  };

  const handleReviewAlert = async (alertId: string) => {
    try {
      await api.reviewAlert(alertId, {
        reviewedBy: 'Dr. Sarah Jenkins, MD',
        outcomeNotes: 'Clinician reviewed vitals and corroborated symptom resolution.',
      });
      refreshData();
      const updated = await api.getPatientRecord(selectedPatientId);
      setDetailedRecord(updated);
    } catch (err) {
      console.error('Failed to review alert:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Clinical Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-1 border border-emerald-200">
            <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
            <span>Obstetric & Postpartum Attending Physician Portal</span>
          </div>
          <h1 className="text-2xl font-bold font-serif text-slate-900 tracking-tight">
            Clinical Care Coordination Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Review maternal blood pressure trajectories, symptom triage alerts, newborn hydration, and AI-assisted care summaries.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Patients</span>
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif">{totalPatients}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Assigned to panel</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Active Alerts</span>
            <span className="text-2xl sm:text-3xl font-bold text-rose-700 font-serif">{totalPendingAlerts}</span>
            <span className="text-[11px] text-rose-600 font-medium block mt-0.5">Requiring review</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Urgent Triage</span>
            <span className="text-2xl sm:text-3xl font-bold text-amber-700 font-serif">{totalUrgent}</span>
            <span className="text-[11px] text-amber-600 font-medium block mt-0.5">Severe flag / Red alert</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Stable Trajectory</span>
            <span className="text-2xl sm:text-3xl font-bold text-emerald-800 font-serif">
              {totalPatients - totalUrgent - totalWarning}
            </span>
            <span className="text-[11px] text-emerald-600 font-medium block mt-0.5">Normal recovery</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Clinician Sub-Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setDoctorViewTab('patients')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            doctorViewTab === 'patients'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Patient Panels & Clinical Charts</span>
        </button>

        <button
          onClick={() => setDoctorViewTab('alerts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            doctorViewTab === 'alerts'
              ? 'bg-rose-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ShieldAlert className={`w-4 h-4 ${doctorViewTab === 'alerts' ? 'text-white' : 'text-rose-500'}`} />
          <span>Active Care Alerts Panel</span>
          {totalPendingAlerts > 0 && (
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                doctorViewTab === 'alerts' ? 'bg-rose-900 text-white' : 'bg-rose-100 text-rose-800 animate-pulse'
              }`}
            >
              {totalPendingAlerts} Active
            </span>
          )}
        </button>

        <button
          onClick={() => {
            setDoctorViewTab('schedule');
            loadSlots();
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            doctorViewTab === 'schedule'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Doctor Availability & Auto-Schedule</span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              doctorViewTab === 'schedule' ? 'bg-teal-900 text-white' : 'bg-teal-100 text-teal-800'
            }`}
          >
            {slots.filter((s) => s.available).length} Open
          </span>
        </button>
      </div>

      {doctorViewTab === 'alerts' ? (
        <CareAlertsPanel
          clinicianRole="doctor"
          clinicianName="Dr. Sarah Jenkins, MD"
          onSelectPatient={(patientId) => {
            setSelectedPatientId(patientId);
            setDoctorViewTab('patients');
          }}
        />
      ) : doctorViewTab === 'schedule' ? (
        /* Doctor Availability & Automated Appointment Workflow Management */
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 rounded-3xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold mb-2">
                <Calendar className="w-3.5 h-3.5 text-teal-300" />
                <span>Autonomous Care Scheduling Engine</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif">
                Clinician Availability & Automated Appointment Control
              </h2>
              <p className="text-xs sm:text-sm text-teal-100 mt-1 max-w-2xl">
                When a mother logs an abnormal blood pressure or critical warning symptom, this engine automatically selects the earliest open slot from your schedule, books the visit, and notifies both parties in real time.
              </p>
            </div>

            <button
              onClick={loadSlots}
              className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold backdrop-blur-md transition-colors flex items-center space-x-1.5 self-start md:self-center"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Calendar</span>
            </button>
          </div>

          {/* Availability Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 block">Available Slots</span>
                <span className="text-2xl sm:text-3xl font-bold text-emerald-700 font-serif">
                  {slots.filter((s) => s.available).length}
                </span>
                <span className="text-[11px] text-emerald-600 block mt-0.5">Ready for urgent booking</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Check className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 block">Reserved / Booked Slots</span>
                <span className="text-2xl sm:text-3xl font-bold text-slate-700 font-serif">
                  {slots.filter((s) => !s.available).length}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Occupied clinical time</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 block">Assigned Clinician</span>
                <span className="text-base font-bold text-slate-900 block truncate">Dr. Sarah Jenkins, MD</span>
                <span className="text-[11px] text-teal-600 block mt-0.5">ID: usr_doc_1 (OB/GYN)</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                <Stethoscope className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Main Slots Management Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Slots Registry (8 cols) */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Appointment Slot Schedule</h3>
                  <p className="text-xs text-slate-500">
                    Click "Toggle" on any slot to test the availability check (simulating open vs. full schedule).
                  </p>
                </div>
                <span className="text-xs text-slate-500">{slots.length} total slots</span>
              </div>

              <div className="divide-y divide-slate-100">
                {slots.map((slot) => {
                  const isToggling = togglingSlotId === slot.id;
                  return (
                    <div
                      key={slot.id}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 rounded-xl px-2.5 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-slate-900">{slot.time}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              slot.available
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {slot.available ? '● Available' : '● Booked / Reserved'}
                          </span>
                          {slot.bookedAppointmentId && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-semibold">
                              Linked: {slot.bookedAppointmentId}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-3 text-xs text-slate-500">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{slot.date}</span>
                          </span>
                          {slot.notes && (
                            <span className="text-slate-600 truncate max-w-xs">{slot.notes}</span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleSlot(slot.id)}
                        disabled={isToggling}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap self-start sm:self-center border ${
                          slot.available
                            ? 'bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border-slate-200'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {isToggling ? 'Updating...' : slot.available ? 'Mark Unavailable' : 'Make Available'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Add Slot Form & Workflow Explainer (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Add Slot Form */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
                  <Plus className="w-4 h-4 text-teal-600" />
                  <h3 className="font-bold text-slate-900 text-sm">Add New Available Slot</h3>
                </div>

                <form onSubmit={handleAddSlot} className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Date</label>
                    <input
                      type="date"
                      value={newSlotDate}
                      onChange={(e) => setNewSlotDate(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Time</label>
                    <select
                      value={newSlotTime}
                      onChange={(e) => setNewSlotTime(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                    >
                      <option value="08:30 AM">08:30 AM</option>
                      <option value="09:00 AM">09:00 AM</option>
                      <option value="09:30 AM">09:30 AM</option>
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="11:00 AM">11:00 AM</option>
                      <option value="11:30 AM">11:30 AM</option>
                      <option value="01:30 PM">01:30 PM</option>
                      <option value="02:00 PM">02:00 PM</option>
                      <option value="03:00 PM">03:00 PM</option>
                      <option value="04:00 PM">04:00 PM</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Slot Notes</label>
                    <input
                      type="text"
                      placeholder="e.g. Priority triage follow-up"
                      value={newSlotNotes}
                      onChange={(e) => setNewSlotNotes(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={addingSlot || !newSlotDate}
                    className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs transition-colors"
                  >
                    {addingSlot ? 'Adding...' : 'Add Open Slot to Calendar'}
                  </button>
                </form>
              </div>

              {/* Workflow Pipeline Reference */}
              <div className="bg-slate-50 rounded-3xl p-5 border border-slate-200 space-y-3">
                <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                  Automated Scheduling Rules
                </h4>
                <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside">
                  <li><strong>Abnormal evaluation:</strong> Triggered on BP ≥140/90 or red flag symptoms.</li>
                  <li><strong>Doctor lookup:</strong> Identifies mother's assigned doctor (<code className="text-slate-800">usr_doc_1</code>).</li>
                  <li><strong>Availability query:</strong> Fetches future slots with <code className="text-emerald-700">available === true</code>.</li>
                  <li><strong>Auto-scheduling:</strong> Books earliest chronological slot.</li>
                  <li><strong>Slot lock:</strong> Marks slot as unavailable to prevent double-booking.</li>
                  <li><strong>Dual notification:</strong> Dispatches real-time alerts to mother & doctor.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Main Clinical Layout: Left Patient Queue, Right Patient Record Deep-Dive */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Patient Queue (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="font-bold text-slate-900 text-sm">Assigned Patients</h2>
            <span className="text-xs text-slate-500">{filteredPatients.length} shown</span>
          </div>

          {/* Search & Filters */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search mother or baby name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 bg-slate-50/50"
              />
            </div>

            <div className="flex space-x-1">
              {(['all', 'urgent', 'warning', 'stable'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRiskFilter(r)}
                  className={`flex-1 py-1 text-[11px] font-semibold rounded-lg capitalize transition-colors ${
                    riskFilter === r
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Patient Cards List */}
          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {filteredPatients.map((patient) => {
              const isSelected = patient.userId === selectedPatientId;
              return (
                <div
                  key={patient.userId}
                  onClick={() => setSelectedPatientId(patient.userId)}
                  className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-teal-50/70 border-teal-400 shadow-xs'
                      : 'bg-slate-50/50 border-slate-200/70 hover:bg-slate-100/60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-bold text-sm text-slate-900 block">{patient.patientName}</span>
                      <span className="text-[11px] text-slate-500 block">
                        Baby {patient.babyName} • Day {patient.postpartumDay} ({patient.deliveryType})
                      </span>
                    </div>

                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        patient.riskStatus === 'urgent'
                          ? 'bg-rose-100 text-rose-800 animate-pulse'
                          : patient.riskStatus === 'warning'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {patient.riskStatus}
                    </span>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-200/50 flex items-center justify-between text-[11px]">
                    <span className="text-slate-600">
                      Latest BP:{' '}
                      <strong className="text-slate-900">
                        {patient.latestBp ? `${patient.latestBp.systolic}/${patient.latestBp.diastolic}` : '—'}
                      </strong>
                    </span>

                    {patient.unreadAlertsCount > 0 && (
                      <span className="text-rose-700 font-bold bg-rose-50 px-1.5 py-0.5 rounded-md border border-rose-200 text-[10px]">
                        {patient.unreadAlertsCount} Alert{patient.unreadAlertsCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Patient Deep-Dive (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {loadingRecord ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs">
              <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500">Loading complete clinical records...</p>
            </div>
          ) : detailedRecord ? (
            <>
              {/* Patient Banner with AI Summary Button */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-xl font-bold font-serif text-slate-900">
                        {detailedRecord.profile.patientName}
                      </h2>
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-teal-100 text-teal-800">
                        Postpartum Day {detailedRecord.profile.postpartumDay}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Baby {detailedRecord.profile.babyName} • {detailedRecord.profile.deliveryType} Delivery ({detailedRecord.profile.babyDob}) • Gestational Age: {detailedRecord.profile.gestationalAgeWeeks}w
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 self-start sm:self-center">
                    <button
                      onClick={() => setCurrentTab('agentic')}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-teal-300 font-semibold text-xs shadow-md transition-all flex items-center space-x-1.5 border border-teal-500/40"
                    >
                      <Cpu className="w-4 h-4 text-teal-400" />
                      <span>Agentic Multi-Agent Audit</span>
                    </button>

                    {/* Agentic AI Workflow 3 & 5 Action Button */}
                    <button
                      onClick={handleGenerateAISummary}
                      disabled={generatingSummary}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold text-xs shadow-md transition-all flex items-center space-x-1.5"
                    >
                      {generatingSummary ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Generating AI Clinical Digest...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-yellow-300" />
                          <span>Generate AI Care Summary</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* AI-Generated Summary Container (Workflow 3 & 5) */}
                {aiSummary && (
                  <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 text-xs text-slate-800 space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between pb-2 border-b border-teal-200">
                      <div className="flex items-center space-x-1.5 font-bold text-teal-900">
                        <Sparkles className="w-4 h-4 text-teal-600" />
                        <span>AI-Assisted Care Summary & Follow-up Prep</span>
                      </div>
                      <button
                        onClick={() => setAiSummary(null)}
                        className="text-slate-400 hover:text-slate-600 text-[11px]"
                      >
                        Dismiss
                      </button>
                    </div>

                    <div className="whitespace-pre-line text-xs leading-relaxed max-h-72 overflow-y-auto pr-1">
                      {aiSummary}
                    </div>

                    <div className="pt-2 border-t border-teal-200 flex justify-end">
                      <button
                        onClick={() => {
                          setNoteContent(`[AI Care Summary Verified by Dr. Jenkins]:\n${aiSummary.slice(0, 500)}...`);
                          alert('AI Summary copied into Clinical Notes below for your review and signature.');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-teal-700 text-white font-semibold text-[11px] hover:bg-teal-800"
                      >
                        Adopt into Clinical Note
                      </button>
                    </div>
                  </div>
                )}

                {/* Active Alerts for this Patient (Workflow 2) */}
                {detailedRecord.alerts.filter((a) => !a.reviewed).length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-rose-800 flex items-center">
                      <AlertTriangle className="w-3.5 h-3.5 mr-1 text-rose-600" />
                      Unreviewed Triage Alerts:
                    </span>
                    {detailedRecord.alerts
                      .filter((a) => !a.reviewed)
                      .map((alert) => (
                        <div
                          key={alert.id}
                          className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <strong className="text-rose-950 font-bold block">{alert.title}</strong>
                            <p className="text-rose-900 mt-0.5">{alert.description}</p>
                            <span className="text-[10px] text-rose-700 mt-1 block">
                              Guidance given: {alert.guidanceProvided}
                            </span>
                          </div>
                          <button
                            onClick={() => handleReviewAlert(alert.id)}
                            className="px-3 py-1.5 rounded-xl bg-white border border-rose-300 text-rose-800 hover:bg-rose-100 font-semibold text-[11px] whitespace-nowrap shadow-xs"
                          >
                            Mark Reviewed & Close
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Blood Pressure Chart Deep-Dive */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-teal-600" />
                    <h3 className="font-bold text-slate-800 text-sm">Blood Pressure Trend (mmHg)</h3>
                  </div>
                  <span className="text-xs text-slate-400">Target &lt; 140/90</span>
                </div>

                <div className="h-56 w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={detailedRecord.bloodPressureLogs.map((l) => ({
                        time: new Date(l.timestamp).toLocaleDateString([], { month: 'numeric', day: 'numeric' }),
                        systolic: l.systolic,
                        diastolic: l.diastolic,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis domain={[50, 180]} tick={{ fontSize: 10, fill: '#64748b' }} />
                      <Tooltip />
                      <ReferenceLine y={140} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: '140 Stage 1', fill: '#d97706', fontSize: 10 }} />
                      <ReferenceLine y={90} stroke="#f59e0b" strokeDasharray="3 3" />
                      <Line type="monotone" dataKey="systolic" stroke="#0d9488" strokeWidth={2} name="Systolic" />
                      <Line type="monotone" dataKey="diastolic" stroke="#0284c7" strokeWidth={2} name="Diastolic" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Add Clinical Note & Care Instructions */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
                  <FileText className="w-5 h-5 text-teal-600" />
                  <h3 className="font-bold text-slate-800 text-sm">Add Clinical Note & Care Plan</h3>
                </div>

                <form onSubmit={handleAddNote} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Note Category</label>
                      <select
                        value={noteType}
                        onChange={(e) => setNoteType(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                      >
                        <option value="progress_note">Progress Note</option>
                        <option value="care_plan">Care Plan Instruction</option>
                        <option value="discharge_followup">Discharge Follow-up</option>
                        <option value="escalation_response">Nurse Escalation Response</option>
                      </select>
                    </div>

                    <div className="flex items-end">
                      <span className="text-[11px] text-slate-400">
                        Notes become immediately visible in patient chart and nurse task queue.
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Clinical Note Content</label>
                    <textarea
                      rows={3}
                      placeholder="Document vital trends, medication management, preeclampsia precautions, or next clinical steps..."
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    {noteSuccess && (
                      <span className="text-xs text-emerald-600 font-semibold animate-fade-in">
                        ✓ Note successfully logged to chart!
                      </span>
                    )}
                    <button
                      type="submit"
                      disabled={noteSubmitting || !noteContent.trim()}
                      className="ml-auto px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs"
                    >
                      {noteSubmitting ? 'Saving...' : 'Sign & Save Clinical Note'}
                    </button>
                  </div>
                </form>

                {/* History of notes */}
                <div className="pt-3 border-t border-slate-100 space-y-2.5">
                  <h4 className="text-xs font-semibold text-slate-700">Recent Care Notes:</h4>
                  {detailedRecord.careNotes.map((note) => (
                    <div key={note.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{note.authorName} ({note.authorRole.toUpperCase()})</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(note.timestamp).toLocaleDateString()} {new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-700 mt-1 whitespace-pre-line leading-relaxed">{note.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
      )}
    </div>
  );
};
