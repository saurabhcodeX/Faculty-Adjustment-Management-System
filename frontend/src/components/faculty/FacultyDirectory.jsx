import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getInitials } from '../../utils/names';
import {
  Users,
  Search,
  UserPlus,
  Trash2,
  Mail,
  Phone,
  GraduationCap,
  Building2,
  Grid3X3,
  List,
  X
} from 'lucide-react';

export default function FacultyDirectory() {
  const {
    facultyList,
    addFaculty,
    removeFaculty,
    showConfirm,
    showToast,
    currentRole
  } = useApp();

  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', designation: '', department: '', role: 'faculty'
  });

  const isHod = currentRole === 'hod';

  const filtered = facultyList.filter(f => {
    const q = search.toLowerCase();
    return f.name.toLowerCase().includes(q) ||
      (f.email && f.email.toLowerCase().includes(q)) ||
      (f.designation && f.designation.toLowerCase().includes(q)) ||
      (f.department && f.department.toLowerCase().includes(q));
  });

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      showToast('Name and email are required.', 'error');
      return;
    }
    const result = await addFaculty(formData);
    if (result) {
      setFormData({ name: '', email: '', phone: '', designation: '', department: '', role: 'faculty' });
      setShowAddForm(false);
    }
  };

  const handleDelete = async (faculty) => {
    const confirmed = await showConfirm({
      title: 'Remove Faculty',
      message: `Are you sure you want to remove ${faculty.name}? This will also delete their timetable.`,
      confirmLabel: 'Yes, Remove',
      variant: 'danger'
    });
    if (confirmed) {
      await removeFaculty(faculty.id);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="fams-section-header" style={{ marginBottom: 20 }}>
        <div>
          <div className="fams-section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={20} />
            Faculty Directory
          </div>
          <div style={{ fontSize: 13, color: 'var(--fams-gray-400)', marginTop: 2 }}>
            {facultyList.length} members
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* View toggle */}
          <div style={{ display: 'flex', border: '1px solid var(--fams-gray-200)', borderRadius: 'var(--fams-radius-sm)', overflow: 'hidden' }}>
            <button
              className={`fams-btn fams-btn--ghost fams-btn--sm`}
              onClick={() => setViewMode('grid')}
              style={{ borderRadius: 0, background: viewMode === 'grid' ? 'var(--fams-gray-100)' : 'transparent' }}
            >
              <Grid3X3 size={14} />
            </button>
            <button
              className={`fams-btn fams-btn--ghost fams-btn--sm`}
              onClick={() => setViewMode('list')}
              style={{ borderRadius: 0, background: viewMode === 'list' ? 'var(--fams-gray-100)' : 'transparent' }}
            >
              <List size={14} />
            </button>
          </div>

          {isHod && (
            <button
              className="fams-btn fams-btn--primary fams-btn--sm"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? <X size={14} /> : <UserPlus size={14} />}
              {showAddForm ? 'Cancel' : 'Add Faculty'}
            </button>
          )}
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && isHod && (
        <div className="fams-card" style={{ marginBottom: 20 }}>
          <div className="fams-card__header">
            <div className="fams-card__title"><UserPlus size={16} /> Add New Faculty</div>
          </div>
          <div className="fams-card__body">
            <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              <input
                type="text"
                placeholder="Full Name *"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="search-input"
                style={{ padding: '8px 12px', border: '1px solid var(--fams-gray-200)', borderRadius: 'var(--fams-radius-sm)', fontSize: 13 }}
                required
              />
              <input
                type="email"
                placeholder="Email *"
                value={formData.email}
                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="search-input"
                style={{ padding: '8px 12px', border: '1px solid var(--fams-gray-200)', borderRadius: 'var(--fams-radius-sm)', fontSize: 13 }}
                required
              />
              <input
                type="text"
                placeholder="Phone"
                value={formData.phone}
                onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="search-input"
                style={{ padding: '8px 12px', border: '1px solid var(--fams-gray-200)', borderRadius: 'var(--fams-radius-sm)', fontSize: 13 }}
              />
              <input
                type="text"
                placeholder="Designation"
                value={formData.designation}
                onChange={e => setFormData(prev => ({ ...prev, designation: e.target.value }))}
                className="search-input"
                style={{ padding: '8px 12px', border: '1px solid var(--fams-gray-200)', borderRadius: 'var(--fams-radius-sm)', fontSize: 13 }}
              />
              <input
                type="text"
                placeholder="Department"
                value={formData.department}
                onChange={e => setFormData(prev => ({ ...prev, department: e.target.value }))}
                className="search-input"
                style={{ padding: '8px 12px', border: '1px solid var(--fams-gray-200)', borderRadius: 'var(--fams-radius-sm)', fontSize: 13 }}
              />
              <select
                value={formData.role}
                onChange={e => setFormData(prev => ({ ...prev, role: e.target.value }))}
                style={{ padding: '8px 12px', border: '1px solid var(--fams-gray-200)', borderRadius: 'var(--fams-radius-sm)', fontSize: 13, background: '#fff' }}
              >
                <option value="faculty">Faculty</option>
                <option value="hod">HOD</option>
              </select>
              <button type="submit" className="fams-btn fams-btn--primary">
                <UserPlus size={14} /> Add Faculty
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Search */}
      <div style={{ marginBottom: 16, position: 'relative', maxWidth: 400 }}>
        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--fams-gray-400)' }} />
        <input
          type="text"
          placeholder="Search by name, email, department..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '10px 12px 10px 36px',
            border: '1px solid var(--fams-gray-200)', borderRadius: 'var(--fams-radius-sm)',
            fontSize: 13, outline: 'none', fontFamily: 'var(--fams-font)',
            background: 'var(--fams-white)'
          }}
        />
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 14
        }}>
          {filtered.map(f => (
            <div key={f.id} className="fams-card" style={{ padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div className="fams-faculty-avatar" style={{ width: 42, height: 42, fontSize: 14 }}>
                  {getInitials(f.name)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fams-gray-800)' }}>
                    {f.name}
                  </div>
                  <span className={`fams-badge fams-badge--${f.role === 'hod' ? 'blue' : 'gray'}`}>
                    {f.role === 'hod' ? 'HOD' : 'Faculty'}
                  </span>
                </div>
                {isHod && f.role !== 'hod' && (
                  <button
                    className="fams-btn fams-btn--ghost fams-btn--sm"
                    onClick={() => handleDelete(f)}
                    title="Remove"
                  >
                    <Trash2 size={14} style={{ color: 'var(--fams-danger)' }} />
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: 'var(--fams-gray-500)' }}>
                {f.designation && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <GraduationCap size={13} /> {f.designation}
                  </div>
                )}
                {f.department && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Building2 size={13} /> {f.department}
                  </div>
                )}
                {f.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Mail size={13} /> {f.email}
                  </div>
                )}
                {f.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Phone size={13} /> {f.phone}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="fams-card">
          <div className="fams-card__body fams-card__body--flush">
            <div className="fams-table-wrap">
              <table className="fams-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Designation</th>
                    <th>Department</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    {isHod && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(f => (
                    <tr key={f.id}>
                      <td>
                        <div className="fams-faculty-row">
                          <div className="fams-faculty-avatar fams-faculty-avatar--sm">
                            {getInitials(f.name)}
                          </div>
                          <span style={{ fontWeight: 500 }}>{f.name}</span>
                        </div>
                      </td>
                      <td>{f.designation || '—'}</td>
                      <td>{f.department || '—'}</td>
                      <td style={{ fontSize: 12 }}>{f.email || '—'}</td>
                      <td style={{ fontSize: 12 }}>{f.phone || '—'}</td>
                      <td>
                        <span className={`fams-badge fams-badge--${f.role === 'hod' ? 'blue' : 'gray'}`}>
                          {f.role === 'hod' ? 'HOD' : 'Faculty'}
                        </span>
                      </td>
                      {isHod && (
                        <td>
                          {f.role !== 'hod' && (
                            <button
                              className="fams-btn fams-btn--ghost fams-btn--sm"
                              onClick={() => handleDelete(f)}
                            >
                              <Trash2 size={13} style={{ color: 'var(--fams-danger)' }} />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="fams-card" style={{ marginTop: 16 }}>
          <div className="fams-empty">
            <div className="fams-empty__icon"><Search size={22} /></div>
            <div className="fams-empty__title">No faculty found</div>
            <div className="fams-empty__desc">Try adjusting your search.</div>
          </div>
        </div>
      )}
    </div>
  );
}

