const db = require('../config/database');

exports.getAllVersions = async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT id, abbreviation, name FROM versions ORDER BY id'
    );
    return res.status(200).json(rows);
  } catch (error) {
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

exports.getAllBooks = async (req, res) => {
  try {
    const query = `
      SELECT 
        b.id,
        b.testament_id,
        b.name,
        b.abbreviation,
        COUNT(DISTINCT v.chapter) AS total_chapters
      FROM books b
      LEFT JOIN verses v ON v.book_id = b.id
      GROUP BY b.id, b.testament_id, b.name, b.abbreviation
      ORDER BY b.id;
    `;
    const { rows } = await db.query(query);
    return res.status(200).json(rows);
  } catch (error) {
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

exports.getChaptersByBook = async (req, res) => {
  const { book_id } = req.params;
  try {
    const { rows } = await db.query(
      'SELECT DISTINCT chapter FROM verses WHERE book_id = $1 ORDER BY chapter',
      [book_id]
    );
    return res.status(200).json(rows.map(r => r.chapter));
  } catch (error) {
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

exports.getVersesByChapter = async (req, res) => {
  const { book_id, chapter } = req.params;
  const { version = 'NVI' } = req.query;

  try {
    const query = `
      SELECT v.verse, v.text
      FROM verses v
      JOIN versions ver ON v.version_id = ver.id
      WHERE v.book_id = $1
        AND v.chapter = $2
        AND ver.abbreviation = $3
      ORDER BY v.verse;
    `;
    const { rows } = await db.query(query, [book_id, chapter, version]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Capítulo não encontrado para esta versão.' });
    }

    return res.status(200).json(rows);
  } catch (error) {
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

exports.getRandomVerse = async (req, res) => {
  const { version = 'NVI' } = req.query;

  try {
    const query = `
      SELECT 
        b.name AS book_name,
        v.chapter,
        v.verse,
        v.text
      FROM verses v
      JOIN books b ON v.book_id = b.id
      JOIN versions ver ON v.version_id = ver.id
      WHERE ver.abbreviation = $1
      ORDER BY RANDOM()
      LIMIT 1;
    `;
    const { rows } = await db.query(query, [version]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Nenhum versículo encontrado para a versão especificada.' });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}
// ... (seus outros exports acima)

exports.getBookById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const query = `
      SELECT 
        b.id,
        b.testament_id,
        b.name,
        b.abbreviation,
        COUNT(DISTINCT v.chapter) AS total_chapters
      FROM books b
      LEFT JOIN verses v ON v.book_id = b.id
      WHERE b.id = $1
      GROUP BY b.id, b.testament_id, b.name, b.abbreviation;
    `;
    
    const { rows } = await db.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Livro não encontrado.' });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};
