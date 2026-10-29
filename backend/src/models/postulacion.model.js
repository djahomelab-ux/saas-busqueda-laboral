const { validar, esId } = require('./validar');

const ESTADOS = ['registrada', 'en_proceso', 'entrevista', 'oferta_recibida', 'rechazada', 'desistida'];

// Transiciones permitidas en el ciclo de una postulación.
const TRANSICIONES = {
  registrada: ['en_proceso', 'rechazada', 'desistida'],
  en_proceso: ['entrevista', 'rechazada', 'desistida'],
  entrevista: ['oferta_recibida', 'rechazada', 'desistida'],
  oferta_recibida: ['desistida'],
  rechazada: [],
  desistida: []
};

function validarPostulacion(d = {}) {
  validar([
    [esId(d.id_oferta), 'id_oferta no válido'],
    [esId(d.id_version), 'id_version no válido']
  ]);
  return { idOferta: Number(d.id_oferta), idVersion: Number(d.id_version) };
}

function puedeCambiar(actual, nuevo) {
  return (TRANSICIONES[actual] || []).includes(nuevo);
}

module.exports = { ESTADOS, TRANSICIONES, validarPostulacion, puedeCambiar };
