import React, { useState } from 'react';
import { api } from '../api.js';

export default function Asistente() {
  const [mensajes, setMensajes] = useState([]);
  const [texto, setTexto] = useState('');
  const [cargando, setCargando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    const consulta = texto.trim();
    if (!consulta) return;
    setMensajes((m) => [...m, { de: 'usuario', texto: consulta }]);
    setTexto(''); setCargando(true);
    try {
      const r = await api('/asistente/consulta', { metodo: 'POST', cuerpo: { consulta } });
      setMensajes((m) => [...m, { de: 'asistente', texto: r.respuesta, fuentes: r.fuentes }]);
    } catch (err) {
      setMensajes((m) => [...m, { de: 'asistente', texto: err.message, error: true }]);
    }
    setCargando(false);
  }

  return (
    <>
      <h1>Asistente profesional</h1>
      <div className="tarjeta">
        {mensajes.length === 0 && <p className="nota">El asistente responde usando solo la información registrada en tu perfil y tus postulaciones.</p>}
        {mensajes.map((m, i) => (
          <p key={i} className={m.error ? 'error' : ''}>
            <b>{m.de === 'usuario' ? 'Tú' : 'Asistente'}:</b> {m.texto}
            {m.fuentes && <span className="nota"> · Fuentes: {m.fuentes.join(', ')}</span>}
          </p>
        ))}
        <form className="fila" onSubmit={enviar}>
          <div><input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="¿Qué debería reforzar para mis postulaciones activas?" /></div>
          <div style={{ flex: '0 0 auto' }}><button className="principal" disabled={cargando}>{cargando ? 'Pensando…' : 'Enviar'}</button></div>
        </form>
      </div>
    </>
  );
}
