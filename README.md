# Clínica Digital — Cadastro e autenticação de médicos e pacientes

Evolução do projeto `crud_usuario_jwt_pwa`: o cadastro e o login agora têm **dois perfis públicos** (médico e paciente), mais um perfil **admin** para gerenciar tudo.

**Stack:** Node.js · Express · MongoDB/Mongoose · JWT · bcryptjs · Swagger · HTML/CSS/JS · PWA

## Perfis e permissões

| Perfil | Como entra | O que acessa |
|---|---|---|
| **paciente** | Cadastro público (CPF, nascimento, telefone) | Seus dados + lista de médicos (filtro por especialidade) |
| **medico** | Cadastro público (CRM, especialidade) | Seus dados + lista de pacientes |
| **admin** | Criado pelo `.env` (`ADMIN_EMAIL`/`ADMIN_SENHA`) — **nunca** pelo cadastro público | CRUD completo de usuários |

Cada perfil é redirecionado para a própria tela após o login:
`paciente.html`, `medico.html` ou `usuarios.html` (admin).

## O que mudou em relação ao projeto original

**Funcionalidades**
- `role` com `paciente | medico | admin`; campos específicos por perfil (CPF/nascimento/telefone para paciente; CRM/especialidade para médico).
- Cadastro público com formulário que muda conforme o tipo escolhido.
- Novas rotas: `GET /api/auth/me`, `GET /api/medicos`, `GET /api/pacientes`.
- Novas telas: `paciente.html` e `medico.html`; `usuarios.html` agora é exclusiva do admin.

**Correções de segurança/robustez**
- O cadastro público antes aceitava `role: "admin"` (qualquer um virava admin). Agora só aceita paciente/médico.
- Validação de dados: e-mail, senha (mín. 6), **CPF (com dígitos verificadores)**, CRM (`12345/PE`), especialidade.
- CPF, CRM e e-mail únicos (erro 409 amigável).
- `authMiddleware` antes quebrava com token ausente/inválido; agora responde 401.
- Funções `async` agora passam por `asyncHandler` + `errorHandler` (antes, um erro derrubava o servidor).
- Mensagem de login igual para e-mail inexistente e senha errada.
- Admin não consegue excluir a si mesmo.
- Front: escape de HTML (evita XSS pelo nome do usuário) e helper `chamarApi` com logout automático em 401.
- PWA: service worker não intercepta a API, usa "rede primeiro" e limpa caches antigos; manifest agora tem ícones.

## Rodar localmente

```bash
cp .env.example .env     # ajuste MONGO_URI e JWT_SECRET
npm install
npm run dev
```

- App: http://localhost:3000
- Swagger: http://localhost:3000/api-docs
- Admin inicial (do `.env`): `admin@clinica.com` / `admin123`

> Precisa de MongoDB local (`mongodb://127.0.0.1:27017/clinica_jwt`) ou de uma string do MongoDB Atlas.

## Endpoints

```text
POST   /api/auth/register     público   (role: paciente | medico)
POST   /api/auth/login        público
GET    /api/auth/me           logado

GET    /api/medicos           logado    (?especialidade=cardio)
GET    /api/pacientes         medico, admin

GET    /api/users             admin     (?role=medico)
GET    /api/users/:id         admin
POST   /api/users             admin
PUT    /api/users/:id         admin
DELETE /api/users/:id         admin

GET    /health                health check (usado no deploy)
```

Exemplo de cadastro de médico:

```json
POST /api/auth/register
{
  "role": "medico",
  "nome": "Dr. João Souza",
  "email": "joao@clinica.com",
  "senha": "123456",
  "crm": "12345/PE",
  "especialidade": "Cardiologia"
}
```

## Deploy (MongoDB Atlas + Render)

### 1. Banco de dados — MongoDB Atlas
1. Crie uma conta em https://www.mongodb.com/atlas e um cluster **M0 (gratuito)**.
2. *Database Access* → crie um usuário e senha.
3. *Network Access* → **Add IP Address → Allow access from anywhere** (`0.0.0.0/0`).
4. *Connect → Drivers* → copie a string e troque `<password>` e o nome do banco:
   `mongodb+srv://USUARIO:SENHA@cluster0.xxxxx.mongodb.net/clinica_jwt?retryWrites=true&w=majority`

### 2. Código no GitHub
```bash
git init
git add .
git commit -m "Cadastro e autenticação de médicos e pacientes"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/clinica-jwt-pwa.git
git push -u origin main
```
Confira antes do commit que o `.env` **não** aparece em `git status` (ele está no `.gitignore`).

### 3. Aplicação — Render
1. https://render.com → **New + → Web Service** → conecte o repositório.
2. Configure: **Runtime** Node · **Build** `npm install` · **Start** `npm start`.
3. Em **Environment**, adicione:

| Variável | Valor |
|---|---|
| `MONGO_URI` | string do Atlas |
| `JWT_SECRET` | texto longo e aleatório (não use `segredo123`) |
| `ADMIN_EMAIL` | e-mail do admin |
| `ADMIN_SENHA` | senha do admin |
| `ADMIN_NOME` | `Administrador` |

4. Deploy. A URL pública será algo como `https://clinica-jwt-pwa.onrender.com`.

Alternativa: o arquivo `render.yaml` na raiz permite criar tudo por **New + → Blueprint**.

> No plano gratuito do Render o serviço "dorme" após ~15 min sem acesso; o primeiro acesso depois disso demora cerca de 1 minuto.

## Estrutura

```text
├── frontend/
│   ├── index.html · auth.js           login + cadastro (paciente/médico)
│   ├── paciente.html · paciente.js    área do paciente
│   ├── medico.html · medico.js        área do médico
│   ├── usuarios.html · usuarios.js    painel admin (CRUD)
│   ├── common.js                      sessão, chamadas à API, guardas de rota
│   ├── style.css · manifest.json · service-worker.js · icons/
├── src/
│   ├── config/swagger.js
│   ├── controllers/  auth · user · perfil
│   ├── middlewares/  authMiddleware · roleMiddleware · errorHandler
│   ├── models/User.js
│   ├── routes/       auth · user · perfil
│   ├── utils/        validators · asyncHandler · ensureAdmin
│   └── server.js
├── .env.example · .gitignore · render.yaml · package.json
```

## Limitações conhecidas (projeto didático)
- Token JWT em `localStorage` (simples, mas exposto a XSS; em produção prefira cookie `HttpOnly`).
- Sem limite de tentativas de login (`express-rate-limit`) nem `helmet`.
- Sem recuperação de senha nem verificação do CRM em órgão oficial.
