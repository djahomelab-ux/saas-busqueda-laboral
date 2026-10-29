const env = require('../config/env');
const { ErrorNegocio } = require('../utils/errores');

// Llama al servicio de reglas en SWI-Prolog (prolog/servidor.pl).
// habilidades: [{ nombre, nivel: 'evidenciado' | 'poco' }]
// requisitos:  [{ nombre, tipo: 'obligatorio' | 'deseable' }]
async function compatibilidad({ habilidades, requisitos }) {
  let respuesta;
  try {
    respuesta = await fetch(`${env.prologUrl}/compatibilidad`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        habilidades: habilidades.map(({ nombre, nivel }) => ({ nombre, nivel })),
        requisitos: requisitos.map(({ nombre, tipo }) => ({ nombre, tipo }))
      }),
      signal: AbortSignal.timeout(5000)
    });
  } catch (_) {
    throw new ErrorNegocio(503, 'El motor de conocimiento no está disponible');
  }
  if (!respuesta.ok) throw new ErrorNegocio(502, 'El motor de conocimiento devolvió un error');
  return respuesta.json();
}

module.exports = { compatibilidad };
