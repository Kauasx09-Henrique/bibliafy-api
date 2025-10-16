const express = require('express');
const router = express.Router();
const bibleController = require('../controllers/bibleController');

// Rota para a raiz da API (opcional)
router.get('/', (req, res) => {
  res.status(200).send({
    success: true,
    message: 'Bem-vindo à API do Bibliafy!',
    version: '1.1.0' // Versão atualizada para refletir o suporte a múltiplas traduções
  });
});

// NOVA ROTA: Listar todas as versões da Bíblia
router.get('/versions', bibleController.getAllVersions);

// Rota para listar todos os livros
router.get('/books', bibleController.getAllBooks);

// Rota para listar os capítulos de um livro específico
router.get('/books/:book_id/chapters', bibleController.getChaptersByBook);

// Rota para obter todos os versículos de um capítulo (agora espera ?version=...)
router.get('/books/:book_id/chapters/:chapter', bibleController.getVersesByChapter);

// Rota para obter um versículo aleatório (agora espera ?version=...)
router.get('/verses/random', bibleController.getRandomVerse);

module.exports = router;