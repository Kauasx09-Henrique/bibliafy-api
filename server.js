// Local do arquivo: /server.js (na raiz do projeto backend)

require('dotenv').config();
const db = require('./src/config/database');
const express = require('express');
const cors = require('cors');

// Importação das rotas
const userRoutes = require('./src/routes/users.routes');
const bibleRoutes = require('./src/routes/bible.routes');
const notesRoutes = require('./src/routes/notes.routes');
const favoritesRoutes = require('./src/routes/favorites.routes');

// ✅ 1. IMPORTE O MIDDLEWARE DE AUTENTICAÇÃO
const authMiddleware = require('./src/middlewares/auth');

// ✅ 2. IMPORTE AS NOVAS ROTAS DE PROGRESSO
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

// Rotas públicas (não precisam de login)
app.use('/api/users', userRoutes); // Login e Registro
app.use('/api/bible', bibleRoutes);

// Rotas privadas (precisam de login)
app.use('/api/notes', authMiddleware, notesRoutes);
app.get('/api/favorites', authMiddleware, favoritesRoutes); // Supondo que você também tenha um GET

// ✅ 3. REGISTRE A NOVA ROTA DE PROGRESSO, PROTEGIDA PELO MIDDLEWARE
app.use('/api/progress', authMiddleware, progressRoutes);


app.listen(PORT, () => {
  console.log(`🔥 Servidor rodando na porta ${PORT}`);
  console.log(`🔗 Acesso local: http://localhost:${PORT}`);
});