const perfilRepository = require('../repositories/perfil.repository');
const { validarHabilidad } = require('../models/perfil.model');

const obtener = (idUsuario) => perfilRepository.obtener(idUsuario);

async function actualizar(idUsuario, { titulo, resumen, experiencia } = {}) {
  await perfilRepository.actualizar(idUsuario, { titulo, resumen, experiencia });
  return perfilRepository.obtener(idUsuario);
}

async function guardarHabilidad(idUsuario, datos) {
  const { nombre, nivel } = validarHabilidad(datos);
  await perfilRepository.guardarHabilidad(idUsuario, nombre, nivel);
  return perfilRepository.habilidadesDeUsuario(idUsuario);
}

module.exports = { obtener, actualizar, guardarHabilidad };
