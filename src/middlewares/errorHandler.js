function notFound(req, res) {
  res.status(404).json({ mensagem: 'Rota não encontrada' })
}

function errorHandler(erro, req, res, next) {
  // E-mail, CPF ou CRM duplicado
  if (erro.code === 11000) {
    const campo = Object.keys(erro.keyPattern || {})[0] || 'campo'
    const nomes = { email: 'E-mail', cpf: 'CPF', crm: 'CRM' }
    return res.status(409).json({
      mensagem: `${nomes[campo] || campo} já cadastrado`
    })
  }

  if (erro.name === 'ValidationError') {
    return res.status(400).json({ mensagem: erro.message })
  }

  // ObjectId inválido na URL
  if (erro.name === 'CastError') {
    return res.status(400).json({ mensagem: 'Identificador inválido' })
  }

  console.error(erro)
  res.status(500).json({ mensagem: 'Erro interno do servidor' })
}

module.exports = { notFound, errorHandler }
