const pool = require('../config/db');
const transaccion = require('./transaccion');

async function listar(idUsuario) {
  const [filas] = await pool.execute(
    `SELECT c.id_curriculum, c.nombre, MAX(v.numero) AS ultima_version
       FROM curriculum c LEFT JOIN version_curriculum v ON v.id_curriculum = c.id_curriculum
      WHERE c.id_usuario = ?
      GROUP BY c.id_curriculum, c.nombre
      ORDER BY c.id_curriculum`,
    [idUsuario]
  );
  return filas;
}

async function crear(idUsuario, nombre) {
  const [r] = await pool.execute('INSERT INTO curriculum (id_usuario, nombre) VALUES (?, ?)', [idUsuario, nombre]);
  return r.insertId;
}

async function perteneceA(idCurriculum, idUsuario) {
  const [filas] = await pool.execute(
    'SELECT 1 FROM curriculum WHERE id_curriculum = ? AND id_usuario = ?',
    [idCurriculum, idUsuario]
  );
  return filas.length > 0;
}

// El bloqueo FOR UPDATE evita que dos guardados simultáneos obtengan el mismo número.
async function crearVersion(idCurriculum, contenido) {
  return transaccion(async (cx) => {
    await cx.execute('SELECT id_curriculum FROM curriculum WHERE id_curriculum = ? FOR UPDATE', [idCurriculum]);
    const [[{ ultimo }]] = await cx.execute(
      'SELECT COALESCE(MAX(numero), 0) AS ultimo FROM version_curriculum WHERE id_curriculum = ?',
      [idCurriculum]
    );
    const numero = Number(ultimo) + 1;
    const [r] = await cx.execute(
      'INSERT INTO version_curriculum (id_curriculum, numero, contenido) VALUES (?, ?, ?)',
      [idCurriculum, numero, JSON.stringify(contenido)]
    );
    return { id_version: r.insertId, numero };
  });
}

async function obtenerVersion(idVersion, idUsuario) {
  const [filas] = await pool.execute(
    `SELECT v.id_version, v.numero, v.contenido, c.nombre
       FROM version_curriculum v JOIN curriculum c ON c.id_curriculum = v.id_curriculum
      WHERE v.id_version = ? AND c.id_usuario = ?`,
    [idVersion, idUsuario]
  );
  const v = filas[0];
  if (v && typeof v.contenido === 'string') v.contenido = JSON.parse(v.contenido);
  return v || null;
}

module.exports = { listar, crear, perteneceA, crearVersion, obtenerVersion };
