// Run once: npm run seed  -> creates the staff account and sample menu items
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import MenuItem from './models/MenuItem.js';

await mongoose.connect(process.env.MONGODB_URI);
const email = (process.env.STAFF_EMAIL || 'staff@coffee.com').toLowerCase();
if (!(await User.findOne({ email })))
  await User.create({ name: 'Staff', email, role: 'staff', password: await bcrypt.hash(process.env.STAFF_PASSWORD || 'ChangeMe123', 10) });
if (!(await MenuItem.countDocuments()))
  await MenuItem.insertMany([
    { name: 'Cappuccino', description: 'Espresso with steamed milk and thick foam', price: 38, category: 'Coffee', likes: 12 },
    { name: 'Flat White', description: 'Double espresso, silky microfoam', price: 40, category: 'Coffee', likes: 9 },
    { name: 'Iced Latte', description: 'Cold milk, espresso, ice', price: 42, category: 'Coffee', likes: 7 },
    { name: 'Rooibos Tea', description: 'Caffeine-free, served hot', price: 25, category: 'Tea', likes: 4 },
    { name: 'Butter Croissant', description: 'Baked fresh each morning', price: 30, category: 'Pastries', likes: 10 },
    { name: 'Blueberry Muffin', description: 'Soft, with real blueberries', price: 28, category: 'Pastries', likes: 3 },
  ]);
console.log('Seed done. Staff login:', email);
process.exit(0);