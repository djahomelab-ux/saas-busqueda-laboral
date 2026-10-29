const pool = require('../config/db');

const ORDEN_PERMITIDO = { fecha: 'p.fecha_postulacion', empresa: 'e.nombre', estado: 'p.estado' };

async function crear(idUsuario, idOferta, idVersion) {
  const [r] = await pool.execute(
    'INSERT INTO postulacion (id_usuario, id_oferta, id_version, fecha_postulacion) VALUES (?, ?, ?, CURDATE())',
    [idUsuario, idOferta, idVersion]
  );
  return r.insertId;
}

async function obtener(idPostulacion, idUsuario) {
  const [filas] = await pool.execute(
    'SELECT id_postulacion, id_oferta, id_version, estado FROM postulacion WHERE id_postulacion = ? AND id_usuario = ?',
    [idPostulacion, idUsuario]
  );
  return filas[0] || null;
}

async function cambiarEstado(idPostulacion, idUsuario, estado) {
  await pool.execute(
    'UPDATE postulacion SET estado = ? WHERE id_postulacion = ? AND id_usuario = ?',
    [estado, idPostulacion, idUsuario]
  );
}

// El nombre de columna no admite marcador de posición: se resuelve con lista blanca.
async function listarPorUsuario(idUsuario, estado, orden) {
  const columna = ORDEN_PERMITIDO[orden] || ORDEN_PERMITIDO.fecha;
  const [filas] = await pool.execute(
    `SELECT p.id_postulacion, o.puesto, e.nombre AS empresa, v.numero AS version_cv,
            p.estado, p.fecha_postulacion
       FROM postulacion p
       JOIN oferta_laboral o ON o.id_oferta = p.id_oferta
       JOIN empresa e ON e.id_empresa = o.id_empresa
       JOIN version_curriculum v ON v.id_version = p.id_version
      WHERE p.id_usuario = ? AND (? IS NULL OR p.estado = ?)
      ORDER BY ${columna} DESC`,
    [idUsuario, estado ?? null, estado ?? null]
  );
  return filas;
}

module.exports = { crear, obtener, cambiarEstado, listarPorUsuario };
