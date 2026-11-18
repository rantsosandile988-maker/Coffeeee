import mongoose from 'mongoose';
export const STATUSES = ['Pending', 'Preparing', 'Ready', 'Collected'];
const schema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customerName: { type: String, required: true, trim: true },
  notes: { type: String, default: '' },
  items: [{
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
    name: String, price: Number, quantity: Number,
  }],
  total: { type: Number, required: true },
  status: { type: String, enum: STATUSES, default: 'Pending' },
}, { timestamps: true });
export default mongoose.model('Order', schema);