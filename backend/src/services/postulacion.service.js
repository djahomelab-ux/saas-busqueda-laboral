const postulacionRepository = require('../repositories/postulacion.repository');
const ofertaRepository = require('../repositories/oferta.repository');
const curriculumRepository = require('../repositories/curriculum.repository');
const { ESTADOS, validarPostulacion, puedeCambiar } = require('../models/postulacion.model');
const { ErrorNegocio } = require('../utils/errores');

async function registrar(idUsuario, datos) {
  const { idOferta, idVersion } = validarPostulacion(datos);
  if (!(await ofertaRepository.obtenerConRequisitos(idOferta, idUsuario))) {
    throw new ErrorNegocio(404, 'Oferta no encontrada');
  }
  if (!(await curriculumRepository.obtenerVersion(idVersion, idUsuario))) {
    throw new ErrorNegocio(404, 'Versión de currículum no encontrada');
  }
  const id = await postulacionRepository.crear(idUsuario, idOferta, idVersion);
  return { id_postulacion: id, estado: 'registrada' };
}

async function cambiarEstado(idUsuario, idPostulacion, estado) {
  if (!ESTADOS.includes(estado)) throw new ErrorNegocio(400, 'Estado no válido');
  const postulacion = await postulacionRepository.obtener(idPostulacion, idUsuario);
  if (!postulacion) throw new ErrorNegocio(404, 'Postulación no encontrada');
  if (!puedeCambiar(postulacion.estado, estado)) {
    throw new ErrorNegocio(400, `No se puede pasar de «${postulacion.estado}» a «${estado}»`);
  }
  await postulacionRepository.cambiarEstado(idPostulacion, idUsuario, estado);
  return { id_postulacion: Number(idPostulacion), estado };
}

async function listar(idUsuario, { estado, orden } = {}) {
  if (estado && !ESTADOS.includes(estado)) throw new ErrorNegocio(400, 'Estado no válido');
  return postulacionRepository.listarPorUsuario(idUsuario, estado, orden);
}

module.exports = { registrar, cambiarEstado, listar };
