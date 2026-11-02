import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import NavigationTabs from './components/NavigationTabs';
import Dashboard from './components/Dashboard';
import FacultyAbsenceReport from './components/FacultyAbsenceReport';
import HodAdjustmentManager from './components/HodAdjustmentManager';
import MasterTimetableView from './components/MasterTimetableView';
import MyAdjustmentsView from './components/MyAdjustmentsView';
import TimetableEditor from './components/TimetableEditor';
import PrintSlipModal from './components/PrintSlipModal';
import NotificationToast from './components/NotificationToast';
import ConfirmModal from './components/ConfirmModal';
import LoginPage from './components/LoginPage';
import { AlertCircle, Loader2, RotateCw } from 'lucide-react';
import './App.css';

function LoadingScreen() {
  return (
    <div className="auth-screen" role="status">
      <div className="status-message">
        <Loader2 size={32} className="status-spinner" />
        <p>Loading your portal...</p>
      </div>
    </div>
  );
}

function LoadErrorScreen() {
  const { loadError, retryLoad } = useApp();
  return (
    <div className="auth-screen" role="alert">
      <div className="status-message">
        <AlertCircle size={32} className="status-error-icon" />
        <h1 className="auth-title">Could not load the portal</h1>
        <p>{loadError}</p>
        <button onClick={retryLoad} className="btn btn-primary">
          <RotateCw size={15} />
          <span>Try Again</span>
        </button>
      </div>
    </div>
  );
}

function AppGate() {
  const { authStatus } = useApp();
  if (authStatus === 'checking') return <LoadingScreen />;
  if (authStatus === 'anonymous') return <LoginPage />;
  if (authStatus === 'error') return <LoadErrorScreen />;
  return <MainApp />;
}

function MainApp() {
  const { activeTab, confirmState, handleConfirm, handleCancelConfirm } = useApp();
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [tabsOpen, setTabsOpen] = useState(false);

  return (
    <div className="app-layout">
      {/* Top Header Navbar */}
      <Navbar tabsOpen={tabsOpen} onToggleTabs={() => setTabsOpen(open => !open)} />

      {/* Navigation Tab Bar */}
      <NavigationTabs open={tabsOpen} onNavigate={() => setTabsOpen(false)} />

      {/* Main Tab Content */}
      <main className="main-content-container">
        {activeTab === 'dashboard' && (
          <Dashboard onOpenPrintModal={() => setShowPrintModal(true)} />
        )}
        {activeTab === 'report-absence' && (
          <FacultyAbsenceReport />
        )}
        {activeTab === 'hod-requests' && (
          <HodAdjustmentManager onOpenPrintModal={() => setShowPrintModal(true)} />
        )}
        {activeTab === 'master-timetable' && (
          <MasterTimetableView onOpenPrintModal={() => setShowPrintModal(true)} />
        )}
        {activeTab === 'my-schedule' && (
          <MyAdjustmentsView />
        )}
        {activeTab === 'timetable-editor' && (
          <TimetableEditor />
        )}
      </main>

      {/* Printable Notice Slip Modal */}
      {showPrintModal && (
        <PrintSlipModal onClose={() => setShowPrintModal(false)} />
      )}

      {/* Custom Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmLabel={confirmState.confirmLabel}
        cancelLabel={confirmState.cancelLabel}
        variant={confirmState.variant}
        onConfirm={handleConfirm}
        onCancel={handleCancelConfirm}
      />

      {/* Minimal App Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <span>Faculty Adjustment Management System • 8-Period Timetable Automation</span>
          <span className="footer-dot">•</span>
          <span>Automatic Conflict-Free Free Teacher Assignment</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppGate />
      <NotificationToast />
    </AppProvider>
  );
}
