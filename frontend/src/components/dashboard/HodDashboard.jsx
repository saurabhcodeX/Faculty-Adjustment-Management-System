import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  CalendarX,
  Shuffle,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Printer,
  Sparkles,
  BookOpen,
  MapPin,
  ShieldAlert,
  TrendingUp,
  UserCheck,
  ClipboardList,
  AlertCircle,
  Calendar,
  FileText
} from 'lucide-react';

export default function HodDashboard({ onOpenPrintModal }) {
  const {
    facultyList,
    absences,
    adjustments,
    selectedDate,
    selectedDay,
    setActiveTab,
    demoMode,
    PERIODS,
    reportAbsence
  } = useApp();

  const todaysAbsences = absences.filter(a => a.date === selectedDate);
  const pendingRequests = absences.filter(a => a.status === 'Pending');
  const approvedRequests = absences.filter(a => a.status === 'Approved');
  const rejectedRequests = absences.filter(a => a.status === 'Rejected');
  const todaysAdjustments = adjustments.filter(adj => adj.date === selectedDate);

  // Compute pending substitute assignments:
  // Approved absences that have NO adjustment record linked to them
  const adjustedAbsenceIds = new Set(adjustments.map(adj => adj.absenceId));
  const unassignedApproved = approvedRequests.filter(a => !adjustedAbsenceIds.has(a.id));

  // Faculty with at least one timetable entry (available today concept)
  const absentTodayIds = new Set(todaysAbsences.filter(a => a.status !== 'Rejected').map(a => a.facultyId));
  const availableToday = facultyList.filter(f => !absentTodayIds.has(f.id)).length;

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  // Recent absences (last 8)
  const recentAbsences = [...absences]
    .sort((a, b) => new Date(b.reportedAt || b.date) - new Date(a.reportedAt || a.date))
    .slice(0, 8);

  // Demo quick test
  const triggerDemoAbsence = async () => {
    const created = await reportAbsence({
      facultyId: 'f5',
      date: selectedDate,
      dayOfWeek: selectedDay,
      reason: 'Sudden high fever & medical consultation',
      leaveType: 'Medical Leave',
      periodsToAdjust: [6, 7, 8]
    });
    if (created) setActiveTab('hod-requests');
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const d = new Date(dateString + 'T00:00:00');
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  return (
    <div>
      {/* Welcome Banner */}
      <div className="fams-welcome">
        <div className="fams-welcome__greeting">Welcome back, Admin</div>
        <div className="fams-welcome__name">Department Overview</div>
        <div className="fams-welcome__info">
          <span><Clock size={13} /> {dateStr}</span>
          <span><Users size={13} /> {facultyList.length} Faculty Members</span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="fams-stats-grid">
        <div className="fams-stat-card">
          <div className="fams-stat-card__info">
            <div className="fams-stat-card__label">Total Faculty</div>
            <div className="fams-stat-card__value">{facultyList.length}</div>
            <div className="fams-stat-card__sub">Active department members</div>
          </div>
          <div className="fams-stat-card__icon fams-stat-card__icon--blue">
            <Users size={22} />
          </div>
        </div>

        <div className="fams-stat-card">
          <div className="fams-stat-card__info">
            <div className="fams-stat-card__label">Approved Leaves</div>
            <div className="fams-stat-card__value">{approvedRequests.length}</div>
            <div className="fams-stat-card__sub">Total approved absences</div>
          </div>
          <div className="fams-stat-card__icon fams-stat-card__icon--green">
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="fams-stat-card">
          <div className="fams-stat-card__info">
            <div className="fams-stat-card__label">Pending Requests</div>
            <div className="fams-stat-card__value">{pendingRequests.length}</div>
            <div className="fams-stat-card__sub">Awaiting your review</div>
          </div>
          <div className="fams-stat-card__icon fams-stat-card__icon--amber">
            <AlertTriangle size={22} />
          </div>
        </div>

        <div className="fams-stat-card">
          <div className="fams-stat-card__info">
            <div className="fams-stat-card__label">Pending Assignments</div>
            <div className="fams-stat-card__value" style={unassignedApproved.length > 0 ? { color: 'var(--fams-danger)' } : {}}>
              {unassignedApproved.length}
            </div>
            <div className="fams-stat-card__sub">Need substitute assignment</div>
          </div>
          <div className="fams-stat-card__icon fams-stat-card__icon--indigo">
            <ClipboardList size={22} />
          </div>
        </div>
      </div>

      {/* Alert for pending requests */}
      {pendingRequests.length > 0 && (
        <div className="fams-alert fams-alert--warning">
          <div className="fams-alert__icon">
            <AlertTriangle size={20} />
          </div>
          <div className="fams-alert__content">
            <div className="fams-alert__title">
              {pendingRequests.length} Pending Absence Request{pendingRequests.length > 1 ? 's' : ''}
            </div>
            <div className="fams-alert__desc">
              Faculty reported absence. Review and approve or reject.
            </div>
          </div>
          <div className="fams-alert__action">
            <button className="fams-btn fams-btn--primary fams-btn--sm" onClick={() => setActiveTab('hod-requests')}>
              Review Now <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Alert for pending substitute assignments */}
      {unassignedApproved.length > 0 && (
        <div className="fams-alert fams-alert--info">
          <div className="fams-alert__icon">
            <ClipboardList size={20} />
          </div>
          <div className="fams-alert__content">
            <div className="fams-alert__title">
              {unassignedApproved.length} Approved Absence{unassignedApproved.length > 1 ? 's' : ''} Without Substitute
            </div>
            <div className="fams-alert__desc">
              Approved leaves need substitute faculty assignments. Assign substitutes to ensure class coverage.
            </div>
          </div>
          <div className="fams-alert__action">
            <button className="fams-btn fams-btn--primary fams-btn--sm" onClick={() => setActiveTab('hod-requests')}>
              Assign Now <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Pending Substitute Assignments Table */}
      <div className="fams-card" style={{ marginTop: 20 }}>
        <div className="fams-card__header">
          <div>
            <div className="fams-card__title">
              <ClipboardList size={16} /> Pending Substitute Assignments
            </div>
            <div className="fams-card__subtitle">
              Approved absences awaiting substitute faculty assignment
            </div>
          </div>
          {unassignedApproved.length > 0 && (
            <button className="fams-btn fams-btn--primary fams-btn--sm" onClick={() => setActiveTab('hod-requests')}>
              <ShieldAlert size={14} /> Open Adjustment Console
            </button>
          )}
        </div>
        <div className="fams-card__body fams-card__body--flush">
          {unassignedApproved.length === 0 ? (
            <div className="fams-empty">
              <div className="fams-empty__icon">
                <CheckCircle2 size={26} />
              </div>
              <div className="fams-empty__title">All Assignments Complete</div>
              <div className="fams-empty__desc">
                Every approved absence has a substitute assigned. Great job!
              </div>
            </div>
          ) : (
            <div className="fams-table-wrap">
              <table className="fams-table">
                <thead>
                  <tr>
                    <th>Requesting Faculty</th>
                    <th>Absence Date</th>
                    <th>Reason</th>
                    <th>Leave Type</th>
                    <th>Approval Status</th>
                    <th>Assignment Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {unassignedApproved.map((absence) => (
                    <tr key={absence.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--fams-gray-800)' }}>
                          {absence.facultyName}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--fams-gray-400)' }}>
                          {absence.dayOfWeek}
                        </div>
                      </td>
                      <td>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                          <Calendar size={13} style={{ color: 'var(--fams-gray-400)' }} />
                          {formatDate(absence.date)}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: 13, color: 'var(--fams-gray-600)' }}>
                          {absence.reason}
                        </span>
                      </td>
                      <td>
                        <span className="fams-badge fams-badge--blue" style={{ fontSize: 11 }}>
                          {absence.leaveType || 'Not specified'}
                        </span>
                      </td>
                      <td>
                        <span className="fams-badge fams-badge--green">
                          <CheckCircle2 size={11} /> Approved
                        </span>
                      </td>
                      <td>
                        <span className="fams-badge fams-badge--amber" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <AlertCircle size={11} /> Pending Assignment
                        </span>
                      </td>
                      <td>
                        <button
                          className="fams-btn fams-btn--primary fams-btn--sm"
                          onClick={() => setActiveTab('hod-requests')}
                          title="Open Adjustment Console to assign a substitute"
                        >
                          <Shuffle size={13} /> Assign Substitute
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="fams-quick-actions" style={{ marginTop: 20 }}>
        <button className="fams-quick-action" onClick={() => setActiveTab('hod-requests')}>
          <div className="fams-quick-action__icon">
            <ShieldAlert size={20} />
          </div>
          <div className="fams-quick-action__text">
            <div className="fams-quick-action__title">Adjustment Console</div>
            <div className="fams-quick-action__desc">Approve & assign substitutes</div>
          </div>
        </button>

        <button className="fams-quick-action" onClick={() => setActiveTab('report-absence')}>
          <div className="fams-quick-action__icon fams-quick-action__icon--amber">
            <CalendarX size={20} />
          </div>
          <div className="fams-quick-action__text">
            <div className="fams-quick-action__title">Report Absence</div>
            <div className="fams-quick-action__desc">Submit leave request</div>
          </div>
        </button>

        <button className="fams-quick-action" onClick={() => setActiveTab('master-timetable')}>
          <div className="fams-quick-action__icon fams-quick-action__icon--teal">
            <BookOpen size={20} />
          </div>
          <div className="fams-quick-action__text">
            <div className="fams-quick-action__title">Master Timetable</div>
            <div className="fams-quick-action__desc">View 8-period schedule</div>
          </div>
        </button>

        <button className="fams-quick-action" onClick={() => setActiveTab('faculty-directory')}>
          <div className="fams-quick-action__icon fams-quick-action__icon--indigo">
            <Users size={20} />
          </div>
          <div className="fams-quick-action__text">
            <div className="fams-quick-action__title">Faculty Directory</div>
            <div className="fams-quick-action__desc">Manage department roster</div>
          </div>
        </button>
      </div>

      {/* Main Grid */}
      <div className="fams-grid fams-grid--2-1" style={{ marginTop: 20 }}>
        {/* Today's Notice Board */}
        <div className="fams-card">
          <div className="fams-card__header">
            <div>
              <div className="fams-card__title">
                <Shuffle size={16} /> Daily Adjustment Board
              </div>
              <div className="fams-card__subtitle">
                {selectedDay} ({selectedDate})
              </div>
            </div>
            {todaysAdjustments.length > 0 && (
              <button className="fams-btn fams-btn--secondary fams-btn--sm" onClick={onOpenPrintModal}>
                <Printer size={14} /> Print
              </button>
            )}
          </div>
          <div className="fams-card__body fams-card__body--flush">
            {todaysAdjustments.length === 0 ? (
              <div className="fams-empty">
                <div className="fams-empty__icon">
                  <CheckCircle2 size={26} />
                </div>
                <div className="fams-empty__title">All Classes On Schedule</div>
                <div className="fams-empty__desc">
                  No adjustments needed for {selectedDay}.
                </div>
                {demoMode && (
                  <button
                    className="fams-btn fams-btn--primary fams-btn--sm"
                    onClick={triggerDemoAbsence}
                    style={{ marginTop: 12 }}
                  >
                    <Sparkles size={14} /> Simulate Absence
                  </button>
                )}
              </div>
            ) : (
              <div className="fams-table-wrap">
                <table className="fams-table">
                  <thead>
                    <tr>
                      <th>Lecture</th>
                      <th>Class & Subject</th>
                      <th>Original (Absent)</th>
                      <th>Substitute</th>
                      <th>Room</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todaysAdjustments.map((adj) => {
                      const periodInfo = PERIODS.find(p => p.id === adj.periodId);
                      return (
                        <tr key={adj.id}>
                          <td>
                            <div style={{ fontWeight: 600, color: 'var(--fams-gray-800)' }}>
                              L{adj.periodId}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--fams-gray-400)' }}>
                              {periodInfo ? periodInfo.time : adj.periodTime}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 500 }}>{adj.subject}</div>
                            <div style={{ fontSize: 11, color: 'var(--fams-gray-400)' }}>{adj.classGroup}</div>
                          </td>
                          <td>
                            <span style={{ color: 'var(--fams-danger)', textDecoration: 'line-through', fontSize: 13 }}>
                              {adj.originalFacultyName}
                            </span>
                          </td>
                          <td>
                            <span className="fams-badge fams-badge--green">
                              {adj.substituteFacultyName}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 3 }}>
                              <MapPin size={12} style={{ color: 'var(--fams-gray-400)' }} />
                              {adj.room || 'TBD'}
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

        {/* Recent Activity */}
        <div className="fams-card">
          <div className="fams-card__header">
            <div className="fams-card__title">
              <TrendingUp size={16} /> Recent Activity
            </div>
          </div>
          <div className="fams-card__body" style={{ padding: '8px 20px' }}>
            {recentAbsences.length === 0 ? (
              <div className="fams-empty" style={{ padding: '32px 16px' }}>
                <div className="fams-empty__title">No recent activity</div>
                <div className="fams-empty__desc">Absence requests will appear here.</div>
              </div>
            ) : (
              <div className="fams-activity-list">
                {recentAbsences.map(a => (
                  <div key={a.id} className="fams-activity-item">
                    <div className={`fams-activity-item__dot fams-activity-item__dot--${a.status.toLowerCase()}`} />
                    <div className="fams-activity-item__content">
                      <div className="fams-activity-item__title">
                        {a.facultyName}
                      </div>
                      <div className="fams-activity-item__meta">
                        {a.dayOfWeek}, {a.date} • {a.leaveType || a.reason}
                      </div>
                    </div>
                    <span className={`fams-badge fams-badge--${
                      a.status === 'Pending' ? 'amber' : a.status === 'Approved' ? 'green' : 'red'
                    }`}>
                      {a.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overview Stats Row */}
      <div className="fams-grid fams-grid--3" style={{ marginTop: 20 }}>
        <div className="fams-card">
          <div className="fams-card__body" style={{ textAlign: 'center', padding: 24 }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--fams-success)' }}>
              {approvedRequests.length}
            </div>
            <div style={{ fontSize: 12, color: 'var(--fams-gray-500)', marginTop: 4, fontWeight: 500 }}>
              Total Approved
            </div>
            <div style={{ fontSize: 11, color: 'var(--fams-gray-400)', marginTop: 2 }}>
              <CheckCircle2 size={12} style={{ verticalAlign: -1 }} /> All time
            </div>
          </div>
        </div>
        <div className="fams-card">
          <div className="fams-card__body" style={{ textAlign: 'center', padding: 24 }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--fams-danger)' }}>
              {rejectedRequests.length}
            </div>
            <div style={{ fontSize: 12, color: 'var(--fams-gray-500)', marginTop: 4, fontWeight: 500 }}>
              Total Rejected
            </div>
            <div style={{ fontSize: 11, color: 'var(--fams-gray-400)', marginTop: 2 }}>
              <XCircle size={12} style={{ verticalAlign: -1 }} /> All time
            </div>
          </div>
        </div>
        <div className="fams-card">
          <div className="fams-card__body" style={{ textAlign: 'center', padding: 24 }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--fams-blue)' }}>
              {adjustments.length}
            </div>
            <div style={{ fontSize: 12, color: 'var(--fams-gray-500)', marginTop: 4, fontWeight: 500 }}>
              Total Adjustments
            </div>
            <div style={{ fontSize: 11, color: 'var(--fams-gray-400)', marginTop: 2 }}>
              <Shuffle size={12} style={{ verticalAlign: -1 }} /> All substitutions
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
