import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  getFreeTeachersForPeriod,
  generateAutoSuggestions
} from '../utils/adjustmentEngine';
import {
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Calendar,
  Layers,
  MapPin,
  ArrowRight,
  Filter,
  Check,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Plus
} from 'lucide-react';

export default function HodAdjustmentManager({ onOpenPrintModal }) {
  const {
    absences,
    timetables,
    facultyList,
    adjustments,
    PERIODS,
    approveAdjustments,
    rejectAbsence,
    removeAdjustment,
    selectedDate,
    showConfirm
  } = useApp();

  const [activeFilter, setActiveFilter] = useState('pending'); // 'pending' | 'approved' | 'all'
  // Track selected substitutes for pending requests: { [absenceId]: { [periodId]: substituteFacultyId } }
  const [stagedAssignments, setStagedAssignments] = useState({});
  const [adminNotes, setAdminNotes] = useState({});
  const [expandedRequests, setExpandedRequests] = useState({});
  const [showDirectModal, setShowDirectModal] = useState(false);

  // Filter requests
  const pendingAbsences = absences.filter(a => a.status === 'Pending');
  const approvedAbsences = absences.filter(a => a.status === 'Approved');
  const displayedAbsences =
    activeFilter === 'pending'
      ? pendingAbsences
      : activeFilter === 'approved'
      ? approvedAbsences
      : absences;

  // Initialize or get staged assignment for an absence
  const getStagedForAbsence = (absence) => {
    if (stagedAssignments[absence.id]) {
      return stagedAssignments[absence.id];
    }
    // Generate auto-suggestions
    const suggestions = generateAutoSuggestions(
      absence,
      timetables,
      facultyList,
      absences,
      adjustments
    );

    const initialMap = {};
    Object.entries(suggestions).forEach(([periodId, sugg]) => {
      initialMap[periodId] = sugg.substituteFacultyId || '';
    });

    return initialMap;
  };

  // Handle changing substitute for a single period
  const handleSelectSubstitute = (absenceId, periodId, substituteFacultyId) => {
    setStagedAssignments(prev => ({
      ...prev,
      [absenceId]: {
        ...(prev[absenceId] || {}),
        [periodId]: substituteFacultyId
      }
    }));
  };

  // 1-Click Auto-Assign for an absence
  const handleAutoAssign = (absence) => {
    const suggestions = generateAutoSuggestions(
      absence,
      timetables,
      facultyList,
      absences,
      adjustments
    );

    const newMap = {};
    Object.entries(suggestions).forEach(([periodId, sugg]) => {
      newMap[periodId] = sugg.substituteFacultyId || '';
    });

    setStagedAssignments(prev => ({
      ...prev,
      [absence.id]: newMap
    }));
  };

  // Submit approval
  const handleApprove = async (absence) => {
    const currentAssignments = stagedAssignments[absence.id] || getStagedForAbsence(absence);

    // Validate if any period is unassigned
    const periodsToAdjust = absence.periodsToAdjust || [];
    const missing = periodsToAdjust.filter(p => !currentAssignments[p]);
    const assignmentSummary = periodsToAdjust
      .filter(p => currentAssignments[p])
      .map(p => `Lecture ${p}: ${facultyList.find(f => f.id === currentAssignments[p])?.name}`)
      .join(', ');
    const summaryParts = [
      `Approve ${absence.facultyName}'s absence on ${absence.date}?`,
      assignmentSummary && `Substitutes: ${assignmentSummary}.`,
      missing.length > 0 && `No substitute for lecture(s) ${missing.join(', ')}.`
    ];

    const proceed = await showConfirm({
      title: 'Confirm Approval',
      message: summaryParts.filter(Boolean).join(' '),
      confirmLabel: 'Approve',
      cancelLabel: 'Cancel',
      variant: missing.length > 0 ? 'warning' : 'success'
    });
    if (!proceed) return;

    // Format assignments structure for approveAdjustments
    const formatted = {};
    Object.entries(currentAssignments).forEach(([pId, subId]) => {
      if (subId) {
        formatted[pId] = { substituteFacultyId: subId };
      }
    });

    approveAdjustments(absence.id, formatted, adminNotes[absence.id] || '');
  };

  return (
    <div className="hod-manager-container">
      {/* Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <ShieldAlert className="text-indigo-600" size={24} />
            <span>HOD Admin Adjustment Console</span>
          </h1>
          <p className="page-subtitle">
            Review absence notifications, inspect available free teachers for each lecture slot, and confirm proxy adjustments.
          </p>
        </div>

        {/* Quick Filter Tabs */}
        <div className="filter-pill-group">
          <button
            onClick={() => setActiveFilter('pending')}
            className={`filter-pill ${activeFilter === 'pending' ? 'active' : ''}`}
          >
            <span>Pending Requests</span>
            {pendingAbsences.length > 0 && (
              <span className="badge-count">{pendingAbsences.length}</span>
            )}
          </button>
          <button
            onClick={() => setActiveFilter('approved')}
            className={`filter-pill ${activeFilter === 'approved' ? 'active' : ''}`}
          >
            <span>Approved ({approvedAbsences.length})</span>
          </button>
          <button
            onClick={() => setActiveFilter('all')}
            className={`filter-pill ${activeFilter === 'all' ? 'active' : ''}`}
          >
            <span>All Records ({absences.length})</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {displayedAbsences.length === 0 ? (
          <div className="card p-10 text-center">
            <CheckCircle2 size={48} className="mx-auto text-emerald-500 mb-3" />
            <h3 className="text-lg font-semibold text-slate-800">
              {activeFilter === 'pending'
                ? 'No Pending Absence Requests'
                : 'No Absence Records Found'}
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
              {activeFilter === 'pending'
                ? 'All faculty absence requests have been reviewed and resolved. The timetable is fully covered!'
                : 'No historical records match the selected filter.'}
            </p>
          </div>
        ) : (
          displayedAbsences.map((absence, index) => {
            const isPending = absence.status === 'Pending';
            const isExpanded = expandedRequests[absence.id] ?? index === 0;
            const stagedMap = stagedAssignments[absence.id] || getStagedForAbsence(absence);
            const teacherSchedule = timetables[absence.facultyId]?.[absence.dayOfWeek] || {};
            const periods = absence.periodsToAdjust || [];

            return (
              <div
                key={absence.id}
                className={`card absence-request-card ${isPending ? 'border-amber-200' : ''}`}
              >
                {/* Request Header Banner */}
                <div className="request-card-header">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="avatar-circle">
                        <User size={20} className="text-indigo-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900">
                            {absence.facultyName}
                          </h3>
                          <span className={`status-badge ${
                            absence.status === 'Approved'
                              ? 'status-confirmed'
                              : absence.status === 'Rejected'
                              ? 'status-rejected'
                              : 'status-pending'
                          }`}>
                            {absence.status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 font-medium text-slate-700">
                            <Calendar size={13} />
                            <span>{absence.dayOfWeek}, {absence.date}</span>
                          </span>
                          <span>•</span>
                          <span className="badge-tag tag-neutral">{absence.leaveType}</span>
                          <span>•</span>
                          <span className="text-slate-600 italic">"{absence.reason}"</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isPending && isExpanded && (
                        <button
                          type="button"
                          onClick={() => handleAutoAssign(absence)}
                          className="btn btn-outline btn-sm text-indigo-600 border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100"
                          title="Auto-pick optimal free teachers for all periods"
                        >
                          <Sparkles size={14} className="text-indigo-600" />
                          <span>Smart Auto-Match Free Teachers</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setExpandedRequests(prev => ({ ...prev, [absence.id]: !isExpanded }))}
                        className="btn btn-outline btn-sm request-toggle-btn"
                        aria-expanded={isExpanded}
                      >
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        <span>
                          {isExpanded
                            ? 'Hide Details'
                            : `View ${periods.length} Lecture${periods.length !== 1 ? 's' : ''}`}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Impacted Lectures Grid */}
                {isExpanded && (
                <div className="request-card-body">
                  <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3 flex items-center justify-between">
                    <span>
                      Lectures Requiring Adjustments ({periods.length} Slot{periods.length !== 1 ? 's' : ''})
                    </span>
                    <span className="text-slate-400 font-normal">
                      System automatically excludes busy teachers & distributes load evenly
                    </span>
                  </div>

                  {periods.length === 0 ? (
                    <div className="text-sm text-slate-500 py-3 text-center italic bg-slate-50 rounded">
                      No teaching periods require adjustment for this request.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {periods.map(periodId => {
                        const periodMeta = PERIODS.find(p => p.id === periodId);
                        const classDetails = teacherSchedule[periodId];
                        const freeCandidates = getFreeTeachersForPeriod(
                          periodId,
                          absence.dayOfWeek,
                          absence.date,
                          timetables,
                          facultyList,
                          absences,
                          adjustments,
                          absence.facultyId
                        );

                        const currentAssignedId = stagedMap[periodId];
                        const currentAssignedFaculty = facultyList.find(f => f.id === currentAssignedId);

                        // If already approved, find from adjustments
                        const existingAdjustment = adjustments.find(
                          adj => adj.absenceId === absence.id && adj.periodId === periodId
                        );

                        return (
                          <div
                            key={periodId}
                            className={`period-adjust-row ${
                              existingAdjustment ? 'row-adjusted' : ''
                            }`}
                          >
                            {/* Period info */}
                            <div className="period-label-box">
                              <span className="period-name">Lecture {periodId}</span>
                              <span className="period-time">{periodMeta?.time}</span>
                            </div>

                            {/* Class info */}
                            <div className="class-info-box">
                              {classDetails ? (
                                <>
                                  <div className="font-semibold text-slate-900 text-sm">
                                    {classDetails.subject}
                                  </div>
                                  <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                                    <span className="badge-tag tag-neutral">{classDetails.classGroup}</span>
                                    <span>Venue: {classDetails.room || 'Classroom'}</span>
                                  </div>
                                </>
                              ) : (
                                <span className="text-xs text-slate-400 italic">
                                  Class details not specified
                                </span>
                              )}
                            </div>

                            {/* Assign Free Teacher Column */}
                            <div className="substitute-select-box">
                              {isPending ? (
                                <div className="w-full">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-medium text-slate-600">
                                      Assign Available Free Teacher:
                                    </span>
                                    <span className="text-xs text-emerald-600 font-medium">
                                      {freeCandidates.length} Free Now
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <select
                                      value={currentAssignedId || ''}
                                      onChange={(e) =>
                                        handleSelectSubstitute(absence.id, periodId, e.target.value)
                                      }
                                      className="input-select text-sm py-1.5 flex-1"
                                    >
                                      <option value="">-- Select a Free Teacher --</option>
                                      {freeCandidates.map(c => (
                                        <option key={c.faculty.id} value={c.faculty.id}>
                                          {c.faculty.name} ({c.todayLoad} proxy today)
                                        </option>
                                      ))}
                                    </select>

                                    {currentAssignedId && (
                                      <span className="badge-tag tag-emerald whitespace-nowrap">
                                        <Check size={12} className="inline mr-0.5" />
                                        Free Slot
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-sm">
                                  <span className="text-xs text-slate-400 block mb-0.5">
                                    Assigned Substitute:
                                  </span>
                                  <span className="font-semibold text-emerald-700">
                                    {existingAdjustment
                                      ? existingAdjustment.substituteFacultyName
                                      : 'No substitute assigned'}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Actions Bar for Pending Request */}
                  {isPending && (
                    <div className="pt-4 border-t mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="w-full sm:w-1/2">
                        <input
                          type="text"
                          placeholder="Add optional HOD remarks (e.g. Approved with leave balance)..."
                          value={adminNotes[absence.id] || ''}
                          onChange={(e) =>
                            setAdminNotes({ ...adminNotes, [absence.id]: e.target.value })
                          }
                          className="input-text text-xs py-1.5 w-full"
                        />
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button
                          type="button"
                          onClick={async () => {
                            const confirmed = await showConfirm({
                              title: 'Reject Absence Request?',
                              message: `Are you sure you want to reject ${absence.facultyName}'s absence request? Any pending adjustments will be cancelled.`,
                              confirmLabel: 'Reject Request',
                              cancelLabel: 'Keep',
                              variant: 'danger'
                            });
                            if (confirmed) {
                              rejectAbsence(absence.id, 'Rejected by HOD');
                            }
                          }}
                          className="btn btn-outline text-rose-600 hover:bg-rose-50 text-xs py-2 px-3"
                        >
                          <XCircle size={14} />
                          <span>Reject</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleApprove(absence)}
                          className="btn btn-primary text-xs py-2 px-4"
                        >
                          <CheckCircle2 size={14} />
                          <span>Approve & Confirm Adjustments</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

  