import { useEffect, useState } from 'react';
import { getSesion, cerrarSesion } from './services/api';
import LoginForm from './components/LoginForm';
import RegistroForm from './components/RegistroForm';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import ClientesList from './components/ClientesList';
import ServiciosList from './components/ServiciosList';
import TarifasList from './components/TarifasList';
import FacturasList from './components/FacturasList';
import PagosList from './components/PagosList';
import UsuariosList from './components/UsuariosList';
import { useTema } from './context/useTema';

export default function App() {
  const { tema } = useTema();
  const [sesion, setSesion] = useState(() => getSesion()?.usuario || null);
  const [modoAuth, setModoAuth] = useState('login');
  const [aviso, setAviso] = useState('');
  const [vista, setVista] = useState('inicio');

  useEffect(() => {
    function alExpirar() {
      setSesion(null);
      setAviso('Tu sesión expiró. Vuelve a iniciar sesión.');
    }
    window.addEventListener('facturacion:sesion-expirada', alExpirar);
    return () => window.removeEventListener('facturacion:sesion-expirada', alExpirar);
  }, []);

  function iniciarSesion(usuario) {
    setAviso('');
    setSesion(usuario);
    setVista('inicio');
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
        irARegistro={() => { setAviso(''); setModoAuth('registro'); }}
        aviso={aviso}
      />
    );
  }

  return (
    <div className="app" data-rol={sesion.role?.nombre || ''} data-tema={tema}>
      <Navbar
        sesion={sesion}
        vistaActual={vista}
        onNavegar={setVista}
        onCerrarSesion={salir}
      />
      <main className="contenedor">
        {vista === 'inicio' && <Dashboard sesion={sesion} onNavegar={setVista} />}
        {vista === 'clientes' && <ClientesList sesion={sesion} />}
        {vista === 'servicios' && <ServiciosList sesion={sesion} />}
        {vista === 'tarifas' && <TarifasList sesion={sesion} />}
        {vista === 'facturas' && <FacturasList sesion={sesion} />}
        {vista === 'pagos' && <PagosList sesion={sesion} />}
        {vista === 'usuarios' && <UsuariosList sesion={sesion} />}
      </main>
    </div>
  );
}
