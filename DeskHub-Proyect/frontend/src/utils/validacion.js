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

export function campoObligatorio(valor) {
  if (valor === undefined || valor === null || String(valor).trim() === '') {
    return 'Este campo es obligatorio';
  }
  return '';
}

export function validarEspacio(espacio) {
  const errores = {};
  const errorNombre = campoObligatorio(espacio.nombre);
  if (errorNombre) errores.nombre = errorNombre;
  else if (espacio.nombre.trim().length < 3) {
    errores.nombre = 'El nombre debe tener al menos 3 caracteres';
  }

  if (Number(espacio.capacidad) <= 0) {
    errores.capacidad = 'La capacidad debe ser mayor a 0';
  }
  if (Number(espacio.precioPorHora) < 0) {
    errores.precioPorHora = 'El precio no puede ser negativo';
  }
  return errores;
}

export function hayErrores(errores) {
  return Object.keys(errores).length > 0;
}
