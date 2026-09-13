import { useState } from 'react'
import { api } from '../services/api'
import Campo from './Campo'
import { IconX } from './Icons'
import { campoObligatorio } from '../utils/validacion'

const TIPOS = [
  { id: 'escritorio', label: 'Escritorio Compartido / Dedicado' },
  { id: 'oficina_privada', label: 'Oficina Privada' },
  { id: 'sala_reunion', label: 'Sala de Reunión' },
  { id: 'sala_conferencia', label: 'Sala de Conferencia' },
]

export default function EspacioModal({ espacioAEditar, isOpen, onCerrar, onGuardado }) {
  const [nombre, setNombre] = useState(() => espacioAEditar?.nombre || '')
  const [tipo, setTipo] = useState(() => espacioAEditar?.tipo || TIPOS[0].id)
  const [ubicacion, setUbicacion] = useState(() => espacioAEditar?.ubicacion || '')
  const [capacidad, setCapacidad] = useState(() =>
    espacioAEditar?.capacidad ? String(espacioAEditar.capacidad) : '',
  )
  const [precioPorHora, setPrecioPorHora] = useState(() =>
    espacioAEditar?.precioPorHora ? String(espacioAEditar.precioPorHora) : '',
  )
  const [descripcion, setDescripcion] = useState(() => espacioAEditar?.descripcion || '')
  const [disponible, setDisponible] = useState(() => espacioAEditar?.disponible !== false)

  const [errores, setErrores] = useState({})
  const [errorApi, setErrorApi] = useState('')
  const [enviando, setEnviando] = useState(false)

  const esEdicion = Boolean(espacioAEditar)

  if (!isOpen) return null

  function validar() {
    const errs = {
      nombre: campoObligatorio(nombre),
      capacidad: campoObligatorio(capacidad),
      precioPorHora: campoObligatorio(precioPorHora),
    }
    if (!errs.capacidad && Number(capacidad) <= 0) {
      errs.capacidad = 'La capacidad debe ser mayor a 0'
    }
    if (!errs.precioPorHora && Number(precioPorHora) < 0) {
      errs.precioPorHora = 'El precio no puede ser negativo'
    }
    setErrores(errs)
    return !Object.values(errs).some((e) => e !== '')
  }

  async function manejarSubmit(e) {
    e.preventDefault()
    setErrorApi('')
    if (!validar()) return

    setEnviando(true)
    try {
      const payload = {
        nombre: nombre.trim(),
        tipo,
        ubicacion: ubicacion.trim() || null,
        capacidad: Number(capacidad),
        precioPorHora: Number(precioPorHora),
        descripcion: descripcion.trim() || null,
        disponible,
      }

      if (esEdicion) {
        await api(`/spaces/${espacioAEditar.id}`, {
          metodo: 'PUT',
          body: payload,
        })
      } else {
        await api('/spaces', {
          metodo: 'POST',
          body: payload,
        })
      }

      onGuardado()
      onCerrar()
    } catch (err) {
      setErrorApi(err.message || 'Ocurrió un error al guardar el espacio')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{esEdicion ? 'Editar Espacio' : 'Nuevo Espacio de Trabajo'}</h3>
          <button type="button" className="modal-close-btn" onClick={onCerrar}>
            <IconX className="icon" />
          </button>
        </div>

        <form onSubmit={manejarSubmit}>
          <div className="modal-body">
            {errorApi && (
              <div className="alert alert-error">
                <span>{errorApi}</span>
              </div>
            )}

            <Campo
              label="Nombre del espacio"
              valor={nombre}
              onChange={setNombre}
              error={errores.nombre}
              placeholder="Ej: Sala Innovación B, Escritorio HotDesk 10"
              required
            />

            <div className="form-group">
              <label>Tipo de espacio</label>
              <select
                className="form-control"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
              >
                {TIPOS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <Campo
              label="Ubicación / Piso"
              valor={ubicacion}
              onChange={setUbicacion}
              placeholder="Ej: Piso 2 - Ala Norte"
            />

            <div className="form-row">
              <Campo
                label="Capacidad (personas)"
                type="number"
                min="1"
                valor={capacidad}
                onChange={setCapacidad}
                error={errores.capacidad}
                placeholder="Ej: 4"
                required
              />

              <Campo
                label="Precio por hora ($)"
                type="number"
                step="0.01"
                min="0"
                valor={precioPorHora}
                onChange={setPrecioPorHora}
                error={errores.precioPorHora}
                placeholder="Ej: 15.00"
                required
              />
            </div>

            <div className="form-group">
              <label>Descripción y características</label>
              <textarea
                className="form-control"
                rows={2}
                placeholder="Ej: Equipado con monitor 4K, pizarra acrílica y café de cortesía."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-checkbox-label">
                <input
                  type="checkbox"
                  checked={disponible}
                  onChange={(e) => setDisponible(e.target.checked)}
                />
                Espacio activo y disponible para reservas
              </label>
            </div>
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
              disabled={enviando}
            >
              {enviando ? 'Guardando...' : esEdicion ? 'Guardar Cambios' : 'Crear Espacio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
