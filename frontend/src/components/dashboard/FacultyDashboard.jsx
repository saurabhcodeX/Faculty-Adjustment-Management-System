import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  CalendarX,
  Clock,
  BookOpen,
  ClipboardList,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowRight,
  Briefcase,
  GraduationCap,
  MapPin
} from 'lucide-react';

export default function FacultyDashboard() {
  const {
    user,
    absences,
    adjustments,
    timetables,
    selectedDate,
    selectedDay,
    setActiveTab,
    PERIODS
  } = useApp();

  // My data
  const myAbsences = absences.filter(a => a.facultyId === user.id);
  const myPending = myAbsences.filter(a => a.status === 'Pending');
  const myApproved = myAbsences.filter(a => a.status === 'Approved');
  const myRejected = myAbsences.filter(a => a.status === 'Rejected');

  // My proxy duties (where I'm the substitute)
  const myProxyDuties = adjustments.filter(adj => adj.substituteFacultyId === user.id);
  const todaysProxyDuties = myProxyDuties.filter(adj => adj.date === selectedDate);

  // My today's timetable
  const myTimetable = timetables[user.id] || {};
  const todaySlots = myTimetable[selectedDay] || {};

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  // Get greeting based on time
  const hour = today.getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div>
      {/* Welcome Banner */}
      <div className="fams-welcome">
        <div className="fams-welcome__greeting">{greeting}</div>
        <div className="fams-welcome__name">{user.name}</div>
        <div className="fams-welcome__info">
          {user.designation && <span><GraduationCap size={13} /> {user.designation}</span>}
          {user.department && <span><Briefcase size={13} /> {user.department}</span>}
          <span><Clock size={13} /> {dateStr}</span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="fams-stats-grid">
        <div className="fams-stat-card">
          <div className="fams-stat-card__info">
            <div className="fams-stat-card__label">Pending Requests</div>
            <div className="fams-stat-card__value">{myPending.length}</div>
            <div className="fams-stat-card__sub">Awaiting HOD review</div>
          </div>
          <div className="fams-stat-card__icon fams-stat-card__icon--amber">
            <AlertCircle size={22} />
          </div>
        </div>

        <div className="fams-stat-card">
          <div className="fams-stat-card__info">
            <div className="fams-stat-card__label">Approved Leaves</div>
            <div className="fams-stat-card__value">{myApproved.length}</div>
            <div className="fams-stat-card__sub">Total approved</div>
          </div>
          <div className="fams-stat-card__icon fams-stat-card__icon--green">
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="fams-stat-card">
          <div className="fams-stat-card__info">
            <div className="fams-stat-card__label">Proxy Duties</div>
            <div className="fams-stat-card__value">{myProxyDuties.length}</div>
            <div className="fams-stat-card__sub">{todaysProxyDuties.length} today</div>
          </div>
          <div className="fams-stat-card__icon fams-stat-card__icon--teal">
            <ClipboardList size={22} />
          </div>
        </div>

        <div className="fams-stat-card">
          <div className="fams-stat-card__info">
            <div className="fams-stat-card__label">Rejected</div>
            <div className="fams-stat-card__value">{myRejected.length}</div>
            <div className="fams-stat-card__sub">Total declined</div>
          </div>
          <div className="fams-stat-card__icon fams-stat-card__icon--red">
            <XCircle size={22} />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="fams-quick-actions">
        <button className="fams-quick-action" onClick={() => setActiveTab('report-absence')}>
          <div className="fams-quick-action__icon fams-quick-action__icon--amber">
            <CalendarX size={20} />
          </div>
          <div className="fams-quick-action__text">
            <div className="fams-quick-action__title">Report Absence</div>
            <div className="fams-quick-action__desc">Submit leave request</div>
          </div>
        </button>

        <button className="fams-quick-action" onClick={() => setActiveTab('my-schedule')}>
          <div className="fams-quick-action__icon fams-quick-action__icon--teal">
            <ClipboardList size={20} />
          </div>
          <div className="fams-quick-action__text">
            <div className="fams-quick-action__title">My Schedule</div>
            <div className="fams-quick-action__desc">View proxy duties</div>
          </div>
        </button>

        <button className="fams-quick-action" onClick={() => setActiveTab('master-timetable')}>
          <div className="fams-quick-action__icon fams-quick-action__icon--indigo">
            <BookOpen size={20} />
          </div>
          <div className="fams-quick-action__text">
            <div className="fams-quick-action__title">Master Timetable</div>
            <div className="fams-quick-action__desc">Full 8-period view</div>
          </div>
        </button>
      </div>

      {/* Main Grid */}
      <div className="fams-grid fams-grid--2-1">
        {/* Today's Timetable */}
        <div className="fams-card">
          <div className="fams-card__header">
            <div>
              <div className="fams-card__title">
                <BookOpen size={16} /> Today's Schedule
              </div>
              <div className="fams-card__subtitle">{selectedDay} ({selectedDate})</div>
            </div>
          </div>
          <div className="fams-card__body fams-card__body--flush">
            {PERIODS.length === 0 ? (
              <div className="fams-empty">
                <div className="fams-empty__title">No schedule data</div>
              </div>
            ) : (
              <div className="fams-table-wrap">
                <table className="fams-table">
                  <thead>
                    <tr>
                      <th>Period</th>
                      <th>Time</th>
                      <th>Subject</th>
                      <th>Class</th>
                      <th>Room</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PERIODS.map(period => {
                      const slot = todaySlots[period.id];
                      const proxyDuty = todaysProxyDuties.find(d => d.periodId === period.id);
                      const hasClass = slot && slot.subject;

                      return (
                        <tr key={period.id}>
                          <td>
                            <span style={{ fontWeight: 600, color: 'var(--fams-gray-800)' }}>
                              L{period.id}
                            </span>
                          </td>
                          <td style={{ fontSize: 12, color: 'var(--fams-gray-500)' }}>
                            {period.time}
                          </td>
                          <td>
                            {proxyDuty ? (
                              <span className="fams-badge fams-badge--teal">
                                ⚡ Proxy: {proxyDuty.subject}
                              </span>
                            ) : hasClass ? (
                              <span style={{ fontWeight: 500 }}>{slot.subject}</span>
                            ) : (
                              <span style={{ color: 'var(--fams-gray-400)', fontSize: 12 }}>Free</span>
                            )}
                          </td>
                          <td>
                            {proxyDuty ? (
                              <span style={{ fontSize: 12 }}>{proxyDuty.classGroup}</span>
                            ) : hasClass ? (
                              <span style={{ fontSize: 12 }}>{slot.classGroup}</span>
                            ) : (
                              <span style={{ color: 'var(--fams-gray-300)' }}>—</span>
                            )}
                          </td>
                          <td>
                            {(proxyDuty || hasClass) && (
                              <span style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 3 }}>
                                <MapPin size={11} style={{ color: 'var(--fams-gray-400)' }} />
                                {proxyDuty ? proxyDuty.room || 'TBD' : slot?.room || 'TBD'}
                              </span>
                            )}
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

        {/* My Requests */}
        <div className="fams-card">
          <div className="fams-card__header">
            <div className="fams-card__title">
              <CalendarX size={16} /> My Requests
            </div>
            <button className="fams-btn fams-btn--ghost fams-btn--sm" onClick={() => setActiveTab('my-schedule')}>
              View All <ArrowRight size={13} />
            </button>
          </div>
          <div className="fams-card__body" style={{ padding: '8px 20px' }}>
            {myAbsences.length === 0 ? (
              <div className="fams-empty" style={{ padding: '32px 16px' }}>
                <div className="fams-empty__icon">
                  <CheckCircle2 size={22} />
                </div>
                <div className="fams-empty__title">No leave requests</div>
                <div className="fams-empty__desc">
                  Submit an absence request when needed.
                </div>
              </div>
            ) : (
              <div className="fams-activity-list">
                {myAbsences.slice(0, 6).map(a => (
                  <div key={a.id} className="fams-activity-item">
                    <div className={`fams-activity-item__dot fams-activity-item__dot--${a.status.toLowerCase()}`} />
                    <div className="fams-activity-item__content">
                      <div className="fams-activity-item__title">
                        {a.leaveType || a.reason}
                      </div>
                      <div className="fams-activity-item__meta">
                        {a.dayOfWeek}, {a.date}
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

      {/* Proxy Duties Section */}
      {todaysProxyDuties.length > 0 && (
        <div className="fams-card" style={{ marginTop: 20 }}>
          <div className="fams-card__header">
            <div className="fams-card__title">
              <ClipboardList size={16} /> Today's Proxy Duties
            </div>
            <span className="fams-badge fams-badge--teal">{todaysProxyDuties.length} assignment{todaysProxyDuties.length > 1 ? 's' : ''}</span>
          </div>
          <div className="fams-card__body fams-card__body--flush">
            <div className="fams-table-wrap">
              <table className="fams-table">
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Subject</th>
                    <th>Class</th>
                    <th>For (Absent)</th>
                    <th>Room</th>
                  </tr>
                </thead>
                <tbody>
                  {todaysProxyDuties.map(adj => {
                    const periodInfo = PERIODS.find(p => p.id === adj.periodId);
                    return (
                      <tr key={adj.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>L{adj.periodId}</div>
                          <div style={{ fontSize: 11, color: 'var(--fams-gray-400)' }}>
                            {periodInfo ? periodInfo.time : adj.periodTime}
                          </div>
                        </td>
                        <td style={{ fontWeight: 500 }}>{adj.subject}</td>
                        <td>{adj.classGroup}</td>
                        <td>
                          <span style={{ color: 'var(--fams-danger)', fontSize: 13 }}>
                            {adj.originalFacultyName}
                          </span>
                        </td>
                        <td>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <MapPin size={11} style={{ color: 'var(--fams-gray-400)' }} />
                            {adj.room || 'TBD'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

