const db = require('../config/database');

// ✅ LISTAR TODAS AS VERSÕES DISPONÍVEIS
exports.getAllVersions = async (req, res) => {
  try {
    const { rows } = await db.pool.query(
      'SELECT id, abbreviation, name FROM versions ORDER BY id'
    );
    res.status(200).send(rows);
  } catch (error) {
    console.error('Erro ao buscar versões:', error);
    res.status(500).send({ message: 'Erro interno do servidor.' });
  }
};

// ✅ LISTAR TODOS OS LIVROS (SEM CHAPTERS)
exports.getAllBooks = async (req, res) => {
  try {
    const { rows } = await db.pool.query(
      'SELECT id, testament_id, name, abbreviation FROM books ORDER BY id'
    );
    res.status(200).send(rows);
  } catch (error) {
    console.error('Erro ao buscar livros:', error);
    res.status(500).send({ message: 'Erro interno do servidor.' });
  }
};

// ✅ LISTAR TODOS OS CAPÍTULOS DE UM LIVRO
exports.getChaptersByBook = async (req, res) => {
  const { book_id } = req.params;
  try {
    const { rows } = await db.pool.query(
      'SELECT DISTINCT chapter FROM verses WHERE book_id = $1 ORDER BY chapter',
      [book_id]
    );
    const chapters = rows.map(row => row.chapter);
    res.status(200).send(chapters);
  } catch (error) {
    console.error('Erro ao buscar capítulos:', error);
    res.status(500).send({ message: 'Erro interno do servidor.' });
  }
};

// ✅ LISTAR VERSÍCULOS DE UM CAPÍTULO (FILTRANDO POR VERSÃO)
exports.getVersesByChapter = async (req, res) => {
  const { book_id, chapter } = req.params;
  const { version = 'NVI' } = req.query; // padrão = NVI

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
    const { rows } = await db.pool.query(query, [book_id, chapter, version]);

    if (rows.length === 0) {
      return res
        .status(404)
        .send({ message: 'Capítulo não encontrado para esta versão.' });
    }

    res.status(200).send(rows);
  } catch (error) {
    console.error('Erro ao buscar versículos:', error);
    res.status(500).send({ message: 'Erro interno do servidor.' });
  }
};

// ✅ VERSÍCULO ALEATÓRIO (FILTRANDO POR VERSÃO)
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
    const { rows } = await db.pool.query(query, [version]);

    if (rows.length === 0) {
      return res
        .status(404)
        .send({ message: 'Nenhum versículo encontrado para a versão especificada.' });
    }

    res.status(200).send(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar versículo aleatório:', error);
    res.status(500).send({ message: 'Erro interno do servidor.' });
  }
};
