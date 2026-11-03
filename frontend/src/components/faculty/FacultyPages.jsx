import React from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, UserRound, CalendarDays, CheckCircle2 } from 'lucide-react';
import { getInitials } from '../../utils/names';

const formatDate = value => value ? new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const statusColor = status => status === 'Approved' ? 'green' : status === 'Rejected' ? 'red' : 'amber';

export function FacultyAbsenceRequests() {
  const { user, absences } = useApp();
  const requests = absences.filter(item => item.facultyId === user.id).sort((a, b) => new Date(b.reportedAt || b.date) - new Date(a.reportedAt || a.date));
  return <section className="fams-card faculty-page-card">
    <div className="fams-card__header"><div><div className="fams-card__title"><CalendarDays size={17} /> My absence requests</div><div className="fams-card__subtitle">Request history for {user.name}</div></div><span className="fams-badge fams-badge--blue">{requests.length} total</span></div>
    <div className="fams-card__body fams-card__body--flush">{requests.length ? <div className="fams-table-wrap"><table className="fams-table"><thead><tr><th>Request Date</th><th>Absence Date</th><th>Reason</th><th>Leave Type</th><th>Approval Status</th></tr></thead><tbody>{requests.map(item => <tr key={item.id}><td>{formatDate(item.reportedAt)}</td><td>{formatDate(item.date)}</td><td>{item.reason || '—'}</td><td>{item.leaveType || '—'}</td><td><span className={`fams-badge fams-badge--${statusColor(item.status)}`}>{item.status}</span></td></tr>)}</tbody></table></div> : <div className="fams-empty"><div className="fams-empty__icon"><CheckCircle2 size={24} /></div><div className="fams-empty__title">No absence requests</div><div className="fams-empty__desc">Your submitted requests will appear here.</div></div>}</div>
  </section>;
}

export function FacultyNotifications() {
  const { user, absences, adjustments } = useApp();
  const items = [
    ...absences.filter(item => item.facultyId === user.id && item.status === 'Pending').map(item => ({ id: item.id, title: 'Absence request awaiting review', detail: `${item.dayOfWeek}, ${formatDate(item.date)}` })),
    ...adjustments.filter(item => item.substituteFacultyId === user.id).map(item => ({ id: item.id, title: `Substitute assignment · ${item.subject}`, detail: `${item.dayOfWeek}, ${formatDate(item.date)} · Period ${item.periodId}` }))
  ].sort((a, b) => a.detail.localeCompare(b.detail));
  return <section className="fams-card faculty-page-card"><div className="fams-card__header"><div><div className="fams-card__title"><Bell size={17} /> Notifications</div><div className="fams-card__subtitle">Updates related to your requests and assignments</div></div></div><div className="fams-card__body">{items.length ? <div className="faculty-notifications">{items.map(item => <article className="faculty-notification" key={item.id}><span className="faculty-notification__icon"><Bell size={16} /></span><div><strong>{item.title}</strong><span>{item.detail}</span></div></article>)}</div> : <div className="fams-empty"><div className="fams-empty__icon"><CheckCircle2 size={24} /></div><div className="fams-empty__title">You’re all caught up</div><div className="fams-empty__desc">New updates will appear here.</div></div>}</div></section>;
}

export function FacultyProfile() {
  const { user } = useApp();
  return <section className="fams-card faculty-page-card"><div className="fams-card__header"><div><div className="fams-card__title"><UserRound size={17} /> My profile</div><div className="fams-card__subtitle">Your authenticated faculty account</div></div></div><div className="fams-card__body"><div className="faculty-profile"><div className="faculty-profile__avatar">{getInitials(user.name)}</div><div><h2>{user.name}</h2><p>Faculty</p></div></div><dl className="faculty-profile__details"><div><dt>Email</dt><dd>{user.email || '—'}</dd></div><div><dt>Department</dt><dd>{user.department || '—'}</dd></div><div><dt>Designation</dt><dd>{user.designation || '—'}</dd></div></dl><p className="faculty-profile__hint">Use the profile menu to change your password or sign out.</p></div></section>;
}
