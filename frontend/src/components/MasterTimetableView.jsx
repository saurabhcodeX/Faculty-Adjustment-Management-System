import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getInitials } from '../utils/names';
import {
  CalendarDays,
  Printer,
  User,
  Clock,
  Sparkles,
  Info,
  AlertCircle,
  CheckCircle,
  Users,
  Zap
} from 'lucide-react';

export default function MasterTimetableView({ onOpenPrintModal }) {
  const {
    facultyList,
    timetables,
    PERIODS,
    DAYS_OF_WEEK,
    selectedDay,
    setSelectedDay,
    selectedDate,
    absences,
    adjustments
  } = useApp();

  const [hoveredFacultyId, setHoveredFacultyId] = useState(null);
  const [hoveredPeriodId, setHoveredPeriodId] = useState(null);

  const relevantAdjustments = adjustments.filter(
    adj => adj.date === selectedDate || adj.dayOfWeek === selectedDay
  );

  const absentTeacherIds = absences
    .filter(a => (a.date === selectedDate || a.dayOfWeek === selectedDay) && a.status === 'Approved')
    .map(a => a.facultyId);

  const totalFaculty = facultyList.length;
  const totalAbsent = absentTeacherIds.length;
  const totalAdjustments = relevantAdjustments.length;
  const totalSubstitutes = relevantAdjustments.filter(adj => adj.substituteFacultyId).length;

  return (
    <div className="fams-page">
      {/* Header */}
      <div className="fams-page-header">
        <div className="fams-page-header__row">
          <div>
            <h1 className="fams-page-title">
              <CalendarDays size={24} />
              <span>Master Timetable</span>
            </h1>
            <p className="fams-page-subtitle">
              Department-wide view across all 8 periods with live adjustments and substitute assignments
            </p>
          </div>
          <button onClick={onOpenPrintModal} className="fams-btn fams-btn--primary">
            <Printer size={16} /> Print Slip
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="fams-stats-grid" style={{ marginBottom: 20 }}>
        <div className="fams-stat-card">
          <div className="fams-stat-card__info">
            <div className="fams-stat-card__label">Total Faculty</div>
            <div className="fams-stat-card__value">{totalFaculty}</div>
          </div>
          <div className="fams-stat-card__icon fams-stat-card__icon--blue"><Users size={20} /></div>
        </div>
        <div className="fams-stat-card">
          <div className="fams-stat-card__info">
            <div className="fams-stat-card__label">On Leave</div>
            <div className="fams-stat-card__value">{totalAbsent}</div>
          </div>
          <div className="fams-stat-card__icon fams-stat-card__icon--red"><AlertCircle size={20} /></div>
        </div>
        <div className="fams-stat-card">
          <div className="fams-stat-card__info">
            <div className="fams-stat-card__label">Adjustments</div>
            <div className="fams-stat-card__value">{totalAdjustments}</div>
          </div>
          <div className="fams-stat-card__icon fams-stat-card__icon--green"><Zap size={20} /></div>
        </div>
        <div className="fams-stat-card">
          <div className="fams-stat-card__info">
            <div className="fams-stat-card__label">Substitutes</div>
            <div className="fams-stat-card__value">{totalSubstitutes}</div>
          </div>
          <div className="fams-stat-card__icon fams-stat-card__icon--amber"><Sparkles size={20} /></div>
        </div>
      </div>

      {/* Day Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--fams-gray-500)' }}>
          <Clock size={15} /> Select Day:
        </div>
        <div className="fams-filter-group">
          {DAYS_OF_WEEK.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`fams-filter-pill ${selectedDay === day ? 'fams-filter-pill--active' : ''}`}
            >
              {day.substring(0, 3)}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, flexWrap: 'wrap', fontSize: 11, color: 'var(--fams-gray-500)' }}>
        <span style={{ fontWeight: 600, color: 'var(--fams-gray-600)' }}>Legend:</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--fams-white)', border: '1px solid var(--fams-gray-200)' }} /> Regular
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--fams-gray-50)', border: '1px solid var(--fams-gray-200)' }} /> Free
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--fams-danger-bg)', border: '1px solid var(--fams-danger-border)' }} /> Reassigned
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--fams-success-bg)', border: '1px solid var(--fams-success-border)' }} /> Proxy Duty
        </span>
      </div>

      {/* Timetable Grid */}
      <div className="fams-card">
        <div className="fams-card__body fams-card__body--flush">
          <div className="fams-table-wrap">
            <table className="fams-table" style={{ fontSize: 12 }}>
              <thead>
                <tr>
                  <th style={{ position: 'sticky', left: 0, background: 'var(--fams-gray-50)', zIndex: 2, minWidth: 180 }}>
                    Faculty Member
                  </th>
                  {PERIODS.map(period => (
                    <th
                      key={period.id}
                      style={{
                        textAlign: 'center',
                        minWidth: 110,
                        background: hoveredPeriodId === period.id ? 'var(--fams-info-bg)' : undefined
                      }}
                      onMouseEnter={() => setHoveredPeriodId(period.id)}
                      onMouseLeave={() => setHoveredPeriodId(null)}
                    >
                      <div>{period.label}</div>
                      <div style={{ fontWeight: 400, fontSize: 10, marginTop: 1 }}>{period.time}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {facultyList.map(faculty => {
                  const isAbsent = absentTeacherIds.includes(faculty.id);
                  const schedule = timetables[faculty.id]?.[selectedDay] || {};

                  return (
                    <tr
                      key={faculty.id}
                      style={hoveredFacultyId === faculty.id ? { background: 'var(--fams-gray-50)' } : {}}
                      onMouseEnter={() => setHoveredFacultyId(faculty.id)}
                      onMouseLeave={() => setHoveredFacultyId(null)}
                    >
                      <td style={{ position: 'sticky', left: 0, background: 'var(--fams-white)', zIndex: 1, borderRight: '1px solid var(--fams-gray-200)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="fams-faculty-avatar" style={{ width: 30, height: 30, fontSize: 10 }}>
                            {getInitials(faculty.name)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--fams-gray-800)' }}>{faculty.name}</div>
                            <div style={{ fontSize: 10, color: 'var(--fams-gray-400)' }}>{faculty.designation}</div>
                          </div>
                        </div>
                        {isAbsent && (
                          <span className="fams-badge fams-badge--red" style={{ fontSize: 9, marginTop: 4 }}>
                            <AlertCircle size={10} /> On Leave
                          </span>
                        )}
                      </td>

                      {PERIODS.map(period => {
                        const regularClass = schedule[period.id];
                        const wasAdjustedOut = relevantAdjustments.find(
                          adj => adj.originalFacultyId === faculty.id && adj.periodId === period.id
                        );
                        const isSubstitutedIn = relevantAdjustments.find(
                          adj => adj.substituteFacultyId === faculty.id && adj.periodId === period.id
                        );

                        const cellBg = hoveredPeriodId === period.id ? 'rgba(37,99,235,0.03)' : undefined;

                        if (wasAdjustedOut) {
                          return (
                            <td key={period.id} style={{ background: cellBg || 'var(--fams-danger-bg)', textAlign: 'center', padding: '8px 6px' }}
                              onMouseEnter={() => setHoveredPeriodId(period.id)} onMouseLeave={() => setHoveredPeriodId(null)}>
                              <div style={{ textDecoration: 'line-through', opacity: 0.5, fontSize: 11, fontWeight: 500 }}>
                                {wasAdjustedOut.subject}
                              </div>
                              <div style={{ fontSize: 10, color: 'var(--fams-gray-400)' }}>{wasAdjustedOut.classGroup}</div>
                              <div style={{ fontSize: 10, color: 'var(--fams-success)', fontWeight: 600, marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                                <Sparkles size={9} />
                                {wasAdjustedOut.substituteFacultyName?.split(' ')[1] || wasAdjustedOut.substituteFacultyName}
                              </div>
                            </td>
                          );
                        }

                        if (isSubstitutedIn) {
                          return (
                            <td key={period.id} style={{ background: cellBg || 'var(--fams-success-bg)', textAlign: 'center', padding: '8px 6px' }}
                              onMouseEnter={() => setHoveredPeriodId(period.id)} onMouseLeave={() => setHoveredPeriodId(null)}>
                              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--fams-success)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                                <Sparkles size={9} /> PROXY
                              </div>
                              <div style={{ fontWeight: 600, fontSize: 11, color: 'var(--fams-gray-800)', marginTop: 2 }}>
                                {isSubstitutedIn.subject}
                              </div>
                              <div style={{ fontSize: 10, color: 'var(--fams-gray-500)' }}>
                                {isSubstitutedIn.classGroup} • {isSubstitutedIn.room}
                              </div>
                              <div style={{ fontSize: 9, color: 'var(--fams-gray-400)', marginTop: 1 }}>
                                for {isSubstitutedIn.originalFacultyName?.split(' ')[1] || isSubstitutedIn.originalFacultyName}
                              </div>
                            </td>
                          );
                        }

                        if (regularClass) {
                          return (
                            <td key={period.id} style={{ background: cellBg, textAlign: 'center', padding: '8px 6px' }}
                              onMouseEnter={() => setHoveredPeriodId(period.id)} onMouseLeave={() => setHoveredPeriodId(null)}>
                              <div style={{ fontWeight: 600, fontSize: 11, color: 'var(--fams-gray-800)' }}>
                                {regularClass.subject}
                              </div>
                              <div style={{ fontSize: 10, color: 'var(--fams-gray-400)' }}>{regularClass.classGroup}</div>
                              <div style={{ fontSize: 10, color: 'var(--fams-gray-400)' }}>{regularClass.room || 'Room TBA'}</div>
                            </td>
                          );
                        }

                        return (
                          <td key={period.id} style={{ background: cellBg || 'var(--fams-gray-50)', textAlign: 'center', padding: '8px 6px' }}
                            onMouseEnter={() => setHoveredPeriodId(period.id)} onMouseLeave={() => setHoveredPeriodId(null)}>
                            <span className="fams-badge fams-badge--gray" style={{ fontSize: 9 }}>Free</span>
                          </td>
                        );
                      })}
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
