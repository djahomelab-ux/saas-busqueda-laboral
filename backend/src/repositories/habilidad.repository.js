const pool = require('../config/db');

// Devuelve el id de la habilidad del catálogo y la crea si no existe.
async function idPorNombre(nombre, conexion = pool) {
  await conexion.execute('INSERT IGNORE INTO habilidad (nombre) VALUES (?)', [nombre]);
  const [filas] = await conexion.execute('SELECT id_habilidad FROM habilidad WHERE nombre = ?', [nombre]);
  return filas[0].id_habilidad;
}

module.exports = { idPorNombre };
