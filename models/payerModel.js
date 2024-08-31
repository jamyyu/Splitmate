import { Database } from '../dbconfig.js';


export const addPayer = async (expense_id, member_id, amount, mainCurrencyAmount) => {
  const query = 'INSERT INTO payer (expense_id, member_id, amount, mainCurrencyAmount) VALUES (?, ?, ?, ?)';
  const results = await Database.executeQuery(query, [expense_id, member_id, amount, mainCurrencyAmount]);
  console.log('addPayer', results);
  return results.insertId;
};