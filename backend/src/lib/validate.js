import { DAYS_OF_WEEK, PERIODS } from '../constants.js';
import { badRequest } from './errors.js';

const MAX_TEXT_LENGTH = 500;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 200;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function requireText(value, field) {
  if (typeof value !== 'string' || !value.trim()) throw badRequest(`${field} is required.`);
  if (value.length > MAX_TEXT_LENGTH) throw badRequest(`${field} is too long.`);
  return value.trim();
}

export function optionalText(value, field, fallback = null) {
  if (value === undefined || value === null || value === '') return fallback;
  return requireText(value, field);
}

export function requireEmail(value) {
  const email = requireText(value, 'Email').toLowerCase();
  if (!EMAIL_PATTERN.test(email)) throw badRequest('Enter a valid email address.');
  return email;
}

export function requirePassword(value, field = 'Password') {
  if (typeof value !== 'string' || value.length < MIN_PASSWORD_LENGTH) {
    throw badRequest(`${field} must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }
  if (value.length > MAX_PASSWORD_LENGTH) throw badRequest(`${field} is too long.`);
  return value;
}

export function requireDay(value) {
  if (!DAYS_OF_WEEK.includes(value)) throw badRequest('Invalid day of week.');
  return value;
}

export function requireDate(value) {
  const parsed = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00Z`) : null;
  if (!parsed || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw badRequest('Invalid date. Use YYYY-MM-DD.');
  }
  return value;
}

export function requirePeriod(value) {
  const period = PERIODS.find(p => p.id === Number(value));
  if (!period) throw badRequest(`Invalid lecture period: ${value}.`);
  return period;
}

export function requireOneOf(value, allowed, field) {
  if (!allowed.includes(value)) throw badRequest(`${field} must be one of: ${allowed.join(', ')}.`);
  return value;
}
