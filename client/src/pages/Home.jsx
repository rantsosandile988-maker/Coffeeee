import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import ItemCard from '../components/ItemCard.jsx';

export default function Home() {
  const [items, setItems] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => { api('/menu?popular=1').then(setItems).catch((e) => setErr(e.message)); }, []);
  return (
    <>
      <section className="hero">
        <h1>Good coffee, ready when you are.</h1>
        <p>Browse the menu, log in, and order ahead. We'll have it waiting.</p>
        <Link to="/menu" className="btn">See the full menu</Link>
      </section>
      <section className="wrap">
        <h2>Most loved</h2>
        {err && <p className="error">{err}. Is the backend running?</p>}
        {!items && !err && <p className="muted">Loading favourites…</p>}
        {items?.length === 0 && <p className="muted">No items yet. Staff can add some from the dashboard.</p>}
        <div className="grid">{items?.map((i) => <ItemCard key={i._id} item={i} />)}</div>
      </section>
    </>
  );
}