import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './components/Dashboard';
import FacultyAbsenceReport from './components/FacultyAbsenceReport';
import HodAdjustmentManager from './components/HodAdjustmentManager';
import MasterTimetableView from './components/MasterTimetableView';
import MyAdjustmentsView from './components/MyAdjustmentsView';
import TimetableEditor from './components/TimetableEditor';
import FacultyDirectory from './components/faculty/FacultyDirectory';
import ReportsPage from './components/reports/ReportsPage';
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

  return (
    <>
      <AppLayout>
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
        {activeTab === 'faculty-directory' && (
          <FacultyDirectory />
        )}
        {activeTab === 'reports' && (
          <ReportsPage />
        )}
      </AppLayout>

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
    </>
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
