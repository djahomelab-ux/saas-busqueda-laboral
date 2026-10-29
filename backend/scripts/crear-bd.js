// Crea la base de datos con schema.sql y seed.sql usando la conexión del .env.
//   npm run crear-bd              -> la crea solo si no existe
//   npm run crear-bd -- --reiniciar -> la borra y la vuelve a crear (se pierden los datos)
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const env = require('../src/config/env');

const DIR_SQL = path.join(__dirname, '..', '..', 'database');
const reiniciar = process.argv.includes('--reiniciar');

async function main() {
  const { host, port, user, password, database } = env.db;
  const cx = await mysql.createConnection({ host, port, user, password, charset: 'utf8mb4', multipleStatements: true });
  try {
    const [existe] = await cx.query('SHOW DATABASES LIKE ?', [database]);
    if (existe.length && !reiniciar) {
      console.log(`La base de datos "${database}" ya existe; no se modifica.`);
      return;
    }
    if (existe.length) await cx.query(`DROP DATABASE \`${database}\``);
    for (const archivo of ['schema.sql', 'seed.sql']) {
      await cx.query(fs.readFileSync(path.join(DIR_SQL, archivo), 'utf8'));
      console.log(`Cargado ${archivo}`);
    }
    console.log(`Base de datos "${database}" lista. Usuario de prueba: juan@demo.com / Demo12345`);
  } finally {
    await cx.end();
  }
}

main().catch((error) => {
  const ayuda = {
    ECONNREFUSED: 'MySQL no está encendido (en XAMPP, dale Start a MySQL) o DB_HOST/DB_PORT no son correctos.',
    ER_ACCESS_DENIED_ERROR: 'Usuario o contraseña de MySQL incorrectos: revisa DB_USER y DB_PASSWORD en backend/.env.'
  };
  console.error(`No se pudo crear la base de datos: ${error.code || ''} ${error.message}`);
  if (ayuda[error.code]) console.error(ayuda[error.code]);
  process.exit(1);
});
