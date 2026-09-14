import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { ROLES, ROLES_LISTA, etiquetaRol, esGestion } from '../utils/roles';
import SearchBar from './SearchBar';

export default function UsuariosList({ sesion }) {
  const rol = sesion.role?.nombre;
  const puedeGestionar = esGestion(rol);
  const esSuper = rol === ROLES.SUPER_ADMIN;

  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');

  async function cargar() {
    setCargando(true);
    try {
      const data = await api.usuarios();
      setUsuarios(data.usuarios || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return usuarios;
    return usuarios.filter((u) =>
      [u.nombre, u.apellido, u.email, u.telefono, etiquetaRol(u.role?.nombre)]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [usuarios, busqueda]);

  async function cambiarRol(id, nuevoRol) {
    try { await api.cambiarRol(id, nuevoRol); await cargar(); }
    catch (err) { setError(err.message); }
  }

  async function alternarEstado(usuario) {
    try { await api.cambiarEstadoUsuario(usuario.id, !usuario.activo); await cargar(); }
    catch (err) { setError(err.message); }
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar este usuario?')) return;
    try { await api.eliminarUsuario(id); await cargar(); }
    catch (err) { setError(err.message); }
  }

  return (
    <section className="vista">
      <div className="vista-encabezado">
        <div>
          <h2>Usuarios</h2>
          <p className="vista-sub">Administra cuentas, roles y accesos del sistema</p>
        </div>
      </div>
      {error && <div className="alerta error">{error}</div>}
      {!puedeGestionar && <div className="alerta">Solo los administradores pueden gestionar usuarios.</div>}
      <SearchBar valor={busqueda} onChange={setBusqueda} placeholder="Buscar por nombre, email o rol..." />
      {cargando ? (
        <div className="vacio"><div className="spinner" /><p className="estado">Cargando usuarios...</p></div>
      ) : filtrados.length === 0 ? (
        <div className="vacio"><h3>Sin usuarios</h3><p>No se encontraron usuarios.</p></div>
      ) : (
        <div className="tabla-envoltura">
          <table className="tabla">
            <thead>
              <tr>
                <th>Usuario</th><th>Email</th><th>Teléfono</th><th>Rol</th><th>Estado</th>
                {puedeGestionar && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {filtrados.map((u) => (
                <tr key={u.id}>
                  <td><strong>{u.nombre} {u.apellido}</strong></td>
                  <td>{u.email}</td>
                  <td>{u.telefono || '—'}</td>
                  <td>
                    {puedeGestionar && !esSuper ? (
                      <select value={u.role?.nombre || ''} onChange={(e) => cambiarRol(u.id, e.target.value)}>
                        {ROLES_LISTA.map((r) => <option key={r} value={r}>{etiquetaRol(r)}</option>)}
                      </select>
                    ) : (
                      <span className="badge badge-rol">{etiquetaRol(u.role?.nombre)}</span>
                    )}
                  </td>
                  <td>
                    {u.id === sesion.id ? (
                      <span className="badge ok">Activo</span>
                    ) : (
                      <span className={u.activo ? 'badge ok' : 'badge off'}>{u.activo ? 'Activo' : 'Inactivo'}</span>
                    )}
                  </td>
                  {puedeGestionar && u.id !== sesion.id && (
                    <td className="acciones">
                      <button type="button" className={u.activo ? 'boton peligro' : 'boton secundario'} onClick={() => alternarEstado(u)}>
                        {u.activo ? 'Desactivar' : 'Activar'}
                      </button>
                      <button type="button" className="boton peligro" onClick={() => eliminar(u.id)}>Eliminar</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}