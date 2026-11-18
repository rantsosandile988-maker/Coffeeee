
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const httpError = (status, message) =>
  Object.assign(new Error(message), { status });

export const wrap = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// VERIFY USER LOGIN
export const protect = wrap(async (req, res, next) => {

  const token = (req.headers.authorization || '').replace('Bearer ', '');

  if (!token) {
    throw httpError(401, 'Please log in first');
  }

  let payload;

  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw httpError(401, 'Session expired, please log in again');
  }

  req.user = await User.findById(payload.id).select('-password');

  if (!req.user) {
    throw httpError(401, 'Account not found');
  }

  next();
});

// STAFF AND ADMIN ACCESS
export const staffOnly = (req, res, next) => {
  if (['staff', 'admin'].includes(req.user?.role)) {
    return next();
  }

  next(httpError(403, 'Staff access only'));
};

// ADMIN ACCESS ONLY
export const adminOnly = (req, res, next) => {
  if (req.user?.role === 'admin') {
    return next();
  }

  next(httpError(403, 'Administrator access only'));
};

// ERROR HANDLER
export const errorHandler = (err, req, res, next) => {

  if (err.name === 'CastError') {
    err.status = 400;
    err.message = 'Invalid id';
  }

  if (err.code === 11000) {
    err.status = 409;
    err.message = 'That value already exists';
  }

  if (!err.status) console.error(err);

  res.status(err.status || 500).json({
    message: err.status ? err.message : 'Server error'
  });
};
