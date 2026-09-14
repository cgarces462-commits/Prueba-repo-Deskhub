import { useState } from 'react';
import { api, guardarSesion } from '../services/api';
import { validarLogin, hayErrores } from '../utils/validacion';
import Campo from './Campo';
import AuthLayout from './AuthLayout';

export default function LoginForm({ onLogin, irARegistro, aviso }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errores, setErrores] = useState({});
  const [errorServidor, setErrorServidor] = useState('');
  const [enviando, setEnviando] = useState(false);

  function manejarCambio(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrores((prev) => ({ ...prev, [e.target.name]: '' }));
  }

  async function manejarEnvio(e) {
    e.preventDefault();
    setErrorServidor('');
    const nuevosErrores = validarLogin(form);
    if (hayErrores(nuevosErrores)) {
      setErrores(nuevosErrores);
      return;
    }

    setEnviando(true);
    try {
      const data = await api.login(form);
      guardarSesion(data.token, data.usuario);
      onLogin(data.usuario);
    } catch (error) {
      setErrorServidor(error.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AuthLayout
      titulo="Bienvenido de nuevo"
      subtitulo="Inicia sesión para acceder al sistema"
    >
      {aviso && <div className="alerta exito">{aviso}</div>}
      {errorServidor && <div className="alerta error">{errorServidor}</div>}

      <form onSubmit={manejarEnvio} noValidate>
        <div className="campos">
          <Campo
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={manejarCambio}
            error={errores.email}
            placeholder="tu@email.com"
            autoComplete="email"
          />
          <Campo
            label="Contraseña"
            name="password"
            type="password"
            value={form.password}
            onChange={manejarCambio}
            error={errores.password}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>

        <button type="submit" className="boton primario block" disabled={enviando}>
          {enviando ? 'Ingresando...' : 'Ingresar'}
        </button>

        <p className="pie">
          ¿Aún no tienes cuenta?{' '}
          <button type="button" className="enlace" onClick={irARegistro}>
            Regístrate gratis
          </button>
        </p>

        <div className="aviso-demo">
          <strong>Cuenta de prueba:</strong> superadmin@facturacionmedellin.com · SuperAdmin123
        </div>
      </form>
    </AuthLayout>
  );
}
