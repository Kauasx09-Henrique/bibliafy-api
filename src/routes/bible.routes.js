const express = require('express');
const router = express.Router();

// ✅ Caminho corrigido (um nível acima)
const bibleController = require('../controllers/bible.controller');

// ✅ Rota inicial da API (opcional)
router.get('/', (req, res) => {
  res.status(200).send({
    success: true,
    message: 'Bem-vindo à API do Bibliafy!',
    version: '1.1.0'
  });
});

// ✅ Listar todas as versões da Bíblia
router.get('/versions', bibleController.getAllVersions);

// ✅ Listar todos os livros
router.get('/books', bibleController.getAllBooks);

// ✅ Listar os capítulos de um livro específico
router.get('/books/:book_id/chapters', bibleController.getChaptersByBook);

// ✅ Listar todos os versículos de um capítulo
router.get('/books/:book_id/chapters/:chapter', bibleController.getVersesByChapter);

// ✅ Obter um versículo aleatório
router.get('/verses/random', bibleController.getRandomVerse);

module.exports = router;
