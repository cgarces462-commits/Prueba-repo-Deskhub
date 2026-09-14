import { esGestion, etiquetaRol } from '../utils/roles';
import { IconBuilding, IconCalendar, IconGrid, IconLogOut, IconUsers } from './Icons';

function iniciales(nombre, apellido) {
  const da = (s) => (s ? s.trim()[0]?.toUpperCase() : '');
  return (da(nombre) + da(apellido) || 'D').slice(0, 2);
}

export default function Navbar({ sesion, vistaActual, onNavegar, onCerrarSesion }) {
  const rol = sesion.role?.nombre;
  const nombre = [sesion.nombre, sesion.apellido].filter(Boolean).join(' ');

  const items = [
    { id: 'inicio', etiqueta: 'Inicio', Icono: IconGrid },
    { id: 'espacios', etiqueta: 'Espacios', Icono: IconBuilding },
    { id: 'reservas', etiqueta: 'Reservas', Icono: IconCalendar },
  ];
  if (esGestion(rol)) {
    items.push({ id: 'usuarios', etiqueta: 'Usuarios', Icono: IconUsers });
  }

  return (
    <header className="navbar">
      <div className="navbar-marca">
        <span className="marca-logo">D</span>
        <span>DeskHub</span>
      </div>

      <nav className="navbar-menu" aria-label="Navegación principal">
        {items.map(({ id, etiqueta, Icono }) => (
          <button
            key={id}
            type="button"
            className={vistaActual === id ? 'activo' : ''}
            onClick={() => onNavegar(id)}
          >
            <Icono className="icon" /> {etiqueta}
          </button>
        ))}
      </nav>

      <div className="navbar-usuario">
        <span className="avatar" aria-hidden>
          {iniciales(sesion.nombre, sesion.apellido)}
        </span>
        <span className="usuario-info">
          <strong>{nombre || 'Usuario'}</strong>
          <small>{etiquetaRol(rol)}</small>
        </span>
        <button
          type="button"
          className="boton icono"
          onClick={onCerrarSesion}
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
        >
          <IconLogOut className="icon" />
        </button>
      </div>
    </header>
  );
}