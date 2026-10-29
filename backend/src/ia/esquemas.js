// Validadores de la salida JSON de cada tarea del asistente.
const esTexto = (v) => typeof v === 'string' && v.trim().length > 0;
const esLista = (v, fn) => Array.isArray(v) && v.every(fn);
const esPuntaje = (v) => Number.isInteger(v) && v >= 1 && v <= 5;

const SECCIONES = ['datos_personales', 'perfil', 'experiencia', 'formacion', 'habilidades'];

const recomendacion = (d) =>
  esTexto(d.resumen) &&
  esLista(d.fortalezas, esTexto) &&
  esLista(d.brechas, (b) => b && esTexto(b.habilidad) && esTexto(b.accion)) &&
  esTexto(d.siguiente_paso);

const analisisCv = (d) =>
  esLista(d.observaciones, (o) => o && SECCIONES.includes(o.seccion) && esTexto(o.problema) && esTexto(o.sugerencia)) &&
  d.observaciones.length >= 1;

const preguntas = (d) =>
  esLista(d.preguntas, (p) => p && esTexto(p.texto) && ['tecnica', 'conductual'].includes(p.tipo) && esTexto(p.criterio_clave)) &&
  d.preguntas.length === 5;

const evaluacion = (d) =>
  d.puntajes && ['claridad', 'comunicacion', 'relevancia', 'tecnico'].every((c) => esPuntaje(d.puntajes[c])) &&
  esTexto(d.retroalimentacion) && esTexto(d.mejora);

const consulta = (d) => esTexto(d.respuesta) && esLista(d.fuentes, esTexto);

const deteccion = (d) => esLista(d.evidenciados, esTexto);

module.exports = { recomendacion, analisisCv, preguntas, evaluacion, consulta, deteccion };
