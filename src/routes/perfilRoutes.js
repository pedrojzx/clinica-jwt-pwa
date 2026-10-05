const express = require('express')
const router = express.Router()
const perfilController = require('../controllers/perfilController')
const authMiddleware = require('../middlewares/authMiddleware')
const permitir = require('../middlewares/roleMiddleware')
const asyncHandler = require('../utils/asyncHandler')

router.get('/medicos', authMiddleware, asyncHandler(perfilController.listarMedicos))
router.get(
  '/pacientes',
  authMiddleware,
  permitir('medico', 'admin'),
  asyncHandler(perfilController.listarPacientes)
)

module.exports = router
