const express = require('express');
const router = express.Router();
const bibleController = require('../controllers/bible.controller');

router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Bem-vindo à API do Bibliafy!',
    version: '1.1.0'
  });
});

router.get('/versions', bibleController.getAllVersions);
router.get('/books', bibleController.getAllBooks);
router.get('/books/:book_id/chapters', bibleController.getChaptersByBook);
router.get('/books/:book_id/chapters/:chapter', bibleController.getVersesByChapter);
router.get('/verses/random', bibleController.getRandomVerse);
router.get('/books/:id', bibleController.getBookById);

module.exports = router;
