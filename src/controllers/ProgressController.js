const db = require('../config/database');

exports.index = async (req, res) => {
  const user_id = req.userId;

  if (!user_id) {
    return res.status(401).json({ message: 'Usuário não autenticado.' });
  }

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
    res.status(200).json(rows);
  } catch (err) {
    console.error('❌ Erro ao buscar progresso:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

exports.store = async (req, res) => {
  const user_id = req.userId;
  let { book_id, chapter } = req.body;

  console.log('💡 store chamado');
  console.log('user_id:', user_id);
  console.log('req.body:', req.body);

  if (!user_id) return res.status(401).json({ message: 'Usuário não autenticado.' });
  if (!book_id || !chapter) return res.status(400).json({ message: 'ID do livro e capítulo obrigatórios.' });

  chapter = Number(chapter);
  if (isNaN(chapter)) return res.status(400).json({ message: 'Capítulo inválido.' });

  try {
    // Verifica progresso existente
    const { rows } = await db.pool.query(
      'SELECT id, chapters_read FROM reading_progress WHERE user_id = $1 AND book_id = $2',
      [user_id, book_id]
    );

    const existing = rows[0];
    if (existing) {
      let chapters_read = [];
      try {
        chapters_read = JSON.parse(existing.chapters_read || '[]');
      } catch (parseErr) {
        console.warn('⚠️ Falha ao parsear chapters_read:', parseErr);
        chapters_read = [];
      }

      if (!chapters_read.includes(chapter)) {
        chapters_read.push(chapter);
        chapters_read.sort((a, b) => a - b);
      }

      const { rows: updatedRows } = await db.pool.query(
        'UPDATE reading_progress SET chapters_read = $1 WHERE id = $2 RETURNING book_id, chapters_read',
        [JSON.stringify(chapters_read), existing.id]
      );

      console.log(`✅ Progresso atualizado: user ${user_id}, livro ${book_id}, capítulo ${chapter}`);
      return res.status(200).json(updatedRows[0]);
    } else {
      // Cria novo progresso
      const { rows: insertedRows } = await db.pool.query(
        'INSERT INTO reading_progress (user_id, book_id, chapters_read) VALUES ($1, $2, $3) RETURNING book_id, chapters_read',
        [user_id, book_id, JSON.stringify([chapter])]
      );

      console.log(`🆕 Novo progresso criado: user ${user_id}, livro ${book_id}, capítulo ${chapter}`);
      return res.status(201).json(insertedRows[0]);
    }
  } catch (err) {
    console.error('❌ Erro ao salvar progresso:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};
