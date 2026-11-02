import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);
const COST = { N: 16384, r: 8, p: 1 };
const KEY_LENGTH = 64;

export async function hashPassword(password) {
  const salt = randomBytes(16);
  const key = await scryptAsync(password, salt, KEY_LENGTH, COST);
  return `scrypt$${COST.N}$${COST.r}$${COST.p}$${salt.toString('base64')}$${key.toString('base64')}`;
}

export async function verifyPassword(password, stored) {
  const [, N, r, p, salt, key] = stored.split('$');
  const expected = Buffer.from(key, 'base64');
  const actual = await scryptAsync(password, Buffer.from(salt, 'base64'), expected.length, {
    N: Number(N),
    r: Number(r),
    p: Number(p)
  });
  return timingSafeEqual(actual, expected);
}

const DUMMY_HASH = await hashPassword(randomBytes(16).toString('hex'));

// Spends the same time as a real check so login timing doesn't reveal which emails exist.
export async function burnPasswordCheck(password) {
  await verifyPassword(password, DUMMY_HASH);
}
