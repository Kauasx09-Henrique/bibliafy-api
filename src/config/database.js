// Importa o dotenv para carregar as variáveis de ambiente do arquivo .env
require('dotenv').config();

// Importa a classe Pool da biblioteca pg
const { Pool } = require('pg');

// Cria uma nova instância do Pool com as configurações do banco de dados
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

// Testa a conexão
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Erro ao adquirir cliente do pool', err.stack);
  }
  console.log('✅ Conexão com o banco de dados PostgreSQL estabelecida com sucesso!');
  client.release(); // Libera o cliente de volta para o pool
});

// Exporta um objeto com um método query para ser usado em outras partes da aplicação
module.exports = {
  query: (text, params) => pool.query(text, params),
  pool: pool // <-- ADICIONE ESTA LINHA
};