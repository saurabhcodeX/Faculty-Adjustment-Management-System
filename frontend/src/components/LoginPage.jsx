import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  Lock,
  Mail,
  RefreshCw,
  Shield,
  ShieldCheck,
  User
} from 'lucide-react';
import './LoginPage.css';

/* ═══════════════════════════════════════════════════════════════
   CONFIGURATION
   ═══════════════════════════════════════════════════════════════ */

const BRAND = {
  university: 'Chandigarh University',
  system: 'FAMS',
  fullName: 'Faculty Adjustment Management System',
  tagline: 'Faculty Adjustment & Timetable Portal',
  version: 'v1.0',
};

const ROLES = [
  {
    key: 'faculty',
    label: 'Faculty Login',
    Icon: GraduationCap,
    desc: 'Report absences, view timetable & check proxy duties.',
    iconClass: 'lg-role-icon--faculty',
    badgeClass: 'lg-step-badge--faculty',
  },
  {
    key: 'hod',
    label: 'HOD / Admin Login',
    Icon: Shield,
    desc: 'Manage faculty, approve absences & assign substitutes.',
    iconClass: 'lg-role-icon--hod',
    badgeClass: 'lg-step-badge--hod',
    cardClass: 'lg-role-card--hod',
  },
];

const FORGOT_MSG =
  'Please contact your Head of Department or the system administrator to reset your password.';

/* ═══════════════════════════════════════════════════════════════
   CAPTCHA UTILITY (frontend-only, decorative challenge)
   No backend CAPTCHA exists — this is a UX element only.
   ═══════════════════════════════════════════════════════════════ */

function generateCaptcha() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/* ═══════════════════════════════════════════════════════════════
   PROGRESS INDICATOR
   ═══════════════════════════════════════════════════════════════ */

