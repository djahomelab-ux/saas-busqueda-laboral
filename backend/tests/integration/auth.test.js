// Casos CP-F01 a CP-F05 y CP-F10 (Tabla 10 del informe). La base de datos se simula.
jest.mock('../../src/repositories/usuario.repository');
jest.mock('../../src/repositories/suscripcion.repository');

const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../../src/app');
const usuarioRepository = require('../../src/repositories/usuario.repository');
const suscripcionRepository = require('../../src/repositories/suscripcion.repository');

const NUEVO = { correo: 'ana@correo.com', contrasena: 'Segura123', nombres: 'Ana', apellidos: 'Ríos' };

beforeEach(() => jest.resetAllMocks());

test('CP-F01 registro válido: 201, plan gratuito y contraseña guardada como hash', async () => {
  usuarioRepository.buscarPorCorreo.mockResolvedValue(null);
  usuarioRepository.crear.mockResolvedValue(7);
  const res = await request(app).post('/api/auth/registro').send(NUEVO);
  expect(res.status).toBe(201);
  expect(res.body).toEqual({ id_usuario: 7, correo: 'ana@correo.com' });
  const guardado = usuarioRepository.crear.mock.calls[0][0];
  expect(guardado.contrasena).not.toBe(NUEVO.contrasena);
  expect(await bcrypt.compare(NUEVO.contrasena, guardado.contrasena)).toBe(true);
  expect(suscripcionRepository.crear).toHaveBeenCalledWith(7, 'gratuito');
});

test('CP-F02 correo duplicado: 409', async () => {
  usuarioRepository.buscarPorCorreo.mockResolvedValue({ id_usuario: 1 });
  const res = await request(app).post('/api/auth/registro').send(NUEVO);
  expect(res.status).toBe(409);
  expect(usuarioRepository.crear).not.toHaveBeenCalled();
});

test('registro con contraseña corta: 400', async () => {
  const res = await request(app).post('/api/auth/registro').send({ ...NUEVO, contrasena: '123' });
  expect(res.status).toBe(400);
});

describe('inicio de sesión', () => {
  let hash;
  beforeAll(async () => { hash = await bcrypt.hash('Segura123', 10); });

  test('CP-F03 credenciales válidas: 200 con token', async () => {
    usuarioRepository.buscarPorCorreo.mockResolvedValue({ id_usuario: 7, correo: NUEVO.correo, contrasena: hash, nombres: 'Ana' });
    const res = await request(app).post('/api/auth/login').send({ correo: NUEVO.correo, contrasena: 'Segura123' });
    expect(res.status).toBe(200);
    expect(res.body.token.split('.')).toHaveLength(3);
  });

  test('CP-F04 contraseña incorrecta: 401', async () => {
    usuarioRepository.buscarPorCorreo.mockResolvedValue({ id_usuario: 7, contrasena: hash });
    const res = await request(app).post('/api/auth/login').send({ correo: NUEVO.correo, contrasena: 'otra' });
    expect(res.status).toBe(401);
  });

  test("CP-F10 intento de inyección SQL: el valor viaja como parámetro y responde 401", async () => {
    usuarioRepository.buscarPorCorreo.mockResolvedValue(null);
    const ataque = "' OR '1'='1";
    const res = await request(app).post('/api/auth/login').send({ correo: ataque, contrasena: ataque });
    expect(res.status).toBe(401);
    // El texto llega intacto (solo en minúsculas) como parámetro, nunca concatenado en el SQL.
    expect(usuarioRepository.buscarPorCorreo).toHaveBeenCalledWith(ataque.toLowerCase());
  });
});

test('CP-F05 acceso sin token: 401', async () => {
  const res = await request(app).get('/api/perfil');
  expect(res.status).toBe(401);
});
