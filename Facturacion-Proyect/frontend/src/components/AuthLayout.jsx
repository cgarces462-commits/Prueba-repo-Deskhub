import { useRef } from 'react';
import { IconFile, IconCheck, IconDollar } from './Icons';
import SelectorTema from './SelectorTema';
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
      <div className="fondo-blobs" aria-hidden="true">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>
      <div className="auth-tema-top">
        <SelectorTema />
      </div>
      <aside className="auth-panel">
        <div className="auth-panel-marca">
          <span className="marca-logo grande">
            <IconFile className="icon logo-icono" />
          </span>
          <span>Facturación EPM</span>
        </div>
        <div className="auth-panel-contenido">
          <h1>Sistema de facturación para empresas públicas de Medellín.</h1>
          <p>
            Gestiona servicios, clientes, facturas y recaudo de forma
            sencilla y eficiente.
          </p>
          <ul className="auth-features">
            <li><IconCheck className="icon" /> Gestión de clientes y servicios</li>
            <li><IconDollar className="icon" /> Facturación automática</li>
            <li><IconFile className="icon" /> Control de pagos y recaudo</li>
          </ul>
        </div>
        <div className="auth-panel-pie">
          <IconFile className="icon" /> Facturación EPM — Empresas Públicas de Medellín
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
