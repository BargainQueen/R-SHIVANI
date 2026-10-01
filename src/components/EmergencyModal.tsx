import React from 'react';
import { useApp } from '../context/AppContext';
import { AlertOctagon, PhoneCall, ShieldAlert, HeartHandshake, X } from 'lucide-react';

export const EmergencyModal: React.FC = () => {
  const { urgentModalOpen, setUrgentModalOpen } = useApp();

  if (!urgentModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-rose-200 relative overflow-hidden">
        {/* Top warning ribbon */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-500 via-red-600 to-amber-500" />

        <div className="flex items-start justify-between mt-2">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-xs">
              <AlertOctagon className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 font-serif">Postpartum Urgent Warning Signs</h3>
              <p className="text-xs text-rose-600 font-medium">Clinician-Approved Emergency Triage Protocol</p>
            </div>
          </div>
          <button
            onClick={() => setUrgentModalOpen(false)}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200 text-xs text-rose-900 leading-relaxed">
            <strong className="font-semibold block mb-1 flex items-center">
              <ShieldAlert className="w-4 h-4 mr-1 text-rose-600 inline" /> Seek Immediate Emergency Care (Call 911 or
              Go to Labor & Delivery Triage) if you experience:
            </strong>
            <ul className="list-disc list-inside space-y-1 mt-1 text-slate-700">
              <li><strong>Heavy vaginal bleeding:</strong> Soaking through one or more large pads in under an hour, or passing golf ball-sized blood clots.</li>
              <li><strong>Severe headache:</strong> Throbbing headache that does not ease after medication, especially if accompanied by flashing lights, dark spots, or blurry vision.</li>
              <li><strong>Severe high blood pressure:</strong> Systolic ≥ 160 or Diastolic ≥ 110 mmHg.</li>
              <li><strong>Chest pain or breathing difficulty:</strong> Sudden shortness of breath, rapid breathing, or chest tightness.</li>
              <li><strong>High fever:</strong> Oral temperature of 100.4°F (38.0°C) or higher with shaking chills.</li>
              <li><strong>Leg pain or swelling:</strong> Redness, tenderness, or pronounced swelling in one calf (blood clot risk).</li>
              <li><strong>Neonate emergency:</strong> Infant fever ≥ 100.4°F, lethargy, grunting breath, or inability to feed.</li>
            </ul>
          </div>

          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900">
            <div className="flex items-center space-x-2 font-semibold">
              <HeartHandshake className="w-4 h-4 text-amber-600" />
              <span>Emotional & Mental Health Support (24/7 Free & Confidential)</span>
            </div>
            <p className="mt-1 text-slate-700">
              If you feel overwhelmed, deeply anxious, detached from your baby, or have thoughts of hurting yourself:
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <a
                href="tel:18338526262"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-600 text-white font-semibold text-xs shadow-xs hover:bg-amber-700 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call 1-833-TLC-MAMA (Maternal Mental Health)</span>
              </a>
              <a
                href="tel:988"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white font-semibold text-xs shadow-xs hover:bg-slate-800 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call or Text 988 (Suicide & Crisis Lifeline)</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setUrgentModalOpen(false)}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            I Understand — Close Guidance
          </button>
        </div>
      </div>
    </div>
  );
};
