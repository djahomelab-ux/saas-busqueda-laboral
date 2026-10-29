import React, { useState } from 'react';
import { api, guardarToken } from '../api.js';

export default function Acceso({ alIngresar }) {
  const [modo, setModo] = useState('login');
  const [f, setF] = useState({ correo: '', contrasena: '', nombres: '', apellidos: '' });
  const [error, setError] = useState('');
  const cambiar = (e) => setF({ ...f, [e.target.name]: e.target.value });

  async function enviar(e) {
    e.preventDefault();
    setError('');
    try {
      if (modo === 'registro') await api('/auth/registro', { metodo: 'POST', cuerpo: f });
      const { token } = await api('/auth/login', { metodo: 'POST', cuerpo: { correo: f.correo, contrasena: f.contrasena } });
      guardarToken(token);
      alIngresar();
    } catch (err) { setError(err.message); }
  }

  return (
    <form className="tarjeta acceso" onSubmit={enviar}>
      <h1>{modo === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}</h1>
      {modo === 'registro' && (
        <div className="fila">
          <div><label>Nombres</label><input name="nombres" value={f.nombres} onChange={cambiar} required /></div>
          <div><label>Apellidos</label><input name="apellidos" value={f.apellidos} onChange={cambiar} required /></div>
        </div>
      )}
      <label>Correo electrónico</label>
      <input name="correo" type="email" value={f.correo} onChange={cambiar} required />
      <label>Contraseña</label>
      <input name="contrasena" type="password" minLength={8} value={f.contrasena} onChange={cambiar} required />
      {error && <p className="error">{error}</p>}
      <button className="principal" type="submit">{modo === 'login' ? 'Ingresar' : 'Registrarme'}</button>
      <p className="nota">
        {modo === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
        <a href="#" onClick={(e) => { e.preventDefault(); setModo(modo === 'login' ? 'registro' : 'login'); }}>
          {modo === 'login' ? 'Regístrate' : 'Inicia sesión'}
        </a>
      </p>
    </form>
  );
}
