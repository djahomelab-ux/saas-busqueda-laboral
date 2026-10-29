const pool = require('../config/db');
const habilidadRepository = require('./habilidad.repository');
const { NIVEL_REGLAS } = require('../models/perfil.model');

async function asegurarPerfil(idUsuario) {
  await pool.execute('INSERT IGNORE INTO perfil_profesional (id_usuario) VALUES (?)', [idUsuario]);
  const [filas] = await pool.execute('SELECT id_perfil FROM perfil_profesional WHERE id_usuario = ?', [idUsuario]);
  return filas[0].id_perfil;
}

async function obtener(idUsuario) {
  const [filas] = await pool.execute(
    'SELECT titulo, resumen, experiencia FROM perfil_profesional WHERE id_usuario = ?',
    [idUsuario]
  );
  const perfil = filas[0] || { titulo: null, resumen: null, experiencia: null };
  return { ...perfil, habilidades: await habilidadesDeUsuario(idUsuario) };
}

async function actualizar(idUsuario, { titulo, resumen, experiencia }) {
  await asegurarPerfil(idUsuario);
  await pool.execute(
    'UPDATE perfil_profesional SET titulo = ?, resumen = ?, experiencia = ? WHERE id_usuario = ?',
    [titulo ?? null, resumen ?? null, experiencia ?? null, idUsuario]
  );
}

async function guardarHabilidad(idUsuario, nombre, nivel) {
  const idPerfil = await asegurarPerfil(idUsuario);
  const idHabilidad = await habilidadRepository.idPorNombre(nombre);
  await pool.execute(
    `INSERT INTO perfil_habilidad (id_perfil, id_habilidad, nivel) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE nivel = VALUES(nivel)`,
    [idPerfil, idHabilidad, nivel]
  );
}

async function habilidadesDeUsuario(idUsuario) {
  const [filas] = await pool.execute(
    `SELECT h.nombre, ph.nivel
       FROM perfil_habilidad ph
       JOIN perfil_profesional p ON p.id_perfil = ph.id_perfil
       JOIN habilidad h ON h.id_habilidad = ph.id_habilidad
      WHERE p.id_usuario = ?
      ORDER BY h.nombre`,
    [idUsuario]
  );
  return filas;
}

// Habilidades con el nivel que esperan las reglas de Prolog (evidenciado | poco).
async function habilidadesParaReglas(idUsuario) {
  const filas = await habilidadesDeUsuario(idUsuario);
  return filas.map((h) => ({ nombre: h.nombre, nivel: NIVEL_REGLAS[h.nivel] }));
}

module.exports = { obtener, actualizar, guardarHabilidad, habilidadesDeUsuario, habilidadesParaReglas };
