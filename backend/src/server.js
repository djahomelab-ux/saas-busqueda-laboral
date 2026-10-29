const app = require('./app');
const env = require('./config/env');

app.listen(env.puerto, () => {
  console.log(`API escuchando en http://localhost:${env.puerto}/api`);
});
