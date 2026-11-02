import { badRequest } from './errors.js';

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

function parsePositiveInt(value, field, fallback) {
  if (value === undefined) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) throw badRequest(`${field} must be a positive whole number.`);
  return parsed;
}

export function parsePagination(query) {
  return {
    page: parsePositiveInt(query.page, 'page', 1),
    pageSize: Math.min(parsePositiveInt(query.pageSize, 'pageSize', DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE)
  };
}

export function parseSort(query, columns, defaultSort) {
  const key = query.sort ?? defaultSort.key;
  const column = columns[key];
  if (!column) throw badRequest(`sort must be one of: ${Object.keys(columns).join(', ')}.`);
  const order = query.order ?? defaultSort.order;
  if (order !== 'asc' && order !== 'desc') throw badRequest('order must be asc or desc.');
  return `${column} ${order.toUpperCase()}`;
}

export function likePattern(term) {
  return `%${term.replace(/[\\%_]/g, char => `\\${char}`)}%`;
}

export function queryPage(db, { table, where = [], params = [], orderBy, page, pageSize, map }) {
  const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
  const { total } = db.prepare(`SELECT COUNT(*) AS total FROM ${table} ${whereSql}`).get(...params);
  const rows = db
    .prepare(`SELECT * FROM ${table} ${whereSql} ORDER BY ${orderBy} LIMIT ? OFFSET ?`)
    .all(...params, pageSize, (page - 1) * pageSize);
  return {
    items: rows.map(map),
    meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) }
  };
}
