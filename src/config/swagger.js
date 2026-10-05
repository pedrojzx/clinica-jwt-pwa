const seguro = [{ bearerAuth: [] }]
const idParam = [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }]
const json = (schema) => ({
  required: true,
  content: { 'application/json': { schema: { $ref: `#/components/schemas/${schema}` } } }
})

const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Clínica - Médicos e Pacientes (JWT)',
    version: '2.0.0',
    description: 'Cadastro e autenticação de médicos e pacientes. Clique em "Authorize" e cole o token retornado pelo login.'
  },
  servers: [{ url: '/' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
    },
    schemas: {
      CadastroPaciente: {
        type: 'object',
        required: ['nome', 'email', 'senha', 'role', 'cpf', 'dataNascimento'],
        properties: {
          nome: { type: 'string', example: 'Maria Silva' },
          email: { type: 'string', example: 'maria@email.com' },
          senha: { type: 'string', example: '123456' },
          role: { type: 'string', enum: ['paciente'] },
          cpf: { type: 'string', example: '52998224725' },
          dataNascimento: { type: 'string', example: '1995-04-20' },
          telefone: { type: 'string', example: '81999998888' }
        }
      },
      CadastroMedico: {
        type: 'object',
        required: ['nome', 'email', 'senha', 'role', 'crm', 'especialidade'],
        properties: {
          nome: { type: 'string', example: 'Dr. João Souza' },
          email: { type: 'string', example: 'joao@clinica.com' },
          senha: { type: 'string', example: '123456' },
          role: { type: 'string', enum: ['medico'] },
          crm: { type: 'string', example: '12345/PE' },
          especialidade: { type: 'string', example: 'Cardiologia' }
        }
      },
      Usuario: {
        type: 'object',
        description: 'Usado pelo CRUD de administrador. Campos de paciente ou médico conforme o role.',
        properties: {
          nome: { type: 'string' },
          email: { type: 'string' },
          senha: { type: 'string' },
          role: { type: 'string', enum: ['paciente', 'medico', 'admin'] },
          cpf: { type: 'string' },
          dataNascimento: { type: 'string' },
          telefone: { type: 'string' },
          crm: { type: 'string' },
          especialidade: { type: 'string' }
        }
      },
      Login: {
        type: 'object',
        required: ['email', 'senha'],
        properties: {
          email: { type: 'string' },
          senha: { type: 'string' }
        }
      }
    }
  },
  paths: {
    '/api/auth/register': {
      post: {
        summary: 'Cadastro público de paciente ou médico (role define o perfil)',
        tags: ['Autenticação'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                oneOf: [
                  { $ref: '#/components/schemas/CadastroPaciente' },
                  { $ref: '#/components/schemas/CadastroMedico' }
                ]
              }
            }
          }
        },
        responses: {
          201: { description: 'Cadastrado' },
          400: { description: 'Dados inválidos' },
          409: { description: 'E-mail, CPF ou CRM já cadastrado' }
        }
      }
    },
    '/api/auth/login': {
      post: {
        summary: 'Realiza login e retorna o token JWT',
        tags: ['Autenticação'],
        requestBody: json('Login'),
        responses: { 200: { description: 'Login realizado' }, 401: { description: 'Credenciais inválidas' } }
      }
    },
    '/api/auth/me': {
      get: {
        summary: 'Dados do usuário logado',
        tags: ['Autenticação'],
        security: seguro,
        responses: { 200: { description: 'Perfil do usuário' }, 401: { description: 'Token inválido' } }
      }
    },
    '/api/medicos': {
      get: {
        summary: 'Lista médicos (qualquer usuário logado)',
        tags: ['Diretório'],
        security: seguro,
        parameters: [{ in: 'query', name: 'especialidade', schema: { type: 'string' } }],
        responses: { 200: { description: 'Lista de médicos' } }
      }
    },
    '/api/pacientes': {
      get: {
        summary: 'Lista pacientes (somente médico ou admin)',
        tags: ['Diretório'],
        security: seguro,
        responses: { 200: { description: 'Lista de pacientes' }, 403: { description: 'Acesso negado' } }
      }
    },
    '/api/users': {
      get: {
        summary: 'Lista usuários (admin)',
        tags: ['Administração'],
        security: seguro,
        parameters: [{ in: 'query', name: 'role', schema: { type: 'string', enum: ['paciente', 'medico', 'admin'] } }],
        responses: { 200: { description: 'Lista de usuários' } }
      },
      post: {
        summary: 'Cria usuário de qualquer perfil (admin)',
        tags: ['Administração'],
        security: seguro,
        requestBody: json('Usuario'),
        responses: { 201: { description: 'Usuário criado' } }
      }
    },
    '/api/users/{id}': {
      get: {
        summary: 'Busca usuário por id (admin)',
        tags: ['Administração'],
        security: seguro,
        parameters: idParam,
        responses: { 200: { description: 'Usuário encontrado' }, 404: { description: 'Não encontrado' } }
      },
      put: {
        summary: 'Atualiza usuário (admin)',
        tags: ['Administração'],
        security: seguro,
        parameters: idParam,
        requestBody: json('Usuario'),
        responses: { 200: { description: 'Usuário atualizado' } }
      },
      delete: {
        summary: 'Remove usuário (admin)',
        tags: ['Administração'],
        security: seguro,
        parameters: idParam,
        responses: { 200: { description: 'Usuário removido' } }
      }
    }
  }
}

module.exports = swaggerSpec