function ProgressIndicator({ step }) {
  return (
    <div className="lg-progress" aria-hidden="true">
      {[1, 2, 3].map((n, i) => (
        <div key={n} className="lg-progress-step">
          <div
            className={`lg-progress-dot${
              step === n ? ' lg-progress-dot--active' :
              step > n ? ' lg-progress-dot--done' : ''
            }`}
          >
            {step > n ? <Check size={14} /> : n}
          </div>
          {i < 2 && (
            <div className={`lg-progress-line${step > n ? ' lg-progress-line--done' : ''}`} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BRAND HEADER
   ═══════════════════════════════════════════════════════════════ */

function BrandHeader() {
  return (
    <div className="lg-brand-header">
      <div className="lg-brand-logo">
        <GraduationCap size={26} />
      </div>
      <h1 className="lg-brand-title">{BRAND.system}</h1>
      <p className="lg-brand-tagline">{BRAND.tagline}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SCREEN 1: ROLE SELECTION
   ═══════════════════════════════════════════════════════════════ */

function RoleSelection({ onSelect, animDir }) {
  return (
    <div className={animDir === 'back' ? 'lg-step-back' : 'lg-step-enter'} key="role">
      <h2 className="lg-screen-title">Welcome to FAMS</h2>
      <p className="lg-screen-subtitle">Select your role to continue</p>

      <div className="lg-roles">
        {ROLES.map((r) => {
          const Icon = r.Icon;
          return (
            <button
              key={r.key}
              className={`lg-role-card ${r.cardClass || ''}`}
              onClick={() => onSelect(r.key)}
              type="button"
            >
              <div className={`lg-role-icon ${r.iconClass}`}>
                <Icon size={24} />
              </div>
              <div className="lg-role-info">
                <div className="lg-role-title">{r.label}</div>
                <p className="lg-role-desc">{r.desc}</p>
              </div>
              <ArrowRight size={18} className="lg-role-arrow" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SCREEN 2: EMPLOYEE ID ENTRY
   ═══════════════════════════════════════════════════════════════ */

function EmployeeIdStep({ role, email, onEmailChange, onNext, onBack, animDir }) {
  const inputRef = useRef(null);
  const [fieldError, setFieldError] = useState('');

  useEffect(() => {
    // Focus input when entering this step
    const timer = setTimeout(() => inputRef.current?.focus(), 350);
    return () => clearTimeout(timer);
  }, []);

  const roleData = ROLES.find(r => r.key === role);

  const handleNext = () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setFieldError('Please enter your Employee ID / Email');
      inputRef.current?.focus();
      return;
    }
    // Basic email format check
    if (!trimmed.includes('@') || !trimmed.includes('.')) {
      setFieldError('Please enter a valid email address');
      inputRef.current?.focus();
      return;
    }
    setFieldError('');
    onNext();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleNext();
    }
  };

  return (
    <div className={animDir === 'back' ? 'lg-step-back' : 'lg-step-enter'} key="email">
      {/* Role badge */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div className={`lg-step-badge ${roleData?.badgeClass || ''}`}>
          {roleData && <roleData.Icon size={12} />}
          <span>{roleData?.label || role}</span>
        </div>
      </div>

      <h2 className="lg-screen-title">Enter Your Credentials</h2>
      <p className="lg-screen-subtitle">Use your registered email address</p>

      {/* Email field */}
      <div className="lg-field">
        <label htmlFor="lg-email" className="lg-label">
          <Mail size={14} />
          Employee ID / Email
        </label>
        <div className="lg-input-wrap">
          <span className="lg-input-icon" aria-hidden="true">
            <Mail size={18} />
          </span>
          <input
            ref={inputRef}
            id="lg-email"
            type="email"
            className="lg-input"
            placeholder="name@college.edu"
            autoComplete="username"
            value={email}
            onChange={(e) => { onEmailChange(e.target.value); setFieldError(''); }}
            onKeyDown={handleKeyDown}
            aria-required="true"
            aria-invalid={Boolean(fieldError)}
          />
        </div>
        {fieldError && (
          <div className="lg-field-error" role="alert">
            <AlertCircle size={12} />
            {fieldError}
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="lg-btn-row">
        <button type="button" className="lg-btn lg-btn--back" onClick={onBack}>
          <ArrowLeft size={16} />
          Back
        </button>
        <button type="button" className="lg-btn lg-btn--primary" onClick={handleNext}>
          Next
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SCREEN 3: PASSWORD + CAPTCHA
   ═══════════════════════════════════════════════════════════════ */

function PasswordStep({ role, email, onBack, animDir }) {
  const { login } = useApp();
  const passwordRef = useRef(null);

  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [forgotOpen, setForgotOpen] = useState(false);

  // Captcha state (frontend-only decorative challenge)
  const [captchaCode, setCaptchaCode] = useState(() => generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState('');

  const roleData = ROLES.find(r => r.key === role);

  useEffect(() => {
    const timer = setTimeout(() => passwordRef.current?.focus(), 350);
    return () => clearTimeout(timer);
  }, []);

  const detectCaps = useCallback((e) => {
    if (typeof e.getModifierState === 'function') {
      setCapsLock(e.getModifierState('CapsLock'));
    }
  }, []);

  const refreshCaptcha = () => {
    setCaptchaCode(generateCaptcha());
    setCaptchaInput('');
    setCaptchaError('');
  };

  // Get initials from email for avatar
  const emailInitial = useMemo(() => {
    const name = email.split('@')[0] || '';
    if (name.includes('.')) {
      const parts = name.split('.');
      return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCaptchaError('');

    // Validate password
    if (!password) {
      setError('Please enter your password.');
      passwordRef.current?.focus();
      return;
    }

    // Validate captcha (frontend-only)
    if (captchaInput.trim().toLowerCase() !== captchaCode.toLowerCase()) {
      setCaptchaError('CAPTCHA does not match. Please try again.');
      refreshCaptcha();
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password, role);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
      refreshCaptcha();
      setCaptchaInput('');
    }
  };

  return (
    <div className={animDir === 'back' ? 'lg-step-back' : 'lg-step-enter'} key="password">
      {/* Role badge */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div className={`lg-step-badge ${roleData?.badgeClass || ''}`}>
          <ShieldCheck size={12} />
          <span>Secure Login</span>
        </div>
      </div>

      <h2 className="lg-screen-title">Enter Password</h2>
      <p className="lg-screen-subtitle">Verify your identity to continue</p>

      {/* User display */}
      <div className="lg-user-display">
        <div className="lg-user-display-avatar">{emailInitial}</div>
        <div className="lg-user-display-text">
          <div className="lg-user-display-id">{email}</div>
          <div className="lg-user-display-role">{roleData?.label || role}</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* Error */}
        {error && (
          <div className="lg-error" role="alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Password field */}
        <div className="lg-field">
          <label htmlFor="lg-password" className="lg-label">
            <Lock size={14} />
            Password
          </label>
          <div className="lg-input-wrap">
            <span className="lg-input-icon" aria-hidden="true">
              <Lock size={18} />
            </span>
            <input
              ref={passwordRef}
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
              onClick={() => setShowPw(v => !v)}
            >
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {capsLock && (
            <p className="lg-caps-warn" aria-live="polite">
              ⚠ Caps Lock is on
            </p>
          )}
        </div>

        {/* Forgot password */}
        <div className="lg-extras">
          <button
            type="button"
            className="lg-forgot-btn"
            onClick={() => setForgotOpen(v => !v)}
          >
            Forgot Password?
          </button>
        </div>

        {forgotOpen && (
          <div className="lg-forgot-msg" role="status">
            {FORGOT_MSG}
          </div>
        )}

        {/* CAPTCHA */}
        <div className="lg-captcha-box">
          <div className="lg-captcha-label">
            <ShieldCheck size={13} />
            Security Verification
          </div>
          <div className="lg-captcha-display">
            <div className="lg-captcha-text" aria-label="Captcha code">
              {captchaCode}
            </div>
            <button
              type="button"
              className="lg-captcha-refresh"
              onClick={refreshCaptcha}
              title="Generate new CAPTCHA"
              aria-label="Refresh CAPTCHA"
            >
              <RefreshCw size={16} />
            </button>
          </div>
          <input
            type="text"
            className={`lg-captcha-input${captchaError ? ' lg-captcha-input--error' : ''}`}
            placeholder="Enter the code above"
            value={captchaInput}
            onChange={(e) => { setCaptchaInput(e.target.value); setCaptchaError(''); }}
            autoComplete="off"
            aria-label="CAPTCHA input"
          />
          {captchaError && (
            <div className="lg-field-error" role="alert" style={{ marginTop: 6 }}>
              <AlertCircle size={12} />
              {captchaError}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="lg-btn-row">
          <button
            type="button"
            className="lg-btn lg-btn--back"
            onClick={onBack}
            disabled={submitting}
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <button
            type="submit"
            className="lg-btn lg-btn--primary"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="lg-spinner" />
                <span>Signing in…</span>
              </>
            ) : (
              <>
                <Lock size={16} />
                <span>LOGIN</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN LOGIN PAGE — 3-SCREEN ORCHESTRATOR
   ═══════════════════════════════════════════════════════════════ */

export default function LoginPage() {
  const [step, setStep] = useState(1);     // 1=role, 2=email, 3=password
  const [role, setRole] = useState('');     // 'faculty' | 'hod'
  const [email, setEmail] = useState('');
  const [animDir, setAnimDir] = useState('forward'); // 'forward' | 'back'

  const goForward = (nextStep) => {
    setAnimDir('forward');
    setStep(nextStep);
  };

  const goBack = (prevStep) => {
    setAnimDir('back');
    setStep(prevStep);
  };

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    goForward(2);
  };

  return (
    <div className="lg-root">
      {/* Background */}
      <div className="lg-bg" />
      <div className="lg-particles">
        <div className="lg-particle" />
        <div className="lg-particle" />
        <div className="lg-particle" />
        <div className="lg-particle" />
        <div className="lg-particle" />
        <div className="lg-particle" />
      </div>

      {/* Content */}
      <div className="lg-content">
        {/* Progress indicator */}
        <ProgressIndicator step={step} />

        {/* Main Card */}
        <main className="lg-card">
          <BrandHeader />

          <div className="lg-body">
            {step === 1 && (
              <RoleSelection
                onSelect={handleRoleSelect}
                animDir={animDir}
              />
            )}

            {step === 2 && (
              <EmployeeIdStep
                role={role}
                email={email}
                onEmailChange={setEmail}
                onNext={() => goForward(3)}
                onBack={() => goBack(1)}
                animDir={animDir}
              />
            )}

            {step === 3 && (
              <PasswordStep
                role={role}
                email={email}
                onBack={() => goBack(2)}
                animDir={animDir}
              />
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="lg-footer">
          © {new Date().getFullYear()} {BRAND.university} • {BRAND.fullName} • {BRAND.version}
        </footer>
      </div>
    </div>
  );
}
