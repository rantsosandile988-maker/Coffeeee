
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Menu from './pages/Menu.jsx';
import Login from './pages/Login.jsx';
import Cart from './pages/Cart.jsx';
import Confirmation from './pages/Confirmation.jsx';
import Staff from './pages/Staff.jsx';
import { useAuth } from './context.jsx';

function Guard({ roles, children }) {
  const { user } = useAuth();
  const loc = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <>
      <Navbar />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/cart"
            element={<Guard><Cart /></Guard>}
          />

          <Route
            path="/confirmation"
            element={<Guard><Confirmation /></Guard>}
          />

          <Route
            path="/staff"
            element={
              <Guard roles={['staff', 'admin']}>
                <Staff />
              </Guard>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
