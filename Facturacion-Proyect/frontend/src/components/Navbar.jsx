import { esGestion, esFacturacion, etiquetaRol } from '../utils/roles';
import { IconGrid, IconUsers, IconFile, IconDollar, IconLogOut } from './Icons';
import SelectorTema from './SelectorTema';

function iniciales(nombre, apellido) {
  const da = (s) => (s ? s.trim()[0]?.toUpperCase() : '');
  return (da(nombre) + da(apellido) || 'F').slice(0, 2);
}

export default function Navbar({ sesion, vistaActual, onNavegar, onCerrarSesion }) {
  const rol = sesion.role?.nombre;
  const nombre = [sesion.nombre, sesion.apellido].filter(Boolean).join(' ');

  const items = [
    { id: 'inicio', etiqueta: 'Inicio', Icono: IconGrid },
  ];

  if (esFacturacion(rol)) {
    items.push(
      { id: 'clientes', etiqueta: 'Clientes', Icono: IconUsers },
      { id: 'servicios', etiqueta: 'Servicios', Icono: IconFile },
      { id: 'tarifas', etiqueta: 'Tarifas', Icono: IconDollar },
      { id: 'facturas', etiqueta: 'Facturas', Icono: IconFile },
      { id: 'pagos', etiqueta: 'Pagos', Icono: IconDollar },
    );
  } else {
    items.push({ id: 'facturas', etiqueta: 'Mis Facturas', Icono: IconFile });
  }

  if (esGestion(rol)) {
    items.push({ id: 'usuarios', etiqueta: 'Usuarios', Icono: IconUsers });
  }

  return (
    <header className="navbar">
      <div className="navbar-marca">
        <span className="marca-logo">
          <IconFile className="icon" />
        </span>
        <span>Facturación EPM</span>
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

      <div className="navbar-acciones">
        <SelectorTema />
        <div className="navbar-usuario">
          <span className="avatar" aria-hidden>
            {iniciales(sesion.nombre, sesion.apellido)}
          </span>
          <span className="usuario-info">
            <strong>{nombre || 'Usuario'}</strong>
            <small className="badge-rol">{etiquetaRol(rol)}</small>
          </span>
          <button
            type="button"
            className="boton icono"
            onClick={onCerrarSesion}
            title="Cerrar sesión"
          >
            <IconLogOut className="icon" />
          </button>
        </div>
      </div>
    </header>
  );
}
