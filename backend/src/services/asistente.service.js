// Orquestador del asistente: combina el motor de reglas (Prolog) con el modelo de lenguaje.
const perfilRepository = require('../repositories/perfil.repository');
const ofertaRepository = require('../repositories/oferta.repository');
const curriculumRepository = require('../repositories/curriculum.repository');
const postulacionRepository = require('../repositories/postulacion.repository');
const consultaRepository = require('../repositories/consulta.repository');
const prologClient = require('../ia/prologClient');
const iaClient = require('../ia/iaClient');
const prompts = require('../ia/prompts');
const esquemas = require('../ia/esquemas');
const { ErrorNegocio } = require('../utils/errores');

// Llama al modelo y registra la consulta (latencia e intentos) para el plan y las métricas.
async function consultarModelo(idUsuario, tipo, mensajes, opciones) {
  const inicio = Date.now();
  const { datos, intento } = await iaClient.completarJSON(mensajes, opciones);
  await consultaRepository.registrar({ idUsuario, tipo, latenciaMs: Date.now() - inicio, intentos: intento });
  return datos;
}

// Las brechas deben ser exactamente los requisitos que Prolog no marcó como evidenciados.
function brechasEsperadas(reglas) {
  return reglas.detalle.filter((r) => r.estado !== 'evidenciado').map((r) => r.habilidad).sort();
}

function esConsistente(datos, reglas) {
  const recibidas = datos.brechas.map((b) => b.habilidad.trim().toLowerCase()).sort();
  const esperadas = brechasEsperadas(reglas);
  return recibidas.length === esperadas.length && recibidas.every((h, i) => h === esperadas[i]);
}

async function analizarCompatibilidad(idUsuario, idOferta, idVersion) {
  const oferta = await ofertaRepository.obtenerConRequisitos(idOferta, idUsuario);
  if (!oferta) throw new ErrorNegocio(404, 'Oferta no encontrada');
  if (!oferta.requisitos.length) throw new ErrorNegocio(422, 'La oferta no tiene requisitos registrados');
  const version = await curriculumRepository.obtenerVersion(idVersion, idUsuario);
  if (!version) throw new ErrorNegocio(404, 'Versión de currículum no encontrada');
  const habilidades = await perfilRepository.habilidadesParaReglas(idUsuario);

  const reglas = await prologClient.compatibilidad({ habilidades, requisitos: oferta.requisitos });
  const recomendacion = await consultarModelo(idUsuario, 'compatibilidad',
    prompts.compatibilidad({ reglas, oferta, version }),
    { temperatura: 0.2, validar: (d) => esquemas.recomendacion(d) && esConsistente(d, reglas) });

  return {
    compatibilidad: reglas,            // cálculo verificable (Prolog)
    recomendacion,                     // redacción del modelo de lenguaje
    fuente: { version: version.numero, curriculum: version.nombre, oferta: oferta.puesto }
  };
}

async function analizarCurriculum(idUsuario, idVersion, puesto) {
  const version = await curriculumRepository.obtenerVersion(idVersion, idUsuario);
  if (!version) throw new ErrorNegocio(404, 'Versión de currículum no encontrada');
  const datos = await consultarModelo(idUsuario, 'analisis_cv', prompts.analisisCv({ version, puesto }),
    { temperatura: 0.2, validar: esquemas.analisisCv });
  return { ...datos, fuente: { version: version.numero, curriculum: version.nombre } };
}

async function generarPreguntas(idUsuario, oferta, nivel) {
  const datos = await consultarModelo(idUsuario, 'preguntas', prompts.preguntasEntrevista({ oferta, nivel }),
    { temperatura: 0.7, validar: esquemas.preguntas });
  return datos.preguntas;
}

async function evaluarRespuesta(idUsuario, { pregunta, criterioClave, respuesta }) {
  return consultarModelo(idUsuario, 'evaluacion', prompts.evaluarRespuesta({ pregunta, criterioClave, respuesta }),
    { temperatura: 0.2, validar: esquemas.evaluacion });
}

async function consultaLibre(idUsuario, consulta) {
  if (typeof consulta !== 'string' || !consulta.trim() || consulta.length > 1000) {
    throw new ErrorNegocio(400, 'La consulta debe tener entre 1 y 1000 caracteres');
  }
  const perfil = await perfilRepository.obtener(idUsuario);
  const postulaciones = (await postulacionRepository.listarPorUsuario(idUsuario))
    .filter((p) => !['rechazada', 'desistida'].includes(p.estado));
  return consultarModelo(idUsuario, 'consulta', prompts.consultaLibre({ perfil, postulaciones, consulta }),
    { temperatura: 0.4, validar: esquemas.consulta });
}

module.exports = {
  analizarCompatibilidad, analizarCurriculum, generarPreguntas, evaluarRespuesta, consultaLibre,
  esConsistente, brechasEsperadas
};
