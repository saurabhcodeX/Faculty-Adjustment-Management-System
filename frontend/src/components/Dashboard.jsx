import React from 'react';
import { useApp } from '../context/AppContext';
import HodDashboard from './dashboard/HodDashboard';
import FacultyDashboard from './dashboard/FacultyDashboard';

export default function Dashboard({ onOpenPrintModal }) {
  const { currentRole } = useApp();

  if (currentRole === 'hod') {
    return <HodDashboard onOpenPrintModal={onOpenPrintModal} />;
  }

  return <FacultyDashboard />;
}
