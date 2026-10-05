require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')
const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('./config/swagger')
const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const perfilRoutes = require('./routes/perfilRoutes')
const ensureAdmin = require('./utils/ensureAdmin')
const { notFound, errorHandler } = require('./middlewares/errorHandler')

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, '../frontend')))

app.get('/health', (req, res) => res.json({ status: 'ok' }))

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api', perfilRoutes)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.use('/api', notFound)
app.use(errorHandler)

async function start() {
  if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
    console.error('Defina MONGO_URI e JWT_SECRET nas variáveis de ambiente (.env)')
    process.exit(1)
  }

  await mongoose.connect(process.env.MONGO_URI)
  console.log('MongoDB conectado')

  await ensureAdmin()

  const port = process.env.PORT || 3000
  app.listen(port, () => {
    console.log(`Servidor em http://localhost:${port}`)
    console.log(`Swagger em http://localhost:${port}/api-docs`)
  })
}

if (require.main === module) {
  start().catch(erro => {
    console.error('Falha ao iniciar:', erro.message)
    process.exit(1)
  })
}

module.exports = app
