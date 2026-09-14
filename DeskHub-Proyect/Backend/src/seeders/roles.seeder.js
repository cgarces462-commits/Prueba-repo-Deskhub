require('dotenv').config();
const { sequelize, Role, User } = require('../models');
const { ROLES, ROLES_DESCRIPCION } = require('../config/roles');
const { hashPassword } = require('../utils/password.util');

async function seedRoles() {
  for (const nombre of Object.values(ROLES)) {
    await Role.findOrCreate({
      where: { nombre },
      defaults: { descripcion: ROLES_DESCRIPCION[nombre] },
    });
  }
  console.log('✔ Roles sincronizados:', Object.values(ROLES).join(', '));
}

async function seedSuperAdmin() {
  const superAdminRole = await Role.findOne({
    where: { nombre: ROLES.SUPER_ADMIN },
  });

  const existente = await User.findOne({
    where: { email: 'superadmin@deskhub.com' },
  });

  if (!existente) {
    await User.create({
      nombre: 'Super',
      apellido: 'Admin',
      email: 'superadmin@deskhub.com',
      password: await hashPassword('SuperAdmin123'),
      roleId: superAdminRole.id,
    });
    console.log(
      '✔ Usuario super_admin creado -> email: superadmin@deskhub.com / password: SuperAdmin123'
    );
  } else {
    console.log('ℹ El usuario super_admin ya existía, no se duplicó.');
  }
}

const USUARIOS_PRUEBA = [
  {
    rol: ROLES.ADMIN,
    nombre: 'Admin',
    apellido: 'DeskHub',
    email: 'admin@deskhub.com',
    password: 'Admin123',
  },
  {
    rol: ROLES.RECEPCIONISTA,
    nombre: 'Recep',
    apellido: 'DeskHub',
    email: 'recepcionista@deskhub.com',
    password: 'Recepcionista123',
  },
  {
    rol: ROLES.CLIENTE,
    nombre: 'Cliente',
    apellido: 'DeskHub',
    email: 'cliente@deskhub.com',
    password: 'Cliente123',
  },
  {
    rol: ROLES.INVITADO,
    nombre: 'Invitado',
    apellido: 'DeskHub',
    email: 'invitado@deskhub.com',
    password: 'Invitado123',
  },
];

async function seedUsuariosPrueba() {
  for (const datos of USUARIOS_PRUEBA) {
    const existente = await User.findOne({ where: { email: datos.email } });
    if (existente) {
      console.log(`ℹ ${datos.email} ya existía, no se duplicó.`);
      continue;
    }
    const rol = await Role.findOne({ where: { nombre: datos.rol } });
    if (!rol) {
      console.log(`✘ Rol ${datos.rol} no encontrado, se omite ${datos.email}.`);
      continue;
    }
    await User.create({
      nombre: datos.nombre,
      apellido: datos.apellido,
      email: datos.email,
      password: await hashPassword(datos.password),
      roleId: rol.id,
    });
    console.log(
      `✔ Usuario ${datos.rol} creado -> email: ${datos.email} / password: ${datos.password}`
    );
  }
}

async function run() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    await seedRoles();
    await seedSuperAdmin();
    await seedUsuariosPrueba();
    console.log('Seed completado con éxito.');
  } catch (error) {
    console.error('Error al ejecutar el seed:', error.message);
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  run();
}

module.exports = { seedRoles, seedSuperAdmin, seedUsuariosPrueba };
