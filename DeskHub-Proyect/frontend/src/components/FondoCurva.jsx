export default function FondoCurva({ suave = false }) {
  return (
    <div className={`fondo-curva${suave ? ' fondo-curva--suave' : ''}`} aria-hidden="true">
      <svg
        className="fondo-curva-svg"
        viewBox="0 0 1200 320"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="curva-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="var(--primario)" stopOpacity="0.55" />
            <stop offset="0.5" stopColor="var(--primario-oscuro)" stopOpacity="0.35" />
            <stop offset="1" stopColor="var(--primario)" stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id="curva-grad-2" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0" stopColor="var(--primario-oscuro)" stopOpacity="0.30" />
            <stop offset="1" stopColor="var(--primario)" stopOpacity="0.45" />
          </linearGradient>
        </defs>
        <path
          className="fondo-curva-path fondo-curva-path-1"
          d="M0,150 C300,40 600,210 1200,70 L1200,320 L0,320 Z"
          fill="url(#curva-grad)"
        />
        <path
          className="fondo-curva-path fondo-curva-path-2"
          d="M0,210 C350,110 700,250 1200,130 L1200,320 L0,320 Z"
          fill="url(#curva-grad-2)"
        />
        <path
          className="fondo-curva-path fondo-curva-path-3"
          d="M0,260 C400,180 800,300 1200,200 L1200,320 L0,320 Z"
          fill="url(#curva-grad)"
        />
      </svg>
    </div>
  );
}