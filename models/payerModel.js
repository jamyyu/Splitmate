import { Database } from '../dbconfig.js';


export const addPayer = async (expense_id, payer, amount, mainCurrencyAmount) => {
  const query = 'INSERT INTO payer (expense_id, payer, amount, mainCurrencyAmount) VALUES (?, ?, ?, ?)';
  const results = await Database.executeQuery(query, [expense_id, payer, amount, mainCurrencyAmount]);
  console.log('addPayer', results);
  return results.insertId;
};