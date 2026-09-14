import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { formatoCOP } from '../utils/catalogos';
import { esFacturacion } from '../utils/roles';
import { IconAlert, IconDollar, IconFile, IconUsers } from './Icons';

export default function Dashboard({ sesion, onNavegar }) {
  const [estado, setEstado] = useState({ cargando: true, error: '', facturas: [], clientes: [], pagos: [] });

  useEffect(() => {
    let activo = true;
    async function cargar() {
      setEstado((e) => ({ ...e, cargando: true, error: '' }));
      try {
        const [f, c, p] = await Promise.all([
          esFacturacion(sesion.role?.nombre) ? api.facturas() : Promise.resolve({ facturas: [] }),
          esFacturacion(sesion.role?.nombre) ? api.clientes() : Promise.resolve({ clientes: [] }),
          api.pagos().catch(() => ({ pagos: [] })),
        ]);
        if (!activo) return;
        setEstado({ cargando: false, error: '', facturas: f.facturas || [], clientes: c.clientes || [], pagos: p.pagos || [] });
      } catch (err) {
        if (!activo) return;
        setEstado((e) => ({ ...e, cargando: false, error: err.message }));
      }
    }
    cargar();
    return () => { activo = false; };
  }, []);

  const { cargando, error, facturas, clientes, pagos } = estado;

  const totales = {
    totalFacturado: facturas.reduce((s, f) => s + Number(f.valorTotal || 0), 0),
    totalPagado: pagos.reduce((s, p) => s + Number(p.valorPagado || 0), 0),
    facturasPendientes: facturas.filter((f) => f.estado === 'emitida').length,
    totalClientes: clientes.length,
  };

  const pendientes = facturas.filter((f) => f.estado === 'emitida').slice(0, 5);

  return (
    <section className="vista">
      <div className="vista-encabezado">
        <div>
          <h2 className="saludo-personalizado">
            <span>Bienvenido, {sesion.nombre || 'Usuario'}</span>
          </h2>
          <p className="vista-sub">
            {esFacturacion(sesion.role?.nombre)
              ? 'Resumen general del sistema de facturación'
              : 'Consulta tus facturas y pagos'}
          </p>
        </div>
      </div>

      {error && <div className="alerta error">{error}</div>}

      {cargando ? (
        <div className="vacio"><div className="spinner" /><p className="estado">Cargando resumen...</p></div>
      ) : (
        <>
          <div className="estadisticas">
            <div className="tarjeta estadistica">
              <span className="estadistica-icono tono-indigo"><IconDollar className="icon" /></span>
              <div>
                <div className="estadistica-valor">{formatoCOP(totales.totalFacturado)}</div>
                <div className="estadistica-etiqueta">Total facturado</div>
              </div>
            </div>
            <div className="tarjeta estadistica">
              <span className="estadistica-icono tono-esmeralda"><IconFile className="icon" /></span>
              <div>
                <div className="estadistica-valor">{formatoCOP(totales.totalPagado)}</div>
                <div className="estadistica-etiqueta">Total recaudado</div>
              </div>
            </div>
            <div className="tarjeta estadistica">
              <span className="estadistica-icono tono-violeta"><IconAlert className="icon" /></span>
              <div>
                <div className="estadistica-valor">{totales.facturasPendientes}</div>
                <div className="estadistica-etiqueta">Facturas pendientes</div>
              </div>
            </div>
            <div className="tarjeta estadistica">
              <span className="estadistica-icono tono-ambar"><IconUsers className="icon" /></span>
              <div>
                <div className="estadistica-valor">{totales.totalClientes}</div>
                <div className="estadistica-etiqueta">Clientes activos</div>
              </div>
            </div>
          </div>

          <div className="tarjeta panel">
            <header className="panel-header"><h3>Facturas pendientes</h3></header>
            {pendientes.length === 0 ? (
              <div className="vacio pequeno"><p>No hay facturas pendientes.</p></div>
            ) : (
              <ul className="lista-proxima">
                {pendientes.map((f) => (
                  <li key={f.id}>
                    <div>
                      <strong>{f.cliente?.nombre || 'Cliente'}</strong>
                      <span className="meta">{f.cliente?.numeroCuenta}</span>
                    </div>
                    <span className={`badge estado-${f.estado}`}>{formatoCOP(f.valorTotal)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </section>
  );
}
