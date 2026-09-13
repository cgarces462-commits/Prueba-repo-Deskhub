import { useEffect, useState } from 'react';
import { getSesion, cerrarSesion } from './services/api';
import LoginForm from './components/LoginForm';
import RegistroForm from './components/RegistroForm';
import Navbar from './components/Navbar';
import EspaciosList from './components/EspaciosList';
import ReservasList from './components/ReservasList';
import UsuariosList from './components/UsuariosList';

export default function App() {
  const [sesion, setSesion] = useState(() => getSesion()?.usuario || null);
  const [modoAuth, setModoAuth] = useState('login');
  const [aviso, setAviso] = useState('');
  const [vista, setVista] = useState('espacios');

  useEffect(() => {
    function alExpirar() {
      setSesion(null);
      setAviso('Tu sesión expiró. Vuelve a iniciar sesión.');
    }
    window.addEventListener('deskhub:sesion-expirada', alExpirar);
    return () =>
      window.removeEventListener('deskhub:sesion-expirada', alExpirar);
  }, []);

  function iniciarSesion(usuario) {
    setAviso('');
    setSesion(usuario);
    setVista('espacios');
  }

  function salir() {
    cerrarSesion();
    setSesion(null);
    setModoAuth('login');
    setAviso('');
  }

  if (!sesion) {
    if (modoAuth === 'registro') {
      return (
        <RegistroForm
          irALogin={() => setModoAuth('login')}
          onRegistrado={(email) => {
            setAviso(`Cuenta creada para ${email}. Ya puedes iniciar sesión.`);
            setModoAuth('login');
          }}
        />
      );
    }
    return (
      <LoginForm
        onLogin={iniciarSesion}
        irARegistro={() => {
          setAviso('');
          setModoAuth('registro');
        }}
        aviso={aviso}
      />
    );
  }

  return (
    <div className="app">
      <Navbar
        sesion={sesion}
        vistaActual={vista}
        onNavegar={setVista}
        onCerrarSesion={salir}
      />
      <main className="contenedor">
        {vista === 'espacios' && <EspaciosList sesion={sesion} />}
        {vista === 'reservas' && <ReservasList sesion={sesion} />}
        {vista === 'usuarios' && <UsuariosList sesion={sesion} />}
      </main>
    </div>
  );
}
