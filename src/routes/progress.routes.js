// Em: src/routes/progress.routes.js

const express = require('express');
const ProgressController = require('../controllers/ProgressController');

const progressRoutes = express.Router();

// Rota para BUSCAR o progresso do usuário logado
// GET -> /api/progress/
progressRoutes.get('/', ProgressController.index);

// Rota para SALVAR um capítulo como lido
// POST -> /api/progress/
progressRoutes.post('/', ProgressController.store);

module.exports = progressRoutes;