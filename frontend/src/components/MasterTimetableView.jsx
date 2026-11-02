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

  // Find adjustments for the selected date or day
  const relevantAdjustments = adjustments.filter(
    adj => adj.date === selectedDate || adj.dayOfWeek === selectedDay
  );

  // Find absent teachers for today
  const absentTeacherIds = absences
    .filter(a => (a.date === selectedDate || a.dayOfWeek === selectedDay) && a.status === 'Approved')
    .map(a => a.facultyId);

  // Calculate statistics
  const totalFaculty = facultyList.length;
  const totalAbsent = absentTeacherIds.length;
  const totalAdjustments = relevantAdjustments.length;
  const totalSubstitutes = relevantAdjustments.filter(adj => adj.substituteFacultyId).length;

  return (
    <div className="master-timetable-container">
      {/* Premium Header */}
      <div className="timetable-header-premium">
        <div className="header-content">
          <div>
            <h1 className="page-title premium-title flex items-center gap-3">
              <div className="icon-badge badge-indigo">
                <CalendarDays size={24} />
              </div>
              <span>Master Timetable</span>
            </h1>
            <p className="page-subtitle mt-2">
              Department-wide view across all 8 periods with live adjustments and substitute assignments
            </p>
          </div>

          <button
            onClick={onOpenPrintModal}
            className="btn btn-primary print-btn-premium hover-lift"
            title="Generate printable notice slip for notice board"
          >
            <Printer size={16} />
            <span>Print Slip</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid-premium">
          <div className="stat-card-premium">
            <div className="stat-icon-wrapper blue">
              <Users size={18} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Total Faculty</span>
              <span className="stat-value">{totalFaculty}</span>
            </div>
          </div>

          <div className="stat-card-premium">
            <div className="stat-icon-wrapper rose">
              <AlertCircle size={18} />
            </div>
            <div className="stat-info">
              <span className="stat-label">On Leave</span>
              <span className="stat-value">{totalAbsent}</span>
            </div>
          </div>

          <div className="stat-card-premium">
            <div className="stat-icon-wrapper emerald">
              <Zap size={18} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Adjustments</span>
              <span className="stat-value">{totalAdjustments}</span>
            </div>
          </div>

          <div className="stat-card-premium">
            <div className="stat-icon-wrapper amber">
              <Sparkles size={18} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Substitutes</span>
              <span className="stat-value">{totalSubstitutes}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Day Selector - Enhanced */}
      <div className="day-selector-container">
        <div className="day-selector-label">
          <Clock size={16} className="text-slate-500" />
          <span>Select Day:</span>
        </div>
        <div className="day-tabs-bar-premium">
          {DAYS_OF_WEEK.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`day-tab-btn-premium ${selectedDay === day ? 'active' : ''}`}
            >
              <span className="day-name">{day.substring(0, 3)}</span>
              <span className="day-full">{day}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Enhanced Legend */}
      <div className="timetable-legend-premium">
        <div className="legend-title">Legend:</div>
        <div className="legend-items-grid">
          <div className="legend-item-premium">
            <div className="legend-swatch legend-regular"></div>
            <span>Regular Class</span>
          </div>
          <div className="legend-item-premium">
            <div className="legend-swatch legend-free"></div>
            <span>Free Period</span>
          </div>
          <div className="legend-item-premium">
            <div className="legend-swatch legend-absent"></div>
            <span>Class Reassigned</span>
          </div>
          <div className="legend-item-premium">
            <div className="legend-swatch legend-proxy"></div>
            <span>Proxy Duty</span>
          </div>
        </div>
      </div>

      {/* The 8-Lecture Grid Table - Enhanced */}
      <div className="card table-card-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="master-table-enhanced">
            <thead>
              <tr>
                <th className="sticky-col faculty-header-premium">Faculty Member</th>
                {PERIODS.map(period => (
                  <th
                    key={period.id}
                    className={`period-col-header-premium ${hoveredPeriodId === period.id ? 'highlighted' : ''}`}
                    onMouseEnter={() => setHoveredPeriodId(period.id)}
                    onMouseLeave={() => setHoveredPeriodId(null)}
                  >
                    <div className="period-label">{period.label}</div>
                    <div className="period-time">{period.time}</div>
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
                    className={`faculty-row-enhanced ${isAbsent ? 'absent-faculty' : ''} ${hoveredFacultyId === faculty.id ? 'highlighted' : ''}`}
                    onMouseEnter={() => setHoveredFacultyId(faculty.id)}
                    onMouseLeave={() => setHoveredFacultyId(null)}
                  >
                    {/* Faculty Identity Column */}
                    <td className="sticky-col faculty-cell-premium">
                      <div className="faculty-name-wrapper">
                        <div className="faculty-avatar">
                          {getInitials(faculty.name)}
                        </div>
                        <div>
                          <div className="faculty-name">{faculty.name}</div>
                          <div className="faculty-designation">{faculty.designation}</div>
                        </div>
                      </div>
                      {isAbsent && (
                        <span className="badge-tag tag-rose absence-badge">
                          <AlertCircle size={12} />
                          On Leave
                        </span>
                      )}
                    </td>

                    {/* 8 Periods */}
                    {PERIODS.map(period => {
                      const regularClass = schedule[period.id];

                      const wasAdjustedOut = relevantAdjustments.find(
                        adj =>
                          adj.originalFacultyId === faculty.id &&
                          adj.periodId === period.id
                      );

                      const isSubstitutedIn = relevantAdjustments.find(
                        adj =>
                          adj.substituteFacultyId === faculty.id &&
                          adj.periodId === period.id
                      );

                      if (wasAdjustedOut) {
                        return (
                          <td
                            key={period.id}
                            className={`cell-enhanced cell-adjusted-out-premium ${hoveredPeriodId === period.id ? 'period-highlighted' : ''}`}
                            onMouseEnter={() => setHoveredPeriodId(period.id)}
                            onMouseLeave={() => setHoveredPeriodId(null)}
                          >
                            <div className="class-title line-through opacity-60">
                              {wasAdjustedOut.subject}
                            </div>
                            <div className="class-group-display">
                              {wasAdjustedOut.classGroup}
                            </div>
                            <div className="proxy-indicator-premium">
                              <Sparkles size={12} />
                              <span>{wasAdjustedOut.substituteFacultyName.split(' ')[1] || wasAdjustedOut.substituteFacultyName}</span>
                            </div>
                          </td>
                        );
                      }

                      if (isSubstitutedIn) {
                        return (
                          <td
                            key={period.id}
                            className={`cell-enhanced cell-proxy-in-premium ${hoveredPeriodId === period.id ? 'period-highlighted' : ''}`}
                            onMouseEnter={() => setHoveredPeriodId(period.id)}
                            onMouseLeave={() => setHoveredPeriodId(null)}
                          >
                            <div className="proxy-label">
                              <Sparkles size={11} />
                              PROXY
                            </div>
                            <div className="class-title proxy-class">
                              {isSubstitutedIn.subject}
                            </div>
                            <div className="class-meta">
                              {isSubstitutedIn.classGroup} • {isSubstitutedIn.room}
                            </div>
                            <div className="proxy-for">
                              for {isSubstitutedIn.originalFacultyName.split(' ')[1] || isSubstitutedIn.originalFacultyName}
                            </div>
                          </td>
                        );
                      }

                      if (regularClass) {
                        return (
                          <td
                            key={period.id}
                            className={`cell-enhanced cell-regular-premium ${hoveredPeriodId === period.id ? 'period-highlighted' : ''}`}
                            onMouseEnter={() => setHoveredPeriodId(period.id)}
                            onMouseLeave={() => setHoveredPeriodId(null)}
                          >
                            <div className="class-title">
                              {regularClass.subject}
                            </div>
                            <div className="class-group-display">
                              {regularClass.classGroup}
                            </div>
                            <div className="class-room">
                              {regularClass.room || 'Room TBA'}
                            </div>
                          </td>
                        );
                      }

                      return (
                        <td
                          key={period.id}
                          className={`cell-enhanced cell-free-premium ${hoveredPeriodId === period.id ? 'period-highlighted' : ''}`}
                          onMouseEnter={() => setHoveredPeriodId(period.id)}
                          onMouseLeave={() => setHoveredPeriodId(null)}
                        >
                          <span className="free-period-badge">Free</span>
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
  );
}

