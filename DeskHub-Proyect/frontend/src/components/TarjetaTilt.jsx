import { useRef } from 'react';

export default function TarjetaTilt({ children, className = '' }) {
  const ref = useRef(null);

  function mover(e) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ox = e.clientX - rect.left;
    const oy = e.clientY - rect.top;
    const rx = ((oy - rect.height / 2) / rect.height) * 9;
    const ry = ((ox - rect.width / 2) / rect.width) * 9;
    el.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    el.style.setProperty('--bX', `${50 + (ry / 9) * 24}%`);
    el.style.setProperty('--bY', `${40 + (rx / 9) * 24}%`);
  }

  function salir() {
    const el = ref.current;
    if (!el) return;
    el.style.transform = '';
  }

  return (
    <div
      ref={ref}
      className={`tilt${className ? ` ${className}` : ''}`}
      onMouseMove={mover}
      onMouseLeave={salir}
    >
      {children}
    </div>
  );
}