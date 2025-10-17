// knexfile.js
const path = require('path');
require('dotenv').config();

module.exports = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    // ESSA PARTE É CRUCIAL PARA O SEU PC
    ssl: {
      rejectUnauthorized: false
    },
    migrations: {
      directory: path.resolve(__dirname, 'src', 'database', 'migrations')
    }
  },

  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    // E ESSA PARTE É CRUCIAL PARA A RENDER
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