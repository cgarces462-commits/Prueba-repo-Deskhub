import { useTema } from '../context/useTema';
import { IconSun, IconMoon } from './Icons';

export default function SelectorTema({ className = '', compacto = false }) {
  const { tema, cambiarTema } = useTema();

  const opciones = [
    { id: 'claro', etiqueta: 'Claro', Icono: IconSun, titulo: 'Modo Claro' },
    { id: 'oscuro', etiqueta: 'Oscuro', Icono: IconMoon, titulo: 'Modo Oscuro' },
  ];

  return (
    <div
      className={`selector-tema${compacto ? ' selector-tema--compacto' : ''}${className ? ` ${className}` : ''}`}
      role="radiogroup"
      aria-label="Seleccionar modo de visualización"
    >
      {opciones.map(({ id, etiqueta, Icono, titulo }) => {
        const activo = tema === id;
        return (
          <button
            key={id}
            type="button"
            className={`selector-tema-btn${activo ? ' activo' : ''}`}
            onClick={() => cambiarTema(id)}
            title={titulo}
            role="radio"
            aria-checked={activo}
          >
            <Icono className="icon" />
            <span className="selector-tema-texto">{etiqueta}</span>
          </button>
        );
      })}
    </div>
  );
}
