import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, money } from '../api.js';
import { useAuth, useCart } from '../context.jsx';

export default function Cart() {
  const { user } = useAuth();
  const { cart, setQty, clear, total } = useCart();
  const [name, setName] = useState(user.name);
  const [notes, setNotes] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();

  if (!cart.length) return <section className="wrap"><h1>Your order</h1><p className="muted">Nothing here yet. <Link to="/menu">Browse the menu</Link>.</p></section>;

  const place = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true);
    try {
      const order = await api('/orders', { method: 'POST', body: { customerName: name, notes, items: cart.map((l) => ({ menuItem: l.item._id, quantity: l.quantity })) } });
      clear(); nav('/confirmation', { state: { order } });
    } catch (e2) { setErr(e2.message); setBusy(false); }
  };

  return (
    <section className="wrap narrow">
      <h1>Your order</h1>
      {cart.map((l) => (
        <div className="line" key={l.item._id}>
          <span>{l.item.name}<br /><small className="muted">{money(l.item.price)} each</small></span>
          <span className="qty">
            <button onClick={() => setQty(l.item._id, l.quantity - 1)} aria-label="Fewer">−</button>
            {l.quantity}
            <button onClick={() => setQty(l.item._id, Math.min(20, l.quantity + 1))} aria-label="More">+</button>
          </span>
          <strong>{money(l.item.price * l.quantity)}</strong>
        </div>
      ))}
      <p className="total">Total <strong>{money(total)}</strong></p>
      <form onSubmit={place} className="form">
        <label>Name for the order<input value={name} onChange={(e) => setName(e.target.value)} required /></label>
        <label>Notes (optional)<textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. oat milk, no sugar" /></label>
        {err && <p className="error">{err}</p>}
        <button className="btn" disabled={busy}>{busy ? 'Placing order…' : 'Place order'}</button>
      </form>
    </section>
  );
}