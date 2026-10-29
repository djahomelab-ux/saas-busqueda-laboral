const entrevistaRepository = require('../repositories/entrevista.repository');
const postulacionRepository = require('../repositories/postulacion.repository');
const ofertaRepository = require('../repositories/oferta.repository');
const asistenteService = require('./asistente.service');
const { puntajePregunta, puntajeGlobal } = require('../models/entrevista.model');
const { esId } = require('../models/validar');
const { ErrorNegocio } = require('../utils/errores');

async function crear(idUsuario, { id_postulacion: idPostulacion, nivel } = {}) {
  if (!esId(idPostulacion)) throw new ErrorNegocio(400, 'id_postulacion no válido');
  const postulacion = await postulacionRepository.obtener(idPostulacion, idUsuario);
  if (!postulacion) throw new ErrorNegocio(404, 'Postulación no encontrada');
  const oferta = await ofertaRepository.obtenerConRequisitos(postulacion.id_oferta, idUsuario);
  const preguntas = await asistenteService.generarPreguntas(idUsuario, oferta, nivel);
  return entrevistaRepository.crear(idPostulacion, preguntas);
}

async function responder(idUsuario, idEntrevista, { id_pregunta: idPregunta, respuesta } = {}) {
  if (!esId(idPregunta)) throw new ErrorNegocio(400, 'id_pregunta no válido');
  if (typeof respuesta !== 'string' || !respuesta.trim()) throw new ErrorNegocio(400, 'La respuesta es obligatoria');
  const pregunta = await entrevistaRepository.obtenerPregunta(idPregunta, idEntrevista, idUsuario);
  if (!pregunta) throw new ErrorNegocio(404, 'Pregunta no encontrada');

  const evaluacion = await asistenteService.evaluarRespuesta(idUsuario, {
    pregunta: pregunta.pregunta, criterioClave: pregunta.criterio_clave, respuesta
  });
  const puntaje = puntajePregunta(evaluacion.puntajes);   // cálculo en el servidor
  await entrevistaRepository.guardarRespuesta(idPregunta, {
    respuesta, puntajes: evaluacion.puntajes, retroalimentacion: evaluacion.retroalimentacion, puntaje
  });
  const global = puntajeGlobal(await entrevistaRepository.puntajesRespondidos(idEntrevista));
  await entrevistaRepository.actualizarPuntajeGlobal(idEntrevista, global);

  return { ...evaluacion, puntaje, puntaje_global: global };
}

module.exports = { crear, responder };
