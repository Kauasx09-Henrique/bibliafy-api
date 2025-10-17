// src/database/migrations/20251017105000_create_reading_progress.js

exports.up = function(knex) {
  return knex.schema.createTable('reading_progress', table => {
    table.increments('id').primary();

    table.uuid('user_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');

    table.integer('book_id')
      .notNullable()
      .references('id')
      .inTable('books')
      .onDelete('CASCADE');

    table.json('chapters_read').notNullable().defaultTo('[]');
    table.unique(['user_id', 'book_id']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('reading_progress');
};