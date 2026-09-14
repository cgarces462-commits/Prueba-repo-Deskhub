import { useState } from 'react';
import { api } from '../services/api';
import Campo from './Campo';
import { IconPlus, IconTrash, IconX } from './Icons';
import { TIPOS_ESPACIO } from '../utils/catalogos';
import { validarEspacio, hayErrores } from '../utils/validacion';

export default function EspacioModal({ espacioAEditar, isOpen, onCerrar, onGuardado, onImagenesCambiadas }) {
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
  const [imagenes, setImagenes] = useState(
    (inicial.imagenes || []).map((im) => ({ id: im.id, url: im.url }))
  );
  const [subiendo, setSubiendo] = useState(false);
  const [errorImagen, setErrorImagen] = useState('');

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

  async function manejarSubirImagen(e) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    setSubiendo(true);
    setErrorImagen('');
    try {
      const res = await api.subirImagen(espacioAEditar.id, archivo);
      setImagenes((prev) => [...prev, res.imagen]);
      onImagenesCambiadas?.();
    } catch (err) {
      setErrorImagen(err.message || 'No se pudo subir la imagen');
    } finally {
      setSubiendo(false);
      e.target.value = '';
    }
  }

  async function manejarEliminarImagen(imagenId) {
    if (!confirm('¿Eliminar esta imagen de la galería?')) return;
    setSubiendo(true);
    setErrorImagen('');
    try {
      await api.eliminarImagen(espacioAEditar.id, imagenId);
      setImagenes((prev) => prev.filter((im) => im.id !== imagenId));
      onImagenesCambiadas?.();
    } catch (err) {
      setErrorImagen(err.message || 'No se pudo eliminar la imagen');
    } finally {
      setSubiendo(false);
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

            {esEdicion && (
              <div className="galeria-editor">
                <div className="galeria-editor-cabecera">
                  <h4>Galería de imágenes</h4>
                  <span className="meta">{imagenes.length} imagen(es)</span>
                </div>

                <div className="galeria-editor-rejilla">
                  {imagenes.map((im) => (
                    <div className="galeria-editor-item" key={im.id}>
                      <img src={im.url} alt="" />
                      <button
                        type="button"
                        className="galeria-editor-quitar"
                        onClick={() => manejarEliminarImagen(im.id)}
                        disabled={subiendo}
                        aria-label="Eliminar imagen"
                      >
                        <IconTrash className="icon" />
                      </button>
                    </div>
                  ))}

                  <label className="galeria-editor-subir">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                      hidden
                      disabled={subiendo}
                      onChange={manejarSubirImagen}
                    />
                    <IconPlus className="icon" />
                    <span>{subiendo ? 'Subiendo...' : 'Agregar'}</span>
                  </label>
                </div>

                {errorImagen && <div className="alerta error">{errorImagen}</div>}
                <p className="galeria-editor-nota">
                  Estas imágenes se usan en la galería del espacio y en el carrusel de
                  reservas. JPG, PNG, WebP, GIF o SVG (máx. 5 MB).
                </p>
              </div>
            )}
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