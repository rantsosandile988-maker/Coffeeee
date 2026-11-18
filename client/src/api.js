
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export async function api(path, { method = 'GET', body } = {}) {
  const token = localStorage.getItem('token');

  let res;

  try {
    res = await fetch(`${BASE}/api${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: body ? JSON.stringify(body) : undefined
    });
  } catch (error) {
    throw new Error(
      'Cannot connect to the server. Check that your backend is running on port 5000.'
    );
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

export const money = (n) => `M${Number(n).toFixed(2)}`;
