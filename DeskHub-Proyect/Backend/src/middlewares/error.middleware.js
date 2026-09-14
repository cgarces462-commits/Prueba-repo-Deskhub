function manejadorErrores(err, req, res, next) {
  console.error(err);

  const status = err.status || 500;
  const mensaje = err.message || 'Error interno del servidor';

  res.status(status).json({ mensaje });
}

function rutaNoEncontrada(req, res) {
  res.status(404).json({ mensaje: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
}

module.exports = { manejadorErrores, rutaNoEncontrada };
