require('dotenv').config();

const express = require('express');
const cors = require('cors');

const userRoutes = require('./src/routes/users.routes');
const bibleRoutes = require('./src/routes/bible.routes');
const notesRoutes = require('./src/routes/notes.routes');
const favoritesRoutes = require('./src/routes/favorites.routes');
const authMiddleware = require('./src/config/middlewares/auth.middleware');

const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors());

app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));


app.get('/', (req, res) => {
  res.json({
    message: '🚀 API do Bibliafy está no ar!',
    author: 'Kauã Henrique'
  });
});

app.use('/api/users', userRoutes);
app.use('/api/bible', bibleRoutes);

// Rotas protegidas
app.use('/api/notes', authMiddleware, notesRoutes);
app.use('/api/favorites', authMiddleware, favoritesRoutes);

app.listen(PORT, () => {
  console.log(`🔥 Servidor rodando na porta ${PORT}`);
  console.log(`🔗 http://localhost:${PORT}`);
});