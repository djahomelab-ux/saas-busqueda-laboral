const pool = require('../config/db');
const transaccion = require('./transaccion');
const habilidadRepository = require('./habilidad.repository');

async function crear(idUsuario, o) {
  return transaccion(async (cx) => {
    const [emp] = await cx.execute('SELECT id_empresa FROM empresa WHERE nombre = ?', [o.empresa]);
    let idEmpresa = emp[0]?.id_empresa;
    if (!idEmpresa) {
      const [r] = await cx.execute('INSERT INTO empresa (nombre) VALUES (?)', [o.empresa]);
      idEmpresa = r.insertId;
    }
    const [r] = await cx.execute(
      `INSERT INTO oferta_laboral (id_usuario, id_empresa, puesto, descripcion, modalidad, ubicacion)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [idUsuario, idEmpresa, o.puesto, o.descripcion, o.modalidad, o.ubicacion]
    );
    for (const req of o.requisitos) {
      const idHabilidad = await habilidadRepository.idPorNombre(req.nombre, cx);
      await cx.execute(
        'INSERT IGNORE INTO requisito_oferta (id_oferta, id_habilidad, obligatorio) VALUES (?, ?, ?)',
        [r.insertId, idHabilidad, req.obligatorio]
      );
    }
    return r.insertId;
  });
}

async function listar(idUsuario) {
  const [filas] = await pool.execute(
    `SELECT o.id_oferta, o.puesto, e.nombre AS empresa, o.modalidad, o.ubicacion
       FROM oferta_laboral o JOIN empresa e ON e.id_empresa = o.id_empresa
      WHERE o.id_usuario = ?
      ORDER BY o.id_oferta DESC`,
    [idUsuario]
  );
  return filas;
}

// Solo devuelve la oferta si pertenece al usuario (caso CP-F11).
async function obtenerConRequisitos(idOferta, idUsuario) {
  const [ofertas] = await pool.execute(
    `SELECT o.id_oferta, o.puesto, o.descripcion, o.modalidad, o.ubicacion, e.nombre AS empresa
       FROM oferta_laboral o JOIN empresa e ON e.id_empresa = o.id_empresa
      WHERE o.id_oferta = ? AND o.id_usuario = ?`,
    [idOferta, idUsuario]
  );
  if (!ofertas[0]) return null;
  const [requisitos] = await pool.execute(
    `SELECT h.nombre, IF(r.obligatorio, 'obligatorio', 'deseable') AS tipo
       FROM requisito_oferta r JOIN habilidad h ON h.id_habilidad = r.id_habilidad
      WHERE r.id_oferta = ?
      ORDER BY r.obligatorio DESC, h.nombre`,
    [idOferta]
  );
  return { ...ofertas[0], requisitos };
}

module.exports = { crear, listar, obtenerConRequisitos };
