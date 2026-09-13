import { useState } from 'react';
import { api } from '../services/api';
import { validarRegistro, hayErrores } from '../utils/validacion';
import Campo from './Campo';

export default function RegistroForm({ onRegistrado, irALogin }) {
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    password: '',
    confirmar: '',
  });
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
    const nuevosErrores = validarRegistro(form);
    if (hayErrores(nuevosErrores)) {
      setErrores(nuevosErrores);
      return;
    }

    setEnviando(true);
    try {
      await api.registrar({
        nombre: form.nombre,
        apellido: form.apellido,
        email: form.email,
        telefono: form.telefono,
        password: form.password,
      });
      onRegistrado(form.email);
    } catch (error) {
      setErrorServidor(error.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="auth">
      <form className="tarjeta auth-tarjeta" onSubmit={manejarEnvio} noValidate>
        <h1>Crear cuenta</h1>
        <p className="subtitulo">Regístrate para reservar espacios en DeskHub</p>

        {errorServidor && <div className="alerta error">{errorServidor}</div>}

        <Campo
          label="Nombre"
          name="nombre"
          value={form.nombre}
          onChange={manejarCambio}
          error={errores.nombre}
          placeholder="Ana"
        />
        <Campo
          label="Apellido"
          name="apellido"
          value={form.apellido}
          onChange={manejarCambio}
          error={errores.apellido}
          placeholder="Pérez"
        />
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
          label="Teléfono (opcional)"
          name="telefono"
          value={form.telefono}
          onChange={manejarCambio}
          error={errores.telefono}
          placeholder="3001234567"
        />
        <Campo
          label="Contraseña"
          name="password"
          type="password"
          value={form.password}
          onChange={manejarCambio}
          error={errores.password}
          placeholder="Mínimo 6 caracteres"
          autoComplete="new-password"
        />
        <Campo
          label="Confirmar contraseña"
          name="confirmar"
          type="password"
          value={form.confirmar}
          onChange={manejarCambio}
          error={errores.confirmar}
          placeholder="Repite la contraseña"
          autoComplete="new-password"
        />

        <button type="submit" className="boton primario" disabled={enviando}>
          {enviando ? 'Registrando...' : 'Crear cuenta'}
        </button>

        <p className="pie">
          ¿Ya tienes cuenta?{' '}
          <button type="button" className="enlace" onClick={irALogin}>
            Inicia sesión
          </button>
        </p>
      </form>
    </div>
  );
}
