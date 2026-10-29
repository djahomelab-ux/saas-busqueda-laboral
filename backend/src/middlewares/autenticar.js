const jwt = require('jsonwebtoken');
const env = require('../config/env');

function autenticar(req, res, next) {
  const [tipo, token] = (req.headers.authorization || '').split(' ');
  if (tipo !== 'Bearer' || !token) return res.status(401).json({ error: 'Token requerido' });
  try {
    const datos = jwt.verify(token, env.jwtSecret);
    req.usuario = { id: datos.sub };
    next();
  } catch (_) {
    res.status(401).json({ error: 'Token inválido o vencido' });
  }
}

module.exports = autenticar;
