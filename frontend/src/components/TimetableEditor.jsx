import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sliders,
  User,
  Plus,
  Trash2,
  Save,
  Check,
  Calendar,
  Layers,
  Edit2,
  X,
  BookOpen,
  MapPin,
  AlertCircle
} from 'lucide-react';

export default function TimetableEditor() {
  const {
    facultyList,
    timetables,
    updateTimetableCell,
    addFaculty,
    removeFaculty,
    user,
    showConfirm,
    DAYS_OF_WEEK,
    PERIODS
  } = useApp();

  const [selectedFacultyId, setSelectedFacultyId] = useState(facultyList[0]?.id || 'f1');
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [editingPeriod, setEditingPeriod] = useState(null);

  const [subject, setSubject] = useState('');
  const [classGroup, setClassGroup] = useState('');
  const [room, setRoom] = useState('');

  const [showAddFaculty, setShowAddFaculty] = useState(false);
  const [newFacultyName, setNewFacultyName] = useState('');
  const [newFacultyDesignation, setNewFacultyDesignation] = useState('Assistant Professor');
  const [newFacultyDept, setNewFacultyDept] = useState('Computer Science');
  const [newFacultyEmail, setNewFacultyEmail] = useState('');
  const [newFacultyPassword, setNewFacultyPassword] = useState('');
  const [addingFaculty, setAddingFaculty] = useState(false);

  const selectedFaculty = facultyList.find(f => f.id === selectedFacultyId) || facultyList[0];
  const facultySchedule = timetables[selectedFacultyId]?.[selectedDay] || {};

  const handleStartEdit = (periodId) => {
    const existing = facultySchedule[periodId];
    if (existing) {
      setSubject(existing.subject || '');
      setClassGroup(existing.classGroup || '');
      setRoom(existing.room || '');
    } else {
      setSubject('');
      setClassGroup('');
      setRoom('');
    }
    setEditingPeriod(periodId);
  };

  const handleSavePeriod = async () => {
    await updateTimetableCell(selectedFacultyId, selectedDay, editingPeriod, {
      subject: subject.trim(),
      classGroup: classGroup.trim(),
      room: room.trim()
    });
    setEditingPeriod(null);
  };

  const handleClearPeriod = async (periodId) => {
    const ok = await showConfirm({
      title: 'Clear Period?',
      message: `Remove the class assigned to ${selectedFaculty.name} on ${selectedDay}, Lecture ${periodId}?`,
      confirmLabel: 'Clear',
      cancelLabel: 'Cancel',
      variant: 'warning'
    });
    if (ok) {
      await updateTimetableCell(selectedFacultyId, selectedDay, periodId, {
        subject: '', classGroup: '', room: ''
      });
    }
  };

  const handleAddFaculty = async () => {
    if (!newFacultyName.trim() || !newFacultyEmail.trim() || !newFacultyPassword.trim()) return;
    setAddingFaculty(true);
    await addFaculty({
      name: newFacultyName.trim(),
      designation: newFacultyDesignation,
      department: newFacultyDept,
      email: newFacultyEmail.trim(),
      password: newFacultyPassword
    });
    setAddingFaculty(false);
    setShowAddFaculty(false);
    setNewFacultyName('');
    setNewFacultyEmail('');
    setNewFacultyPassword('');
  };

  const handleRemoveFaculty = async () => {
    const confirmed = await showConfirm({
      title: 'Remove Faculty?',
      message: `Are you sure you want to remove ${selectedFaculty.name}? This cannot be undone if they have absence or adjustment history.`,
      confirmLabel: 'Remove',
      cancelLabel: 'Cancel',
      variant: 'danger'
    });
    if (confirmed) {
      await removeFaculty(selectedFacultyId);
      setSelectedFacultyId(facultyList[0]?.id || '');
    }
  };

  const busyCount = PERIODS.filter(p => facultySchedule[p.id]).length;

  return (
    <div className="fams-page">
      {/* Header */}
      <div className="fams-page-header">
        <div className="fams-page-header__row">
          <div>
            <h1 className="fams-page-title">
              <Sliders size={24} />
              <span>Timetable Manager</span>
            </h1>
            <p className="fams-page-subtitle">
              Manage faculty schedules — assign subjects, classes, and rooms for each day and period.
            </p>
          </div>
          <button onClick={() => setShowAddFaculty(!showAddFaculty)} className="fams-btn fams-btn--primary">
            <Plus size={16} /> Add Faculty
          </button>
        </div>
      </div>

      {/* Add Faculty Form */}
      {showAddFaculty && (
        <div className="fams-card" style={{ marginBottom: 20 }}>
          <div className="fams-card__header">
            <div className="fams-card__title"><Plus size={16} /> Add New Faculty Member</div>
            <button className="fams-btn fams-btn--ghost fams-btn--sm" onClick={() => setShowAddFaculty(false)}>
              <X size={14} /> Cancel
            </button>
          </div>
          <div className="fams-card__body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
              <div className="fams-form-field" style={{ marginBottom: 0 }}>
                <label className="fams-field-label"><User size={13} /> Full Name</label>
                <input value={newFacultyName} onChange={e => setNewFacultyName(e.target.value)} className="fams-input fams-input--sm" placeholder="e.g. Dr. Saurabh Singh" />
              </div>
              <div className="fams-form-field" style={{ marginBottom: 0 }}>
                <label className="fams-field-label">Email</label>
                <input value={newFacultyEmail} onChange={e => setNewFacultyEmail(e.target.value)} className="fams-input fams-input--sm" placeholder="email@college.edu" type="email" />
              </div>
              <div className="fams-form-field" style={{ marginBottom: 0 }}>
                <label className="fams-field-label">Password</label>
                <input value={newFacultyPassword} onChange={e => setNewFacultyPassword(e.target.value)} className="fams-input fams-input--sm" placeholder="Temporary password" type="password" />
              </div>
              <div className="fams-form-field" style={{ marginBottom: 0 }}>
                <label className="fams-field-label">Designation</label>
                <select value={newFacultyDesignation} onChange={e => setNewFacultyDesignation(e.target.value)} className="fams-input fams-input--sm">
                  <option>Assistant Professor</option>
                  <option>Associate Professor</option>
                  <option>Professor</option>
                  <option>Lecturer</option>
                </select>
              </div>
              <div className="fams-form-field" style={{ marginBottom: 0 }}>
                <label className="fams-field-label">Department</label>
                <select value={newFacultyDept} onChange={e => setNewFacultyDept(e.target.value)} className="fams-input fams-input--sm">
                  <option>Computer Science</option>
                  <option>Information Technology</option>
                  <option>Electronics</option>
                  <option>Mathematics</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={handleAddFaculty} className="fams-btn fams-btn--primary fams-btn--sm" disabled={addingFaculty || !newFacultyName.trim() || !newFacultyEmail.trim() || !newFacultyPassword.trim()}>
                <Save size={14} /> {addingFaculty ? 'Adding...' : 'Save Faculty'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Faculty & Day Selector */}
      <div className="fams-card" style={{ marginBottom: 20 }}>
        <div className="fams-card__body" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16 }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label className="fams-field-label"><User size={13} /> Faculty Member</label>
            <select value={selectedFacultyId} onChange={e => setSelectedFacultyId(e.target.value)} className="fams-input">
              {facultyList.map(f => (
                <option key={f.id} value={f.id}>{f.name} — {f.designation}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="fams-field-label"><Calendar size={13} /> Day</label>
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
          {selectedFaculty && selectedFaculty.id !== user.id && (
            <div style={{ marginLeft: 'auto' }}>
              <button onClick={handleRemoveFaculty} className="fams-btn fams-btn--danger fams-btn--sm">
                <Trash2 size={14} /> Remove
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Faculty Info */}
      {selectedFaculty && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div className="fams-faculty-avatar">{selectedFaculty.name?.charAt(0)}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--fams-gray-900)' }}>{selectedFaculty.name}</div>
            <div style={{ fontSize: 12, color: 'var(--fams-gray-500)' }}>
              {selectedFaculty.designation} • {selectedFaculty.department} • {selectedDay} • {busyCount} lecture{busyCount !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      )}

      {/* 8-Period Grid */}
      <div className="fams-card">
        <div className="fams-card__header">
          <div className="fams-card__title">
            <BookOpen size={16} /> {selectedDay}'s Schedule
          </div>
          <div className="fams-card__subtitle">
            Click Edit to assign or modify classes
          </div>
        </div>
        <div className="fams-card__body fams-card__body--flush">
          <div className="fams-table-wrap">
            <table className="fams-table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Time</th>
                  <th>Subject</th>
                  <th>Class</th>
                  <th>Room</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {PERIODS.map(period => {
                  const cell = facultySchedule[period.id];
                  const isEditing = editingPeriod === period.id;

                  if (isEditing) {
                    return (
                      <tr key={period.id} style={{ background: 'var(--fams-info-bg)' }}>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--fams-gray-800)' }}>L{period.id}</div>
                        </td>
                        <td>
                          <span style={{ fontSize: 12, color: 'var(--fams-gray-500)' }}>{period.time}</span>
                        </td>
                        <td>
                          <input value={subject} onChange={e => setSubject(e.target.value)} className="fams-input fams-input--sm" placeholder="Subject name" />
                        </td>
                        <td>
                          <input value={classGroup} onChange={e => setClassGroup(e.target.value)} className="fams-input fams-input--sm" placeholder="e.g. CSE-A" />
                        </td>
                        <td>
                          <input value={room} onChange={e => setRoom(e.target.value)} className="fams-input fams-input--sm" placeholder="e.g. R-301" />
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                            <button onClick={handleSavePeriod} className="fams-btn fams-btn--primary fams-btn--sm">
                              <Check size={13} /> Save
                            </button>
                            <button onClick={() => setEditingPeriod(null)} className="fams-btn fams-btn--ghost fams-btn--sm">
                              <X size={13} /> Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={period.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--fams-gray-800)' }}>L{period.id}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: 12, color: 'var(--fams-gray-500)' }}>{period.time}</span>
                      </td>
                      <td>
                        {cell?.subject ? (
                          <span style={{ fontWeight: 500, color: 'var(--fams-gray-800)' }}>{cell.subject}</span>
                        ) : (
                          <span style={{ color: 'var(--fams-gray-400)', fontStyle: 'italic', fontSize: 12 }}>Free Period</span>
                        )}
                      </td>
                      <td>
                        {cell?.classGroup ? (
                          <span className="fams-badge fams-badge--gray">{cell.classGroup}</span>
                        ) : (
                          <span style={{ color: 'var(--fams-gray-300)' }}>—</span>
                        )}
                      </td>
                      <td>
                        {cell?.room ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: 'var(--fams-gray-600)' }}>
                            <MapPin size={12} style={{ color: 'var(--fams-gray-400)' }} /> {cell.room}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--fams-gray-300)' }}>—</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button onClick={() => handleStartEdit(period.id)} className="fams-btn fams-btn--secondary fams-btn--sm">
                            <Edit2 size={12} /> Edit
                          </button>
                          {cell?.subject && (
                            <button onClick={() => handleClearPeriod(period.id)} className="fams-btn fams-btn--ghost fams-btn--sm" style={{ color: 'var(--fams-danger)' }}>
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
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
