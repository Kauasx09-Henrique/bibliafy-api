const { Router } = require('express');
const favoritesController = require('../controllers/favorites.controller');
const authMiddleware = require('../../src/config/middlewares/auth.middleware');

const router = Router();

router.use(authMiddleware);

router.post('/', favoritesController.addFavorite);
router.get('/', favoritesController.getUserFavorites);
router.delete('/:verse_id', favoritesController.removeFavorite);

module.exports = router;