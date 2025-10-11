const { Router } = require('express');
const bibleController = require('../controllers/bible.controller');

const router = Router();

router.get('/books', bibleController.getAllBooks);
router.get('/books/:book_id/chapters', bibleController.getChaptersByBook);
router.get('/books/:book_id/chapters/:chapter_num', bibleController.getVersesByChapter);
router.get('/verses/random', bibleController.getRandomVerse);
module.exports = router;