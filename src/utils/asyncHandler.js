// Express 4 não captura erros de funções async sozinho.
// Este wrapper repassa o erro para o errorHandler.
module.exports = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)
