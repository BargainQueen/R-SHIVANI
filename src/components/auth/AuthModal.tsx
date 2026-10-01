import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { User, UserRole } from '../../types';
import { Users, UserPlus, HeartPulse, Stethoscope, Activity, X } from 'lucide-react';

export const AuthModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { availableUsers, switchUser, refreshData } = useApp();

  const [mode, setMode] = useState<'switch' | 'register'>('switch');

  // Register Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('mother');
  const [phone, setPhone] = useState('');
  const [babyName, setBabyName] = useState('');
  const [deliveryType, setDeliveryType] = useState('Vaginal');
  const [babyDob, setBabyDob] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    setSubmitting(true);
    try {
      const newUser = await api.register({
        name,
        email,
        role,
        phone,
        babyName: role === 'mother' ? babyName : undefined,
        deliveryType: role === 'mother' ? deliveryType : undefined,
        babyDob: role === 'mother' ? babyDob : undefined,
      });

      await switchUser(newUser);
      onClose();
      refreshData();
    } catch (err) {
      console.error('Registration failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              {mode === 'switch' ? <Users className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            </div>
            <h3 className="font-bold text-slate-900 text-base">
              {mode === 'switch' ? 'Select Demo Account' : 'Register New Account'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-100 p-1 rounded-2xl mt-4 mb-4">
          <button
            onClick={() => setMode('switch')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              mode === 'switch' ? 'bg-white text-teal-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pre-Seeded Demo Profiles
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              mode === 'register' ? 'bg-white text-teal-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Create New Account
          </button>
        </div>

        {mode === 'switch' ? (
          <div className="space-y-2">
            <p className="text-xs text-slate-500 mb-2">
              Select any role below to experience Postpartum Care Connect from their perspective:
            </p>
            {availableUsers.map((user) => (
              <button
                key={user.id}
                onClick={async () => {
                  await switchUser(user);
                  onClose();
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-200/80 hover:border-teal-400 hover:bg-teal-50/40 text-left transition-all group"
              >
                <div className="flex items-center space-x-3">
                  {user.avatar ? (
                    <img src={user.avatar} className="w-9 h-9 rounded-full object-cover" alt={user.name} />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                      {user.name.slice(0, 1)}
                    </div>
                  )}
                  <div>
                    <span className="font-bold text-xs text-slate-900 block group-hover:text-teal-900">
                      {user.name}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {user.role === 'mother'
                        ? 'Postpartum Mother'
                        : user.role === 'doctor'
                        ? 'Attending OB/GYN Physician'
                        : 'Maternal-Child Health Nurse'}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 group-hover:bg-teal-100 group-hover:text-teal-800">
                  Switch →
                </span>
              </button>
            ))}
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Select Role</label>
              <div className="grid grid-cols-3 gap-2">
                {(['mother', 'doctor', 'nurse'] as const).map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setRole(r)}
                    className={`p-2 rounded-xl text-xs font-bold capitalize border transition-all ${
                      role === r
                        ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rachel Adams"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="rachel@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Phone Number</label>
              <input
                type="text"
                placeholder="(555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
              />
            </div>

            {role === 'mother' && (
              <div className="p-3 bg-teal-50/50 rounded-2xl border border-teal-100 space-y-2.5">
                <span className="text-[11px] font-bold text-teal-900 block">Newborn Information</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">Baby Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Leo"
                      value={babyName}
                      onChange={(e) => setBabyName(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">Delivery Type</label>
                    <select
                      value={deliveryType}
                      onChange={(e) => setDeliveryType(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="Vaginal">Vaginal</option>
                      <option value="Cesarean">Cesarean</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">Birth Date</label>
                    <input
                      type="date"
                      value={babyDob}
                      onChange={(e) => setBabyDob(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs"
              >
                {submitting ? 'Creating...' : 'Register & Enter Portal'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
