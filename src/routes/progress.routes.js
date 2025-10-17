const express = require('express');
const ProgressController = require('../controllers/ProgressController');
const authMiddleware = require('../config/middlewares/auth.middleware'); // <- seu middleware de autenticação

const progressRoutes = express.Router();

// GET /api/progress -> Busca o progresso do usuário (autenticado)
progressRoutes.get('/', authMiddleware, ProgressController.index);

// POST /api/progress -> Salva o progresso de um capítulo (autenticado)
progressRoutes.post('/', authMiddleware, ProgressController.store);

module.exports = progressRoutes;
