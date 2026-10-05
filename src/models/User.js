const mongoose = require('mongoose')

const ROLES = ['paciente', 'medico', 'admin']

const userSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  senha: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ROLES,
    default: 'paciente'
  },

  // Campos do paciente
  cpf: {
    type: String,
    unique: true,
    sparse: true
  },
  dataNascimento: Date,
  telefone: String,

  // Campos do médico
  crm: {
    type: String,
    unique: true,
    sparse: true
  },
  especialidade: String
}, {
  timestamps: true
})

module.exports = mongoose.model('User', userSchema)
module.exports.ROLES = ROLES
