import React from 'react';
import { useApp } from '../../context/AppContext';
import { User, Baby, Shield, Hospital, Phone, Heart, FileSpreadsheet, Lock } from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { patientRecord } = useApp();

  if (!patientRecord) return null;

  const { profile } = patientRecord;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold font-serif text-slate-900 tracking-tight">Maternal & Newborn Profile</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Discharge clinical records, birth vitals, and care coordination team details.
        </p>
      </div>

      {/* Maternal Details */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
          <User className="w-5 h-5 text-teal-600" />
          <h2 className="font-bold text-slate-800 text-sm">Maternal Information</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-2xl">
            <span className="text-slate-400 block text-[10px]">Patient Name</span>
            <span className="font-bold text-slate-800 text-sm">{profile.patientName}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl">
            <span className="text-slate-400 block text-[10px]">Postpartum Stage</span>
            <span className="font-bold text-teal-800 text-sm">Day {profile.postpartumDay} Post-Discharge</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl">
            <span className="text-slate-400 block text-[10px]">Delivery Method</span>
            <span className="font-bold text-slate-800 text-sm">{profile.deliveryType} Delivery</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl">
            <span className="text-slate-400 block text-[10px]">Blood Type</span>
            <span className="font-bold text-slate-800 text-sm">{profile.bloodType}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl">
            <span className="text-slate-400 block text-[10px]">Gestational Age at Birth</span>
            <span className="font-bold text-slate-800 text-sm">{profile.gestationalAgeWeeks} Weeks</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl">
            <span className="text-slate-400 block text-[10px]">Allergies</span>
            <span className="font-bold text-rose-800 text-sm">
              {profile.allergies?.length ? profile.allergies.join(', ') : 'None known'}
            </span>
          </div>
        </div>
      </div>

      {/* Newborn Details */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
          <Baby className="w-5 h-5 text-sky-600" />
          <h2 className="font-bold text-slate-800 text-sm">Newborn Details: {profile.babyName}</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-sky-50/50 rounded-2xl border border-sky-100">
            <span className="text-slate-400 block text-[10px]">Date of Birth</span>
            <span className="font-bold text-slate-800">{profile.babyDob}</span>
          </div>

          <div className="p-3 bg-sky-50/50 rounded-2xl border border-sky-100">
            <span className="text-slate-400 block text-[10px]">Birth Weight</span>
            <span className="font-bold text-slate-800">
              {profile.birthWeightGrams} g ({(profile.birthWeightGrams / 1000 * 2.20462).toFixed(2)} lbs)
            </span>
          </div>

          <div className="p-3 bg-sky-50/50 rounded-2xl border border-sky-100">
            <span className="text-slate-400 block text-[10px]">Birth Length</span>
            <span className="font-bold text-slate-800">{profile.birthLengthCm} cm</span>
          </div>

          <div className="p-3 bg-sky-50/50 rounded-2xl border border-sky-100">
            <span className="text-slate-400 block text-[10px]">Gender</span>
            <span className="font-bold text-slate-800 capitalize">{profile.babyGender}</span>
          </div>
        </div>
      </div>

      {/* Hospital Discharge & Emergency Contact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
            <Hospital className="w-4 h-4 text-teal-600" />
            <h3 className="font-bold text-slate-800 text-xs">Discharge Information</h3>
          </div>
          <div className="text-xs space-y-2 text-slate-600">
            <div>
              <span className="text-slate-400 block text-[10px]">Delivery Facility:</span>
              <span className="font-semibold text-slate-800">{profile.deliveryHospital}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Discharge Date:</span>
              <span className="font-semibold text-slate-800">{profile.dischargeDate}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Attending Obstetrician:</span>
              <span className="font-semibold text-slate-800">{profile.assignedDoctorName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Primary Postpartum RN:</span>
              <span className="font-semibold text-slate-800">{profile.assignedNurseName}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
            <Phone className="w-4 h-4 text-teal-600" />
            <h3 className="font-bold text-slate-800 text-xs">Designated Emergency Contact</h3>
          </div>
          <div className="text-xs space-y-2 text-slate-600">
            <div>
              <span className="text-slate-400 block text-[10px]">Contact Person:</span>
              <span className="font-semibold text-slate-800">{profile.emergencyContact.name}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Relationship:</span>
              <span className="font-semibold text-slate-800">{profile.emergencyContact.relationship}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Phone Number:</span>
              <span className="font-semibold text-teal-800">{profile.emergencyContact.phone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Security & HIPAA Notice */}
      <div className="p-4 bg-slate-100 rounded-3xl border border-slate-200 text-xs text-slate-500 flex items-start space-x-2.5">
        <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Privacy & Security Protection:</strong> Health records, vital signs, and care coordination messages are protected under strict role-based authorization. Only authorized maternal care physicians, assigned postpartum nurses, and yourself may access your personal health data.
        </p>
      </div>
    </div>
  );
};
