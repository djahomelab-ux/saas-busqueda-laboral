const curriculumService = require('../services/curriculum.service');
const asincrono = require('../utils/asincrono');

const listar = asincrono(async (req, res) => {
  res.json(await curriculumService.listar(req.usuario.id));
});

const crear = asincrono(async (req, res) => {
  res.status(201).json(await curriculumService.crear(req.usuario.id, req.body));
});

const guardarVersion = asincrono(async (req, res) => {
  res.status(201).json(await curriculumService.guardarVersion(req.usuario.id, Number(req.params.id), req.body.contenido));
});

const obtenerVersion = asincrono(async (req, res) => {
  res.json(await curriculumService.obtenerVersion(req.usuario.id, Number(req.params.idVersion)));
});

module.exports = { listar, crear, guardarVersion, obtenerVersion };
