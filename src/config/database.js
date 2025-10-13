// Arquivo: src/db.js

// Carrega o arquivo .env APENAS em ambiente de desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const { Pool } = require('pg');

// A configuração ÚNICA e correta que usa a DATABASE_URL
// A biblioteca 'pg' sabe como extrair o host, user, password, etc. daqui
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Essencial para a Render
  }
});

// Testa a conexão (seu código de teste aqui é ótimo!)
pool.connect((err, client, release) => {
  if (err) {
    return console.error('❌ Erro ao conectar com o banco de dados:', err.stack);
  }
  console.log('✅ Conexão com o banco de dados PostgreSQL estabelecida com sucesso!');
  client.release();
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};