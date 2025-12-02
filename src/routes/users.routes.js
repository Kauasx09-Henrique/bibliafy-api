const { Router } = require('express');
const userController = require('../controllers/users.controller');
const authMiddleware = require('../config/middlewares/auth.middleware');

const router = Router();

router.post('/register', userController.register);
router.post('/login', userController.login);

router.put('/profile', authMiddleware, userController.updateProfile);

module.exports = router;
