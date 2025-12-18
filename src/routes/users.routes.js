const express = require('express');
const router = express.Router();
const userController = require('../controllers/users.controller');
const authMiddleware = require('../config/middlewares/auth.middleware');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);

router.put('/update', authMiddleware, userController.updateProfile);
router.get('/check-nickname', authMiddleware, userController.checkNickname);
router.put('/profile', authMiddleware, userController.updateProfile);
router.put('/progress', authMiddleware, userController.updateProgress);

module.exports = router;