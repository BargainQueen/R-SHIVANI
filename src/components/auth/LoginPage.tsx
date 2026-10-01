import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { UserRole } from '../../types';
import {
  HeartPulse,
  Stethoscope,
  Activity,
  Baby,
  ShieldCheck,
  Lock,
  ArrowRight,
  UserCheck,
  Sparkles,
  PhoneCall,
  UserPlus,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { availableUsers, switchUser, refreshData } = useApp();

  const [activePortal, setActivePortal] = useState<UserRole>('mother');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Registration modal toggle
  const [isRegistering, setIsRegistering] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regBabyName, setRegBabyName] = useState('');
  const [regDeliveryType, setRegDeliveryType] = useState('Vaginal');
  const [regBabyDob, setRegBabyDob] = useState(new Date().toISOString().split('T')[0]);

  // Demo accounts categorized
  const motherUsers = availableUsers.filter((u) => u.role === 'mother');
  const doctorUsers = availableUsers.filter((u) => u.role === 'doctor');
  const nurseUsers = availableUsers.filter((u) => u.role === 'nurse');

  const handlePortalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Please enter your email or identifier.');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      // Find matching user or fallback to demo account
      const found = availableUsers.find(
        (u) => u.role === activePortal && u.email.toLowerCase() === email.trim().toLowerCase()
      );

      if (found) {
        await switchUser(found);
      } else {
        // Fallback to first user in that role
        const fallback = availableUsers.find((u) => u.role === activePortal);
        if (fallback) {
          await switchUser(fallback);
        } else {
          setErrorMsg('No user account found. You can use 1-Click Fast Demo Login below or register.');
        }
      }
    } catch (err: unknown) {
      setErrorMsg('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) return;
    setLoading(true);
    try {
      const newUser = await api.register({
        name: regName.trim(),
        email: regEmail.trim(),
        role: activePortal,
        phone: regPhone.trim(),
        babyName: activePortal === 'mother' ? regBabyName.trim() : undefined,
        deliveryType: activePortal === 'mother' ? regDeliveryType : undefined,
        babyDob: activePortal === 'mother' ? regBabyDob : undefined,
      });
      await switchUser(newUser);
      setIsRegistering(false);
      refreshData();
    } catch (err: unknown) {
      setErrorMsg('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-teal-50/20 to-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Brand Header */}
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between py-4">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <span className="font-bold text-xl tracking-tight text-slate-900 font-serif">
              Postpartum<span className="text-teal-600">Care</span> Connect
            </span>
            <p className="text-xs text-slate-500">Maternal & Neonatal Post-Discharge Coordination</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-600 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>Role-Based Access Control (RBAC)</span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="max-w-xl mx-auto w-full my-auto bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden">
        {/* Top 3 Portal Selection Tabs */}
        <div className="p-3 bg-slate-50/90 border-b border-slate-200/80">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-2">
            Select Your Dedicated Portal:
          </div>
          <div className="grid grid-cols-3 gap-2">
            {/* Mother Portal Tab */}
            <button
              type="button"
              onClick={() => {
                setActivePortal('mother');
                setErrorMsg('');
                setIsRegistering(false);
              }}
              className={`p-3 rounded-2xl text-center transition-all border flex flex-col items-center justify-center space-y-1 ${
                activePortal === 'mother'
                  ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <HeartPulse className="w-5 h-5" />
              <span className="font-bold text-xs">Mother Portal</span>
              <span className={`text-[10px] ${activePortal === 'mother' ? 'text-teal-100' : 'text-slate-400'}`}>
                Recovery & Baby
              </span>
            </button>

            {/* Doctor Portal Tab */}
            <button
              type="button"
              onClick={() => {
                setActivePortal('doctor');
                setErrorMsg('');
                setIsRegistering(false);
              }}
              className={`p-3 rounded-2xl text-center transition-all border flex flex-col items-center justify-center space-y-1 ${
                activePortal === 'doctor'
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <Stethoscope className="w-5 h-5" />
              <span className="font-bold text-xs">Doctor Portal</span>
              <span className={`text-[10px] ${activePortal === 'doctor' ? 'text-emerald-100' : 'text-slate-400'}`}>
                OB/GYN Clinician
              </span>
            </button>

            {/* Nurse Portal Tab */}
            <button
              type="button"
              onClick={() => {
                setActivePortal('nurse');
                setErrorMsg('');
                setIsRegistering(false);
              }}
              className={`p-3 rounded-2xl text-center transition-all border flex flex-col items-center justify-center space-y-1 ${
                activePortal === 'nurse'
                  ? 'bg-sky-700 text-white border-sky-700 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <Activity className="w-5 h-5" />
              <span className="font-bold text-xs">Nurse Portal</span>
              <span className={`text-[10px] ${activePortal === 'nurse' ? 'text-sky-100' : 'text-slate-400'}`}>
                Postpartum RN
              </span>
            </button>
          </div>
        </div>

        {/* Portal Body Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Portal Headline */}
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold font-serif text-slate-900">
              {activePortal === 'mother' && 'Maternal & Family Login'}
              {activePortal === 'doctor' && 'Attending Physician Login'}
              {activePortal === 'nurse' && 'Care Coordination Nurse Login'}
            </h2>
            <p className="text-xs text-slate-500">
              {activePortal === 'mother' && 'Access vitals logging, feeding history, medication schedules, and Gemini AI.'}
              {activePortal === 'doctor' && 'Review patient panels, evaluate hypertensive alerts, and sign AI clinical digests.'}
              {activePortal === 'nurse' && 'Manage follow-up tasks, record outreach attempts, and scan missed check-ins.'}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium text-center">
              {errorMsg}
            </div>
          )}

          {!isRegistering ? (
            /* Login Form */
            <form onSubmit={handlePortalLogin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  {activePortal === 'mother'
                    ? 'Patient Email Address'
                    : activePortal === 'doctor'
                    ? 'Medical License / Staff Email'
                    : 'RN License / Nurse Email'}
                </label>
                <input
                  type="text"
                  placeholder={
                    activePortal === 'mother'
                      ? 'maria@example.com'
                      : activePortal === 'doctor'
                      ? 'dr.jenkins@hospital.org'
                      : 'carlos.rn@hospital.org'
                  }
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 bg-slate-50/50"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Password / Pin</label>
                  <span className="text-[10px] text-slate-400">Demo enabled (any password)</span>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 bg-slate-50/50"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-xl text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-1.5 ${
                  activePortal === 'mother'
                    ? 'bg-teal-600 hover:bg-teal-700'
                    : activePortal === 'doctor'
                    ? 'bg-emerald-700 hover:bg-emerald-800'
                    : 'bg-sky-700 hover:bg-sky-800'
                }`}
              >
                <span>{loading ? 'Authenticating...' : `Sign in to ${activePortal.toUpperCase()} Portal`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="Jane Doe"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="jane@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="(555) 123-4567"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>

              {activePortal === 'mother' && (
                <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100 space-y-2">
                  <span className="text-[10px] font-bold text-teal-900 block">Newborn Information</span>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-600 block">Baby Name</label>
                      <input
                        type="text"
                        placeholder="Baby"
                        value={regBabyName}
                        onChange={(e) => setRegBabyName(e.target.value)}
                        className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-600 block">Delivery Type</label>
                      <select
                        value={regDeliveryType}
                        onChange={(e) => setRegDeliveryType(e.target.value)}
                        className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 bg-white"
                      >
                        <option value="Vaginal">Vaginal</option>
                        <option value="Cesarean">Cesarean</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-600 block">Date of Birth</label>
                      <input
                        type="date"
                        value={regBabyDob}
                        onChange={(e) => setRegBabyDob(e.target.value)}
                        className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs"
              >
                {loading ? 'Creating Profile...' : 'Complete Registration'}
              </button>
            </form>
          )}

          {/* Toggle between Login and Register */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-xs text-teal-700 hover:text-teal-900 font-semibold"
            >
              {isRegistering ? '← Back to Login' : `Need a new ${activePortal} account? Register here`}
            </button>
          </div>

          {/* 1-Click Fast Demo Login Section */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                1-Click Fast Demo Access:
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium">
                Clinical Hackathon Dataset
              </span>
            </div>

            <div className="space-y-1.5">
              {activePortal === 'mother' &&
                motherUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => switchUser(user)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 text-left transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-2.5">
                      <img src={user.avatar} className="w-7 h-7 rounded-full object-cover" alt={user.name} />
                      <div>
                        <span className="font-bold text-xs text-slate-900 group-hover:text-teal-900 block">
                          {user.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {user.id === 'usr_mother_1'
                            ? 'Day 6 Post C-Section • Baby Mateo'
                            : user.id === 'usr_mother_2'
                            ? 'Day 14 Post Vaginal • Baby Maya'
                            : 'Day 3 Post Vaginal • Baby Liam'}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md group-hover:bg-teal-600 group-hover:text-white transition-colors">
                      Enter →
                    </span>
                  </button>
                ))}

              {activePortal === 'doctor' &&
                doctorUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => switchUser(user)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 text-left transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-2.5">
                      <img src={user.avatar} className="w-7 h-7 rounded-full object-cover" alt={user.name} />
                      <div>
                        <span className="font-bold text-xs text-slate-900 group-hover:text-emerald-900 block">
                          {user.name}
                        </span>
                        <span className="text-[10px] text-slate-400">Attending Obstetrician & Gynecologist</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                      Enter Physician Portal →
                    </span>
                  </button>
                ))}

              {activePortal === 'nurse' &&
                nurseUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => switchUser(user)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-sky-400 hover:bg-sky-50/50 text-left transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-2.5">
                      <img src={user.avatar} className="w-7 h-7 rounded-full object-cover" alt={user.name} />
                      <div>
                        <span className="font-bold text-xs text-slate-900 group-hover:text-sky-900 block">
                          {user.name}
                        </span>
                        <span className="text-[10px] text-slate-400">Postpartum RN Coordinator</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md group-hover:bg-sky-700 group-hover:text-white transition-colors">
                      Enter Nurse Portal →
                    </span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Trust & Helpline */}
      <div className="max-w-5xl mx-auto w-full text-center text-xs text-slate-400 py-4 space-y-1">
        <p className="flex items-center justify-center space-x-1">
          <Lock className="w-3.5 h-3.5 text-teal-600 inline" />
          <span>Server-Side Gemini API Proxy • No API Keys Exposed to Browser • HIPAA Privacy Principles</span>
        </p>
        <p className="text-[11px] text-slate-400">
          24/7 Maternal Mental Health Hotline: 1-833-TLC-MAMA (852-6262) • Medical Emergency: 911
        </p>
      </div>
    </div>
  );
};
