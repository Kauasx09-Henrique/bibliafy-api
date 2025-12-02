const db = require('../config/database');

exports.createNote = async (req, res) => {
  const userId = req.userId;
  const { verse_id, title, content } = req.body;

  if (!verse_id || !title || !content) {
    return res.status(400).json({ message: 'Título, conteúdo e ID do versículo são obrigatórios.' });
  }

  try {
    const { rows } = await db.query(
      'INSERT INTO notes (user_id, verse_id, title, content) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, verse_id, title, content]
    );

    return res.status(201).json({
      message: 'Anotação criada com sucesso!',
      note: rows[0]
    });

  } catch (error) {
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

exports.getUserNotes = async (req, res) => {
  const userId = req.userId;

  try {
    const query = `
      SELECT 
        n.id,
        n.title,
        n.content,
        n.created_at,
        n.updated_at,
        v.text AS verse_text,
        v.chapter,
        v.verse,
        b.name AS book_name,
        b.id AS book_id
      FROM notes n
      JOIN verses v ON n.verse_id = v.id
      JOIN books b ON v.book_id = b.id
      WHERE n.user_id = $1
      ORDER BY n.updated_at DESC
    `;

    const { rows } = await db.query(query, [userId]);
    return res.status(200).json(rows);

  } catch (error) {
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

exports.updateNote = async (req, res) => {
  const userId = req.userId;
  const { note_id } = req.params;
  const { title, content } = req.body;

  if (!title && !content) {
    return res.status(400).json({ message: 'Envie título ou conteúdo para atualizar.' });
  }

  try {
    const exists = await db.query(
      'SELECT id FROM notes WHERE id = $1 AND user_id = $2',
      [note_id, userId]
    );

    if (exists.rows.length === 0) {
      return res.status(404).json({ message: 'Anotação não encontrada ou não pertence a você.' });
    }

    const { rows } = await db.query(
      'UPDATE notes SET title = $1, content = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      [title || null, content || null, note_id]
    );

    return res.status(200).json({
      message: 'Anotação atualizada com sucesso!',
      note: rows[0]
    });

  } catch (error) {
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

exports.deleteNote = async (req, res) => {
  const userId = req.userId;
  const { note_id } = req.params;

  try {
    const { rowCount } = await db.query(
      'DELETE FROM notes WHERE id = $1 AND user_id = $2',
      [note_id, userId]
    );

    if (rowCount === 0) {
      return res.status(404).json({ message: 'Anotação não encontrada.' });
    }

    return res.status(200).json({ message: 'Anotação deletada com sucesso.' });

  } catch (error) {
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};
