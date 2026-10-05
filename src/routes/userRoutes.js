const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const authMiddleware = require('../middlewares/authMiddleware')
const permitir = require('../middlewares/roleMiddleware')
const asyncHandler = require('../utils/asyncHandler')

// CRUD completo de usuários: somente administrador
router.use(authMiddleware, permitir('admin'))

router.get('/', asyncHandler(userController.list))
router.get('/:id', asyncHandler(userController.findById))
router.post('/', asyncHandler(userController.create))
router.put('/:id', asyncHandler(userController.update))
router.delete('/:id', asyncHandler(userController.remove))

module.exports = router
