const fs = require('fs');
const db = require('./src/config/database');

async function seedDatabase() {
  console.log('▶️  Iniciando o processo de seeding do banco de dados...');
  const client = await db.pool.connect();

  try {
    console.log('📖 Lendo o arquivo nvi.json...');
    const fileContent = fs.readFileSync('./nvi.json', 'utf8');
    const bibleData = JSON.parse(fileContent.replace(/^\uFEFF/, ''));

    console.log('🧹 Apagando tabelas antigas (se existirem)...');
    await client.query('DROP TABLE IF EXISTS notes CASCADE');
    await client.query('DROP TABLE IF EXISTS favorites CASCADE');
    await client.query('DROP TABLE IF EXISTS verse CASCADE');
    await client.query('DROP TABLE IF EXISTS books CASCADE');
    console.log('✅ Tabelas antigas removidas.');

    console.log('🏗️  Criando novas tabelas...');
    await client.query(`
      CREATE TABLE books (
        id INT PRIMARY KEY,
        testament_id INT NOT NULL,
        "name" VARCHAR(100) NOT NULL,
        abbreviation VARCHAR(10) NOT NULL
      );
    `);
    await client.query(`
      CREATE TABLE verse (
        id SERIAL PRIMARY KEY,
        book_id INT REFERENCES books(id) ON DELETE CASCADE,
        chapter INT NOT NULL,
        verse INT NOT NULL,
        "text" TEXT NOT NULL
      );
    `);
    console.log('✅ Novas tabelas "books" e "verse" criadas com sucesso!');

    console.log('📚 Inserindo os livros...');
    // CORREÇÃO AQUI: Usando o índice do loop para gerar o ID
    for (const [index, book] of bibleData.entries()) {
      const bookId = index + 1; // ID será 1, 2, 3...
      const testamentId = book.testament === 'VT' ? 1 : 2;
      await client.query(
        'INSERT INTO books (id, testament_id, name, abbreviation) VALUES ($1, $2, $3, $4)',
        [bookId, testamentId, book.name, book.abbrev] // Usando book.abbrev diretamente
      );
    }
    console.log('✅ Livros inseridos!');

    console.log('📜 Inserindo os versículos... (Isso pode demorar alguns minutos)');
    let verseCount = 0;
    // CORREÇÃO AQUI: Usando o índice do loop para pegar o ID correto do livro
    for (const [index, book] of bibleData.entries()) {
      const bookId = index + 1; // ID do livro (1 para Gênesis, 2 para Êxodo, etc)
      
      for (let i = 0; i < book.chapters.length; i++) {
        const chapterNum = i + 1;
        for (let j = 0; j < book.chapters[i].length; j++) {
          const verseNum = j + 1;
          const verseText = book.chapters[i][j];
          await client.query(
            'INSERT INTO verse (book_id, chapter, verse, text) VALUES ($1, $2, $3, $4)',
            [bookId, chapterNum, verseNum, verseText]
          );
          verseCount++;
        }
      }
    }
    console.log(`✅ ${verseCount} versículos inseridos!`);
    console.log('🎉 BANCO DE DADOS POPULADO COM SUCESSO!');

  } catch (error) {
    console.error('❌ Ocorreu um erro durante o seeding:', error);
  } finally {
    client.release();
    await db.pool.end();
    console.log('🔌 Conexão com o banco de dados fechada.');
  }
}

seedDatabase();