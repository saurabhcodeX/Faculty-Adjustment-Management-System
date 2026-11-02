import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  CalendarX2,
  Workflow,
  CalendarDays,
  UserCheck2,
  Sliders
} from 'lucide-react';

export default function NavigationTabs({ open, onNavigate }) {
  const { activeTab, setActiveTab, absences, currentRole } = useApp();

  const pendingCount = absences.filter(a => a.status === 'Pending').length;

  const tabs = [
    {
      id: 'dashboard',
      label: 'Overview & Notice Board',
      icon: LayoutDashboard,
      badge: null,
      highlight: false
    },
    {
      id: 'report-absence',
      label: 'Report Absence',
      icon: CalendarX2,
      badge: null,
      highlight: currentRole === 'faculty'
    },
    {
      id: 'hod-requests',
      label: 'HOD Adjustment Console',
      icon: Workflow,
      badge: pendingCount > 0 ? pendingCount : null,
      highlight: currentRole === 'hod' && pendingCount > 0,
      hodOnly: true
    },
    {
      id: 'master-timetable',
      label: 'Master 8-Lecture Timetable',
      icon: CalendarDays,
      badge: null,
      highlight: false
    },
    {
      id: 'my-schedule',
      label: 'My Schedule & Proxy Duties',
      icon: UserCheck2,
      badge: null,
      highlight: false
    },
    {
      id: 'timetable-editor',
      label: 'Timetable Manager',
      icon: Sliders,
      badge: null,
      highlight: false,
      hodOnly: true
    }
  ].filter(tab => currentRole === 'hod' || !tab.hodOnly);

  return (
    <nav className={`tabs-nav-bar${open ? ' tabs-open' : ''}`}>
      <div className="tabs-container">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                onNavigate();
              }}
              className={[
                'tab-btn',
                isActive     ? 'active'        : '',
                tab.highlight ? 'tab-highlight' : ''
              ].filter(Boolean).join(' ')}
              title={tab.label}
            >
              <Icon size={15} className="tab-icon" />
              <span className="tab-label">{tab.label}</span>
              {tab.badge !== null && (
                <span className="tab-badge">{tab.badge}</span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
