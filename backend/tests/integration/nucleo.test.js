// Casos CP-F07, CP-F08, CP-F09 y CP-F11 con repositorios simulados.
jest.mock('../../src/repositories/postulacion.repository');
jest.mock('../../src/repositories/oferta.repository');
jest.mock('../../src/repositories/curriculum.repository');
jest.mock('../../src/repositories/suscripcion.repository');
jest.mock('../../src/repositories/consulta.repository');

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const env = require('../../src/config/env');
const postulacionRepository = require('../../src/repositories/postulacion.repository');
const ofertaRepository = require('../../src/repositories/oferta.repository');
const curriculumRepository = require('../../src/repositories/curriculum.repository');
const suscripcionRepository = require('../../src/repositories/suscripcion.repository');
const consultaRepository = require('../../src/repositories/consulta.repository');

const token = jwt.sign({ sub: 3 }, env.jwtSecret);
const conToken = (r) => r.set('Authorization', `Bearer ${token}`);

beforeEach(() => jest.resetAllMocks());

test('CP-F07 registrar postulación: 201 con estado registrada', async () => {
  ofertaRepository.obtenerConRequisitos.mockResolvedValue({ id_oferta: 4, requisitos: [] });
  curriculumRepository.obtenerVersion.mockResolvedValue({ id_version: 9 });
  postulacionRepository.crear.mockResolvedValue(15);
  const res = await conToken(request(app).post('/api/postulaciones')).send({ id_oferta: 4, id_version: 9 });
  expect(res.status).toBe(201);
  expect(res.body).toEqual({ id_postulacion: 15, estado: 'registrada' });
  expect(postulacionRepository.crear).toHaveBeenCalledWith(3, 4, 9);
});

test('CP-F08 transición inválida de rechazada a entrevista: 400', async () => {
  postulacionRepository.obtener.mockResolvedValue({ id_postulacion: 15, estado: 'rechazada' });
  const res = await conToken(request(app).patch('/api/postulaciones/15/estado')).send({ estado: 'entrevista' });
  expect(res.status).toBe(400);
  expect(postulacionRepository.cambiarEstado).not.toHaveBeenCalled();
});

test('transición válida de registrada a en_proceso: 200', async () => {
  postulacionRepository.obtener.mockResolvedValue({ id_postulacion: 15, estado: 'registrada' });
  const res = await conToken(request(app).patch('/api/postulaciones/15/estado')).send({ estado: 'en_proceso' });
  expect(res.status).toBe(200);
  expect(postulacionRepository.cambiarEstado).toHaveBeenCalledWith(15, 3, 'en_proceso');
});

test('CP-F09 plan gratuito que supera el límite mensual: 403', async () => {
  suscripcionRepository.planVigente.mockResolvedValue('gratuito');
  consultaRepository.contarDelMes.mockResolvedValue(5);
  const res = await conToken(request(app).post('/api/asistente/compatibilidad')).send({ id_oferta: 4, id_version: 9 });
  expect(res.status).toBe(403);
});

test('CP-F11 oferta de otro usuario: 404', async () => {
  ofertaRepository.obtenerConRequisitos.mockResolvedValue(null);
  const res = await conToken(request(app).get('/api/ofertas/99'));
  expect(res.status).toBe(404);
  expect(ofertaRepository.obtenerConRequisitos).toHaveBeenCalledWith(99, 3);
});
