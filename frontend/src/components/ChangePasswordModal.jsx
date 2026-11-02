import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AlertCircle } from 'lucide-react';

export default function ChangePasswordModal({ onClose }) {
  const { changePassword, showToast } = useApp();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('The new passwords do not match.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);
      showToast('Password changed. Other devices have been signed out.', 'success');
      onClose();
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog max-w-md">
        <div className="modal-header border-b p-4 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base">Change Password</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700" aria-label="Close">
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {error && (
            <div className="auth-error" role="alert">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
          <div>
            <label className="field-label" htmlFor="current-password">Current Password</label>
            <input
              id="current-password"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="input-text"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="field-label" htmlFor="new-password">New Password</label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-text"
              required
            />
          </div>
          <div>
            <label className="field-label" htmlFor="confirm-password">Confirm New Password</label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-text"
              required
            />
          </div>
          <div className="pt-3 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn btn-outline btn-sm">Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
              {submitting ? 'Saving...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
