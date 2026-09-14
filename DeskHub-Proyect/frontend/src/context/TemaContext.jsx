import { createContext, useEffect, useState } from 'react';

export const TemaContext = createContext({
  tema: 'claro',
  setTema: () => {},
  cambiarTema: () => {},
});

const CLAVE_STORAGE = 'deskhub_tema';

export function TemaProvider({ children }) {
  const [tema, setTema] = useState(() => {
    try {
      const guardado = localStorage.getItem(CLAVE_STORAGE);
      if (guardado && ['claro', 'oscuro', 'glass'].includes(guardado)) {
        return guardado;
      }
    } catch {
      // Fallback si localStorage no está disponible
    }
    return 'claro';
  });

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE_STORAGE, tema);
    } catch {
      // Ignorar error de almacenamiento
    }
    document.documentElement.setAttribute('data-tema', tema);
    document.body.setAttribute('data-tema', tema);
  }, [tema]);

  function cambiarTema(nuevoTema) {
    if (['claro', 'oscuro', 'glass'].includes(nuevoTema)) {
      setTema(nuevoTema);
    }
  }

  return (
    <TemaContext.Provider value={{ tema, setTema, cambiarTema }}>
      {children}
    </TemaContext.Provider>
  );
}
