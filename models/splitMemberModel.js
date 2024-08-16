import { Database } from '../dbconfig.js';


export const addSplitMember = async (expense_id, member, amount, mainCurrencyAmount) => {
  const query = 'INSERT INTO SplitMember (expense_id, member, amount, mainCurrencyAmount) VALUES (?, ?, ?, ?)';
  const results = await Database.executeQuery(query, [expense_id, member, amount, mainCurrencyAmount]);
  console.log('addSplitMember', results);
  return results.insertId;
};