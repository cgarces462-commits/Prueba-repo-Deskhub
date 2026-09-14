import { useRef } from 'react';
import { IconBuilding, IconCalendar, IconCheck, IconDesk } from './Icons';
import FondoCurva from './FondoCurva';
import SelectorTema from './SelectorTema';
import FondoIteracion from './FondoIteracion';
import { useTema } from '../context/useTema';

export default function AuthLayout({ titulo, subtitulo, children }) {
  const { tema } = useTema();
  const tarjetaRef = useRef(null);

  function moverTarjeta(e) {
    const el = tarjetaRef.current;
    if (!el) return;
    const x = window.innerWidth / 2;
    const y = window.innerHeight / 2;
    const mouseX = e.clientX - x;
    const mouseY = e.clientY - y;
    const rotateY = (mouseX / x) * 4;
    const rotateX = -(mouseY / y) * 4;
    el.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  }

  function soltarTarjeta() {
    const el = tarjetaRef.current;
    if (el) el.style.transform = '';
  }

  return (
    <div className="auth" data-tema={tema} onMouseMove={moverTarjeta} onMouseLeave={soltarTarjeta}>
      {tema === 'glass' ? (
        <FondoIteracion />
      ) : (
        <div className="fondo-blobs" aria-hidden="true">
          <div className="blob blob-1" />
          <div className="blob blob-2" />
          <div className="blob blob-3" />
        </div>
      )}
      <div className="auth-tema-top">
        <SelectorTema />
      </div>
      <aside className="auth-panel">
        <FondoCurva suave />
        <div className="auth-panel-marca">
          <span className="marca-logo grande">
            <img src="/logo.png" alt="DeskHub" />
          </span>
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
        <div className="auth-tarjeta" ref={tarjetaRef}>
          <div className="shine" aria-hidden="true" />
          <h2>{titulo}</h2>
          <p className="subtitulo">{subtitulo}</p>
          {children}
        </div>
      </main>
    </div>
  );
}