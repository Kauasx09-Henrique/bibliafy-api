const db = require('../config/database');

exports.getAllBooks = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM books ORDER BY id');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao buscar livros:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

exports.getChaptersByBook = async (req, res) => {
  const { book_id } = req.params;
  try {
    const { rows } = await db.query(
      'SELECT DISTINCT chapter FROM verse WHERE book_id = $1 ORDER BY chapter',
      [book_id]
    );
    const chapters = rows.map(row => row.chapter);
    res.status(200).json(chapters);
  } catch (error) {
    console.error('Erro ao buscar capítulos:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

exports.getVersesByChapter = async (req, res) => {
  const { book_id, chapter_num } = req.params;
  try {
    const { rows } = await db.query(
      'SELECT id, verse, text FROM verse WHERE book_id = $1 AND chapter = $2 ORDER BY verse',
      [book_id, chapter_num]
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao buscar versículos:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};
// Adicione esta função ao final de src/controllers/bible.controller.js

exports.getRandomVerse = async (req, res) => {
  try {
    // Query que busca um versículo aleatório e já junta com o nome do livro
    const query = `
      SELECT
        v.id,
        v.text,
        v.chapter,
        v.verse,
        b.name AS book_name
      FROM verse v
      JOIN books b ON v.book_id = b.id
      ORDER BY RANDOM()
      LIMIT 1;
    `;
    const { rows } = await db.query(query);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Nenhum versículo encontrado.' });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar versículo aleatório:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};