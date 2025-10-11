// src/db.js
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: {
    rejectUnauthorized: false
  }
});

// Testa a conexão
pool.connect((err, client, release) => {
  if (err) return console.error('Erro ao adquirir cliente do pool', err.stack);
  console.log('✅ Conexão com o banco de dados PostgreSQL estabelecida com sucesso!');
  client.release();
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
