import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { METODOS_PAGO, formatoCOP, formatoFecha } from '../utils/catalogos';
import { esFacturacion } from '../utils/roles';
import SearchBar from './SearchBar';
import Campo from './Campo';

export default function PagosList({ sesion }) {
  const puedeCrear = esFacturacion(sesion.role?.nombre) || sesion.role?.nombre === 'cliente';
  const [pagos, setPagos] = useState([]);
  const [facturas, setFacturas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({ facturaId: '', metodo: 'caja', valorPagado: 0, referencia: '', notas: '' });

  async function cargar() {
    setCargando(true);
    try {
      const [p, f] = await Promise.all([api.pagos(), api.facturas()]);
      setPagos(p.pagos || []);
      setFacturas((f.facturas || []).filter((f) => f.estado === 'emitida' || f.estado === 'vencida'));
    } catch (e) { setError(e.message); } finally { setCargando(false); }
  }

  useEffect(() => { cargar(); }, []);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return pagos;
    return pagos.filter((p) =>
      [p.factura?.cliente?.nombre, p.factura?.cliente?.numeroCuenta, p.metodo, p.referencia]
        .filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [pagos, busqueda]);

  function manejarCambio(e) { setForm((prev) => ({ ...prev, [e.target.name]: e.target.value })); }

  async function registrar(e) {
    e.preventDefault();
    try {
      await api.registrarPago({
        facturaId: Number(form.facturaId), metodo: form.metodo,
        valorPagado: Number(form.valorPagado), referencia: form.referencia, notas: form.notas,
      });
      setMostrarForm(false);
      await cargar();
    } catch (err) { setError(err.message); }
  }

  return (
    <section className="vista">
      <div className="vista-encabezado">
        <div><h2>Pagos</h2><p className="vista-sub">Registro de pagos y recaudo</p></div>
        {puedeCrear && (
          <button type="button" className="boton primario" onClick={() => setMostrarForm((v) => !v)}>
            {mostrarForm ? 'Cancelar' : 'Registrar pago'}
          </button>
        )}
      </div>
      {error && <div className="alerta error">{error}</div>}
      {mostrarForm && (
        <form className="tarjeta formulario" onSubmit={registrar}>
          <h3>Registrar pago</h3>
          <Campo label="Factura" name="facturaId">
            <select name="facturaId" value={form.facturaId} onChange={manejarCambio}>
              <option value="">Selecciona una factura pendiente...</option>
              {facturas.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.cliente?.numeroCuenta} - {f.cliente?.nombre} ({formatoCOP(f.valorTotal)})
                </option>
              ))}
            </select>
          </Campo>
          <div className="form-row">
            <Campo label="Método de pago" name="metodo">
              <select name="metodo" value={form.metodo} onChange={manejarCambio}>
                {METODOS_PAGO.map((m) => <option key={m.valor} value={m.valor}>{m.etiqueta}</option>)}
              </select>
            </Campo>
            <Campo label="Valor pagado" name="valorPagado" type="number" min="0" value={form.valorPagado} onChange={manejarCambio} />
          </div>
          <Campo label="Referencia (opcional)" name="referencia" value={form.referencia} onChange={manejarCambio} placeholder="Nº recibo o transacción" />
          <Campo label="Notas" name="notas" value={form.notas} onChange={manejarCambio} placeholder="Observaciones..." />
          <button type="submit" className="boton primario">Registrar</button>
        </form>
      )}
      <SearchBar valor={busqueda} onChange={setBusqueda} placeholder="Buscar por cliente, cuenta o método..." />
      {cargando ? (
        <div className="vacio"><div className="spinner" /><p className="estado">Cargando pagos...</p></div>
      ) : filtrados.length === 0 ? (
        <div className="vacio"><h3>Sin pagos registrados</h3></div>
      ) : (
        <div className="tabla-envoltura">
          <table className="tabla">
            <thead><tr><th>Factura</th><th>Cliente</th><th>Método</th><th>Valor</th><th>Fecha</th><th>Referencia</th></tr></thead>
            <tbody>
              {filtrados.map((p) => (
                <tr key={p.id}>
                  <td>{p.factura?.cliente?.numeroCuenta || '—'}</td>
                  <td>{p.factura?.cliente?.nombre || '—'}</td>
                  <td><span className="badge">{p.metodo}</span></td>
                  <td><strong>{formatoCOP(p.valorPagado)}</strong></td>
                  <td>{formatoFecha(p.fechaPago)}</td>
                  <td>{p.referencia || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
