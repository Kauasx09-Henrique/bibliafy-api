const { Router } = require('express');
const userController = require('../controllers/users.controller');

// A LINHA ABAIXO ESTAVA FALTANDO
const authMiddleware = require('../config/middlewares/auth.middleware');

const router = Router();

// Rotas públicas
router.post('/register', userController.register);
router.post('/login', userController.login);

// Rota privada para atualizar o perfil (agora com o middleware importado)
router.put('/profile', authMiddleware, userController.updateProfile);

module.exports = router;