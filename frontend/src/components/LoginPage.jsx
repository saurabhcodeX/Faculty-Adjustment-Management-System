import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import {
  AlertCircle,
  Calendar,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  Lock,
  Mail,
  School,
  Shield,
  ShieldCheck,
  Users,
} from 'lucide-react';
import './LoginPage.css';

/* ═══════════════════════════════════════════════════════════════
   CONFIGURATION — all static text lives here
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

const PILLS = [
  { Icon: Users, text: 'Smart Substitute Matching' },
  { Icon: Calendar, text: '8-Period Timetable Automation' },
  { Icon: ShieldCheck, text: 'Secure Role-Based Access' },
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
  const [logoFailed, setLogoFailed] = useState(false);

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
      {/* (a) Background image + zoom */}
      <div className="lg-bg" />

      {/* (b) Dark overlay */}
      <div className="lg-overlay" />

      {/* (c) Glow blobs */}
      <div className="lg-glow lg-glow--blue" />
      <div className="lg-glow lg-glow--amber" />

      {/* Content */}
      <div className="lg-content">
        {/* ── 1. Header ── */}
        <header className="lg-header">
          <div className="lg-header-mark">
            <School size={18} strokeWidth={2} />
          </div>
          <span className="lg-header-text">{BRAND.university}</span>
        </header>

        {/* ── 2. Center card ── */}
        <main className="lg-card">
          {/* Logo */}
          <div className="lg-logo-wrap">
            {logoFailed ? (
              <div className="lg-logo-fallback">
                <School size={32} strokeWidth={1.6} />
              </div>
            ) : (
              <img
                src="/logo.png"
                alt={`${BRAND.university} logo`}
                className="lg-logo-img"
                width={68}
                height={68}
                onError={() => setLogoFailed(true)}
              />
            )}
          </div>

          {/* Title + tagline */}
          <h1 className="lg-title">{BRAND.system}</h1>
          <p className="lg-tagline">{BRAND.tagline}</p>

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
          <p className="lg-role-desc">{active.desc}</p>

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
                  placeholder="name@college.edu"
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
                  placeholder="Enter your password"
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

            {/* Extras row */}
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
                <span>Remember my email</span>
              </label>
              <button
                type="button"
                className="lg-forgot-btn"
                onClick={() => setForgotOpen((v) => !v)}
              >
                Forgot password?
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

            {/* Submit */}
            <button
              type="submit"
              className="lg-submit"
              disabled={submitting}
              style={{ background: active.gradient }}
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="lg-spinner" />
                  <span>Signing in…</span>
                </>
              ) : (
                <span>{active.submitText}</span>
              )}
            </button>
          </form>
        </main>

        {/* ── 3. Feature pills ── */}
        <div className="lg-pills">
          {PILLS.map((p) => (
            <div className="lg-pill" key={p.text}>
              <p.Icon size={15} strokeWidth={2} />
              <span>{p.text}</span>
            </div>
          ))}
        </div>

        {/* ── 4. Footer ── */}
        <footer className="lg-footer">
          © {new Date().getFullYear()} {BRAND.university} • {BRAND.system} • {BRAND.version}
        </footer>
      </div>
    </div>
  );
}
