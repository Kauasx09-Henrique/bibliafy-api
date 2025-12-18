const db = require('../config/database');


exports.markChapterRead = async (req, res) => {
  const userId = req.userId;
  const { bookId, chapter } = req.body;

  try {
    await db.query(
      `INSERT INTO reading_history (user_id, book_id, chapter)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, book_id, chapter) DO NOTHING`,
      [userId, bookId, chapter]
    );
    return res.status(200).json({ message: 'Leitura registrada.' });
  } catch (error) {
    console.error("Erro ao marcar leitura:", error);
    return res.status(500).json({ message: 'Erro interno.' });
  }
};

exports.getUserStats = async (req, res) => {
  const userId = req.userId;

  try {
    const query = `
      SELECT 
        b.id, b.name, b.testament_id,
        COUNT(DISTINCT v.chapter)::int AS total_chapters,
        COUNT(DISTINCT rh.chapter)::int AS chapters_read
      FROM books b
      LEFT JOIN verses v ON v.book_id = b.id
      LEFT JOIN reading_history rh ON rh.book_id = b.id AND rh.user_id = $1
      GROUP BY b.id
      ORDER BY b.id;
    `;

    const { rows } = await db.query(query, [userId]);

    const stats = rows.map(book => ({
      ...book,
      progress: book.total_chapters > 0 
        ? Math.round((book.chapters_read / book.total_chapters) * 100) 
        : 0
    }));

    const totalChapters = stats.reduce((acc, curr) => acc + curr.total_chapters, 0);
    const totalRead = stats.reduce((acc, curr) => acc + curr.chapters_read, 0);
    const totalPercentage = totalChapters > 0 ? Math.round((totalRead / totalChapters) * 100) : 0;

    return res.status(200).json({
      general: { totalRead, totalChapters, totalPercentage },
      books: stats
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao buscar estatísticas.' });
  }
};