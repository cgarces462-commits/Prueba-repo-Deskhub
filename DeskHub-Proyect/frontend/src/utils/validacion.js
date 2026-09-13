const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validarEmail(email) {
  if (!email.trim()) return 'El email es obligatorio';
  if (!RE_EMAIL.test(email.trim())) return 'Ingresa un email válido';
  return '';
}

export function validarLogin({ email, password }) {
  const errores = {};
  const errorEmail = validarEmail(email || '');
  if (errorEmail) errores.email = errorEmail;
  if (!password) errores.password = 'La contraseña es obligatoria';
  return errores;
}

export function validarRegistro({ nombre, email, password, confirmar }) {
  const errores = {};
  if (!nombre || nombre.trim().length < 2) {
    errores.nombre = 'El nombre debe tener al menos 2 caracteres';
  }
  const errorEmail = validarEmail(email || '');
  if (errorEmail) errores.email = errorEmail;
  if (!password || password.length < 6) {
    errores.password = 'La contraseña debe tener al menos 6 caracteres';
  }
  if (password !== confirmar) {
    errores.confirmar = 'Las contraseñas no coinciden';
  }
  return errores;
}

export function hayErrores(errores) {
  return Object.keys(errores).length > 0;
}
