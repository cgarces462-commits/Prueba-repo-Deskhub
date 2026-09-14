import { useState } from 'react';
import { api } from '../services/api';
import Campo from './Campo';
import { IconX } from './Icons';
import { TIPOS_ESPACIO } from '../utils/catalogos';
import { validarEspacio, hayErrores } from '../utils/validacion';

export default function EspacioModal({ espacioAEditar, isOpen, onCerrar, onGuardado }) {
  const inicial = espacioAEditar || {};
  const [form, setForm] = useState({
    nombre: inicial.nombre || '',
    tipo: inicial.tipo || 'escritorio',
    ubicacion: inicial.ubicacion || '',
    capacidad: inicial.capacidad ?? 1,
    precioPorHora: inicial.precioPorHora ?? 0,
    descripcion: inicial.descripcion || '',
    disponible: inicial.disponible !== false,
  });
  const [errores, setErrores] = useState({});
  const [errorApi, setErrorApi] = useState('');
  const [enviando, setEnviando] = useState(false);

  const esEdicion = Boolean(espacioAEditar);

  if (!isOpen) return null;

  function manejarCambio(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setErrores((prev) => ({ ...prev, [name]: '' }));
  }

  async function manejarSubmit(e) {
    e.preventDefault();
    setErrorApi('');
    const nuevosErrores = validarEspacio(form);
    if (hayErrores(nuevosErrores)) {
      setErrores(nuevosErrores);
      return;
    }

    const payload = {
      nombre: form.nombre.trim(),
      tipo: form.tipo,
      ubicacion: form.ubicacion.trim() || null,
      capacidad: Number(form.capacidad),
      precioPorHora: Number(form.precioPorHora),
      descripcion: form.descripcion.trim() || null,
      disponible: form.disponible,
    };

    setEnviando(true);
    try {
      if (esEdicion) {
        await api.editarEspacio(espacioAEditar.id, payload);
      } else {
        await api.crearEspacio(payload);
      }
      onGuardado();
      onCerrar();
    } catch (err) {
      setErrorApi(err.message || 'Ocurrió un error al guardar el espacio');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>{esEdicion ? 'Editar espacio' : 'Nuevo espacio'}</h3>
            <p className="modal-sub">{esEdicion ? 'Actualiza los datos del espacio' : 'Agrega un espacio de trabajo al catálogo'}</p>
          </div>
          <button type="button" className="icono-boton" onClick={onCerrar} aria-label="Cerrar">
            <IconX />
          </button>
        </div>

        <form onSubmit={manejarSubmit}>
          <div className="modal-body">
            {errorApi && <div className="alerta error">{errorApi}</div>}

            <Campo
              label="Nombre"
              name="nombre"
              value={form.nombre}
              onChange={manejarCambio}
              error={errores.nombre}
              placeholder="Ej: Sala Innovación B"
            />

            <div className="form-row">
              <Campo label="Tipo" name="tipo">
                <select name="tipo" value={form.tipo} onChange={manejarCambio}>
                  {TIPOS_ESPACIO.map((t) => (
                    <option key={t.valor} value={t.valor}>
                      {t.etiqueta}
                    </option>
                  ))}
                </select>
              </Campo>
              <Campo
                label="Ubicación"
                name="ubicacion"
                value={form.ubicacion}
                onChange={manejarCambio}
                placeholder="Piso 2 - Ala Norte"
              />
            </div>

            <div className="form-row">
              <Campo
                label="Capacidad (personas)"
                name="capacidad"
                type="number"
                min="1"
                value={form.capacidad}
                onChange={manejarCambio}
                error={errores.capacidad}
              />
              <Campo
                label="Precio por hora"
                name="precioPorHora"
                type="number"
                min="0"
                value={form.precioPorHora}
                onChange={manejarCambio}
                error={errores.precioPorHora}
              />
            </div>

            <Campo
              label="Descripción"
              name="descripcion"
              value={form.descripcion}
              onChange={manejarCambio}
              placeholder="Equipado con monitor, pizarra y café de cortesía"
            />

            <label className="campo-check">
              <input
                type="checkbox"
                name="disponible"
                checked={form.disponible}
                onChange={manejarCambio}
              />
              <span>Espacio activo y disponible para reservas</span>
            </label>
          </div>

          <div className="modal-footer">
            <button type="button" className="boton secundario" onClick={onCerrar} disabled={enviando}>
              Cancelar
            </button>
            <button type="submit" className="boton primario" disabled={enviando}>
              {enviando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear espacio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}