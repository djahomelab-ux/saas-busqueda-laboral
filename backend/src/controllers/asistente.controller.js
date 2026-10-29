const asistenteService = require('../services/asistente.service');
const { validar, esId } = require('../models/validar');
const asincrono = require('../utils/asincrono');

const compatibilidad = asincrono(async (req, res) => {
  const { id_oferta: idOferta, id_version: idVersion } = req.body;
  validar([[esId(idOferta), 'id_oferta no válido'], [esId(idVersion), 'id_version no válido']]);
  res.json(await asistenteService.analizarCompatibilidad(req.usuario.id, Number(idOferta), Number(idVersion)));
});

const analisisCv = asincrono(async (req, res) => {
  const { id_version: idVersion, puesto } = req.body;
  validar([[esId(idVersion), 'id_version no válido']]);
  res.json(await asistenteService.analizarCurriculum(req.usuario.id, Number(idVersion), puesto));
});

const consulta = asincrono(async (req, res) => {
  res.json(await asistenteService.consultaLibre(req.usuario.id, req.body.consulta));
});

module.exports = { compatibilidad, analisisCv, consulta };
