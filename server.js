// server.js

require('dotenv').config();
const db = require('./src/config/database'); // Assumindo que este caminho está correto
const express = require('express');
const cors = require('cors');

// Importação das rotas existentes
const userRoutes = require('./src/routes/users.routes');
const bibleRoutes = require('./src/routes/bible.routes');
const notesRoutes = require('./src/routes/notes.routes');
const favoritesRoutes = require('./src/routes/favorites.routes');

// --- INÍCIO DAS LINHAS NOVAS ---

// 1. IMPORTE O MIDDLEWARE DE AUTENTICAÇÃO (CRUCIAL)
const authMiddleware = require('./src/middlewares/auth');

// 2. IMPORTE AS NOVAS ROTAS DE PROGRESSO
const progressRoutes = require('./src/routes/progress.routes');

// --- FIM DAS LINHAS NOVAS ---


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

// Rotas públicas (não precisam de login)
app.use('/api/users', userRoutes); // Login e Registro são públicos
app.use('/api/bible', bibleRoutes);

// Rotas privadas (precisam de login)
app.use('/api/notes', authMiddleware, notesRoutes);
app.use('/api/favorites', authMiddleware, favoritesRoutes);

// 3. REGISTRE A NOVA ROTA DE PROGRESSO, PROTEGIDA PELO MIDDLEWARE
app.use('/api/progress', authMiddleware, progressRoutes);


app.listen(PORT, () => {
  console.log(`🔥 Servidor rodando na porta ${PORT}`);
  console.log(`🔗 Acesso local: http://localhost:${PORT}`);
});