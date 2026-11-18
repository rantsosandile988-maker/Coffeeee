import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, money } from '../api.js';
import { useAuth, useCart } from '../context.jsx';

const icon = { Coffee: '☕', Tea: '🍵', Pastries: '🥐', Other: '🍽️' };
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export default function ItemCard({ item }) {
  const { user } = useAuth();
  const { add } = useCart();
  const nav = useNavigate();
  const [likes, setLikes] = useState(item.likes);
  const [added, setAdded] = useState(false);
  const [broken, setBroken] = useState(false);

  // Photo: the image URL staff entered, otherwise /images/<item-name>.png
  const src = item.image || `/images/${slug(item.name)}.png`;

  const needLogin = () => nav('/login', { state: { from: '/menu' } });
  const order = () => {
    if (!user) return needLogin();
    add(item); setAdded(true); setTimeout(() => setAdded(false), 1200);
  };
  const like = async () => {
    if (!user) return needLogin();
    try { setLikes((await api(`/menu/${item._id}/like`, { method: 'POST' })).likes); } catch { /* ignore */ }
  };

  return (
    <article className={`card ${item.available ? '' : 'off'}`}>
      {broken
        ? <div className="ph">{icon[item.category]}</div>
        : <img key={src} src={src} alt={item.name} onError={() => setBroken(true)} />}
      <div className="body">
        <div className="row"><h3>{item.name}</h3><strong>{money(item.price)}</strong></div>
        <p>{item.description}</p>
        <div className="row">
          <button className="link" onClick={like} aria-label={`Like ${item.name}`}>♥ {likes}</button>
          {item.available
            ? <button className="btn small" onClick={order}>{added ? 'Added' : user ? 'Add to order' : 'Log in to order'}</button>
            : <span className="muted">Sold out</span>}
        </div>
      </div>
    </article>
  );
}