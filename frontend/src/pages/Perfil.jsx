import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Perfil() {
  const [perfil, setPerfil] = useState(null);
  const [hab, setHab] = useState({ nombre: '', nivel: 'intermedio' });
  const [error, setError] = useState('');

  useEffect(() => { api('/perfil').then(setPerfil).catch((e) => setError(e.message)); }, []);

  async function guardar(e) {
    e.preventDefault();
    try { setPerfil(await api('/perfil', { metodo: 'PUT', cuerpo: perfil })); setError(''); } catch (err) { setError(err.message); }
  }

  async function agregarHabilidad(e) {
    e.preventDefault();
    try {
      const habilidades = await api('/perfil/habilidades', { metodo: 'POST', cuerpo: hab });
      setPerfil({ ...perfil, habilidades });
      setHab({ nombre: '', nivel: 'intermedio' });
    } catch (err) { setError(err.message); }
  }

  if (!perfil) return <p>{error || 'Cargando…'}</p>;
  const campo = (k) => ({ value: perfil[k] || '', onChange: (e) => setPerfil({ ...perfil, [k]: e.target.value }) });

  return (
    <>
      <h1>Perfil profesional</h1>
      {error && <p className="error">{error}</p>}
      <form className="tarjeta" onSubmit={guardar}>
        <label>Título profesional</label><input {...campo('titulo')} />
        <label>Resumen</label><textarea {...campo('resumen')} />
        <label>Experiencia</label><textarea {...campo('experiencia')} />
        <button className="principal">Guardar perfil</button>
      </form>
      <div className="tarjeta">
        <h3>Habilidades</h3>
        <table><tbody>{perfil.habilidades.map((h) => <tr key={h.nombre}><td>{h.nombre}</td><td>{h.nivel}</td></tr>)}</tbody></table>
        <form className="fila" onSubmit={agregarHabilidad}>
          <div><label>Habilidad</label><input value={hab.nombre} onChange={(e) => setHab({ ...hab, nombre: e.target.value })} required /></div>
          <div>
            <label>Nivel</label>
            <select value={hab.nivel} onChange={(e) => setHab({ ...hab, nivel: e.target.value })}>
              <option value="basico">Básico</option><option value="intermedio">Intermedio</option><option value="avanzado">Avanzado</option>
            </select>
          </div>
          <div><button className="principal">Agregar</button></div>
        </form>
      </div>
    </>
  );
}
