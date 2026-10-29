const { Router } = require('express');
const autenticar = require('../middlewares/autenticar');
const verificarPlan = require('../middlewares/verificarPlan');
const auth = require('../controllers/auth.controller');
const perfil = require('../controllers/perfil.controller');
const curriculum = require('../controllers/curriculum.controller');
const oferta = require('../controllers/oferta.controller');
const postulacion = require('../controllers/postulacion.controller');
const entrevista = require('../controllers/entrevista.controller');
const asistente = require('../controllers/asistente.controller');
const suscripcion = require('../controllers/suscripcion.controller');

const r = Router();

r.post('/auth/registro', auth.registrar);
r.post('/auth/login', auth.iniciarSesion);

r.use(autenticar); // todas las rutas siguientes requieren token

r.get('/perfil', perfil.obtener);
r.put('/perfil', perfil.actualizar);
r.post('/perfil/habilidades', perfil.guardarHabilidad);

r.get('/curriculums', curriculum.listar);
r.post('/curriculums', curriculum.crear);
r.post('/curriculums/:id/versiones', curriculum.guardarVersion);
r.get('/curriculums/versiones/:idVersion', curriculum.obtenerVersion);

r.get('/ofertas', oferta.listar);
r.post('/ofertas', oferta.crear);
r.get('/ofertas/:id', oferta.obtener);

r.get('/postulaciones', postulacion.listar);
r.post('/postulaciones', postulacion.registrar);
r.patch('/postulaciones/:id/estado', postulacion.cambiarEstado);

r.post('/entrevistas', verificarPlan, entrevista.crear);
r.post('/entrevistas/:id/respuestas', verificarPlan, entrevista.responder);

r.post('/asistente/compatibilidad', verificarPlan, asistente.compatibilidad);
r.post('/asistente/analisis-cv', verificarPlan, asistente.analisisCv);
r.post('/asistente/consulta', verificarPlan, asistente.consulta);

r.get('/suscripcion', suscripcion.obtener);
r.post('/suscripcion/plan', suscripcion.cambiarPlan);
r.get('/pagos', suscripcion.pagos);

module.exports = r;
