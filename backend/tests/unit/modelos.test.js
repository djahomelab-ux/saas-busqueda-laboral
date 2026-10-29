const { puedeCambiar } = require('../../src/models/postulacion.model');
const { puntajePregunta, puntajeGlobal } = require('../../src/models/entrevista.model');
const { normalizarHabilidad } = require('../../src/models/perfil.model');
const { completitud } = require('../../src/models/curriculum.model');
const { validarOferta } = require('../../src/models/oferta.model');

test('ciclo de estados de la postulación', () => {
  expect(puedeCambiar('registrada', 'en_proceso')).toBe(true);
  expect(puedeCambiar('en_proceso', 'entrevista')).toBe(true);
  expect(puedeCambiar('rechazada', 'entrevista')).toBe(false);
  expect(puedeCambiar('registrada', 'oferta_recibida')).toBe(false);
});

test('puntaje de entrevista calculado en el servidor', () => {
  expect(puntajePregunta({ claridad: 4, comunicacion: 4, relevancia: 5, tecnico: 4 })).toBe(85);
  expect(puntajeGlobal([85, 70])).toBe(77.5);
  expect(puntajeGlobal([])).toBeNull();
});

test('normalización de habilidades a átomos de Prolog', () => {
  expect(normalizarHabilidad('Power BI')).toBe('power_bi');
  expect(normalizarHabilidad(' JavaScript ')).toBe('javascript');
  expect(normalizarHabilidad('Diseño UX')).toBe('diseno_ux');
});

test('completitud del currículum', () => {
  expect(completitud({ datos_personales: { nombre: 'Ana' }, perfil: 'Dev', experiencia: '', formacion: null, habilidades: ['html'] })).toBe(60);
});

test('requisitos de oferta: obligatorio por defecto', () => {
  const o = validarOferta({ empresa: 'Acme', puesto: 'Dev', requisitos: [{ nombre: 'React' }, { nombre: 'Git', obligatorio: false }] });
  expect(o.requisitos).toEqual([{ nombre: 'react', obligatorio: true }, { nombre: 'git', obligatorio: false }]);
});
