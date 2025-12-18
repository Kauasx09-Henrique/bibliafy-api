const db = require('../config/database');

exports.markChapterRead = async (req, res) => {
  const userId = req.userId;
  const { bookId, chapter } = req.body;

  try {
    // 1. Marca o capítulo como lido
    await db.query(
      `INSERT INTO reading_history (user_id, book_id, chapter)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, book_id, chapter) DO NOTHING`,
      [userId, bookId, chapter]
    );

    // 2. VERIFICAÇÃO DE CONQUISTA (SELO)
    // Conta quantos capítulos o livro tem vs quantos o usuário leu
    const checkQuery = `
      SELECT 
        (SELECT COUNT(DISTINCT chapter) FROM verses WHERE book_id = $1) as total,
        (SELECT COUNT(DISTINCT chapter) FROM reading_history WHERE user_id = $2 AND book_id = $1) as lidos,
        b.name as book_name
      FROM books b WHERE b.id = $1
    `;
    
    const { rows } = await db.query(checkQuery, [bookId, userId]);
    const { total, lidos, book_name } = rows[0];

    let newBadge = null;

    // Se leu tudo (total == lidos), libera o selo!
    if (parseInt(lidos) >= parseInt(total)) {
      // Tenta inserir na tabela de livros completados
      // O ON CONFLICT garante que não insira se já tiver ganho antes
      const badgeInsert = await db.query(
        `INSERT INTO completed_books (user_id, book_id) 
         VALUES ($1, $2) 
         ON CONFLICT (user_id, book_id) DO NOTHING
         RETURNING id`,
        [userId, bookId]
      );

      // Se inseriu uma linha nova, significa que acabou de ganhar
      if (badgeInsert.rows.length > 0) {
        newBadge = {
          bookId,
          bookName: book_name,
          message: `Parabéns! Você completou o livro de ${book_name}!`
        };
      }
    }

    return res.status(200).json({ 
      message: 'Leitura registrada.',
      newBadge // O front vai olhar isso aqui. Se não for null, solta confete!
    });

  } catch (error) {
    console.error("Erro ao marcar leitura:", error);
    return res.status(500).json({ message: 'Erro interno.' });
  }
};

// ... mantenha o getUserStats igual ou adicione a contagem de selos nele se quiser
exports.getUserStats = async (req, res) => {
    // ... (mesmo código de antes)
};

// NOVA FUNÇÃO: Listar Selos no Perfil
exports.getBadges = async (req, res) => {
  const userId = req.userId;
  try {
    const { rows } = await db.query(`
      SELECT cb.completed_at, b.name, b.abbreviation, b.testament_id 
      FROM completed_books cb
      JOIN books b ON cb.book_id = b.id
      WHERE cb.user_id = $1
      ORDER BY cb.completed_at DESC
    `, [userId]);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar selos" });
  }
};