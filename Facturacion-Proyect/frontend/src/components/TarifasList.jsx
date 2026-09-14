import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { esGestion } from '../utils/roles';
import { formatoCOP } from '../utils/catalogos';
import SearchBar from './SearchBar';
import Campo from './Campo';

export default function TarifasList({ sesion }) {
  const puedeGestionar = esGestion(sesion.role?.nombre);
  const [tarifas, setTarifas] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({ servicioId: '', nombre: '', valorUnitario: 0, unidad: 'm3', vigenciaDesde: '', vigenciaHasta: '' });
  const [editando, setEditando] = useState(null);

  async function cargar() {
    setCargando(true);
    try {
      const [t, s] = await Promise.all([api.tarifas(), api.servicios()]);
      setTarifas(t.tarifas || []);
      setServicios(s.servicios || []);
    } catch (e) { setError(e.message); } finally { setCargando(false); }
  }

  useEffect(() => { cargar(); }, []);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return tarifas;
    return tarifas.filter((t) => [t.nombre, t.servicio?.nombre, t.unidad]
      .filter(Boolean).some((v) => String(v).toLowerCase().includes(q)));
  }, [tarifas, busqueda]);

  function manejarCambio(e) { setForm((prev) => ({ ...prev, [e.target.name]: e.target.value })); }

  async function guardar(e) {
    e.preventDefault();
    try {
      const payload = { ...form, servicioId: Number(form.servicioId), valorUnitario: Number(form.valorUnitario) };
      if (editando) await api.editarTarifa(editando.id, payload);
      else await api.crearTarifa(payload);
      setForm({ servicioId: '', nombre: '', valorUnitario: 0, unidad: 'm3', vigenciaDesde: '', vigenciaHasta: '' });
      setEditando(null); setMostrarForm(false); await cargar();
    } catch (err) { setError(err.message); }
  }

  function editar(t) {
    setForm({
      servicioId: t.servicioId, nombre: t.nombre, valorUnitario: t.valorUnitario,
      unidad: t.unidad, vigenciaDesde: t.vigenciaDesde || '', vigenciaHasta: t.vigenciaHasta || '',
    });
    setEditando(t); setMostrarForm(true);
  }

  async function eliminar(t) {
    if (!confirm(`¿Eliminar tarifa "${t.nombre}"?`)) return;
    try { await api.eliminarTarifa(t.id); await cargar(); } catch (err) { setError(err.message); }
  }

  return (
    <section className="vista">
      <div className="vista-encabezado">
        <div><h2>Tarifas</h2><p className="vista-sub">Tarifas por servicio</p></div>
        {puedeGestionar && (
          <button type="button" className="boton primario" onClick={() => { setMostrarForm((v) => !v); setEditando(null); }}>
            {mostrarForm ? 'Cancelar' : 'Nueva tarifa'}
          </button>
        )}
      </div>
      {error && <div className="alerta error">{error}</div>}
      {mostrarForm && (
        <form className="tarjeta formulario" onSubmit={guardar}>
          <h3>{editando ? 'Editar tarifa' : 'Nueva tarifa'}</h3>
          <Campo label="Servicio" name="servicioId">
            <select name="servicioId" value={form.servicioId} onChange={manejarCambio}>
              <option value="">Selecciona un servicio...</option>
              {servicios.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>
          </Campo>
          <Campo label="Nombre" name="nombre" value={form.nombre} onChange={manejarCambio} placeholder="Tarifa Residencial" />
          <div className="form-row">
            <Campo label="Valor unitario" name="valorUnitario" type="number" min="0" value={form.valorUnitario} onChange={manejarCambio} />
            <Campo label="Unidad" name="unidad" value={form.unidad} onChange={manejarCambio} placeholder="m3, kWh, mes" />
          </div>
          <div className="form-row">
            <Campo label="Vigente desde" name="vigenciaDesde" type="date" value={form.vigenciaDesde} onChange={manejarCambio} />
            <Campo label="Vigente hasta (opcional)" name="vigenciaHasta" type="date" value={form.vigenciaHasta} onChange={manejarCambio} />
          </div>
          <button type="submit" className="boton primario">{editando ? 'Guardar' : 'Crear'}</button>
        </form>
      )}
      <SearchBar valor={busqueda} onChange={setBusqueda} placeholder="Buscar por nombre o servicio..." />
      {cargando ? (
        <div className="vacio"><div className="spinner" /><p className="estado">Cargando...</p></div>
      ) : filtrados.length === 0 ? (
        <div className="vacio"><h3>Sin resultados</h3></div>
      ) : (
        <div className="tabla-envoltura">
          <table className="tabla">
            <thead><tr><th>Servicio</th><th>Nombre</th><th>Valor/U</th><th>Unidad</th><th>Vigencia</th><th>Estado</th>{puedeGestionar && <th>Acciones</th>}</tr></thead>
            <tbody>
              {filtrados.map((t) => (
                <tr key={t.id}>
                  <td>{t.servicio?.nombre || '—'}</td>
                  <td><strong>{t.nombre}</strong></td>
                  <td>{formatoCOP(t.valorUnitario)}</td>
                  <td>{t.unidad}</td>
                  <td>{t.vigenciaDesde} {t.vigenciaHasta ? `→ ${t.vigenciaHasta}` : '(abierta)'}</td>
                  <td><span className={`badge ${t.activo ? 'ok' : 'off'}`}>{t.activo ? 'Activa' : 'Inactiva'}</span></td>
                  {puedeGestionar && (
                    <td className="acciones">
                      <button type="button" className="boton secundario" onClick={() => editar(t)}>Editar</button>
                      <button type="button" className="boton peligro" onClick={() => eliminar(t)}>Eliminar</button>
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
