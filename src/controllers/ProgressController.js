// Em: src/controllers/ProgressController.js

// Usa a mesma conexão com o banco de dados do seu BibleController
const db = require('../config/database'); // Verifique se este é o caminho correto para sua conexão

/**
 * Busca todo o progresso de leitura do usuário logado.
 */
exports.index = async (req, res) => {
  const user_id = req.userId; // O ID do usuário vem do seu middleware de autenticação

  try {
    const query = 'SELECT book_id, chapters_read FROM reading_progress WHERE user_id = $1';
    const { rows } = await db.pool.query(query, [user_id]);
    res.status(200).send(rows);
  } catch (error) {
    console.error('Erro ao buscar progresso:', error);
    res.status(500).send({ message: 'Erro interno do servidor.' });
  }
};

/**
 * Salva ou atualiza o progresso de leitura de um capítulo.
 */
exports.store = async (req, res) => {
  const user_id = req.userId;
  const { book_id, chapter } = req.body;

  if (!book_id || !chapter) {
    return res.status(400).send({ message: 'É necessário informar o ID do livro e o capítulo.' });
  }

  try {
    // 1. Tenta encontrar um registro de progresso existente
    const findQuery = 'SELECT id, chapters_read FROM reading_progress WHERE user_id = $1 AND book_id = $2';
    const { rows } = await db.pool.query(findQuery, [user_id, book_id]);
    const existingProgress = rows[0];

    if (existingProgress) {
      // 2a. Se existe, ATUALIZA o registro
      const chapters_read = JSON.parse(existingProgress.chapters_read);
      if (!chapters_read.includes(chapter)) {
        chapters_read.push(chapter);
        chapters_read.sort((a, b) => a - b); // Mantém a ordem
      }

      const updateQuery = 'UPDATE reading_progress SET chapters_read = $1 WHERE id = $2 RETURNING book_id, chapters_read';
      const { rows: updatedRows } = await db.pool.query(updateQuery, [JSON.stringify(chapters_read), existingProgress.id]);
      
      res.status(200).send(updatedRows[0]);
    } else {
      // 2b. Se não existe, INSERE um novo registro
      const newChapters = JSON.stringify([chapter]);
      const insertQuery = 'INSERT INTO reading_progress (user_id, book_id, chapters_read) VALUES ($1, $2, $3) RETURNING book_id, chapters_read';
      const { rows: insertedRows } = await db.pool.query(insertQuery, [user_id, book_id, newChapters]);

      res.status(201).send(insertedRows[0]);
    }
  } catch (error) {
    console.error('Erro ao salvar progresso:', error);
    res.status(500).send({ message: 'Erro interno do servidor.' });
  }
};