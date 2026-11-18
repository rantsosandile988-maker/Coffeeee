
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context.jsx';
import './Login.css';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const { login } = useAuth();
  const nav = useNavigate();
  const from = useLocation().state?.from || '/menu';

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setErr('');

    try {
      const data = await api(`/auth/${mode === 'login' ? 'login' : 'register'}`, {
        method: 'POST',
        body: f
      });

      login(data);
      if (data.user.role === 'staff' || data.user.role === 'admin') {
  nav('/staff', { replace: true });
} else {
  nav(from, { replace: true });
}
    } catch (e2) {
      setErr(e2.message);
    }
  };

  return (
    <section className="login-page">
      <div className="login-card">

        <div className="login-image">
          <img src="/pancake.png" alt="Golden pancakes with honey" />
          <div className="image-overlay">
            <h1>Sweet mornings start here.</h1>
            <p>Fresh coffee, delicious pancakes and happy moments.</p>
          </div>
        </div>

        <div className="login-content">
          <div className="login-logo">☕</div>

          <p className="login-small">WELCOME TO OUR COFFEE SHOP</p>

          <h2>
            {mode === 'login' ? 'Welcome Back!' : 'Join Our Family'}
          </h2>

          <p className="login-description">
            {mode === 'login'
              ? 'Log in to enjoy your favourite treats.'
              : 'Create an account and start ordering.'}
          </p>

          <form onSubmit={submit} className="login-form">

            {mode === 'register' && (
              <label>
                Full Name
                <input
                  value={f.name}
                  onChange={set('name')}
                  placeholder="Enter your name"
                  required
                />
              </label>
            )}

            <label>
              Email Address
              <input
                type="email"
                value={f.email}
                onChange={set('email')}
                placeholder="Enter your email"
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={f.password}
                onChange={set('password')}
                placeholder="Enter your password"
                minLength={6}
                required
              />
            </label>

            {err && <p className="error">{err}</p>}

            <button className="login-btn">
              {mode === 'login' ? 'Log In' : 'Create Account'}
            </button>
          </form>

          <p className="login-switch">
            {mode === 'login'
              ? "Don't have an account?"
              : 'Already have an account?'}

            <button
              className="login-link"
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setErr('');
              }}
            >
              {mode === 'login' ? ' Sign Up' : ' Log In'}
            </button>
          </p>

          <p className="login-footer">Made with love and a little honey ♡</p>
        </div>

      </div>
    </section>
  );
}
