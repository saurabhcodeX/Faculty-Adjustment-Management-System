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
    timetables,
    PERIODS,
    selectedDay,
    selectedDate,
    adjustments,
    absences
  } = useApp();

  const currentFaculty = facultyList.find(f => f.id === currentFacultyId) || facultyList[0];
  const schedule = timetables[currentFaculty.id]?.[selectedDay] || {};

  // Check if this teacher is absent today
  const isAbsent = absences.some(
    a =>
      a.facultyId === currentFaculty.id &&
      (a.date === selectedDate || a.dayOfWeek === selectedDay) &&
      a.status === 'Approved'
  );

  // Find all adjustments assigned TO this teacher for today (Proxy duties)
  const myProxyDuties = adjustments.filter(
    adj =>
      adj.substituteFacultyId === currentFaculty.id &&
      (adj.date === selectedDate || adj.dayOfWeek === selectedDay)
  );

  return (
    <div className="my-schedule-container">
      {/* Header with Faculty Selector */}
      <div className="page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <UserCheck2 className="text-indigo-600" size={24} />
            <span>Faculty Personal Schedule & Proxy Board</span>
          </h1>
          <p className="page-subtitle">
            View personal daily classes and proxy adjustment duties assigned by the HOD.
          </p>
        </div>

        {currentRole === 'hod' && (
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Switch Teacher:
            </label>
            <select
              value={currentFaculty.id}
              onChange={(e) => setCurrentFacultyId(e.target.value)}
              className="input-select text-sm py-1.5"
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

      {/* Absent Notice Banner if faculty is on leave */}
      {isAbsent && (
        <div className="p-4 mb-6 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} className="text-rose-600 shrink-0" />
          <div className="text-sm text-rose-900">
            <strong>You are marked on leave for {selectedDay} ({selectedDate}).</strong> Your scheduled classes have been reassigned to substitute teachers.
          </div>
        </div>
      )}

      {/* Proxy Duties Spotlight Banner */}
      <div className="mb-6">
        <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Sparkles size={18} className="text-emerald-600" />
          <span>Proxy Adjustments Assigned to You Today ({myProxyDuties.length})</span>
        </h2>

        {myProxyDuties.length === 0 ? (
          <div className="card p-5 text-center text-slate-500 text-sm">
            You have no proxy substitution classes assigned for {selectedDay}.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myProxyDuties.map(duty => {
              const periodMeta = PERIODS.find(p => p.id === duty.periodId);
              return (
                <div key={duty.id} className="proxy-duty-card">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="badge-tag tag-emerald mb-1">
                        Lecture {duty.periodId} ({periodMeta?.time})
                      </span>
                      <h3 className="font-bold text-slate-900 text-base mt-1">
                        {duty.subject}
                      </h3>
                      <div className="text-xs text-slate-600 flex items-center gap-3 mt-1 font-medium">
                        <span>Class: {duty.classGroup}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin size={12} className="text-slate-400" />
                          {duty.room}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-emerald-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      Covering for: <strong className="text-slate-800">{duty.originalFacultyName}</strong>
                    </span>
                    <span className="text-emerald-700 font-semibold">
                      Confirmed by HOD
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Complete 8-Period Day Timeline */}
      <div className="card">
        <div className="card-header border-b">
          <h2 className="card-title text-base flex items-center gap-2">
            <BookOpen size={16} className="text-indigo-600" />
            <span>Full 8-Period Timetable for {selectedDay}</span>
          </h2>
          <span className="text-xs text-slate-500">
            {currentFaculty.name} ({currentFaculty.designation})
          </span>
        </div>

        <div className="card-body p-0">
          <div className="timeline-periods-list">
            {PERIODS.map(period => {
              const regularClass = schedule[period.id];
              const proxyClass = myProxyDuties.find(d => d.periodId === period.id);

              return (
                <div
                  key={period.id}
                  className={`timeline-period-item ${
                    proxyClass
                      ? 'is-proxy'
                      : regularClass
                      ? 'is-regular'
                      : 'is-free'
                  }`}
                >
                  <div className="timeline-time-col">
                    <span className="timeline-period-num">Lecture {period.id}</span>
                    <span className="timeline-period-clock">{period.time}</span>
                  </div>

                  <div className="timeline-content-col">
                    {proxyClass ? (
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="badge-tag tag-emerald">PROXY CLASS</span>
                          <span className="font-bold text-slate-900 text-sm">
                            {proxyClass.subject}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 mt-1">
                          Class: <strong>{proxyClass.classGroup}</strong> • Room: <strong>{proxyClass.room}</strong> • Covering for <strong>{proxyClass.originalFacultyName}</strong>
                        </div>
                      </div>
                    ) : regularClass ? (
                      <div>
                        <div className="font-semibold text-slate-900 text-sm">
                          {regularClass.subject}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Class: {regularClass.classGroup} • Room: {regularClass.room}
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 italic">
                        Free Period — Available for academic work / research / adjustments
                      </div>
                    )}
                  </div>

                  <div className="timeline-badge-col">
                    {proxyClass ? (
                      <span className="status-badge status-confirmed">Proxy Duty</span>
                    ) : regularClass ? (
                      <span className="badge-tag tag-neutral">Regular Class</span>
                    ) : (
                      <span className="badge-tag tag-free">Free Slot</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

