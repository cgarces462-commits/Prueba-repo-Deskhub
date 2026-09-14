import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { esFacturacion, esGestion } from '../utils/roles';
import { ESTADOS_FACTURA, etiquetaEstado, formatoCOP, formatoFecha } from '../utils/catalogos';
import SearchBar from './SearchBar';
import Campo from './Campo';

export default function FacturasList({ sesion }) {
  const rol = sesion.role?.nombre;
  const puedeCrear = esFacturacion(rol);
  const [facturas, setFacturas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [tarifas, setTarifas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({ clienteId: '', tarifaId: '', periodoMes: new Date().getMonth() + 1, periodoAnio: new Date().getFullYear(), consumo: 0, notas: '' });

  async function cargar() {
    setCargando(true);
    try {
      const [f, c, t] = await Promise.all([
        api.facturas(),
        puedeCrear ? api.clientes() : Promise.resolve({ clientes: [] }),
        puedeCrear ? api.tarifas() : Promise.resolve({ tarifas: [] }),
      ]);
      setFacturas(f.facturas || []);
      setClientes(c.clientes || []);
      setTarifas(t.tarifas || []);
    } catch (e) { setError(e.message); } finally { setCargando(false); }
  }

  useEffect(() => { cargar(); }, []);

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return facturas;
    return facturas.filter((f) =>
      [f.cliente?.nombre, f.cliente?.numeroCuenta, etiquetaEstado(f.estado), String(f.periodoMes), String(f.periodoAnio)]
        .filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [facturas, busqueda]);

  function manejarCambio(e) { setForm((prev) => ({ ...prev, [e.target.name]: e.target.value })); }

  async function crear(e) {
    e.preventDefault();
    try {
      await api.crearFactura({
        clienteId: Number(form.clienteId), tarifaId: Number(form.tarifaId),
        periodoMes: Number(form.periodoMes), periodoAnio: Number(form.periodoAnio),
        consumo: Number(form.consumo), notas: form.notas,
      });
      setMostrarForm(false);
      await cargar();
    } catch (err) { setError(err.message); }
  }

  async function anular(id) {
    if (!confirm('¿Anular esta factura?')) return;
    try { await api.anularFactura(id); await cargar(); } catch (err) { setError(err.message); }
  }

  return (
    <section className="vista">
      <div className="vista-encabezado">
        <div><h2>Facturas</h2><p className="vista-sub">Gestión de facturación</p></div>
        {puedeCrear && (
          <button type="button" className="boton primario" onClick={() => setMostrarForm((v) => !v)}>
            {mostrarForm ? 'Cancelar' : 'Nueva factura'}
          </button>
        )}
      </div>
      {error && <div className="alerta error">{error}</div>}
      {mostrarForm && (
        <form className="tarjeta formulario" onSubmit={crear}>
          <h3>Crear factura</h3>
          <Campo label="Cliente" name="clienteId">
            <select name="clienteId" value={form.clienteId} onChange={manejarCambio}>
              <option value="">Selecciona un cliente...</option>
              {clientes.map((c) => <option key={c.id} value={c.id}>{c.numeroCuenta} - {c.nombre}</option>)}
            </select>
          </Campo>
          <Campo label="Tarifa" name="tarifaId">
            <select name="tarifaId" value={form.tarifaId} onChange={manejarCambio}>
              <option value="">Selecciona una tarifa...</option>
              {tarifas.map((t) => <option key={t.id} value={t.id}>{t.servicio?.nombre} - {t.nombre} ({formatoCOP(t.valorUnitario)}/{t.unidad})</option>)}
            </select>
          </Campo>
          <div className="form-row">
            <Campo label="Mes" name="periodoMes" type="number" min="1" max="12" value={form.periodoMes} onChange={manejarCambio} />
            <Campo label="Año" name="periodoAnio" type="number" min="2020" value={form.periodoAnio} onChange={manejarCambio} />
          </div>
          <Campo label="Consumo" name="consumo" type="number" min="0" value={form.consumo} onChange={manejarCambio} />
          <Campo label="Notas" name="notas" value={form.notas} onChange={manejarCambio} placeholder="Observaciones..." />
          <button type="submit" className="boton primario">Crear factura</button>
        </form>
      )}
      <SearchBar valor={busqueda} onChange={setBusqueda} placeholder="Buscar por cliente, cuenta o estado..." />
      {cargando ? (
        <div className="vacio"><div className="spinner" /><p className="estado">Cargando facturas...</p></div>
      ) : filtradas.length === 0 ? (
        <div className="vacio"><h3>Sin facturas</h3><p>No se encontraron facturas.</p></div>
      ) : (
        <div className="tabla-envoltura">
          <table className="tabla">
            <thead><tr><th>Nº Cuenta</th><th>Cliente</th><th>Periodo</th><th>Consumo</th><th>Valor</th><th>Estado</th><th>Emisión</th>{puedeCrear && <th>Acciones</th>}</tr></thead>
            <tbody>
              {filtradas.map((f) => (
                <tr key={f.id}>
                  <td>{f.cliente?.numeroCuenta || '—'}</td>
                  <td>{f.cliente?.nombre || '—'}</td>
                  <td>{String(f.periodoMes).padStart(2, '0')}/{f.periodoAnio}</td>
                  <td>{f.consumo} {f.tarifa?.unidad || ''}</td>
                  <td><strong>{formatoCOP(f.valorTotal)}</strong></td>
                  <td><span className={`badge estado-${f.estado}`}>{etiquetaEstado(f.estado)}</span></td>
                  <td>{formatoFecha(f.fechaEmision)}</td>
                  {puedeCrear && (
                    <td className="acciones">
                      {f.estado !== 'anulada' && f.estado !== 'pagada' && (
                        <button type="button" className="boton peligro" onClick={() => anular(f.id)}>Anular</button>
                      )}
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
