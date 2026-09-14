import { createContext, useEffect, useState } from 'react';

export const TemaContext = createContext({
  tema: 'claro',
  setTema: () => {},
  cambiarTema: () => {},
});

const CLAVE_STORAGE = 'facturacion_tema';

export function TemaProvider({ children }) {
  const [tema, setTema] = useState(() => {
    try {
      const guardado = localStorage.getItem(CLAVE_STORAGE);
      if (guardado && ['claro', 'oscuro'].includes(guardado)) return guardado;
    } catch {}
    return 'claro';
  });

  useEffect(() => {
    try { localStorage.setItem(CLAVE_STORAGE, tema); } catch {}
    document.documentElement.setAttribute('data-tema', tema);
    document.body.setAttribute('data-tema', tema);
  }, [tema]);

  function cambiarTema(nuevoTema) {
    if (['claro', 'oscuro'].includes(nuevoTema)) setTema(nuevoTema);
  }

  return (
    <TemaContext.Provider value={{ tema, setTema, cambiarTema }}>
      {children}
    </TemaContext.Provider>
  );
}
