const db = require('../config/database');

exports.addFavorite = async (req, res) => {
  const userId = req.userId;
  const { verse_id } = req.body;

  if (!verse_id) {
    return res.status(400).json({ message: 'O ID do versículo é obrigatório.' });
  }

  try {
    const { rows: existingFavorites } = await db.query(
      'SELECT id FROM favorites WHERE user_id = $1 AND verse_id = $2',
      [userId, verse_id]
    );

    if (existingFavorites.length > 0) {
      return res.status(409).json({ message: 'Este versículo já está nos seus favoritos.' });
    }

    const { rows } = await db.query(
      'INSERT INTO favorites (user_id, verse_id) VALUES ($1, $2) RETURNING *',
      [userId, verse_id]
    );
    res.status(201).json({ message: 'Versículo adicionado aos favoritos!', favorite: rows[0] });
  } catch (error) {
    console.error('Erro ao adicionar favorito:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

exports.getUserFavorites = async (req, res) => {
  const userId = req.userId;

  try {
    const query = `
      SELECT 
        f.verse_id, 
        f.created_at,
        v.text AS verse_text,
        v.chapter,
        v.verse,
        b.name AS book_name,
        b.id AS book_id
      FROM favorites f
      JOIN verse v ON f.verse_id = v.id
      JOIN books b ON v.book_id = b.id
      WHERE f.user_id = $1
      ORDER BY f.created_at DESC;
    `;
    const { rows } = await db.query(query, [userId]);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao buscar favoritos:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

exports.removeFavorite = async (req, res) => {
  const userId = req.userId;
  const { verse_id } = req.params;

  try {
    const { rowCount } = await db.query(
      'DELETE FROM favorites WHERE user_id = $1 AND verse_id = $2',
      [userId, verse_id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ message: 'Favorito não encontrado ou não pertence a você.' });
    }
    
    res.status(200).json({ message: 'Favorito removido com sucesso.' });
  } catch (error) {
    console.error('Erro ao remover favorito:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};