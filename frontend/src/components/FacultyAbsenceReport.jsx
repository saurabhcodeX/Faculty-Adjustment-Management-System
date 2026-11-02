import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getTeacherScheduleForDay } from '../utils/adjustmentEngine';
import {
  CalendarX2, Clock, AlertCircle, CheckCircle, Send,
  User, FileText, Calendar, CheckSquare, Square, ArrowRight
} from 'lucide-react';

export default function FacultyAbsenceReport() {
  const {
    facultyList, timetables, currentFacultyId,
    selectedDate, selectedDay, setSelectedDate, setSelectedDay,
    DAYS_OF_WEEK, PERIODS,
    reportAbsence, setActiveTab, currentRole,
    showToast, showConfirm
  } = useApp();

  const [facultyId, setFacultyId] = useState(currentFacultyId || 'f2');
  const [date, setDate] = useState(selectedDate);
  const [dayOfWeek, setDayOfWeek] = useState(selectedDay);
  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [reason, setReason] = useState('');
  const [selectedPeriods, setSelectedPeriods] = useState([]);
  const [selectAllBusy, setSelectAllBusy] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (currentFacultyId) setFacultyId(currentFacultyId); }, [currentFacultyId]);
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

  const selectedFaculty = facultyList.find(f => f.id === facultyId);

  return (
    <div className="faculty-absence-container">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <CalendarX2 className="text-rose-600" size={24} />
            <span>Report Faculty Absence</span>
          </h1>
          <p className="page-subtitle">
            Submit your leave for a day. The system will auto-detect your scheduled classes and suggest free substitutes.
          </p>
        </div>
      </div>

      <div className="absence-form-grid">
        {/* Left Form */}
        <div className="card">
          <div className="card-header border-b">
            <h2 className="card-title text-base flex items-center gap-2">
              <FileText size={16} className="text-indigo-600" />
              <span>Leave Details</span>
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="card-body form-body">
            <div className="form-field">
              <label className="field-label"><User size={14} /><span>Faculty Member</span></label>
              <select value={facultyId} onChange={(e) => setFacultyId(e.target.value)} className="input-select" disabled={currentRole !== 'hod'} required>
                {facultyList.map(f => (
                  <option key={f.id} value={f.id}>{f.name} — {f.designation}</option>
                ))}
              </select>
              <div className="field-hint">Dept. of {selectedFaculty?.department || 'Computer Science'}</div>
            </div>

            <div className="form-row-2">
              <div className="form-field">
                <label className="field-label"><Calendar size={14} /><span>Absence Date</span></label>
                <input type="date" value={date} onChange={(e) => { setDate(e.target.value); setSelectedDate(e.target.value); }} className="input-text" required />
              </div>
              <div className="form-field">
                <label className="field-label"><Clock size={14} /><span>Day of Week</span></label>
                <select value={dayOfWeek} onChange={(e) => { setDayOfWeek(e.target.value); setSelectedDay(e.target.value); }} className="input-select">
                  {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className="form-field">
              <label className="field-label">Leave Category</label>
              <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)} className="input-select">
                <option value="Casual Leave">Casual Leave (CL)</option>
                <option value="Medical Leave">Medical Leave (Sick)</option>
                <option value="Academic Duty">Academic Duty / Conference</option>
                <option value="Emergency Leave">Emergency / Personal</option>
                <option value="Half Day Leave">Half Day (Late/Early)</option>
              </select>
            </div>

            <div className="form-field">
              <label className="field-label"><span>Reason for Absence</span><span className="text-rose-500">*</span></label>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Attending academic conference, unwell, personal emergency..." rows={3} className="input-textarea" required />
            </div>

            <button type="submit" className="btn btn-primary w-full justify-center py-2.5" disabled={submitting}>
              <Send size={15} /><span>{submitting ? 'Submitting...' : 'Submit Absence to HOD'}</span>
            </button>
          </form>
        </div>

        {/* Right: 8-Period Preview */}
        <div className="card">
          <div className="card-header border-b flex items-center justify-between">
            <div>
              <h2 className="card-title text-base flex items-center gap-2">
                <Clock size={16} className="text-indigo-600" />
                <span>Schedule on {dayOfWeek}</span>
              </h2>
              <p className="card-subtitle">{selectedFaculty?.name} — {busyPeriods.length} lecture{busyPeriods.length !== 1 ? 's' : ''}</p>
            </div>
            {busyPeriods.length > 0 && (
              <button type="button" onClick={toggleAll} className="btn btn-outline btn-sm text-xs">
                {selectedPeriods.length === busyPeriods.length ? (<><Square size={13} /><span>Deselect All</span></>) : (<><CheckSquare size={13} /><span>Select All ({busyPeriods.length})</span></>)}
              </button>
            )}
          </div>

          <div className="card-body">
            {busyPeriods.length === 0 ? (
              <div className="empty-state-mini">
                <CheckCircle size={32} className="text-emerald-500" />
                <p className="font-medium text-slate-700">No Classes on {dayOfWeek}</p>
                <p className="text-xs text-slate-500 mt-1">Reporting absence will mark attendance, but no adjustments are needed.</p>
              </div>
            ) : (
              <div className="schedule-preview-list">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Select lectures needing adjustment:</div>
                <div className="periods-grid">
                  {PERIODS.map(period => {
                    const classInfo = dailySchedule[period.id];
                    const isBusy = !!classInfo;
                    const isSelected = selectedPeriods.includes(period.id);
                    return (
                      <div key={period.id} onClick={() => isBusy && togglePeriod(period.id)} className={`period-preview-item ${isBusy ? 'has-class' : 'is-free'} ${isSelected ? 'selected' : ''}`}>
                        <div className="flex items-center gap-3">
                          {isBusy ? (
                            <div className="period-checkbox">
                              {isSelected ? <CheckSquare size={18} className="text-indigo-600" /> : <Square size={18} className="text-slate-400" />}
                            </div>
                          ) : <div style={{width: 18}} />}
                          <div>
                            <span className="font-semibold text-slate-800 text-sm">{period.label}</span>
                            <span className="text-xs text-slate-500 block">{period.time}</span>
                          </div>
                        </div>
                        <div className="period-details-col">
                          {isBusy ? (
                            <div>
                              <div className="font-medium text-slate-900 text-sm flex items-center gap-2">
                                <span>{classInfo.subject}</span>
                                <span className="class-tag">{classInfo.classGroup}</span>
                              </div>
                              <div className="text-xs text-slate-500">Venue: {classInfo.room || 'Classroom'}</div>
                            </div>
                          ) : <div className="text-xs text-slate-400 italic">Free Period</div>}
                        </div>
                        <div>
                          {isBusy ? (isSelected ? <span className="badge-tag tag-rose">Needs Proxy</span> : <span className="badge-tag tag-neutral">Ignored</span>) : <span className="badge-tag tag-free">Free</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="info-callout mt-4">
              <AlertCircle size={16} className="text-indigo-600 shrink-0" />
              <div className="text-xs text-indigo-900">
                <strong>What happens next:</strong> When you submit, the HOD is notified and the system auto-identifies free faculty for your {selectedPeriods.length} selected lecture{selectedPeriods.length !== 1 ? 's' : ''}.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
