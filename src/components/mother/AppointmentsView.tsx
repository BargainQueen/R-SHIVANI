import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { DoctorAvailabilitySlot } from '../../types';
import { Calendar, Clock, MapPin, Video, Plus, User, FileText, CheckCircle2, AlertTriangle, Stethoscope, ShieldCheck } from 'lucide-react';

export const AppointmentsView: React.FC = () => {
  const { patientRecord, currentUser, refreshData, setCurrentTab } = useApp();

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [aptTitle, setAptTitle] = useState('Postpartum Follow-up Visit');
  const [aptDate, setAptDate] = useState('');
  const [aptTime, setAptTime] = useState('10:00 AM');
  const [aptType, setAptType] = useState<'in_person' | 'telehealth'>('in_person');
  const [aptLocation, setAptLocation] = useState('Suite 402, Women’s Health Clinic');
  const [aptNotes, setAptNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [doctorSlots, setDoctorSlots] = useState<DoctorAvailabilitySlot[]>([]);

  useEffect(() => {
    async function loadDoctorSlots() {
      try {
        const slots = await api.getDoctorAvailability('usr_doc_1');
        setDoctorSlots(slots);
      } catch (err) {
        console.error('Failed to load doctor slots:', err);
      }
    }
    loadDoctorSlots();
  }, [patientRecord]);

  if (!patientRecord) return null;

  const { appointments, profile } = patientRecord;

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !aptDate) return;
    setSubmitting(true);
    try {
      await api.scheduleAppointment({
        patientId: currentUser.id,
        doctorId: 'usr_doc_1',
        title: aptTitle,
        date: aptDate,
        time: aptTime,
        type: aptType,
        location: aptType === 'telehealth' ? 'Virtual Telehealth Video Room' : aptLocation,
        notes: aptNotes,
      });
      setShowScheduleModal(false);
      setAptNotes('');
      refreshData();
    } catch (err) {
      console.error('Failed to schedule appointment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-slate-900 tracking-tight">Appointments & Care Visits</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            View scheduled postpartum checkups, well-baby pediatrician visits, and telehealth consults.
          </p>
        </div>

        <button
          onClick={() => setShowScheduleModal(true)}
          className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs flex items-center space-x-1.5 self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Request / Schedule Visit</span>
        </button>
      </div>

      {/* Recommended Postpartum Appointment Timeline Guide */}
      <div className="p-4 bg-teal-50/60 rounded-3xl border border-teal-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-teal-800">ACOG Recommended Postpartum Care Milestones:</span>
          <p className="text-xs text-slate-600 mt-1">
            • <strong>Days 3–5:</strong> First newborn pediatrician weight and jaundice check.<br />
            • <strong>Week 2–3:</strong> Blood pressure & incisional/pelvic healing assessment.<br />
            • <strong>Week 6:</strong> Comprehensive postpartum exam, emotional wellbeing check, and contraception review.
          </p>
        </div>

        <button
          onClick={() => setCurrentTab('ai-assistant')}
          className="px-3.5 py-2 rounded-xl bg-white border border-teal-200 text-teal-800 text-xs font-semibold hover:bg-teal-50 whitespace-nowrap"
        >
          Ask Gemini: "What to ask at my 6-week visit?"
        </button>
      </div>

      {/* Appointment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {appointments.map((apt) => {
          const isTelehealth = apt.type === 'telehealth';
          return (
            <div key={apt.id} className={`bg-white rounded-3xl p-6 border shadow-xs space-y-4 ${
              apt.isAutoScheduled ? 'border-rose-300 ring-2 ring-rose-500/20' : 'border-slate-200/90'
            }`}>
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        isTelehealth ? 'bg-sky-100 text-sky-800' : 'bg-teal-100 text-teal-800'
                      }`}
                    >
                      {isTelehealth ? <Video className="w-3 h-3 mr-1" /> : <MapPin className="w-3 h-3 mr-1" />}
                      {isTelehealth ? 'Virtual Telehealth' : 'In-Person Clinic Visit'}
                    </span>

                    {apt.isAutoScheduled && (
                      <span className="inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                        <AlertTriangle className="w-3 h-3 mr-1 text-rose-600" />
                        Auto-Scheduled (Abnormal Health Alert)
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-base text-slate-900 mt-1.5">{apt.title}</h3>
                </div>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg capitalize">
                  {apt.status}
                </span>
              </div>

              {apt.triggerReason && (
                <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-900 flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Automated Clinical Trigger: </span>
                    <span>{apt.triggerReason}</span>
                  </div>
                </div>
              )}

              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Clinician: <strong>{apt.doctorName}</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Date: <strong>{apt.date}</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Time: <strong>{apt.time}</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>Location: <strong>{apt.location}</strong></span>
                </div>
              </div>

              {apt.notes && (
                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600">
                  <strong className="text-slate-700">Clinical Focus: </strong> {apt.notes}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Doctor Availability System Viewer */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
              <span>Assigned Obstetrician Availability & Slot Registry</span>
            </div>
            <h2 className="font-bold text-base text-slate-900 mt-1">
              Dr. Sarah Jenkins's Calendar Schedule
            </h2>
            <p className="text-xs text-slate-500">
              When an abnormal health reading is detected, the system queries this schedule, selects the earliest available slot, auto-books the visit, and marks the slot as reserved.
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              ● {doctorSlots.filter((s) => s.available).length} Available
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              ● {doctorSlots.filter((s) => !s.available).length} Booked
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {doctorSlots.map((slot) => (
            <div
              key={slot.id}
              className={`p-3.5 rounded-2xl border transition-all ${
                slot.available
                  ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950 hover:border-emerald-300'
                  : 'bg-slate-50 border-slate-200 text-slate-600 opacity-80'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{slot.time}</span>
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    slot.available
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {slot.available ? 'Available' : 'Reserved'}
                </span>
              </div>
              <div className="text-xs text-slate-600 mt-1.5 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Date: <strong>{slot.date}</strong></span>
              </div>
              {slot.notes && (
                <p className="text-[11px] text-slate-500 mt-1 truncate">
                  {slot.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-slate-800 text-base mb-1">Schedule Care Appointment</h3>
            <p className="text-xs text-slate-500 mb-4">
              Select visit date and preferred consultation format.
            </p>

            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Visit Purpose / Title</label>
                <input
                  type="text"
                  value={aptTitle}
                  onChange={(e) => setAptTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Date</label>
                  <input
                    type="date"
                    value={aptDate}
                    onChange={(e) => setAptDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 10:30 AM"
                    value={aptTime}
                    onChange={(e) => setAptTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Format</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAptType('in_person')}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                      aptType === 'in_person'
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    In-Person Clinic Visit
                  </button>
                  <button
                    type="button"
                    onClick={() => setAptType('telehealth')}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                      aptType === 'telehealth'
                        ? 'bg-sky-600 text-white border-sky-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Virtual Telehealth Video
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Location or Platform</label>
                <input
                  type="text"
                  value={aptType === 'telehealth' ? 'Secure Telehealth Video Room' : aptLocation}
                  onChange={(e) => setAptLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Notes for Clinician</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Review blood pressure log and check cesarean incision healing..."
                  value={aptNotes}
                  onChange={(e) => setAptNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs"
                >
                  {submitting ? 'Scheduling...' : 'Confirm Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
