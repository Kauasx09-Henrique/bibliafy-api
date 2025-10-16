const fs = require('fs');
const db = require('./src/config/database'); // Certifique-se que o caminho está correto

async function main() {
  console.log('▶️  Iniciando o processo de seeding do banco de dados na Render...');
  const client = await db.pool.connect();

  try {
    // 1. Cria a estrutura de tabelas (só se não existirem)
    await createTables(client);

    // 2. Popula a tabela de livros (só se estiver vazia)
    await seedBooks(client, './nvi.json');

    // 3. Adiciona as versões da Bíblia, uma por uma, SEM APAGAR AS EXISTENTES.
    // Se a NVI já estiver no banco, ele vai pular.
    await seedVersion(client, './nvi.json', 'NVI', 'Nova Versão Internacional');

    // Ele vai verificar a ACF e, se não existir, vai adicioná-la.
    await seedVersion(client, './acf.json', 'ACF', 'Almeida Corrigida Fiel');

    // Você pode adicionar mais versões aqui no futuro...

    console.log('\n🎉 PROCESSO DE SEEDING CONCLUÍDO!');

  } catch (error) {
    console.error('❌ Ocorreu um erro geral durante o seeding:', error);
  } finally {
    client.release();
    await db.pool.end();
    console.log('🔌 Conexão com o banco de dados fechada.');
  }
}

/**
 * Insere uma versão completa, APENAS SE OS VERSÍCULOS DELA NÃO EXISTIREM.
 */
async function seedVersion(client, filePath, abbrev, name) {
  console.log(`\n--- Processando versão: ${name} (${abbrev}) ---`);

  // 1. Garante que a versão exista na tabela 'versions' e pega o ID dela.
  console.log(`📝 Registrando a versão "${name}"...`);
  await client.query(
    `INSERT INTO versions (abbreviation, name) VALUES ($1, $2) ON CONFLICT (abbreviation) DO NOTHING;`,
    [abbrev, name]
  );
  const { rows } = await client.query('SELECT id FROM versions WHERE abbreviation = $1', [abbrev]);
  const versionId = rows[0].id;
  console.log(`✅ Versão "${abbrev}" tem o ID: ${versionId}.`);

  // 2. VERIFICA se já existem versículos para esta versão no banco.
  console.log(`🔎 Verificando se a versão ${abbrev} já está populada...`);
  const checkResult = await client.query('SELECT 1 FROM verses WHERE version_id = $1 LIMIT 1', [versionId]);

  if (checkResult.rows.length > 0) {
    // Se a consulta retornar qualquer linha, significa que os versículos já existem.
    console.log(`✅ A versão ${abbrev} já existe no banco de dados. Pulando.`);
    return; // Pula para a próxima versão
  }

  // 3. Se chegou até aqui, a versão não tem versículos. Vamos inserir.
  console.log(`📖 Lendo o arquivo ${filePath}...`);
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const bibleData = JSON.parse(fileContent.replace(/^\uFEFF/, ''));

  console.log(`📜 Inserindo versículos da ${abbrev}... (Isso pode ser demorado)`);
  let verseCount = 0;
  for (const [index, book] of bibleData.entries()) {
    const bookId = index + 1;
    for (let i = 0; i < book.chapters.length; i++) {
      const chapterNum = i + 1;
      for (let j = 0; j < book.chapters[i].length; j++) {
        const verseNum = j + 1;
        const verseText = book.chapters[i][j];
        await client.query(
          'INSERT INTO verses (book_id, version_id, chapter, verse, text) VALUES ($1, $2, $3, $4, $5)',
          [bookId, versionId, chapterNum, verseNum, verseText]
        );
        verseCount++;
      }
    }
    // Mostra o progresso no console
    process.stdout.write(`\r   -> Livro processado: ${book.name} (${verseCount} versículos)`);
  }
  console.log(`\n✅ ${verseCount} versículos da versão ${abbrev} inseridos!`);
}


// Funções de apoio (não precisam de alteração)
async function createTables(client) {
  console.log('🏗️  Verificando e criando tabelas se necessário...');
  await client.query(`
    CREATE TABLE IF NOT EXISTS versions (
      id SERIAL PRIMARY KEY,
      abbreviation VARCHAR(10) UNIQUE NOT NULL,
      name VARCHAR(100) NOT NULL
    );
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS books (
      id INT PRIMARY KEY,
      testament_id INT NOT NULL,
      "name" VARCHAR(100) NOT NULL,
      abbreviation VARCHAR(10) NOT NULL
    );
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS verses (
      id SERIAL PRIMARY KEY,
      book_id INT REFERENCES books(id) ON DELETE CASCADE,
      version_id INT REFERENCES versions(id) ON DELETE CASCADE,
      chapter INT NOT NULL,
      verse INT NOT NULL,
      "text" TEXT NOT NULL,
      UNIQUE(book_id, chapter, verse, version_id)
    );
  `);
  console.log('✅ Estrutura das tabelas verificada.');
}

async function seedBooks(client, referenceFilePath) {
  console.log('📚 Verificando a tabela de livros...');
  const { rows } = await client.query('SELECT COUNT(*) FROM books');
  if (rows[0].count > 0) {
    console.log('✅ Tabela de livros já populada. Pulando...');
    return;
  }
  console.log('📖 Lendo arquivo de referência para os livros...');
  const fileContent = fs.readFileSync(referenceFilePath, 'utf8');
  const bibleData = JSON.parse(fileContent.replace(/^\uFEFF/, ''));
  console.log('⏳ Inserindo os 66 livros...');
  for (const [index, book] of bibleData.entries()) {
    const bookId = index + 1;
    const testamentId = book.testament === 'VT' ? 1 : 2;
    await client.query('INSERT INTO books (id, testament_id, name, abbreviation) VALUES ($1, $2, $3, $4)', [bookId, testamentId, book.name, book.abbrev]);
  }
  console.log('✅ Livros inseridos com sucesso!');
}

// Inicia o script
main();