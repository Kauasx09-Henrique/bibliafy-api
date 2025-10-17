// Em: src/routes/progress.routes.js

const express = require('express');
const ProgressController = require('../controllers/ProgressController');

const progressRoutes = express.Router();

// GET /api/progress -> Busca o progresso do usuário
progressRoutes.get('/', ProgressController.index);

// POST /api/progress -> Salva o progresso de um capítulo
progressRoutes.post('/', ProgressController.store);

module.exports = progressRoutes;