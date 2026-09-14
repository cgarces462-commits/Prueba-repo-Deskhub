const BASE = '/api';
const TOKEN_KEY = 'facturacion_token';
const USUARIO_KEY = 'facturacion_usuario';

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
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${ruta}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data = {};
  try { data = await res.json(); } catch { data = {}; }

  if (!res.ok) {
    if (res.status === 401 && auth) {
      cerrarSesion();
      window.dispatchEvent(new Event('facturacion:sesion-expirada'));
    }
    throw new Error(data.mensaje || `Error ${res.status}`);
  }
  return data;
}

export const api = {
  login: (credenciales) => pedir('/auth/login', { method: 'POST', body: credenciales, auth: false }),
  registrar: (datos) => pedir('/auth/register', { method: 'POST', body: datos, auth: false }),
  perfil: () => pedir('/auth/profile'),

  clientes: (filtros = '') => pedir(`/clientes${filtros}`),
  crearCliente: (datos) => pedir('/clientes', { method: 'POST', body: datos }),
  editarCliente: (id, datos) => pedir(`/clientes/${id}`, { method: 'PUT', body: datos }),
  eliminarCliente: (id) => pedir(`/clientes/${id}`, { method: 'DELETE' }),

  servicios: () => pedir('/servicios'),
  crearServicio: (datos) => pedir('/servicios', { method: 'POST', body: datos }),
  editarServicio: (id, datos) => pedir(`/servicios/${id}`, { method: 'PUT', body: datos }),
  eliminarServicio: (id) => pedir(`/servicios/${id}`, { method: 'DELETE' }),

  tarifas: () => pedir('/tarifas'),
  crearTarifa: (datos) => pedir('/tarifas', { method: 'POST', body: datos }),
  editarTarifa: (id, datos) => pedir(`/tarifas/${id}`, { method: 'PUT', body: datos }),
  eliminarTarifa: (id) => pedir(`/tarifas/${id}`, { method: 'DELETE' }),

  facturas: () => pedir('/facturas'),
  crearFactura: (datos) => pedir('/facturas', { method: 'POST', body: datos }),
  cambiarEstadoFactura: (id, estado) => pedir(`/facturas/${id}/status`, { method: 'PATCH', body: { estado } }),
  anularFactura: (id) => pedir(`/facturas/${id}/anular`, { method: 'PATCH' }),

  pagos: () => pedir('/pagos'),
  registrarPago: (datos) => pedir('/pagos', { method: 'POST', body: datos }),

  usuarios: () => pedir('/users'),
  cambiarRol: (id, rol) => pedir(`/users/${id}/role`, { method: 'PATCH', body: { rol } }),
  cambiarEstadoUsuario: (id, activo) => pedir(`/users/${id}/status`, { method: 'PATCH', body: { activo } }),
  eliminarUsuario: (id) => pedir(`/users/${id}`, { method: 'DELETE' }),
};
