import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { esGestion } from '../utils/roles';
import SearchBar from './SearchBar';
import Campo from './Campo';

export default function ServiciosList({ sesion }) {
  const puedeGestionar = esGestion(sesion.role?.nombre);
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({ nombre: '', abreviatura: '', descripcion: '' });
  const [editando, setEditando] = useState(null);

  async function cargar() {
    setCargando(true);
    try { const data = await api.servicios(); setServicios(data.servicios || []); }
    catch (e) { setError(e.message); } finally { setCargando(false); }
  }

  useEffect(() => { cargar(); }, []);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return servicios;
    return servicios.filter((s) => [s.nombre, s.abreviatura, s.descripcion]
      .filter(Boolean).some((v) => String(v).toLowerCase().includes(q)));
  }, [servicios, busqueda]);

  function manejarCambio(e) { setForm((prev) => ({ ...prev, [e.target.name]: e.target.value })); }

  async function guardar(e) {
    e.preventDefault();
    try {
      if (editando) await api.editarServicio(editando.id, form);
      else await api.crearServicio(form);
      setForm({ nombre: '', abreviatura: '', descripcion: '' });
      setEditando(null); setMostrarForm(false); await cargar();
    } catch (err) { setError(err.message); }
  }

  function editar(serv) {
    setForm({ nombre: serv.nombre, abreviatura: serv.abreviatura, descripcion: serv.descripcion || '' });
    setEditando(serv); setMostrarForm(true);
  }

  async function eliminar(serv) {
    if (!confirm(`¿Eliminar "${serv.nombre}"?`)) return;
    try { await api.eliminarServicio(serv.id); await cargar(); } catch (err) { setError(err.message); }
  }

  return (
    <section className="vista">
      <div className="vista-encabezado">
        <div><h2>Servicios</h2><p className="vista-sub">Catálogo de servicios públicos</p></div>
        {puedeGestionar && (
          <button type="button" className="boton primario" onClick={() => { setMostrarForm((v) => !v); setEditando(null); setForm({ nombre: '', abreviatura: '', descripcion: '' }); }}>
            {mostrarForm ? 'Cancelar' : 'Nuevo servicio'}
          </button>
        )}
      </div>
      {error && <div className="alerta error">{error}</div>}
      {mostrarForm && (
        <form className="tarjeta formulario" onSubmit={guardar}>
          <h3>{editando ? 'Editar servicio' : 'Nuevo servicio'}</h3>
          <Campo label="Nombre" name="nombre" value={form.nombre} onChange={manejarCambio} placeholder="Acueducto" />
          <Campo label="Abreviatura" name="abreviatura" value={form.abreviatura} onChange={manejarCambio} placeholder="ACUE" />
          <Campo label="Descripción" name="descripcion" value={form.descripcion} onChange={manejarCambio} placeholder="Servicio de agua potable" />
          <button type="submit" className="boton primario">{editando ? 'Guardar' : 'Crear'}</button>
        </form>
      )}
      <SearchBar valor={busqueda} onChange={setBusqueda} placeholder="Buscar por nombre o abreviatura..." />
      {cargando ? (
        <div className="vacio"><div className="spinner" /><p className="estado">Cargando...</p></div>
      ) : filtrados.length === 0 ? (
        <div className="vacio"><h3>Sin resultados</h3></div>
      ) : (
        <div className="tabla-envoltura">
          <table className="tabla">
            <thead><tr><th>Nombre</th><th>Abreviatura</th><th>Descripción</th><th>Estado</th>{puedeGestionar && <th>Acciones</th>}</tr></thead>
            <tbody>
              {filtrados.map((s) => (
                <tr key={s.id}>
                  <td><strong>{s.nombre}</strong></td>
                  <td>{s.abreviatura}</td>
                  <td>{s.descripcion || '—'}</td>
                  <td><span className={`badge ${s.activo ? 'ok' : 'off'}`}>{s.activo ? 'Activo' : 'Inactivo'}</span></td>
                  {puedeGestionar && (
                    <td className="acciones">
                      <button type="button" className="boton secundario" onClick={() => editar(s)}>Editar</button>
                      <button type="button" className="boton peligro" onClick={() => eliminar(s)}>Eliminar</button>
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
