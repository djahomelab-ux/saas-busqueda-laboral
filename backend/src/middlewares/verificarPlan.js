const env = require('../config/env');
const suscripcionRepository = require('../repositories/suscripcion.repository');
const consultaRepository = require('../repositories/consulta.repository');

// Limita las consultas al asistente del plan gratuito.
async function verificarPlan(req, res, next) {
  try {
    const plan = await suscripcionRepository.planVigente(req.usuario.id);
    if (plan === 'pro') return next();
    const usadas = await consultaRepository.contarDelMes(req.usuario.id);
    if (usadas >= env.limiteGratuito) {
      return res.status(403).json({ error: `El plan gratuito permite ${env.limiteGratuito} consultas al asistente por mes` });
    }
    next();
  } catch (error) { next(error); }
}

module.exports = verificarPlan;
