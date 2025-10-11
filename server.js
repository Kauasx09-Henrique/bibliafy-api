require('dotenv').config();

const express = require('express');
const cors = require('cors');

const userRoutes = require('./src/routes/users.routes');
const bibleRoutes = require('./src/routes/bible.routes');
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

app.use('/api/users', userRoutes);
app.use('/api/bible', bibleRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/favorites', favoritesRoutes);

app.listen(PORT, () => {
  console.log(`🔥 Servidor rodando na porta ${PORT}`);
  console.log(`🔗 Acesso local: http://localhost:${PORT}`);
});