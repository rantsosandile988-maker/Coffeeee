
import { Router } from 'express';
import MenuItem, { CATEGORIES } from '../models/MenuItem.js';
import {
  wrap,
  httpError,
  protect,
  staffOnly
} from '../middleware/auth.js';

const r = Router();

const pub = '-likedBy';

// CLEAN AND VALIDATE PRODUCT DATA
const clean = (b, partial = false) => {
  const d = {};

  if (!partial || b.name !== undefined) {
    if (typeof b.name !== 'string' || !b.name.trim()) {
      throw httpError(400, 'Name is required');
    }

    d.name = b.name.trim();
  }

  if (!partial || b.price !== undefined) {
    const price = Number(b.price);

    if (
      b.price === '' ||
      b.price === undefined ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      throw httpError(400, 'Price must be 0 or more');
    }

    d.price = price;
  }

  if (b.category !== undefined) {
    if (!CATEGORIES.includes(b.category)) {
      throw httpError(400, 'Invalid category');
    }

    d.category = b.category;
  }

  if (b.description !== undefined) {
    d.description = String(b.description);
  }

  if (b.image !== undefined) {
    d.image = String(b.image);
  }

  // VALIDATE AND SAVE STOCK
  if (b.stock !== undefined) {
    const stock = Number(b.stock);

    if (
      b.stock === '' ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      throw httpError(
        400,
        'Stock must be a whole number of 0 or more'
      );
    }

    d.stock = stock;

    // Automatically make products available when stock is increased,
    // unless the staff member explicitly chooses otherwise.
    if (b.available === undefined) {
      d.available = stock > 0;
    }
  }

  // SAVE AVAILABILITY
  if (b.available !== undefined) {
    if (typeof b.available !== 'boolean') {
      throw httpError(400, 'Invalid availability value');
    }

    d.available = b.available;
  }

  return d;
};

// GET ALL MENU ITEMS
r.get('/', wrap(async (req, res) => {
  const query = req.query.popular
    ? MenuItem.find({ available: true, stock: { $gt: 0 } })
        .sort({ likes: -1, name: 1 })
        .limit(4)
    : MenuItem.find().sort({ category: 1, name: 1 });

  const products = await query.select(pub);

  res.json(products);
}));

// GET ONE MENU ITEM
r.get('/:id', wrap(async (req, res) => {
  if (!/^[a-fA-F0-9]{24}$/.test(req.params.id)) {
    throw httpError(400, 'Invalid product id');
  }

  const item = await MenuItem.findById(req.params.id).select(pub);

  if (!item) {
    throw httpError(404, 'Menu item not found');
  }

  res.json(item);
}));

// ADD A NEW MENU ITEM (STAFF AND ADMIN)
r.post('/', protect, staffOnly, wrap(async (req, res) => {
  const data = clean(req.body);

  const item = await MenuItem.create(data);

  res.status(201).json(item);
}));

// EDIT A MENU ITEM (STAFF AND ADMIN)
r.put('/:id', protect, staffOnly, wrap(async (req, res) => {
  if (!/^[a-fA-F0-9]{24}$/.test(req.params.id)) {
    throw httpError(400, 'Invalid product id');
  }

  const data = clean(req.body, true);

  const item = await MenuItem.findByIdAndUpdate(
    req.params.id,
    { $set: data },
    {
      new: true,
      runValidators: true
    }
  ).select(pub);

  if (!item) {
    throw httpError(404, 'Menu item not found');
  }

  res.json(item);
}));

// DELETE A MENU ITEM (STAFF AND ADMIN)
r.delete('/:id', protect, staffOnly, wrap(async (req, res) => {
  if (!/^[a-fA-F0-9]{24}$/.test(req.params.id)) {
    throw httpError(400, 'Invalid product id');
  }

  const item = await MenuItem.findByIdAndDelete(req.params.id);

  if (!item) {
    throw httpError(404, 'Menu item not found');
  }

  res.json({ message: 'Menu item deleted successfully' });
}));

// LIKE OR UNLIKE A MENU ITEM
r.post('/:id/like', protect, wrap(async (req, res) => {
  if (!/^[a-fA-F0-9]{24}$/.test(req.params.id)) {
    throw httpError(400, 'Invalid product id');
  }

  const item = await MenuItem.findById(req.params.id);

  if (!item) {
    throw httpError(404, 'Menu item not found');
  }

  const index = item.likedBy.findIndex(
    (userId) => userId.equals(req.user._id)
  );

  if (index >= 0) {
    item.likedBy.splice(index, 1);
  } else {
    item.likedBy.push(req.user._id);
  }

  item.likes = item.likedBy.length;

  await item.save();

  res.json({
    likes: item.likes,
    liked: index < 0
  });
}));

export default r;
