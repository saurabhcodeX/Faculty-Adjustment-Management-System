import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export default function NotificationToast() {
  const { toasts, dismissToast } = useApp();

  if (!toasts || toasts.length === 0) return null;

  const iconMap = {
    success: <CheckCircle2 size={18} />,
    error: <AlertCircle size={18} />,
    info: <Info size={18} />,
    warning: <AlertTriangle size={18} />
  };

  return (
    <div className="toast-stack">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast-item toast-${toast.type || 'info'} ${
            toast.exiting ? 'toast-exit' : 'toast-enter'
          }`}
        >
          <div className={`toast-icon-circle toast-icon-${toast.type || 'info'}`}>
            {iconMap[toast.type] || iconMap.info}
          </div>
          <div className="toast-text">{toast.message}</div>
          <button
            className="toast-dismiss"
            onClick={() => dismissToast(toast.id)}
          >
            <X size={14} />
          </button>
          <div className={`toast-progress toast-progress-${toast.type || 'info'}`} />
        </div>
      ))}
    </div>
  );
}
