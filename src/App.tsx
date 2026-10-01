import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { EmergencyModal } from './components/EmergencyModal';
import { AuthModal } from './components/auth/AuthModal';
import { MotherNavigation } from './components/mother/MotherNavigation';
import { MotherDashboard } from './components/mother/MotherDashboard';
import { MaternalRecoveryView } from './components/mother/MaternalRecoveryView';
import { BabyCareView } from './components/mother/BabyCareView';
import { MedicationTrackerView } from './components/mother/MedicationTrackerView';
import { AppointmentsView } from './components/mother/AppointmentsView';
import { ProfileView } from './components/mother/ProfileView';
import { GeminiChatbot } from './components/chat/GeminiChatbot';
import { DoctorDashboard } from './components/doctor/DoctorDashboard';
import { NurseDashboard } from './components/nurse/NurseDashboard';
import { LoginPage } from './components/auth/LoginPage';
import { AgenticCommandCenter } from './components/agentic/AgenticCommandCenter';
import { BotMessageSquare, Sparkles, X, Heart, Shield, PhoneCall } from 'lucide-react';

const MainContent: React.FC = () => {
  const { currentUser, role, currentTab, isChatOpen, setIsChatOpen, setUrgentModalOpen } = useApp();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // If no user is logged in, show dedicated separate portal login page
  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-teal-500 selection:text-white">
      {/* Top Header */}
      <Header onOpenAuth={() => setAuthModalOpen(true)} />

      {/* Emergency Modal */}
      <EmergencyModal />

      {/* Auth / Switch Demo Account Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* Role specific navigation for mother */}
      {role === 'mother' && <MotherNavigation />}

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {currentTab === 'agentic' ? (
          <AgenticCommandCenter />
        ) : (
          <>
            {role === 'doctor' && <DoctorDashboard />}

            {role === 'nurse' && <NurseDashboard />}

            {role === 'mother' && (
              <>
                {currentTab === 'dashboard' && <MotherDashboard />}
                {currentTab === 'recovery' && <MaternalRecoveryView />}
                {currentTab === 'baby' && <BabyCareView />}
                {currentTab === 'medicines' && <MedicationTrackerView />}
                {currentTab === 'appointments' && <AppointmentsView />}
                {currentTab === 'ai-assistant' && <GeminiChatbot />}
                {currentTab === 'profile' && <ProfileView />}
              </>
            )}
          </>
        )}
      </main>

      {/* Floating Gemini Chat Trigger (Available on all views if not currently on ai-assistant tab) */}
      {currentTab !== 'ai-assistant' && (
        <div className="fixed bottom-6 right-6 z-40">
          {isChatOpen ? (
            <div className="fixed inset-y-16 right-4 sm:right-6 w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col z-50 animate-in slide-in-from-bottom-5 duration-200">
              <div className="p-3 bg-teal-700 text-white flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-bold">
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>Gemini Postpartum Assistant</span>
                </div>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="p-1 rounded-full text-teal-200 hover:text-white hover:bg-teal-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <GeminiChatbot />
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsChatOpen(true)}
              className="group flex items-center space-x-2 px-4 py-3 rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shadow-lg shadow-teal-600/30 transition-all hover:scale-105"
            >
              <BotMessageSquare className="w-5 h-5 text-white" />
              <span className="text-xs font-bold hidden sm:inline">Ask Gemini AI</span>
              <span className="w-2 h-2 rounded-full bg-yellow-300 animate-pulse" />
            </button>
          )}
        </div>
      )}

      {/* Global Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-6 text-slate-500 text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Heart className="w-4 h-4 text-teal-600 fill-teal-600" />
            <span className="font-bold text-slate-800">Postpartum Care Connect</span>
            <span className="text-slate-400">| Hackathon Maternal-Neonatal Coordination</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-500">
            <span className="flex items-center space-x-1">
              <Shield className="w-3.5 h-3.5 text-teal-600" />
              <span>Role-Based Access Protected</span>
            </span>
            <span className="flex items-center space-x-1">
              <PhoneCall className="w-3.5 h-3.5 text-teal-600" />
              <span>National Maternal Helpline: 1-833-TLC-MAMA (852-6262)</span>
            </span>
            <span>Emergency: 911</span>
          </div>

          <p className="text-[10px] text-slate-400 text-center md:text-right max-w-sm">
            Clinical Disclaimer: Educational & care coordination platform only. Never replaces medical diagnosis or emergency care.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
