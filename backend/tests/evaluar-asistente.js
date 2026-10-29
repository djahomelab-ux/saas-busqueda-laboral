// Calcula las métricas de la Tabla 12 del informe sobre el conjunto de validación.
//   node tests/evaluar-asistente.js [tests/datos/validacion.json]
// Requiere OPENAI_API_KEY y el servicio Prolog en ejecución (swipl prolog/iniciar.pl).
const fs = require('fs');
const path = require('path');
const iaClient = require('../src/ia/iaClient');
const prologClient = require('../src/ia/prologClient');
const prompts = require('../src/ia/prompts');
const esquemas = require('../src/ia/esquemas');
const { esConsistente } = require('../src/services/asistente.service');

const archivo = process.argv[2] || path.join(__dirname, 'datos', 'validacion.json');
const datos = JSON.parse(fs.readFileSync(archivo, 'utf8'));

const r2 = (x) => Math.round(x * 100) / 100;
const pct = (a, b) => (b ? r2((a / b) * 100) : null);
function percentil(valores, p) {
  const v = [...valores].sort((a, b) => a - b);
  return v[Math.min(v.length - 1, Math.ceil((p / 100) * v.length) - 1)];
}

async function medir(fn) {
  const inicio = Date.now();
  const r = await fn();
  return { ...r, ms: Date.now() - inicio };
}

async function main() {
  let vp = 0, fp = 0, fn = 0, primerIntento = 0, llamadas = 0, consistentes = 0;
  const latencias = [];
  const detalle = [];

  for (const caso of datos.pares) {
    // 1. Detección de requisitos en el texto libre (precisión, exhaustividad, F1).
    const d = await medir(() => iaClient.completarJSON(
      prompts.deteccionRequisitos({ textoCv: caso.texto_cv, requisitos: caso.requisitos.map((r) => r.nombre) }),
      { temperatura: 0, validar: esquemas.deteccion }));
    latencias.push(d.ms); llamadas++; if (d.intento === 1) primerIntento++;
    const predichos = new Set(d.datos.evidenciados.map((h) => h.toLowerCase()));
    const reales = new Set(caso.evidenciados_evaluador);
    for (const r of caso.requisitos.map((q) => q.nombre)) {
      if (predichos.has(r) && reales.has(r)) vp++;
      else if (predichos.has(r)) fp++;
      else if (reales.has(r)) fn++;
    }

    // 2. Recomendación sobre el resultado de Prolog (consistencia con el motor de reglas).
    const habilidades = caso.evidenciados_evaluador.map((nombre) => ({ nombre, nivel: 'evidenciado' }));
    const reglas = await prologClient.compatibilidad({ habilidades, requisitos: caso.requisitos });
    const oferta = { puesto: caso.puesto, requisitos: caso.requisitos };
    const c = await medir(() => iaClient.completarJSON(
      prompts.compatibilidad({ reglas, oferta, version: { numero: 1, contenido: { perfil: caso.texto_cv } } }),
      { temperatura: 0.2, validar: esquemas.recomendacion }));
    latencias.push(c.ms); llamadas++; if (c.intento === 1) primerIntento++;
    const ok = esConsistente(c.datos, reglas);
    if (ok) consistentes++;
    detalle.push({ id: caso.id, predichos: [...predichos], consistente: ok, recomendacion: c.datos });
  }

  // 3. Evaluación de respuestas de entrevista frente al puntaje de los evaluadores (MAE).
  let errorAbs = 0, n = 0;
  for (const e of datos.entrevistas || []) {
    const r = await medir(() => iaClient.completarJSON(
      prompts.evaluarRespuesta({ pregunta: e.pregunta, criterioClave: e.criterio_clave, respuesta: e.respuesta }),
      { temperatura: 0.2, validar: esquemas.evaluacion }));
    latencias.push(r.ms); llamadas++; if (r.intento === 1) primerIntento++;
    for (const [criterio, valor] of Object.entries(e.puntajes_evaluador)) {
      errorAbs += Math.abs(r.datos.puntajes[criterio] - valor); n++;
    }
  }

  const P = vp / (vp + fp || 1), R = vp / (vp + fn || 1);
  const metricas = {
    precision: r2(P),
    exhaustividad: r2(R),
    f1: r2(P + R ? (2 * P * R) / (P + R) : 0),
    consistencia_con_reglas_pct: pct(consistentes, datos.pares.length),
    validez_formato_primer_intento_pct: pct(primerIntento, llamadas),
    mae_entrevistas: n ? r2(errorAbs / n) : null,
    latencia_p95_ms: latencias.length ? percentil(latencias, 95) : null
  };
  // La fidelidad y la utilidad se obtienen de las fichas de los evaluadores (Anexo 6).
  console.log(JSON.stringify({ metricas, detalle }, null, 2));
  fs.writeFileSync(path.join(__dirname, 'datos', 'resultado-evaluacion.json'), JSON.stringify({ metricas, detalle }, null, 2));
}

main().catch((e) => { console.error(e.message); process.exit(1); });
