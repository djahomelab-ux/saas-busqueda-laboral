import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Suscripcion() {
  const [datos, setDatos] = useState(null);
  const [pagos, setPagos] = useState([]);
  const [error, setError] = useState('');

  const cargar = () => {
    api('/suscripcion').then(setDatos).catch((e) => setError(e.message));
    api('/pagos').then(setPagos).catch(() => {});
  };
  useEffect(() => { cargar(); }, []);

  async function cambiar(plan) {
    try { await api('/suscripcion/plan', { metodo: 'POST', cuerpo: { plan } }); setError(''); cargar(); }
    catch (err) { setError(err.message); }
  }

  if (!datos) return <p>{error || 'Cargando…'}</p>;
  return (
    <>
      <h1>Suscripción y pagos</h1>
      {error && <p className="error">{error}</p>}
      <div className="fila">
        {Object.entries(datos.planes).map(([plan, p]) => (
          <div key={plan} className="tarjeta">
            <h3>{plan === 'pro' ? 'Pro' : 'Gratuito'} {datos.plan === plan && '· plan actual'}</h3>
            <p>S/ {p.precio.toFixed(2)} al mes</p>
            <p className="nota">{p.descripcion}</p>
            {datos.plan !== plan && <button className="principal" onClick={() => cambiar(plan)}>Cambiar a este plan</button>}
          </div>
        ))}
      </div>
      <div className="tarjeta">
        <h3>Historial de pagos</h3>
        <p className="nota">Pagos registrados en modo de prueba (sin pasarela real en el Avance 2).</p>
        <table>
          <thead><tr><th>Fecha</th><th>Plan</th><th>Monto</th><th>Referencia</th></tr></thead>
          <tbody>{pagos.map((p) => (
            <tr key={p.id_pago}><td>{String(p.fecha_pago).slice(0, 10)}</td><td>{p.plan}</td><td>S/ {Number(p.monto).toFixed(2)}</td><td>{p.referencia}</td></tr>
          ))}</tbody>
        </table>
      </div>
    </>
  );
}
