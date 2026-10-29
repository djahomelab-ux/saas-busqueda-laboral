const ofertaService = require('../services/oferta.service');
const asincrono = require('../utils/asincrono');

const crear = asincrono(async (req, res) => {
  res.status(201).json(await ofertaService.crear(req.usuario.id, req.body));
});

const listar = asincrono(async (req, res) => {
  res.json(await ofertaService.listar(req.usuario.id));
});

const obtener = asincrono(async (req, res) => {
  res.json(await ofertaService.obtener(req.usuario.id, Number(req.params.id)));
});

module.exports = { crear, listar, obtener };
