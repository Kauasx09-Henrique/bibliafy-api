// Local do arquivo: src/database/migrations/20251017105000_create_reading_progress.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  // O método 'up' é executado quando você roda a migration (npx knex migrate:latest)
  return knex.schema.createTable('reading_progress', table => {
    // Coluna 'id': Chave primária que se auto-incrementa (1, 2, 3, ...)
    table.increments('id').primary();

    // Coluna 'user_id': Armazena o ID do usuário.
    // É uma chave estrangeira que se conecta à tabela 'users'.
    // Se um usuário for deletado (ON DELETE CASCADE), seu progresso também será.
    table.integer('user_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');

    // Coluna 'book_id': Armazena o ID do livro.
    // É uma chave estrangeira que se conecta à tabela 'books'.
    table.integer('book_id')
      .notNullable()
      .references('id')
      .inTable('books')
      .onDelete('CASCADE');

    // Coluna 'chapters_read': Armazena a lista de capítulos lidos.
    // O tipo JSON é perfeito para guardar um array de números, como [1, 2, 5, 10].
    // Por padrão, o valor é um array vazio '[]'.
    table.json('chapters_read').notNullable().defaultTo('[]');

    // Restrição UNIQUE: Garante que não pode haver mais de uma linha
    // com a mesma combinação de user_id e book_id.
    table.unique(['user_id', 'book_id']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  // O método 'down' é executado se você precisar desfazer a migration
  return knex.schema.dropTable('reading_progress');
};