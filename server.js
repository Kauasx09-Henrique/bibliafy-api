require('dotenv').config();
const db = require('./src/config/database');

const express = require('express');
const cors = require('cors');

const userRoutes = require('./src/routes/users.routes');
// ✅ CORREÇÃO: O nome do arquivo aqui é 'bibleRoutes.js'
const bibleRoutes = require('./src/routes/bibleRoutes');
const notesRoutes = require('./src/routes/notes.routes');
const favoritesRoutes = require('./src/routes/favorites.routes');

const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: '🚀 API do Bibliafy está no ar!',
    author: 'Kauã Henrique'
  });
});

// Rotas de teste (pode remover se não precisar mais)
app.get('/check-books', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM books LIMIT 5');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/check-verses', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM verses LIMIT 5');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Rotas principais da API
app.use('/api/users', userRoutes);
app.use('/api/bible', bibleRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/favorites', favoritesRoutes);

app.listen(PORT, () => {
  console.log(`🔥 Servidor rodando na porta ${PORT}`);
  console.log(`🔗 Acesso local: http://localhost:${PORT}`);
});