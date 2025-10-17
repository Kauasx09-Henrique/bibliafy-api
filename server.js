// Local do arquivo: /server.js (na raiz do projeto backend)

require('dotenv').config();

// ✅ CORREÇÃO: Caminhos simplificados, sem './src/'
const db = require('./src/config/database');
const express = require('express');
const cors = require('cors');

// ✅ CORREÇÃO: Caminhos simplificados para todas as rotas e middlewares
const userRoutes = require('./src/routes/users.routes');
const bibleRoutes = require('./src/routes/bible.routes');
const notesRoutes = require('./src/routes/notes.routes');
const favoritesRoutes = require('./src/routes/favorites.routes');
const authMiddleware = require('./src/config/middlewares/auth.middleware');
const progressRoutes = require('./src/routes/progress.routes');

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

// --- REGISTRO DAS ROTAS ---

// Rotas públicas
app.use('/api/users', userRoutes);
app.use('/api/bible', bibleRoutes);

// Rotas privadas
app.use('/api/notes', authMiddleware, notesRoutes);
app.use('/api/favorites', authMiddleware, favoritesRoutes);
app.use('/api/progress', authMiddleware, progressRoutes);

app.listen(PORT, () => {
  console.log(`🔥 Servidor rodando na porta ${PORT}`);
  console.log(`🔗 Acesso local: http://localhost:${PORT}`);
});