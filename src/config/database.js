if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
});

pool.connect()
  .then(() => console.log('🟢 Banco conectado com sucesso!'))
  .catch(err => console.error('🔴 Erro ao conectar ao banco:', err.message));

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
