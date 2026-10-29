const { ErrorNegocio } = require('../utils/errores');

// Comprueba una lista de reglas y lanza 400 con el primer mensaje que falle.
function validar(reglas) {
  for (const [condicion, mensaje] of reglas) {
    if (!condicion) throw new ErrorNegocio(400, mensaje);
  }
}

const esTexto = (v, max = 255) => typeof v === 'string' && v.trim().length > 0 && v.length <= max;
const esId = (v) => Number.isInteger(Number(v)) && Number(v) > 0;

module.exports = { validar, esTexto, esId };
