// Prompts del asistente (texto completo en el Anexo 4 del informe).
const SISTEMA = `Eres el asistente profesional de una plataforma de gestión de la búsqueda laboral.
Ayudas al postulante a mejorar su currículum y a prepararse para entrevistas.
Reglas:
1. Usa solo la información incluida entre <contexto> y </contexto>. Si falta un dato, indícalo; no lo inventes.
2. No cambies los porcentajes ni los estados calculados por el motor de reglas; explícalos.
3. Responde en español, con tono profesional y frases breves.
4. No pidas ni repitas datos personales sensibles (documento de identidad, dirección, teléfono).
5. Devuelve únicamente un objeto JSON con el formato indicado en la tarea.`;

const mensajes = (tarea) => [
  { role: 'system', content: SISTEMA },
  { role: 'user', content: tarea }
];

// Los datos personales de contacto nunca se envían al modelo.
function cvSinContacto(contenido = {}) {
  const { datos_personales: _omitido, ...resto } = contenido;
  return JSON.stringify(resto);
}

function compatibilidad({ reglas, oferta, version }) {
  const requisitos = reglas.detalle
    .map((r) => {
      const tipo = oferta.requisitos.find((q) => q.nombre === r.habilidad)?.tipo || 'obligatorio';
      return `- ${r.habilidad} | ${tipo} | ${r.estado}`;
    })
    .join('\n');
  return mensajes(`Tarea: redacta una recomendación sobre la compatibilidad entre el currículum y la oferta.
<contexto>
Puesto: ${oferta.puesto}
Perfil del currículum (versión ${version.numero}): ${version.contenido?.perfil ?? 'no registrado'}
Resultado del motor de reglas: compatibilidad ponderada ${reglas.ponderada} %, coincidencia simple ${reglas.simple} %.
Requisitos (habilidad | tipo | estado):
${requisitos}
</contexto>
Formato de salida:
{"resumen": "máximo 60 palabras", "fortalezas": ["..."],
 "brechas": [{"habilidad": "...", "accion": "acción concreta para el currículum"}],
 "siguiente_paso": "..."}
Incluye en "brechas" exactamente los requisitos con estado poco_evidenciado o no_evidenciado, y ninguno más.
Usa en "habilidad" el mismo nombre que aparece en la lista de requisitos.`);
}

function analisisCv({ version, puesto }) {
  return mensajes(`Tarea: revisa la versión del currículum y señala mejoras concretas.
<contexto>
Puesto objetivo: ${puesto || 'no indicado'}
Secciones del currículum: ${cvSinContacto(version.contenido)}
</contexto>
Formato de salida:
{"observaciones": [{"seccion": "perfil|experiencia|formacion|habilidades",
                    "problema": "máximo 25 palabras", "sugerencia": "acción concreta, máximo 30 palabras"}]}
Entrega entre 3 y 6 observaciones, ordenadas de mayor a menor impacto.`);
}

function preguntasEntrevista({ oferta, nivel = 'junior' }) {
  const requisitos = oferta.requisitos.map((r) => `${r.nombre} (${r.tipo})`).join(', ');
  return mensajes(`Tarea: genera 5 preguntas para una entrevista simulada.
<contexto>
Puesto: ${oferta.puesto}   Nivel: ${nivel}
Requisitos: ${requisitos}
</contexto>
Formato de salida:
{"preguntas": [{"id": 1, "texto": "...", "tipo": "tecnica|conductual",
                "criterio_clave": "qué debe demostrar una buena respuesta"}]}
Incluye 3 preguntas técnicas sobre requisitos obligatorios y 2 conductuales.`);
}

function evaluarRespuesta({ pregunta, criterioClave, respuesta }) {
  return mensajes(`Tarea: evalúa la respuesta del postulante con la rúbrica.
Rúbrica (entero de 1 a 5 por criterio): claridad, comunicacion, relevancia, tecnico.
Ejemplo:
  Pregunta: ¿Qué es el DOM virtual en React?
  Respuesta: "Es una copia del DOM en memoria; React compara cambios y solo actualiza lo necesario."
  Evaluación: {"puntajes": {"claridad": 4, "comunicacion": 4, "relevancia": 5, "tecnico": 4},
  "retroalimentacion": "Respuesta correcta y breve.",
  "mejora": "Menciona la reconciliación y un ejemplo de rendimiento."}
<contexto>
Pregunta: ${pregunta}   Criterio clave: ${criterioClave || 'no indicado'}
Respuesta del postulante: ${respuesta}
</contexto>
Formato de salida: igual al del ejemplo.`);
}

function consultaLibre({ perfil, postulaciones, consulta }) {
  const lista = postulaciones.map((p) => `${p.puesto} | ${p.empresa} | ${p.estado}`).join('\n') || 'ninguna';
  return mensajes(`Tarea: responde la consulta del postulante sobre su proceso de búsqueda laboral.
<contexto>
Perfil: ${perfil.titulo || 'sin título'}. ${perfil.resumen || ''} Habilidades: ${perfil.habilidades.map((h) => h.nombre).join(', ') || 'ninguna'}
Postulaciones activas:
${lista}
Consulta: ${consulta}
</contexto>
Si la consulta no se relaciona con la búsqueda laboral, indícalo con amabilidad.
Formato de salida: {"respuesta": "máximo 120 palabras", "fuentes": ["perfil", "postulaciones"]}`);
}

// Interpretación del texto libre del currículum: qué requisitos aparecen evidenciados.
// Es la etapa que miden la precisión, la exhaustividad y F1 (apartado 2.6.4).
function deteccionRequisitos({ textoCv, requisitos }) {
  return mensajes(`Tarea: indica qué requisitos de la oferta están evidenciados en el texto del currículum.
<contexto>
Requisitos: ${requisitos.join(', ')}
Texto del currículum:
${textoCv}
</contexto>
Un requisito está evidenciado si el texto menciona experiencia, formación o proyectos que lo usen.
Formato de salida: {"evidenciados": ["nombre exacto del requisito", ...]}`);
}

module.exports = {
  SISTEMA, compatibilidad, analisisCv, preguntasEntrevista, evaluarRespuesta, consultaLibre, deteccionRequisitos
};
