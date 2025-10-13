// Arquivo: src/db.js

// Carrega o arquivo .env APENAS em ambiente de desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Ignora verificação de certificado SSL autoassinado
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true,
    rejectUnauthorized: false, // Mantém compatibilidade
  },
});

// Testa a conexão
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
