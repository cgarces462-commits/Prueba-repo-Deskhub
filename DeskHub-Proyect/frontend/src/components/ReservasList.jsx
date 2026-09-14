import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { esStaff } from '../utils/roles';
import {
  ESTADOS_RESERVA,
  etiquetaEstado,
  formatoFecha,
} from '../utils/catalogos';
import SearchBar from './SearchBar';
import Campo from './Campo';

const FORM_VACIO = { spaceId: '', fechaInicio: '', fechaFin: '', notas: '' };

export default function ReservasList({ sesion }) {
  const rol = sesion.role?.nombre;
  const staff = esStaff(rol);

  const [reservas, setReservas] = useState([]);
  const [espacios, setEspacios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');

  const [form, setForm] = useState(FORM_VACIO);
  const [creando, setCreando] = useState(false);
  const [errorForm, setErrorForm] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);

  async function cargar() {
    setCargando(true);
    setError('');
    try {
      const [dataReservas, dataEspacios] = await Promise.all([
        api.reservas(),
        api.espacios(),
      ]);
      setReservas(dataReservas.reservas || []);
      setEspacios((dataEspacios.espacios || []).filter((e) => e.disponible));
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return reservas;
    return reservas.filter((r) =>
      [
        r.espacio?.nombre,
        r.usuario?.nombre,
        r.usuario?.apellido,
        r.usuario?.email,
        etiquetaEstado(r.estado),
        r.notas,
      ]
        .filter(Boolean)
        .some((valor) => String(valor).toLowerCase().includes(q))
    );
  }, [reservas, busqueda]);

  function manejarCambio(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function crear(e) {
    e.preventDefault();
    setErrorForm('');
    if (!form.spaceId || !form.fechaInicio || !form.fechaFin) {
      setErrorForm('Espacio, fecha de inicio y fecha de fin son obligatorios');
      return;
    }
    setCreando(true);
    try {
      await api.crearReserva({
        spaceId: Number(form.spaceId),
        fechaInicio: new Date(form.fechaInicio).toISOString(),
        fechaFin: new Date(form.fechaFin).toISOString(),
        notas: form.notas,
      });
      setForm(FORM_VACIO);
      await cargar();
    } catch (err) {
      setErrorForm(err.message);
    } finally {
      setCreando(false);
    }
  }

  async function cambiarEstado(id, estado) {
    try {
      await api.cambiarEstadoReserva(id, estado);
      await cargar();
    } catch (err) {
      setError(err.message);
    }
  }

  async function cancelar(id) {
    if (!confirm('¿Cancelar esta reserva?')) return;
    try {
      await api.cancelarReserva(id);
      await cargar();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="vista">
      <div className="vista-encabezado">
        <div>
          <h2>Reservas</h2>
          <p className="vista-sub">Gestiona tus reservas de espacios</p>
        </div>
        <button
          type="button"
          className="boton primario"
          onClick={() => setMostrarForm((v) => !v)}
        >
          {mostrarForm ? 'Cancelar' : 'Nueva reserva'}
        </button>
      </div>

      {error && <div className="alerta error">{error}</div>}

      {mostrarForm && (
        <form className="tarjeta formulario" onSubmit={crear}>
          <h3>Nueva reserva</h3>
          {errorForm && <div className="alerta error">{errorForm}</div>}
          <Campo label="Espacio" name="spaceId">
            <select name="spaceId" value={form.spaceId} onChange={manejarCambio}>
              <option value="">Selecciona un espacio...</option>
              {espacios.map((esp) => (
                <option key={esp.id} value={esp.id}>
                  {esp.nombre}
                </option>
              ))}
            </select>
          </Campo>
          <Campo
            label="Inicio"
            name="fechaInicio"
            type="datetime-local"
            value={form.fechaInicio}
            onChange={manejarCambio}
          />
          <Campo
            label="Fin"
            name="fechaFin"
            type="datetime-local"
            value={form.fechaFin}
            onChange={manejarCambio}
          />
          <Campo
            label="Notas (opcional)"
            name="notas"
            value={form.notas}
            onChange={manejarCambio}
            placeholder="Motivo de la reserva"
          />
          <button type="submit" className="boton primario" disabled={creando}>
            {creando ? 'Reservando...' : 'Reservar'}
          </button>
        </form>
      )}

      <SearchBar
        valor={busqueda}
        onChange={setBusqueda}
        placeholder="Buscar por espacio, usuario o estado..."
      />

      {cargando ? (
        <div className="vacio">
          <div className="spinner" />
          <p className="estado">Cargando reservas...</p>
        </div>
      ) : filtradas.length === 0 ? (
        <div className="vacio">
          <h3>Sin reservas</h3>
          <p>No se encontraron reservas que coincidan con tu búsqueda.</p>
        </div>
      ) : (
        <div className="tabla-envoltura">
          <table className="tabla">
            <thead>
              <tr>
                <th>Espacio</th>
                <th>Usuario</th>
                <th>Inicio</th>
                <th>Fin</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((r) => {
                const esPropia = r.userId === sesion.id;
                const activa = !['cancelada', 'completada'].includes(r.estado);
                return (
                  <tr key={r.id}>
                    <td>{r.espacio?.nombre || '—'}</td>
                    <td>
                      {r.usuario
                        ? `${r.usuario.nombre} ${r.usuario.apellido || ''}`.trim()
                        : '—'}
                    </td>
                    <td>{formatoFecha(r.fechaInicio)}</td>
                    <td>{formatoFecha(r.fechaFin)}</td>
                    <td>
                      <span className={`badge estado-${r.estado}`}>
                        {etiquetaEstado(r.estado)}
                      </span>
                    </td>
                    <td className="acciones">
                      {staff ? (
                        <select
                          value={r.estado}
                          onChange={(e) => cambiarEstado(r.id, e.target.value)}
                        >
                          {ESTADOS_RESERVA.map((est) => (
                            <option key={est.valor} value={est.valor}>
                              {est.etiqueta}
                            </option>
                          ))}
                        </select>
                      ) : (
                        esPropia &&
                        activa && (
                          <button
                            type="button"
                            className="boton peligro"
                            onClick={() => cancelar(r.id)}
                          >
                            Cancelar
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
