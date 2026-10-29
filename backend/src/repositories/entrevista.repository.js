const pool = require('../config/db');
const transaccion = require('./transaccion');

async function crear(idPostulacion, preguntas) {
  return transaccion(async (cx) => {
    const [r] = await cx.execute('INSERT INTO entrevista_simulada (id_postulacion) VALUES (?)', [idPostulacion]);
    const guardadas = [];
    for (const p of preguntas) {
      const [rp] = await cx.execute(
        'INSERT INTO pregunta_respuesta (id_entrevista, pregunta, criterio_clave) VALUES (?, ?, ?)',
        [r.insertId, p.texto, p.criterio_clave]
      );
      guardadas.push({ id_pregunta: rp.insertId, texto: p.texto, tipo: p.tipo });
    }
    return { id_entrevista: r.insertId, preguntas: guardadas };
  });
}

async function obtenerPregunta(idPregunta, idEntrevista, idUsuario) {
  const [filas] = await pool.execute(
    `SELECT pr.id_pregunta, pr.pregunta, pr.criterio_clave
       FROM pregunta_respuesta pr
       JOIN entrevista_simulada en ON en.id_entrevista = pr.id_entrevista
       JOIN postulacion p ON p.id_postulacion = en.id_postulacion
      WHERE pr.id_pregunta = ? AND pr.id_entrevista = ? AND p.id_usuario = ?`,
    [idPregunta, idEntrevista, idUsuario]
  );
  return filas[0] || null;
}

async function guardarRespuesta(idPregunta, { respuesta, puntajes, retroalimentacion, puntaje }) {
  await pool.execute(
    'UPDATE pregunta_respuesta SET respuesta = ?, puntajes = ?, retroalimentacion = ?, puntaje = ? WHERE id_pregunta = ?',
    [respuesta, JSON.stringify(puntajes), retroalimentacion, puntaje, idPregunta]
  );
}

async function puntajesRespondidos(idEntrevista) {
  const [filas] = await pool.execute(
    'SELECT puntaje FROM pregunta_respuesta WHERE id_entrevista = ? AND puntaje IS NOT NULL',
    [idEntrevista]
  );
  return filas.map((f) => Number(f.puntaje));
}

async function actualizarPuntajeGlobal(idEntrevista, puntaje) {
  await pool.execute('UPDATE entrevista_simulada SET puntaje_global = ? WHERE id_entrevista = ?', [puntaje, idEntrevista]);
}

module.exports = { crear, obtenerPregunta, guardarRespuesta, puntajesRespondidos, actualizarPuntajeGlobal };
