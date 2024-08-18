import { Database } from '../dbconfig.js';


export const createExpense = async (groupId, date, time, category, item, currency, amount, exchangeRate, mainCurrencyAmount, note, image_name) => {
  const query = 'INSERT INTO expense (splitgroup_id, date, time, category, item, currency, amount, exchangeRate, mainCurrencyAmount, note, image_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  const results = await Database.executeQuery(query, [groupId, date, time, category, item, currency, amount, exchangeRate, mainCurrencyAmount, note, image_name]);
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


export const getGroupBalance = async (groupId) => {
  const query = `
    WITH AmountPaid AS (
      SELECT 
        p.payer AS member,
        SUM(p.mainCurrencyAmount) AS totalAmountPaid,
        e.splitgroup_id
      FROM 
        payer p
      JOIN 
         expense e ON p.expense_id = e.id
      WHERE 
        e.splitgroup_id = ?
      GROUP BY 
        p.payer, e.splitgroup_id
    ),
    AmountToPay AS (
      SELECT 
        sm.member,
        SUM(sm.mainCurrencyAmount) AS totalAmountToPay,
        e.splitgroup_id
      FROM 
        SplitMember sm
      JOIN 
        expense e ON sm.expense_id = e.id
      WHERE 
        e.splitgroup_id = ?
      GROUP BY 
        sm.member, e.splitgroup_id
    )
    SELECT 
        COALESCE(AP.member, ATP.member) AS member,
        COALESCE(AP.totalAmountPaid, 0) AS totalAmountPaid,
        COALESCE(ATP.totalAmountToPay, 0) AS totalAmountToPay,
        COALESCE(AP.totalAmountPaid, 0) - COALESCE(ATP.totalAmountToPay, 0) AS balance
    FROM 
        AmountPaid AP
    LEFT JOIN 
        AmountToPay ATP ON AP.member = ATP.member AND AP.splitgroup_id = ATP.splitgroup_id
    UNION
    SELECT 
        COALESCE(AP.member, ATP.member) AS member,
        COALESCE(AP.totalAmountPaid, 0) AS totalAmountPaid,
        COALESCE(ATP.totalAmountToPay, 0) AS totalAmountToPay,
        COALESCE(AP.totalAmountPaid, 0) - COALESCE(ATP.totalAmountToPay, 0) AS balance
    FROM 
        AmountToPay ATP
    LEFT JOIN 
        AmountPaid AP ON ATP.member = AP.member AND ATP.splitgroup_id = AP.splitgroup_id;
  `;
  const results = await Database.executeQuery(query, [groupId,groupId]);
  console.log('getGroupBalances', results);
  return results;
};