const multer = require('multer');
const path = require('path');
const fs = require('fs');

const DIR_UPLOADS = path.join(__dirname, '..', '..', 'uploads', 'espacios');

const EXTENSIONES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
};

const storage = multer.diskStorage({
  destination(req, file, cb) {
    fs.mkdirSync(DIR_UPLOADS, { recursive: true });
    cb(null, DIR_UPLOADS);
  },
  filename(req, file, cb) {
    const extension = EXTENSIONES[file.mimetype] || '.jpg';
    const nombre = `${req.params.id}-${Date.now()}-${Math.round(Math.random() * 1e6)}${extension}`;
    cb(null, nombre);
  },
});

function filtroArchivo(req, file, cb) {
  if (EXTENSIONES[file.mimetype]) {
    cb(null, true);
  } else {
    const error = new Error('Formato de imagen no permitido');
    error.status = 400;
    cb(error);
  }
}

const subirImagen = multer({
  storage,
  fileFilter: filtroArchivo,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = { subirImagen };