const usuarioLogado = exigirRole('paciente')
let temporizador

async function carregarPerfil() {
  const { ok, dados } = await chamarApi('/auth/me')
  if (!ok) return
  document.getElementById('saudacao').textContent = dados.nome.split(' ')[0]
  document.getElementById('perfil').innerHTML = renderPerfil(dados)
}

async function listarMedicos() {
  const filtro = document.getElementById('filtro').value.trim()
  const { ok, dados } = await chamarApi(`/medicos?especialidade=${encodeURIComponent(filtro)}`)
  const lista = document.getElementById('lista')

  if (!ok) {
    lista.innerHTML = `<p class="message error">${esc(dados.mensagem)}</p>`
    return
  }

  if (!dados.length) {
    lista.innerHTML = '<p class="muted">Nenhum médico encontrado.</p>'
    return
  }

  lista.innerHTML = dados.map(m => `
    <article class="user-item">
      <div class="user-info">
        <div class="avatar">${esc(m.nome.charAt(0).toUpperCase())}</div>
        <div>
          <strong>${esc(m.nome)}</strong>
          <span>${esc(m.especialidade)} · CRM ${esc(m.crm)}</span>
          <small>${esc(m.email)}</small>
        </div>
      </div>
    </article>
  `).join('')
}

// Espera o usuário parar de digitar antes de buscar
function agendarBusca() {
  clearTimeout(temporizador)
  temporizador = setTimeout(listarMedicos, 300)
}

if (usuarioLogado) {
  iniciarTopbar(usuarioLogado)
  carregarPerfil()
  listarMedicos()
}
