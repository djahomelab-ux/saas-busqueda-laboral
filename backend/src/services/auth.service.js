const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const usuarioRepository = require('../repositories/usuario.repository');
const suscripcionService = require('./suscripcion.service');
const { validarRegistro, validarLogin } = require('../models/usuario.model');
const { ErrorNegocio } = require('../utils/errores');

const COSTO_HASH = 10;

async function registrar(datos) {
  const { correo, contrasena, nombres, apellidos } = validarRegistro(datos);
  if (await usuarioRepository.buscarPorCorreo(correo)) {
    throw new ErrorNegocio(409, 'El correo ya se encuentra registrado');
  }
  const hash = await bcrypt.hash(contrasena, COSTO_HASH);
  const id = await usuarioRepository.crear({ correo, contrasena: hash, nombres, apellidos });
  await suscripcionService.asignarPlanGratuito(id);
  return { id_usuario: id, correo };
}

async function iniciarSesion(datos) {
  const { correo, contrasena } = validarLogin(datos);
  const usuario = await usuarioRepository.buscarPorCorreo(correo);
  const valido = usuario && await bcrypt.compare(contrasena, usuario.contrasena);
  if (!valido) throw new ErrorNegocio(401, 'Credenciales incorrectas');
  const token = jwt.sign({ sub: usuario.id_usuario }, env.jwtSecret, { expiresIn: '2h' });
  return { token, usuario: { id_usuario: usuario.id_usuario, nombres: usuario.nombres } };
}

module.exports = { registrar, iniciarSesion };
