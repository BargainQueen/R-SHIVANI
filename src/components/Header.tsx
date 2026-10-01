import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  HeartPulse,
  Bell,
  AlertTriangle,
  ChevronDown,
  UserCheck,
  Stethoscope,
  Activity,
  PhoneCall,
  X,
  PlusCircle,
  LogOut,
  Cpu,
} from 'lucide-react';

export const Header: React.FC<{ onOpenAuth: () => void }> = ({ onOpenAuth }) => {
  const {
    currentUser,
    role,
    currentTab,
    setCurrentTab,
    availableUsers,
    switchUser,
    logout,
    notifications,
    unreadNotifsCount,
    markAllNotificationsRead,
    setUrgentModalOpen,
  } = useApp();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const getRoleBadge = (r: string) => {
    switch (r) {
      case 'doctor':
        return {
          label: 'Attending OB/GYN',
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: <Stethoscope className="w-3.5 h-3.5 mr-1" />,
        };
      case 'nurse':
        return {
          label: 'Postpartum RN',
          color: 'bg-sky-50 text-sky-700 border-sky-200',
          icon: <Activity className="w-3.5 h-3.5 mr-1" />,
        };
      default:
        return {
          label: 'Postpartum Mother',
          color: 'bg-teal-50 text-teal-700 border-teal-200',
          icon: <HeartPulse className="w-3.5 h-3.5 mr-1" />,
        };
    }
  };

  const currentBadge = getRoleBadge(role);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-slate-900 font-serif md:font-sans">
                  Postpartum<span className="text-teal-600">Care</span>
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600 border border-slate-200 hidden sm:inline-block">
                  Connect
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">Post-Discharge Care Coordination</p>
            </div>
          </div>

          {/* Center: Agentic AI Engine & Urgent Warning */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentTab('agentic')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                currentTab === 'agentic'
                  ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-teal-500/20'
                  : 'bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-900 border border-slate-200'
              }`}
              title="Autonomous Multi-Agent AI System Core"
            >
              <Cpu className="w-3.5 h-3.5 text-teal-600" />
              <span className="hidden sm:inline">Agentic AI Hub</span>
              <span className="text-[9px] px-1 py-0.2 rounded-md bg-teal-200/60 text-teal-900 font-extrabold uppercase">
                Core
              </span>
            </button>

            <button
              onClick={() => setUrgentModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors shadow-xs"
              title="Postpartum Emergency Protocol"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
              <span className="hidden md:inline">Emergency Red Flags</span>
              <span className="md:hidden">Emergency</span>
            </button>

            <a
              href="tel:988"
              className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              title="National Maternal Support & Crisis"
            >
              <PhoneCall className="w-3.5 h-3.5 text-slate-500" />
              <span>24/7 Helpline: 1-833-TLC-MAMA</span>
            </a>
          </div>

          {/* Right: Notifications & Role Switcher */}
          <div className="flex items-center space-x-3">
            {/* Notifications Popover */}
            <div className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center min-w-4 h-4 px-1 rounded-full text-[10px] font-bold bg-teal-600 text-white animate-pulse">
                    {unreadNotifsCount}
                  </span>
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                      <Bell className="w-4 h-4 text-teal-600" />
                      <h4 className="text-sm font-semibold text-slate-800">Notifications</h4>
                      {unreadNotifsCount > 0 && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-medium">
                          {unreadNotifsCount} new
                        </span>
                      )}
                    </div>
                    {unreadNotifsCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 mt-2">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-500">No notifications at this time.</div>
                    ) : (
                      notifications.slice(0, 6).map((notif) => (
                        <div
                          key={notif.id}
                          className={`py-2.5 px-2 rounded-lg text-left transition-colors ${
                            notif.read ? 'opacity-70 bg-transparent' : 'bg-teal-50/40'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <span className="text-xs font-semibold text-slate-800">{notif.title}</span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Role & User Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center space-x-2 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 hover:border-teal-300 hover:bg-slate-50 transition-all text-left"
              >
                {currentUser?.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                    {currentUser?.name?.slice(0, 1) || 'U'}
                  </div>
                )}
                <div className="hidden sm:block">
                  <div className="text-xs font-bold text-slate-800 leading-tight">{currentUser?.name}</div>
                  <div className="text-[10px] text-teal-600 font-medium flex items-center">
                    {currentBadge.label}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Switch Active Demo Profile
                  </div>
                  <div className="space-y-1 mt-1">
                    {availableUsers.map((user) => {
                      const isSelected = user.id === currentUser?.id;
                      const badge = getRoleBadge(user.role);
                      return (
                        <button
                          key={user.id}
                          onClick={() => {
                            switchUser(user);
                            setShowRoleMenu(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors text-xs ${
                            isSelected ? 'bg-teal-50 text-teal-900 font-semibold' : 'hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            {user.avatar ? (
                              <img src={user.avatar} className="w-6 h-6 rounded-full object-cover" alt={user.name} />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px]">
                                {user.name.slice(0, 1)}
                              </div>
                            )}
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-[10px] text-slate-400">{badge.label}</div>
                            </div>
                          </div>
                          {isSelected && <UserCheck className="w-4 h-4 text-teal-600" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100 space-y-1">
                    <button
                      onClick={() => {
                        setShowRoleMenu(false);
                        onOpenAuth();
                      }}
                      className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium transition-colors"
                    >
                      <PlusCircle className="w-4 h-4 text-teal-600" />
                      <span>Register or Custom Login</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowRoleMenu(false);
                        logout();
                      }}
                      className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-medium transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out to Portals</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Direct Sign Out Button */}
            <button
              onClick={logout}
              title="Sign Out to Login Portals"
              className="hidden md:flex items-center space-x-1 p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-xs font-medium">Exit</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
