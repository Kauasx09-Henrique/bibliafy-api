const fs = require("fs");
const { Pool } = require("pg");
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const booksMap = {
  "gn": 1, "ex": 2, "lv": 3, "nm": 4, "dt": 5, "js": 6, "jz": 7, "rt": 8, "1sm": 9, "2sm": 10,
  "1rs": 11, "2rs": 12, "1cr": 13, "2cr": 14, "ed": 15, "ne": 16, "et": 17, "jo": 18, "sl": 19, "pv": 20,
  "ec": 21, "ct": 22, "is": 23, "jr": 24, "lm": 25, "ez": 26, "dn": 27, "os": 28, "jl": 29, "am": 30,
  "ob": 31, "jn": 32, "mq": 33, "na": 34, "hc": 35, "sf": 36, "ag": 37, "zc": 38, "ml": 39,
  "mt": 40, "mc": 41, "lc": 42, "joao": 43, "at": 44, "rm": 45, "1co": 46, "2co": 47, "gl": 48, "ef": 49,
  "fp": 50, "cl": 51, "1ts": 52, "2ts": 53, "1tm": 54, "2tm": 55, "tt": 56, "fm": 57, "hb": 58, "tg": 59,
  "1pe": 60, "2pe": 61, "1jo": 62, "2jo": 63, "3jo": 64, "jd": 65, "ap": 66,
  "gen": 1, "exo": 2, "lev": 3, "num": 4, "deu": 5, "jos": 6, "jdg": 7, "rut": 8, "1sa": 9, "2sa": 10,
  "1ki": 11, "2ki": 12, "1ch": 13, "2ch": 14, "ezr": 15, "neh": 16, "est": 17, "job": 18, "psa": 19, "pro": 20,
  "ecc": 21, "sng": 22, "isa": 23, "jer": 24, "lam": 25, "ezk": 26, "dan": 27, "hos": 28, "jol": 29, "amo": 30,
  "oba": 31, "jon": 32, "mic": 33, "nah": 34, "hab": 35, "zep": 36, "hag": 37, "zec": 38, "mal": 39,
  "mat": 40, "mar": 41, "luk": 42, "jhn": 43, "act": 44, "rom": 45, "1co": 46, "2co": 47, "gal": 48, "eph": 49,
  "phi": 50, "col": 51, "1th": 52, "2th": 53, "1ti": 54, "2ti": 55, "tit": 56, "phm": 57, "heb": 58, "jas": 59,
  "1pe": 60, "2pe": 61, "1jo": 62, "2jo": 63, "3jo": 64, "jud": 65, "rev": 66
};

async function importVersion(jsonFile) {
  try {
    console.log(`Lendo arquivo: ${jsonFile}...`);
    let rawData = fs.readFileSync(jsonFile, "utf8");
    rawData = rawData.replace(/^\uFEFF/, '').trim();

    const lastBracket = rawData.lastIndexOf(']');
    if (lastBracket !== -1 && lastBracket < rawData.length - 1) {
        rawData = rawData.substring(0, lastBracket + 1);
    }

    const books = JSON.parse(rawData);
    console.log(`Arquivo lido! Processando ${books.length} livros...`);

    // CONFIGURAÇÃO: ID DA VERSÃO ACF = 2
    const TARGET_VERSION_ID = 2; 

    for (const book of books) {
        // Tenta achar o ID do livro usando a sigla (ex: "gn")
        const abbrev = (book.abbrev || book.book_id || "").toLowerCase();
        const bookId = booksMap[abbrev];

        if (!bookId) {
            console.log(`Pular livro: Sigla '${abbrev}' não encontrada no mapa.`);
            continue;
        }

        if (!book.chapters || !Array.isArray(book.chapters)) continue;

        for (let c = 0; c < book.chapters.length; c++) {
            const versesArray = book.chapters[c];
            for (let v = 0; v < versesArray.length; v++) {
                const text = typeof versesArray[v] === 'string' ? versesArray[v] : versesArray[v].text;
                
                await pool.query(
                    `INSERT INTO verses (book_id, chapter, verse, text, version_id)
                     VALUES ($1, $2, $3, $4, $5)`,
                    [bookId, c + 1, v + 1, text, TARGET_VERSION_ID]
                );
            }
        }
        console.log(`Livro ID ${bookId} (${abbrev}) importado.`);
    }

    console.log("SUCESSO! Importação da ACF concluída.");

  } catch (error) {
    console.error("Erro Fatal:", error.message);
  } finally {
    await pool.end();
    process.exit();
  }
}

importVersion(process.argv[2]);