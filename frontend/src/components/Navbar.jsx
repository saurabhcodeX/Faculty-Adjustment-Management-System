import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import { getInitials } from '../utils/names';
import ChangePasswordModal from './ChangePasswordModal';
import {
  Menu,
  X,
  Search,
  Bell,
  Settings,
  School,
  ChevronDown,
  KeyRound,
  LogOut
} from 'lucide-react';

const SEARCH_DEBOUNCE_MS = 250;
const MIN_SEARCH_LENGTH = 2;

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

function NavbarSearch() {
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

  const finish = () => {
    setOpen(false);
    setQuery('');
    setResults(null);
  };

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
      <Search size={18} className="search-icon" />
      <input
        type="text"
        placeholder="Search faculty, courses, timetable..."
        className="search-input"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
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

export default function Navbar({ tabsOpen, onToggleTabs }) {
  const { currentRole, user, demoMode, logout, resetToDemoData } = useApp();

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

  return (
    <header className="navbar-container">
      <div className="navbar-top">
        {/* Left: Menu & Logo */}
        <div className="navbar-left">
          <button
            className="menu-toggle"
            onClick={onToggleTabs}
            title="Toggle menu"
          >
            {tabsOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="navbar-brand">
            <div className="brand-icon">
              <School size={22} />
            </div>
            <div className="brand-info">
              <div className="brand-title">CU LMS</div>
              <div className="brand-subtitle">Faculty Portal</div>
            </div>
          </div>
        </div>

        {/* Center: Search Bar */}
        <NavbarSearch />

        {/* Right: Controls & User */}
        <div className="navbar-right" ref={panelsRef}>
          {/* Notifications */}
          <div className="notification-icon-wrapper">
            <button
              className="nav-icon-btn"
              title="Notifications"
              onClick={() => togglePanel('notifications')}
            >
              <Bell size={20} />
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
                    onClick={() => {
                      n.onOpen();
                      setOpenPanel(null);
                    }}
                  >
                    <span className="nav-panel-title">{n.title}</span>
                    <span className="nav-panel-detail">{n.detail}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Settings */}
          <button className="nav-icon-btn" title="Change password" onClick={openPasswordModal}>
            <Settings size={20} />
          </button>

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
              <ChevronDown size={16} className="user-dropdown-arrow" />
            </button>
            {openPanel === 'profile' && (
              <div className="nav-panel nav-panel-right nav-panel-compact">
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
      </div>

      {demoMode && currentRole === 'hod' && (
        <div className="navbar-controls-bar">
          <div className="controls-content">
            <div className="control-group">
              <button
                onClick={resetToDemoData}
                className="reset-btn"
                title="Reset to demo data"
              >
                Reset Demo
              </button>
            </div>
          </div>
        </div>
      )}

      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
    </header>
  );
}
