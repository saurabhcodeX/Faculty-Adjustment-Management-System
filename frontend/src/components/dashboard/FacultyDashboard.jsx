import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  CalendarDays, CalendarX2, ClipboardList, CheckCircle2, Clock3,
  XCircle, ArrowRight, BookOpen, MapPin, Users, FileClock
} from 'lucide-react';

const dateLabel = value => {
  if (!value) return '—';
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function FacultyDashboard() {
  const { user, absences, adjustments, timetables, selectedDate, selectedDay, setActiveTab, PERIODS } = useApp();
  const ownAbsences = absences.filter(item => item.facultyId === user.id)
    .sort((a, b) => new Date(b.reportedAt || b.date) - new Date(a.reportedAt || a.date));
  const ownAssignments = adjustments.filter(item => item.substituteFacultyId === user.id)
    .sort((a, b) => `${a.date}-${a.periodId}`.localeCompare(`${b.date}-${b.periodId}`));
  const ownSchedule = timetables[user.id]?.[selectedDay] || {};
  const counts = {
    total: ownAbsences.length,
    pending: ownAbsences.filter(item => item.status === 'Pending').length,
    approved: ownAbsences.filter(item => item.status === 'Approved').length,
    rejected: ownAbsences.filter(item => item.status === 'Rejected').length
  };
  const stats = [
    ['Total Absence Requests', counts.total, 'All requests you have submitted', FileClock, 'blue'],
    ['Pending Requests', counts.pending, 'Awaiting HOD review', Clock3, 'amber'],
    ['Approved Requests', counts.approved, 'Approved absences', CheckCircle2, 'green'],
    ['Rejected Requests', counts.rejected, 'Requests not approved', XCircle, 'red']
  ];
  const actions = [
    ['Report New Absence', 'Submit an absence request', CalendarX2, 'report-absence', 'amber'],
    ['View My Schedule', 'Classes and substitute duties', CalendarDays, 'my-schedule', 'teal'],
    ['View Absence History', 'Review your submitted requests', FileClock, 'my-absence-requests', 'indigo'],
    ['Substitute Assignments', 'Classes assigned to you', Users, 'my-substitute-assignments', 'blue']
  ];
  const badge = status => status === 'Approved' ? 'green' : status === 'Rejected' ? 'red' : 'amber';

  return <div className="faculty-dashboard">
    <section className="faculty-welcome">
      <div>
        <div className="faculty-welcome__eyebrow">Faculty workspace</div>
        <h1>Welcome back, {user.name}</h1>
        <p>Here’s your schedule, absence requests, and substitute assignments.</p>
        <div className="faculty-welcome__meta">
          {user.designation && <span>{user.designation}</span>}
          {user.department && <span>{user.department}</span>}
          <span><CalendarDays size={14} /> {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>
      <div className="faculty-welcome__mark"><BookOpen size={32} /></div>
    </section>

    <section className="fams-stats-grid" aria-label="Absence request statistics">
      {stats.map(([label, value, sub, Icon, color]) => <article className="fams-stat-card" key={label}>
        <div className="fams-stat-card__info"><div className="fams-stat-card__label">{label}</div><div className="fams-stat-card__value">{value}</div><div className="fams-stat-card__sub">{sub}</div></div>
        <div className={`fams-stat-card__icon fams-stat-card__icon--${color}`}><Icon size={21} /></div>
      </article>)}
    </section>

    <div className="fams-section-header faculty-section-heading"><div><h2 className="fams-section-title">Quick actions</h2><p>Jump to a common task</p></div></div>
    <section className="fams-quick-actions">
      {actions.map(([title, desc, Icon, tab, color]) => <button className="fams-quick-action" key={title} onClick={() => setActiveTab(tab)}>
        <span className={`fams-quick-action__icon fams-quick-action__icon--${color}`}><Icon size={20} /></span>
        <span className="fams-quick-action__text"><span className="fams-quick-action__title">{title}</span><span className="fams-quick-action__desc">{desc}</span></span><ArrowRight size={16} className="faculty-action-arrow" />
      </button>)}
    </section>

    <section className="fams-card faculty-section-card">
      <div className="fams-card__header"><div><div className="fams-card__title"><FileClock size={17} /> My recent absence requests</div><div className="fams-card__subtitle">Your latest submissions and their approval status</div></div><button className="fams-btn fams-btn--ghost fams-btn--sm" onClick={() => setActiveTab('my-absence-requests')}>View history <ArrowRight size={14} /></button></div>
      <div className="fams-card__body fams-card__body--flush">
        {!ownAbsences.length ? <div className="fams-empty"><div className="fams-empty__icon"><CheckCircle2 size={24} /></div><div className="fams-empty__title">No absence requests yet</div><div className="fams-empty__desc">Requests you submit will appear here.</div></div> :
          <div className="fams-table-wrap"><table className="fams-table"><thead><tr><th>Request Date</th><th>Absence Date</th><th>Reason</th><th>Leave Type</th><th>Approval Status</th><th>Action</th></tr></thead><tbody>
            {ownAbsences.slice(0, 6).map(item => <tr key={item.id}><td>{dateLabel(item.reportedAt?.slice(0, 10))}</td><td>{dateLabel(item.date)}</td><td>{item.reason || '—'}</td><td>{item.leaveType || '—'}</td><td><span className={`fams-badge fams-badge--${badge(item.status)}`}>{item.status}</span></td><td><button className="fams-btn fams-btn--ghost fams-btn--sm" onClick={() => setActiveTab('my-absence-requests')}>Details <ArrowRight size={13} /></button></td></tr>)}
          </tbody></table></div>}
      </div>
    </section>

    <section className="fams-card faculty-section-card">
      <div className="fams-card__header"><div><div className="fams-card__title"><ClipboardList size={17} /> My substitute assignments</div><div className="fams-card__subtitle">Classes assigned to you by the HOD</div></div><button className="fams-btn fams-btn--ghost fams-btn--sm" onClick={() => setActiveTab('my-substitute-assignments')}>View assignments <ArrowRight size={14} /></button></div>
      <div className="fams-card__body fams-card__body--flush">
        {!ownAssignments.length ? <div className="fams-empty"><div className="fams-empty__icon"><ClipboardList size={24} /></div><div className="fams-empty__title">No substitute assignments</div><div className="fams-empty__desc">New assignments relevant to you will appear here.</div></div> :
          <div className="fams-table-wrap"><table className="fams-table"><thead><tr><th>Date</th><th>Period</th><th>Original Faculty</th><th>Subject</th><th>Class</th><th>Room</th></tr></thead><tbody>
            {ownAssignments.slice(0, 8).map(item => <tr key={item.id}><td>{dateLabel(item.date)}</td><td>{item.periodId}{PERIODS.find(period => period.id === item.periodId)?.time ? ` · ${PERIODS.find(period => period.id === item.periodId).time}` : ''}</td><td>{item.originalFacultyName}</td><td>{item.subject}</td><td>{item.classGroup}</td><td><span className="faculty-room"><MapPin size={13} />{item.room || 'TBD'}</span></td></tr>)}
          </tbody></table></div>}
      </div>
    </section>

    <section className="fams-card faculty-section-card">
      <div className="fams-card__header"><div><div className="fams-card__title"><BookOpen size={17} /> My timetable</div><div className="fams-card__subtitle">{selectedDay} · {dateLabel(selectedDate)}</div></div><button className="fams-btn fams-btn--ghost fams-btn--sm" onClick={() => setActiveTab('my-schedule')}>Full schedule <ArrowRight size={14} /></button></div>
      <div className="fams-card__body fams-card__body--flush"><div className="fams-table-wrap"><table className="fams-table"><thead><tr><th>Day</th><th>Period</th><th>Time</th><th>Subject</th><th>Class</th><th>Room</th></tr></thead><tbody>
        {PERIODS.map(period => { const slot = ownSchedule[period.id]; return <tr key={period.id}><td>{selectedDay}</td><td>{period.label || `Period ${period.id}`}</td><td>{period.time}</td><td>{slot?.subject || <span className="faculty-free">Free</span>}</td><td>{slot?.classGroup || '—'}</td><td>{slot?.room ? <span className="faculty-room"><MapPin size={13} />{slot.room}</span> : '—'}</td></tr>; })}
      </tbody></table></div></div>
    </section>
  </div>;
}
