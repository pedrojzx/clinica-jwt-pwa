const api = '/api'

const PAGINAS = {
  admin: '/usuarios.html',
  medico: '/medico.html',
  paciente: '/paciente.html'
}

const ROTULOS = {
  admin: 'Administrador',
  medico: 'Médico',
  paciente: 'Paciente'
}

function getToken() {
  return localStorage.getItem('token')
}

function getUsuario() {
  try {
    return JSON.parse(localStorage.getItem('usuario'))
  } catch (erro) {
    return null
  }
}

function salvarSessao(token, usuario) {
  localStorage.setItem('token', token)
  localStorage.setItem('usuario', JSON.stringify(usuario))
}

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('usuario')
  window.location.href = '/'
}

// Protege a página: sem token volta ao login; com perfil errado vai para a página do próprio perfil.
function exigirRole(...rolesPermitidos) {
  const usuario = getUsuario()

  if (!getToken() || !usuario) {
    logout()
    return null
  }

  if (!rolesPermitidos.includes(usuario.role)) {
    window.location.href = PAGINAS[usuario.role] || '/'
    return null
  }

  return usuario
}

// fetch com Authorization automático. Token expirado (401) = logout.
async function chamarApi(caminho, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const resposta = await fetch(`${api}${caminho}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  })

  const dados = await resposta.json().catch(() => ({}))

  if (resposta.status === 401 && token) {
    logout()
  }

  return { ok: resposta.ok, status: resposta.status, dados }
}

// Evita XSS ao montar HTML com dados vindos da API
function esc(texto) {
  return String(texto ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]))
}

function formatarCpf(cpf) {
  const d = String(cpf || '').replace(/\D/g, '')
  return d.length === 11 ? d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : (cpf || '-')
}

function formatarTelefone(tel) {
  const d = String(tel || '').replace(/\D/g, '')
  if (d.length === 11) return d.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  if (d.length === 10) return d.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  return tel || '-'
}

function formatarData(iso) {
  if (!iso) return '-'
  // Usa a parte da data (UTC) para não "voltar um dia" por causa do fuso horário
  const [ano, mes, dia] = String(iso).slice(0, 10).split('-')
  return `${dia}/${mes}/${ano}`
}

// Mostra/oculta os campos de paciente ou médico conforme o perfil escolhido
function alternarCamposPerfil(prefixo, role) {
  document.getElementById(`${prefixo}Paciente`).classList.toggle('hidden', role !== 'paciente')
  document.getElementById(`${prefixo}Medico`).classList.toggle('hidden', role !== 'medico')
}

function renderPerfil(u) {
  const linhas = [['Nome', u.nome], ['E-mail', u.email], ['Perfil', ROTULOS[u.role]]]

  if (u.role === 'paciente') {
    linhas.push(
      ['CPF', formatarCpf(u.cpf)],
      ['Nascimento', formatarData(u.dataNascimento)],
      ['Telefone', formatarTelefone(u.telefone)]
    )
  }

  if (u.role === 'medico') {
    linhas.push(['CRM', u.crm], ['Especialidade', u.especialidade])
  }

  return `<dl class="profile">${linhas
    .map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`)
    .join('')}</dl>`
}

function iniciarTopbar(usuario) {
  const el = document.getElementById('topbarUsuario')
  if (el) el.textContent = `${usuario.nome} · ${ROTULOS[usuario.role]}`
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
}
