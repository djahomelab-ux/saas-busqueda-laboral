const authService = require('../services/auth.service');
const asincrono = require('../utils/asincrono');

const registrar = asincrono(async (req, res) => {
  res.status(201).json(await authService.registrar(req.body));
});

const iniciarSesion = asincrono(async (req, res) => {
  res.json(await authService.iniciarSesion(req.body));
});

module.exports = { registrar, iniciarSesion };
