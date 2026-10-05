const usuarioLogado = exigirRole('admin')
let usuarios = []

function mostrarStatus(texto, tipo = '') {
  const el = document.getElementById('statusCrud')
  el.className = `message ${tipo}`
  el.textContent = texto
}

function trocarPerfilNovo() {
  alternarCamposPerfil('novo', document.getElementById('roleNovo').value)
}

function detalhes(u) {
  if (u.role === 'medico') return `${u.especialidade || '-'} · CRM ${u.crm || '-'}`
  if (u.role === 'paciente') return `CPF ${formatarCpf(u.cpf)}`
  return 'Acesso total'
}

async function listarUsuarios() {
  const role = document.getElementById('filtroRole').value
  const { ok, dados } = await chamarApi(`/users${role ? `?role=${role}` : ''}`)
  const div = document.getElementById('usuarios')

  if (!ok) {
    div.innerHTML = `<p class="message error">${esc(dados.mensagem || 'Erro ao carregar')}</p>`
    return
  }

  usuarios = dados

  if (!usuarios.length) {
    div.innerHTML = '<p class="muted">Nenhum usuário encontrado.</p>'
    return
  }

  div.innerHTML = usuarios.map(u => `
    <article class="user-item">
      <div class="user-info">
        <div class="avatar">${esc(u.nome.charAt(0).toUpperCase())}</div>
        <div>
          <strong>${esc(u.nome)} <span class="badge badge-${esc(u.role)}">${esc(ROTULOS[u.role])}</span></strong>
          <span>${esc(u.email)}</span>
          <small>${esc(detalhes(u))}</small>
        </div>
      </div>
      <div class="actions">
        <button class="secondary small" data-acao="editar" data-id="${esc(u._id)}">Editar</button>
        <button class="danger small" data-acao="excluir" data-id="${esc(u._id)}">Excluir</button>
      </div>
    </article>
  `).join('')
}

// Um único listener para os botões da lista (evita onclick com dados inline)
document.getElementById('usuarios').addEventListener('click', evento => {
  const botao = evento.target.closest('button[data-acao]')
  if (!botao) return

  if (botao.dataset.acao === 'editar') editarUsuario(botao.dataset.id)
  if (botao.dataset.acao === 'excluir') removerUsuario(botao.dataset.id)
})

async function criarUsuario() {
  const valor = id => document.getElementById(id).value
  const role = valor('roleNovo')

  const body = {
    role,
    nome: valor('nomeNovo'),
    email: valor('emailNovo'),
    senha: valor('senhaNovo')
  }

  if (role === 'paciente') {
    body.cpf = valor('cpfNovo')
    body.dataNascimento = valor('nascimentoNovo')
    body.telefone = valor('telefoneNovo')
  }

  if (role === 'medico') {
    body.crm = valor('crmNovo')
    body.especialidade = valor('especialidadeNovo')
  }

  const { ok, dados } = await chamarApi('/users', { method: 'POST', body })

  if (!ok) {
    mostrarStatus(dados.mensagem || 'Erro ao criar usuário', 'error')
    return
  }

  document.getElementById('formNovo').reset()
  trocarPerfilNovo()
  mostrarStatus('Usuário criado com sucesso', 'success')
  listarUsuarios()
}

async function editarUsuario(id) {
  const atual = usuarios.find(u => u._id === id)
  if (!atual) return

  const nome = prompt('Nome', atual.nome)
  if (nome === null) return
  const email = prompt('E-mail', atual.email)
  if (email === null) return

  const body = { nome, email }

  if (atual.role === 'medico') {
    const crm = prompt('CRM', atual.crm)
    if (crm === null) return
    const especialidade = prompt('Especialidade', atual.especialidade)
    if (especialidade === null) return
    Object.assign(body, { crm, especialidade })
  }

  if (atual.role === 'paciente') {
    const telefone = prompt('Telefone', atual.telefone || '')
    if (telefone === null) return
    body.telefone = telefone
  }

  const { ok, dados } = await chamarApi(`/users/${id}`, { method: 'PUT', body })

  if (!ok) {
    mostrarStatus(dados.mensagem || 'Erro ao editar usuário', 'error')
    return
  }

  mostrarStatus('Usuário atualizado', 'success')
  listarUsuarios()
}

async function removerUsuario(id) {
  const atual = usuarios.find(u => u._id === id)
  if (!confirm(`Excluir ${atual ? atual.nome : 'este usuário'}?`)) return

  const { ok, dados } = await chamarApi(`/users/${id}`, { method: 'DELETE' })

  if (!ok) {
    mostrarStatus(dados.mensagem || 'Erro ao excluir usuário', 'error')
    return
  }

  mostrarStatus('Usuário removido', 'success')
  listarUsuarios()
}

if (usuarioLogado) {
  iniciarTopbar(usuarioLogado)
  trocarPerfilNovo()
  listarUsuarios()
}
