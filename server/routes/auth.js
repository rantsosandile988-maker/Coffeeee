import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { wrap, httpError, protect } from '../middleware/auth.js';

const r = Router();
const sign = (u) => ({
  token: jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: '7d' }),
  user: { id: u._id, name: u.name, email: u.email, role: u.role },
});

r.post('/register', wrap(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name?.trim() || !/^\S+@\S+\.\S+$/.test(email || '')) throw httpError(400, 'Enter a name and a valid email');
  if (!password || password.length < 6) throw httpError(400, 'Password must be at least 6 characters');
  const user = await User.create({ name, email, password: await bcrypt.hash(password, 10) }); // always a customer
  res.status(201).json(sign(user));
}));

r.post('/login', wrap(async (req, res) => {
  const user = await User.findOne({ email: (req.body.email || '').toLowerCase() });
  if (!user || !(await bcrypt.compare(req.body.password || '', user.password)))
    throw httpError(401, 'Wrong email or password');
  res.json(sign(user));
}));

r.get('/me', protect, (req, res) => res.json({ user: req.user }));
export default r;