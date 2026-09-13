import { useState, useMemo } from 'react'
import { api } from '../services/api'
import { IconClock, IconDollar, IconUsers, IconMapPin, IconX } from './Icons'

function obtenerFechaDefecto(horasAdicionales = 1) {
  const d = new Date()
  d.setHours(d.getHours() + horasAdicionales)
  d.setMinutes(0, 0, 0)
  const offset = d.getTimezoneOffset()
  const local = new Date(d.getTime() - offset * 60 * 1000)
  return local.toISOString().slice(0, 16)
}

export default function ReservaModal({ espacio, isOpen, onCerrar, onReservaExitosa }) {
  const [fechaInicio, setFechaInicio] = useState(() => obtenerFechaDefecto(1))
  const [fechaFin, setFechaFin] = useState(() => obtenerFechaDefecto(3))
  const [notas, setNotas] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  const calculo = useMemo(() => {
    if (!fechaInicio || !fechaFin) return { horas: 0, total: 0, valido: false }
    const inicio = new Date(fechaInicio)
    const fin = new Date(fechaFin)
    const diffMs = fin.getTime() - inicio.getTime()
    if (diffMs <= 0 || Number.isNaN(diffMs)) {
      return { horas: 0, total: 0, valido: false }
    }
    const horas = Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10
    const precioHora = Number(espacio?.precioPorHora || 0)
    const total = Math.round(horas * precioHora * 100) / 100
    return { horas, total, valido: true }
  }, [fechaInicio, fechaFin, espacio])

  if (!isOpen || !espacio) return null

  async function manejarSubmit(e) {
    e.preventDefault()
    setError('')

    if (!calculo.valido || calculo.horas <= 0) {
      setError('La fecha y hora de fin debe ser posterior a la de inicio')
      return
    }

    setEnviando(true)
    try {
      await api('/reservations', {
        metodo: 'POST',
        body: {
          spaceId: espacio.id,
          fechaInicio: new Date(fechaInicio).toISOString(),
          fechaFin: new Date(fechaFin).toISOString(),
          notas: notas.trim() || undefined,
        },
      })
      onReservaExitosa()
      onCerrar()
    } catch (err) {
      setError(err.message || 'Error al procesar la reserva')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>Reservar Espacio</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {espacio.nombre}
            </span>
          </div>
          <button type="button" className="modal-close-btn" onClick={onCerrar}>
            <IconX className="icon" />
          </button>
        </div>

        <form onSubmit={manejarSubmit}>
          <div className="modal-body">
            {error && (
              <div className="alert alert-error">
                <span>{error}</span>
              </div>
            )}

            <div className="helper-box">
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <IconMapPin className="icon" style={{ width: '16px', height: '16px' }} />
                  {espacio.ubicacion || 'Ubicación central'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <IconUsers className="icon" style={{ width: '16px', height: '16px' }} />
                  Capacidad: {espacio.capacidad} personas
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <IconDollar className="icon" style={{ width: '16px', height: '16px' }} />
                  ${Number(espacio.precioPorHora).toFixed(2)} / hora
                </span>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  <IconClock className="icon" style={{ width: '14px', height: '14px', display: 'inline', verticalAlign: 'middle' }} /> Fecha y hora inicio
                </label>
                <input
                  type="datetime-local"
                  className="form-control"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  <IconClock className="icon" style={{ width: '14px', height: '14px', display: 'inline', verticalAlign: 'middle' }} /> Fecha y hora fin
                </label>
                <input
                  type="datetime-local"
                  className="form-control"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Notas adicionales (opcional)</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Indica requerimientos especiales, número de asistentes, proyector, etc."
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
              />
            </div>

            {calculo.valido && (
              <div className="price-summary-box">
                <div>
                  <div className="price-summary-label">Estimación ({calculo.horas} horas)</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    ${Number(espacio.precioPorHora).toFixed(2)}/h × {calculo.horas}h
                  </div>
                </div>
                <div className="price-summary-val">${calculo.total.toFixed(2)}</div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCerrar}
              disabled={enviando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={enviando || !calculo.valido}
            >
              {enviando ? 'Confirmando...' : 'Confirmar Reserva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
