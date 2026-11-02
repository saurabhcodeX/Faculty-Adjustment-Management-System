import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import {
  AlertCircle,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  Lock,
  Mail,
  School,
  Shield,
} from 'lucide-react';
import './LoginPage.css';

/* ═══════════════════════════════════════════════════════════════
   CONFIGURATION
   ═══════════════════════════════════════════════════════════════ */

const BRAND = {
  university: 'Chandigarh University',
  system: 'CU Faculty Management System',
  tagline: 'Faculty Adjustment & Timetable Management Portal',
  version: 'v1.0',
};

const ROLES = [
  {
    key: 'hod',
    label: 'HOD / Admin',
    Icon: Shield,
    desc: 'Manage faculty, approve absences, assign substitutes and control timetables.',
    gradient: 'linear-gradient(135deg, #1e4d8c, #2563eb)',
    submitText: 'Sign in as HOD / Admin',
  },
  {
    key: 'faculty',
    label: 'Faculty',
    Icon: GraduationCap,
    desc: 'Report absences, view your timetable and check your substitute duties.',
    gradient: 'linear-gradient(135deg, #0c4a6e, #0891b2)',
    submitText: 'Sign in as Faculty',
  },
];

const FORGOT_MSG =
  'Please contact your Head of Department or the system administrator to reset your password.';

const LS_KEY = 'cu_fms_remembered_email';

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */

function readRemembered() {
  try {
    return localStorage.getItem(LS_KEY) || '';
  } catch {
    return '';
  }
}

function writeRemembered(email) {
  try {
    if (email) localStorage.setItem(LS_KEY, email);
    else localStorage.removeItem(LS_KEY);
  } catch {
    /* silently ignore */
  }
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function LoginPage() {
  const { login } = useApp();

  const savedEmail = readRemembered();
  const [role, setRole] = useState(0); // index into ROLES
  const [email, setEmail] = useState(savedEmail);
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [remember, setRemember] = useState(Boolean(savedEmail));
  const [forgotOpen, setForgotOpen] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const active = ROLES[role];

  /* Caps-lock detector */
  const detectCaps = useCallback((e) => {
    if (typeof e.getModifierState === 'function') {
      setCapsLock(e.getModifierState('CapsLock'));
    }
  }, []);

  /* Submit — uses existing auth exactly as-is */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setForgotOpen(false);
    setSubmitting(true);
    try {
      await login(email, password, active.key);
      /* persist or clear remembered email */
      writeRemembered(remember ? email : '');
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  /* ── Render ── */
  return (
    <div className="lg-root">
      {/* Background clouds */}
      <div className="lg-bg-clouds">
        <div className="lg-cloud lg-cloud--1" />
        <div className="lg-cloud lg-cloud--2" />
        <div className="lg-cloud lg-cloud--3" />
      </div>

      {/* Content */}
      <div className="lg-content">
        {/* ── THE CARD ── */}
        <main className="lg-card">

          {/* ── Scenic illustration header (pure CSS) ── */}
          <div className="lg-scene">
            {/* Stars */}
            <div className="lg-stars">
              <div className="lg-star" />
              <div className="lg-star" />
              <div className="lg-star" />
              <div className="lg-star" />
              <div className="lg-star" />
              <div className="lg-star" />
              <div className="lg-star" />
            </div>

            {/* Moon */}
            <div className="lg-moon" />

            {/* Clouds inside scene */}
            <div className="lg-scene-cloud lg-scene-cloud--1" />
            <div className="lg-scene-cloud lg-scene-cloud--2" />

            {/* Shooting star */}
            <div className="lg-shooting-star" />

            {/* Mountains */}
            <div className="lg-mountains">
              <div className="lg-mtn lg-mtn--b1" />
              <div className="lg-mtn lg-mtn--b2" />
              <div className="lg-mtn lg-mtn--b3" />
              <div className="lg-mtn lg-mtn--b4" />
              <div className="lg-mtn lg-mtn--f1" />
              <div className="lg-mtn lg-mtn--f2" />
              <div className="lg-mtn lg-mtn--f3" />
              <div className="lg-water" />
            </div>
          </div>

          {/* ── Form section ── */}
          <div className="lg-form-section">
            {/* Role tabs */}
            <div className="lg-tabs-track" role="tablist" aria-label="Login role">
              {ROLES.map((r, i) => (
                <button
                  key={r.key}
                  role="tab"
                  type="button"
                  className={`lg-tab ${i === role ? 'lg-tab--active' : ''}`}
                  aria-pressed={i === role}
                  aria-selected={i === role}
                  onClick={() => { setRole(i); setError(''); setForgotOpen(false); }}
                >
                  <r.Icon size={15} strokeWidth={2} />
                  <span>{r.label}</span>
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="lg-form" noValidate>
              {/* Email */}
              <div className="lg-field">
                <label htmlFor="lg-email" className="lg-label">
                  Email Address
                </label>
                <div className="lg-input-wrap">
                  <span className="lg-input-icon" aria-hidden="true">
                    <Mail size={17} />
                  </span>
                  <input
                    id="lg-email"
                    type="email"
                    className="lg-input"
                    placeholder="Email Address"
                    autoComplete="username"
                    autoFocus
                    required
                    aria-required="true"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="lg-field">
                <label htmlFor="lg-password" className="lg-label">
                  Password
                </label>
                <div className="lg-input-wrap">
                  <span className="lg-input-icon" aria-hidden="true">
                    <Lock size={17} />
                  </span>
                  <input
                    id="lg-password"
                    type={showPw ? 'text' : 'password'}
                    className="lg-input lg-input--pw"
                    placeholder="Password"
                    autoComplete="current-password"
                    required
                    aria-required="true"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={detectCaps}
                    onKeyUp={detectCaps}
                  />
                  <button
                    type="button"
                    className="lg-pw-toggle"
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPw((v) => !v)}
                  >
                    {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {capsLock && (
                  <p className="lg-caps-warn" aria-live="polite">
                    ⚠ Caps Lock is on
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="lg-submit"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="lg-spinner" />
                    <span>Signing in…</span>
                  </>
                ) : (
                  <span>LOGIN</span>
                )}
              </button>

              {/* Forgot password */}
              <div className="lg-extras">
                <label className="lg-remember">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => {
                      setRemember(e.target.checked);
                      if (!e.target.checked) writeRemembered('');
                    }}
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  className="lg-forgot-btn"
                  onClick={() => setForgotOpen((v) => !v)}
                >
                  Forgot Password?
                </button>
              </div>

              {/* Forgot info box */}
              {forgotOpen && (
                <div className="lg-forgot-msg" role="status">
                  {FORGOT_MSG}
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="lg-error" role="alert">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}
            </form>
          </div>

          {/* ── Welcome section (bottom of card) ── */}
          <div className="lg-welcome">
            <h1 className="lg-welcome-title">WELCOME</h1>
            <p className="lg-welcome-sub">{BRAND.tagline}</p>
            <div className="lg-welcome-brand">
              <School size={14} strokeWidth={2} />
              <span>{BRAND.system}</span>
            </div>
          </div>
        </main>

        {/* ── Footer ── */}
        <footer className="lg-footer">
          © {new Date().getFullYear()} {BRAND.university} • {BRAND.system} • {BRAND.version}
        </footer>
      </div>
    </div>
  );
}
