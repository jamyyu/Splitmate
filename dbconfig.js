import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;

let pool = createPool();

function createPool() {
  return mysql.createPool({
    host: dbHost,
    user: dbUser,
    password: dbPassword,
    database: 'Splitmate',
    waitForConnections: true,
    connectionLimit: 50,
    queueLimit: 0,
    connectTimeout: 10000, // 10秒超時
    idleTimeout: 60000 // 60秒空閒超時
  });
}

function resetPool() {
  pool.end(); // 關閉現有連接池
  pool = createPool(); // 重新創建連接池
  console.log('Connection pool has been reset.');
}

export class Database {
  static async executeQuery(query, params = [], retryCount = 2) {
    let connection;
    for (let retry = 1; retry <= retryCount; retry++) {
      try {
        connection = await pool.getConnection();
        const [results] = await connection.execute(query, params);

        if (query.trim().toLowerCase().startsWith("select")) {
          return results;
        } else {
          return {
            affectedRows: results.affectedRows,
            insertId: results.insertId
          };
        }
      } catch (error) {
        console.error(`Retry ${retry} - Error while connecting to MySQL:`, error);

        if (retry === retryCount) {
          // 當重試次數達到上限時，重新初始化連接池
          resetPool();
          throw error;
        }

        // 在下一次重試之前，等待一段時間（比如 1 秒）
        await new Promise(resolve => setTimeout(resolve, 1000));
      } finally {
        if (connection) connection.release();
      }
    }
  }
}