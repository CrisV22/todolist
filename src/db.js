const dotenv = require('dotenv');
dotenv.config(); // carrega variáveis de ambiente do arquivo .env
const { Pool } = require('pg');


const pool = new Pool({
  host: process.env.DB_HOST, // nome do serviço no docker-compose
  // host: 'localhost', // acessar backend localmente
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: true, // necessário para conexões seguras
});

const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 3000;

async function connectWithRetry(retries = MAX_RETRIES) {
  try {
    // tenta pegar uma conexão e fazer um teste simples
    await pool.query('SELECT 1');
    console.log('✅ Conectado ao banco de dados!');
    return pool; // sucesso
  } catch (error) {
    if (retries === 0) {
      console.error('❌ Não foi possível conectar ao banco após várias tentativas.');
      throw error; // falhou todas as vezes
    }
    console.log(`⏳ Tentativa de conexão falhou, tentando novamente em ${RETRY_DELAY_MS/1000} segundos... Restam ${retries} tentativas.`);
    await new Promise(res => setTimeout(res, RETRY_DELAY_MS)); // espera
    return connectWithRetry(retries - 1); // tenta de novo
  }
}

module.exports = { pool, connectWithRetry };
