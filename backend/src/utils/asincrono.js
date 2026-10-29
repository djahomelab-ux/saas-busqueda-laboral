// Envuelve un controller async para enviar los errores al middleware de errores.
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
