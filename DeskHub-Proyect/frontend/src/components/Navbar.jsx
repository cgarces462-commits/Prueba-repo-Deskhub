import { esGestion, etiquetaRol } from '../utils/roles';

export default function Navbar({ sesion, vistaActual, onNavegar, onCerrarSesion }) {
  const rol = sesion.role?.nombre;
  const nombre = [sesion.nombre, sesion.apellido].filter(Boolean).join(' ');

  return (
    <header className="navbar">
      <div className="navbar-marca">DeskHub</div>

      <nav className="navbar-menu">
        <button
          type="button"
          className={vistaActual === 'espacios' ? 'activo' : ''}
          onClick={() => onNavegar('espacios')}
        >
          Espacios
        </button>
        <button
          type="button"
          className={vistaActual === 'reservas' ? 'activo' : ''}
          onClick={() => onNavegar('reservas')}
        >
          Reservas
        </button>
        {esGestion(rol) && (
          <button
            type="button"
            className={vistaActual === 'usuarios' ? 'activo' : ''}
            onClick={() => onNavegar('usuarios')}
          >
            Usuarios
          </button>
        )}
      </nav>

      <div className="navbar-usuario">
        <span className="usuario-info">
          {nombre} <small>({etiquetaRol(rol)})</small>
        </span>
        <button type="button" className="boton secundario" onClick={onCerrarSesion}>
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
