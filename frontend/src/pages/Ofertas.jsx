import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Ofertas() {
  const [ofertas, setOfertas] = useState([]);
  const [f, setF] = useState({ empresa: '', puesto: '', modalidad: 'remoto', requisitos: '' });
  const [analisis, setAnalisis] = useState(null);
  const [idVersion, setIdVersion] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const cargar = () => api('/ofertas').then(setOfertas).catch((e) => setError(e.message));
  useEffect(() => { cargar(); }, []);

  // Formato de requisitos: "html, css, react*"  (el asterisco marca un requisito deseable)
  async function crear(e) {
    e.preventDefault();
    const requisitos = f.requisitos.split(',').map((s) => s.trim()).filter(Boolean)
      .map((s) => ({ nombre: s.replace(/\*$/, ''), obligatorio: !s.endsWith('*') }));
    try {
      await api('/ofertas', { metodo: 'POST', cuerpo: { ...f, requisitos } });
      setF({ empresa: '', puesto: '', modalidad: 'remoto', requisitos: '' });
      cargar();
    } catch (err) { setError(err.message); }
  }

  async function analizar(idOferta) {
    setCargando(true); setError(''); setAnalisis(null);
    try {
      setAnalisis(await api('/asistente/compatibilidad', { metodo: 'POST', cuerpo: { id_oferta: idOferta, id_version: Number(idVersion) } }));
    } catch (err) { setError(err.message); }
    setCargando(false);
  }

  return (
    <>
      <h1>Ofertas laborales</h1>
      {error && <p className="error">{error}</p>}
      <div className="tarjeta">
        <label>Id de la versión de currículum para el análisis</label>
        <input value={idVersion} onChange={(e) => setIdVersion(e.target.value)} placeholder="Ej.: 1" />
        <table>
          <thead><tr><th>Puesto</th><th>Empresa</th><th>Modalidad</th><th></th></tr></thead>
          <tbody>{ofertas.map((o) => (
            <tr key={o.id_oferta}>
              <td>{o.puesto}</td><td>{o.empresa}</td><td>{o.modalidad}</td>
              <td><button disabled={!idVersion || cargando} onClick={() => analizar(o.id_oferta)}>Analizar compatibilidad</button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      {analisis && (
        <div className="tarjeta">
          <div className="fila">
            <div>
              <div className="porcentaje">{analisis.compatibilidad.ponderada} %</div>
              <p className="nota">Compatibilidad ponderada · simple {analisis.compatibilidad.simple} %<br />
                Fuente: {analisis.fuente.curriculum} v{analisis.fuente.version} · {analisis.fuente.oferta}</p>
            </div>
            <table><tbody>{analisis.compatibilidad.detalle.map((d) => (
              <tr key={d.habilidad}><td>{d.habilidad}</td><td className={`estado-${d.estado}`}>{d.estado.replace('_', ' ')}</td></tr>
            ))}</tbody></table>
          </div>
          <h3>Recomendación del asistente</h3>
          <p>{analisis.recomendacion.resumen}</p>
          <ul>{analisis.recomendacion.brechas.map((b) => <li key={b.habilidad}><b>{b.habilidad}:</b> {b.accion}</li>)}</ul>
          <p><b>Siguiente paso:</b> {analisis.recomendacion.siguiente_paso}</p>
        </div>
      )}
      <form className="tarjeta" onSubmit={crear}>
        <h3>Registrar oferta</h3>
        <div className="fila">
          <div><label>Empresa</label><input value={f.empresa} onChange={(e) => setF({ ...f, empresa: e.target.value })} required /></div>
          <div><label>Puesto</label><input value={f.puesto} onChange={(e) => setF({ ...f, puesto: e.target.value })} required /></div>
          <div>
            <label>Modalidad</label>
            <select value={f.modalidad} onChange={(e) => setF({ ...f, modalidad: e.target.value })}>
              <option value="presencial">Presencial</option><option value="remoto">Remoto</option><option value="hibrido">Híbrido</option>
            </select>
          </div>
        </div>
        <label>Requisitos separados por comas (agrega * a los deseables)</label>
        <input value={f.requisitos} onChange={(e) => setF({ ...f, requisitos: e.target.value })} placeholder="html, css, javascript, react, git*" required />
        <button className="principal">Guardar oferta</button>
      </form>
    </>
  );
}
