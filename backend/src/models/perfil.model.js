const { validar, esTexto } = require('./validar');

const NIVELES = ['basico', 'intermedio', 'avanzado'];

// Traducción del nivel del perfil al nivel que usan las reglas de Prolog.
const NIVEL_REGLAS = { basico: 'poco', intermedio: 'evidenciado', avanzado: 'evidenciado' };

function validarHabilidad(d = {}) {
  validar([
    [esTexto(d.nombre, 60), 'El nombre de la habilidad es obligatorio'],
    [NIVELES.includes(d.nivel), `El nivel debe ser uno de: ${NIVELES.join(', ')}`]
  ]);
  return { nombre: normalizarHabilidad(d.nombre), nivel: d.nivel };
}

// "Power BI" -> "power_bi": formato de átomo válido para Prolog y clave del catálogo.
function normalizarHabilidad(nombre) {
  return nombre.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

module.exports = { NIVELES, NIVEL_REGLAS, validarHabilidad, normalizarHabilidad };
