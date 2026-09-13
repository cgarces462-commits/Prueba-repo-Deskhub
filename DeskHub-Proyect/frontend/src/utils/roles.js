export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  RECEPCIONISTA: 'recepcionista',
  CLIENTE: 'cliente',
  INVITADO: 'invitado',
};

const ETIQUETAS = {
  [ROLES.SUPER_ADMIN]: 'Super administrador',
  [ROLES.ADMIN]: 'Administrador',
  [ROLES.RECEPCIONISTA]: 'Recepcionista',
  [ROLES.CLIENTE]: 'Cliente',
  [ROLES.INVITADO]: 'Invitado',
};

export const ROLES_LISTA = Object.values(ROLES);

export function etiquetaRol(nombre) {
  return ETIQUETAS[nombre] || nombre || 'Sin rol';
}

export function esGestion(nombre) {
  return nombre === ROLES.SUPER_ADMIN || nombre === ROLES.ADMIN;
}

export function esStaff(nombre) {
  return esGestion(nombre) || nombre === ROLES.RECEPCIONISTA;
}

export function esSuperAdmin(nombre) {
  return nombre === ROLES.SUPER_ADMIN;
}
