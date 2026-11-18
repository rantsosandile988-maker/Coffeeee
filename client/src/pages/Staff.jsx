
import { useEffect, useState } from 'react';
import { api, money } from '../api.js';

const STATUSES = ['Pending', 'Preparing', 'Ready', 'Collected'];
const CATS = ['Coffee', 'Tea', 'Pastries', 'Other'];

const blank = {
  name: '',
  description: '',
  price: '',
  stock: 0,
  category: 'Coffee',
  image: '',
  available: true
};

export default function Staff() {
  const [tab, setTab] = useState('orders');

  return (
    <div className="menu-page staff-page">
      <div className="hero banner">
        <h1>Staff dashboard</h1>
      </div>

      <section className="wrap">
        <div className="tabs">
          {['orders', 'menu'].map((t) => (
            <button
              key={t}
              className={tab === t ? 'on' : ''}
              onClick={() => setTab(t)}
            >
              {t === 'orders' ? 'Orders' : 'Menu items'}
            </button>
          ))}
        </div>

        {tab === 'orders' ? <Orders /> : <MenuManager />}
      </section>
    </div>
  );
}

function Orders() {
  const [orders, setOrders] = useState([]);
  const [sum, setSum] = useState(null);
  const [err, setErr] = useState('');

  const load = () =>
    Promise.all([
      api('/orders'),
      api('/orders/summary/today')
    ])
      .then(([o, s]) => {
        setOrders(o);
        setSum(s);
        setErr('');
      })
      .catch((e) => setErr(e.message));

  useEffect(() => {
    load();
  }, []);

  const setStatus = (id, status) => {
    api(`/orders/${id}/status`, {
      method: 'PATCH',
      body: { status }
    })
      .then(load)
      .catch((e) => setErr(e.message));
  };

  return (
    <>
      {sum && (
        <div className="stats">
          <div>
            <strong>{sum.count}</strong> orders today
          </div>

          <div>
            <strong>{money(sum.revenue)}</strong> revenue today
          </div>

          {STATUSES.map((s) => (
            <div key={s}>
              <strong>{sum.byStatus?.[s] || 0}</strong> {s.toLowerCase()}
            </div>
          ))}
        </div>
      )}

      {err && <p className="error">{err}</p>}

      {orders.length === 0 && !err && (
        <p className="muted">No orders yet.</p>
      )}

      {orders.map((o) => (
        <div className="order" key={o._id}>
          <div className="row">
            <strong>{o.orderNumber}</strong>
            <span className={`badge ${o.status.toLowerCase()}`}>
              {o.status}
            </span>
          </div>

          <p className="muted">
            {new Date(o.createdAt).toLocaleString()}
          </p>

          <p>
            {o.customerName}:{' '}
            {o.items.map((i) => `${i.quantity} × ${i.name}`).join(', ')}
            {o.notes && <em> ({o.notes})</em>}
          </p>

          <div className="row">
            <strong>{money(o.total)}</strong>

            <select
              value={o.status}
              onChange={(e) => setStatus(o._id, e.target.value)}
            >
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      ))}
    </>
  );
}

function MenuManager() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [err, setErr] = useState('');

  const load = () =>
    api('/menu')
      .then(setItems)
      .catch((e) => setErr(e.message));

  useEffect(() => {
    load();
  }, []);

  const set = (k) => (e) => {
    setForm({
      ...form,
      [k]:
        e.target.type === 'checkbox'
          ? e.target.checked
          : e.target.value
    });
  };

  const save = async (e) => {
    e.preventDefault();
    setErr('');

    try {
      const data = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock)
      };

      await api(
        editing ? `/menu/${editing}` : '/menu',
        {
          method: editing ? 'PUT' : 'POST',
          body: data
        }
      );

      setForm(blank);
      setEditing(null);
      load();
    } catch (e2) {
      setErr(e2.message);
    }
  };

  const edit = (i) => {
    setEditing(i._id);

    setForm({
      name: i.name,
      description: i.description || '',
      price: i.price,
      stock: i.stock ?? 0,
      category: i.category,
      image: i.image || '',
      available: i.available
    });

    window.scrollTo(0, 0);
  };

  const del = async (i) => {
    if (!confirm(`Delete ${i.name}?`)) return;

    try {
      await api(`/menu/${i._id}`, {
        method: 'DELETE'
      });

      load();
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <>
      <form onSubmit={save} className="form">
        <h2>{editing ? 'Edit item' : 'Add a menu item'}</h2>

        <label>
          Name
          <input
            value={form.name}
            onChange={set('name')}
            required
          />
        </label>

        <label>
          Description
          <input
            value={form.description}
            onChange={set('description')}
          />
        </label>

        <label>
          Price
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={set('price')}
            required
          />
        </label>

        <label>
          Category
          <select
            value={form.category}
            onChange={set('category')}
          >
            {CATS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>

        <label>
          Stock quantity
          <input
            type="number"
            min="0"
            step="1"
            value={form.stock}
            onChange={set('stock')}
            required
          />
        </label>

        <label>
          Image URL (optional)
          <input
            value={form.image}
            onChange={set('image')}
          />
        </label>

        <label className="check">
          <input
            type="checkbox"
            checked={form.available}
            onChange={set('available')}
          />
          Available for customers
        </label>

        {err && <p className="error">{err}</p>}

        <div className="row">
          <button className="btn">
            {editing ? 'Save changes' : 'Add item'}
          </button>

          {editing && (
            <button
              type="button"
              className="link"
              onClick={() => {
                setEditing(null);
                setForm(blank);
                setErr('');
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="manage-grid">
        {items.map((i) => (
          <div className="order" key={i._id}>
            <div className="row">
              <strong>{i.name}</strong>
              <span>{money(i.price)}</span>
            </div>

            <p className="muted">
              {i.category} · ♥ {i.likes}
            </p>

            <p>
              Stock: <strong>{i.stock ?? 0}</strong>
            </p>

            {(i.stock ?? 0) === 0 ? (
              <p className="error">Out of stock</p>
            ) : (
              <p className="muted">
                {i.available ? 'Available' : 'Not available'}
              </p>
            )}

            <div className="row">
              <button
                className="link"
                onClick={() => edit(i)}
              >
                Edit
              </button>

              <button
                className="link danger"
                onClick={() => del(i)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
