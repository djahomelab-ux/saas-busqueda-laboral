class ErrorNegocio extends Error {
  constructor(estado, mensaje) {
    super(mensaje);
    this.estado = estado;
  }
}

module.exports = { ErrorNegocio };
