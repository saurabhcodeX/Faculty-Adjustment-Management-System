import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getTeacherScheduleForDay } from '../utils/adjustmentEngine';
import {
  CalendarX2, Clock, AlertCircle, CheckCircle, Send,
  User, FileText, Calendar, CheckSquare, Square, ArrowRight
} from 'lucide-react';

export default function FacultyAbsenceReport() {
  const {
    facultyList, timetables, currentFacultyId, user,
    selectedDate, selectedDay, setSelectedDate, setSelectedDay,
    DAYS_OF_WEEK, PERIODS,
    reportAbsence, setActiveTab, currentRole,
    showToast, showConfirm
  } = useApp();

  const [facultyId, setFacultyId] = useState(currentRole === 'hod' ? currentFacultyId : user.id);
  const [date, setDate] = useState(selectedDate);
  const [dayOfWeek, setDayOfWeek] = useState(selectedDay);
  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [reason, setReason] = useState('');
  const [selectedPeriods, setSelectedPeriods] = useState([]);
  const [selectAllBusy, setSelectAllBusy] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { setFacultyId(currentRole === 'hod' ? (currentFacultyId || '') : user.id); }, [currentFacultyId, currentRole, user.id]);
  useEffect(() => { setDate(selectedDate); setDayOfWeek(selectedDay); }, [selectedDate, selectedDay]);

  const dailySchedule = getTeacherScheduleForDay(facultyId, dayOfWeek, timetables);
  const busyPeriods = [];
  for (let p = 1; p <= 8; p++) { if (dailySchedule[p]) busyPeriods.push(p); }

  useEffect(() => {
    if (selectAllBusy) setSelectedPeriods(busyPeriods);
  }, [facultyId, dayOfWeek, timetables, selectAllBusy]);

  const togglePeriod = (p) => {
    setSelectAllBusy(false);
    setSelectedPeriods(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const toggleAll = () => {
    if (selectedPeriods.length === busyPeriods.length) {
      setSelectedPeriods([]);
      setSelectAllBusy(false);
    } else {
      setSelectedPeriods(busyPeriods);
      setSelectAllBusy(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      showToast('Please enter a reason for your absence.', 'warning');
      return;
    }
    if (selectedPeriods.length === 0 && busyPeriods.length > 0) {
      const proceed = await showConfirm({
        title: 'No Lectures Selected',
        message: 'You have not selected any lecture periods for adjustment. Are you sure you want to continue?',
        confirmLabel: 'Yes, Continue',
        cancelLabel: 'Go Back',
        variant: 'warning'
      });
      if (!proceed) return;
    }

    setSubmitting(true);
    const created = await reportAbsence({
      facultyId, date, dayOfWeek, leaveType,
      reason: reason.trim(),
      periodsToAdjust: selectedPeriods
    });
    setSubmitting(false);
    if (!created) return;

    setReason('');
    if (currentRole !== 'hod') return;

    const goToHod = await showConfirm({
      title: 'Absence Reported Successfully!',
      message: 'The leave request has been recorded. Would you like to open the HOD Console to see the auto-assignment?',
      confirmLabel: 'Open HOD Console',
      cancelLabel: 'Stay Here',
      variant: 'success'
    });
    if (goToHod) setActiveTab('hod-requests');
  };

  const selectedFaculty = currentRole === 'hod' ? facultyList.find(f => f.id === facultyId) : user;
  const selectableFaculty = currentRole === 'hod' ? facultyList : [user];

  return (
    <div className="fams-page">
      {/* Header */}
      <div className="fams-page-header">
        <h1 className="fams-page-title">
          <CalendarX2 size={24} />
          <span>Report Faculty Absence</span>
        </h1>
        <p className="fams-page-subtitle">
          Submit your leave for a day. The system will auto-detect your scheduled classes and suggest free substitutes.
        </p>
      </div>

      <div className="fams-form-grid">
        {/* Left: Leave Details Form */}
        <div className="fams-card">
          <div className="fams-card__header">
            <div className="fams-card__title">
              <FileText size={16} /> Leave Details
            </div>
          </div>

          <form onSubmit={handleSubmit} className="fams-card__body">
            <div className="fams-form-field">
              <label className="fams-field-label"><User size={14} /> Faculty Member</label>
              <select value={facultyId} onChange={(e) => setFacultyId(e.target.value)} className="fams-input" disabled={currentRole !== 'hod'} required>
                {selectableFaculty.map(f => (
                  <option key={f.id} value={f.id}>{f.name} — {f.designation}</option>
                ))}
              </select>
              <div className="fams-field-hint">Dept. of {selectedFaculty?.department || 'Computer Science'}</div>
            </div>

            <div className="fams-form-row">
              <div className="fams-form-field">
                <label className="fams-field-label"><Calendar size={14} /> Absence Date</label>
                <input type="date" value={date} onChange={(e) => { setDate(e.target.value); setSelectedDate(e.target.value); }} className="fams-input" required />
              </div>
              <div className="fams-form-field">
                <label className="fams-field-label"><Clock size={14} /> Day of Week</label>
                <select value={dayOfWeek} onChange={(e) => { setDayOfWeek(e.target.value); setSelectedDay(e.target.value); }} className="fams-input">
                  {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className="fams-form-field">
              <label className="fams-field-label">Leave Category</label>
              <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)} className="fams-input">
                <option value="Casual Leave">Casual Leave (CL)</option>
                <option value="Medical Leave">Medical Leave (Sick)</option>
                <option value="Academic Duty">Academic Duty / Conference</option>
                <option value="Emergency Leave">Emergency / Personal</option>
                <option value="Half Day Leave">Half Day (Late/Early)</option>
              </select>
            </div>

            <div className="fams-form-field">
              <label className="fams-field-label">
                <span>Reason for Absence</span>
                <span style={{ color: 'var(--fams-danger)', marginLeft: 2 }}>*</span>
              </label>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Attending academic conference, unwell, personal emergency..." rows={3} className="fams-input fams-textarea" required />
            </div>

            <button type="submit" className="fams-btn fams-btn--primary" style={{ width: '100%', justifyContent: 'center', padding: '10px 16px' }} disabled={submitting}>
              <Send size={15} />
              <span>{submitting ? 'Submitting...' : 'Submit Absence to HOD'}</span>
            </button>
          </form>
        </div>

        {/* Right: 8-Period Preview */}
        <div className="fams-card">
          <div className="fams-card__header">
            <div>
              <div className="fams-card__title">
                <Clock size={16} /> Schedule on {dayOfWeek}
              </div>
              <div className="fams-card__subtitle">
                {selectedFaculty?.name} — {busyPeriods.length} lecture{busyPeriods.length !== 1 ? 's' : ''}
              </div>
            </div>
            {busyPeriods.length > 0 && (
              <button type="button" onClick={toggleAll} className="fams-btn fams-btn--secondary fams-btn--sm">
                {selectedPeriods.length === busyPeriods.length
                  ? <><Square size={13} /> Deselect All</>
                  : <><CheckSquare size={13} /> Select All ({busyPeriods.length})</>}
              </button>
            )}
          </div>

          <div className="fams-card__body">
            {busyPeriods.length === 0 ? (
              <div className="fams-empty" style={{ padding: '32px 16px' }}>
                <div className="fams-empty__icon">
                  <CheckCircle size={28} />
                </div>
                <div className="fams-empty__title">No Classes on {dayOfWeek}</div>
                <div className="fams-empty__desc">
                  Reporting absence will mark attendance, but no adjustments are needed.
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--fams-gray-500)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
                  Select lectures needing adjustment:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {PERIODS.map(period => {
                    const classInfo = dailySchedule[period.id];
                    const isBusy = !!classInfo;
                    const isSelected = selectedPeriods.includes(period.id);
                    return (
                      <div
                        key={period.id}
                        onClick={() => isBusy && togglePeriod(period.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 12,
                          padding: '10px 12px',
                          borderRadius: 'var(--fams-radius-sm)',
                          border: `1px solid ${isSelected ? 'var(--fams-blue)' : 'var(--fams-gray-200)'}`,
                          background: isSelected ? 'var(--fams-info-bg)' : isBusy ? 'var(--fams-white)' : 'var(--fams-gray-50)',
                          cursor: isBusy ? 'pointer' : 'default',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {isBusy ? (
                            <div>
                              {isSelected ? <CheckSquare size={17} style={{ color: 'var(--fams-blue)' }} /> : <Square size={17} style={{ color: 'var(--fams-gray-400)' }} />}
                            </div>
                          ) : <div style={{ width: 17 }} />}
                          <div>
                            <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--fams-gray-800)' }}>{period.label}</span>
                            <span style={{ fontSize: 11, color: 'var(--fams-gray-400)', display: 'block', marginTop: 1 }}>{period.time}</span>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          {isBusy ? (
                            <div>
                              <div style={{ fontWeight: 500, fontSize: 13, color: 'var(--fams-gray-800)' }}>
                                {classInfo.subject}
                                <span className="fams-badge fams-badge--gray" style={{ marginLeft: 6 }}>{classInfo.classGroup}</span>
                              </div>
                              <div style={{ fontSize: 11, color: 'var(--fams-gray-500)', marginTop: 1 }}>
                                Venue: {classInfo.room || 'Classroom'}
                              </div>
                            </div>
                          ) : (
                            <span style={{ fontSize: 11, color: 'var(--fams-gray-400)', fontStyle: 'italic' }}>Free Period</span>
                          )}
                        </div>

                        <div>
                          {isBusy ? (
                            isSelected
                              ? <span className="fams-badge fams-badge--red" style={{ fontSize: 10 }}>Needs Proxy</span>
                              : <span className="fams-badge fams-badge--gray" style={{ fontSize: 10 }}>Ignored</span>
                          ) : (
                            <span className="fams-badge fams-badge--teal" style={{ fontSize: 10 }}>Free</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="fams-callout">
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <div>
                <strong>What happens next:</strong> When you submit, the HOD is notified and the system auto-identifies free faculty for your {selectedPeriods.length} selected lecture{selectedPeriods.length !== 1 ? 's' : ''}.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
