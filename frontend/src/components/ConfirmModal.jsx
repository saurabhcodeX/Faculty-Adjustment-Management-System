import React from 'react';
import { AlertTriangle, Info, Trash2, CheckCircle2, X } from 'lucide-react';

/**
 * A reusable confirmation modal that replaces window.confirm().
 *
 * Props:
 *  - isOpen: boolean
 *  - title: string
 *  - message: string (can include JSX)
 *  - confirmLabel: string (default "Confirm")
 *  - cancelLabel: string (default "Cancel")
 *  - variant: 'danger' | 'warning' | 'info' | 'success' (default 'warning')
 *  - onConfirm: () => void
 *  - onCancel: () => void
 */
export default function ConfirmModal({
  isOpen,
  title = 'Are you sure?',
  message = '',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'warning',
  onConfirm,
  onCancel
}) {
  if (!isOpen) return null;

  const iconMap = {
    danger: <Trash2 size={22} />,
    warning: <AlertTriangle size={22} />,
    info: <Info size={22} />,
    success: <CheckCircle2 size={22} />
  };

  const colorMap = {
    danger: {
      iconBg: 'confirm-icon-danger',
      confirmBtn: 'confirm-btn-danger'
    },
    warning: {
      iconBg: 'confirm-icon-warning',
      confirmBtn: 'confirm-btn-warning'
    },
    info: {
      iconBg: 'confirm-icon-info',
      confirmBtn: 'confirm-btn-info'
    },
    success: {
      iconBg: 'confirm-icon-success',
      confirmBtn: 'confirm-btn-success'
    }
  };

  const colors = colorMap[variant] || colorMap.warning;

  return (
    <div className="confirm-backdrop" onClick={onCancel}>
      <div
        className="confirm-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="confirm-close-btn" onClick={onCancel}>
          <X size={16} />
        </button>

        <div className="confirm-body">
          <div className={`confirm-icon-circle ${colors.iconBg}`}>
            {iconMap[variant] || iconMap.warning}
          </div>

          <h3 className="confirm-title">{title}</h3>

          {message && (
            <p className="confirm-message">{message}</p>
          )}
        </div>

        <div className="confirm-actions">
          <button
            className="confirm-cancel-btn"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            className={`confirm-ok-btn ${colors.confirmBtn}`}
            onClick={() => {
              onConfirm();
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

