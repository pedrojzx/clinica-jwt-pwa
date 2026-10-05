// Se já estiver logado, vai direto para a página do perfil
if (getToken() && getUsuario()) {
  window.location.href = PAGINAS[getUsuario().role] || '/'
}

function trocarTipoCadastro() {
  alternarCamposPerfil('campos', document.getElementById('tipoCadastro').value)
}

async function cadastrar() {
  const status = document.getElementById('statusCadastro')
  const role = document.getElementById('tipoCadastro').value
  const valor = id => document.getElementById(id).value

  const body = {
    role,
    nome: valor('nomeCadastro'),
    email: valor('emailCadastro'),
    senha: valor('senhaCadastro')
  }

  if (role === 'paciente') {
    body.cpf = valor('cpfCadastro')
    body.dataNascimento = valor('nascimentoCadastro')
    body.telefone = valor('telefoneCadastro')
  } else {
    body.crm = valor('crmCadastro')
    body.especialidade = valor('especialidadeCadastro')
  }

  status.className = 'message'
  status.textContent = 'Cadastrando...'

  const { ok, dados } = await chamarApi('/auth/register', { method: 'POST', body })

  if (!ok) {
    status.className = 'message error'
    status.textContent = dados.mensagem || 'Não foi possível cadastrar'
    return
  }

  status.className = 'message success'
  status.textContent = `${dados.nome} cadastrado(a) com sucesso! Faça login ao lado.`
  document.getElementById('formCadastro').reset()
  trocarTipoCadastro()
  document.getElementById('emailLogin').value = dados.email
  document.getElementById('senhaLogin').focus()
}

async function login() {
  const status = document.getElementById('statusLogin')

  const { ok, dados } = await chamarApi('/auth/login', {
    method: 'POST',
    body: {
      email: document.getElementById('emailLogin').value,
      senha: document.getElementById('senhaLogin').value
    }
  })

  if (!ok) {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    status.className = 'message error'
    status.textContent = dados.mensagem || 'Erro ao entrar'
    return
  }

  salvarSessao(dados.token, dados.usuario)
  window.location.href = PAGINAS[dados.usuario.role] || '/'
}

trocarTipoCadastro()
