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

async function run() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    await seedRoles();
    await seedSuperAdmin();
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

module.exports = { seedRoles, seedSuperAdmin };
