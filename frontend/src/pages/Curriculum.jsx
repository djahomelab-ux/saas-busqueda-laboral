import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

const VACIO = { perfil: '', experiencia: '', formacion: '', habilidades: '' };
const SECCIONES = { datos_personales: 'Datos personales', perfil: 'Perfil', experiencia: 'Experiencia', formacion: 'Formación', habilidades: 'Habilidades' };

export default function Curriculum() {
  const [lista, setLista] = useState([]);
  const [nombre, setNombre] = useState('');
  const [sel, setSel] = useState(null);
  const [contenido, setContenido] = useState(VACIO);
  const [mensaje, setMensaje] = useState('');
  const [idVersion, setIdVersion] = useState('');
  const [puesto, setPuesto] = useState('');
  const [analisis, setAnalisis] = useState(null);
  const [analizando, setAnalizando] = useState(false);

  const cargar = () => api('/curriculums').then(setLista).catch((e) => setMensaje(e.message));
  useEffect(() => { cargar(); }, []);

  async function crear(e) {
    e.preventDefault();
    try { await api('/curriculums', { metodo: 'POST', cuerpo: { nombre } }); setNombre(''); cargar(); } catch (err) { setMensaje(err.message); }
  }

  async function guardarVersion(e) {
    e.preventDefault();
    try {
      const v = await api(`/curriculums/${sel}/versiones`, { metodo: 'POST', cuerpo: { contenido } });
      setMensaje(`Versión ${v.numero} guardada (id ${v.id_version}). Completitud: ${v.completitud} %`);
      cargar();
    } catch (err) { setMensaje(err.message); }
  }

  async function analizar(e) {
    e.preventDefault();
    setAnalizando(true); setMensaje('');
    try {
      setAnalisis(await api('/asistente/analisis-cv', { metodo: 'POST', cuerpo: { id_version: Number(idVersion), puesto: puesto || undefined } }));
    } catch (err) { setAnalisis(null); setMensaje(err.message); }
    setAnalizando(false);
  }

  return (
    <>
      <h1>Currículum</h1>
      {mensaje && <p className="nota">{mensaje}</p>}
      <div className="tarjeta">
        <table>
          <thead><tr><th>Nombre</th><th>Última versión</th><th></th></tr></thead>
          <tbody>{lista.map((c) => (
            <tr key={c.id_curriculum}>
              <td>{c.nombre}</td><td>{c.ultima_version ?? '—'}</td>
              <td><button onClick={() => setSel(c.id_curriculum)}>Editar</button></td>
            </tr>
          ))}</tbody>
        </table>
        <form className="fila" onSubmit={crear}>
          <div><label>Nuevo currículum</label><input value={nombre} onChange={(e) => setNombre(e.target.value)} required /></div>
          <div><button className="principal">Crear</button></div>
        </form>
      </div>
      {sel && (
        <form className="tarjeta" onSubmit={guardarVersion}>
          <h3>Nueva versión</h3>
          {Object.keys(VACIO).map((k) => (
            <div key={k}>
              <label>{k[0].toUpperCase() + k.slice(1)}</label>
              <textarea value={contenido[k]} onChange={(e) => setContenido({ ...contenido, [k]: e.target.value })} />
            </div>
          ))}
          <button className="principal">Guardar versión</button>
        </form>
      )}
      <form className="tarjeta" onSubmit={analizar}>
        <h3>Análisis del currículum con el asistente</h3>
        <div className="fila">
          <div><label>Id de la versión</label><input value={idVersion} onChange={(e) => setIdVersion(e.target.value)} placeholder="Ej.: 1" required /></div>
          <div><label>Puesto objetivo (opcional)</label><input value={puesto} onChange={(e) => setPuesto(e.target.value)} placeholder="Ej.: Desarrollador frontend junior" /></div>
        </div>
        <button className="principal" disabled={!idVersion || analizando}>{analizando ? 'Analizando…' : 'Analizar currículum'}</button>
      </form>
      {analisis && (
        <div className="tarjeta">
          <p className="nota">Fuente: {analisis.fuente.curriculum} v{analisis.fuente.version}</p>
          <table>
            <thead><tr><th>Sección</th><th>Observación</th><th>Sugerencia</th></tr></thead>
            <tbody>{analisis.observaciones.map((o, i) => (
              <tr key={i}><td>{SECCIONES[o.seccion]}</td><td>{o.problema}</td><td>{o.sugerencia}</td></tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </>
  );
}
