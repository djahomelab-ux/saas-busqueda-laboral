const curriculumRepository = require('../repositories/curriculum.repository');
const { validarCurriculum, validarContenido, completitud } = require('../models/curriculum.model');
const { ErrorNegocio } = require('../utils/errores');

const listar = (idUsuario) => curriculumRepository.listar(idUsuario);

async function crear(idUsuario, datos) {
  const { nombre } = validarCurriculum(datos);
  return { id_curriculum: await curriculumRepository.crear(idUsuario, nombre), nombre };
}

async function guardarVersion(idUsuario, idCurriculum, contenido) {
  if (!(await curriculumRepository.perteneceA(idCurriculum, idUsuario))) {
    throw new ErrorNegocio(404, 'Currículum no encontrado');
  }
  const limpio = validarContenido(contenido);
  const version = await curriculumRepository.crearVersion(idCurriculum, limpio);
  return { ...version, completitud: completitud(limpio) };
}

async function obtenerVersion(idUsuario, idVersion) {
  const version = await curriculumRepository.obtenerVersion(idVersion, idUsuario);
  if (!version) throw new ErrorNegocio(404, 'Versión de currículum no encontrada');
  return { ...version, completitud: completitud(version.contenido) };
}

module.exports = { listar, crear, guardarVersion, obtenerVersion };
