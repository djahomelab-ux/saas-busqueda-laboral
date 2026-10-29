require('dotenv').config();

const env = {
  puerto: Number(process.env.PORT) || 3000,
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'saas_busqueda_laboral'
  },
  jwtSecret: process.env.JWT_SECRET || 'solo_para_desarrollo',
  openaiKey: process.env.OPENAI_API_KEY,
  openaiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  prologUrl: process.env.PROLOG_URL || 'http://localhost:5000',
  limiteGratuito: Number(process.env.LIMITE_GRATUITO) || 5
};

module.exports = env;
