const CRITERIOS = ['claridad', 'comunicacion', 'relevancia', 'tecnico'];

// Puntaje de 0 a 100 a partir de los criterios (1 a 5); se calcula en el servidor, no en el modelo de IA.
function puntajePregunta(puntajes) {
  const suma = CRITERIOS.reduce((t, c) => t + puntajes[c], 0);
  return Math.round((suma / CRITERIOS.length) * 20 * 100) / 100;
}

function puntajeGlobal(puntajesPreguntas) {
  if (!puntajesPreguntas.length) return null;
  const suma = puntajesPreguntas.reduce((t, p) => t + p, 0);
  return Math.round((suma / puntajesPreguntas.length) * 100) / 100;
}

module.exports = { CRITERIOS, puntajePregunta, puntajeGlobal };
