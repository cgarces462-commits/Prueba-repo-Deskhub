/**
 * Roles del sistema DeskHub.
 *
 * - super_admin: control total de la plataforma (todas las sedes, usuarios y configuración).
 * - admin: administra una sede/espacio de coworking (gestiona espacios y reservas de su sede).
 * - recepcionista: staff que atiende la sede, gestiona el check-in/out y confirma o cancela reservas.
 * - cliente: usuario que reserva espacios de coworking.
 * - invitado: acceso limitado, solo puede ver espacios disponibles y solicitar una reserva puntual (día de prueba).
 */
const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  RECEPCIONISTA: 'recepcionista',
  CLIENTE: 'cliente',
  INVITADO: 'invitado',
};

const ROLES_DESCRIPCION = {
  [ROLES.SUPER_ADMIN]: 'Control total de la plataforma',
  [ROLES.ADMIN]: 'Administra una sede de coworking',
  [ROLES.RECEPCIONISTA]: 'Gestiona el día a día de la sede y las reservas',
  [ROLES.CLIENTE]: 'Reserva espacios de coworking',
  [ROLES.INVITADO]: 'Acceso limitado para visitantes',
};

const ROLES_LIST = Object.values(ROLES);

module.exports = { ROLES, ROLES_DESCRIPCION, ROLES_LIST };
