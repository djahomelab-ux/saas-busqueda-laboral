const postulacionService = require('../services/postulacion.service');
const asincrono = require('../utils/asincrono');

const registrar = asincrono(async (req, res) => {
  res.status(201).json(await postulacionService.registrar(req.usuario.id, req.body));
});

const cambiarEstado = asincrono(async (req, res) => {
  res.json(await postulacionService.cambiarEstado(req.usuario.id, Number(req.params.id), req.body.estado));
});

const listar = asincrono(async (req, res) => {
  const { estado, orden } = req.query;
  res.json(await postulacionService.listar(req.usuario.id, { estado, orden }));
});

module.exports = { registrar, cambiarEstado, listar };
