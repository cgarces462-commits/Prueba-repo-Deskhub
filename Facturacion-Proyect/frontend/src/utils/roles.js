export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMINISTRADOR: 'administrador',
  FACTURADOR: 'facturador',
  CLIENTE: 'cliente',
  AUDITOR: 'auditor',
};

const ETIQUETAS = {
  [ROLES.SUPER_ADMIN]: 'Super administrador',
  [ROLES.ADMINISTRADOR]: 'Administrador',
  [ROLES.FACTURADOR]: 'Facturador',
  [ROLES.CLIENTE]: 'Cliente',
  [ROLES.AUDITOR]: 'Auditor',
};

export const ROLES_LISTA = Object.values(ROLES);

export function etiquetaRol(nombre) {
  return ETIQUETAS[nombre] || nombre || 'Sin rol';
}

export function esGestion(nombre) {
  return nombre === ROLES.SUPER_ADMIN || nombre === ROLES.ADMINISTRADOR;
}

export function esFacturacion(nombre) {
  return esGestion(nombre) || nombre === ROLES.FACTURADOR;
}
