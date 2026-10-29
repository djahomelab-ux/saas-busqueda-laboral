const mysql = require('mysql2/promise');
const env = require('./env');

// El pool se conecta de forma diferida: no abre conexiones hasta la primera consulta.
const pool = mysql.createPool({ ...env.db, waitForConnections: true, connectionLimit: 10 });

module.exports = pool;
