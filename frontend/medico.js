const usuarioLogado = exigirRole('medico')

async function carregarPerfil() {
  const { ok, dados } = await chamarApi('/auth/me')
  if (!ok) return
  document.getElementById('saudacao').textContent = dados.nome.replace(/^(Dr\.?|Dra\.?)\s+/i, '').split(' ')[0]
  document.getElementById('perfil').innerHTML = renderPerfil(dados)
}

async function listarPacientes() {
  const { ok, dados } = await chamarApi('/pacientes')
  const lista = document.getElementById('lista')

  if (!ok) {
    lista.innerHTML = `<p class="message error">${esc(dados.mensagem)}</p>`
    return
  }

  if (!dados.length) {
    lista.innerHTML = '<p class="muted">Nenhum paciente cadastrado ainda.</p>'
    return
  }

  lista.innerHTML = dados.map(p => `
    <article class="user-item">
      <div class="user-info">
        <div class="avatar">${esc(p.nome.charAt(0).toUpperCase())}</div>
        <div>
          <strong>${esc(p.nome)}</strong>
          <span>${esc(p.email)} · ${esc(formatarTelefone(p.telefone))}</span>
          <small>CPF ${esc(formatarCpf(p.cpf))} · Nasc. ${esc(formatarData(p.dataNascimento))}</small>
        </div>
      </div>
    </article>
  `).join('')
}

if (usuarioLogado) {
  iniciarTopbar(usuarioLogado)
  carregarPerfil()
  listarPacientes()
}
