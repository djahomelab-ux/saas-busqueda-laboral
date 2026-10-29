const suscripcionService = require('../services/suscripcion.service');
const asincrono = require('../utils/asincrono');

const obtener = asincrono(async (req, res) => {
  res.json(await suscripcionService.obtener(req.usuario.id));
});

const cambiarPlan = asincrono(async (req, res) => {
  res.json(await suscripcionService.cambiarPlan(req.usuario.id, req.body));
});

const pagos = asincrono(async (req, res) => {
  res.json(await suscripcionService.pagos(req.usuario.id));
});

module.exports = { obtener, cambiarPlan, pagos };
