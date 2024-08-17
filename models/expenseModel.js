import { Database } from '../dbconfig.js';


export const createExpense = async (groupId, date, time, category, item, currency, amount, exchangeRate, mainCurrencyAmount, note, image_name) => {
  const query = 'INSERT INTO expense (splitgroup_id, date, time, category, item, currency, amount, exchangeRate, mainCurrencyAmount, note, image_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  const results = await Database.executeQuery(query, [groupId, date, time, category, item, currency, amount, exchangeRate, mainCurrencyAmount, note, image_name]);
  console.log('addExpense', results);
  return results.insertId;
};


export const getExpense = async (groupId) => {
  const query =`
  SELECT 
    e.id AS expense_id,
    CONVERT_TZ(e.date, '+00:00', '+08:00') AS date,
    e.time,
    e.category,
    e.item,
    e.currency,
    e.amount,
    p.payer,
    p.amount AS paid_amount,
    sm.member,
    sm.amount AS member_amount
  FROM 
    expense e
  JOIN 
    payer p ON e.id = p.expense_id
  JOIN 
    SplitMember sm ON e.id = sm.expense_id
  WHERE 
    e.splitgroup_id = ?
  ORDER BY 
    e.date DESC,
    e.time DESC;`
  const results = await Database.executeQuery(query, [groupId]);
  return results;
};