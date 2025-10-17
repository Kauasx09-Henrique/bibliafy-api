// knexfile.js

// Importa o 'path' para ajudar a criar os caminhos para os arquivos
const path = require('path');

// Esta linha é a mais importante: ela carrega as variáveis do seu arquivo .env
// e as torna acessíveis para o Node.js através de 'process.env'
require('dotenv').config();

module.exports = {
  // Configuração para o ambiente de DESENVOLVIMENTO
  // É esta que o Knex usará quando você rodar os comandos no seu computador.
  development: {
    // Especifica que estamos usando um banco de dados PostgreSQL.
    client: 'pg',
    
    // Pega a URL de conexão diretamente do seu arquivo .env.
    connection: process.env.DATABASE_URL,
    
    // Configuração SSL necessária para se conectar a bancos de dados na Render.
    // Evita erros de certificado não autorizado.
    ssl: { 
      rejectUnauthorized: false 
    },
    
    // Informa ao Knex onde encontrar os arquivos de migration (as tabelas a serem criadas).
    migrations: {
      directory: path.resolve(__dirname, 'src', 'database', 'migrations')
    }
  },

  // Configuração para o ambiente de PRODUÇÃO (quando o app estiver rodando na Render)
  // A Render geralmente injeta a DATABASE_URL automaticamente, então esta configuração funcionará lá também.
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    ssl: { 
      rejectUnauthorized: false 
    },
    migrations: {
      directory: path.resolve(__dirname, 'src', 'database', 'migrations')
    },
    pool: {
      min: 2,
      max: 10
    }
  }
};