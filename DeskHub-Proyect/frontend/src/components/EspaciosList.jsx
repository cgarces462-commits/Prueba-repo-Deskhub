import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { esGestion, esSuperAdmin } from '../utils/roles';
import {
  TIPOS_ESPACIO,
  etiquetaTipo,
  formatoPrecio,
} from '../utils/catalogos';
import SearchBar from './SearchBar';
import Campo from './Campo';

const FORM_VACIO = {
  nombre: '',
  tipo: 'escritorio',
  ubicacion: '',
  capacidad: 1,
  precioPorHora: 0,
  descripcion: '',
};

export default function EspaciosList({ sesion }) {
  const rol = sesion.role?.nombre;
  const puedeGestionar = esGestion(rol);

  const [espacios, setEspacios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');

  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState(FORM_VACIO);
  const [creando, setCreando] = useState(false);
  const [errorForm, setErrorForm] = useState('');

  async function cargar() {
    setCargando(true);
    setError('');
    try {
      const data = await api.espacios();
      setEspacios(data.espacios || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return espacios;
    return espacios.filter((esp) =>
      [esp.nombre, esp.ubicacion, etiquetaTipo(esp.tipo), esp.descripcion]
        .filter(Boolean)
        .some((valor) => valor.toLowerCase().includes(q))
    );
  }, [espacios, busqueda]);

  function manejarCambio(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function crear(e) {
    e.preventDefault();
    setErrorForm('');
    if (!form.nombre.trim()) {
      setErrorForm('El nombre es obligatorio');
      return;
    }
    setCreando(true);
    try {
      await api.crearEspacio({
        ...form,
        capacidad: Number(form.capacidad) || 1,
        precioPorHora: Number(form.precioPorHora) || 0,
      });
      setForm(FORM_VACIO);
      setMostrarForm(false);
      await cargar();
    } catch (err) {
      setErrorForm(err.message);
    } finally {
      setCreando(false);
    }
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar este espacio?')) return;
    try {
      await api.eliminarEspacio(id);
      await cargar();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="vista">
      <div className="vista-encabezado">
        <h2>Espacios</h2>
        {puedeGestionar && (
          <button
            type="button"
            className="boton primario"
            onClick={() => setMostrarForm((v) => !v)}
          >
            {mostrarForm ? 'Cancelar' : 'Nuevo espacio'}
          </button>
        )}
      </div>

      {error && <div className="alerta error">{error}</div>}

      {mostrarForm && (
        <form className="tarjeta formulario" onSubmit={crear}>
          {errorForm && <div className="alerta error">{errorForm}</div>}
          <Campo
            label="Nombre"
            name="nombre"
            value={form.nombre}
            onChange={manejarCambio}
            placeholder="Sala Zen"
          />
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
            placeholder="Piso 2"
          />
          <Campo
            label="Capacidad"
            name="capacidad"
            type="number"
            min="1"
            value={form.capacidad}
            onChange={manejarCambio}
          />
          <Campo
            label="Precio por hora"
            name="precioPorHora"
            type="number"
            min="0"
            value={form.precioPorHora}
            onChange={manejarCambio}
          />
          <Campo
            label="Descripción"
            name="descripcion"
            value={form.descripcion}
            onChange={manejarCambio}
            placeholder="Descripción breve"
          />
          <button type="submit" className="boton primario" disabled={creando}>
            {creando ? 'Guardando...' : 'Guardar espacio'}
          </button>
        </form>
      )}

      <SearchBar
        valor={busqueda}
        onChange={setBusqueda}
        placeholder="Buscar por nombre, ubicación o tipo..."
      />

      {cargando ? (
        <p className="estado">Cargando espacios...</p>
      ) : filtrados.length === 0 ? (
        <p className="estado">No se encontraron resultados</p>
      ) : (
        <div className="grid">
          {filtrados.map((esp) => (
            <article key={esp.id} className="tarjeta espacio">
              <header>
                <h3>{esp.nombre}</h3>
                <span className={`badge ${esp.disponible ? 'ok' : 'off'}`}>
                  {esp.disponible ? 'Disponible' : 'No disponible'}
                </span>
              </header>
              <p className="meta">{etiquetaTipo(esp.tipo)}</p>
              {esp.ubicacion && <p className="meta">{esp.ubicacion}</p>}
              <p className="meta">Capacidad: {esp.capacidad} personas</p>
              <p className="precio">{formatoPrecio(esp.precioPorHora)} / hora</p>
              {esp.descripcion && <p className="descripcion">{esp.descripcion}</p>}
              {esSuperAdmin(rol) && (
                <button
                  type="button"
                  className="boton peligro"
                  onClick={() => eliminar(esp.id)}
                >
                  Eliminar
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
