import { useState, useMemo } from 'react';
import { api } from '../services/api';
import { IconClock, IconUsers, IconMapPin, IconX } from './Icons';
import { formatoPrecio } from '../utils/catalogos';

function obtenerFechaDefecto(horasAdicionales = 1) {
  const d = new Date();
  d.setHours(d.getHours() + horasAdicionales);
  d.setMinutes(0, 0, 0);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

export default function ReservaModal({ espacio, isOpen, onCerrar, onReservaExitosa }) {
  const [fechaInicio, setFechaInicio] = useState(() => obtenerFechaDefecto(1));
  const [fechaFin, setFechaFin] = useState(() => obtenerFechaDefecto(3));
  const [notas, setNotas] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  const calculo = useMemo(() => {
    if (!fechaInicio || !fechaFin) return { horas: 0, total: 0, valido: false };
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diffMs = fin.getTime() - inicio.getTime();
    if (diffMs <= 0 || Number.isNaN(diffMs)) {
      return { horas: 0, total: 0, valido: false };
    }
    const horas = Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;
    const precioHora = Number(espacio?.precioPorHora || 0);
    const total = Math.round(horas * precioHora * 100) / 100;
    return { horas, total, valido: true };
  }, [fechaInicio, fechaFin, espacio]);

  if (!isOpen || !espacio) return null;

  async function manejarSubmit(e) {
    e.preventDefault();
    setError('');

    if (!calculo.valido || calculo.horas <= 0) {
      setError('La fecha y hora de fin debe ser posterior a la de inicio');
      return;
    }

    setEnviando(true);
    try {
      await api.crearReserva({
        spaceId: espacio.id,
        fechaInicio: new Date(fechaInicio).toISOString(),
        fechaFin: new Date(fechaFin).toISOString(),
        notas: notas.trim() || undefined,
      });
      onReservaExitosa();
      onCerrar();
    } catch (err) {
      setError(err.message || 'Error al procesar la reserva');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>Reservar espacio</h3>
            <p className="modal-sub">{espacio.nombre}</p>
          </div>
          <button type="button" className="icono-boton" onClick={onCerrar} aria-label="Cerrar">
            <IconX />
          </button>
        </div>

        <form onSubmit={manejarSubmit}>
          <div className="modal-body">
            {error && <div className="alerta error">{error}</div>}

            <div className="helper-box">
              <span>
                <IconMapPin className="icon" /> {espacio.ubicacion || 'Ubicación central'}
              </span>
              <span>
                <IconUsers className="icon" /> Capacidad: {espacio.capacidad} personas
              </span>
              <span>
                <IconClock className="icon" /> {formatoPrecio(espacio.precioPorHora)} / hora
              </span>
            </div>

            <div className="form-row">
              <div className="campo">
                <label htmlFor="reserva-inicio">Fecha y hora de inicio</label>
                <input
                  id="reserva-inicio"
                  type="datetime-local"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  required
                />
              </div>
              <div className="campo">
                <label htmlFor="reserva-fin">Fecha y hora de fin</label>
                <input
                  id="reserva-fin"
                  type="datetime-local"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="campo">
              <label htmlFor="reserva-notas">Notas adicionales (opcional)</label>
              <textarea
                id="reserva-notas"
                rows={3}
                placeholder="Indica requerimientos especiales, proyector, etc."
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
              />
            </div>

            {calculo.valido && (
              <div className="resumen-precio">
                <div>
                  <div className="resumen-precio-etiqueta">
                    Estimación ({calculo.horas} horas)
                  </div>
                  <div className="resumen-precio-sub">
                    {formatoPrecio(espacio.precioPorHora)}/h × {calculo.horas}h
                  </div>
                </div>
                <div className="resumen-precio-total">{formatoPrecio(calculo.total)}</div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="boton secundario" onClick={onCerrar} disabled={enviando}>
              Cancelar
            </button>
            <button type="submit" className="boton primario" disabled={enviando || !calculo.valido}>
              {enviando ? 'Confirmando...' : 'Confirmar reserva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}