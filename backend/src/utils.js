import crypto from "node:crypto";

export const id = (prefix = "id") => `${prefix}_${crypto.randomUUID()}`;

export const publicUser = (user) => {
  if (!user) return null;
  const { passwordHash, ...safe } = user;
  return safe;
};

export const paginate = (items, page = 1, limit = 12) => {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 12, 1), 100);
  const start = (safePage - 1) * safeLimit;
  return {
    items: items.slice(start, start + safeLimit),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total: items.length,
      pages: Math.max(Math.ceil(items.length / safeLimit), 1)
    }
  };
};

export const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const send = (res, data, message = "Success", status = 200) =>
  res.status(status).json({ success: true, message, data });

export const fail = (res, message, status = 400, errors) =>
  res.status(status).json({ success: false, message, ...(errors ? { errors } : {}) });

export const asyncRoute = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

export const daysFromNow = (days) =>
  new Date(Date.now() + days * 86400000).toISOString();
