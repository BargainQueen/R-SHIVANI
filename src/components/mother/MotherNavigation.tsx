import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  HeartPulse,
  Baby,
  Pill,
  CalendarCheck,
  BotMessageSquare,
  User,
  Cpu,
} from 'lucide-react';

export const MotherNavigation: React.FC = () => {
  const { currentTab, setCurrentTab } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'agentic', label: '🤖 Agentic AI Hub', icon: <Cpu className="w-4 h-4 text-teal-400" /> },
    { id: 'recovery', label: 'My Recovery', icon: <HeartPulse className="w-4 h-4" /> },
    { id: 'baby', label: 'Baby Care', icon: <Baby className="w-4 h-4" /> },
    { id: 'medicines', label: 'Medicines', icon: <Pill className="w-4 h-4" /> },
    { id: 'appointments', label: 'Appointments', icon: <CalendarCheck className="w-4 h-4" /> },
    { id: 'ai-assistant', label: 'Gemini Assistant', icon: <BotMessageSquare className="w-4 h-4" /> },
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
  ];

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 sm:space-x-3 overflow-x-auto py-2.5 no-scrollbar">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
