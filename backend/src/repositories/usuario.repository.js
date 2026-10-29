const pool = require('../config/db');

async function buscarPorCorreo(correo) {
  const [filas] = await pool.execute(
    'SELECT id_usuario, correo, contrasena, nombres FROM usuario WHERE correo = ?',
    [correo]
  );
  return filas[0] || null;
}

async function crear({ correo, contrasena, nombres, apellidos }) {
  const [resultado] = await pool.execute(
    'INSERT INTO usuario (correo, contrasena, nombres, apellidos) VALUES (?, ?, ?, ?)',
    [correo, contrasena, nombres, apellidos]
  );
  return resultado.insertId;
}

module.exports = { buscarPorCorreo, crear };
