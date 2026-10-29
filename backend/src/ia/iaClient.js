const OpenAI = require('openai');
const env = require('../config/env');
const { ErrorNegocio } = require('../utils/errores');

let cliente = null;
function obtenerCliente() {
  if (!env.openaiKey) throw new ErrorNegocio(503, 'El asistente no está configurado (falta OPENAI_API_KEY)');
  cliente ??= new OpenAI({ apiKey: env.openaiKey });
  return cliente;
}

// Pide una respuesta JSON al modelo; reintenta una vez si la salida no supera la validación.
async function completarJSON(mensajes, { temperatura = 0.2, validar, maxTokens = 700 }) {
  for (let intento = 1; intento <= 2; intento++) {
    const respuesta = await obtenerCliente().chat.completions.create({
      model: env.openaiModel,
      messages: mensajes,
      temperature: temperatura,
      max_tokens: maxTokens,
      response_format: { type: 'json_object' }
    });
    try {
      const datos = JSON.parse(respuesta.choices[0].message.content);
      if (validar(datos)) return { datos, intento };
    } catch (_) { /* salida no válida: se reintenta */ }
  }
  throw new ErrorNegocio(502, 'El asistente no pudo generar una respuesta válida');
}

module.exports = { completarJSON };
