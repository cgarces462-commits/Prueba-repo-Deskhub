import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { esGestion } from '../utils/roles';
import { etiquetaTipo } from '../utils/catalogos';
import SearchBar from './SearchBar';
import Campo from './Campo';

const FORM_VACIO = { numeroCuenta: '', nombre: '', nit: '', direccion: '', barrio: '', estrato: 3, tipo: 'residencial', telefono: '', email: '', medidor: '' };

export default function ClientesList({ sesion }) {
  const rol = sesion.role?.nombre;
  const puedeGestionar = esGestion(rol);
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState(FORM_VACIO);
  const [editando, setEditando] = useState(null);

  async function cargar() {
    setCargando(true);
    try {
      const data = await api.clientes();
      setClientes(data.clientes || []);
    } catch (e) { setError(e.message); } finally { setCargando(false); }
  }

  useEffect(() => { cargar(); }, []);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return clientes;
    return clientes.filter((c) =>
      [c.numeroCuenta, c.nombre, c.nit, c.barrio, etiquetaTipo(c.tipo)]
        .filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [clientes, busqueda]);

  function manejarCambio(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function guardar(e) {
    e.preventDefault();
    try {
      const payload = { ...form, estrato: Number(form.estrato) };
      if (editando) {
        await api.editarCliente(editando.id, payload);
      } else {
        await api.crearCliente(payload);
      }
      setForm(FORM_VACIO);
      setEditando(null);
      setMostrarForm(false);
      await cargar();
    } catch (err) { setError(err.message); }
  }

  function editar(cliente) {
    setForm({
      numeroCuenta: cliente.numeroCuenta, nombre: cliente.nombre, nit: cliente.nit,
      direccion: cliente.direccion || '', barrio: cliente.barrio || '', estrato: cliente.estrato,
      tipo: cliente.tipo, telefono: cliente.telefono || '', email: cliente.email || '', medidor: cliente.medidor || '',
    });
    setEditando(cliente);
    setMostrarForm(true);
  }

  async function eliminar(cliente) {
    if (!confirm(`¿Eliminar el cliente "${cliente.nombre}"?`)) return;
    try { await api.eliminarCliente(cliente.id); await cargar(); } catch (err) { setError(err.message); }
  }

  return (
    <section className="vista">
      <div className="vista-encabezado">
        <div><h2>Clientes</h2><p className="vista-sub">Gestiona los clientes del sistema</p></div>
        {puedeGestionar && (
          <button type="button" className="boton primario" onClick={() => { setMostrarForm((v) => !v); setEditando(null); setForm(FORM_VACIO); }}>
            {mostrarForm ? 'Cancelar' : 'Nuevo cliente'}
          </button>
        )}
      </div>

      {error && <div className="alerta error">{error}</div>}

      {mostrarForm && (
        <form className="tarjeta formulario" onSubmit={guardar}>
          <h3>{editando ? 'Editar cliente' : 'Nuevo cliente'}</h3>
          <div className="form-row">
            <Campo label="Nº Cuenta" name="numeroCuenta" value={form.numeroCuenta} onChange={manejarCambio} placeholder="MED-001-0004" />
            <Campo label="NIT" name="nit" value={form.nit} onChange={manejarCambio} placeholder="1.234.567.890" />
          </div>
          <Campo label="Nombre / Razón Social" name="nombre" value={form.nombre} onChange={manejarCambio} placeholder="Carlos Pérez" />
          <div className="form-row">
            <Campo label="Dirección" name="direccion" value={form.direccion} onChange={manejarCambio} placeholder="Cra 45 #67-12" />
            <Campo label="Barrio" name="barrio" value={form.barrio} onChange={manejarCambio} placeholder="Envigado" />
          </div>
          <div className="form-row">
            <Campo label="Estrato" name="estrato" type="number" min="1" max="6" value={form.estrato} onChange={manejarCambio} />
            <Campo label="Tipo" name="tipo">
              <select name="tipo" value={form.tipo} onChange={manejarCambio}>
                <option value="residencial">Residencial</option>
                <option value="comercial">Comercial</option>
                <option value="oficial">Oficial</option>
              </select>
            </Campo>
          </div>
          <div className="form-row">
            <Campo label="Teléfono" name="telefono" value={form.telefono} onChange={manejarCambio} placeholder="3001234567" />
            <Campo label="Email" name="email" type="email" value={form.email} onChange={manejarCambio} placeholder="correo@ejemplo.com" />
          </div>
          <Campo label="Medidor" name="medidor" value={form.medidor} onChange={manejarCambio} placeholder="AC-0001234" />
          <button type="submit" className="boton primario">{editando ? 'Guardar cambios' : 'Crear cliente'}</button>
        </form>
      )}

      <SearchBar valor={busqueda} onChange={setBusqueda} placeholder="Buscar por cuenta, nombre, NIT o barrio..." />

      {cargando ? (
        <div className="vacio"><div className="spinner" /><p className="estado">Cargando clientes...</p></div>
      ) : filtrados.length === 0 ? (
        <div className="vacio"><h3>Sin resultados</h3><p>No hay clientes que coincidan.</p></div>
      ) : (
        <div className="tabla-envoltura">
          <table className="tabla">
            <thead><tr><th>Nº Cuenta</th><th>Nombre</th><th>NIT</th><th>Barrio</th><th>Estrato</th><th>Tipo</th><th>Estado</th>{puedeGestionar && <th>Acciones</th>}</tr></thead>
            <tbody>
              {filtrados.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.numeroCuenta}</strong></td>
                  <td>{c.nombre}</td>
                  <td>{c.nit}</td>
                  <td>{c.barrio || '—'}</td>
                  <td>{c.estrato}</td>
                  <td>{etiquetaTipo(c.tipo)}</td>
                  <td><span className={`badge ${c.activo ? 'ok' : 'off'}`}>{c.activo ? 'Activo' : 'Inactivo'}</span></td>
                  {puedeGestionar && (
                    <td className="acciones">
                      <button type="button" className="boton secundario" onClick={() => editar(c)}>Editar</button>
                      {esGestion(rol) && <button type="button" className="boton peligro" onClick={() => eliminar(c)}>Eliminar</button>}
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
