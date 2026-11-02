import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  PieChart,
  CalendarX,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Shuffle,
  Users,
  TrendingUp
} from 'lucide-react';

export default function ReportsPage() {
  const { absences, adjustments, facultyList } = useApp();

  // Summary stats
  const totalAbsences = absences.length;
  const pending = absences.filter(a => a.status === 'Pending').length;
  const approved = absences.filter(a => a.status === 'Approved').length;
  const rejected = absences.filter(a => a.status === 'Rejected').length;
  const totalAdjustments = adjustments.length;

  // Absence by leave type
  const byLeaveType = useMemo(() => {
    const map = {};
    absences.forEach(a => {
      const type = a.leaveType || 'Other';
      map[type] = (map[type] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [absences]);

  // Absence by faculty (top 10)
  const byFaculty = useMemo(() => {
    const map = {};
    absences.forEach(a => {
      const name = a.facultyName || 'Unknown';
      map[name] = (map[name] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [absences]);

  // Absence by day of week
  const byDay = useMemo(() => {
    const map = { Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0 };
    absences.forEach(a => {
      if (a.dayOfWeek && map[a.dayOfWeek] !== undefined) {
        map[a.dayOfWeek]++;
      }
    });
    return Object.entries(map);
  }, [absences]);

  // Proxy duty count by faculty (who gets assigned most)
  const proxyByFaculty = useMemo(() => {
    const map = {};
    adjustments.forEach(adj => {
      const name = adj.substituteFacultyName || 'Unknown';
      map[name] = (map[name] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [adjustments]);

  const maxBarValue = (data) => Math.max(...data.map(d => d[1]), 1);

  return (
    <div>
      {/* Header */}
      <div className="fams-section-header" style={{ marginBottom: 20 }}>
        <div className="fams-section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BarChart3 size={20} />
          Reports & Analytics
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="fams-stats-grid">
        <div className="fams-stat-card">
          <div className="fams-stat-card__info">
            <div className="fams-stat-card__label">Total Absences</div>
            <div className="fams-stat-card__value">{totalAbsences}</div>
          </div>
          <div className="fams-stat-card__icon fams-stat-card__icon--blue">
            <CalendarX size={22} />
          </div>
        </div>
        <div className="fams-stat-card">
          <div className="fams-stat-card__info">
            <div className="fams-stat-card__label">Approved</div>
            <div className="fams-stat-card__value">{approved}</div>
          </div>
          <div className="fams-stat-card__icon fams-stat-card__icon--green">
            <CheckCircle2 size={22} />
          </div>
        </div>
        <div className="fams-stat-card">
          <div className="fams-stat-card__info">
            <div className="fams-stat-card__label">Rejected</div>
            <div className="fams-stat-card__value">{rejected}</div>
          </div>
          <div className="fams-stat-card__icon fams-stat-card__icon--red">
            <XCircle size={22} />
          </div>
        </div>
        <div className="fams-stat-card">
          <div className="fams-stat-card__info">
            <div className="fams-stat-card__label">Adjustments</div>
            <div className="fams-stat-card__value">{totalAdjustments}</div>
          </div>
          <div className="fams-stat-card__icon fams-stat-card__icon--teal">
            <Shuffle size={22} />
          </div>
        </div>
      </div>

      <div className="fams-grid fams-grid--2" style={{ marginTop: 4 }}>
        {/* Status Breakdown */}
        <div className="fams-card">
          <div className="fams-card__header">
            <div className="fams-card__title"><PieChart size={16} /> Status Breakdown</div>
          </div>
          <div className="fams-card__body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Pending', value: pending, color: 'var(--fams-warning)', bg: 'var(--fams-warning-bg)', icon: AlertCircle },
                { label: 'Approved', value: approved, color: 'var(--fams-success)', bg: 'var(--fams-success-bg)', icon: CheckCircle2 },
                { label: 'Rejected', value: rejected, color: 'var(--fams-danger)', bg: 'var(--fams-danger-bg)', icon: XCircle },
              ].map(item => {
                const Icon = item.icon;
                const pct = totalAbsences > 0 ? Math.round((item.value / totalAbsences) * 100) : 0;
                return (
                  <div key={item.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--fams-gray-700)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Icon size={14} style={{ color: item.color }} />
                        {item.label}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: item.color }}>
                        {item.value} ({pct}%)
                      </span>
                    </div>
                    <div style={{ height: 8, background: 'var(--fams-gray-100)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${pct}%`, background: item.color,
                        borderRadius: 4, transition: 'width 0.5s ease'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* By Leave Type */}
        <div className="fams-card">
          <div className="fams-card__header">
            <div className="fams-card__title"><CalendarX size={16} /> By Leave Type</div>
          </div>
          <div className="fams-card__body">
            {byLeaveType.length === 0 ? (
              <div className="fams-empty" style={{ padding: 24 }}>
                <div className="fams-empty__title">No data yet</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {byLeaveType.map(([type, count]) => {
                  const pct = Math.round((count / maxBarValue(byLeaveType)) * 100);
                  return (
                    <div key={type}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: 'var(--fams-gray-600)', fontWeight: 500 }}>{type}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--fams-gray-800)' }}>{count}</span>
                      </div>
                      <div style={{ height: 6, background: 'var(--fams-gray-100)', borderRadius: 3 }}>
                        <div style={{
                          height: '100%', width: `${pct}%`,
                          background: 'var(--fams-blue)', borderRadius: 3,
                          transition: 'width 0.5s ease'
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* By Day of Week */}
        <div className="fams-card">
          <div className="fams-card__header">
            <div className="fams-card__title"><TrendingUp size={16} /> By Day of Week</div>
          </div>
          <div className="fams-card__body">
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140, padding: '0 8px' }}>
              {byDay.map(([day, count]) => {
                const max = maxBarValue(byDay);
                const h = max > 0 ? Math.max((count / max) * 120, count > 0 ? 12 : 4) : 4;
                return (
                  <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--fams-gray-800)' }}>
                      {count}
                    </span>
                    <div style={{
                      width: '100%', maxWidth: 40, height: h,
                      background: count > 0 ? 'var(--fams-teal)' : 'var(--fams-gray-200)',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.5s ease'
                    }} />
                    <span style={{ fontSize: 10, color: 'var(--fams-gray-500)', fontWeight: 500 }}>
                      {day.slice(0, 3)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top Absentees */}
        <div className="fams-card">
          <div className="fams-card__header">
            <div className="fams-card__title"><Users size={16} /> Absence Count by Faculty</div>
          </div>
          <div className="fams-card__body">
            {byFaculty.length === 0 ? (
              <div className="fams-empty" style={{ padding: 24 }}>
                <div className="fams-empty__title">No data yet</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {byFaculty.map(([name, count]) => {
                  const pct = Math.round((count / maxBarValue(byFaculty)) * 100);
                  return (
                    <div key={name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: 'var(--fams-gray-600)', fontWeight: 500 }}>{name}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--fams-gray-800)' }}>{count}</span>
                      </div>
                      <div style={{ height: 6, background: 'var(--fams-gray-100)', borderRadius: 3 }}>
                        <div style={{
                          height: '100%', width: `${pct}%`,
                          background: '#4f46e5', borderRadius: 3,
                          transition: 'width 0.5s ease'
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Proxy Duty Distribution */}
      {proxyByFaculty.length > 0 && (
        <div className="fams-card" style={{ marginTop: 20 }}>
          <div className="fams-card__header">
            <div className="fams-card__title"><Shuffle size={16} /> Proxy Duty Distribution</div>
            <div className="fams-card__subtitle">Which faculty take the most substitute duties</div>
          </div>
          <div className="fams-card__body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {proxyByFaculty.map(([name, count]) => {
                const pct = Math.round((count / maxBarValue(proxyByFaculty)) * 100);
                return (
                  <div key={name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: 'var(--fams-gray-600)', fontWeight: 500 }}>{name}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--fams-teal)' }}>{count} duties</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--fams-gray-100)', borderRadius: 3 }}>
                      <div style={{
                        height: '100%', width: `${pct}%`,
                        background: 'var(--fams-teal)', borderRadius: 3,
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

