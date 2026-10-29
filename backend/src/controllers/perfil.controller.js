const perfilService = require('../services/perfil.service');
const asincrono = require('../utils/asincrono');

const obtener = asincrono(async (req, res) => {
  res.json(await perfilService.obtener(req.usuario.id));
});

const actualizar = asincrono(async (req, res) => {
  res.json(await perfilService.actualizar(req.usuario.id, req.body));
});

const guardarHabilidad = asincrono(async (req, res) => {
  res.status(201).json(await perfilService.guardarHabilidad(req.usuario.id, req.body));
});

module.exports = { obtener, actualizar, guardarHabilidad };
