const { ErrorNegocio } = require('../utils/errores');

// eslint-disable-next-line no-unused-vars
function manejarErrores(error, req, res, next) {
  if (error instanceof ErrorNegocio) return res.status(error.estado).json({ error: error.message });
  if (error.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON mal formado' });
  console.error(error);
  // No se expone el detalle interno (por ejemplo, errores de SQL) al cliente.
  res.status(500).json({ error: 'Error interno del servidor' });
}

module.exports = manejarErrores;
