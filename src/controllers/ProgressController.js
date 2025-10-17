// Em: src/controllers/ProgressController.js

const db = require('../config/database');

/**
 * 📖 Busca todo o progresso de leitura do usuário logado.
 */
exports.index = async (req, res) => {
  const user_id = req.userId; // vem do middleware de autenticação

  try {
    const query = `
      SELECT 
        rp.book_id, 
        rp.chapters_read,
        b.name AS book_name,
        COUNT(DISTINCT v.chapter) AS total_chapters
      FROM reading_progress rp
      JOIN books b ON b.id = rp.book_id
      JOIN verses v ON v.book_id = b.id
      WHERE rp.user_id = $1
      GROUP BY rp.book_id, b.name, rp.chapters_read
      ORDER BY rp.book_id;
    `;

    const { rows } = await db.pool.query(query, [user_id]);
    res.status(200).send(rows);
  } catch (error) {
    console.error('❌ Erro ao buscar progresso:', error);
    res.status(500).send({ message: 'Erro interno do servidor.' });
  }
};

/**
 * ✅ Salva ou atualiza o progresso de leitura de um capítulo.
 */
exports.store = async (req, res) => {
  const user_id = req.userId;
  const { book_id, chapter } = req.body;

  if (!book_id || !chapter) {
    return res.status(400).send({ message: 'É necessário informar o ID do livro e o capítulo.' });
  }

  try {
    // 1️⃣ Busca progresso existente
    const findQuery = `
      SELECT id, chapters_read 
      FROM reading_progress 
      WHERE user_id = $1 AND book_id = $2
    `;
    const { rows } = await db.pool.query(findQuery, [user_id, book_id]);
    const existing = rows[0];

    if (existing) {
      // 2️⃣ Atualiza registro existente
      let chapters_read = JSON.parse(existing.chapters_read || '[]');

      if (!chapters_read.includes(chapter)) {
        chapters_read.push(chapter);
        chapters_read.sort((a, b) => a - b);
      }

      const updateQuery = `
        UPDATE reading_progress 
        SET chapters_read = $1 
        WHERE id = $2 
        RETURNING book_id, chapters_read
      `;
      const { rows: updatedRows } = await db.pool.query(updateQuery, [
        JSON.stringify(chapters_read),
        existing.id,
      ]);

      console.log(`✅ Progresso atualizado para user ${user_id}: Livro ${book_id}, Capítulo ${chapter}`);

      res.status(200).send(updatedRows[0]);
    } else {
      // 3️⃣ Insere novo registro
      const newChapters = JSON.stringify([chapter]);
      const insertQuery = `
        INSERT INTO reading_progress (user_id, book_id, chapters_read)
        VALUES ($1, $2, $3)
        RETURNING book_id, chapters_read
      `;
      const { rows: insertedRows } = await db.pool.query(insertQuery, [
        user_id,
        book_id,
        newChapters,
      ]);

      console.log(`🆕 Novo progresso criado para user ${user_id}: Livro ${book_id}, Capítulo ${chapter}`);

      res.status(201).send(insertedRows[0]);
    }
  } catch (error) {
    console.error('❌ Erro ao salvar progresso:', error);
    res.status(500).send({ message: 'Erro interno do servidor.' });
  }
};
