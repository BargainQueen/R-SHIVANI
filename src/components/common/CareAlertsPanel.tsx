import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';
import { CareAlert } from '../../types';
import {
  ShieldAlert,
  AlertTriangle,
  HeartPulse,
  Baby,
  Clock,
  CheckCircle2,
  Stethoscope,
  Filter,
  Search,
  RotateCw,
  X,
  FileCheck,
  Send,
  Loader2,
  PhoneCall,
  User,
  ArrowRight,
} from 'lucide-react';

interface EnrichedCareAlert extends CareAlert {
  postpartumDay?: number;
  babyName?: string;
  deliveryType?: string;
  emergencyPhone?: string;
  assignedDoctorName?: string;
  assignedNurseName?: string;
}

interface CareAlertsPanelProps {
  clinicianRole: 'doctor' | 'nurse';
  clinicianName?: string;
  onSelectPatient?: (patientId: string) => void;
  compact?: boolean;
}

export const CareAlertsPanel: React.FC<CareAlertsPanelProps> = ({
  clinicianRole,
  clinicianName,
  onSelectPatient,
  compact = false,
}) => {
  const { refreshData } = useApp();

  const [alerts, setAlerts] = useState<EnrichedCareAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'active' | 'resolved' | 'all'>('active');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'urgent' | 'warning'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'maternal' | 'newborn' | 'bp'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Review Modal State
  const [reviewingAlert, setReviewingAlert] = useState<EnrichedCareAlert | null>(null);
  const [actionTaken, setActionTaken] = useState<string>('Patient Contacted by Phone & Triage Performed');
  const [outcomeNotes, setOutcomeNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getAlerts();
      setAlerts(data.alerts || []);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleOpenReview = (alert: EnrichedCareAlert) => {
    setReviewingAlert(alert);
    // Pre-populate recommended note based on category and severity
    if (alert.severity === 'urgent') {
      setActionTaken('Advised Emergency Department / L&D Triage Assessment');
      setOutcomeNotes(`Contacted patient urgently. Evaluated flagged red flags (${alert.title}). Recommended immediate clinical evaluation.`);
    } else if (alert.category === 'blood_pressure') {
      setActionTaken('Patient Contacted by Phone & Triage Performed');
      setOutcomeNotes('Evaluated BP reading. Instructed 10-minute left-lateral rest and verified antihypertensive dose compliance.');
    } else {
      setActionTaken('Patient Contacted by Phone & Triage Performed');
      setOutcomeNotes(`Reviewed symptoms flagged by tracker: "${alert.title}". Provided supportive clinical guidance.`);
    }
  };

  const handleAcknowledgeAndResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingAlert || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const reviewer = clinicianName || (clinicianRole === 'doctor' ? 'Dr. Sarah Jenkins, MD' : 'Carlos Mendoza, RN');
      await api.reviewAlert(reviewingAlert.id, {
        reviewedBy: reviewer,
        outcomeNotes: outcomeNotes.trim() || 'Reviewed and documented in patient record.',
        actionTaken,
      });

      // Close modal and refresh data
      setReviewingAlert(null);
      await fetchAlerts();
      refreshData();
    } catch (err) {
      console.error('Failed to review alert:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter alerts
  const filteredAlerts = alerts.filter((alert) => {
    // Status filter
    if (statusFilter === 'active' && alert.reviewed) return false;
    if (statusFilter === 'resolved' && !alert.reviewed) return false;

    // Severity filter
    if (severityFilter !== 'all' && alert.severity !== severityFilter) return false;

    // Category filter
    if (categoryFilter === 'maternal' && alert.category !== 'maternal_symptom') return false;
    if (categoryFilter === 'newborn' && alert.category !== 'newborn_warning') return false;
    if (categoryFilter === 'bp' && alert.category !== 'blood_pressure') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = alert.patientName.toLowerCase().includes(q);
      const matchTitle = alert.title.toLowerCase().includes(q);
      const matchDesc = alert.description.toLowerCase().includes(q);
      if (!matchName && !matchTitle && !matchDesc) return false;
    }

    return true;
  });

  const activeCount = alerts.filter((a) => !a.reviewed).length;
  const urgentActiveCount = alerts.filter((a) => !a.reviewed && a.severity === 'urgent').length;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Top Banner & Stats */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-lg font-serif text-white tracking-tight">
              Clinical Care Alerts & Symptom Triage Panel
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Real-time triage warnings automatically generated from patient symptom trackers, vital thresholds, and newborn logs.
          </p>
        </div>

        {/* Counter Badges */}
        <div className="flex items-center space-x-3">
          <div className="px-3.5 py-1.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center space-x-2">
            <span className="text-xs text-slate-300 font-medium">Active Alerts:</span>
            <span className="text-sm font-bold text-teal-400">{activeCount}</span>
          </div>

          {urgentActiveCount > 0 && (
            <div className="px-3.5 py-1.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center space-x-2 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-xs text-rose-200 font-bold">{urgentActiveCount} Urgent</span>
            </div>
          )}

          <button
            onClick={fetchAlerts}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Refresh alerts"
          >
            <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="p-4 sm:px-6 bg-slate-50 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Status Tabs */}
        <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              statusFilter === 'active'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter('resolved')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              statusFilter === 'resolved'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Resolved ({alerts.length - activeCount})
          </button>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              statusFilter === 'all'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({alerts.length})
          </button>
        </div>

        {/* Severity & Category Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Severity */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:border-teal-500"
          >
            <option value="all">All Severities</option>
            <option value="urgent">Urgent Only</option>
            <option value="warning">Warning Only</option>
          </select>

          {/* Category */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:border-teal-500"
          >
            <option value="all">All Categories</option>
            <option value="maternal">Maternal Symptoms</option>
            <option value="newborn">Newborn Warnings</option>
            <option value="bp">Blood Pressure</option>
          </select>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search alerts or patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:border-teal-500 w-44 sm:w-56"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="p-4 sm:p-6 divide-y divide-slate-100">
        {loading && alerts.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-teal-600" />
            <span>Scanning active care alerts...</span>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
            <p className="font-semibold text-slate-700">No care alerts match current filter criteria.</p>
            <p className="text-[11px] text-slate-400 mt-1">
              All reported symptoms and vital signs are currently resolved or within target recovery ranges.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isUrgent = alert.severity === 'urgent';
            const isWarning = alert.severity === 'warning';

            return (
              <div
                key={alert.id}
                className={`py-4 px-3 sm:px-4 rounded-2xl transition-all my-1.5 ${
                  !alert.reviewed
                    ? isUrgent
                      ? 'bg-rose-50/80 border border-rose-200 shadow-xs'
                      : isWarning
                      ? 'bg-amber-50/70 border border-amber-200 shadow-xs'
                      : 'bg-teal-50/50 border border-teal-100'
                    : 'bg-white opacity-75 hover:opacity-100 border border-transparent'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  {/* Left Column: Icon & Details */}
                  <div className="flex items-start space-x-3.5">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        isUrgent
                          ? 'bg-rose-100 text-rose-700'
                          : isWarning
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-teal-100 text-teal-800'
                      }`}
                    >
                      {alert.category === 'blood_pressure' && <HeartPulse className="w-5 h-5" />}
                      {alert.category === 'newborn_warning' && <Baby className="w-5 h-5" />}
                      {alert.category === 'maternal_symptom' && <Stethoscope className="w-5 h-5" />}
                      {alert.category === 'missed_checkin' && <Clock className="w-5 h-5" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Patient Link / Tag */}
                        <button
                          onClick={() => onSelectPatient && onSelectPatient(alert.patientId)}
                          className="font-bold text-xs sm:text-sm text-slate-900 hover:text-teal-700 flex items-center space-x-1"
                        >
                          <span>{alert.patientName}</span>
                          {alert.postpartumDay && (
                            <span className="text-[10px] font-normal text-slate-500">
                              (Day {alert.postpartumDay})
                            </span>
                          )}
                        </button>

                        {/* Severity Badge */}
                        <span
                          className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            isUrgent
                              ? 'bg-rose-200 text-rose-900 animate-pulse'
                              : isWarning
                              ? 'bg-amber-200 text-amber-900'
                              : 'bg-slate-200 text-slate-800'
                          }`}
                        >
                          {alert.severity}
                        </span>

                        {/* Category Badge */}
                        <span className="text-[9px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                          {alert.category.replace('_', ' ')}
                        </span>

                        {/* Review Status */}
                        {alert.reviewed ? (
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>RESOLVED</span>
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                            ACTION REQUIRED
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-xs sm:text-sm text-slate-900">{alert.title}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{alert.description}</p>

                      {/* Guidance given to patient */}
                      {alert.guidanceProvided && (
                        <div className="mt-2 p-2.5 rounded-xl bg-white/80 border border-slate-200/80 text-[11px] text-slate-700">
                          <strong className="text-slate-900 block font-semibold mb-0.5">
                            Automated Triage Guidance Provided to Patient:
                          </strong>
                          <span>{alert.guidanceProvided}</span>
                        </div>
                      )}

                      {/* Resolution Details if reviewed */}
                      {alert.reviewed && alert.outcomeNotes && (
                        <div className="mt-2 p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-[11px] text-emerald-950">
                          <strong className="font-semibold block mb-0.5">
                            ✓ Clinical Resolution by {alert.reviewedBy} (
                            {new Date(alert.reviewedAt || '').toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                            ):
                          </strong>
                          <span>{alert.outcomeNotes}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Timestamp & Review Action Button */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 pt-2 sm:pt-0">
                    <span className="text-[10px] text-slate-400">
                      {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                      {new Date(alert.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>

                    {!alert.reviewed ? (
                      <button
                        onClick={() => handleOpenReview(alert)}
                        className={`px-4 py-2 rounded-xl text-white font-bold text-xs shadow-sm transition-all flex items-center space-x-1.5 ${
                          isUrgent
                            ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
                            : 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/30'
                        }`}
                      >
                        <Stethoscope className="w-3.5 h-3.5" />
                        <span>Review & Resolve</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenReview(alert)}
                        className="px-3 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 font-medium text-xs transition-colors"
                      >
                        Amend Resolution
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Clinical Review & Resolution Modal */}
      {reviewingAlert && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 my-8">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      reviewingAlert.severity === 'urgent'
                        ? 'bg-rose-100 text-rose-900'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {reviewingAlert.severity} ALERT
                  </span>
                  <span className="text-xs text-slate-500">
                    Patient: <strong>{reviewingAlert.patientName}</strong>
                    {reviewingAlert.postpartumDay && ` (Day ${reviewingAlert.postpartumDay})`}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base font-serif">
                  Clinical Review: {reviewingAlert.title}
                </h3>
              </div>

              <button
                onClick={() => setReviewingAlert(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Flagged Issue Details Summary */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div>
                <span className="font-semibold text-slate-700 block">Flagged Issue & Symptoms:</span>
                <p className="text-slate-600 mt-0.5">{reviewingAlert.description}</p>
              </div>

              {reviewingAlert.emergencyPhone && (
                <div className="flex items-center space-x-2 pt-1 text-[11px] text-teal-800">
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>
                    Emergency Contact Phone: <strong>{reviewingAlert.emergencyPhone}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Clinician Action Form */}
            <form onSubmit={handleAcknowledgeAndResolve} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Clinical Action Taken
                </label>
                <select
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:border-teal-500"
                >
                  <option value="Patient Contacted by Phone & Triage Performed">
                    Patient Contacted by Phone & Triage Performed
                  </option>
                  <option value="Advised Emergency Department / L&D Triage Assessment">
                    Advised Emergency Department / L&D Triage Assessment
                  </option>
                  <option value="Scheduled Same-Day / Urgent Clinic Evaluation">
                    Scheduled Same-Day / Urgent Clinic Evaluation
                  </option>
                  <option value="Adjusted Medication Schedule (Labetalol / Analgesics)">
                    Adjusted Medication Schedule (Labetalol / Analgesics)
                  </option>
                  <option value="Escalated to Attending OB/GYN Physician">
                    Escalated to Attending OB/GYN Physician
                  </option>
                  <option value="Reassured Patient & Continued Vital Monitoring">
                    Reassured Patient & Continued Vital Monitoring
                  </option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Clinician Resolution Notes & Follow-up Instructions
                </label>
                <textarea
                  rows={3}
                  value={outcomeNotes}
                  onChange={(e) => setOutcomeNotes(e.target.value)}
                  required
                  placeholder="Detail your assessment, phone consultation summary, patient instructions, or escalated care plan..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 text-slate-800"
                />
              </div>

              <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-100 flex items-center justify-between text-[11px] text-teal-900">
                <span className="flex items-center space-x-1.5">
                  <FileCheck className="w-4 h-4 text-teal-600" />
                  <span>
                    Clinician Signature: <strong>{clinicianName || (clinicianRole === 'doctor' ? 'Dr. Sarah Jenkins, MD' : 'Carlos Mendoza, RN')}</strong>
                  </span>
                </span>
                <span className="text-[10px] text-teal-700">Audit Log Recorded</span>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewingAlert(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>Acknowledge & Resolve Alert</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
