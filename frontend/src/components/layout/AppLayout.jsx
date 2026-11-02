import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';

export default function AppLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="fams-layout">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(c => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <TopHeader
        collapsed={collapsed}
        onMobileOpen={() => setMobileOpen(true)}
      />

      <main className={`fams-main${collapsed ? ' fams-main--collapsed' : ''}`}>
        {children}
      </main>
    </div>
  );
}

