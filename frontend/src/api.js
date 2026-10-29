const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export function guardarToken(token) {
  if (token) sessionStorage.setItem('token', token);
  else sessionStorage.removeItem('token');
}

export const hayToken = () => Boolean(sessionStorage.getItem('token'));

export async function api(ruta, { metodo = 'GET', cuerpo } = {}) {
  const token = sessionStorage.getItem('token');
  const res = await fetch(BASE + ruta, {
    method: metodo,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined
  });
  const datos = await res.json().catch(() => ({}));
  if (res.status === 401 && token) guardarToken(null);
  if (!res.ok) throw new Error(datos.error || `Error ${res.status}`);
  return datos;
}
