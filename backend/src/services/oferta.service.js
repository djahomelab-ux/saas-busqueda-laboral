const ofertaRepository = require('../repositories/oferta.repository');
const { validarOferta } = require('../models/oferta.model');
const { ErrorNegocio } = require('../utils/errores');

async function crear(idUsuario, datos) {
  const oferta = validarOferta(datos);
  return { id_oferta: await ofertaRepository.crear(idUsuario, oferta) };
}

const listar = (idUsuario) => ofertaRepository.listar(idUsuario);

async function obtener(idUsuario, idOferta) {
  const oferta = await ofertaRepository.obtenerConRequisitos(idOferta, idUsuario);
  if (!oferta) throw new ErrorNegocio(404, 'Oferta no encontrada');
  return oferta;
}

module.exports = { crear, listar, obtener };
