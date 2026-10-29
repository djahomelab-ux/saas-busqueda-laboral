const suscripcionRepository = require('../repositories/suscripcion.repository');
const { ErrorNegocio } = require('../utils/errores');

const PLANES = {
  gratuito: { precio: 0, descripcion: '5 consultas al asistente por mes' },
  pro: { precio: 29.9, descripcion: 'Consultas y entrevistas simuladas ilimitadas' }
};

async function asignarPlanGratuito(idUsuario) {
  await suscripcionRepository.crear(idUsuario, 'gratuito');
}

async function obtener(idUsuario) {
  const vigente = await suscripcionRepository.vigente(idUsuario);
  return { plan: vigente?.plan || 'gratuito', vigente, planes: PLANES };
}

// En el Avance 2 el pago se registra en modo de prueba.
async function cambiarPlan(idUsuario, { plan, metodo = 'tarjeta_prueba' } = {}) {
  if (!PLANES[plan]) throw new ErrorNegocio(400, 'Plan no válido');
  const actual = await suscripcionRepository.planVigente(idUsuario);
  if (actual === plan) throw new ErrorNegocio(409, `Ya tiene el plan ${plan}`);
  if (plan === 'pro') return suscripcionRepository.activarPro(idUsuario, PLANES.pro.precio, metodo);
  await suscripcionRepository.volverAGratuito(idUsuario);
  return { plan: 'gratuito' };
}

const pagos = (idUsuario) => suscripcionRepository.pagos(idUsuario);

module.exports = { PLANES, asignarPlanGratuito, obtener, cambiarPlan, pagos };
