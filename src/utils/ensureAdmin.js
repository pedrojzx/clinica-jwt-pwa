const bcrypt = require('bcryptjs')
const User = require('../models/User')

// Cria o primeiro administrador a partir do .env (ADMIN_EMAIL / ADMIN_SENHA).
// O cadastro público NÃO permite criar admin, então este é o único caminho inicial.
async function ensureAdmin() {
  const { ADMIN_EMAIL, ADMIN_SENHA, ADMIN_NOME } = process.env
  if (!ADMIN_EMAIL || !ADMIN_SENHA) return

  const email = ADMIN_EMAIL.trim().toLowerCase()
  const existe = await User.findOne({ email })
  if (existe) return

  await User.create({
    nome: ADMIN_NOME || 'Administrador',
    email,
    senha: await bcrypt.hash(ADMIN_SENHA, 10),
    role: 'admin'
  })
  console.log(`Administrador criado: ${email}`)
}

module.exports = ensureAdmin
