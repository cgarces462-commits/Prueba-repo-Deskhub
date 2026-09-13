import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { ROLES_LISTA, etiquetaRol, esGestion, esSuperAdmin } from '../utils/roles';
import SearchBar from './SearchBar';

export default function UsuariosList({ sesion }) {
  const rol = sesion.role?.nombre;
  const puedeGestionar = esGestion(rol);
  const esSuper = esSuperAdmin(rol);

  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');

  async function cargar() {
    setCargando(true);
    setError('');
    try {
      const data = await api.usuarios();
      setUsuarios(data.usuarios || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return usuarios;
    return usuarios.filter((u) =>
      [u.nombre, u.apellido, u.email, u.telefono, etiquetaRol(u.role?.nombre)]
        .filter(Boolean)
        .some((valor) => String(valor).toLowerCase().includes(q))
    );
  }, [usuarios, busqueda]);

  async function cambiarRol(id, nuevoRol) {
    try {
      await api.cambiarRol(id, nuevoRol);
      await cargar();
    } catch (err) {
      setError(err.message);
    }
  }

  async function alternarEstado(usuario) {
    try {
      await api.cambiarEstadoUsuario(usuario.id, !usuario.activo);
      await cargar();
    } catch (err) {
      setError(err.message);
    }
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar este usuario?')) return;
    try {
      await api.eliminarUsuario(id);
      await cargar();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="vista">
      <div className="vista-encabezado">
        <h2>Usuarios</h2>
      </div>

      {!puedeGestionar ? (
        <div className="alerta error">
          No tienes permisos para gestionar usuarios.
        </div>
      ) : (
        <>
          {error && <div className="alerta error">{error}</div>}

          <SearchBar
            valor={busqueda}
            onChange={setBusqueda}
            placeholder="Buscar por nombre, email o rol..."
          />

          {cargando ? (
            <p className="estado">Cargando usuarios...</p>
          ) : filtrados.length === 0 ? (
            <p className="estado">No se encontraron resultados</p>
          ) : (
            <div className="tabla-envoltura">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((u) => {
                    const esYo = u.id === sesion.id;
                    return (
                      <tr key={u.id}>
                        <td>
                          {u.nombre} {u.apellido || ''}
                        </td>
                        <td>{u.email}</td>
                        <td>{u.telefono || '—'}</td>
                        <td>
                          {esSuper && !esYo ? (
                            <select
                              value={u.role?.nombre || ''}
                              onChange={(e) => cambiarRol(u.id, e.target.value)}
                            >
                              {ROLES_LISTA.map((r) => (
                                <option key={r} value={r}>
                                  {etiquetaRol(r)}
                                </option>
                              ))}
                            </select>
                          ) : (
                            etiquetaRol(u.role?.nombre)
                          )}
                        </td>
                        <td>
                          <span className={`badge ${u.activo ? 'ok' : 'off'}`}>
                            {u.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="acciones">
                          {!esYo && (
                            <button
                              type="button"
                              className="boton secundario"
                              onClick={() => alternarEstado(u)}
                            >
                              {u.activo ? 'Desactivar' : 'Activar'}
                            </button>
                          )}
                          {esSuper && !esYo && (
                            <button
                              type="button"
                              className="boton peligro"
                              onClick={() => eliminar(u.id)}
                            >
                              Eliminar
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  );
}
