const db = require('../config/database');

// 1. MARCAR CAPÍTULO COMO LIDO (E VERIFICAR CONQUISTA)
exports.markChapterRead = async (req, res) => {
    const userId = req.userId;
    const { bookId, chapter } = req.body;

    try {
        // A. Salva no histórico de leitura
        await db.query(
            `INSERT INTO reading_history (user_id, book_id, chapter)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, book_id, chapter) DO NOTHING`,
            [userId, bookId, chapter]
        );

        // B. Verifica se completou o livro para ganhar o SELO
        // (Usa a coluna total_chapters otimizada para ser rápido)
        const checkQuery = `
      SELECT 
        b.total_chapters as total,
        (SELECT COUNT(DISTINCT chapter) FROM reading_history WHERE user_id = $2 AND book_id = $1) as lidos,
        b.name as book_name
      FROM books b WHERE b.id = $1
    `;

        const { rows } = await db.query(checkQuery, [bookId, userId]);

        // Proteção caso o livro não exista ou total_chapters seja 0
        if (rows.length > 0) {
            const { total, lidos, book_name } = rows[0];
            let newBadge = null;

            // Se leu tudo (lidos >= total), libera o selo!
            if (total > 0 && parseInt(lidos) >= parseInt(total)) {

                // Insere na tabela de conquistas
                const badgeInsert = await db.query(
                    `INSERT INTO completed_books (user_id, book_id) 
           VALUES ($1, $2) 
           ON CONFLICT (user_id, book_id) DO NOTHING
           RETURNING id`,
                    [userId, bookId]
                );

                // Se inseriu uma linha nova, retorna o objeto badge para o frontend fazer a festa
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
                newBadge // Se não for null, o front exibe o confete e o popup
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
        // Query otimizada: Pega o total_chapters direto da tabela books
        // Não faz JOIN com verses, o que deixava o sistema lento
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

        // Calcula as porcentagens
        const stats = rows.map(book => ({
            ...book,
            progress: book.total_chapters > 0
                ? Math.round((book.chapters_read / book.total_chapters) * 100)
                : 0
        }));

        // Cálculos gerais (Total lido vs Total bíblia)
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

// 3. OBTER SELOS (CONQUISTAS)
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