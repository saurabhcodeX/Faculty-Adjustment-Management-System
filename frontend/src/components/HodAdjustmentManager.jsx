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

  const [activeFilter, setActiveFilter] = useState('pending');
  const [stagedAssignments, setStagedAssignments] = useState({});
  const [adminNotes, setAdminNotes] = useState({});
  const [expandedRequests, setExpandedRequests] = useState({});

  const pendingAbsences = absences.filter(a => a.status === 'Pending');
  const approvedAbsences = absences.filter(a => a.status === 'Approved');
  const displayedAbsences =
    activeFilter === 'pending'
      ? pendingAbsences
      : activeFilter === 'approved'
      ? approvedAbsences
      : absences;

  const getStagedForAbsence = (absence) => {
    if (stagedAssignments[absence.id]) {
      return stagedAssignments[absence.id];
    }
    const suggestions = generateAutoSuggestions(
      absence, timetables, facultyList, absences, adjustments
    );
    const initialMap = {};
    Object.entries(suggestions).forEach(([periodId, sugg]) => {
      initialMap[periodId] = sugg.substituteFacultyId || '';
    });
    return initialMap;
  };

  const handleSelectSubstitute = (absenceId, periodId, substituteFacultyId) => {
    setStagedAssignments(prev => ({
      ...prev,
      [absenceId]: {
        ...(prev[absenceId] || {}),
        [periodId]: substituteFacultyId
      }
    }));
  };

  const handleAutoAssign = (absence) => {
    const suggestions = generateAutoSuggestions(
      absence, timetables, facultyList, absences, adjustments
    );
    const newMap = {};
    Object.entries(suggestions).forEach(([periodId, sugg]) => {
      newMap[periodId] = sugg.substituteFacultyId || '';
    });
    setStagedAssignments(prev => ({ ...prev, [absence.id]: newMap }));
  };

  const handleApprove = async (absence) => {
    const currentAssignments = stagedAssignments[absence.id] || getStagedForAbsence(absence);
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

    const formatted = {};
    Object.entries(currentAssignments).forEach(([pId, subId]) => {
      if (subId) {
        formatted[pId] = { substituteFacultyId: subId };
      }
    });
    approveAdjustments(absence.id, formatted, adminNotes[absence.id] || '');
  };

  return (
    <div className="fams-page">
      {/* Header */}
      <div className="fams-page-header">
        <div className="fams-page-header__row">
          <div>
            <h1 className="fams-page-title">
              <ShieldAlert size={24} />
              <span>HOD Adjustment Console</span>
            </h1>
            <p className="fams-page-subtitle">
              Review absence notifications, inspect available free teachers for each lecture slot, and confirm proxy adjustments.
            </p>
          </div>

          <div className="fams-filter-group">
            <button
              onClick={() => setActiveFilter('pending')}
              className={`fams-filter-pill ${activeFilter === 'pending' ? 'fams-filter-pill--active' : ''}`}
            >
              <span>Pending Requests</span>
              {pendingAbsences.length > 0 && (
                <span className="fams-filter-pill__count">{pendingAbsences.length}</span>
              )}
            </button>
            <button
              onClick={() => setActiveFilter('approved')}
              className={`fams-filter-pill ${activeFilter === 'approved' ? 'fams-filter-pill--active' : ''}`}
            >
              <span>Approved ({approvedAbsences.length})</span>
            </button>
            <button
              onClick={() => setActiveFilter('all')}
              className={`fams-filter-pill ${activeFilter === 'all' ? 'fams-filter-pill--active' : ''}`}
            >
              <span>All Records ({absences.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {displayedAbsences.length === 0 ? (
          <div className="fams-card">
            <div className="fams-empty" style={{ padding: '56px 24px' }}>
              <div className="fams-empty__icon">
                <CheckCircle2 size={28} />
              </div>
              <div className="fams-empty__title" style={{ fontSize: 17 }}>
                {activeFilter === 'pending'
                  ? 'No Pending Absence Requests'
                  : 'No Absence Records Found'}
              </div>
              <div className="fams-empty__desc">
                {activeFilter === 'pending'
                  ? 'All faculty absence requests have been reviewed and resolved. The timetable is fully covered!'
                  : 'No historical records match the selected filter.'}
              </div>
            </div>
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
                className="fams-card"
                style={isPending ? { borderColor: 'var(--fams-warning-border)' } : {}}
              >
                {/* Request Header */}
                <div className="fams-card__header" style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0, flexWrap: 'wrap' }}>
                    <div className="fams-avatar">
                      <User size={20} />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--fams-gray-900)' }}>
                          {absence.facultyName}
                        </span>
                        <span className={`fams-badge fams-badge--${
                          absence.status === 'Approved' ? 'green'
                          : absence.status === 'Rejected' ? 'red'
                          : 'amber'
                        }`}>
                          {absence.status}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--fams-gray-500)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500, color: 'var(--fams-gray-700)' }}>
                          <Calendar size={13} /> {absence.dayOfWeek}, {absence.date}
                        </span>
                        <span>•</span>
                        <span className="fams-badge fams-badge--gray">{absence.leaveType}</span>
                        <span>•</span>
                        <span style={{ color: 'var(--fams-gray-500)', fontStyle: 'italic' }}>"{absence.reason}"</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    {isPending && isExpanded && (
                      <button
                        type="button"
                        onClick={() => handleAutoAssign(absence)}
                        className="fams-btn fams-btn--secondary fams-btn--sm"
                        title="Auto-pick optimal free teachers for all periods"
                        style={{ color: 'var(--fams-blue)' }}
                      >
                        <Sparkles size={14} />
                        <span>Smart Auto-Match</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setExpandedRequests(prev => ({ ...prev, [absence.id]: !isExpanded }))}
                      className="fams-btn fams-btn--secondary fams-btn--sm"
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

                {/* Impacted Lectures */}
                {isExpanded && (
                  <div className="fams-card__body">
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--fams-gray-600)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>
                        Lectures Requiring Adjustments ({periods.length} Slot{periods.length !== 1 ? 's' : ''})
                      </span>
                      <span style={{ fontWeight: 400, textTransform: 'none', color: 'var(--fams-gray-400)' }}>
                        System automatically excludes busy teachers & distributes load evenly
                      </span>
                    </div>

                    {periods.length === 0 ? (
                      <div className="fams-empty" style={{ padding: '24px 16px' }}>
                        <div className="fams-empty__title">No Teaching Periods</div>
                        <div className="fams-empty__desc">No teaching periods require adjustment for this request.</div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {periods.map(periodId => {
                          const periodMeta = PERIODS.find(p => p.id === periodId);
                          const classDetails = teacherSchedule[periodId];
                          const freeCandidates = getFreeTeachersForPeriod(
                            periodId, absence.dayOfWeek, absence.date,
                            timetables, facultyList, absences, adjustments, absence.facultyId
                          );

                          const currentAssignedId = stagedMap[periodId];
                          const existingAdjustment = adjustments.find(
                            adj => adj.absenceId === absence.id && adj.periodId === periodId
                          );

                          return (
                            <div
                              key={periodId}
                              style={{
                                display: 'grid',
                                gridTemplateColumns: '120px 1fr 1fr',
                                gap: 16,
                                padding: '14px 16px',
                                borderRadius: 'var(--fams-radius-sm)',
                                border: '1px solid var(--fams-gray-200)',
                                background: existingAdjustment ? 'var(--fams-success-bg)' : 'var(--fams-white)',
                                alignItems: 'center'
                              }}
                            >
                              {/* Period info */}
                              <div>
                                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--fams-gray-800)' }}>
                                  Lecture {periodId}
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--fams-gray-400)', marginTop: 2 }}>
                                  {periodMeta?.time}
                                </div>
                              </div>

                              {/* Class info */}
                              <div>
                                {classDetails ? (
                                  <>
                                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--fams-gray-800)' }}>
                                      {classDetails.subject}
                                    </div>
                                    <div style={{ fontSize: 11, color: 'var(--fams-gray-500)', display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                                      <span className="fams-badge fams-badge--gray">{classDetails.classGroup}</span>
                                      <span>Venue: {classDetails.room || 'Classroom'}</span>
                                    </div>
                                  </>
                                ) : (
                                  <span style={{ fontSize: 12, color: 'var(--fams-gray-400)', fontStyle: 'italic' }}>
                                    Class details not specified
                                  </span>
                                )}
                              </div>

                              {/* Assign Teacher */}
                              <div>
                                {isPending ? (
                                  <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                      <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--fams-gray-600)' }}>
                                        Assign Available Free Teacher:
                                      </span>
                                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--fams-success)' }}>
                                        {freeCandidates.length} Free Now
                                      </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                      <select
                                        value={currentAssignedId || ''}
                                        onChange={(e) => handleSelectSubstitute(absence.id, periodId, e.target.value)}
                                        className="fams-input fams-input--sm"
                                        style={{ flex: 1 }}
                                      >
                                        <option value="">-- Select a Free Teacher --</option>
                                        {freeCandidates.map(c => (
                                          <option key={c.faculty.id} value={c.faculty.id}>
                                            {c.faculty.name} ({c.todayLoad} proxy today)
                                          </option>
                                        ))}
                                      </select>
                                      {currentAssignedId && (
                                        <span className="fams-badge fams-badge--green">
                                          <Check size={11} /> Free Slot
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <div>
                                    <span style={{ fontSize: 11, color: 'var(--fams-gray-400)', display: 'block', marginBottom: 2 }}>
                                      Assigned Substitute:
                                    </span>
                                    <span style={{ fontWeight: 600, color: 'var(--fams-success)' }}>
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

                    {/* Actions Bar for Pending */}
                    {isPending && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingTop: 16, borderTop: '1px solid var(--fams-gray-100)', marginTop: 16 }}>
                        <input
                          type="text"
                          placeholder="Add optional HOD remarks (e.g. Approved with leave balance)..."
                          value={adminNotes[absence.id] || ''}
                          onChange={(e) => setAdminNotes({ ...adminNotes, [absence.id]: e.target.value })}
                          className="fams-input fams-input--sm"
                          style={{ flex: 1, minWidth: 200 }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
                              if (confirmed) rejectAbsence(absence.id, 'Rejected by HOD');
                            }}
                            className="fams-btn fams-btn--danger fams-btn--sm"
                          >
                            <XCircle size={14} /> Reject
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApprove(absence)}
                            className="fams-btn fams-btn--primary fams-btn--sm"
                          >
                            <CheckCircle2 size={14} /> Approve & Confirm
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
