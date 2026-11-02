import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../api/client';
import { getInitials } from '../../utils/names';
import ChangePasswordModal from '../ChangePasswordModal';
import {
  Menu,
  Search,
  Bell,
  KeyRound,
  LogOut,
  ChevronDown,
  Calendar,
  Building2,
  User
} from 'lucide-react';

const SEARCH_DEBOUNCE_MS = 250;
const MIN_SEARCH_LENGTH = 2;

/* Page title map */
const PAGE_TITLES = {
  'dashboard': 'Dashboard',
  'report-absence': 'Report Absence',
  'hod-requests': 'Adjustment Console',
  'master-timetable': 'Master Timetable',
  'my-schedule': 'My Schedule & Proxy Duties',
  'timetable-editor': 'Timetable Manager',
  'faculty-directory': 'Faculty Directory',
  'reports': 'Reports & Analytics'
};

function useNotifications() {
  const { currentRole, user, absences, adjustments, setActiveTab, selectedDate } = useApp();

  if (currentRole === 'hod') {
    return absences
      .filter(a => a.status === 'Pending')
      .map(a => ({
        id: a.id,
        title: `${a.facultyName} requested leave`,
        detail: `${a.dayOfWeek}, ${a.date}`,
        onOpen: () => setActiveTab('hod-requests')
      }));
  }

  const myRequests = absences
    .filter(a => a.facultyId === user.id && a.status === 'Pending')
    .map(a => ({
      id: a.id,
      title: 'Leave request awaiting HOD review',
      detail: `${a.dayOfWeek}, ${a.date}`,
      onOpen: () => setActiveTab('my-schedule')
    }));
  const myDuties = adjustments
    .filter(adj => adj.substituteFacultyId === user.id && adj.date >= selectedDate)
    .map(adj => ({
      id: adj.id,
      title: `Proxy duty: ${adj.subject} (${adj.classGroup})`,
      detail: `${adj.dayOfWeek}, ${adj.date} • Lecture ${adj.periodId}`,
      onOpen: () => setActiveTab('my-schedule')
    }));
  return [...myDuties, ...myRequests];
}

