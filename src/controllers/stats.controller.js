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


        const checkQuery = `
      SELECT 
        b.total_chapters as total,
        (SELECT COUNT(DISTINCT chapter) FROM reading_history WHERE user_id = $2 AND book_id = $1) as lidos,
        b.name as book_name
      FROM books b WHERE b.id = $1
    `;

        const { rows } = await db.query(checkQuery, [bookId, userId]);

        if (rows.length > 0) {
            const { total, lidos, book_name } = rows[0];
            let newBadge = null;

            if (total > 0 && parseInt(lidos) >= parseInt(total)) {

                const badgeInsert = await db.query(
                    `INSERT INTO completed_books (user_id, book_id) 
           VALUES ($1, $2) 
           ON CONFLICT (user_id, book_id) DO NOTHING
           RETURNING id`,
                    [userId, bookId]
                );

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
                newBadge
            });
        }

        return res.status(200).json({ message: 'Leitura registrada.' });

    } catch (error) {
        console.error("Erro ao marcar leitura:", error);
        return res.status(500).json({ message: 'Erro interno.' });
    }
};

// 2. OBTER ESTATÍSTICAS (OTIMIZADO)
exports.getUserStats = async (req, res) => {
    const userId = req.userId;

    try {

        const query = `
      SELECT 
        b.id, b.name, b.testament_id, 
        b.total_chapters, 
        COUNT(DISTINCT rh.chapter)::int AS chapters_read
      FROM books b
      LEFT JOIN reading_history rh ON rh.book_id = b.id AND rh.user_id = $1
      GROUP BY b.id, b.total_chapters
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
        console.error("Erro ao buscar estatísticas:", error);
        return res.status(500).json({ message: 'Erro ao buscar estatísticas.' });
    }
};

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
        console.error("Erro ao buscar selos:", error);
        res.status(500).json({ message: "Erro ao buscar selos" });
    }
};