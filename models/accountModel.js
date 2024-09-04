import { Database } from '../dbconfig.js';


export const addAccount = async (user_id, SWIFT, bankAccountNumber) => {
  const query = 'INSERT INTO account (user_id, SWIFT, bankAccountNumber) VALUES (?, ?, ?)';
  const results = await Database.executeQuery(query, [user_id, SWIFT, bankAccountNumber]);
  return results.insertId;
};


export const getAccountByUserId = async (userId) => {
  const query = 'SELECT * FROM account WHERE user_id = ?';
  const results = await Database.executeQuery(query, [userId]);
  return results;
};


export const deleteAccountById = async (id) => {
  const query = 'DELETE FROM account WHERE id = ?';
  const results = await Database.executeQuery(query, [id]);
  return results;
};