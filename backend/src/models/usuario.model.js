const { validar, esTexto } = require('./validar');

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validarRegistro(d = {}) {
  validar([
    [typeof d.correo === 'string' && CORREO.test(d.correo) && d.correo.length <= 120, 'Correo no válido'],
    [typeof d.contrasena === 'string' && d.contrasena.length >= 8, 'La contraseña debe tener al menos 8 caracteres'],
    [esTexto(d.nombres, 80), 'Los nombres son obligatorios'],
    [esTexto(d.apellidos, 80), 'Los apellidos son obligatorios']
  ]);
  return { correo: d.correo.trim().toLowerCase(), contrasena: d.contrasena, nombres: d.nombres.trim(), apellidos: d.apellidos.trim() };
}

function validarLogin(d = {}) {
  validar([[typeof d.correo === 'string' && typeof d.contrasena === 'string', 'Correo y contraseña son obligatorios']]);
  return { correo: d.correo.trim().toLowerCase(), contrasena: d.contrasena };
}

module.exports = { validarRegistro, validarLogin };
