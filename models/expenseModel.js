import { Database } from '../dbconfig.js';


export const createExpense = async (groupId, date, time, category, item, currency, amount, exchangeRate, mainCurrencyAmount, note, image_name) => {
  const query = 'INSERT INTO expense (splitgroup_id, date, time, category, item, currency, amount, exchangeRate, mainCurrencyAmount, note, image_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  const results = await Database.executeQuery(query, [groupId, date, time, category, item, currency, amount, exchangeRate, mainCurrencyAmount, note, image_name]);
  console.log('addExpense', results);
  return results.insertId;
};