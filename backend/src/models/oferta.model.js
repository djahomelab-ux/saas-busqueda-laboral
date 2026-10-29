const { validar, esTexto } = require('./validar');
const { normalizarHabilidad } = require('./perfil.model');

const MODALIDADES = ['presencial', 'remoto', 'hibrido'];

function validarOferta(d = {}) {
  validar([
    [esTexto(d.empresa, 120), 'La empresa es obligatoria'],
    [esTexto(d.puesto, 120), 'El puesto es obligatorio'],
    [d.modalidad === undefined || MODALIDADES.includes(d.modalidad), 'Modalidad no válida'],
    [Array.isArray(d.requisitos) && d.requisitos.length > 0, 'La oferta debe tener al menos un requisito'],
    [d.requisitos.every((r) => r && esTexto(r.nombre, 60)), 'Cada requisito debe tener nombre']
  ]);
  return {
    empresa: d.empresa.trim(),
    puesto: d.puesto.trim(),
    descripcion: d.descripcion || null,
    modalidad: d.modalidad || null,
    ubicacion: d.ubicacion || null,
    requisitos: d.requisitos.map((r) => ({ nombre: normalizarHabilidad(r.nombre), obligatorio: r.obligatorio !== false }))
  };
}

module.exports = { MODALIDADES, validarOferta };
