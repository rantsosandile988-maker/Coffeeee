import { useEffect, useState } from 'react';
import { api } from '../api.js';
import ItemCard from '../components/ItemCard.jsx';

export default function Menu() {
  const [items, setItems] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => { api('/menu').then(setItems).catch((e) => setErr(e.message)); }, []);
  const cats = [...new Set((items || []).map((i) => i.category))];
  return (
    <div className="menu-page">
      <div className="hero banner"><h1>Our menu</h1></div>
      <section className="wrap">
        {err && <p className="error">{err}</p>}
        {!items && !err && <p className="muted">Loading menu…</p>}
        {cats.map((c) => (
          <div key={c}>
            <h2>{c}</h2>
            <div className="grid">{items.filter((i) => i.category === c).map((i) => <ItemCard key={i._id} item={i} />)}</div>
          </div>
        ))}
      </section>
    </div>
  );
}