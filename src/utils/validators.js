const ROLES = ['paciente', 'medico', 'admin']

function apenasDigitos(valor) {
  return String(valor || '').replace(/\D/g, '')
}

function cpfValido(cpf) {
  if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false

  const calcula = (tamanho) => {
    let soma = 0
    for (let i = 0; i < tamanho; i++) {
      soma += Number(cpf[i]) * (tamanho + 1 - i)
    }
    const resto = (soma * 10) % 11
    return resto === 10 ? 0 : resto
  }

  return calcula(9) === Number(cpf[9]) && calcula(10) === Number(cpf[10])
}

// Aceita "12345/PE", "12345-PE", "12345 pe" e normaliza para "12345/PE"
function normalizarCrm(valor) {
  const m = String(valor || '').trim().match(/^(\d{4,7})\s*[-/ ]?\s*([A-Za-z]{2})$/)
  return m ? `${m[1]}/${m[2].toUpperCase()}` : null
}

/**
 * Valida e normaliza os dados de um usuário.
 * Retorna { erros: [], dados: {} }. Só os campos do perfil
 * correspondente ao role entram em "dados".
 */
function validarUsuario(body, { exigirSenha = true, rolesPermitidos = ROLES } = {}) {
  const erros = []
  const dados = {}

  dados.nome = String(body.nome || '').trim()
  if (dados.nome.length < 3) erros.push('Nome deve ter ao menos 3 caracteres')

  dados.email = String(body.email || '').trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) erros.push('E-mail inválido')

  if (exigirSenha || body.senha) {
    if (String(body.senha || '').length < 6) {
      erros.push('Senha deve ter ao menos 6 caracteres')
    } else {
      dados.senha = String(body.senha)
    }
  }

  dados.role = body.role
  if (!rolesPermitidos.includes(dados.role)) {
    erros.push(`Perfil inválido. Use: ${rolesPermitidos.join(', ')}`)
  }

  if (dados.role === 'paciente') {
    dados.cpf = apenasDigitos(body.cpf)
    if (!cpfValido(dados.cpf)) erros.push('CPF inválido')

    const nascimento = new Date(body.dataNascimento)
    if (!body.dataNascimento || isNaN(nascimento) || nascimento > new Date()) {
      erros.push('Data de nascimento inválida')
    } else {
      dados.dataNascimento = nascimento
    }

    const telefone = apenasDigitos(body.telefone)
    if (telefone) {
      if (telefone.length < 10 || telefone.length > 11) {
        erros.push('Telefone deve ter DDD + 8 ou 9 dígitos')
      } else {
        dados.telefone = telefone
      }
    }
  }

  if (dados.role === 'medico') {
    dados.crm = normalizarCrm(body.crm)
    if (!dados.crm) erros.push('CRM inválido. Exemplo: 12345/PE')

    dados.especialidade = String(body.especialidade || '').trim()
    if (!dados.especialidade) erros.push('Especialidade é obrigatória')
  }

  return { erros, dados }
}

module.exports = { ROLES, validarUsuario, cpfValido, normalizarCrm }
