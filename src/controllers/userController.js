const bcrypt = require('bcryptjs')
const User = require('../models/User')
const { validarUsuario } = require('../utils/validators')
const { usuarioPublico } = require('./authController')

const CAMPOS_PERFIL = ['cpf', 'dataNascimento', 'telefone', 'crm', 'especialidade']

// Todas as rotas deste controller são exclusivas de administrador.

async function list(req, res) {
  const filtro = req.query.role ? { role: req.query.role } : {}
  const users = await User.find(filtro).select('-senha').sort({ nome: 1 })
  res.json(users)
}

async function findById(req, res) {
  const user = await User.findById(req.params.id).select('-senha')

  if (!user) {
    return res.status(404).json({ mensagem: 'Usuário não encontrado' })
  }

  res.json(user)
}

async function create(req, res) {
  const { erros, dados } = validarUsuario(req.body)

  if (erros.length) {
    return res.status(400).json({ mensagem: erros.join('. '), erros })
  }

  dados.senha = await bcrypt.hash(dados.senha, 10)
  const user = await User.create(dados)

  res.status(201).json(usuarioPublico(user))
}

async function update(req, res) {
  const user = await User.findById(req.params.id)

  if (!user) {
    return res.status(404).json({ mensagem: 'Usuário não encontrado' })
  }

  // Mescla o que já existe com o que veio no body e valida o resultado
  const mesclado = { ...user.toObject(), ...req.body }
  const { erros, dados } = validarUsuario(mesclado, { exigirSenha: false })

  if (erros.length) {
    return res.status(400).json({ mensagem: erros.join('. '), erros })
  }

  user.nome = dados.nome
  user.email = dados.email
  user.role = dados.role
  // Campos do perfil que não se aplicam ao novo role são removidos
  CAMPOS_PERFIL.forEach(campo => { user[campo] = dados[campo] })

  if (req.body.senha) {
    user.senha = await bcrypt.hash(dados.senha, 10)
  }

  await user.save()
  res.json(usuarioPublico(user))
}

async function remove(req, res) {
  if (req.params.id === String(req.user.id)) {
    return res.status(400).json({ mensagem: 'Você não pode excluir a si mesmo' })
  }

  const user = await User.findByIdAndDelete(req.params.id)

  if (!user) {
    return res.status(404).json({ mensagem: 'Usuário não encontrado' })
  }

  res.json({ mensagem: 'Usuário removido' })
}

module.exports = { list, findById, create, update, remove }
