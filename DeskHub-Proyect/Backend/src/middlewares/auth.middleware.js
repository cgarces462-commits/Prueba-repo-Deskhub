const { verificarToken } = require('../utils/jwt.util');

/**
 * Verifica que la petición traiga un JWT válido en el header Authorization: Bearer <token>
 * y adjunta el usuario decodificado (id, email, role) a req.usuario.
 */
function autenticar(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ mensaje: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verificarToken(token);
    req.usuario = payload; // { id, email, role }
    next();
  } catch (error) {
    return res.status(401).json({ mensaje: 'Token inválido o expirado' });
  }
}

/**
 * Restringe el acceso a una lista de roles permitidos.
 * Uso: autorizar('super_admin', 'admin')
 */
function autorizar(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ mensaje: 'No autenticado' });
    }
    if (!rolesPermitidos.includes(req.usuario.role)) {
      return res.status(403).json({
        mensaje: 'No tienes permisos suficientes para realizar esta acción',
      });
    }
    next();
  };
}

module.exports = { autenticar, autorizar };
