import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;


const pool = mysql.createPool({
  host: dbHost,
  user: dbUser,
  password: dbPassword,
  database: 'Splitmate',
  waitForConnections: true,
  connectionLimit: 20, 
  queueLimit: 0, // 等待連線請求數，0 表示不限制
  connectTimeout: 10000, // 10秒超時
  idleTimeout: 60000 // 60秒空閒超時
});

// 使用連接池查詢
export class Database {
  static async executeQuery(query, params = []) {
    let connection;
    try {
      connection = await pool.getConnection();
      const [results] = await connection.execute(query, params); //使用解構賦值後，results 會被賦值為第一個元素

      // SELECT 查詢
      if (query.trim().toLowerCase().startsWith("select")) {
        return results;
      } else {
        // 非 SELECT 查詢
        return {
          affectedRows: results.affectedRows,
          insertId: results.insertId
        };
      }
    } catch (error) {
      console.error('Error while connecting to MySQL', error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }
}
