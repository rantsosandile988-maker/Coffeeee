import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import auth from './routes/auth.js';
import menu from './routes/menu.js';
import orders from './routes/orders.js';
import { errorHandler } from './middleware/auth.js';

for (const k of ['MONGODB_URI', 'JWT_SECRET']) if (!process.env[k]) { console.error(`Missing ${k} in .env`); process.exit(1); }

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));
app.use('/api/auth', auth);
app.use('/api/menu', menu);
app.use('/api/orders', orders);
app.use('/api', (req, res) => res.status(404).json({ message: 'Endpoint not found' }));
app.use(errorHandler);

await mongoose.connect(process.env.MONGODB_URI);
console.log('MongoDB connected');
app.listen(process.env.PORT || 5000, () => console.log('API running'));
