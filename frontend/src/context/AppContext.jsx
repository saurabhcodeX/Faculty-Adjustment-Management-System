import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

const AppContext = createContext();
const REFRESH_INTERVAL_MS = 60 * 1000;

export function AppProvider({ children }) {
  // 'checking' | 'anonymous' | 'ready' | 'error'
  const [authStatus, setAuthStatus] = useState('checking');
  const [loadError, setLoadError] = useState('');
  const [user, setUser] = useState(null);

  // Core State
  const [PERIODS, setPeriods] = useState([]);
  const [DAYS_OF_WEEK, setDaysOfWeek] = useState([]);
  const [demoMode, setDemoMode] = useState(false);
  const [facultyList, setFacultyList] = useState([]);
  const [timetables, setTimetables] = useState({});
  const [absences, setAbsences] = useState([]);
  const [adjustments, setAdjustments] = useState([]);

  // UI State
  const currentRole = user?.role ?? 'faculty';
  const [currentFacultyId, setCurrentFacultyId] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Date
  const today = new Date();
  const todayISO = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0')
  ].join('-');
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDayName = dayNames[today.getDay()] === 'Sunday' ? 'Monday' : dayNames[today.getDay()];

  const [selectedDate, setSelectedDate] = useState(todayISO);
  const [selectedDay, setSelectedDay] = useState(currentDayName);

  // ─── Toast System ─────────────────────────────────────────────
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 4500) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, entering: true }]);

    // Mark as not-entering after mount animation
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, entering: false } : t));
    }, 50);

    // Auto-dismiss
    setTimeout(() => {
      dismissToast(id);
    }, duration);

    return id;
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 300);
  }, []);

  // ─── Confirm Dialog System ────────────────────────────────────
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    variant: 'warning',
    resolve: null
  });

  const showConfirm = useCallback(({
    title = 'Are you sure?',
    message = '',
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'warning'
  } = {}) => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        title,
        message,
        confirmLabel,
        cancelLabel,
        variant,
        resolve
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (confirmState.resolve) confirmState.resolve(true);
    setConfirmState(prev => ({ ...prev, isOpen: false, resolve: null }));
  }, [confirmState]);

  const handleCancelConfirm = useCallback(() => {
    if (confirmState.resolve) confirmState.resolve(false);
    setConfirmState(prev => ({ ...prev, isOpen: false, resolve: null }));
  }, [confirmState]);

  // ─── Session & server data ────────────────────────────────────
  const applySnapshot = useCallback((snapshot) => {
    setPeriods(snapshot.periods);
    setDaysOfWeek(snapshot.daysOfWeek);
    setDemoMode(snapshot.demoMode);
    setFacultyList(snapshot.faculty);
    setTimetables(snapshot.timetables);
    setAbsences(snapshot.absences);
    setAdjustments(snapshot.adjustments);
  }, []);

  const startSession = useCallback(async () => {
    setAuthStatus('checking');
    setLoadError('');
    try {
      const { user: sessionUser } = await api.getSession();
      if (!sessionUser) {
        setUser(null);
        setAuthStatus('anonymous');
        return;
      }
      applySnapshot(await api.getBootstrap());
      setUser(sessionUser);
      setCurrentFacultyId(sessionUser.id);
      setAuthStatus('ready');
    } catch (err) {
      if (err.status === 401) {
        setAuthStatus('anonymous');
        return;
      }
      setLoadError(err.message);
      setAuthStatus('error');
    }
  }, [applySnapshot]);

  const endSession = useCallback((message, type = 'info') => {
    setUser(null);
    setFacultyList([]);
    setTimetables({});
    setAbsences([]);
    setAdjustments([]);
    setCurrentFacultyId(null);
    setActiveTab('dashboard');
    setAuthStatus('anonymous');
    if (message) showToast(message, type);
  }, [showToast]);

  const refreshData = useCallback(async () => {
    try {
      applySnapshot(await api.getBootstrap());
    } catch (err) {
      if (err.status === 401) endSession('Your session has expired. Please sign in again.', 'warning');
    }
  }, [applySnapshot, endSession]);

  useEffect(() => { startSession(); }, [startSession]);

  // Other users' changes (a new absence, an approved substitute) arrive without a manual reload.
  useEffect(() => {
    if (authStatus !== 'ready') return undefined;
    const interval = setInterval(refreshData, REFRESH_INTERVAL_MS);
    window.addEventListener('focus', refreshData);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', refreshData);
    };
  }, [authStatus, refreshData]);

  // Reports failures to the user. Resolves to the action's result, or null if it failed.
  const runAction = async (action) => {
    try {
      return await action();
    } catch (err) {
      if (err.status === 401) {
        endSession('Your session has expired. Please sign in again.', 'warning');
        return null;
      }
      showToast(err.message, 'error');
      if (err.status === 409) refreshData();
      return null;
    }
  };

  const login = async (email, password) => {
    await api.login(email, password);
    setActiveTab('dashboard');
    await startSession();
  };

  const logout = async () => {
    await runAction(() => api.logout());
    endSession('You have been signed out.');
  };

  const changePassword = (currentPassword, newPassword) => api.changePassword(currentPassword, newPassword);

  // When date changes, auto-update day of week
  const handleDateChange = (newDateStr) => {
    setSelectedDate(newDateStr);
    try {
      const d = new Date(newDateStr + 'T00:00:00');
      const calculatedDay = dayNames[d.getDay()];
      setSelectedDay(calculatedDay !== 'Sunday' ? calculatedDay : 'Monday');
    } catch { /* keep current */ }
  };

  // ─── Actions ──────────────────────────────────────────────────

  const reportAbsence = (absenceData) => runAction(async () => {
    const created = await api.createAbsence(absenceData);
    setAbsences(prev => [created, ...prev]);
    showToast(`Absence request submitted for ${created.facultyName}. Sent to HOD for review.`, 'success');
    return created;
  });

  const approveAdjustments = (absenceId, periodAssignments, notes = '') => runAction(async () => {
    const result = await api.approveAbsence(absenceId, periodAssignments, notes);
    setAbsences(prev => prev.map(a => (a.id === absenceId ? result.absence : a)));
    setAdjustments(prev => [...result.adjustments, ...prev.filter(adj => adj.absenceId !== absenceId)]);
    showToast(`Adjustments approved & ${result.adjustments.length} substitute(s) assigned!`, 'success');
    return result;
  });

  const rejectAbsence = (absenceId) => runAction(async () => {
    const updated = await api.rejectAbsence(absenceId);
    setAbsences(prev => prev.map(a => (a.id === absenceId ? updated : a)));
    setAdjustments(prev => prev.filter(adj => adj.absenceId !== absenceId));
    showToast('Absence request rejected.', 'info');
    return updated;
  });

  const removeAdjustment = (adjId) => runAction(async () => {
    await api.deleteAdjustment(adjId);
    setAdjustments(prev => prev.filter(a => a.id !== adjId));
    showToast('Adjustment cancelled.', 'info');
    return true;
  });

  const updateTimetableCell = (facultyId, day, periodId, classData) => runAction(async () => {
    const result = await api.updateTimetableCell(facultyId, day, periodId, classData);
    setTimetables(prev => ({
      ...prev,
      [facultyId]: {
        ...prev[facultyId],
        [day]: { ...prev[facultyId]?.[day], [periodId]: result.classData }
      }
    }));
    showToast('Timetable updated.', 'success');
    return true;
  });

  const addFaculty = (facultyData) => runAction(async () => {
    const created = await api.createFaculty(facultyData);
    setFacultyList(prev => [...prev, created]);
    showToast(`Added ${created.name} to faculty roster!`, 'success');
    return created;
  });

  const removeFaculty = (facultyId) => runAction(async () => {
    await api.deleteFaculty(facultyId);
    setFacultyList(prev => prev.filter(f => f.id !== facultyId));
    setTimetables(prev => {
      const { [facultyId]: _removed, ...rest } = prev;
      return rest;
    });
    showToast('Teacher removed from the roster.', 'info');
    return true;
  });

  const resetToDemoData = async () => {
    const confirmed = await showConfirm({
      title: 'Reset to Demo Data?',
      message: 'This will erase all your changes and restore the default sample faculty, timetables, and adjustments.',
      confirmLabel: 'Yes, Reset Everything',
      cancelLabel: 'Keep My Data',
      variant: 'danger'
    });
    if (!confirmed) return;

    const result = await runAction(() => api.resetDemo());
    if (result) endSession('System reset to demo data. Please sign in again.');
  };

  return (
    <AppContext.Provider
      value={{
        authStatus, loadError, user, demoMode,
        login, logout, changePassword, retryLoad: startSession,
        PERIODS, DAYS_OF_WEEK,
        facultyList,
        timetables, absences, adjustments,
        currentRole,
        currentFacultyId, setCurrentFacultyId,
        activeTab, setActiveTab,
        selectedDate, setSelectedDate: handleDateChange,
        selectedDay, setSelectedDay,
        // Toast & Confirm
        toasts, showToast, dismissToast,
        confirmState, showConfirm, handleConfirm, handleCancelConfirm,
        // Actions
        reportAbsence, approveAdjustments, rejectAbsence,
        removeAdjustment, updateTimetableCell, addFaculty, removeFaculty, resetToDemoData
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}
