import { createContext, useContext, useState } from 'react';

const AuthCtx = createContext();
const CartCtx = createContext();
export const useAuth = () => useContext(AuthCtx);
export const useCart = () => useContext(CartCtx);

export function Providers({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const [cart, setCart] = useState([]); // [{ item, quantity }]

  const login = ({ token, user }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  };
  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null); setCart([]); };

  const add = (item) => setCart((c) => c.some((l) => l.item._id === item._id)
    ? c.map((l) => (l.item._id === item._id ? { ...l, quantity: Math.min(20, l.quantity + 1) } : l))
    : [...c, { item, quantity: 1 }]);
  const setQty = (id, q) => setCart((c) => c.map((l) => (l.item._id === id ? { ...l, quantity: q } : l)).filter((l) => l.quantity > 0));
  const total = cart.reduce((s, l) => s + l.item.price * l.quantity, 0);
  const count = cart.reduce((s, l) => s + l.quantity, 0);

  return (
    <AuthCtx.Provider value={{ user, login, logout }}>
      <CartCtx.Provider value={{ cart, add, setQty, clear: () => setCart([]), total, count }}>{children}</CartCtx.Provider>
    </AuthCtx.Provider>
  );
}