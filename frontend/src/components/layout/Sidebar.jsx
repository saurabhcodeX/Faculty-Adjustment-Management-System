import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  CalendarX2,
  Workflow,
  CalendarDays,
  UserCheck2,
  Sliders,
  Users,
  BarChart3,
  GraduationCap,
  PanelLeftClose,
  PanelLeftOpen,
  AlertTriangle,
  RotateCw
} from 'lucide-react';

const HOD_NAV = [
  {
    label: 'Main',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'report-absence', label: 'Report Absence', icon: CalendarX2 },
    ]
  },
  {
    label: 'Management',
    items: [
      { id: 'hod-requests', label: 'Adjustment Console', icon: Workflow, showBadge: true },
      { id: 'faculty-directory', label: 'Faculty Directory', icon: Users },
      { id: 'timetable-editor', label: 'Timetable Manager', icon: Sliders },
    ]
  },
  {
    label: 'View',
    items: [
      { id: 'master-timetable', label: 'Master Timetable', icon: CalendarDays },
      { id: 'my-schedule', label: 'My Schedule', icon: UserCheck2 },
      { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    ]
  }
];

const FACULTY_NAV = [
  {
    label: 'Main',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'report-absence', label: 'Report Absence', icon: CalendarX2 },
    ]
  },
  {
    label: 'View',
    items: [
      { id: 'master-timetable', label: 'Master Timetable', icon: CalendarDays },
      { id: 'my-schedule', label: 'My Schedule', icon: UserCheck2 },
    ]
  }
];

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const { activeTab, setActiveTab, absences, currentRole, demoMode, resetToDemoData } = useApp();

  const pendingCount = absences.filter(a => a.status === 'Pending').length;
  const navSections = currentRole === 'hod' ? HOD_NAV : FACULTY_NAV;

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    if (mobileOpen) onMobileClose();
  };

  const sidebarClass = [
    'fams-sidebar',
    collapsed && !mobileOpen ? 'fams-sidebar--collapsed' : '',
    mobileOpen ? 'fams-sidebar--mobile-open' : ''
  ].filter(Boolean).join(' ');

  return (
    <>
      <aside className={sidebarClass}>
        {/* Brand */}
        <div className="fams-sidebar__brand">
          <div className="fams-sidebar__logo">
            <GraduationCap size={20} />
          </div>
          <div className="fams-sidebar__brand-text">
            <div className="fams-sidebar__brand-title">FAMS</div>
            <div className="fams-sidebar__brand-subtitle">Faculty Portal</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="fams-sidebar__nav">
          {navSections.map((section) => (
            <div key={section.label} className="fams-sidebar__section">
              <div className="fams-sidebar__section-label">{section.label}</div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const badge = item.showBadge && pendingCount > 0 ? pendingCount : null;

                return (
                  <button
                    key={item.id}
                    className={`fams-sidebar__link${isActive ? ' fams-sidebar__link--active' : ''}`}
                    onClick={() => handleNavClick(item.id)}
                    title={item.label}
                  >
                    <span className="fams-sidebar__link-icon">
                      <Icon size={18} />
                    </span>
                    <span className="fams-sidebar__link-text">{item.label}</span>
                    {badge !== null && (
                      <span className="fams-sidebar__badge">{badge}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Demo Mode Badge */}
        {demoMode && currentRole === 'hod' && (
          <div className="fams-sidebar__demo-badge">
            <AlertTriangle size={14} style={{ color: '#fbbf24', flexShrink: 0 }} />
            <span>Demo Mode</span>
            <button
              onClick={resetToDemoData}
              title="Reset demo data"
              style={{
                marginLeft: 'auto',
                background: 'none',
                border: 'none',
                color: '#fbbf24',
                cursor: 'pointer',
                padding: 2,
                display: 'flex'
              }}
            >
              <RotateCw size={13} />
            </button>
          </div>
        )}

        {/* Collapse Toggle */}
        <button className="fams-sidebar__toggle" onClick={onToggle}>
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          <span className="fams-sidebar__toggle-text">
            {collapsed ? 'Expand' : 'Collapse'}
          </span>
        </button>
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fams-overlay fams-overlay--visible" onClick={onMobileClose} />
      )}
    </>
  );
}

