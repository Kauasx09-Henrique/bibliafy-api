const express = require('express');
const router = express.Router();
const statsController = require('../controllers/stats.controller');
const authMiddleware = require('../config/middlewares/auth.middleware');

router.use(authMiddleware);

router.post('/mark-read', statsController.markChapterRead);
router.get('/', statsController.getUserStats);
router.get('/badges', statsController.getBadges);

module.exports = router;