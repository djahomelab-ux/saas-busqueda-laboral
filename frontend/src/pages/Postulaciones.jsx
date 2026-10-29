import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

const ESTADOS = ['registrada', 'en_proceso', 'entrevista', 'oferta_recibida', 'rechazada', 'desistida'];

export default function Postulaciones() {
  const [lista, setLista] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [nueva, setNueva] = useState({ id_oferta: '', id_version: '' });
  const [error, setError] = useState('');

  const cargar = () => api(`/postulaciones${filtro ? `?estado=${filtro}` : ''}`).then(setLista).catch((e) => setError(e.message));
  useEffect(() => { cargar(); }, [filtro]);

  async function registrar(e) {
    e.preventDefault();
    try { await api('/postulaciones', { metodo: 'POST', cuerpo: nueva }); setNueva({ id_oferta: '', id_version: '' }); cargar(); }
    catch (err) { setError(err.message); }
  }

  async function cambiar(id, estado) {
    try { await api(`/postulaciones/${id}/estado`, { metodo: 'PATCH', cuerpo: { estado } }); setError(''); cargar(); }
    catch (err) { setError(err.message); }
  }

  return (
    <>
      <h1>Seguimiento de postulaciones</h1>
      {error && <p className="error">{error}</p>}
      <div className="tarjeta">
        <label>Filtrar por estado</label>
        <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
          <option value="">Todas</option>{ESTADOS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <table>
          <thead><tr><th>Puesto</th><th>Empresa</th><th>CV</th><th>Fecha</th><th>Estado</th></tr></thead>
          <tbody>{lista.map((p) => (
            <tr key={p.id_postulacion}>
              <td>{p.puesto}</td><td>{p.empresa}</td><td>v{p.version_cv}</td><td>{String(p.fecha_postulacion).slice(0, 10)}</td>
              <td>
                <select value={p.estado} onChange={(e) => cambiar(p.id_postulacion, e.target.value)}>
                  {ESTADOS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <form className="tarjeta fila" onSubmit={registrar}>
        <div><label>Id de oferta</label><input value={nueva.id_oferta} onChange={(e) => setNueva({ ...nueva, id_oferta: e.target.value })} required /></div>
        <div><label>Id de versión de CV</label><input value={nueva.id_version} onChange={(e) => setNueva({ ...nueva, id_version: e.target.value })} required /></div>
        <div><button className="principal">Registrar postulación</button></div>
      </form>
    </>
  );
}
