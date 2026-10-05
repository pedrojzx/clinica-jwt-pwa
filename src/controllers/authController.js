const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { validarUsuario } = require('../utils/validators')

function usuarioPublico(user) {
  return {
    id: user._id,
    nome: user.nome,
    email: user.email,
    role: user.role,
    cpf: user.cpf,
    dataNascimento: user.dataNascimento,
    telefone: user.telefone,
    crm: user.crm,
    especialidade: user.especialidade
  }
}

// Cadastro público: apenas paciente ou médico. Admin nunca é criado por aqui.
async function register(req, res) {
  const { erros, dados } = validarUsuario(req.body, {
    rolesPermitidos: ['paciente', 'medico']
  })

  if (erros.length) {
    return res.status(400).json({ mensagem: erros.join('. '), erros })
  }

  dados.senha = await bcrypt.hash(dados.senha, 10)
  const user = await User.create(dados)

  res.status(201).json(usuarioPublico(user))
}

async function login(req, res) {
  const email = String(req.body.email || '').trim().toLowerCase()
  const user = await User.findOne({ email })

  const senhaValida = user
    ? await bcrypt.compare(String(req.body.senha || ''), user.senha)
    : false

  if (!senhaValida) {
    return res.status(401).json({ mensagem: 'E-mail ou senha inválidos' })
  }

  const token = jwt.sign(
    { id: user._id, nome: user.nome, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  )

  res.json({ token, usuario: usuarioPublico(user) })
}

async function me(req, res) {
  const user = await User.findById(req.user.id)

  if (!user) {
    return res.status(401).json({ mensagem: 'Usuário não existe mais' })
  }

  res.json(usuarioPublico(user))
}

module.exports = { register, login, me, usuarioPublico }
