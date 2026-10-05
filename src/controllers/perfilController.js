const User = require('../models/User')

// Qualquer usuário autenticado pode ver o diretório de médicos
async function listarMedicos(req, res) {
  const filtro = { role: 'medico' }

  if (req.query.especialidade) {
    const texto = String(req.query.especialidade).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    filtro.especialidade = new RegExp(texto, 'i')
  }

  const medicos = await User.find(filtro)
    .select('nome email crm especialidade')
    .sort({ nome: 1 })

  res.json(medicos)
}

// Somente médico e admin veem a lista de pacientes
async function listarPacientes(req, res) {
  const pacientes = await User.find({ role: 'paciente' })
    .select('nome email cpf dataNascimento telefone')
    .sort({ nome: 1 })

  res.json(pacientes)
}

module.exports = { listarMedicos, listarPacientes }
