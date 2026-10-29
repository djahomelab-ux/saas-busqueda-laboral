import React, { useState } from 'react';
import { hayToken, guardarToken } from './api.js';
import Acceso from './pages/Acceso.jsx';
import Perfil from './pages/Perfil.jsx';
import Curriculum from './pages/Curriculum.jsx';
import Ofertas from './pages/Ofertas.jsx';
import Postulaciones from './pages/Postulaciones.jsx';
import Entrevistas from './pages/Entrevistas.jsx';
import Asistente from './pages/Asistente.jsx';
import Suscripcion from './pages/Suscripcion.jsx';

const MODULOS = [
  ['perfil', 'Perfil', Perfil],
  ['curriculum', 'Currículum', Curriculum],
  ['ofertas', 'Ofertas', Ofertas],
  ['postulaciones', 'Postulaciones', Postulaciones],
  ['entrevistas', 'Entrevistas', Entrevistas],
  ['asistente', 'Asistente', Asistente],
  ['suscripcion', 'Suscripción', Suscripcion]
];

export default function App() {
  const [sesion, setSesion] = useState(hayToken());
  const [vista, setVista] = useState('perfil');

  if (!sesion) return <Acceso alIngresar={() => setSesion(true)} />;

  const Vista = MODULOS.find(([id]) => id === vista)[2];
  return (
    <div className="marco">
      <nav className="menu">
        <strong className="marca">Búsqueda laboral</strong>
        {MODULOS.map(([id, nombre]) => (
          <button key={id} className={id === vista ? 'activo' : ''} onClick={() => setVista(id)}>{nombre}</button>
        ))}
        <button className="salir" onClick={() => { guardarToken(null); setSesion(false); }}>Cerrar sesión</button>
      </nav>
      <main className="contenido"><Vista /></main>
    </div>
  );
}
