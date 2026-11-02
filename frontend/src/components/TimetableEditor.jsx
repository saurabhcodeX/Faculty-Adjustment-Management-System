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
  Edit2
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

  // Form states for adding/editing a period
  const [subject, setSubject] = useState('');
  const [classGroup, setClassGroup] = useState('');
  const [room, setRoom] = useState('');

  // New Faculty Modal/Form state
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

  const handleSavePeriod = async (periodId) => {
    const classData = subject.trim()
      ? {
          subject: subject.trim(),
          classGroup: classGroup.trim() || 'General',
          room: room.trim() || 'Room 101'
        }
      : null;
    const saved = await updateTimetableCell(selectedFacultyId, selectedDay, periodId, classData);
    if (saved) setEditingPeriod(null);
  };

  const handleSetFree = async (periodId) => {
    const saved = await updateTimetableCell(selectedFacultyId, selectedDay, periodId, null);
    if (saved) setEditingPeriod(null);
  };

  const handleAddFaculty = async (e) => {
    e.preventDefault();
    if (!newFacultyName.trim()) return;

    setAddingFaculty(true);
    const created = await addFaculty({
      name: newFacultyName.trim(),
      designation: newFacultyDesignation,
      department: newFacultyDept,
      email: newFacultyEmail.trim(),
      password: newFacultyPassword
    });
    setAddingFaculty(false);
    if (!created) return;

    setSelectedFacultyId(created.id);
    setShowAddFaculty(false);
    setNewFacultyName('');
    setNewFacultyEmail('');
    setNewFacultyPassword('');
  };

  const handleRemoveFaculty = async () => {
    const confirmed = await showConfirm({
      title: `Remove ${selectedFaculty.name}?`,
      message: 'This deletes their account and timetable. Teachers with absence or adjustment records cannot be removed.',
      confirmLabel: 'Remove Teacher',
      cancelLabel: 'Keep',
      variant: 'danger'
    });
    if (!confirmed) return;

    const removed = await removeFaculty(selectedFaculty.id);
    if (removed) {
      setSelectedFacultyId(user.id);
      setEditingPeriod(null);
    }
  };

  return (
    <div className="timetable-editor-container">
      {/* Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Sliders className="text-indigo-600" size={24} />
            <span>Faculty Timetable & Roster Manager</span>
          </h1>
          <p className="page-subtitle">
            Configure individual timetables for each faculty member across all 8 daily lecture periods.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedFaculty && selectedFaculty.id !== user.id && (
            <button
              onClick={handleRemoveFaculty}
              className="btn btn-outline text-rose-600 text-xs py-2 px-3 flex items-center gap-1.5"
            >
              <Trash2 size={15} />
              <span>Remove Teacher</span>
            </button>
          )}
          <button
            onClick={() => setShowAddFaculty(true)}
            className="btn btn-primary text-xs py-2 px-3 flex items-center gap-1.5"
          >
            <Plus size={15} />
            <span>Add New Teacher</span>
          </button>
        </div>
      </div>

      {/* Selector Controls */}
      <div className="card p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
              Select Teacher:
            </label>
            <select
              value={selectedFacultyId}
              onChange={(e) => {
                setSelectedFacultyId(e.target.value);
                setEditingPeriod(null);
              }}
              className="input-select text-sm w-full"
            >
              {facultyList.map(f => (
                <option key={f.id} value={f.id}>
                  {f.name} — {f.designation}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
              Select Day:
            </label>
            <select
              value={selectedDay}
              onChange={(e) => {
                setSelectedDay(e.target.value);
                setEditingPeriod(null);
              }}
              className="input-select text-sm w-full"
            >
              {DAYS_OF_WEEK.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 8 Periods Grid for Selected Teacher */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PERIODS.map(period => {
          const currentClass = facultySchedule[period.id];
          const isEditing = editingPeriod === period.id;

          return (
            <div
              key={period.id}
              className={`card p-4 ${currentClass ? 'border-l-4 border-l-indigo-500' : 'border-dashed'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">
                    {period.label}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    ({period.time})
                  </span>
                </div>

                {!isEditing && (
                  <button
                    onClick={() => handleStartEdit(period.id)}
                    className="btn btn-outline btn-sm text-xs py-1 px-2.5 flex items-center gap-1"
                  >
                    <Edit2 size={12} />
                    <span>{currentClass ? 'Edit' : '+ Assign Class'}</span>
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-2.5 pt-2 border-t mt-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 uppercase block">Subject Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Operating Systems"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="input-text text-xs py-1.5"
                      autoFocus
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 uppercase block">Class / Batch</label>
                      <input
                        type="text"
                        placeholder="e.g. CS-3A"
                        value={classGroup}
                        onChange={(e) => setClassGroup(e.target.value)}
                        className="input-text text-xs py-1.5"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 uppercase block">Room / Lab</label>
                      <input
                        type="text"
                        placeholder="e.g. Room 204"
                        value={room}
                        onChange={(e) => setRoom(e.target.value)}
                        className="input-text text-xs py-1.5"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => handleSetFree(period.id)}
                      className="text-xs text-rose-600 hover:underline"
                    >
                      Set to Free Period
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingPeriod(null)}
                        className="btn btn-outline btn-sm text-xs py-1 px-2.5"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSavePeriod(period.id)}
                        className="btn btn-primary btn-sm text-xs py-1 px-3 flex items-center gap-1"
                      >
                        <Check size={13} />
                        <span>Save</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="pt-2">
                  {currentClass ? (
                    <div>
                      <div className="font-semibold text-slate-800 text-sm">
                        {currentClass.subject}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-3 mt-1">
                        <span className="badge-tag tag-neutral">{currentClass.classGroup}</span>
                        <span>Room: {currentClass.room || 'Room 101'}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 italic py-1">
                      Free Period (No class assigned)
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add New Teacher Modal */}
      {showAddFaculty && (
        <div className="modal-backdrop">
          <div className="modal-dialog max-w-md">
            <div className="modal-header border-b p-4 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Add New Faculty Member</h3>
              <button
                onClick={() => setShowAddFaculty(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddFaculty} className="p-4 space-y-3">
              <div>
                <label className="field-label">Full Name & Title</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Sunita Mehra"
                  value={newFacultyName}
                  onChange={(e) => setNewFacultyName(e.target.value)}
                  className="input-text"
                  required
                />
              </div>

              <div>
                <label className="field-label">Login Email</label>
                <input
                  type="email"
                  placeholder="e.g. sunita.mehra@college.edu"
                  autoComplete="off"
                  value={newFacultyEmail}
                  onChange={(e) => setNewFacultyEmail(e.target.value)}
                  className="input-text"
                  required
                />
              </div>

              <div>
                <label className="field-label">Temporary Password</label>
                <input
                  type="password"
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  minLength={8}
                  value={newFacultyPassword}
                  onChange={(e) => setNewFacultyPassword(e.target.value)}
                  className="input-text"
                  required
                />
              </div>

              <div>
                <label className="field-label">Designation</label>
                <select
                  value={newFacultyDesignation}
                  onChange={(e) => setNewFacultyDesignation(e.target.value)}
                  className="input-select"
                >
                  <option value="Professor">Professor</option>
                  <option value="Associate Professor">Associate Professor</option>
                  <option value="Assistant Professor">Assistant Professor</option>
                  <option value="Lecturer">Lecturer</option>
                  <option value="Teaching Assistant">Teaching Assistant</option>
                </select>
              </div>

              <div>
                <label className="field-label">Department</label>
                <input
                  type="text"
                  value={newFacultyDept}
                  onChange={(e) => setNewFacultyDept(e.target.value)}
                  className="input-text"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddFaculty(false)}
                  className="btn btn-outline btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={addingFaculty}
                >
                  {addingFaculty ? 'Adding...' : 'Add Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

