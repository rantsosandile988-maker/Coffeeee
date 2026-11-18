
import { Router } from 'express';
import mongoose from 'mongoose';
import Order, { STATUSES } from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import { protect, staffOnly, wrap, httpError } from '../middleware/auth.js';

const r = Router();

// CREATE A CUSTOMER ORDER
r.post('/', protect, wrap(async (req, res) => {
  const { items, notes = '' } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    throw httpError(400, 'Your cart is empty');
  }

  // Combine duplicate products and validate quantities
  const quantities = new Map();

  for (const item of items) {
    const id = item.menuItem || item.item?._id || item._id;
    const quantity = Number(item.quantity);

    if (!mongoose.isValidObjectId(id)) {
      throw httpError(400, 'Invalid product');
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      throw httpError(400, 'Invalid product quantity');
    }

    quantities.set(
      String(id),
      (quantities.get(String(id)) || 0) + quantity
    );
  }

  const reserved = [];

  try {
    const orderItems = [];
    let total = 0;

    // Check and reserve stock for every product
    for (const [id, quantity] of quantities) {
      const product = await MenuItem.findOneAndUpdate(
        {
          _id: id,
          available: true,
          stock: { $gte: quantity }
        },
        {
          $inc: { stock: -quantity }
        },
        { new: true }
      );

      if (!product) {
        const existing = await MenuItem.findById(id)
          .select('name available stock');

        console.log('ORDER STOCK CHECK FAILED:', {
          id,
          product: existing,
          requestedQuantity: quantity
        });

        if (!existing) {
          throw httpError(404, 'Product not found in the database');
        }

        if (existing.available !== true) {
          throw httpError(
            409,
            `${existing.name} is currently unavailable`
          );
        }

        if (Number(existing.stock ?? 0) < quantity) {
          throw httpError(
            409,
            `${existing.name} has only ${existing.stock ?? 0} in stock`
          );
        }

        throw httpError(
          409,
          'Could not reserve this product. Please try again.'
        );
      }

      reserved.push({ id, quantity });

      // Mark product unavailable when stock reaches zero
      if (product.stock === 0) {
        await MenuItem.updateOne(
          { _id: id },
          { $set: { available: false } }
        );
      }

      orderItems.push({
        menuItem: product._id,
        name: product.name,
        price: product.price,
        quantity
      });

      total += product.price * quantity;
    }

    // Save completed order
    const order = await Order.create({
      orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      user: req.user._id,
      customerName: req.user.name,
      notes: String(notes),
      items: orderItems,
      total
    });

    res.status(201).json(order);

  } catch (error) {
    // Restore reserved stock if order creation fails
    await Promise.all(
      reserved.map(({ id, quantity }) =>
        MenuItem.updateOne(
          { _id: id },
          {
            $inc: { stock: quantity },
            $set: { available: true }
          }
        )
      )
    );

    throw error;
  }
}));

// GET ORDERS
// Staff and admins see all orders.
// Customers see only their own orders.
r.get('/', protect, wrap(async (req, res) => {
  const filter = ['staff', 'admin'].includes(req.user.role)
    ? {}
    : { user: req.user._id };

  const orders = await Order.find(filter)
    .sort({ createdAt: -1 });

  res.json(orders);
}));

// TODAY'S ORDER AND SALES SUMMARY
r.get('/summary/today', protect, staffOnly, wrap(async (req, res) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const orders = await Order.find({
    createdAt: { $gte: start, $lt: end }
  });

  const byStatus = {};

  STATUSES.forEach((status) => {
    byStatus[status] = 0;
  });

  let revenue = 0;

  orders.forEach((order) => {
    revenue += order.total;
    byStatus[order.status]++;
  });

  res.json({
    count: orders.length,
    revenue,
    byStatus
  });
}));

// UPDATE ORDER STATUS (STAFF AND ADMIN)
r.patch('/:id/status', protect, staffOnly, wrap(async (req, res) => {
  const { status } = req.body;

  if (!STATUSES.includes(status)) {
    throw httpError(400, 'Invalid order status');
  }

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  if (!order) {
    throw httpError(404, 'Order not found');
  }

  res.json(order);
}));

export default r;
