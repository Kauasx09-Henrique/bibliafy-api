exports.store = async (req, res) => {
  const user_id = req.userId;
  let { book_id, chapter } = req.body;

  if (!user_id) {
    return res.status(401).json({ message: 'Usuário não autenticado.' });
  }

  if (!book_id || !chapter) {
    return res.status(400).json({ message: 'É necessário informar o ID do livro e o capítulo.' });
  }

  // Garantir que chapter seja número
  chapter = Number(chapter);
  if (isNaN(chapter)) {
    return res.status(400).json({ message: 'Capítulo inválido.' });
  }

  try {
    // Busca progresso existente
    const findQuery = `
      SELECT id, chapters_read 
      FROM reading_progress 
      WHERE user_id = $1 AND book_id = $2
    `;
    const { rows } = await db.pool.query(findQuery, [user_id, book_id]);
    const existing = rows[0];

    if (existing) {
      // Atualiza progresso existente
      let chapters_read = [];
      try {
        chapters_read = JSON.parse(existing.chapters_read || '[]');
      } catch {
        chapters_read = [];
      }

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

      console.log(`✅ Progresso atualizado: user ${user_id}, livro ${book_id}, capítulo ${chapter}`);
      return res.status(200).json(updatedRows[0]);
    } else {
      // Cria novo registro
      const insertQuery = `
        INSERT INTO reading_progress (user_id, book_id, chapters_read)
        VALUES ($1, $2, $3)
        RETURNING book_id, chapters_read
      `;
      const { rows: insertedRows } = await db.pool.query(insertQuery, [
        user_id,
        book_id,
        JSON.stringify([chapter]),
      ]);

      console.log(`🆕 Novo progresso criado: user ${user_id}, livro ${book_id}, capítulo ${chapter}`);
      return res.status(201).json(insertedRows[0]);
    }
  } catch (error) {
    console.error('❌ Erro ao salvar progresso:', error.message);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};
