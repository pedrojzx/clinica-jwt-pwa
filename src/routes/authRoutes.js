const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const authMiddleware = require('../middlewares/authMiddleware')
const asyncHandler = require('../utils/asyncHandler')

router.post('/register', asyncHandler(authController.register))
router.post('/login', asyncHandler(authController.login))
router.get('/me', authMiddleware, asyncHandler(authController.me))

module.exports = router
