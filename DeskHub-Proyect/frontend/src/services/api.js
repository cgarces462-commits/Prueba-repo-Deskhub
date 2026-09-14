const BASE = '/api';
const TOKEN_KEY = 'deskhub_token';
const USUARIO_KEY = 'deskhub_usuario';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getSesion() {
  const token = getToken();
  const bruto = localStorage.getItem(USUARIO_KEY);
  if (!token || !bruto) return null;
  try {
    return { token, usuario: JSON.parse(bruto) };
  } catch {
    cerrarSesion();
    return null;
  }
}

export function guardarSesion(token, usuario) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario));
}

export function cerrarSesion() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USUARIO_KEY);
}

async function pedir(ruta, { method = 'GET', body, auth = true } = {}) {
  const headers = {};
  const esFormData = body instanceof FormData;
  if (body !== undefined && !esFormData) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${ruta}`, {
    method,
    headers,
    body: body !== undefined ? (esFormData ? body : JSON.stringify(body)) : undefined,
  });

  let data = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    if (res.status === 401 && auth) {
      cerrarSesion();
      window.dispatchEvent(new Event('deskhub:sesion-expirada'));
    }
    throw new Error(data.mensaje || `Error ${res.status}`);
  }

  return data;
}

export const api = {
  login: (credenciales) =>
    pedir('/auth/login', { method: 'POST', body: credenciales, auth: false }),
  registrar: (datos) =>
    pedir('/auth/register', { method: 'POST', body: datos, auth: false }),
  perfil: () => pedir('/auth/profile'),

  espacios: (filtros = '') => pedir(`/spaces${filtros}`),
  crearEspacio: (datos) => pedir('/spaces', { method: 'POST', body: datos }),
  editarEspacio: (id, datos) =>
    pedir(`/spaces/${id}`, { method: 'PUT', body: datos }),
  eliminarEspacio: (id) => pedir(`/spaces/${id}`, { method: 'DELETE' }),
  subirImagen: (id, archivo) => {
    const form = new FormData();
    form.append('imagen', archivo);
    return pedir(`/spaces/${id}/images`, { method: 'POST', body: form });
  },
  eliminarImagen: (id, imagenId) =>
    pedir(`/spaces/${id}/images/${imagenId}`, { method: 'DELETE' }),

  reservas: () => pedir('/reservations'),
  crearReserva: (datos) => pedir('/reservations', { method: 'POST', body: datos }),
  cambiarEstadoReserva: (id, estado) =>
    pedir(`/reservations/${id}/status`, { method: 'PATCH', body: { estado } }),
  cancelarReserva: (id) =>
    pedir(`/reservations/${id}/cancel`, { method: 'PATCH' }),

  usuarios: () => pedir('/users'),
  cambiarRol: (id, rol) =>
    pedir(`/users/${id}/role`, { method: 'PATCH', body: { rol } }),
  cambiarEstadoUsuario: (id, activo) =>
    pedir(`/users/${id}/status`, { method: 'PATCH', body: { activo } }),
  eliminarUsuario: (id) => pedir(`/users/${id}`, { method: 'DELETE' }),
};
