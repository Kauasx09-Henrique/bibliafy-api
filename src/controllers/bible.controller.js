const db = require('../config/database');

// NOVO: Endpoint para listar todas as versões disponíveis
exports.getAllVersions = async (req, res) => {
  try {
    const { rows } = await db.pool.query('SELECT id, abbreviation, name FROM versions ORDER BY id');
    res.status(200).send(rows);
  } catch (error) {
    console.error('Erro ao buscar versões:', error);
    res.status(500).send({ message: 'Erro interno do servidor.' });
  }
};

// ALTERADO: Agora busca os livros (não precisa de versão, pois são universais)
exports.getAllBooks = async (req, res) => {
  try {
    const { rows } = await db.pool.query('SELECT id, testament_id, name, abbreviation FROM books ORDER BY id');
    res.status(200).send(rows);
  } catch (error) {
    console.error('Erro ao buscar livros:', error);
    res.status(500).send({ message: 'Erro interno do servidor.' });
  }
};

// ALTERADO: Busca os capítulos de um livro (também universal)
exports.getChaptersByBook = async (req, res) => {
  const { book_id } = req.params;
  try {
    // A query agora usa a tabela 'verses' para contar os capítulos distintos
    const { rows } = await db.pool.query(
      'SELECT DISTINCT chapter FROM verses WHERE book_id = $1 ORDER BY chapter',
      [book_id]
    );
    // Transforma o resultado em um array de números
    const chapters = rows.map(row => row.chapter);
    res.status(200).send(chapters);
  } catch (error) {
    console.error('Erro ao buscar capítulos:', error);
    res.status(500).send({ message: 'Erro interno do servidor.' });
  }
};

// ALTERADO: Busca os versículos de um capítulo, AGORA FILTRANDO PELA VERSÃO
exports.getVersesByChapter = async (req, res) => {
  const { book_id, chapter } = req.params;
  // A versão virá como um query parameter, ex: ?version=NVI
  const { version = 'NVI' } = req.query; // Define 'NVI' como padrão se nenhuma for passada

  if (!version) {
    return res.status(400).send({ message: 'A versão da Bíblia é obrigatória.' });
  }

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
      return res.status(404).send({ message: 'Capítulo não encontrado para esta versão.' });
    }

    res.status(200).send(rows);
  } catch (error) {
    console.error('Erro ao buscar versículos:', error);
    res.status(500).send({ message: 'Erro interno do servidor.' });
  }
};

// ALTERADO: Busca um versículo aleatório, AGORA FILTRANDO PELA VERSÃO
exports.getRandomVerse = async (req, res) => {
  // A versão virá como um query parameter, ex: ?version=NVI
  const { version = 'NVI' } = req.query; // Padrão NVI

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
      return res.status(404).send({ message: 'Nenhum versículo encontrado para a versão especificada.' });
    }

    res.status(200).send(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar versículo aleatório:', error);
    res.status(500).send({ message: 'Erro interno do servidor.' });
  }
};
// Em: src/controllers/BibleController.js

// ...

exports.getAllBooks = async (req, res) => {
  try {
    // ✅ GARANTA QUE SUA LINHA ESTÁ EXATAMENTE ASSIM, COM ", chapters"
    const { rows } = await db.pool.query('SELECT id, testament_id, name, abbreviation, chapters FROM books ORDER BY id');
    res.status(200).send(rows);
  } catch (error) {
    console.error('Erro ao buscar livros:', error);
    res.status(500).send({ message: 'Erro interno do servidor.' });
  }
};

// ...