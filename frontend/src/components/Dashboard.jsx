import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  CalendarX,
  Shuffle,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Printer,
  Sparkles,
  BookOpen,
  MapPin,
  ShieldAlert,
  FileText,
  ClipboardList,
  GraduationCap
} from 'lucide-react';

export default function Dashboard({ onOpenPrintModal }) {
  const {
    facultyList,
    absences,
    adjustments,
    selectedDate,
    selectedDay,
    setActiveTab,
    currentRole,
    demoMode,
    PERIODS,
    reportAbsence
  } = useApp();
  const isHod = currentRole === 'hod';

  // Filter absences and adjustments for the selected date
  const todaysAbsences = absences.filter(a => a.date === selectedDate);
  const pendingRequests = absences.filter(a => a.status === 'Pending');
  const todaysAdjustments = adjustments.filter(adj => adj.date === selectedDate);

  // Quick test absence generator
  const triggerDemoAbsence = async () => {
    const created = await reportAbsence({
      facultyId: 'f5', // Dr. Vikram Singh
      date: selectedDate,
      dayOfWeek: selectedDay,
      reason: 'Sudden high fever & medical consultation',
      leaveType: 'Medical Leave',
      periodsToAdjust: [6, 7, 8] // his regular classes
    });
    if (created) setActiveTab('hod-requests');
  };

  // Get current date formatted
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="dashboard-content">
      {/* Welcome Header */}
      <div className="welcome-header">
        <div className="welcome-content">
          <h1 className="welcome-title">Welcome to CU Faculty Portal</h1>
          <p className="welcome-subtitle">Manage timetable adjustments and faculty schedules • {dateStr}</p>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="quick-actions-grid">
        <button
          onClick={() => setActiveTab('report-absence')}
          className="quick-action-card primary"
        >
          <div className="action-icon-bg">
            <CalendarX size={24} />
          </div>
          <div className="action-content">
            <div className="action-title">Report Absence</div>
            <div className="action-desc">Notify about your absence</div>
          </div>
          <ArrowRight size={18} className="action-arrow" />
        </button>

        {isHod && (
          <button
            onClick={() => setActiveTab('hod-requests')}
            className="quick-action-card"
          >
            <div className="action-icon-bg">
              <ShieldAlert size={24} />
            </div>
            <div className="action-content">
              <div className="action-title">HOD Console</div>
              <div className="action-desc">Review pending requests</div>
            </div>
            <ArrowRight size={18} className="action-arrow" />
          </button>
        )}

        <button
          onClick={() => setActiveTab('master-timetable')}
          className="quick-action-card"
        >
          <div className="action-icon-bg">
            <BookOpen size={24} />
          </div>
          <div className="action-content">
            <div className="action-title">Full Timetable</div>
            <div className="action-desc">View 8-period schedule</div>
          </div>
          <ArrowRight size={18} className="action-arrow" />
        </button>

        <button
          onClick={() => setActiveTab('my-schedule')}
          className="quick-action-card"
        >
          <div className="action-icon-bg">
            <ClipboardList size={24} />
          </div>
          <div className="action-content">
            <div className="action-title">My Schedule</div>
            <div className="action-desc">Check proxy duties</div>
          </div>
          <ArrowRight size={18} className="action-arrow" />
        </button>
      </div>

      {/* Pending HOD Alert Banner */}
      {isHod && pendingRequests.length > 0 && (
        <div className="alert-banner">
          <div className="alert-banner-left">
            <div className="alert-icon-wrap">
              <AlertTriangle size={20} className="text-amber-600" />
            </div>
            <div>
              <div className="alert-banner-title">
                {pendingRequests.length} Pending Absence Request{pendingRequests.length > 1 ? 's' : ''} Require HOD Action
              </div>
              <div className="alert-banner-desc">
                Faculty reported absence. Free teachers need to be assigned for their scheduled lectures.
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('hod-requests')}
            className="alert-banner-btn"
          >
            <span>Open HOD Console</span>
            <ArrowRight size={15} />
          </button>
        </div>
      )}

      {/* Metric Stat Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Total Faculty</span>
            <div className="metric-icon-bg bg-blue">
              <Users size={18} />
            </div>
          </div>
          <div className="metric-value">{facultyList.length}</div>
          <div className="metric-subtext">Active department teachers</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Absences Today</span>
            <div className="metric-icon-bg bg-rose">
              <CalendarX size={18} />
            </div>
          </div>
          <div className="metric-value">
            {todaysAbsences.length}
            {todaysAbsences.length > 0 && (
              <span className="metric-pill pill-rose">
                {todaysAbsences.filter(a => a.status === 'Pending').length} Pending
              </span>
            )}
          </div>
          <div className="metric-subtext">On {selectedDay}, {selectedDate}</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Adjusted Lectures</span>
            <div className="metric-icon-bg bg-emerald">
              <Shuffle size={18} />
            </div>
          </div>
          <div className="metric-value">{todaysAdjustments.length}</div>
          <div className="metric-subtext">Substitutions active today</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Total Daily Periods</span>
            <div className="metric-icon-bg bg-indigo">
              <Clock size={18} />
            </div>
          </div>
          <div className="metric-value">{PERIODS.length}</div>
          <div className="metric-subtext">09:00 AM to 04:00 PM</div>
        </div>
      </div>

      {/* Main Grid: Today's Substitution Board & Quick Actions */}
      <div className="dashboard-main-grid">
        {/* Left Column: Today's Live Notice Board */}
        <div className="card notice-board-card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Daily Adjustment Notice Board</h2>
              <p className="card-subtitle">
                Official substitutions for {selectedDay} ({selectedDate})
              </p>
            </div>
            {todaysAdjustments.length > 0 && (
              <button
                onClick={onOpenPrintModal}
                className="btn btn-secondary btn-sm"
                title="Print or export daily adjustment slip"
              >
                <Printer size={15} />
                <span>Print Notice Slip</span>
              </button>
            )}
          </div>

          <div className="card-body">
            {todaysAdjustments.length === 0 ? (
              <div className="empty-state">
                <CheckCircle2 size={44} className="text-emerald-500 mb-2" />
                <h3 className="empty-title">All Classes Running as Scheduled</h3>
                <p className="empty-desc">
                  No adjustments or substitute teachers required for {selectedDay}.
                </p>
                <div className="empty-actions">
                  <button
                    onClick={() => setActiveTab('report-absence')}
                    className="btn btn-outline btn-sm"
                  >
                    Report Teacher Absence
                  </button>
                  {demoMode && isHod && (
                    <button
                      onClick={triggerDemoAbsence}
                      className="btn btn-primary btn-sm"
                    >
                      <Sparkles size={14} />
                      <span>Simulate Test Absence</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="adjustments-table-wrapper">
                <table className="clean-table">
                  <thead>
                    <tr>
                      <th>Lecture Slot</th>
                      <th>Class & Subject</th>
                      <th>Original Teacher (Absent)</th>
                      <th>Assigned Substitute</th>
                      <th>Room</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todaysAdjustments.map((adj) => {
                      const periodInfo = PERIODS.find(p => p.id === adj.periodId);
                      return (
                        <tr key={adj.id}>
                          <td>
                            <div className="font-semibold text-slate-800">
                              Lecture {adj.periodId}
                            </div>
                            <div className="text-xs text-slate-500">
                              {periodInfo ? periodInfo.time : adj.periodTime}
                            </div>
                          </td>
                          <td>
                            <div className="font-medium text-slate-800">
                              {adj.subject}
                            </div>
                            <div className="text-xs text-slate-500 font-mono">
                              {adj.classGroup}
                            </div>
                          </td>
                          <td>
                            <span className="text-rose-600 line-through text-sm block">
                              {adj.originalFacultyName}
                            </span>
                            <span className="badge-tag tag-rose">On Leave</span>
                          </td>
                          <td>
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium text-emerald-700 text-sm">
                                {adj.substituteFacultyName}
                              </span>
                            </div>
                            <span className="badge-tag tag-emerald">Proxy Assigned</span>
                          </td>
                          <td>
                            <div className="text-sm text-slate-700 flex items-center gap-1">
                              <MapPin size={12} className="text-slate-400" />
                              <span>{adj.room || 'Classroom'}</span>
                            </div>
                          </td>
                          <td>
                            <span className="status-badge status-confirmed">
                              Confirmed
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Quick Guidance & System Flow */}
        <div className="dashboard-sidebar">
          {/* How It Works Card */}
          <div className="card guide-card">
            <div className="card-header border-b">
              <h3 className="card-title text-base flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-600" />
                <span>How This System Works</span>
              </h3>
            </div>
            <div className="card-body guide-steps">
              <div className="guide-step">
                <div className="step-num">1</div>
                <div className="step-content">
                  <div className="step-title">Teacher Reports Absence</div>
                  <div className="step-desc">
                    Absent teacher submits leave for a day. The system scans their 8-period timetable and detects impacted lectures.
                  </div>
                </div>
              </div>

              <div className="guide-step">
                <div className="step-num">2</div>
                <div className="step-content">
                  <div className="step-title">HOD Automatic Matching</div>
                  <div className="step-desc">
                    The engine checks all other teachers: who is <strong>100% free</strong> in that slot, not on leave, and has the lowest daily load.
                  </div>
                </div>
              </div>

              <div className="guide-step">
                <div className="step-num">3</div>
                <div className="step-content">
                  <div className="step-title">1-Click Approval & Notice</div>
                  <div className="step-desc">
                    HOD approves auto-assigned or manually chosen substitutes. Master timetable and daily notices update immediately.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Short Cuts */}
          <div className="card shortcuts-card">
            <h3 className="card-title text-base mb-3">Quick Navigation</h3>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setActiveTab('report-absence')}
                className="btn btn-outline w-full justify-start text-sm"
              >
                <CalendarX size={15} />
                <span>Report Teacher Absence Form</span>
              </button>
              {isHod && (
                <button
                  onClick={() => setActiveTab('hod-requests')}
                  className="btn btn-outline w-full justify-start text-sm"
                >
                  <ShieldAlert size={15} />
                  <span>HOD Adjustment Review Console</span>
                </button>
              )}
              <button
                onClick={() => setActiveTab('master-timetable')}
                className="btn btn-outline w-full justify-start text-sm"
              >
                <BookOpen size={15} />
                <span>View Full Master 8-Lecture Grid</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