function HeaderSearch() {
  const { currentRole, setActiveTab, setCurrentFacultyId, setSelectedDay, showToast } = useApp();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const term = query.trim();
    if (term.length < MIN_SEARCH_LENGTH) return undefined;

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const found = await api.search(term);
        if (!cancelled) setResults(found);
      } catch (err) {
        if (!cancelled) showToast(err.message, 'error');
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, showToast]);

  const finish = () => { setOpen(false); setQuery(''); setResults(null); };

  const openFaculty = (facultyId) => {
    if (currentRole === 'hod') {
      setCurrentFacultyId(facultyId);
      setActiveTab('my-schedule');
    } else {
      setActiveTab('master-timetable');
    }
    finish();
  };

  const openClass = (day) => {
    setSelectedDay(day);
    setActiveTab('master-timetable');
    finish();
  };

  const showPanel = open && query.trim().length >= MIN_SEARCH_LENGTH && results;
  const isEmpty = results && results.faculty.length === 0 && results.classes.length === 0;

  return (
    <div className="navbar-search">
      <Search size={16} className="search-icon" />
      <input
        type="text"
        placeholder="Search faculty, courses..."
        className="search-input"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => { if (e.key === 'Escape') finish(); }}
      />
      {showPanel && (
        <div className="nav-panel search-panel" onMouseDown={(e) => e.preventDefault()}>
          {isEmpty && <div className="nav-panel-empty">No matches for "{query.trim()}"</div>}
          {results.faculty.length > 0 && <div className="nav-panel-heading">Faculty</div>}
          {results.faculty.map(f => (
            <button key={f.id} className="nav-panel-item" onClick={() => openFaculty(f.id)}>
              <span className="nav-panel-title">{f.name}</span>
              <span className="nav-panel-detail">{f.designation} • {f.department}</span>
            </button>
          ))}
          {results.classes.length > 0 && <div className="nav-panel-heading">Classes</div>}
          {results.classes.map(c => (
            <button
              key={`${c.facultyId}-${c.day}-${c.periodId}`}
              className="nav-panel-item"
              onClick={() => openClass(c.day)}
            >
              <span className="nav-panel-title">{c.subject} ({c.classGroup})</span>
              <span className="nav-panel-detail">
                {c.day}, Lecture {c.periodId} • {c.room} • {c.facultyName}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TopHeader({ collapsed, onMobileOpen }) {
  const { currentRole, user, activeTab, logout } = useApp();
  const [openPanel, setOpenPanel] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const panelsRef = useRef(null);
  const notifications = useNotifications();

  useEffect(() => {
    if (!openPanel) return undefined;
    const closeOnOutsideClick = (e) => {
      if (!panelsRef.current?.contains(e.target)) setOpenPanel(null);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, [openPanel]);

  const togglePanel = (panel) => setOpenPanel(prev => (prev === panel ? null : panel));

  const openPasswordModal = () => {
    setOpenPanel(null);
    setShowPasswordModal(true);
  };

  const pageTitle = PAGE_TITLES[activeTab] || 'Dashboard';
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <>
      <header className={`fams-header${collapsed ? ' fams-header--collapsed' : ''}`}>
        {/* Left: Mobile toggle + Page title */}
        <div className="fams-header__left">
          <button className="fams-header__mobile-toggle" onClick={onMobileOpen}>
            <Menu size={22} />
          </button>

          <div className="fams-header__page-info">
            <div className="fams-header__breadcrumb">
              FAMS / {currentRole === 'hod' ? 'Admin' : 'Faculty'}
            </div>
            <div className="fams-header__title">{pageTitle}</div>
          </div>
        </div>

        {/* Center: Search */}
        <HeaderSearch />

        {/* Right: Notifications + User */}
        <div className="fams-header__right" ref={panelsRef}>
          {/* Date display */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            fontSize: 12, color: 'var(--fams-gray-500)', marginRight: 8,
            whiteSpace: 'nowrap'
          }}>
            <Calendar size={14} />
            <span>{dateStr}</span>
          </div>

          {/* Notifications */}
          <div className="notification-icon-wrapper">
            <button
              className="nav-icon-btn"
              title="Notifications"
              onClick={() => togglePanel('notifications')}
            >
              <Bell size={19} />
              {notifications.length > 0 && (
                <span className="notification-badge">{notifications.length}</span>
              )}
            </button>
            {openPanel === 'notifications' && (
              <div className="nav-panel nav-panel-right">
                <div className="nav-panel-heading">Notifications</div>
                {notifications.length === 0 && (
                  <div className="nav-panel-empty">You're all caught up.</div>
                )}
                {notifications.map(n => (
                  <button
                    key={n.id}
                    className="nav-panel-item"
                    onClick={() => { n.onOpen(); setOpenPanel(null); }}
                  >
                    <span className="nav-panel-title">{n.title}</span>
                    <span className="nav-panel-detail">{n.detail}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="user-menu-wrapper">
            <button
              className="user-profile-section"
              onClick={() => togglePanel('profile')}
              aria-expanded={openPanel === 'profile'}
            >
              <div className="user-avatar">
                {getInitials(user.name)}
              </div>
              <div className="user-info">
                <div className="user-name">{user.name}</div>
                <div className="user-role">
                  {currentRole === 'hod' ? 'HOD / Admin' : 'Faculty'}
                </div>
              </div>
              <ChevronDown size={14} className="user-dropdown-arrow" />
            </button>
            {openPanel === 'profile' && (
              <div className="nav-panel nav-panel-right nav-panel-compact">
                <div style={{
                  padding: '12px 14px',
                  borderBottom: '1px solid var(--fams-gray-100)',
                  display: 'flex', flexDirection: 'column', gap: 4
                }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fams-gray-800)' }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--fams-gray-400)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <User size={11} />
                    <span>{user.email}</span>
                  </div>
                  {user.department && (
                    <div style={{ fontSize: 11, color: 'var(--fams-gray-400)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Building2 size={11} />
                      <span>{user.department}</span>
                    </div>
                  )}
                </div>
                <button className="nav-panel-item nav-panel-action" onClick={openPasswordModal}>
                  <KeyRound size={15} />
                  <span>Change Password</span>
                </button>
                <button className="nav-panel-item nav-panel-action" onClick={logout}>
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
    </>
  );
}

