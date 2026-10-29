const entrevistaService = require('../services/entrevista.service');
const asincrono = require('../utils/asincrono');

const crear = asincrono(async (req, res) => {
  res.status(201).json(await entrevistaService.crear(req.usuario.id, req.body));
});

const responder = asincrono(async (req, res) => {
  res.json(await entrevistaService.responder(req.usuario.id, Number(req.params.id), req.body));
});

module.exports = { crear, responder };
