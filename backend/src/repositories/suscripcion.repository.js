const pool = require('../config/db');
const transaccion = require('./transaccion');

async function crear(idUsuario, plan) {
  await pool.execute(
    "INSERT INTO suscripcion (id_usuario, plan, fecha_inicio, estado) VALUES (?, ?, CURDATE(), 'activa')",
    [idUsuario, plan]
  );
}

async function vigente(idUsuario) {
  const [filas] = await pool.execute(
    `SELECT id_suscripcion, plan, fecha_inicio, fecha_fin, estado
       FROM suscripcion
      WHERE id_usuario = ? AND estado = 'activa' AND (fecha_fin IS NULL OR fecha_fin >= CURDATE())
      ORDER BY id_suscripcion DESC`,
    [idUsuario]
  );
  return filas[0] || null;
}

async function planVigente(idUsuario) {
  return (await vigente(idUsuario))?.plan || 'gratuito';
}

// Cambio a plan Pro con pago en modo de prueba (sin pasarela real en el Avance 2).
async function activarPro(idUsuario, monto, metodo) {
  return transaccion(async (cx) => {
    await cx.execute("UPDATE suscripcion SET estado = 'cancelada' WHERE id_usuario = ? AND estado = 'activa'", [idUsuario]);
    const [s] = await cx.execute(
      `INSERT INTO suscripcion (id_usuario, plan, fecha_inicio, fecha_fin, estado)
       VALUES (?, 'pro', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 MONTH), 'activa')`,
      [idUsuario]
    );
    const [p] = await cx.execute(
      'INSERT INTO pago (id_suscripcion, monto, metodo, referencia) VALUES (?, ?, ?, ?)',
      [s.insertId, monto, metodo, `PRUEBA-${s.insertId}`]
    );
    return { id_suscripcion: s.insertId, id_pago: p.insertId };
  });
}

async function volverAGratuito(idUsuario) {
  await transaccion(async (cx) => {
    await cx.execute("UPDATE suscripcion SET estado = 'cancelada' WHERE id_usuario = ? AND estado = 'activa'", [idUsuario]);
    await cx.execute(
      "INSERT INTO suscripcion (id_usuario, plan, fecha_inicio, estado) VALUES (?, 'gratuito', CURDATE(), 'activa')",
      [idUsuario]
    );
  });
}

async function pagos(idUsuario) {
  const [filas] = await pool.execute(
    `SELECT pg.id_pago, pg.monto, pg.fecha_pago, pg.metodo, pg.referencia, s.plan
       FROM pago pg JOIN suscripcion s ON s.id_suscripcion = pg.id_suscripcion
      WHERE s.id_usuario = ?
      ORDER BY pg.fecha_pago DESC`,
    [idUsuario]
  );
  return filas;
}

module.exports = { crear, vigente, planVigente, activarPro, volverAGratuito, pagos };
