const pool = require('../config/db');

async function registrar({ idUsuario, tipo, latenciaMs, intentos = 1 }) {
  await pool.execute(
    'INSERT INTO consulta_asistente (id_usuario, tipo, latencia_ms, intentos) VALUES (?, ?, ?, ?)',
    [idUsuario, tipo, latenciaMs, intentos]
  );
}

async function contarDelMes(idUsuario) {
  const [[{ total }]] = await pool.execute(
    `SELECT COUNT(*) AS total FROM consulta_asistente
      WHERE id_usuario = ? AND fecha >= DATE_FORMAT(CURDATE(), '%Y-%m-01')`,
    [idUsuario]
  );
  return Number(total);
}

module.exports = { registrar, contarDelMes };
