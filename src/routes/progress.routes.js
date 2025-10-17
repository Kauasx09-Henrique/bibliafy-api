const express = require('express');
const ProgressController = require('../controllers/ProgressController');
const authMiddleware = require('../config/middlewares/auth.middleware');

const router = express.Router();

// Rotas autenticadas
router.get('/', authMiddleware, ProgressController.index);
router.post('/', authMiddleware, ProgressController.store);

module.exports = router;
