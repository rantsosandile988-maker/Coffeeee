import { Link, Navigate, useLocation } from 'react-router-dom';
import { money } from '../api.js';

export default function Confirmation() {
  const order = useLocation().state?.order;
  if (!order) return <Navigate to="/menu" replace />;
  return (
    <section className="wrap narrow">
      <h1>Order placed, {order.customerName}</h1>
      <p>Your order number is</p>
      <p className="ordno">{order.orderNumber}</p>
      {order.items.map((i) => <div className="line" key={i._id}><span>{i.quantity} × {i.name}</span><strong>{money(i.price * i.quantity)}</strong></div>)}
      <p className="total">Total <strong>{money(order.total)}</strong></p>
      <p className="muted">Status: {order.status}. Show this number at the counter.</p>
      <Link to="/menu" className="btn">Order something else</Link>
    </section>
  );
}