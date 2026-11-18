
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useCart } from '../context.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const nav = useNavigate();

  const firstName = user?.name
    ? user.name.split(' ')[0]
    : user?.email
      ? user.email.split('@')[0]
      : 'Account';

  return (
    <header className="nav">
      <Link to="/" className="logo">Bean There</Link>

      <nav>
        <Link to="/menu">Menu</Link>

        {['staff', 'admin'].includes(user?.role) && (
          <Link to="/staff">Dashboard</Link>
        )}

        <Link to="/cart">
          Cart{count > 0 && ` (${count})`}
        </Link>

        {user ? (
          <button
            className="link"
            onClick={() => {
              logout();
              nav('/');
            }}
          >
            Log out ({firstName})
          </button>
        ) : (
          <Link to="/login" className="btn small">
            Log in
          </Link>
        )}
      </nav>
    </header>
  );
}
