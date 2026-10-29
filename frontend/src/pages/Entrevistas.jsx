import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

const NIVELES = ['practicante', 'junior', 'semi senior', 'senior'];
const CRITERIOS = [['claridad', 'Claridad'], ['comunicacion', 'Comunicación'], ['relevancia', 'Relevancia'], ['tecnico', 'Aspecto técnico']];

export default function Entrevistas() {
  const [postulaciones, setPostulaciones] = useState([]);
  const [idPostulacion, setIdPostulacion] = useState('');
  const [nivel, setNivel] = useState('junior');
  const [entrevista, setEntrevista] = useState(null);
  const [respuestas, setRespuestas] = useState({});
  const [evaluaciones, setEvaluaciones] = useState({});
  const [global, setGlobal] = useState(null);
  const [cargando, setCargando] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { api('/postulaciones').then(setPostulaciones).catch((e) => setError(e.message)); }, []);

  async function iniciar(e) {
    e.preventDefault();
    setCargando('preguntas'); setError('');
    try {
      setEntrevista(await api('/entrevistas', { metodo: 'POST', cuerpo: { id_postulacion: Number(idPostulacion), nivel } }));
      setRespuestas({}); setEvaluaciones({}); setGlobal(null);
    } catch (err) { setError(err.message); }
    setCargando(null);
  }

  async function responder(idPregunta) {
    setCargando(idPregunta); setError('');
    try {
      const r = await api(`/entrevistas/${entrevista.id_entrevista}/respuestas`, {
        metodo: 'POST', cuerpo: { id_pregunta: idPregunta, respuesta: respuestas[idPregunta] || '' }
      });
      setEvaluaciones((ev) => ({ ...ev, [idPregunta]: r }));
      setGlobal(r.puntaje_global);
    } catch (err) { setError(err.message); }
    setCargando(null);
  }

  return (
    <>
      <h1>Simulador de entrevista</h1>
      {error && <p className="error">{error}</p>}
      <form className="tarjeta fila" onSubmit={iniciar}>
        <div>
          <label>Postulación</label>
          <select value={idPostulacion} onChange={(e) => setIdPostulacion(e.target.value)} required>
            <option value="">Selecciona una postulación</option>
            {postulaciones.map((p) => <option key={p.id_postulacion} value={p.id_postulacion}>{p.puesto} · {p.empresa}</option>)}
          </select>
        </div>
        <div>
          <label>Nivel del puesto</label>
          <select value={nivel} onChange={(e) => setNivel(e.target.value)}>
            {NIVELES.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div style={{ flex: '0 0 auto', alignSelf: 'end' }}>
          <button className="principal" disabled={!idPostulacion || cargando}>{cargando === 'preguntas' ? 'Generando…' : 'Generar preguntas'}</button>
        </div>
      </form>
      {!postulaciones.length && <p className="nota">Primero registra una postulación en el módulo Postulaciones.</p>}

      {entrevista && (
        <>
          {global !== null && (
            <div className="tarjeta">
              <div className="porcentaje">{global} / 100</div>
              <p className="nota">Puntaje global de la sesión: promedio de las preguntas respondidas, calculado por el servidor.</p>
            </div>
          )}
          {entrevista.preguntas.map((p, i) => {
            const ev = evaluaciones[p.id_pregunta];
            return (
              <div key={p.id_pregunta} className="tarjeta">
                <p className="nota">Pregunta {i + 1} · {p.tipo === 'tecnica' ? 'Técnica' : 'Conductual'}</p>
                <h3>{p.texto}</h3>
                <textarea value={respuestas[p.id_pregunta] || ''} placeholder="Escribe tu respuesta"
                  onChange={(e) => setRespuestas({ ...respuestas, [p.id_pregunta]: e.target.value })} />
                <button className="principal" disabled={!respuestas[p.id_pregunta]?.trim() || cargando}
                  onClick={() => responder(p.id_pregunta)}>
                  {cargando === p.id_pregunta ? 'Evaluando…' : ev ? 'Volver a evaluar' : 'Enviar respuesta'}
                </button>
                {ev && (
                  <>
                    <table><tbody>
                      {CRITERIOS.map(([k, nombre]) => <tr key={k}><td>{nombre}</td><td>{ev.puntajes[k]} / 5</td></tr>)}
                      <tr><td><b>Puntaje de la pregunta</b></td><td><b>{ev.puntaje} / 100</b></td></tr>
                    </tbody></table>
                    <p><b>Retroalimentación:</b> {ev.retroalimentacion}</p>
                    <p><b>Cómo mejorar:</b> {ev.mejora}</p>
                  </>
                )}
              </div>
            );
          })}
        </>
      )}
    </>
  );
}
