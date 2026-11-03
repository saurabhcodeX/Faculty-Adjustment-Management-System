import React from 'react';
import { useApp } from '../context/AppContext';
import {
  UserCheck2,
  Clock,
  Sparkles,
  MapPin,
  Calendar,
  AlertCircle,
  BookOpen
} from 'lucide-react';

export default function MyAdjustmentsView() {
  const {
    facultyList,
    currentFacultyId,
    setCurrentFacultyId,
    currentRole,
    user,
    timetables,
    PERIODS,
    selectedDay,
    selectedDate,
    adjustments,
    absences
  } = useApp();

  const currentFaculty = currentRole === 'hod'
    ? facultyList.find(f => f.id === currentFacultyId) || facultyList[0]
    : facultyList.find(f => f.id === user.id) || user;
  if (!currentFaculty) return null;
  const schedule = timetables[currentFaculty.id]?.[selectedDay] || {};

  const isAbsent = absences.some(
    a =>
      a.facultyId === currentFaculty.id &&
      (a.date === selectedDate || a.dayOfWeek === selectedDay) &&
      a.status === 'Approved'
  );

  const myProxyDuties = adjustments.filter(
    adj =>
      adj.substituteFacultyId === (currentRole === 'hod' ? currentFaculty.id : user.id) &&
      (currentRole === 'hod' ? (adj.date === selectedDate || adj.dayOfWeek === selectedDay) : true)
  );

  return (
    <div className="fams-page">
      {/* Header */}
      <div className="fams-page-header">
        <div className="fams-page-header__row">
          <div>
            <h1 className="fams-page-title">
              <UserCheck2 size={24} />
              <span>Faculty Personal Schedule & Proxy Board</span>
            </h1>
            <p className="fams-page-subtitle">
              View personal daily classes and proxy adjustment duties assigned by the HOD.
            </p>
          </div>

          {currentRole === 'hod' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--fams-gray-500)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Switch Teacher:
              </label>
              <select
                value={currentFaculty.id}
                onChange={(e) => setCurrentFacultyId(e.target.value)}
                className="fams-input fams-input--sm"
                style={{ width: 'auto', minWidth: 200 }}
              >
                {facultyList.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.designation})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Absent Notice */}
      {isAbsent && (
        <div className="fams-alert fams-alert--warning" style={{ marginBottom: 20 }}>
          <div className="fams-alert__icon">
            <AlertCircle size={20} />
          </div>
          <div className="fams-alert__content">
            <div className="fams-alert__title">You are marked on leave for {selectedDay} ({selectedDate})</div>
            <div className="fams-alert__desc">Your scheduled classes have been reassigned to substitute teachers.</div>
          </div>
        </div>
      )}

      {/* Proxy Duties */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--fams-gray-900)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={18} style={{ color: 'var(--fams-success)' }} />
          <span>Proxy Adjustments Assigned to You Today ({myProxyDuties.length})</span>
        </div>

        {myProxyDuties.length === 0 ? (
          <div className="fams-card">
            <div className="fams-empty" style={{ padding: '32px 16px' }}>
              <div className="fams-empty__title">No proxy substitution classes</div>
              <div className="fams-empty__desc">You have no proxy classes assigned for {selectedDay}.</div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 }}>
            {myProxyDuties.map(duty => {
              const periodMeta = PERIODS.find(p => p.id === duty.periodId);
              return (
                <div key={duty.id} className="fams-card" style={{ borderLeft: '3px solid var(--fams-success)' }}>
                  <div className="fams-card__body" style={{ padding: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div>
                        <span className="fams-badge fams-badge--green" style={{ marginBottom: 6 }}>
                          Lecture {duty.periodId} ({periodMeta?.time})
                        </span>
                        <h3 style={{ fontWeight: 700, fontSize: 15, color: 'var(--fams-gray-900)', marginTop: 6 }}>
                          {duty.subject}
                        </h3>
                        <div style={{ fontSize: 12, color: 'var(--fams-gray-600)', display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                          <span>Class: {duty.classGroup}</span>
                          <span>•</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <MapPin size={12} style={{ color: 'var(--fams-gray-400)' }} />
                            {duty.room}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--fams-gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                      <span style={{ color: 'var(--fams-gray-500)' }}>
                        Covering for: <strong style={{ color: 'var(--fams-gray-800)' }}>{duty.originalFacultyName}</strong>
                      </span>
                      <span style={{ color: 'var(--fams-success)', fontWeight: 600 }}>
                        Confirmed by HOD
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Full 8-Period Timetable */}
      <div className="fams-card">
        <div className="fams-card__header">
          <div>
            <div className="fams-card__title">
              <BookOpen size={16} /> Full 8-Period Timetable for {selectedDay}
            </div>
            <div className="fams-card__subtitle">
              {currentFaculty.name} ({currentFaculty.designation})
            </div>
          </div>
        </div>

        <div className="fams-card__body fams-card__body--flush">
          <div className="fams-table-wrap">
            <table className="fams-table">
              <thead>
                <tr>
                  <th>Lecture</th>
                  <th>Time</th>
                  <th>Type</th>
                  <th>Subject</th>
                  <th>Class & Room</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {PERIODS.map(period => {
                  const regularClass = schedule[period.id];
                  const proxyClass = myProxyDuties.find(d => d.periodId === period.id);

                  return (
                    <tr key={period.id} style={proxyClass ? { background: 'var(--fams-success-bg)' } : {}}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--fams-gray-800)' }}>
                          L{period.id}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: 12, color: 'var(--fams-gray-500)' }}>{period.time}</span>
                      </td>
                      <td>
                        {proxyClass ? (
                          <span className="fams-badge fams-badge--green">Proxy Duty</span>
                        ) : regularClass ? (
                          <span className="fams-badge fams-badge--gray">Regular</span>
                        ) : (
                          <span className="fams-badge fams-badge--teal">Free</span>
                        )}
                      </td>
                      <td>
                        {proxyClass ? (
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--fams-gray-900)', fontSize: 13 }}>
                              {proxyClass.subject}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--fams-gray-500)', marginTop: 1 }}>
                              Covering for {proxyClass.originalFacultyName}
                            </div>
                          </div>
                        ) : regularClass ? (
                          <span style={{ fontWeight: 500, color: 'var(--fams-gray-800)', fontSize: 13 }}>
                            {regularClass.subject}
                          </span>
                        ) : (
                          <span style={{ fontSize: 12, color: 'var(--fams-gray-400)', fontStyle: 'italic' }}>
                            Free Period — Available for adjustments
                          </span>
                        )}
                      </td>
                      <td>
                        {(proxyClass || regularClass) ? (
                          <div style={{ fontSize: 12 }}>
                            <span>{(proxyClass || regularClass).classGroup}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 2, color: 'var(--fams-gray-500)' }}>
                              <MapPin size={11} /> {(proxyClass || regularClass).room || 'TBD'}
                            </span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--fams-gray-400)' }}>—</span>
                        )}
                      </td>
                      <td>
                        {proxyClass ? (
                          <span className="fams-badge fams-badge--green">
                            <Sparkles size={11} /> Confirmed
                          </span>
                        ) : regularClass ? (
                          <span style={{ fontSize: 12, color: 'var(--fams-gray-500)' }}>Scheduled</span>
                        ) : (
                          <span style={{ fontSize: 12, color: 'var(--fams-gray-400)' }}>Available</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
