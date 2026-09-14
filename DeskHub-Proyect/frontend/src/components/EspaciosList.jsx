import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { esGestion, esSuperAdmin } from '../utils/roles';
import { etiquetaTipo, formatoPrecio } from '../utils/catalogos';
import {
  IconBuilding,
  IconCalendar,
  IconClock,
  IconConference,
  IconDesktop,
  IconEdit,
  IconMapPin,
  IconPlus,
  IconTrash,
  IconUsers,
} from './Icons';
import SearchBar from './SearchBar';
import EspacioModal from './EspacioModal';
import ReservaModal from './ReservaModal';

const ICONOS_TIPO = {
  escritorio: IconDesktop,
  oficina_privada: IconBuilding,
  sala_reunion: IconConference,
  sala_conferencia: IconConference,
};

export default function EspaciosList({ sesion }) {
  const rol = sesion.role?.nombre;
  const puedeGestionar = esGestion(rol);
  const esSuper = esSuperAdmin(rol);

  const [espacios, setEspacios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');

  const [modalEspacio, setModalEspacio] = useState(null);
  const [modalReserva, setModalReserva] = useState(null);

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

  function abrirNuevo() {
    setModalEspacio({ modo: 'crear' });
  }

  function abrirEditar(espacio) {
    setModalEspacio({ modo: 'editar', espacio });
  }

  async function eliminar(espacio) {
    if (!confirm(`¿Eliminar el espacio "${espacio.nombre}"?`)) return;
    try {
      await api.eliminarEspacio(espacio.id);
      await cargar();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="vista">
      <div className="vista-encabezado">
        <div>
          <h2>Espacios de trabajo</h2>
          <p className="vista-sub">Encuentra el espacio ideal para tu equipo</p>
        </div>
        {puedeGestionar && (
          <button type="button" className="boton primario" onClick={abrirNuevo}>
            <IconPlus className="icon" /> Nuevo espacio
          </button>
        )}
      </div>

      {error && <div className="alerta error">{error}</div>}

      <SearchBar
        valor={busqueda}
        onChange={setBusqueda}
        placeholder="Buscar por nombre, ubicación o tipo..."
      />

      {cargando ? (
        <div className="vacio">
          <div className="spinner" />
          <p className="estado">Cargando espacios...</p>
        </div>
      ) : filtrados.length === 0 ? (
        <div className="vacio">
          <h3>Sin resultados</h3>
          <p>Aún no hay espacios o tu búsqueda no coincidió.</p>
        </div>
      ) : (
        <div className="grid">
          {filtrados.map((esp) => {
            const Icono = ICONOS_TIPO[esp.tipo] || IconBuilding;
            return (
              <article key={esp.id} className="tarjeta espacio">
                <header className="espacio-header">
                  <span className={`espacio-icono espacio-icono-${esp.tipo}`}>
                    <Icono className="icon" />
                  </span>
                  <span className={`badge ${esp.disponible ? 'ok' : 'off'}`}>
                    {esp.disponible ? 'Disponible' : 'No disponible'}
                  </span>
                </header>

                <h3 className="espacio-nombre">{esp.nombre}</h3>
                <p className="meta espacio-tipo">{etiquetaTipo(esp.tipo)}</p>

                <div className="espacio-caracteristicas">
                  {esp.ubicacion && (
                    <span className="meta">
                      <IconMapPin className="icon" /> {esp.ubicacion}
                    </span>
                  )}
                  <span className="meta">
                    <IconUsers className="icon" /> {esp.capacidad} personas
                  </span>
                  {esp.descripcion && (
                    <span className="meta">
                      <IconClock className="icon" /> {esp.descripcion}
                    </span>
                  )}
                </div>

                <div className="espacio-precio">{formatoPrecio(esp.precioPorHora)} <small>/ hora</small></div>

                <footer className="espacio-acciones">
                  {esp.disponible && (
                    <button
                      type="button"
                      className="boton primario"
                      onClick={() => setModalReserva(esp)}
                    >
                      <IconCalendar className="icon" /> Reservar
                    </button>
                  )}
                  {puedeGestionar && (
                    <button
                      type="button"
                      className="boton secundario"
                      onClick={() => abrirEditar(esp)}
                      aria-label={`Editar ${esp.nombre}`}
                    >
                      <IconEdit className="icon" /> Editar
                    </button>
                  )}
                  {esSuper && (
                    <button
                      type="button"
                      className="boton peligro icono"
                      onClick={() => eliminar(esp)}
                      aria-label={`Eliminar ${esp.nombre}`}
                    >
                      <IconTrash className="icon" />
                    </button>
                  )}
                </footer>
              </article>
            );
          })}
        </div>
      )}

      {modalEspacio && (
        <EspacioModal
          isOpen
          espacioAEditar={modalEspacio.modo === 'editar' ? modalEspacio.espacio : null}
          onCerrar={() => setModalEspacio(null)}
          onGuardado={cargar}
        />
      )}

      {modalReserva && (
        <ReservaModal
          isOpen
          espacio={modalReserva}
          onCerrar={() => setModalReserva(null)}
          onReservaExitosa={cargar}
        />
      )}
    </section>
  );
}