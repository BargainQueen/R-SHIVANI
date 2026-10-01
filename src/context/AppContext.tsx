import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole, InAppNotification } from '../types';
import { api, PatientDetailedRecord, PatientSummary } from '../services/api';

interface AppContextType {
  currentUser: User | null;
  role: UserRole;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  availableUsers: User[];
  switchUser: (user: User) => Promise<void>;
  patientRecord: PatientDetailedRecord | null;
  selectedPatientId: string;
  setSelectedPatientId: (id: string) => void;
  patientList: PatientSummary[];
  notifications: InAppNotification[];
  unreadNotifsCount: number;
  loading: boolean;
  refreshData: () => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  logout: () => void;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  urgentModalOpen: boolean;
  setUrgentModalOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('usr_mother_1');
  const [patientRecord, setPatientRecord] = useState<PatientDetailedRecord | null>(null);
  const [patientList, setPatientList] = useState<PatientSummary[]>([]);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [urgentModalOpen, setUrgentModalOpen] = useState<boolean>(false);

  const role: UserRole = currentUser?.role || 'mother';

  // Load initial demo users and check saved user
  useEffect(() => {
    async function init() {
      try {
        const users = await api.getUsers();
        setAvailableUsers(users);

        // Check if there's a stored session
        const savedUserId = localStorage.getItem('pcc_active_user_id');
        if (savedUserId) {
          const matched = users.find((u) => u.id === savedUserId);
          if (matched) {
            setCurrentUser(matched);
          }
        }
      } catch (err) {
        console.error('Init error:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const refreshData = useCallback(async () => {
    if (!currentUser) return;
    try {
      // 1. Fetch patient list
      const patients = await api.getPatients(currentUser.role, currentUser.id);
      setPatientList(patients);

      // 2. Determine target patient record ID to fetch
      let targetId = selectedPatientId;
      if (currentUser.role === 'mother') {
        targetId = currentUser.id;
      } else if (!targetId && patients.length > 0) {
        targetId = patients[0].userId;
        setSelectedPatientId(targetId);
      }

      if (targetId) {
        const record = await api.getPatientRecord(targetId);
        setPatientRecord(record);
      }

      // 3. Fetch notifications
      const notifs = await api.getNotifications(currentUser.id);
      setNotifications(notifs);
    } catch (err) {
      console.error('Refresh data error:', err);
    }
  }, [currentUser, selectedPatientId]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const switchUser = async (user: User) => {
    setLoading(true);
    try {
      const loggedIn = await api.login({ userId: user.id });
      setCurrentUser(loggedIn);
      localStorage.setItem('pcc_active_user_id', loggedIn.id);
      setCurrentTab('dashboard');

      if (loggedIn.role === 'mother') {
        setSelectedPatientId(loggedIn.id);
      } else {
        // Clinician views first patient by default
        const patients = await api.getPatients(loggedIn.role, loggedIn.id);
        setPatientList(patients);
        if (patients.length > 0) {
          setSelectedPatientId(patients[0].userId);
        }
      }
    } catch (err) {
      console.error('Switch user error:', err);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('pcc_active_user_id');
    setCurrentUser(null);
    setPatientRecord(null);
  };

  const markAllNotificationsRead = async () => {
    if (!currentUser) return;
    try {
      await api.markNotificationRead(undefined, currentUser.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        role,
        currentTab,
        setCurrentTab,
        availableUsers,
        switchUser,
        patientRecord,
        selectedPatientId,
        setSelectedPatientId,
        patientList,
        notifications,
        unreadNotifsCount,
        loading,
        refreshData,
        markAllNotificationsRead,
        logout,
        isChatOpen,
        setIsChatOpen,
        urgentModalOpen,
        setUrgentModalOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
