const jwt = require('jsonwebtoken')

function authMiddleware(req, res, next) {
  const [tipo, token] = (req.headers.authorization || '').split(' ')

  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ mensagem: 'Token não informado' })
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch (erro) {
    return res.status(401).json({ mensagem: 'Token inválido ou expirado' })
  }
}

module.exports = authMiddleware
