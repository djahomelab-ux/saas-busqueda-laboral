const { validar, esTexto } = require('./validar');

const SECCIONES = ['datos_personales', 'perfil', 'experiencia', 'formacion', 'habilidades'];

function validarCurriculum(d = {}) {
  validar([[esTexto(d.nombre, 100), 'El nombre del currículum es obligatorio']]);
  return { nombre: d.nombre.trim() };
}

function validarContenido(c) {
  validar([[c && typeof c === 'object' && !Array.isArray(c), 'El contenido debe ser un objeto con las secciones del currículum']]);
  const contenido = {};
  for (const s of SECCIONES) contenido[s] = c[s] ?? null;
  return contenido;
}

// Porcentaje de secciones con contenido (indicador de completitud del editor).
function completitud(contenido) {
  const llenas = SECCIONES.filter((s) => {
    const v = contenido[s];
    return Array.isArray(v) ? v.length > 0 : v && (typeof v !== 'string' || v.trim());
  });
  return Math.round((llenas.length / SECCIONES.length) * 100);
}

module.exports = { SECCIONES, validarCurriculum, validarContenido, completitud };
