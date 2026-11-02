const TITLES = new Set(['dr', 'prof', 'mr', 'mrs', 'ms']);

export function getInitials(fullName) {
  const words = fullName.trim().split(/\s+/);
  const nameWords = words.filter(word => !TITLES.has(word.replace(/\.$/, '').toLowerCase()));
  const parts = nameWords.length > 0 ? nameWords : words;
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return `${first}${last}`.toUpperCase();
}
