import 'dotenv/config';
import { Database } from '../dbconfig.js';

export const searchUserEmail = async (email) => {
  const query = 'SELECT email FROM user WHERE email = ?';
  const results = await Database.executeQuery(query, [email]); // 數組
  console.log('searchUserEmail',results);
  return results.length ? results[0] : null; // 返回物件，如果找不到用戶，返回 null
};

export const createUser = async (name, email, hashedPassword) => {
  const query = 'INSERT INTO user (name, email, password) VALUES (?, ?, ?)';
  const results = await Database.executeQuery(query, [name, email, hashedPassword]);
  console.log('createUser',results);
  return results.insertId;
};

export const getUserByEmail = async (email) => {
  const query = 'SELECT id, name, email, password FROM user WHERE email = ?';
  const results = await Database.executeQuery(query, [email]);
  console.log('getUserByEmail',results);
  return results.length ? results[0] : null; 
};