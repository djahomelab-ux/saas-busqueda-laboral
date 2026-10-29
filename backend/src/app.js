const express = require('express');
const rutas = require('./routes');
const manejarErrores = require('./middlewares/manejarErrores');

const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '200kb' }));

// CORS para el frontend en desarrollo (Vite, puerto 5173).
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.get('/api/salud', (req, res) => res.json({ estado: 'ok' }));
app.use('/api', rutas);
app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));
app.use(manejarErrores);

module.exports = app;
