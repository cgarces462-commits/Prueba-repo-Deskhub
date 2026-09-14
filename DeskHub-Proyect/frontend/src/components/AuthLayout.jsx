import { IconBuilding, IconCalendar, IconCheck, IconDesk } from './Icons';

export default function AuthLayout({ titulo, subtitulo, children }) {
  return (
    <div className="auth">
      <aside className="auth-panel">
        <div className="auth-panel-marca">
          <span className="marca-logo grande">D</span>
          <span>DeskHub</span>
        </div>
        <div className="auth-panel-contenido">
          <h1>El espacio ideal para tu equipo, cuando lo necesitas.</h1>
          <p>
            Reserva escritorios, oficinas privadas y salas de reunión en segundos.
            Un coworking pensado para trabajar sin fricciones.
          </p>
          <ul className="auth-features">
            <li><IconCheck className="icon" /> Reserva en línea 24/7</li>
            <li><IconCalendar className="icon" /> Control en tiempo real de tu agenda</li>
            <li><IconBuilding className="icon" /> Espacios para todo tipo de equipo</li>
          </ul>
        </div>
        <div className="auth-panel-pie">
          <IconDesk className="icon" /> DeskHub — Trabaja mejor, llega más lejos
        </div>
      </aside>

      <main className="auth-formulario">
        <div className="auth-tarjeta">
          <h2>{titulo}</h2>
          <p className="subtitulo">{subtitulo}</p>
          {children}
        </div>
      </main>
    </div>
  );
}