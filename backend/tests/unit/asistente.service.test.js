// CP-F12 y control de salida del asistente (apartado 2.5.5).
jest.mock('../../src/repositories/perfil.repository');
jest.mock('../../src/repositories/oferta.repository');
jest.mock('../../src/repositories/curriculum.repository');
jest.mock('../../src/repositories/consulta.repository');
jest.mock('../../src/ia/prologClient');
jest.mock('openai');

const OpenAI = require('openai');
const crear = jest.fn();
OpenAI.mockImplementation(() => ({ chat: { completions: { create: crear } } }));
process.env.OPENAI_API_KEY = 'clave-de-prueba';

const perfilRepository = require('../../src/repositories/perfil.repository');
const ofertaRepository = require('../../src/repositories/oferta.repository');
const curriculumRepository = require('../../src/repositories/curriculum.repository');
const consultaRepository = require('../../src/repositories/consulta.repository');
const prologClient = require('../../src/ia/prologClient');
const asistente = require('../../src/services/asistente.service');

// Resultado real del servicio Prolog para el perfil y la oferta del ejemplo (Tabla 1).
const REGLAS = {
  apto: true, simple: 60, ponderada: 78,
  detalle: [
    { habilidad: 'html', estado: 'evidenciado' }, { habilidad: 'css', estado: 'evidenciado' },
    { habilidad: 'javascript', estado: 'evidenciado' }, { habilidad: 'react', estado: 'poco_evidenciado' },
    { habilidad: 'git', estado: 'no_evidenciado' }
  ]
};
const salida = (brechas) => ({
  choices: [{ message: { content: JSON.stringify({
    resumen: 'Perfil sólido en fundamentos web.', fortalezas: ['HTML, CSS y JavaScript evidenciados'],
    brechas: brechas.map((h) => ({ habilidad: h, accion: `Agregar un proyecto que use ${h}` })),
    siguiente_paso: 'Actualizar la sección de proyectos.'
  }) } }]
});

beforeEach(() => {
  jest.clearAllMocks();
  ofertaRepository.obtenerConRequisitos.mockResolvedValue({
    id_oferta: 1, puesto: 'Desarrollador frontend junior',
    requisitos: [
      { nombre: 'css', tipo: 'obligatorio' }, { nombre: 'html', tipo: 'obligatorio' },
      { nombre: 'javascript', tipo: 'obligatorio' }, { nombre: 'react', tipo: 'obligatorio' },
      { nombre: 'git', tipo: 'deseable' }
    ]
  });
  curriculumRepository.obtenerVersion.mockResolvedValue({ id_version: 2, numero: 3, nombre: 'CV frontend', contenido: { perfil: 'Estudiante de sistemas' } });
  perfilRepository.habilidadesParaReglas.mockResolvedValue([
    { nombre: 'html', nivel: 'evidenciado' }, { nombre: 'css', nivel: 'evidenciado' },
    { nombre: 'javascript', nivel: 'evidenciado' }, { nombre: 'react', nivel: 'poco' }
  ]);
  prologClient.compatibilidad.mockResolvedValue(REGLAS);
});

test('CP-F12 el porcentaje proviene de Prolog y las brechas son React y Git', async () => {
  crear.mockResolvedValueOnce(salida(['react', 'git']));
  const r = await asistente.analizarCompatibilidad(5, 1, 2);
  expect(r.compatibilidad.ponderada).toBe(78);
  expect(r.recomendacion.brechas.map((b) => b.habilidad)).toEqual(['react', 'git']);
  expect(r.fuente).toEqual({ version: 3, curriculum: 'CV frontend', oferta: 'Desarrollador frontend junior' });
  expect(consultaRepository.registrar).toHaveBeenCalledWith(expect.objectContaining({ idUsuario: 5, tipo: 'compatibilidad', intentos: 1 }));
});

test('una respuesta que contradice a Prolog se descarta y se reintenta', async () => {
  crear.mockResolvedValueOnce(salida(['react'])).mockResolvedValueOnce(salida(['git', 'react']));
  const r = await asistente.analizarCompatibilidad(5, 1, 2);
  expect(crear).toHaveBeenCalledTimes(2);
  expect(consultaRepository.registrar).toHaveBeenCalledWith(expect.objectContaining({ intentos: 2 }));
  expect(r.recomendacion.brechas).toHaveLength(2);
});

test('si las dos respuestas son inválidas se devuelve un error controlado (502)', async () => {
  crear.mockResolvedValue({ choices: [{ message: { content: 'no es json' } }] });
  await expect(asistente.analizarCompatibilidad(5, 1, 2)).rejects.toMatchObject({ estado: 502 });
});

test('el prompt incluye el resultado de Prolog y no los datos de contacto', async () => {
  crear.mockResolvedValueOnce(salida(['react', 'git']));
  await asistente.analizarCompatibilidad(5, 1, 2);
  const { messages, temperature, response_format: formato } = crear.mock.calls[0][0];
  expect(messages[0].role).toBe('system');
  expect(messages[1].content).toContain('compatibilidad ponderada 78 %');
  expect(messages[1].content).toContain('- git | deseable | no_evidenciado');
  expect(temperature).toBe(0.2);
  expect(formato).toEqual({ type: 'json_object' });
});

test('oferta sin requisitos: 422', async () => {
  ofertaRepository.obtenerConRequisitos.mockResolvedValue({ id_oferta: 1, puesto: 'X', requisitos: [] });
  await expect(asistente.analizarCompatibilidad(5, 1, 2)).rejects.toMatchObject({ estado: 422 });
});
