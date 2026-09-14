import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { etiquetaEstado, formatoFecha } from '../utils/catalogos';
import { esStaff } from '../utils/roles';
import { IconAlert, IconBuilding, IconCalendar, IconCircle, IconLayers } from './Icons';

const ESTADOS_ACTIVOS = ['pendiente', 'confirmada'];

export default function Dashboard({ sesion, onNavegar }) {
  const [estado, setEstado] = useState({
    cargando: true,
    error: '',
    espacios: [],
    reservas: [],
  });

  useEffect(() => {
    let activo = true;
    async function cargar() {
      setEstado((e) => ({ ...e, cargando: true, error: '' }));
      try {
        const [dataEspacios, dataReservas] = await Promise.all([
          api.espacios(),
          api.reservas(),
        ]);
        if (!activo) return;
        setEstado({
          cargando: false,
          error: '',
          espacios: dataEspacios.espacios || [],
          reservas: dataReservas.reservas || [],
        });
      } catch (err) {
        if (!activo) return;
        setEstado((e) => ({ ...e, cargando: false, error: err.message }));
      }
    }
    cargar();
    return () => {
      activo = false;
    };
  }, []);

  const { cargando, error, espacios, reservas } = estado;

  const totales = {
    espacios: espacios.length,
    disponibles: espacios.filter((e) => e.disponible).length,
    activas: reservas.filter((r) => ESTADOS_ACTIVOS.includes(r.estado)).length,
    pendientes: reservas.filter((r) => r.estado === 'pendiente').length,
  };

  const proximas = reservas
    .filter((r) => ESTADOS_ACTIVOS.includes(r.estado))
    .sort((a, b) => new Date(a.fechaInicio) - new Date(b.fechaInicio))
    .slice(0, 5);

  const tarjetas = esStaff(sesion.role?.nombre)
    ? [
        { etiqueta: 'Espacios totales', valor: totales.espacios, icono: IconBuilding, tono: 'indigo' },
        { etiqueta: 'Disponibles ahora', valor: totales.disponibles, icono: IconCircle, tono: 'esmeralda' },
        { etiqueta: 'Reservas activas', valor: totales.activas, icono: IconCalendar, tono: 'violeta' },
        { etiqueta: 'Pendientes de confirmar', valor: totales.pendientes, icono: IconAlert, tono: 'ambar' },
      ]
    : [
        { etiqueta: 'Mis reservas activas', valor: totales.activas, icono: IconCalendar, tono: 'indigo' },
        { etiqueta: 'Espacios disponibles', valor: totales.disponibles, icono: IconCircle, tono: 'esmeralda' },
        { etiqueta: 'Espacios en catálogo', valor: totales.espacios, icono: IconBuilding, tono: 'violeta' },
        { etiqueta: 'Pendientes por aprobar', valor: totales.pendientes, icono: IconAlert, tono: 'ambar' },
      ];

  return (
    <section className="vista">
      <div className="vista-encabezado">
        <div>
          <h2>Hola, {sesion.nombre || 'equipo'} 👋</h2>
          <p className="vista-sub">
            {esStaff(sesion.role?.nombre)
              ? 'Resumen general de espacios y reservas'
              : 'Este es el resumen de tus reservas'}
          </p>
        </div>
        <button type="button" className="boton primario" onClick={() => onNavegar('espacios')}>
          <IconLayers className="icon" /> Explorar espacios
        </button>
      </div>

      {error && <div className="alerta error">{error}</div>}

      {cargando ? (
        <div className="vacio">
          <div className="spinner" />
          <p className="estado">Cargando resumen...</p>
        </div>
      ) : (
        <>
          <div className="estadisticas">
            {tarjetas.map(({ etiqueta, valor, icono: Icono, tono }) => (
              <div key={etiqueta} className="tarjeta estadistica">
                <span className={`estadistica-icono tono-${tono}`}>
                  <Icono className="icon" />
                </span>
                <div>
                  <div className="estadistica-valor">{valor}</div>
                  <div className="estadistica-etiqueta">{etiqueta}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="tarjeta panel">
            <header className="panel-header">
              <h3>Próximas reservas</h3>
            </header>
            {proximas.length === 0 ? (
              <div className="vacio pequeno">
                <p>No tienes reservas activas todavía.</p>
                <button type="button" className="boton primario" onClick={() => onNavegar('espacios')}>
                  Reservar un espacio
                </button>
              </div>
            ) : (
              <ul className="lista-proxima">
                {proximas.map((r) => (
                  <li key={r.id}>
                    <div>
                      <strong>{r.espacio?.nombre || 'Espacio'}</strong>
                      <span className="meta">{formatoFecha(r.fechaInicio)} → {formatoFecha(r.fechaFin)}</span>
                    </div>
                    <span className={`badge estado-${r.estado}`}>{etiquetaEstado(r.estado)}</span>
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